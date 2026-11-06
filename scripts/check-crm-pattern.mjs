import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';

const port=3051;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('CRM preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/patterns/crm`);
  const crm=page.locator('.mk-crm-pattern');
  await expect(crm.getByRole('heading',{name:'Pulso comercial'})).toBeVisible();
  await expect(crm.locator('.mk-crm-metric')).toHaveCount(6);
  await expect(crm.locator('.mk-crm-chart-card')).toHaveCount(4);
  await expect(crm.getByRole('img',{name:/Tendencia de/})).toHaveCount(3);
  await expect(crm.getByRole('img',{name:/Oportunidades creadas/})).toHaveCount(1);
  await expect(crm.getByRole('img',{name:/Evolución de días/})).toHaveCount(1);
  await expect(crm.getByRole('img',{name:/Pronóstico ponderado/})).toHaveCount(1);
  await expect(crm.getByRole('img',{name:/Embudo de oportunidades/})).toHaveCount(1);
  await expect(crm.locator('.mk-app-shell-header')).toHaveCount(0);
  assert.equal(await crm.locator('.mk-app-shell-navigation').isVisible(),false,'Desktop CRM must not leave an empty navigation strip.');
  await expect(crm.getByLabel('Buscar en CRM')).toBeVisible();
  await expect(crm.getByRole('button',{name:'Notificaciones',exact:true})).toBeVisible();
  await expect(crm.getByRole('button',{name:'Invitar',exact:true})).toBeVisible();
  assert.ok(await crm.locator('.mk-crm-content-search').evaluate(node=>{const search=node.getBoundingClientRect(),nav=node.parentElement.getBoundingClientRect();return Math.abs((search.left+search.width/2)-(nav.left+nav.width/2))<=1;}),'CRM search must be centered in the navbar.');
  const topBars=await crm.locator('.mk-crm-workspace,.mk-crm-content-nav').evaluateAll(nodes=>nodes.map(node=>({top:Math.round(node.getBoundingClientRect().top),height:Math.round(node.getBoundingClientRect().height)})));
  assert.deepEqual(topBars,[{top:topBars[0].top,height:64},{top:topBars[0].top,height:64}],'Sidebar and content controls must share the first row.');
  assert.equal(await crm.locator('.mk-crm-sidebar-toggle').evaluate(node=>Math.round(node.getBoundingClientRect().left-node.closest('.mk-crm-content-nav').getBoundingClientRect().left)),16,'Sidebar control must stay close to the divider.');

  await crm.getByRole('button',{name:'Cerrar navegación lateral'}).click();
  await expect(crm.locator('.mk-crm-sidebar')).toHaveClass(/is-collapsed/);
  await expect(crm.locator('.mk-crm-sidebar nav').first()).toBeVisible();
  await expect(crm.locator('.mk-crm-sidebar nav').first().locator('a').first().locator('svg')).toBeVisible();
  assert.equal(await crm.locator('.mk-crm-sidebar nav').first().locator('a span').first().isVisible(),false,'Collapsed CRM navigation label remains visible.');
  await expect(crm.locator('.mk-crm-workspace .mk-crm-avatar')).toBeVisible();
  assert.equal(await crm.locator('.mk-app-shell-sidebar').evaluate(node=>Math.round(node.getBoundingClientRect().width)),72,'Collapsed CRM sidebar must become a 72px icon rail.');
  await expect(crm.getByRole('button',{name:'Abrir navegación lateral'})).toBeVisible();
  await crm.getByRole('button',{name:'Abrir navegación lateral'}).click();
  await expect(crm.locator('.mk-crm-sidebar')).not.toHaveClass(/is-collapsed/);
  await expect(crm.locator('.mk-crm-sidebar nav').first()).toBeVisible();

  await crm.getByLabel('Periodo',{exact:true}).selectOption('30');
  await expect(crm.locator('.mk-crm-metric').first()).toContainText('12 oportunidades');
  const before=await crm.locator('.mk-crm-metric').first().innerText();
  await crm.getByRole('button',{name:'Nueva oportunidad'}).click();
  const dialog=page.getByRole('dialog',{name:'Nueva oportunidad'});
  await dialog.getByRole('button',{name:'Añadir al pipeline'}).click();
  await expect(dialog.getByText('Escribe el nombre de la oportunidad.')).toBeVisible();
  await dialog.getByLabel('Nombre de la oportunidad').fill('Expansión Andina');
  await dialog.getByLabel('Valor estimado').fill('125000');
  await dialog.getByRole('button',{name:'Añadir al pipeline'}).click();
  await expect(crm.locator('.mk-alert')).toContainText('Expansión Andina se añadió al pipeline.');
  await expect(crm.locator('.mk-crm-metric').first()).not.toHaveText(before);
  await expect(crm.locator('.mk-crm-metric').first()).toContainText('13 oportunidades');

  const filter=crm.getByLabel('Filtrar navegación');
  await filter.fill('contactos');
  await expect(crm.locator('.mk-crm-sidebar nav a')).toHaveCount(4);
  await expect(crm.getByRole('link',{name:'Contactos'}).first()).toBeVisible();
  await filter.fill('sin coincidencias');
  await expect(crm.getByText('No hay coincidencias.',{exact:true})).toBeVisible();

  for(const theme of ['light','dark']){
    await page.locator('.mk-website').evaluate((node,value)=>node.dataset.theme=value,theme);
    await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
    const violations=await page.evaluate(async()=>(await axe.run(document.querySelector('.mk-crm-pattern'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.target)})));
    assert.deepEqual(violations,[],`${theme}: ${JSON.stringify(violations)}`);
  }

  await page.setViewportSize({width:390,height:844});await page.reload();
  await expect(crm.locator('.mk-crm-metric')).toHaveCount(6);
  assert.equal(await crm.locator('.mk-app-shell-sidebar').isVisible(),false,'Desktop sidebar must be replaced by mobile navigation.');
  await expect(crm.locator('.mk-crm-mobile-nav')).toBeVisible();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'CRM must not overflow the mobile viewport.');
  assert.equal(await crm.locator('.mk-crm-metrics').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),1);
  assert.deepEqual(errors,[]);
  console.log('CRM pattern: collapsible navigation, six metrics, four accessible charts, periods, opportunity creation, light/dark accessibility and mobile layout passed.');
}finally{await browser?.close();server.kill();}
