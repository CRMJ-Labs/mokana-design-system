import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const port=3036;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',chunk=>{if(chunk.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview exited: ${code}`));});
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://localhost:${port}/components/input-file`);
  await page.locator('.mk-api-reference').waitFor();
  await expect(page.locator('#api-InputFile')).toBeVisible();
  const input=id=>page.locator(`#${id} input[type=file]`);
  const file=(name,mimeType='text/plain')=>({name,mimeType,buffer:Buffer.from('MOK file selection')});
  const names=locator=>locator.evaluate(node=>Array.from(node.files??[],file=>file.name));

  const basic=input('default');
  assert.equal(await basic.getAttribute('name'),'document');
  const helpId=await basic.getAttribute('aria-describedby');
  await expect(page.locator(`[id="${helpId}"]`)).toHaveText('Selecciona un archivo de tu equipo.');
  await basic.setInputFiles(file('diseño del proyecto — versión final.txt'));
  assert.deepEqual(await names(basic),['diseño del proyecto — versión final.txt']);
  await basic.focus();
  const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.keyboard.press('Space')]);
  assert.equal(chooser.isMultiple(),false);
  await chooser.setFiles(file('resumen del proyecto con un nombre suficientemente largo para probar el campo en móvil.txt'));

  const dropzone=input('dropzone');
  assert.equal(await dropzone.getAttribute('accept'),'.pdf,image/*');
  await expect(page.locator('#dropzone .mk-input-file-dropzone')).toContainText('Adjuntar documento');
  await expect(page.locator('#dropzone .mk-input-file-dropzone')).toContainText('PDF o imagen, máximo definido por la aplicación');
  await dropzone.setInputFiles(file('documento.pdf','application/pdf'));
  assert.deepEqual(await names(dropzone),['documento.pdf']);
  await dropzone.focus();
  await expect(dropzone).toBeFocused();

  await input('multiple').setInputFiles([file('uno.txt'),file('dos.pdf','application/pdf')]);
  assert.deepEqual(await names(input('multiple')),['uno.txt','dos.pdf']);
  assert.equal(await input('accept').getAttribute('accept'),'.pdf,application/pdf');
  assert.equal(await input('disabled').isDisabled(),true);
  const sizes=await page.locator('#sizes input').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
  assert.deepEqual(sizes,[36,44,48]);

  const invalid=input('error');
  assert.equal(await invalid.getAttribute('aria-invalid'),'true');
  const errorId=await invalid.getAttribute('aria-describedby');
  await expect(page.locator(`[id="${errorId}"]`)).toContainText('El archivo supera el límite de 5 MB.');
  await expect(page.locator('#error')).not.toContainText('Esta ayuda se sustituye por el error.');
  await invalid.focus();
  assert.deepEqual(await invalid.evaluate(node=>{const style=getComputedStyle(node);return [style.borderTopWidth,style.outlineWidth];}),['2px','0px']);

  const form=page.locator('#form form'),native=input('form'),status=page.locator('#form [role=status]');
  assert.equal(await native.getAttribute('aria-describedby'),'input-file-local-note');
  assert.equal(await page.locator('#input-file-form-field').locator('input').count(),1);
  assert.equal(await native.evaluate(node=>node.validity.valueMissing),true);
  await form.getByRole('button',{name:'Preparar archivos'}).click();
  await expect(native).toBeFocused();
  await native.setInputFiles([file('contrato.pdf','application/pdf'),file('resumen.txt')]);
  await expect(status).toContainText('Seleccionados: contrato.pdf, resumen.txt');
  await native.dispatchEvent('cancel');
  await expect(status).toContainText('Seleccionados: contrato.pdf, resumen.txt');
  assert.deepEqual(await native.evaluate(node=>new FormData(node.form).getAll('documents').map(file=>file.name)),['contrato.pdf','resumen.txt']);
  await form.getByRole('button',{name:'Preparar archivos'}).click();
  await expect(status).toContainText('Preparados: contrato.pdf, resumen.txt.');
  await form.getByRole('button',{name:'Restablecer',exact:true}).click();
  assert.deepEqual(await names(native),[]);
  await expect(status).toHaveText('Sin archivos seleccionados.');
  await form.getByRole('button',{name:'Enfocar archivo'}).click();
  await expect(native).toBeFocused();

  for(const width of [1440,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=>{
      const result=await axe.run(document.querySelector('#main-content'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
      return result.violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.html)}));
    });
    assert.deepEqual(violations,[],`${width}px ${theme}: accessibility`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'no horizontal page overflow');
    await page.locator('#default').screenshot({path:`verification/input-file-${width}-${theme}.png`});
    await page.locator('#dropzone').screenshot({path:`verification/input-file-dropzone-${width}-${theme}.png`});
  }
  await page.locator('#sizes').evaluate(node=>node.dir='rtl');
  assert.equal(await page.locator('#sizes input').first().evaluate(node=>getComputedStyle(node).direction),'rtl');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);
  console.log('InputFile: native selection, keyboard chooser, multiple, Unicode, accept, sizes, errors, disabled, required, FormData, reset, refs, themes, RTL, mobile and accessibility passed.');
}finally{await browser?.close();server.kill();}
