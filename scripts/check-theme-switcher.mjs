import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3016'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3016')){clearTimeout(timeout);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({colorScheme:'light'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:3016/components/theme-switcher');
  const root=page.locator('.mk-website');
  const demo=page.locator('#default');
  await expect(demo.getByRole('radio',{name:'Sistema',exact:true})).toBeChecked();
  await expect(root).toHaveAttribute('data-theme','light');
  await demo.getByRole('radio',{name:'Oscuro',exact:true}).check();
  await expect(root).toHaveAttribute('data-theme','dark');
  assert.equal(await page.evaluate(()=>localStorage.getItem('mok-theme')),'dark');
  await expect(page.locator('#small').getByRole('radio',{name:'Oscuro',exact:true})).toBeChecked();
  await page.reload();await expect(root).toHaveAttribute('data-theme','dark');
  await demo.getByRole('radio',{name:'Sistema',exact:true}).check();
  await page.emulateMedia({colorScheme:'dark'});await expect(root).toHaveAttribute('data-theme','dark');
  await page.emulateMedia({colorScheme:'light'});await expect(root).toHaveAttribute('data-theme','light');
  assert.equal(await page.evaluate(()=>localStorage.getItem('mok-theme')),'system');
  await demo.getByRole('radio',{name:'Sistema',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(demo.getByRole('radio',{name:'Claro',exact:true})).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(demo.getByRole('radio',{name:'Oscuro',exact:true})).toBeChecked();
  for(const radio of await page.locator('#disabled').getByRole('radio').all())await expect(radio).toBeDisabled();
  const other=await context.newPage();await other.goto(page.url());
  await other.locator('#default').getByRole('radio',{name:'Claro',exact:true}).check();
  await expect(root).toHaveAttribute('data-theme','light');await other.close();
  await page.locator('.mk-docs-header').getByRole('radio',{name:'Oscuro'}).check();
  await expect(demo.getByRole('radio',{name:'Oscuro',exact:true})).toBeChecked();
  await demo.getByRole('radio',{name:'Claro',exact:true}).check();
  await page.emulateMedia({colorScheme:'dark'});await expect(root).toHaveAttribute('data-theme','light');
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await demo.getByRole('radio',{name:theme==='light'?'Claro':'Oscuro',exact:true}).check();
    await expect(root).toHaveAttribute('data-theme',theme);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`verification/theme-switcher-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('Theme Switcher: selection, persistence, system changes, keyboard, disabled state, shared header, cross-tab sync, mobile and themes passed.');
}finally{await browser?.close();server.kill();}
