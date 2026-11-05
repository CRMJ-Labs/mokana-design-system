import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const port=3050;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Combobox preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1000,height:800}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));

  await page.goto(`http://127.0.0.1:${port}/components/combobox`);
  const combos=page.locator('.mk-combobox');
  await expect(combos).toHaveCount(3);
  for(const combo of await combos.all()){
    await expect(combo.locator('input[role=combobox]')).toHaveCount(1);
    await expect(combo.locator('datalist')).toHaveCount(0);
    await expect(combo.locator('.mk-combobox-chevron')).toHaveCount(1);
    await expect(combo.locator('svg')).toHaveCount(1);
    const indicator=await combo.locator('input').evaluate(node=>({padding:parseFloat(getComputedStyle(node).paddingRight),appearance:getComputedStyle(node).appearance}));
    assert.ok(indicator.padding>=32,'Combobox must reserve space for the MOK chevron.');
    assert.equal(indicator.appearance,'none','Native input appearance must not add a second indicator.');
  }
  const first=page.locator('#default .mk-combobox');
  await first.locator('input').click();
  const listbox=first.getByRole('listbox');
  await expect(listbox).toBeVisible();
  const sizes=await first.evaluate(node=>{const input=node.querySelector('input').getBoundingClientRect(),list=node.querySelector('[role=listbox]').getBoundingClientRect();return {inputWidth:input.width,listWidth:list.width,inputLeft:input.left,listLeft:list.left};});
  assert.ok(Math.abs(sizes.inputWidth-sizes.listWidth)<.5,JSON.stringify(sizes));
  assert.ok(Math.abs(sizes.inputLeft-sizes.listLeft)<.5,JSON.stringify(sizes));
  await first.locator('input').press('Escape');
  await expect(listbox).toHaveCount(0);
  const controlled=page.locator('#controlled .mk-combobox input');
  await controlled.fill('Equipo');
  await expect(page.locator('#controlled').getByRole('option')).toHaveCount(2);
  await controlled.press('ArrowDown');await controlled.press('Enter');
  await expect(page.locator('#controlled').getByRole('status')).toHaveText('Propietario: Equipo MOK');
  const disabled=page.locator('#disabled .mk-combobox input');
  await expect(disabled).toBeDisabled();
  await expect(page.locator('#disabled').getByRole('listbox')).toHaveCount(0);

  await page.goto(`http://127.0.0.1:${port}/components/multi-select`);
  const multi=page.locator('.mk-multi-select-trigger').first();
  await expect(multi.locator('.mk-multi-select-chevron')).toHaveCount(1);
  await expect(multi.locator('svg')).toHaveCount(1);
  assert.deepEqual(errors,[]);
  console.log('Combobox: one MOK chevron, popup matches input width, filtering and keyboard selection work; MultiSelect keeps one chevron.');
}finally{await browser?.close();server.kill();}
