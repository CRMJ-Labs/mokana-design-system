import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3013'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3013')){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:3013/components/menu');
  const trigger=page.locator('#default').getByRole('button',{name:'Acciones'});
  await trigger.focus();await page.keyboard.press('ArrowDown');
  const focused=()=>page.evaluate(()=>document.activeElement?.textContent);
  assert.equal(await focused(),'Editar proyecto');
  await page.keyboard.press('ArrowUp');assert.equal(await focused(),'Archivar proyecto');
  await page.keyboard.press('Home');assert.equal(await focused(),'Editar proyecto');
  await page.keyboard.press('End');assert.equal(await focused(),'Archivar proyecto');
  await page.keyboard.press('d');assert.equal(await focused(),'Duplicar proyecto');
  await page.keyboard.press('Enter');
  await page.getByRole('menu').waitFor({state:'detached'});
  assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  assert.match(await page.getByRole('status').textContent(),/Duplicar proyecto seleccionado/);
  await trigger.press('ArrowUp');assert.equal(await focused(),'Archivar proyecto');
  await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  await trigger.click();await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('menu').count(),0);
  assert.equal(await trigger.evaluate(node=>node===document.activeElement),false);
  for(const id of ['disabled','locked']){
    await page.locator(`#${id}`).getByRole('button',{name:'Acciones'}).click();
    await page.keyboard.press('End');assert.equal(await focused(),'Archivar proyecto');
    assert.equal(await page.getByRole('menuitem',{name:id==='locked'?'Transferir proyecto':'Exportar proyecto'}).isDisabled(),true);
    await page.keyboard.press('ArrowDown');assert.equal(await focused(),'Editar proyecto');
    await page.keyboard.press('Escape');
  }
  await page.locator('#custom-trigger').getByRole('button',{name:'Acciones de Milton'}).click();
  await page.getByRole('heading',{name:'Menu',exact:true,level:1}).click();assert.equal(await page.getByRole('menu').count(),0);
  await page.locator('#links').getByRole('button').click();
  assert.equal(await page.getByRole('menuitem',{name:'Ver Button'}).getAttribute('href'),'/components/button');
  assert.equal(await page.getByRole('menuitem',{name:'Referencia Geist'}).getAttribute('rel'),'noreferrer');
  await page.keyboard.press('Escape');
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    for(const position of ['bottom-start','bottom-end','top-start','top-end','left-start','right-start']){
      await page.locator('#position').getByRole('button',{name:position,exact:true}).click();
      const bounds=await page.getByRole('menu').boundingBox();
      assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=900,position);
      await page.keyboard.press('Escape');
    }
    await trigger.scrollIntoViewIfNeeded();await trigger.click();
    await page.screenshot({path:`verification/menu-${width}-${theme}.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  console.log('Menu: keyboard, typeahead, focus, disabled/locked items, links, outside click, positioning, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
