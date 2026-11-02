import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';

const library=await import('../dist/mokana.js');
assert.equal(library.iconNames.length,80);
for(const name of [...library.iconNames,'arrow','chevron']){
  const svg=renderToStaticMarkup(createElement(library.Icon,{name}));
  assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/stroke-width="1.8"/);assert.match(svg,/aria-hidden="true"/);
}
assert.match(renderToStaticMarkup(createElement(library.Icon,{name:'warning',label:'Requiere atención'})),/role="img"/);
assert.doesNotMatch(renderToStaticMarkup(createElement(library.Icon,{name:'warning',label:'Requiere atención'})),/aria-hidden="true"/);
assert.match(renderToStaticMarkup(createElement(library.Icon,{name:'arrow'})),/data-icon="arrow-right"/);
assert.match(renderToStaticMarkup(createElement(library.Icon,{name:'chevron'})),/data-icon="chevron-down"/);
assert.ok(fs.readFileSync('THIRD_PARTY_NOTICES.md','utf8').includes('ISC License'));
assert.ok(JSON.parse(fs.readFileSync('package.json','utf8')).files.includes('THIRD_PARTY_NOTICES.md'));

const port=3027;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://localhost:${port}/foundations/iconography`);
  await page.getByRole('heading',{name:'Iconografía',exact:true}).waitFor();
  const tiles=page.locator('.mk-icon-tile');await expect(tiles).toHaveCount(80);
  await page.getByRole('searchbox',{name:'Buscar iconos'}).fill('eliminar');await expect(tiles).toHaveCount(1);await expect(tiles.locator('code')).toHaveText('trash');
  await page.getByRole('radio',{name:'16 píxeles',exact:true}).check();
  await expect(tiles.locator('.mk-icon-tile-visual svg')).toHaveAttribute('width','16');
  await tiles.getByRole('button',{name:'Copiar código: trash'}).click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'<Icon name="trash" size={16} />');
  await page.getByRole('searchbox',{name:'Buscar iconos'}).fill('no-existe');await expect(tiles).toHaveCount(0);
  await expect(page.getByText('No hay coincidencias. Prueba otra palabra o selecciona todas las categorías.')).toBeVisible();
  await page.getByRole('searchbox',{name:'Buscar iconos'}).press('Escape');await expect(tiles).toHaveCount(80);
  await page.getByRole('searchbox',{name:'Buscar iconos'}).fill('navegacion');await expect(tiles).toHaveCount(14);
  await page.getByRole('searchbox',{name:'Buscar iconos'}).press('Escape');
  await page.getByRole('combobox',{name:'Categoría'}).selectOption('Personas y seguridad');
  await expect(tiles).toHaveCount(12);await expect(tiles.locator('code',{hasText:/^lock$/})).toHaveCount(1);
  await page.getByRole('combobox',{name:'Categoría'}).selectOption('all');
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.locator('.mk-docs-header').getByRole('radio',{name:theme==='light'?'Claro':'Oscuro',exact:true}).check();
    await page.getByRole('radio',{name:'24 píxeles',exact:true}).check();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const visual=await tiles.first().locator('.mk-icon-tile-visual svg').boundingBox();assert.equal(visual.width,24);assert.equal(visual.height,24);
    await page.screenshot({path:`verification/iconography-${width}-${theme}.png`,animations:'disabled'});
  }
  for(const [route,icon] of [['/components/copy-button','copy'],['/components/input','search'],['/components/dots-menu','more-horizontal'],['/components/file-tree','folder-open'],['/components/error','error']]){
    await page.goto(`http://localhost:${port}${route}`);await page.locator('#main-content h1').waitFor();
    assert.ok(await page.locator(`#main-content svg[data-icon="${icon}"]`).count()>0,route);
  }
  assert.deepEqual(errors,[]);
  console.log('Iconography: 80 icons, legacy aliases, accessible names, search/categories, sizes, copied code, migrated components, notices, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
