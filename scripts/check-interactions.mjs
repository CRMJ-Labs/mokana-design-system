import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3018'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3018')){clearTimeout(timeout);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1280,height:1000}});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const goto=slug=>page.goto(`http://localhost:3018/components/${slug}`);
  await goto('copy-button');
  await page.locator('#default').getByRole('button',{name:'Copiar',exact:true}).click();
  await expect(page.locator('#default').getByRole('button',{name:'Copiado',exact:true})).toBeVisible();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'npm install @mokanadev/design-system');
  await expect(page.locator('#disabled').getByRole('button')).toBeDisabled();
  await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied');};});
  await page.locator('#custom-label').getByRole('button').click();
  await expect(page.locator('#custom-label').getByRole('status')).toHaveText('No se pudo copiar. Vuelve a intentarlo.');
  await goto('context-menu');
  const target=page.locator('#default .mk-context-target');
  await target.click({button:'right'});
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('d');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Duplicar proyecto');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Duplicar proyecto seleccionado.');
  assert.equal(await target.evaluate(node=>node===document.activeElement),true);
  await page.keyboard.press('Shift+F10');await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('menu')).toHaveCount(0);
  await target.dispatchEvent('pointerdown',{pointerType:'touch',clientX:120,clientY:400});
  await expect(page.getByRole('menu')).toBeVisible();
  await target.dispatchEvent('pointerup',{pointerType:'touch'});
  await page.keyboard.press('Escape');
  await page.locator('#disabled .mk-context-target').click({button:'right'});
  await page.keyboard.press('End');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Archivar proyecto');
  await page.keyboard.press('Escape');
  await page.locator('#default').getByRole('button',{name:'Acciones del proyecto'}).click();
  await expect(page.getByRole('menu')).toBeVisible();await page.keyboard.press('Escape');
  await goto('context-card');
  const cardTrigger=page.locator('#default').getByRole('button',{name:'Arriba',exact:true});
  await cardTrigger.hover();
  await expect(page.getByRole('region',{name:'Información del proyecto'})).toBeVisible();
  await page.getByRole('region',{name:'Información del proyecto'}).hover();
  await expect(page.getByRole('region',{name:'Información del proyecto'})).toBeVisible();
  await page.mouse.move(0,0);await expect(page.getByRole('region',{name:'Información del proyecto'})).toHaveCount(0);
  await cardTrigger.focus();await page.keyboard.press('Tab');
  assert.match(await page.evaluate(()=>document.activeElement.textContent),/Ver metadatos/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region',{name:'Información del proyecto'})).toHaveCount(0);
  assert.equal(await cardTrigger.evaluate(node=>node===document.activeElement),true);
  await goto('command-menu');
  const commandTrigger=page.locator('#default').getByRole('button',{name:'Abrir comandos'});
  await commandTrigger.click();
  const dialog=page.getByRole('dialog');const search=dialog.getByRole('combobox');
  await expect(dialog).toBeVisible();assert.equal(await search.evaluate(node=>node===document.activeElement),true);
  await search.fill('buscar');await page.keyboard.press('Enter');
  await expect(dialog.getByRole('heading',{name:'Proyectos',exact:true})).toBeVisible();
  await page.keyboard.press('Backspace');await expect(search).toHaveValue('buscar');
  await search.fill('no-existe');await expect(dialog.getByRole('status')).toHaveText('0 resultados');
  await search.fill('');await page.keyboard.press('End');await page.keyboard.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Invitar al equipo seleccionado.');
  assert.equal(await commandTrigger.evaluate(node=>node===document.activeElement),true);
  await page.keyboard.press('Control+k');await expect(dialog).toBeVisible();
  for(let index=0;index<5;index++)await page.keyboard.press('Tab');
  assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  for(const slug of ['copy-button','context-menu','context-card','command-menu']){
    await goto(slug);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      let overlay;
      if(slug==='context-menu'){
        const area=page.locator('#default .mk-context-target');await area.click({button:'right'});overlay=page.getByRole('menu');
      }else if(slug==='context-card'){
        await page.locator('#default').getByRole('button',{name:'Arriba',exact:true}).focus();overlay=page.getByRole('region',{name:'Información del proyecto'});
      }else if(slug==='command-menu'){
        await page.locator('#default').getByRole('button').click();overlay=page.getByRole('dialog');
      }
      if(overlay){await expect(overlay).toBeVisible();const bounds=await overlay.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=1000,slug);}
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`verification/${slug}-${width}-${theme}.png`,animations:'disabled'});
      if(overlay){await page.keyboard.press('Escape');await page.mouse.move(0,0);await page.locator('h1').click();}
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Copy Button, Context Menu, Context Card and Command Menu: clipboard, failure, touch, keyboard, focus, search, subpages, viewport bounds and themes passed.');
}finally{await browser?.close();server.kill();}
