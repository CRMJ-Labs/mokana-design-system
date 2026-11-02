import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3015'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3015')){clearTimeout(timeout);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:3015/components/error');
  assert.equal(await page.locator('#no-label .mk-error-label').count(),0);
  assert.equal(await page.locator('#custom-label .mk-error-label').textContent(),'Error de conexión:');
  assert.match(await page.locator('#error-property .mk-error').first().textContent(),/La solicitud falló/);
  assert.deepEqual(await page.locator('#sizes .mk-error').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).fontSize)),['12px','13px','14px']);
  await page.locator('#error-property .mk-error a').click();
  assert.ok(page.url().endsWith('/components/error-card'));
  const recovery=page.locator('#recovery');
  await recovery.getByText('Detalles del error',{exact:true}).click();
  assert.equal(await recovery.locator('.mk-error-card-details').getAttribute('open'),'');
  assert.equal(await recovery.locator('code').first().textContent(),'req_mok_demo_7f2a');
  await recovery.getByRole('button',{name:'Volver a intentar'}).click();
  assert.equal(await recovery.getByRole('button',{name:'Reintentando…'}).isDisabled(),true);
  assert.equal(await recovery.locator('[aria-live]').getAttribute('aria-busy'),'true');
  await recovery.getByRole('button',{name:'Reiniciar ejemplo'}).waitFor();
  assert.equal(await recovery.locator('.mk-error-recovered').evaluate(node=>node===document.activeElement),true);
  assert.equal(await recovery.locator('[aria-live]').getAttribute('aria-busy'),'false');
  await recovery.getByRole('button',{name:'Reiniciar ejemplo'}).click();
  await recovery.getByRole('button',{name:'Volver a intentar'}).waitFor();
  for(const slug of ['error','error-card']){
    await page.goto(`http://localhost:3015/components/${slug}`);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`verification/${slug}-${width}-${theme}.png`,fullPage:true});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Error and Error Card: labels, sizes, messages, links, details, retry, loading lock, focus, mobile and both themes passed.');
}finally{await browser?.close();server.kill();}
