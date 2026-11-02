import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3021'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3021')){clearTimeout(timer);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const goto=slug=>page.goto(`http://localhost:3021/components/${slug}`);
  await goto('filter-params?team=Acme&other=keep#default');
  await expect(page.locator('#default').getByRole('status')).toHaveText('2 proyectos · 1 filtros activos');
  await expect(page.locator('#default').getByRole('button',{name:'Cambiar Equipo: Acme'})).toBeVisible();
  const trigger=page.locator('#default').getByRole('button',{name:'Añadir filtro'});await trigger.click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('searchbox').fill('entorno');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await dialog.getByRole('searchbox').fill('produ');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await expect(dialog).not.toBeVisible();
  assert.equal(new URL(page.url()).searchParams.get('environment'),'production');
  assert.equal(new URL(page.url()).searchParams.get('other'),'keep');assert.equal(new URL(page.url()).hash,'#default');
  await expect(page.locator('#default').getByRole('status')).toHaveText('1 proyectos · 2 filtros activos');
  await page.reload();await expect(page.locator('#default').getByRole('button',{name:'Cambiar Entorno: Producción'})).toBeVisible();
  await page.locator('#default').getByRole('button',{name:'Quitar filtro Entorno: Producción'}).click();
  assert.equal(new URL(page.url()).searchParams.has('environment'),false);assert.equal(new URL(page.url()).searchParams.get('other'),'keep');
  await page.goBack();await expect(page.locator('#default').getByRole('button',{name:'Cambiar Entorno: Producción'})).toBeVisible();
  await page.goForward();await expect(page.locator('#default').getByRole('button',{name:'Cambiar Entorno: Producción'})).toHaveCount(0);
  await page.locator('#suggestions').getByRole('button',{name:'Sugerencia: Entorno · Producción'}).click();
  await expect(page.locator('#suggestions').getByRole('button',{name:'Sugerencia: Entorno · Producción'})).toHaveCount(0);
  await page.locator('#default').getByRole('button',{name:'Quitar filtro Entorno: Producción'}).click();
  await page.locator('#ai').getByRole('button',{name:'Añadir filtro'}).click();await dialog.getByRole('searchbox').fill('Solo producción');
  await dialog.getByRole('button',{name:'Sugerir filtros para esta búsqueda'}).click();await expect(dialog).not.toBeVisible();
  assert.equal(new URL(page.url()).searchParams.get('environment'),'production');
  assert.equal(new URL(page.url()).searchParams.get('workspace'),'MOK');
  assert.equal(await page.locator('#readonly').getByRole('button',{name:/Quitar filtro Espacio/}).count(),0);
  await page.locator('#readonly').getByRole('button',{name:'Espacio: MOK',exact:true}).focus();
  await expect(page.getByRole('region',{name:'Contexto de Espacio'})).toBeVisible();await page.keyboard.press('Escape');
  await goto('gauge');
  const gauge=page.locator('#default').getByRole('progressbar');
  await page.locator('#default').getByRole('slider').fill('100');await expect(gauge).toHaveAttribute('aria-valuenow','100');
  await page.locator('#default').getByRole('slider').fill('0');await expect(gauge).toHaveAttribute('aria-valuenow','0');
  await expect(page.locator('#indeterminate').getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  await expect(page.locator('#indeterminate').getByRole('progressbar')).toHaveAttribute('aria-busy','true');
  await expect(page.locator('#arc .mk-gauge').last().locator('.mk-gauge-arc')).toHaveAttribute('stroke-linecap','butt');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#indeterminate svg').evaluate(node=>getComputedStyle(node).animationName),'none');
  await goto('grid');
  for(const [width,columns] of [[390,2],[800,3],[1280,6]]){
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.locator('#responsive .mk-layout-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),columns);
  }
  assert.equal(await page.locator('#grid .mk-layout-guides').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-hidden')==='true')),true);
  const colors=page.locator('#page').getByRole('link',{name:'Explorar colores'});await colors.focus();await page.keyboard.press('Tab');
  assert.equal(await page.locator('#page').getByRole('link',{name:'Ver componentes'}).evaluate(node=>node===document.activeElement),true);
  for(const slug of ['filter-params','gauge','grid']){
    await goto(slug);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug);
      await page.screenshot({path:`verification/${slug}-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Filter Params, Gauge and Grid: URL persistence/history, parameter isolation, suggestions, AI demo, readonly context, numeric ARIA, reduced motion, breakpoints, reading order and themes passed.');
}finally{await browser?.close();server.kill();}
