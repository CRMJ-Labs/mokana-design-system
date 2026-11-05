import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium,expect} from '@playwright/test';
import {createPalette,mokPalette} from '../dist/mokana.js';

const luminance=color=>{
  const hex=color.slice(1);const values=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
  return values[0]*.2126+values[1]*.7152+values[2]*.0722;
};
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const tokens=JSON.parse(readFileSync('tokens.json','utf8'));
for(const brand of ['#fff','#000','#ff0','#00ffff','#7557ff','#15803d','#0369a1'])for(const neutral of [undefined,'#475569']){
  const palette=createPalette({brand,neutral});
  for(const mode of ['light','dark']){
    const colors=palette[mode];assert.deepEqual(Object.keys(colors).sort(),Object.keys(tokens.semantic).sort());
    for(const [text,background]of [['foreground','background'],['secondary','surface'],['accent-text','surface'],['selection-text','selection-background'],['brand-on-primary','brand-primary'],['button-primary-text','button-primary-background'],['button-secondary-text','button-secondary-background'],['action-primary-text','action-primary'],['inverse-text','inverse-background'],['inverse-accent','inverse-background'],...['success','warning','error','info'].flatMap(tone=>[[`${tone}-text`,`${tone}-background`],[`${tone}-on-solid`,`${tone}-solid`]])]){
      assert.ok(contrast(colors[text],colors[background])>=4.5,`${brand} ${neutral} ${mode}: ${text} on ${background}`);
    }
  }
}
assert.throws(()=>createPalette({brand:'red'}),/Invalid palette color/);
assert.throws(()=>createPalette({brand:'#12345'}),/Invalid palette color/);
assert.throws(()=>createPalette({brand:'#123456',error:'invalid'}),/Invalid palette color/);
assert.equal(createPalette({brand:'#15803d',light:{background:'#fffafa'}}).light.background,'#fffafa');
assert.equal(mokPalette.light['brand-primary'],mokPalette.dark['brand-primary'],'MOK shares the accent between themes.');
assert.notEqual(mokPalette.light.background,mokPalette.dark.background);
console.log('Custom palettes: seed validation, complete role coverage and contrast checks passed for all test seeds.');

const consumer=resolve('tests/fixtures/consumer');const port=3041;
const server=spawn(process.execPath,[resolve(consumer,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:consumer,stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Palette preview did not start')),20000);server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',error=>{clearTimeout(timer);reject(error);});server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview exited: ${code}`));});});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/palette.html`);
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const root=page.getByTestId('palette-root');
  const buttonColor=()=>root.locator('.mk-button-primary').first().evaluate(node=>getComputedStyle(node).backgroundColor);
  const original=await buttonColor();
  await page.getByRole('combobox',{name:'Paleta',exact:true}).selectOption('forest');assert.notEqual(await buttonColor(),original);
  const nestedColor=await page.getByTestId('nested-palette').getByRole('button').evaluate(node=>getComputedStyle(node).backgroundColor);
  await page.getByRole('combobox',{name:'Paleta',exact:true}).selectOption('mok');
  assert.equal(await page.getByTestId('nested-palette').getByRole('button').evaluate(node=>getComputedStyle(node).backgroundColor),nestedColor);
  mkdirSync('verification',{recursive:true});
  for(const width of [1440,390])for(const mode of ['light','dark'])for(const palette of ['mok','forest','ocean']){
    await page.setViewportSize({width,height:1000});
    await page.getByRole('radio',{name:mode==='light'?'Claro':'Oscuro',exact:true}).check();
    await expect(root).toHaveAttribute('data-theme',mode);
    await page.getByRole('combobox',{name:'Paleta',exact:true}).selectOption(palette);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow: ${width} ${mode} ${palette}`);
    const violations=await page.evaluate(async()=>(await window.axe.run('.palette-showcase',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations);
    assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`${width} ${mode} ${palette}`);
    await page.getByRole('button',{name:'Abrir modal',exact:true}).click();
    const modal=page.getByRole('dialog');await expect(modal).toBeVisible();
    assert.equal(await modal.getByRole('button',{name:'Entendido'}).evaluate(node=>getComputedStyle(node).backgroundColor),await buttonColor());
    await page.keyboard.press('Escape');await expect(modal).not.toBeVisible();
    await page.screenshot({path:`verification/palette-${palette}-${mode}-${width}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Mostrar toast'}).click();await expect(page.locator('.mk-notification')).toBeVisible();
  assert.deepEqual(errors,[]);
  console.log('Palettes: seed validation, contrast, semantic coverage, isolation, 3 palettes x 2 modes x 2 widths, dialogs and toast passed.');
}finally{await browser?.close();server.kill();}
