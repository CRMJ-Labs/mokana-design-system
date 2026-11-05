import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';

// MOK button.css: h-10/md:h-9, sm:h-9/md:h-8, lg:h-11/md:h-10;
// px-4/sm:px-3, text-sm/lg:text-base, font-medium, size-5/sm:size-4.
const source='src/button.css';
const consumer=resolve('tests/fixtures/consumer'),port=3043;
const server=spawn(process.execPath,[resolve(consumer,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:consumer,stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Button size preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',error=>{clearTimeout(timer);reject(error);});});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[],measurements=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/visual.html?view=button-sizes`);
  await page.getByTestId('button-sm').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  const measure=locator=>locator.evaluate(node=>{
    const style=getComputedStyle(node),rect=node.getBoundingClientRect();const icon=node.querySelector('svg,.mk-spinner');
    const canvas=document.createElement('canvas').getContext('2d');canvas.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return {width:rect.width,height:rect.height,fontSize:parseFloat(style.fontSize),weight:style.fontWeight,lineHeight:parseFloat(style.lineHeight),paddingX:parseFloat(style.paddingLeft),paddingY:parseFloat(style.paddingTop),border:parseFloat(style.borderLeftWidth),gap:parseFloat(style.gap),iconSize:icon?icon.getBoundingClientRect().width:null,textWidth:canvas.measureText('Continuar').width};
  });
  for(const width of [390,639,640,767,768,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.locator('.visual-fixture').evaluate((root,theme)=>root.dataset.theme=theme,theme);
    for(const [index,size]of ['sm','md','lg'].entries()){
      const height=(width>=768?[32,36,40]:[36,40,44])[index],fontSize=size==='lg'?16:14,paddingX=size==='sm'?12:16,iconSize=size==='sm'||width>=640?16:20;
      let normal;
      for(const kind of ['button','link','custom','icon-text','icon','icon-link','loading','disabled']){
        const actual=await measure(page.getByTestId(`${kind}-${size}`));const iconOnly=kind==='icon'||kind==='icon-link';
        assert.equal(actual.height,height,`${width} ${theme} ${size} ${kind}: height`);
        assert.equal(actual.fontSize,fontSize);assert.equal(actual.weight,'500');assert.equal(actual.lineHeight,size==='lg'?24:20);
        assert.equal(actual.paddingY,0);assert.equal(actual.paddingX,iconOnly?0:paddingX);
        if(actual.iconSize!==null)assert.equal(actual.iconSize,iconSize,`${width} ${size} ${kind}: icon size`);
        if(iconOnly)assert.equal(actual.width,height,`${width} ${size}: square icon button`);
        else{
          const expectedWidth=actual.textWidth+paddingX*2+actual.border*2+(actual.iconSize!==null?iconSize-4+8:0);
          assert.ok(Math.abs(actual.width-expectedWidth)<.15,`${width} ${size} ${kind}: horizontal sizing ${actual.width} != ${expectedWidth}`);
        }
        if(kind==='button')normal=actual;
        if(kind==='link'||kind==='disabled')assert.equal(actual.width,normal.width,`${kind}: consistent width`);
        measurements.push({width,theme,size,kind,...actual});
      }
      const withIcon=await measure(page.getByTestId(`icon-text-${size}`)),loading=await measure(page.getByTestId(`loading-${size}`));
      assert.equal(loading.width,withIcon.width,'Replacing an icon with a spinner must preserve width.');
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${theme}: overflow`);
  }
  assert.deepEqual(errors,[]);mkdirSync('verification',{recursive:true});
  writeFileSync('verification/button-sizes.json',JSON.stringify({passed:true,source,measurements},null,2));
  console.log(`Button sizes: ${measurements.length} measurements match MOK across sizes, Button/ButtonLink/CustomButton, icons, loading, disabled states, themes and responsive breakpoints.`);
}finally{await browser?.close();server.kill();}
