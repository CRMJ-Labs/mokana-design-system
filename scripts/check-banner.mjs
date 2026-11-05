import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3017'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3017')){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const url='http://localhost:3017/components/banner';
  await page.goto(url);
  const isFocused=locator=>locator.evaluate(node=>node===document.activeElement);
  const luminance=rgb=>{const channel=rgb.slice(0,3).map(value=>{const c=value/255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4;});return .2126*channel[0]+.7152*channel[1]+.0722*channel[2];};
  const contrast=(a,b)=>{const [x,y]=[luminance(a),luminance(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
  const rgb=(locator,property)=>locator.evaluate((node,property)=>{const canvas=document.createElement('canvas').getContext('2d',{willReadFrequently:true});canvas.fillStyle=getComputedStyle(node)[property];canvas.fillRect(0,0,1,1);return [...canvas.getImageData(0,0,1,1).data];},property);

  // Semantics: a named complementary region, never the site banner landmark.
  const first=page.locator('#default').getByRole('complementary',{name:'Anuncio'});
  assert.equal(await page.locator('.mk-banner[role=banner]').count(),0);
  assert.equal(await first.locator('.mk-separator').getAttribute('aria-hidden'),'true');

  // Actions: href is a link, otherwise a button that runs onClick.
  const link=first.getByRole('link',{name:'Leer más'});
  assert.equal(await link.getAttribute('href'),'/components/separator');
  await link.click();await page.waitForURL(/\/components\/separator$/);await page.goto(url);
  const action=page.locator('#action');
  await action.getByRole('button',{name:'Probar tema oscuro'}).click();
  assert.match(await action.getByRole('status').textContent(),/Demostración/);

  // Dismiss: focus moves to a useful control both ways.
  const dismiss=page.locator('#dismiss');
  await dismiss.getByRole('button',{name:'Cerrar anuncio'}).focus();await page.keyboard.press('Enter');
  assert.equal(await dismiss.locator('.mk-banner').count(),0);
  const restore=dismiss.getByRole('button',{name:'Mostrar de nuevo'});
  assert.equal(await isFocused(restore),true);
  await page.keyboard.press('Enter');
  assert.equal(await isFocused(dismiss.getByRole('button',{name:'Cerrar anuncio'})),true);

  // Flush: no radius and no side borders.
  assert.deepEqual(await page.locator('#flush .mk-banner').evaluate(node=>{const style=getComputedStyle(node);return [style.borderTopLeftRadius,style.borderLeftWidth,style.borderBottomWidth];}),['0px','0px','1px']);

  for(const width of [1280,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    // Every tone keeps readable text, eyebrow and action in both themes.
    for(const banner of await page.locator('#tones .mk-banner').all()){
      const background=await rgb(banner,'backgroundColor');
      const name=await banner.getAttribute('aria-label');
      assert.ok(contrast(await rgb(banner.locator('.mk-banner-message'),'color'),background)>=4.5,`${name} message ${theme}`);
      assert.ok(contrast(await rgb(banner.locator('.mk-eyebrow'),'color'),background)>=4.5,`${name} eyebrow ${theme}`);
      const button=banner.locator('.mk-button');
      assert.ok(contrast(await rgb(button,'color'),await rgb(button,'backgroundColor'))>=4.5,`${name} action ${theme}`);
    }
    // Ink stays the brand panel whatever the theme is.
    assert.deepEqual((await rgb(first,'backgroundColor')).slice(0,3),[24,24,27]);
    assert.deepEqual((await rgb(first.locator('.mk-button'),'backgroundColor')).slice(0,3),[4,133,247]);
    assert.deepEqual((await rgb(page.locator('#mark .mk-mark'),'backgroundColor')).slice(0,3),[252,252,252]);
    // Long text wraps inside the banner and clears the close button.
    const long=page.locator('#long .mk-banner');
    const bounds=await long.boundingBox();const message=await long.locator('.mk-banner-message').boundingBox();const close=await long.locator('.mk-banner-close').boundingBox();
    assert.ok(message.x+message.width<=close.x+1,'message clears close');
    assert.ok(close.x+close.width<=bounds.x+bounds.width,'close stays inside');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('#main-content').screenshot({path:`verification/banner-${width}-${theme}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('Banner: semantics, actions, dismiss focus, flush, tone contrast, long text, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
