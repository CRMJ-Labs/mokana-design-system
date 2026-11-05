import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const port=3037;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Select preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview exited: ${code}`));});
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/table`);
  const density=page.getByLabel('Densidad');
  await density.waitFor();
  assert.equal(await page.evaluate(()=>CSS.supports('appearance','base-select')),true,'Edge must support the custom picker.');
  assert.equal(await density.evaluate(node=>getComputedStyle(node).appearance),'base-select');
  const before=await density.boundingBox();
  await density.click();
  assert.equal(await density.evaluate(node=>node.matches(':open')),true);
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await expect(density).toHaveValue('comfortable');
  await expect(page.locator('#variants .mk-table-root')).toHaveClass(/density-comfortable/);
  const after=await density.boundingBox();assert.equal(after.width,before.width,'Changing the selected label must not resize the control.');
  await density.click();await page.keyboard.press('ArrowUp');await page.keyboard.press('Escape');
  await expect(density).toHaveValue('comfortable');
  await expect(density).toBeFocused();

  mkdirSync('verification',{recursive:true});
  for(const width of [1280,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.locator('.mk-website').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
    await density.scrollIntoViewIfNeeded();await density.click();
    assert.equal(await density.evaluate(node=>node.matches(':open')),true);
    const style=await density.evaluate(node=>{
      const picker=getComputedStyle(node,'::picker(select)');
      return {radius:picker.borderRadius,shadow:picker.boxShadow,background:picker.backgroundColor,surface:getComputedStyle(node).getPropertyValue('--surface').trim()};
    });
    assert.equal(style.radius,'12px');assert.notEqual(style.shadow,'none');
    const normal=density.getByRole('option',{name:'Normal',exact:true});
    await expect(normal).toBeVisible();
    const optionBounds=await normal.boundingBox();
    assert.ok(optionBounds.x>=0&&optionBounds.x+optionBounds.width<=width,`Picker outside viewport: ${JSON.stringify(optionBounds)}`);
    await page.screenshot({path:`verification/select-${width}-${theme}.png`,animations:'disabled'});
    await page.keyboard.press('Escape');
  }

  await page.goto(`http://127.0.0.1:${port}/components/select`);
  const status=page.locator('#default').getByLabel('Estado',{exact:true});
  await status.click();await status.getByRole('option',{name:'Listo',exact:true}).click();
  await expect(status).toHaveValue('ready');
  await expect(page.locator('#default [role=status]')).toContainText('Listo');
  const locked=page.getByLabel('Estado bloqueado',{exact:true});
  await expect(locked).toBeDisabled();
  await expect(page.getByLabel('Estado del despliegue',{exact:true})).toHaveAttribute('aria-invalid','true');
  assert.deepEqual(errors,[]);
  console.log('Selects: themed native picker, keyboard, Escape, focus, stable width, mobile, light/dark and controlled selection verified.');
}finally{await browser?.close();server.kill();}
