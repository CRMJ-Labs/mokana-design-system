import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const reference=JSON.parse(readFileSync('src/api-reference.generated.json','utf8'));
for(const name of ['Card','Alert','EmptyState','Input','Select','Checkbox','Switch','Modal','Drawer','Table','DataTable'])assert.ok(reference.find(entry=>entry.name===name),`${name}: missing API`);
assert.equal(reference.find(entry=>entry.name==='Card').props.find(prop=>prop.name==='tone').default,"'default'");
assert.equal(reference.find(entry=>entry.name==='Input').props.find(prop=>prop.name==='label').conditional,true);
assert.ok(reference.find(entry=>entry.name==='DataTable').props.some(prop=>prop.name==='selection'));

const port=3038;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Integration preview did not start')),20000);server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/integration`);await expect(page.getByRole('heading',{name:'Integración',exact:true})).toBeVisible();
  await expect(page.locator('#api-Card')).toBeVisible();
  await page.getByRole('searchbox',{name:'Buscar componente en la API'}).fill('Checkbox');
  await expect(page.locator('#api-Checkbox')).toBeVisible();await expect(page.locator('#api-Checkbox')).toContainText('onCheckedChange');
  await page.getByRole('searchbox',{name:'Buscar componente en la API'}).fill('not-a-component');await expect(page.getByRole('status',{name:''})).toContainText('No hay componentes');
  await page.getByRole('searchbox',{name:'Buscar componente en la API'}).fill('');await page.getByRole('combobox',{name:'Componente',exact:true}).selectOption('Input');await expect(page.locator('#api-Input')).toContainText('Según variante');
  mkdirSync('verification',{recursive:true});
  for(const width of [1440,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Integration overflow: ${width}`);
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=>(await window.axe.run(document.querySelector('#main-content'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations);
    assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    await page.screenshot({path:`verification/integration-${width}-${theme}.png`,fullPage:false});
  }
  for(const slug of ['card','input','switch','filter-params','table']){
    await page.goto(`http://127.0.0.1:${port}/components/${slug}`);await expect(page.locator('.mk-api-reference')).toBeVisible();
    await expect(page.locator('.mk-api-reference')).not.toContainText('Consulta los tipos exportados del componente');
  }
  assert.deepEqual(errors,[]);
  console.log(`Integration: ${reference.length} generated APIs, defaults, conditional requirements, inherited table props, aliases, search, catalog references, accessibility and mobile passed.`);
}finally{await browser?.close();server.kill();}
