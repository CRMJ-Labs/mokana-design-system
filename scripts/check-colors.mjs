import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {readReferenceColors,colorReference,referenceCommit} from './color-reference.mjs';
import {mokPalette} from '../dist/mokana.js';

const source=readReferenceColors(),tokens=JSON.parse(readFileSync('tokens.json','utf8'));
assert.equal(tokens.metadata.colors.commit,referenceCommit);
for(const mode of ['light','dark'])for(const [name,value]of Object.entries({...source.common,...source[mode]})){
  const primitive=tokens.semantic[name][mode==='light'?0:1];
  assert.equal(tokens.primitives[primitive],value,`${mode}: upstream ${name} was changed`);
}
const names=Object.keys({...source.common,...source.light});
const upstreamCSS=readFileSync(colorReference,'utf8');
const port=3038;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
const readColors=async(page,selector)=>page.evaluate(({selector,names})=>{
  const root=document.querySelector(selector),probe=document.createElement('span');root.append(probe);
  const result=Object.fromEntries(names.map(name=>{
    const property=name.endsWith('-shadow')?'boxShadow':'backgroundColor';
    probe.style[property]=`var(--${name})`;
    return [name,getComputedStyle(probe)[property]];
  }));probe.remove();return result;
},{selector,names});
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Color preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',error=>{clearTimeout(timer);reject(error);});});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),reference=await browser.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await reference.setContent(`<style>${upstreamCSS}</style><div id="palette"></div>`);
  await page.goto(`http://127.0.0.1:${port}/foundations/colors`);
  await page.locator('.mk-color-foundations').waitFor();
  assert.deepEqual([...new Set(await page.locator('[data-color-token]').evaluateAll(nodes=>nodes.map(node=>node.dataset.colorToken)))].sort(),names.sort(),'The color catalog must show every upstream token.');
  for(const mode of ['light','dark']){
    await page.locator('.mk-website').evaluate((root,mode)=>root.dataset.theme=mode,mode);
    await reference.evaluate(({mode,colors})=>{document.documentElement.dataset.theme=mode;const root=document.querySelector('#palette');for(const [name,value]of Object.entries(colors))root.style.setProperty(`--${name}`,value);},{mode,colors:mokPalette[mode]});
    const expected=await readColors(reference,'html');
    assert.deepEqual(await readColors(page,'.mk-website'),expected,`${mode}: CSS colors differ from official MOK`);
    assert.deepEqual(await readColors(reference,'#palette'),expected,`${mode}: mokPalette differs from official MOK`);
    for(const inner of ['light','dark']){
      await reference.evaluate(mode=>document.documentElement.dataset.theme=mode,inner);
      assert.deepEqual(await readColors(page,`.mk-color-mode[data-theme="${inner}"]`),await readColors(reference,'html'),`${mode}: ${inner} preview differs from official MOK`);
    }
  }
  const seedColors=await reference.evaluate(()=>{
    document.documentElement.dataset.theme='light';
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');
    return Object.fromEntries(['accent','success','warning','danger'].map(name=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);ctx.fillRect(0,0,1,1);return [name,'#'+[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(channel=>channel.toString(16).padStart(2,'0')).join('')];}));
  });
  mkdirSync('verification',{recursive:true});
  for(const mode of ['light','dark']){
    await page.locator('.mk-docs-header').getByRole('radio',{name:mode==='light'?'Claro':'Oscuro',exact:true}).check();
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:`verification/colors-${mode}.png`,fullPage:false});
  }
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Color catalog overflows mobile.');
  await page.goto(`http://127.0.0.1:${port}/components/button`);await page.locator('#main-content h1').waitFor();
  const primary=page.locator('#variants .mk-button-primary').first();
  if(await primary.count())await expect(primary).toBeVisible();
  assert.deepEqual(errors,[]);
  writeFileSync('verification/color-parity.json',JSON.stringify({passed:true,upstreamCommit:referenceCommit,roles:names.length,modes:['light','dark'],checks:['source declarations','computed CSS colors','mokPalette','nested previews','complete catalog','mobile bounds'],nearestSRGBSeeds:seedColors},null,2));
  console.log(`MOK: ${names.length} official roles match exactly in both themes, in CSS and mokPalette. Complete catalog and mobile bounds passed.`);
  console.log('Nearest sRGB seed representations (default tokens retain OKLCH): '+JSON.stringify(seedColors));
}finally{await browser?.close();server.kill();}
