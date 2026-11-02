import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from '@playwright/test';

const port=3023;
const base=`http://127.0.0.1:${port}`;
const mapping=JSON.parse(fs.readFileSync(new URL('../figma-map.json',import.meta.url)));
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();
  await page.goto(`${base}/introduction`);
  const routes=await page.locator('#website-navigation a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname));
  const known=new Set(routes);
  let checked=0;
  for(const route of routes){
    await page.goto(base+route);
    await page.locator('#main-content > div > :not(.mk-catalog-loading)').first().waitFor();
    assert.equal(await page.getByRole('heading',{name:'Página no encontrada'}).count(),0,`${route} no existe`);
    const links=await page.locator('#main-content a[href]').evaluateAll(nodes=>nodes.map(node=>({href:node.href,hash:node.getAttribute('href').startsWith('#')?node.getAttribute('href').slice(1):null})));
    for(const {href,hash} of links){
      const url=new URL(href);
      if(url.origin!==base)continue;
      checked++;
      if(hash)assert.equal(await page.evaluate(id=>!!document.getElementById(id),hash),true,`${route}: falta el ancla #${hash}`);
      else assert.ok(known.has(url.pathname),`${route}: enlace roto a ${url.pathname}`);
    }
  }
  for(const item of mapping.components){
    assert.ok(fs.existsSync(new URL(`../${item.source}`,import.meta.url)),`Falta ${item.source} para ${item.name}`);
    const figma=new URL(item.figmaUrl);
    assert.equal(figma.hostname,'www.figma.com');
    assert.ok(figma.pathname.startsWith('/design/'));
  }
  for(const asset of ['/brand/isotipo.svg','/demo/mok-loop.webm'])assert.equal((await page.request.get(base+asset)).status(),200,asset);
  console.log(`${routes.length} rutas, ${checked} enlaces internos, ${mapping.components.length} asociaciones Figma y los recursos públicos verificados.`);
}finally{await browser?.close();server.kill();}
