import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';

const port=3049;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('CRUD preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/patterns/crud`);
  const pattern=page.locator('.mk-crud-pattern'),table=pattern.locator('.mk-admin-table');
  await expect(table.locator('.mk-table-data-row')).toHaveCount(4);
  await expect(table.getByRole('button',{name:/^Acciones de /})).toHaveCount(4);

  // Create and validate required fields.
  await pattern.getByRole('button',{name:'Nuevo equipo'}).first().click();
  const create=page.getByRole('dialog',{name:'Nuevo equipo'});
  await create.getByLabel('Nombre del equipo').fill('');
  await create.getByRole('button',{name:'Crear equipo'}).click();
  await expect(create.getByText('Escribe un nombre.')).toBeVisible();
  await create.getByLabel('Nombre del equipo').fill('Elevador de cangilones');
  await create.getByLabel('Categoría').selectOption('Transporte');
  await create.getByRole('button',{name:'Crear equipo'}).click();
  await expect(table).toContainText('Elevador de cangilones');
  await expect(pattern.locator('.mk-alert')).toContainText('fue creado');

  // Search, read and edit through the row DotsMenu.
  const search=pattern.getByLabel('Buscar por código, nombre o responsable');
  await search.fill('Elevador');
  await expect(table.locator('.mk-table-data-row')).toHaveCount(1);
  await table.getByRole('button',{name:'Acciones de Elevador de cangilones'}).click();
  await page.getByRole('menuitem',{name:'Ver detalles'}).click();
  const details=page.getByRole('dialog',{name:'Detalle del equipo'});
  await expect(details).toContainText('Transporte');
  await details.getByRole('button',{name:'Cerrar',exact:true}).click();
  await table.getByRole('button',{name:'Acciones de Elevador de cangilones'}).click();
  await page.getByRole('menuitem',{name:'Editar equipo'}).click();
  const edit=page.getByRole('dialog',{name:'Editar equipo'});
  await edit.getByLabel('Nombre del equipo').fill('Elevador vertical');
  await edit.getByRole('button',{name:'Guardar cambios'}).click();
  await expect(table).toContainText('Elevador vertical');

  // Filters, selection and bulk status update.
  await search.fill('');
  await pattern.getByLabel('Estado').first().selectOption('Activo');
  const activeCount=await table.locator('.mk-table-data-row').count();
  assert.ok(activeCount>=1);
  await table.getByRole('checkbox',{name:'Seleccionar filas de Equipos registrados'}).check();
  await expect(pattern.getByText(`${activeCount} seleccionados`)).toBeVisible();
  await pattern.getByRole('button',{name:'Desactivar selección'}).click();
  await expect(table.locator('.mk-table-data-row')).toHaveCount(0);
  await pattern.getByRole('button',{name:'Limpiar filtros'}).click();

  // Delete with explicit confirmation.
  await search.fill('Elevador vertical');
  await table.getByRole('button',{name:'Acciones de Elevador vertical'}).click();
  await page.getByRole('menuitem',{name:'Eliminar equipo'}).click();
  const deletion=page.getByRole('dialog',{name:'Eliminar equipo'});
  await expect(deletion).toContainText('Elevador vertical');
  await deletion.getByRole('button',{name:'Eliminar definitivamente'}).click();
  await expect(table).not.toContainText('Elevador vertical');
  await expect(pattern.locator('.mk-alert')).toContainText('fue eliminado');

  // Responsive priority details and accessibility in both themes.
  await pattern.getByRole('button',{name:'Restablecer'}).click();
  await page.setViewportSize({width:390,height:1100});
  await expect(table.locator('.mk-table-data-row')).toHaveCount(4);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'CRUD must not overflow the mobile viewport.');
  assert.equal(await table.locator('th[data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  assert.notEqual(await table.locator('.mk-table-responsive-details [data-priority=secondary]').first().evaluate(node=>getComputedStyle(node).display),'none');
  for(const theme of ['light','dark']){
    await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
    await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
    const violations=await page.evaluate(async()=>(await axe.run(document.querySelector('.mk-crud-pattern'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.target)})));
    assert.deepEqual(violations,[],`${theme}: ${JSON.stringify(violations)}`);
  }
  assert.deepEqual(errors,[]);
  console.log('CRUD pattern: create, validation, read, update, filters, selection, bulk action, delete, responsive behavior and accessibility passed.');
}finally{await browser?.close();server.kill();}
