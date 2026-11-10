import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {testInvoiceStates} from './test-invoice-states.mjs';

const port=3048,base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Invoice preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${base}/examples/invoice-review`);
  await page.getByRole('heading',{name:'Ningbo Zhongtai Hardware Trading Co., Ltd.',exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);mkdirSync('verification',{recursive:true});
  await testInvoiceStates(page);

  for(const width of [390,768,1280,1920]){
    await page.setViewportSize({width,height:1000});await page.reload();
    await page.getByRole('heading',{name:'Ningbo Zhongtai Hardware Trading Co., Ltd.',exact:true}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: document overflow`);
    for(const name of ['Historial','Exportar']){
      const action=page.getByRole('button',{name,exact:true});await expect(action).toBeVisible();
      const bounds=await action.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,`${width}: ${name} outside the viewport`);
    }
    await page.screenshot({path:`verification/invoice-review-${width}.png`,animations:'disabled'});
    if(width===390){
      const trigger=page.getByRole('button',{name:'Descripción de NZ-10051: Por revisar',exact:true}).filter({visible:true});
      await trigger.focus();await page.keyboard.press('Enter');
      const detail=page.getByRole('dialog',{name:'Descripción · Por revisar',exact:true});
      await expect(detail).toBeVisible();await expect(detail).toHaveCount(1);
      const bounds=await detail.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'Mobile review detail outside viewport');
      await page.keyboard.press('Escape');await expect(detail).not.toBeVisible();await expect(trigger).toBeFocused();
    }
    if(width<=1150){
      const toggle=page.getByRole('button',{name:'Ver documento',exact:true});
      await expect(toggle).toBeVisible();await toggle.click();await expect(page.locator('#invoice-document')).toBeVisible();
      await expect(page.getByRole('button',{name:'Ocultar documento',exact:true})).toHaveAttribute('aria-expanded','true');
    }
    if(width<=760){
      await page.getByRole('button',{name:'Abrir navegación',exact:true}).click();
      const menu=page.getByRole('dialog',{name:'Espacio de trabajo',exact:true});await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');await expect(menu).not.toBeVisible();
    }
  }
  await page.setViewportSize({width:1600,height:1050});
  await page.getByRole('button',{name:'Abrir otro PDF',exact:true}).click();
  const upload=page.getByRole('dialog',{name:'Consultar otro documento',exact:true});
  await upload.locator('input[type=file]').setInputFiles({name:'consulta.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n% Local display fixture\n%%EOF')});
  await expect(upload).not.toBeVisible();
  await expect(page.locator('iframe[title="consulta.pdf"]')).toBeVisible();
  assert.deepEqual(errors,[]);
  writeFileSync('verification/invoice-review.json',JSON.stringify({passed:true,items:520,fields:20,checks:['public MOK components','linked document selection','search and empty results','filters and pagination','six required columns','four per-cell states','real status filters','manual confirmations','failed total correction','edit provenance','immutable original document','local item editing','pending field completion','progress and approval gate','rules','history and Escape','CSV download','local approval','light and dark','390/768/1280/1920 responsive bounds','mobile document and navigation']},null,2));
  console.log('Invoice example: linked source, 520 items, search/filter/pagination, edits, validation, approval, history, export, both themes and responsive layouts passed.');
}finally{await browser?.close();server.kill();}
