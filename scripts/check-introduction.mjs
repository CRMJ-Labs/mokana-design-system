import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3016'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3016')){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const url='http://localhost:3016/introduction';
  await page.goto(url);
  const main=page.locator('#main-content');

  // Hero: one accent primary action inside the site, one external secondary link.
  const hero=page.locator('.mk-doc-hero');
  const primary=hero.getByRole('link',{name:'Ver componentes'});
  assert.equal(await hero.getByRole('link').count(),2);
  assert.deepEqual(await primary.evaluate(node=>{const style=getComputedStyle(node);return [style.backgroundColor,style.color];}),['oklch(0.6204 0.195 253.83)','oklch(0.2103 0.0059 285.89)']);
  assert.equal(await hero.getByRole('link',{name:/Figma/}).getAttribute('target'),'_blank');
  assert.equal(await main.getByRole('link',{name:/código de la landing/}).getAttribute('rel'),'noreferrer');
  assert.equal(await hero.locator('.mk-eyebrow').textContent(),'Versión 0.1.0');
  await primary.click();await page.waitForURL(/\/components\/button$/);
  await page.goto(url);

  // Steps: real links, in Spanish, with the shared numbered format.
  for(const [name,target] of [['01 / Fundamentos','/foundations/ui'],['02 / Componentes','/components/button'],['03 / Patrones','/patterns/auth']]){
    const step=main.getByRole('link',{name:new RegExp(`^${name}`)});
    assert.equal(await step.getAttribute('href'),target);
    await step.click();await page.waitForURL(`**${target}`);
    await page.getByRole('heading',{level:1}).first().waitFor();
    assert.ok(await page.getByRole('heading',{level:1}).count());
    await page.goto(url);
  }
  const step=main.getByRole('link',{name:/^01 \/ Fundamentos/});
  await step.focus();
  await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await step.evaluate(node=>getComputedStyle(node).outlineStyle),'solid');

  // Copy fixes and the old strings are gone.
  const text=await main.innerText();
  for(const stale of ['Foundations','Components','Patterns','Productos futuros','pendiente de publicación','la documentación web documenta','Para desarrollar:'])assert.ok(!text.includes(stale),stale);
  for(const command of ['npm install','npm run dev','npm run typecheck','npm run build','npm run test:website'])assert.ok(text.includes(command),command);
  assert.ok(text.includes('Las fuentes y el isotipo se incluyen en el CSS del paquete.'));
  assert.ok(!text.includes('Sirve public/fonts'));

  const rhythm=()=>page.evaluate(()=>{
    const hero=document.querySelector('.mk-doc-hero').getBoundingClientRect();
    const sections=[...document.querySelectorAll('.mk-intro>.mk-section')];
    const before=sections[0].getBoundingClientRect().top-hero.bottom;
    const grid=sections[0].querySelector('.mk-grid').getBoundingClientRect();
    return {before,after:sections[1].getBoundingClientRect().top-grid.bottom};
  });
  for(const width of [1280,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    assert.deepEqual(await rhythm(),{before:32,after:32},'section rhythm');
    assert.equal(await hero.evaluate(node=>getComputedStyle(node).borderTopLeftRadius),'16px');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await main.screenshot({path:`verification/introduction-${width}-${theme}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('Introduction: primary action, step links, copy, rhythm, radius, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
