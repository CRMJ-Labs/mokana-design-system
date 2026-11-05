import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const port=3024;
const base=`http://127.0.0.1:${port}`;
// Exact MOK values, serialized by the browser without converting OKLCH to hex.
const modes={
  light:{background:'oklch(0.9702 0 0)',surface:'oklch(1 0 0)',foreground:'oklch(0.2103 0.0059 285.89)',secondary:'oklch(0.5517 0.0138 285.94)',buttonBackground:'oklch(0.6204 0.195 253.83)',buttonText:'oklch(0.9911 0 0)',scheme:'light'},
  dark:{background:'oklch(0.12 0.005 285.823)',surface:'oklch(0.2103 0.0059 285.89)',foreground:'oklch(0.9911 0 0)',secondary:'oklch(0.705 0.015 286.067)',buttonBackground:'oklch(0.6204 0.195 253.83)',buttonText:'oklch(0.9911 0 0)',scheme:'dark'},
};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const read=page=>page.evaluate(()=>{
    const probe=(property,value)=>{const node=document.createElement('span');node.style[property]=value;document.querySelector('.mk-website').append(node);const result=getComputedStyle(node)[property];node.remove();return result;};
    const button=document.querySelector('.mk-button-primary');
    return {background:getComputedStyle(document.querySelector('.mk-website')).backgroundColor,surface:probe('backgroundColor','var(--surface)'),foreground:probe('color','var(--foreground)'),secondary:probe('color','var(--secondary)'),buttonBackground:probe('backgroundColor','var(--button-primary-background)'),buttonText:probe('color','var(--button-primary-text)'),scheme:getComputedStyle(document.documentElement).colorScheme,html:getComputedStyle(document.documentElement).backgroundColor,hasButton:!!button};
  });
  const settle=page=>page.waitForTimeout(350);

  for(const scheme of ['light','dark']){
    const context=await browser.newContext({viewport:{width:1280,height:900},colorScheme:scheme});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${base}/introduction`);
    await page.locator('#main-content').waitFor();

    // Like Geist: three options in the header, following the system until one is chosen.
    const header=page.locator('.mk-docs-header');
    const options=header.getByRole('radio');
    assert.equal(await options.count(),3);
    assert.deepEqual(await options.evaluateAll(nodes=>nodes.map(node=>node.value)),['system','light','dark']);
    assert.equal(await header.getByRole('radio',{name:'Sistema'}).isChecked(),true);
    await settle(page);
    const initial=await read(page);
    for(const key of Object.keys(modes[scheme]))assert.equal(initial[key],modes[scheme][key],`system ${scheme}: ${key}`);
    assert.equal(initial.html,modes[scheme].background,'html matches the page behind overscroll');

    // Choosing a mode applies it, survives a reload and overrides the system.
    const other=scheme==='light'?'dark':'light';
    await header.getByRole('radio',{name:other==='light'?'Claro':'Oscuro'}).check();
    await settle(page);
    const chosen=await read(page);
    for(const key of Object.keys(modes[other]))assert.equal(chosen[key],modes[other][key],`chosen ${other}: ${key}`);
    await page.reload();await page.locator('#main-content').waitFor();await settle(page);
    assert.equal(await header.getByRole('radio',{name:other==='light'?'Claro':'Oscuro'}).isChecked(),true);
    assert.equal((await read(page)).background,modes[other].background);

    // Back to system follows the operating system again, including live changes.
    await header.getByRole('radio',{name:'Sistema'}).check();await settle(page);
    assert.equal((await read(page)).background,modes[scheme].background);
    await page.emulateMedia({colorScheme:other});await settle(page);
    assert.equal((await read(page)).background,modes[other].background,'follows live system change');

    // Keyboard works like any radio group, with a visible focus.
    await page.emulateMedia({colorScheme:scheme});
    await header.getByRole('radio',{name:'Sistema'}).focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await header.getByRole('radio',{name:'Claro'}).isChecked(),true);
    await header.getByRole('radio',{name:'Sistema'}).check();

    // The MOK accent and eclipse panel stay consistent in both modes.
    const primary=page.locator('.mk-doc-hero .mk-button-primary');
    await settle(page);
    assert.equal(await primary.evaluate(node=>getComputedStyle(node).backgroundColor),'oklch(0.6204 0.195 253.83)');
    assert.equal(await page.locator('.mk-doc-hero').evaluate(node=>getComputedStyle(node).backgroundColor),'oklch(0.2103 0.0059 285.89)');
    assert.deepEqual(errors,[]);
    await page.screenshot({path:`verification/theme-modes-1280-${scheme}.png`});

    // Header fits on a phone with the three options.
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(const box of await options.evaluateAll(nodes=>nodes.map(node=>{const b=node.closest('label').getBoundingClientRect();return [b.left,b.right,b.width,b.height];}))){
      assert.ok(box[0]>=0&&box[1]<=390,'option stays on screen');
      assert.ok(box[2]>=24&&box[3]>=24,'option keeps a 24px target');
    }
    await page.screenshot({path:`verification/theme-modes-390-${scheme}.png`});
    await context.close();
  }

  // No flash: the right background is painted before any app code runs.
  for(const [stored,system] of [['dark','light'],['light','dark'],['system','dark'],[null,'dark']]){
    const context=await browser.newContext({colorScheme:system});
    await context.addInitScript(value=>{if(value)localStorage.setItem('mok-theme',value);},stored);
    const page=await context.newPage();
    await page.route('**/assets/*.js',route=>route.abort());
    await page.goto(`${base}/introduction`,{waitUntil:'domcontentloaded'});
    const expected=(stored==='light'||stored==='dark')?stored:system;
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),modes[expected].background,`before app: stored=${stored} system=${system}`);
    await context.close();
  }
  console.log('Theme modes: MOK colors, three-way switcher, system, persistence, keyboard, brand, mobile and no flash passed.');
}finally{await browser?.close();server.kill();}
