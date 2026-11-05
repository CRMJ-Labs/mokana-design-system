import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3031'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3031')){clearTimeout(timeout);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [390,768,1280]){
    await page.setViewportSize({width,height:1000});
    await page.goto('http://localhost:3031/foundations/application-layout');
    const preview=page.locator('.mk-layout-preview');
    await expect(preview.getByRole('heading',{name:'Equipos'})).toBeVisible();
    await expect(preview.getByRole('button',{name:'Nuevo equipo'})).toBeVisible();
    await expect(preview.getByLabel('Estado')).toBeVisible();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`document overflow at ${width}px`);
    assert.equal(await preview.evaluate(node=>node.scrollWidth>node.clientWidth),false,`preview overflow at ${width}px`);
    const bounds=await preview.boundingBox();
    assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width,`preview outside viewport at ${width}px`);
    await preview.screenshot({path:`verification/application-layout-${width}.png`,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('Application layout: regions, controls and responsive overflow passed at 390, 768 and 1280 px.');
}finally{await browser?.close();server.kill();}
