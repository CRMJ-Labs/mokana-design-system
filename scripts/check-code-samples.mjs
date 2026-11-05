import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const port=3025;
const base=`http://127.0.0.1:${port}`;
const roles={keyword:'danger-soft-foreground',function:'accent-soft-foreground',string:'success-soft-foreground',tag:'warning-soft-foreground',constant:'warning-soft-foreground'};
const expectedColor=(page,kind)=>page.evaluate(role=>{const node=document.createElement('span');node.style.color=`var(--${role})`;document.querySelector('.mk-website').append(node);const color=getComputedStyle(node).color;node.remove();return color;},roles[kind]);
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(`${page.url()}: ${error.message}`));
  await page.goto(`${base}/introduction`);
  const routes=await page.locator('#website-navigation a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname));

  // No hand-written panel is left: every code disclosure is the shared one.
  let panels=0;
  for(const route of routes){
    await page.goto(base+route);await page.locator('#main-content > div > :not(.mk-catalog-loading)').first().waitFor();
    panels+=await page.locator('.mk-code-disclosure').count();
    assert.equal(await page.locator('#main-content details:not(.mk-code-disclosure) > summary',{hasText:/^Ver (código|integración)/}).count(),0,`${route} has a plain code panel`);
  }
  assert.ok(panels>100,`only ${panels} panels`);

  // Opening: label, highlighted tokens, line numbers, copy without numbers.
  await page.goto(`${base}/components/destructive-action-modal`);
  const disclosure=page.locator('.mk-code-disclosure').first();
  const summary=disclosure.locator('summary');
  assert.equal(await summary.textContent(),'Ver código');
  assert.equal(await disclosure.locator('.mk-code-block-frame').count(),0,'renders only when opened');
  await summary.click();
  await disclosure.locator('.mk-code-block-frame').waitFor();
  assert.equal(await summary.textContent(),'Ocultar código');
  assert.ok(await disclosure.locator('.mk-code-gutter').count()>0);
  assert.ok(await disclosure.locator('[class*="mk-token-"]').count()>0,'code is highlighted');
  await disclosure.getByRole('button',{name:'Copiar código'}).click();
  const copied=(await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r/g,'');
  assert.equal(copied,await disclosure.locator('.mk-code-text').evaluateAll(nodes=>nodes.map(node=>node.textContent).join('').replace(/\n$/,'')),'copy is the code, without gutter');
  await summary.click();
  await page.waitForFunction(()=>document.querySelector('.mk-code-disclosure summary').textContent==='Ver código');

  // Colors for each kind of token in both modes.
  await page.goto(`${base}/components/code-block`);
  const sample=page.locator('#default .mk-code-block-frame');
  for(const theme of ['light','dark']){
    await page.locator('.mk-docs-header').getByRole('radio',{name:theme==='light'?'Claro':'Oscuro'}).check();
    await page.waitForTimeout(350);
    for(const kind of ['keyword','function','tag']){
      const token=sample.locator(`.mk-token-${kind}`).first();
      assert.equal(await token.evaluate(node=>getComputedStyle(node).color),await expectedColor(page,kind),`${theme} ${kind}`);
    }
    const diff=page.locator('#diff .mk-code-block-frame');
    assert.equal(await diff.locator('.mk-token-constant').first().evaluate(node=>getComputedStyle(node).color),await expectedColor(page,'constant'),`${theme} constant`);
    const languages=page.locator('#language .mk-code-block-frame');
    await languages.getByLabel('Lenguaje').selectOption('lua');
    assert.equal(await languages.locator('.mk-token-string').first().evaluate(node=>getComputedStyle(node).color),await expectedColor(page,'string'),`${theme} string`);
    await languages.getByLabel('Lenguaje').selectOption('js');
  }
  // Tokenizer: JSX and names are read correctly.
  assert.ok(await sample.locator('.mk-token-tag',{hasText:'div'}).count()>0);
  assert.ok(await sample.locator('.mk-token-function',{hasText:'Saludo'}).count()>0);
  assert.equal(await sample.locator('.mk-token-comment').count(),0,'no false comments');
  // Number tokens no longer share a class with the line number gutter.
  assert.equal(await page.locator('.mk-code-line .mk-token-constant').first().evaluate(node=>getComputedStyle(node).paddingRight),'0px');
  // Code on the introduction is highlighted too.
  await page.goto(`${base}/introduction`);
  assert.ok(await page.locator('#main-content .mk-code-block-frame .mk-token-keyword').count()>0);

  // One focus ring on field-like controls: border and outline touch, with no second line.
  const ring=async(route,control,focusable)=>{
    await page.goto(base+route);await page.locator('#main-content > div > :not(.mk-catalog-loading)').first().waitFor();
    await page.addStyleTag({content:'*{transition:none!important}'});
    const target=page.locator(`#main-content ${focusable}`).first();
    await target.scrollIntoViewIfNeeded();await target.focus();
    await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
    return page.locator(`#main-content ${control}`).first().evaluate(node=>{const style=getComputedStyle(node);return [style.outlineStyle,style.outlineWidth,style.outlineOffset].join(' ');});
  };
  for(const [route,control,focusable] of [
    ['/components/input','.mk-input-control:has(input:focus-visible)','.mk-input-control input:not([disabled])'],
    ['/components/clearable-input','.mk-clearable-control:has(input:focus-visible)','.mk-clearable-control input:not([disabled])'],
    ['/components/search-input','.mk-input-control:has(input:focus-visible)','.mk-input-control input:not([disabled])'],
    ['/components/multi-select','.mk-multi-select-trigger:focus-visible','.mk-multi-select-trigger:not([disabled])'],
    ['/components/calendar','.mk-calendar-trigger:focus-visible','.mk-calendar-trigger'],
  ])assert.equal(await ring(route,control,focusable),'solid 2px 0px',route);
  assert.deepEqual(errors,[]);
  console.log(`Code samples: ${panels} panels on ${routes.length} routes, syntax colors in both modes, copy, labels and single focus rings passed.`);
}finally{await browser?.close();server.kill();}
