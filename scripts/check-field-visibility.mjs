import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from '@playwright/test';

const port=3044;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Field preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[],measurements=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/input`);
  const routes=await page.locator('a[href^="/components/"],a[href^="/patterns/"]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.getAttribute('href').split('#')[0]))]);
  assert.ok(routes.length>70,'Audit the entire component catalog, not only Input.');
  for(const theme of ['light','dark'])for(const route of routes){
    await page.goto(`http://127.0.0.1:${port}${route}`);
    await page.locator('.mk-website').evaluate((node,theme)=>node.dataset.theme=theme,theme);
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
    await page.locator('#main-content').waitFor();
    // Lazy component pages must finish loading before inspecting their examples.
    await page.locator('.mk-catalog-loading').waitFor({state:'detached'});
    await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement?.blur());
    const controls=page.locator('main input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),main textarea,main select,main .mk-multi-select-trigger');
    for(const control of await controls.all()){
      if(!await control.isVisible())continue;
      const actual=await control.evaluate(node=>{
        const frame=node.closest('.mk-input-control,.mk-clearable-control,.mk-address-search-control')??node;
        const style=getComputedStyle(frame),own=getComputedStyle(node);
        const ctx=document.createElement('canvas').getContext('2d');
        const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
        return {tag:node.tagName,label:node.labels?.[0]?.textContent??node.getAttribute('aria-label'),frame:frame.className,
          border:parseFloat(style.borderTopWidth),cssColor:style.borderTopColor,color:rgba(style.borderTopColor),background:rgba(style.backgroundColor),
          innerBorder:frame===node?null:parseFloat(own.borderTopWidth),disabled:node.matches(':disabled'),readonly:node.readOnly??false,
          invalid:node.getAttribute('aria-invalid')==='true',danger:rgba(style.getPropertyValue('--danger').trim())};
      });
      const context=`${theme} ${route}: ${actual.label??actual.frame}`;
      assert.ok(actual.border>0,`${context}: missing resting boundary`);
      assert.ok(actual.color[3]>0,`${context}: transparent resting boundary`);
      assert.notDeepEqual(actual.color,actual.background,`${context}: boundary blends into its background`);
      if(actual.innerBorder!==null)assert.equal(actual.innerBorder,0,`${context}: duplicate inner border`);
      if(actual.invalid){
        assert.deepEqual(actual.color,actual.danger,`${context}: error boundary at rest`);
        await control.hover();
        const hover=await control.evaluate(node=>getComputedStyle(node.closest('.mk-input-control,.mk-clearable-control,.mk-address-search-control')??node).borderTopColor);
        await control.focus();
        const focus=await control.evaluate(node=>{const style=getComputedStyle(node.closest('.mk-input-control,.mk-clearable-control,.mk-address-search-control')??node);return {border:style.borderTopColor,outline:style.outlineColor};});
        assert.equal(hover,actual.cssColor,`${context}: error boundary survives hover`);
        assert.equal(focus.border,actual.cssColor,`${context}: error boundary survives focus`);
        assert.equal(focus.outline,actual.cssColor,`${context}: error focus ring uses the error color`);
        await page.mouse.move(0,0);await control.blur();
      }
      measurements.push({theme,route,...actual});
    }
  }
  mkdirSync('verification',{recursive:true});
  for(const width of [1280,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:${port}/components/input`);
    await page.locator('.mk-website').evaluate((node,theme)=>node.dataset.theme=theme,theme);
    await page.locator('#default .mk-input-lg').waitFor();await page.evaluate(()=>document.fonts.ready);
    await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement?.blur());
    assert.equal(await page.locator('#default .mk-input-control').count(),3);
    for(const frame of await page.locator('#default .mk-input-control').all()){
      assert.equal(await frame.evaluate(node=>parseFloat(getComputedStyle(node).borderTopWidth)),1);
      const restingSize=await frame.boundingBox();
      await frame.locator('input').focus();
      assert.equal(await frame.evaluate(node=>parseFloat(getComputedStyle(node).outlineWidth)),2,'Visible keyboard focus ring');
      assert.deepEqual(await frame.boundingBox(),restingSize,'Focus must not resize the field');
      await frame.locator('input').blur();
    }
    await page.locator('#default').screenshot({path:`verification/input-rest-${width}-${theme}.png`,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  writeFileSync('verification/field-visibility.json',JSON.stringify({passed:true,routes:routes.length,measurements},null,2));
  console.log(`Field visibility: ${measurements.length} controls across ${routes.length} routes and both themes; resting boundaries, no duplicate borders, disabled/read-only and error states verified.`);
}finally{await browser?.close();server.kill();}
