import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3019'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3019')){clearTimeout(timer);resolve();}});server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const goto=slug=>page.goto(`http://localhost:3019/components/${slug}`);
  await goto('destructive-confirmation-input');
  const field=page.locator('#default input');const confirm=page.locator('#default').getByRole('button');
  for(const value of ['MOK-site.com','mok-site.com ',' mok-site.com']){await field.fill(value);await expect(confirm).toBeDisabled();}
  await field.fill('mok-site.com');await expect(confirm).toBeEnabled();await confirm.click();
  await expect(page.locator('#default').getByRole('status')).toHaveText('Frase confirmada. No se modificó ningún recurso.');
  for(const [attribute,value] of Object.entries({translate:'no',lang:'zxx',dir:'ltr',autocomplete:'off',autocorrect:'off',autocapitalize:'none',spellcheck:'false'}))await expect(field).toHaveAttribute(attribute,value);
  await expect(page.locator('#error input')).toHaveAttribute('aria-invalid','true');
  await page.locator('#error input').fill('mok-design');await expect(page.locator('#error input')).toHaveAttribute('aria-invalid','false');
  await goto('destructive-action-modal');
  const trigger=page.locator('#default').getByRole('button');
  await trigger.click();const dialog=page.getByRole('dialog');const input=dialog.getByRole('textbox');const submit=dialog.getByRole('button',{name:'Eliminar proyecto',exact:true});
  await expect(dialog).toBeVisible();assert.equal(await input.evaluate(node=>node===document.activeElement),true);
  await input.fill('MOK-design');await input.press('Enter');await expect(dialog).toBeVisible();await expect(submit).toBeDisabled();
  await input.fill('mok-design');await expect(submit).toBeEnabled();
  for(let index=0;index<5;index++)await page.keyboard.press('Tab');
  assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
  await trigger.click();await expect(input).toHaveValue('');await page.mouse.click(2,2);await expect(dialog).not.toBeVisible();
  await page.locator('#reversible').getByRole('button').click();await expect(dialog.locator('.mk-destructive-band')).toHaveCount(0);await page.keyboard.press('Escape');
  await page.locator('#loading').getByRole('button').click();await input.fill('mok-design');await input.press('Enter');
  await expect(dialog).toHaveAttribute('aria-busy','true');await expect(submit).toBeDisabled();await expect(dialog.getByRole('button',{name:'Cancelar'})).toBeDisabled();
  await page.keyboard.press('Escape');await expect(dialog).toBeVisible();
  await expect(dialog).not.toBeVisible();
  await page.locator('#error').getByRole('button').click();await input.fill('mok-design');await expect(input).toHaveValue('mok-design');await expect(submit).toBeEnabled();await submit.click();
  await expect(dialog.getByText('No se pudo eliminar el proyecto. Vuelve a intentarlo.')).toBeVisible();
  await expect(input).toHaveValue('mok-design');assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  await submit.click();await expect(dialog).not.toBeVisible();
  await goto('dots-menu');
  const dots=page.locator('#default').getByRole('button');await dots.focus();await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');await page.keyboard.press('Enter');await expect(page.getByRole('status')).toHaveText('Archivar proyecto seleccionado.');
  assert.equal(await dots.evaluate(node=>node===document.activeElement),true);
  await expect(page.locator('#disabled').getByRole('button')).toBeDisabled();
  await page.locator('#disabled-item').getByRole('button').click();await page.keyboard.press('End');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Archivar proyecto');await page.keyboard.press('Escape');
  const sizes=await page.locator('#sizes .mk-menu>button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));
  assert.ok(sizes[0]<sizes[1]&&sizes[1]<sizes[2]);
  for(const slug of ['destructive-action-modal','destructive-confirmation-input','dots-menu']){
    await goto(slug);
    for(const width of [390,1280])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
      let overlay;
      if(slug==='destructive-action-modal'){await page.locator('#default').getByRole('button').click();overlay=page.getByRole('dialog');}
      if(slug==='dots-menu'){await page.locator('#default').getByRole('button').click();overlay=page.getByRole('menu');}
      if(overlay){await expect(overlay).toBeVisible();const rect=await overlay.boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=width&&rect.y+rect.height<=1000);}
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`verification/${slug}-${width}-${theme}.png`,animations:'disabled'});
      if(overlay)await page.keyboard.press('Escape');
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Destructive Modal/Input and Dots Menu: exact matching, translation guards, keyboard, focus, loading, retry, sizes, viewport bounds and themes passed.');
}finally{await browser?.close();server.kill();}
