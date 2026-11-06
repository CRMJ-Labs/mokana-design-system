import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const port=3048;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Business table preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve()}});server.once('error',reject)});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/table`);
  await expect(page.locator('.mk-business-table-example')).toHaveCount(3);
  const leads=page.locator('#leads-pattern');
  await expect(leads.locator('tbody>tr:not(.mk-table-responsive-row)')).toHaveCount(5);
  await leads.getByRole('button',{name:'Ganado',exact:true}).click();
  await expect(leads.locator('tbody>tr:not(.mk-table-responsive-row)')).toHaveCount(1);
  await leads.getByRole('button',{name:'Todos',exact:true}).click();
  await leads.getByRole('searchbox',{name:'Buscar leads'}).fill('Camila');
  await expect(leads.getByText('Camila Rojas',{exact:true})).toBeVisible();
  await expect(leads.getByText('Esteban Moreno',{exact:true})).toHaveCount(0);
  await leads.getByRole('searchbox',{name:'Buscar leads'}).fill('');
  await leads.getByRole('button',{name:'Acciones de Esteban Moreno'}).click();
  await expect(page.getByRole('menuitem',{name:'Abrir lead'})).toBeVisible();
  await page.keyboard.press('Escape');

  const projects=page.locator('#projects-pattern');
  await expect(projects.getByRole('status')).toContainText('1–3 de 4 proyectos');
  await projects.getByRole('button',{name:'Página siguiente'}).click();
  await expect(projects.getByRole('status')).toContainText('4–4 de 4 proyectos');
  await projects.locator('label.mk-checkbox',{hasText:'Incluir archivados'}).click();
  await expect(projects.getByRole('status')).toContainText('1–3 de 5 proyectos');

  const finance=page.locator('#finance-pattern');
  await finance.getByRole('button',{name:'Pendiente',exact:true}).click();
  await expect(finance.getByRole('status')).toContainText('2 de 5 gastos');
  await expect(finance.getByText('Total visible:',{exact:false})).toBeVisible();

  mkdirSync('verification',{recursive:true});
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:1440,height:1100});
    await page.locator('.mk-website').evaluate((node,next)=>node.dataset.theme=next,theme);
    await leads.scrollIntoViewIfNeeded();
    await leads.screenshot({path:`verification/business-tables-desktop-${theme}.png`,animations:'disabled'});
    await page.setViewportSize({width:390,height:844});
    await leads.scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme}: no document overflow on mobile`);
    await leads.screenshot({path:`verification/business-tables-mobile-${theme}.png`,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('Business table examples: filters, search, row actions, pagination, responsive layout and both themes passed.');
}finally{await browser?.close();server.kill()}
