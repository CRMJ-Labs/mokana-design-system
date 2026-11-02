import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const port=3036;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Table preview did not start')),20000);server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1080}});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/table`);await page.locator('#default table').waitFor();
  const work=page.locator('#default');
  const table=work.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(5);
  await expect(table.locator('tbody tr').first()).toContainText('Analytics');
  await expect(table.getByRole('columnheader').filter({has:page.getByRole('button',{name:'Ordenar por Proyecto',exact:true})})).toHaveAttribute('aria-sort','ascending');
  const selectAll=work.getByRole('checkbox',{name:'Seleccionar filas de Proyectos del equipo'});
  await selectAll.focus();await page.keyboard.press('Space');
  await expect(work.getByText('4 seleccionados',{exact:true})).toBeVisible();
  await work.getByRole('button',{name:'Página siguiente'}).click();
  await expect(selectAll).not.toBeChecked();
  await work.getByRole('checkbox',{name:'Seleccionar Portal de clientes',exact:true}).check();
  await expect(work.getByText('5 seleccionados',{exact:true})).toBeVisible();
  assert.equal(await selectAll.evaluate(node=>node.indeterminate),true);
  await work.getByRole('button',{name:'Página anterior'}).click();await expect(selectAll).toBeChecked();
  await selectAll.uncheck();await expect(work.getByText('1 seleccionados',{exact:true})).toBeVisible();
  await work.getByRole('button',{name:'Limpiar selección'}).click();
  await expect(work.getByRole('button',{name:'Archivar selección'})).toHaveCount(0);
  // Sorting happens over the complete dataset before pagination.
  await work.getByRole('button',{name:'Ordenar por Presupuesto',exact:true}).click();
  await expect(table.locator('tbody tr').first()).toContainText('Documentación');
  await work.getByRole('button',{name:'Página siguiente'}).click();
  await expect(table.locator('tbody tr').last()).toContainText('Aplicación móvil');
  await work.getByRole('button',{name:'Ordenar por Presupuesto',exact:true}).click();
  await expect(table.locator('tbody tr').first()).toContainText('Aplicación móvil');
  await expect(work.getByText('Página 1 de 2',{exact:true})).toBeVisible();
  const search=work.getByRole('searchbox',{name:'Buscar proyectos en la tabla'});
  await search.fill('documentacion');await expect(table.locator('tbody tr')).toHaveCount(1);await expect(table).toContainText('Documentación');
  await search.fill('no existe');await expect(table).toContainText('No hay coincidencias.');await expect(selectAll).toBeDisabled();
  await expect(work.getByText('0–0 de 0 registros',{exact:true})).toBeVisible();
  await search.fill('');
  await work.getByRole('checkbox',{name:'Seleccionar Aplicación móvil',exact:true}).check();
  await work.getByRole('button',{name:'Archivar selección'}).click();
  await expect(table).not.toContainText('Aplicación móvil');
  await work.getByRole('button',{name:'Restablecer datos'}).click();
  await expect(table).toContainText('Aplicación móvil');
  await work.getByRole('button',{name:'Acciones de Aplicación móvil'}).click();
  await page.getByRole('menuitem',{name:'Ver detalles'}).click();await expect(work.getByRole('status').last()).toContainText('Diego Ruiz');

  const numeric=page.locator('#sorting table');await expect(numeric.locator('tbody tr').first()).toContainText('Aplicación móvil');
  await page.locator('#sorting').getByRole('button',{name:'Ordenar por Presupuesto'}).click();await expect(numeric.locator('tbody tr').first()).toContainText('Documentación');
  const controlled=page.locator('#selection');
  await expect(controlled.getByRole('checkbox',{name:'Seleccionar Tienda online',exact:true})).toBeDisabled();
  await controlled.getByRole('checkbox',{name:'Seleccionar MOK Design System',exact:true}).check();
  assert.equal(await controlled.getByRole('checkbox').first().evaluate(node=>node.indeterminate),true);
  await controlled.getByRole('checkbox').first().check();await expect(controlled.getByRole('status')).toContainText('3 seleccionados');
  await expect(controlled.getByRole('checkbox',{name:'Seleccionar Tienda online',exact:true})).not.toBeChecked();
  await expect(page.locator('#loading table')).toHaveAttribute('aria-busy','true');await expect(page.locator('#loading button').first()).toBeDisabled();
  await page.locator('#error').getByRole('button',{name:'Reintentar'}).click();await expect(page.locator('#error tbody tr')).toHaveCount(2);
  await page.locator('#error').getByRole('button',{name:'Simular error'}).click();await expect(page.locator('#error').getByRole('alert')).toBeVisible();

  const variants=page.locator('#variants');
  await variants.getByLabel('Densidad').selectOption('compact');const compact=await variants.locator('tbody tr').first().evaluate(node=>node.getBoundingClientRect().height);
  await variants.getByLabel('Densidad').selectOption('comfortable');assert.ok(await variants.locator('tbody tr').first().evaluate(node=>node.getBoundingClientRect().height)>compact);
  await variants.getByLabel('Superficie').selectOption('striped');await expect(variants.locator('.mk-table-root')).toHaveClass(/variant-striped/);
  const sticky=page.locator('#sticky .mk-table-scroll');await sticky.evaluate(node=>node.scrollTop=200);
  assert.equal(await sticky.locator('th').first().evaluate(node=>getComputedStyle(node).position),'sticky');
  mkdirSync('verification',{recursive:true});
  for(const width of [1440,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1080});await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('#main-content *')].filter(node=>node.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(node).position!=='fixed').slice(0,8).map(node=>[node.tagName,node.className,node.getBoundingClientRect().width])}));
    assert.ok(overflow.scroll<=overflow.width,JSON.stringify({theme,...overflow}));
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=>(await window.axe.run(document.querySelector('#main-content'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations);
    assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    await work.scrollIntoViewIfNeeded();await page.screenshot({path:`verification/table-${width}-${theme}.png`,fullPage:false,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('Tables: global numeric sorting, search, pagination, cross-page selection, indeterminate, bulk/row actions, states, densities, sticky header, accessibility and mobile passed.');
}finally{await browser?.close();server.kill();}
