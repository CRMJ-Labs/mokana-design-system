import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3020'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3020')){clearTimeout(timeout);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];const posts=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()==='POST')posts.push(request.url());});
  const goto=slug=>page.goto(`http://localhost:3020/components/${slug}`);
  await goto('entity');
  await page.locator('#list').getByRole('button',{name:'Revocar sesión'}).first().click();
  await expect(page.locator('#list').getByRole('status')).toHaveText('2 sesiones activas');
  await page.locator('#list').getByRole('button',{name:'Reiniciar lista'}).click();
  await expect(page.locator('#list').getByRole('status')).toHaveText('3 sesiones activas');
  await page.locator('#checkbox').getByRole('checkbox').first().check();
  await expect(page.locator('#checkbox').getByRole('status')).toHaveText('1 sesiones seleccionadas');
  await expect(page.locator('#skeleton [aria-busy]')).toHaveAttribute('aria-busy','true');
  await goto('feedback');
  const trigger=page.locator('#default').getByRole('button');await trigger.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Enviar comentario'})).toBeDisabled();
  await dialog.getByRole('radio',{name:'Satisfecho',exact:true}).check();
  await dialog.getByRole('textbox').fill('Componentes claros y consistentes');
  await dialog.getByRole('button',{name:'Enviar comentario'}).click();await expect(dialog).not.toBeVisible();
  assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  await expect(page.locator('.mk-structured-feedback').getByRole('status')).toHaveText('Comentarios guardados en esta página: 1');
  await page.locator('#metadata').getByRole('button').click();await dialog.getByRole('textbox').fill('Revisar ejemplos de accesibilidad');
  await dialog.getByRole('button',{name:'Enviar comentario'}).click();await expect(dialog).not.toBeVisible();
  await page.getByText('Ver último resultado de demostración').click();
  assert.deepEqual(JSON.parse(await page.locator('.mk-feedback-result').textContent()).metadata,{route:'/components/feedback',build:'mok-demo'});
  await page.locator('#select').getByRole('button').click();await dialog.getByRole('textbox').fill('Añadir más ejemplos');
  await expect(dialog.getByRole('button',{name:'Enviar comentario'})).toBeDisabled();
  await dialog.getByRole('combobox').selectOption('docs');await expect(dialog.getByRole('button',{name:'Enviar comentario'})).toBeEnabled();
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  const retry=page.locator('#error');await retry.getByRole('textbox').fill('Conservar este comentario');await retry.getByRole('button',{name:'Enviar comentario'}).click();
  await expect(retry.getByText('No se pudo guardar tu comentario. Vuelve a intentarlo.')).toBeVisible();
  await expect(retry.getByRole('textbox')).toHaveValue('Conservar este comentario');
  await retry.getByRole('button',{name:'Enviar comentario'}).click();await expect(retry.getByRole('status')).toHaveText('Comentario enviado');
  assert.deepEqual(posts,[]);
  await goto('fieldset');
  const settings=page.locator('#default');
  await expect(settings.getByRole('group',{name:'Configuración del equipo'})).toBeVisible();
  await settings.getByRole('textbox',{name:'Nombre del equipo'}).fill('Diseño MOK');
  await settings.getByRole('button',{name:'Guardar cambios'}).click();await expect(page.getByRole('status')).toHaveText('Nombre guardado: Diseño MOK');
  await expect(page.locator('#disabled').getByRole('textbox')).toBeDisabled();
  await expect(page.locator('#disabled').getByRole('button')).toBeDisabled();
  const blocked=page.locator('#disabled-wall .mk-fieldset-controls a');await blocked.evaluate(node=>node.focus());
  assert.equal(await blocked.evaluate(node=>node===document.activeElement),false);
  await goto('file-tree');
  const tree=page.locator('#default').getByRole('tree');
  const src=tree.getByRole('treeitem',{name:'src',exact:true});await src.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.nodeId),'components');
  await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.nodeId),'button');
  await page.keyboard.press('Enter');await expect(page.getByRole('status')).toHaveText('Archivo seleccionado: Button.tsx');
  await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>document.activeElement.dataset.nodeId),'components');
  await page.keyboard.press('ArrowLeft');await expect(tree.getByRole('treeitem',{name:'components',exact:true})).toHaveAttribute('aria-expanded','false');
  await expect(tree.getByRole('treeitem',{name:'Button.tsx',exact:true})).toHaveCount(0);
  await page.keyboard.press('End');assert.equal(await page.evaluate(()=>document.activeElement.dataset.nodeId),'readme');
  await page.keyboard.press('Home');await page.keyboard.press('p');assert.equal(await page.evaluate(()=>document.activeElement.dataset.nodeId),'public');
  assert.equal(await tree.locator('[role=treeitem][tabindex="0"]').count(),1);
  await tree.getByRole('treeitem',{name:'README.md',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/introduction$/);
  for(const slug of ['entity','feedback','fieldset','file-tree']){
    await goto(slug);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      if(slug==='feedback')await page.locator('#default').getByRole('button').click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug);
      if(slug==='feedback'){
        const rect=await page.getByRole('dialog').boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=width&&rect.y+rect.height<=1000);
      }
      await page.screenshot({path:`verification/${slug}-${width}-${theme}.png`,fullPage:slug!=='feedback',animations:'disabled'});
      if(slug==='feedback')await page.keyboard.press('Escape');
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Entity, Feedback, Fieldset and File Tree: actions, selection, local payload, metadata, retry, disabled/inert controls, tree keyboard, links, mobile and themes passed.');
}finally{await browser?.close();server.kill();}
