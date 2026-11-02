import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3017'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3017')){clearTimeout(timer);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install();
  await page.goto('http://localhost:3017/components/toast');
  const notices=page.locator('.mk-toast-region .mk-notification');
  const trigger=page.locator('#default').getByRole('button');
  await trigger.click();await expect(notices).toHaveCount(1);
  assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  await expect(page.getByRole('region',{name:'Notificaciones'})).toHaveAttribute('aria-live','polite');
  await page.clock.runFor(5100);await expect(notices).toHaveCount(0);
  await trigger.click();await notices.hover();await page.clock.runFor(6000);await expect(notices).toHaveCount(1);
  await page.mouse.move(0,0);await page.clock.runFor(5100);await expect(notices).toHaveCount(0);
  await trigger.click();await page.keyboard.press('F8');
  assert.equal(await notices.evaluate(node=>node===document.activeElement),true);
  await page.clock.runFor(6000);await expect(notices).toHaveCount(1);
  await page.keyboard.press('Escape');await expect(notices).toHaveCount(0);
  assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  await page.locator('#preserve').getByRole('button').click();
  await page.clock.runFor(30000);await expect(notices).toHaveCount(1);
  await notices.getByRole('button',{name:'Cerrar notificación'}).click();
  await page.locator('#action').getByRole('button',{name:'Mostrar notificación'}).click();
  await notices.getByRole('button',{name:'Marcar como revisado'}).click();
  await expect(page.locator('#action').getByRole('status')).toHaveText('Revisiones registradas: 1');
  await expect(notices).toHaveCount(0);
  await page.locator('#undo').getByRole('button',{name:'Archivar proyecto',exact:true}).click();
  await expect(page.locator('#undo').getByRole('status')).toHaveText('Estado del proyecto: Archivado');
  await notices.getByRole('button',{name:'Deshacer'}).click();
  await expect(page.locator('#undo').getByRole('status')).toHaveText('Estado del proyecto: Activo');
  await expect(notices).toHaveCount(0);
  for(const id of ['success','warning','error'])await page.locator(`#${id}`).getByRole('button').click();
  await expect(notices).toHaveCount(3);
  for(const tone of ['success','warning','error'])await expect(page.locator(`.mk-toast-region .mk-toast-${tone}`)).toHaveCount(1);
  while(await notices.count())await notices.first().getByRole('button',{name:'Cerrar notificación'}).click();
  await page.locator('#link').getByRole('button').click();
  await expect(notices.getByRole('link')).toHaveAttribute('href','/components/description');
  await notices.getByRole('button',{name:'Cerrar notificación'}).click();
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
    await page.locator('#multiline').getByRole('button').click();
    await page.locator('#default').scrollIntoViewIfNeeded();
    const bounds=await notices.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=900);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`verification/toast-${width}-${theme}.png`,animations:'disabled'});
    await notices.getByRole('button',{name:'Cerrar notificación'}).click();
  }
  assert.deepEqual(errors,[]);
  console.log('Toast: auto-dismiss, hover/focus pause, persistence, actions, undo, focus restoration, variants, links, mobile and themes passed.');
}finally{await browser?.close();server.kill();}
