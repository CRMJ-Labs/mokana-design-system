import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import path from 'node:path';

const axe=path.resolve('node_modules/axe-core/axe.min.js');
const port=3052;
const base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Dashboard preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',error=>{clearTimeout(timer);reject(error);});server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Dashboard preview exited: ${code}`));});});
browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});

async function audit(theme){
  await page.goto(`${base}/patterns/dashboard`,{waitUntil:'networkidle'});
  await page.evaluate(value=>document.documentElement.dataset.theme=value,theme);
  await page.addScriptTag({path:axe});
  const result=await page.evaluate(()=>axe.run(document.querySelector('.mk-dashboard-pattern'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa']}}));
  if(result.violations.length)throw new Error(`${theme}: ${result.violations.map(item=>item.id).join(', ')}`);
}

await page.goto(`${base}/patterns/dashboard`,{waitUntil:'networkidle'});
if(await page.locator('.mk-dashboard-metric').count()!==4)throw new Error('The dashboard must expose four metrics.');
if(await page.locator('[role="img"]').count()<6)throw new Error('The dashboard charts need accessible names.');
if(await page.locator('.mk-dashboard-pattern .mk-app-shell-header').count())throw new Error('Dashboard still renders the obsolete global header.');
if(await page.locator('.mk-dashboard-pattern .mk-app-shell-navigation').isVisible())throw new Error('Dashboard leaves an empty desktop navigation strip.');
if(!await page.getByLabel('Buscar en el dashboard',{exact:true}).isVisible())throw new Error('Search is missing from the dashboard navbar.');
for(const label of ['Notificaciones','Invitar'])if(!await page.getByRole('button',{name:label,exact:true}).isVisible())throw new Error(`${label} is missing from the dashboard navbar.`);
if(Math.round(await page.locator('.mk-dashboard-content-nav').evaluate(node=>node.getBoundingClientRect().height))!==64)throw new Error('Dashboard navbar must remain 64px tall.');
if(!await page.locator('.mk-dashboard-content-search').evaluate(node=>{const search=node.getBoundingClientRect(),nav=node.parentElement.getBoundingClientRect();return Math.abs((search.left+search.width/2)-(nav.left+nav.width/2))<=1;}))throw new Error('Dashboard search is not centered in the navbar.');
await page.getByRole('button',{name:'Abrir menú de Karina Molina'}).click();
const userMenu=page.getByRole('dialog',{name:'Menú de Karina Molina'});
for(const label of ['Perfil','Configuración','Cerrar sesión'])if(!await userMenu.getByRole('button',{name:label,exact:true}).isVisible())throw new Error(`${label} is missing from the user menu.`);
for(const label of ['Sistema','Claro','Oscuro'])if(!await userMenu.getByRole('radio',{name:label,exact:true}).count())throw new Error(`${label} theme option is missing from the user menu.`);
await page.keyboard.press('Escape');
if(await userMenu.count())throw new Error('User menu does not close with Escape.');
await page.getByRole('button',{name:'Cerrar navegación lateral'}).click();
if(!await page.locator('.mk-dashboard-sidebar').evaluate(node=>node.classList.contains('is-collapsed')))throw new Error('The sidebar does not collapse into its rail.');
if(!await page.locator('.mk-dashboard-sidebar nav').first().isVisible())throw new Error('Collapsed dashboard navigation icons are hidden.');
if(!await page.locator('.mk-dashboard-sidebar nav').first().locator('a svg').first().isVisible())throw new Error('Collapsed dashboard navigation icon is hidden.');
if(await page.locator('.mk-dashboard-sidebar nav').first().locator('a span').first().isVisible())throw new Error('Collapsed dashboard navigation label remains visible.');
if(!await page.locator('.mk-dashboard-user-trigger .mk-dashboard-avatar').isVisible())throw new Error('Collapsed dashboard user avatar is hidden.');
if(await page.locator('.mk-dashboard-user-copy').isVisible())throw new Error('Collapsed dashboard user details remain visible.');
if(Math.round(await page.locator('.mk-dashboard-pattern .mk-app-shell-sidebar').evaluate(node=>node.getBoundingClientRect().width))!==72)throw new Error('Collapsed dashboard sidebar is not a 72px icon rail.');
await page.getByRole('button',{name:'Abrir navegación lateral'}).click();
if(await page.locator('.mk-dashboard-sidebar').evaluate(node=>node.classList.contains('is-collapsed')))throw new Error('The sidebar does not open again.');
await page.getByRole('button',{name:'Gastos',exact:true}).click();
if(await page.getByRole('button',{name:'Gastos',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('Dashboard tabs do not update.');
await page.getByLabel('Periodo',{exact:true}).selectOption('year');
if(!await page.getByText('Este año',{exact:true}).count())throw new Error('The selected period is not reflected in analytics.');

await page.getByRole('button',{name:'Invitar colaborador'}).click();
await page.getByRole('button',{name:'Enviar invitación'}).click();
if(!await page.getByText('Escribe el nombre del colaborador.').count())throw new Error('Invite validation is missing.');
await page.getByLabel('Nombre completo').fill('Sofía Mendoza');
await page.getByLabel('Correo electrónico').fill('sofia@mok.example');
await page.getByRole('button',{name:'Enviar invitación'}).click();
if(!await page.getByText('Sofía Mendoza',{exact:true}).count())throw new Error('Invited collaborator was not added.');
await page.getByLabel('Buscar colaboradores').fill('Sofía');
if(await page.locator('.mk-table-data-row').count()!==1)throw new Error('Employee search does not filter rows.');

await audit('light');
await audit('dark');
await page.setViewportSize({width:390,height:844});
await page.goto(`${base}/patterns/dashboard`,{waitUntil:'networkidle'});
const mobile=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth>innerWidth,
  sidebar:getComputedStyle(document.querySelector('.mk-app-shell-sidebar')).display,
  mobileNav:getComputedStyle(document.querySelector('.mk-dashboard-mobile-nav')).display,
  metricColumns:getComputedStyle(document.querySelector('.mk-dashboard-metrics')).gridTemplateColumns.split(' ').length,
}));
if(mobile.overflow||mobile.sidebar!=='none'||mobile.mobileNav==='none'||mobile.metricColumns!==1)throw new Error(`Mobile layout failed: ${JSON.stringify(mobile)}`);

console.log('Dashboard pattern: metrics, tabs, periods, invite flow, search, accessibility and responsive layout passed.');
}finally{await browser?.close();server.kill();}
