import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const port=3047;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Admin table preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/foundations/application-layout`);
  const preview=page.locator('.mk-layout-preview'),table=preview.locator('.mk-admin-table');
  await expect(table.locator('.mk-table-data-row')).toHaveCount(3);
  await expect(table.getByRole('button',{name:/^Acciones de /})).toHaveCount(3);
  for(const row of await table.locator('.mk-table-data-row').all())assert.ok(await row.evaluate(node=>node.getBoundingClientRect().height)<72,'Row actions must not increase data-row height.');
  await table.getByRole('button',{name:'Acciones de Tolva de recepción'}).click();
  await page.getByRole('menuitem',{name:'Editar equipo'}).click();
  await expect(preview.getByRole('status')).toHaveText('Editando Tolva de recepción.');
  assert.equal(await table.locator('th[data-priority=tertiary]').evaluate(node=>getComputedStyle(node).display),'none');
  assert.notEqual(await table.locator('th[data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  assert.notEqual(await table.locator('.mk-table-responsive-details [data-priority=tertiary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  assert.equal(await table.locator('.mk-table-responsive-details [data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  await preview.screenshot({path:'verification/admin-table-1280.png',animations:'disabled'});

  await page.setViewportSize({width:390,height:1100});await page.reload();
  await expect(table.locator('.mk-table-data-row')).toHaveCount(3);
  assert.equal(await table.locator('th[data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  assert.notEqual(await table.locator('.mk-table-responsive-details [data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Admin pattern must not overflow the mobile viewport.');
  await table.getByRole('button',{name:'Acciones de Mezclador industrial'}).click();
  await expect(page.getByRole('menuitem',{name:'Validar ficha'})).toHaveAttribute('aria-disabled','true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await table.screenshot({path:'verification/admin-table-390.png',animations:'disabled'});
  assert.deepEqual(errors,[]);
  console.log('Admin table: one DotsMenu per row, compact row height, actions, responsive priorities and mobile overflow passed.');
}finally{await browser?.close();server.kill();}
