import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const port=3026;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});const errors=[];
  page.on('pageerror',error=>errors.push(`${page.url()}: ${error.message}`));
  const open=async slug=>{await page.goto(`http://localhost:${port}/components/${slug}`);await page.locator('#main-content h1').waitFor();};

  await open('drawer');const opener=page.locator('#default').getByRole('button',{name:'Abrir panel'});
  await opener.click();const dialog=page.getByRole('dialog',{name:'Detalles del proyecto'});
  await expect(dialog).toBeVisible();assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  for(let index=0;index<7;index++)await page.keyboard.press('Tab');
  assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  assert.equal(await opener.evaluate(node=>node===document.activeElement),true);
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await opener.click();await page.mouse.click(2,2);await expect(dialog).not.toBeVisible();
  await page.locator('#left').getByRole('button').click();await expect(dialog).toHaveClass(/mk-drawer-dialog-left/);
  await dialog.getByRole('button',{name:'Cerrar panel'}).click();

  await open('tabs');const tabs=page.locator('#default');const first=tabs.getByRole('tab',{name:'Resumen'});
  await first.focus();await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab',{name:'Actividad'})).toHaveAttribute('aria-selected','true');
  await expect(tabs.getByRole('tabpanel')).toHaveText('Últimos cambios del equipo.');
  assert.equal(await tabs.locator('[role=tab][tabindex="0"]').count(),1);
  const association=await tabs.getByRole('tab',{name:'Actividad'}).getAttribute('aria-controls');
  assert.equal(await tabs.getByRole('tabpanel').getAttribute('id'),association);
  await page.keyboard.press('End');await expect(tabs.getByRole('tab',{name:'Ajustes'})).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Home');await expect(first).toHaveAttribute('aria-selected','true');
  await page.locator('#disabled').getByRole('tab',{name:'Perfil'}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#disabled').getByRole('tab',{name:'Seguridad'})).toBeFocused();

  await open('textarea');const textarea=page.locator('#default').getByRole('textbox',{name:'Descripción'});
  const initial=await textarea.inputValue();await textarea.fill('hello');
  await expect(page.locator('#default .mk-textarea-count')).toHaveText('5/240');
  await page.locator('#default').getByRole('button',{name:'Reiniciar texto'}).click();
  await expect(textarea).toHaveValue(initial);await expect(page.locator('#default .mk-textarea-count')).toHaveText(`${initial.length}/240`);
  await page.locator('#controlled').getByRole('textbox').fill('Equipo');
  await expect(page.locator('#controlled .mk-textarea-count')).toHaveText('6/120');
  await expect(page.locator('#controlled').getByRole('status')).toHaveText('6 caracteres en el estado');
  for(const description of (await textarea.getAttribute('aria-describedby')).split(' '))assert.equal(await page.evaluate(id=>!!document.getElementById(id),description),true);

  await open('empty-state');await page.locator('#default').getByRole('button',{name:'Crear proyecto'}).click();
  await expect(page.locator('#default').getByRole('status')).toHaveText('Proyecto creado en la demostración.');
  await page.locator('#default').getByRole('button',{name:'Reiniciar ejemplo'}).click();
  await expect(page.locator('#default').getByRole('button',{name:'Crear proyecto'})).toBeVisible();
  await open('radio');await page.locator('#default').getByRole('radio',{name:'Inicial',exact:true}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#default').getByRole('radio',{name:'Profesional',exact:true})).toBeChecked();
  await open('tooltip');const help=page.locator('#keyboard').getByRole('button');await help.focus();
  await expect(page.locator('#keyboard').getByRole('tooltip')).toBeVisible();
  await page.mouse.move(0,0);await expect(page.locator('#keyboard').getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('#keyboard').getByRole('tooltip')).not.toBeVisible();await expect(help).toBeFocused();

  await open('json-view');await expect(page.getByText('Importa JsonView desde @mokanadev/design-system.')).toBeVisible();
  const library=await import('../dist/mokana.js');assert.equal(typeof library.JsonView,'function');assert.equal(typeof library.Switch,'function');

  const slugs=['address-input','alert','card','combobox','drawer','empty-state','modal','pagination','progress','radio','select','skeleton','switch','table','tabs','textarea','toggle','tooltip'];
  for(const slug of slugs){
    await open(slug);assert.ok(await page.locator('.mk-code-disclosure').count()>=3,`${slug}: examples with code`);
    await expect(page.getByRole('heading',{name:'Uso y accesibilidad'})).toBeVisible();
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}: mobile overflow`);
    }
  }
  for(const slug of ['drawer','tabs','textarea','tooltip']){
    await open(slug);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      if(slug==='drawer')await page.locator('#default').getByRole('button').click();
      if(slug==='tooltip')await page.locator('#keyboard').getByRole('button').focus();
      await page.screenshot({path:`verification/core-${slug}-${width}-${theme}.png`,animations:'disabled'});
      if(slug==='drawer'||slug==='tooltip')await page.keyboard.press('Escape');
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Core components: Drawer focus/Escape/backdrop, Tabs keyboard/panels, Textarea counters/reset, working empty state, radio group, tooltip, imports and 18 documented responsive pages passed.');
}finally{await browser?.close();server.kill();}
