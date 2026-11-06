import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const variants=[['primary','Primary','button-primary-background','button-primary-text','accent-hover'],['secondary','Secondary','button-secondary-background','button-secondary-text','default-hover'],['tertiary','Tertiary','default','default-foreground','default-hover'],['outline','Outline',null,'default-foreground','default-soft-hover'],['ghost','Ghost',null,'default-foreground','default'],['danger','Danger','error-text','error-on-solid','raw:color-mix(in oklab,var(--error-text) 90%,var(--background) 10%)'],['danger-soft','Danger Soft','danger-soft','danger-soft-foreground','danger-soft-hover']];
const port=3042;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port)],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Button preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',error=>{clearTimeout(timer);reject(error);});});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/button`);
  await page.locator('#variants').waitFor();
  await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
  await page.evaluate(()=>document.fonts.ready);
  const roleColor=(role,property='backgroundColor')=>page.evaluate(({role,property})=>{const probe=document.createElement('span');probe.style[property]=role?(role.startsWith('raw:')?role.slice(4):`var(--${role})`):'transparent';document.querySelector('.mk-website').append(probe);const value=getComputedStyle(probe)[property];probe.remove();return value;},{role,property});
  const appearance=locator=>locator.evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,color:style.color,border:style.borderColor};});
  mkdirSync('verification',{recursive:true});
  for(const theme of ['light','dark']){
    await page.locator('.mk-docs-header').getByRole('radio',{name:theme==='light'?'Claro':'Oscuro',exact:true}).check();
    for(const [variant,label,background,foreground,hover]of variants){
      const button=page.locator('#variants').getByRole('button',{name:label,exact:true});
      await page.mouse.move(0,0);
      const normal=await appearance(button);
      assert.equal(normal.background,await roleColor(background),`${theme} ${variant} background`);
      assert.equal(normal.color,await roleColor(foreground,'color'),`${theme} ${variant} foreground`);
      assert.equal(normal.border,await roleColor(variant==='outline'?'border':null,'borderColor'),`${theme} ${variant} border`);
      const link=page.locator('#link').getByRole('link',{name:label,exact:true});
      assert.deepEqual(await appearance(link),normal,`${theme} ${variant}: ButtonLink parity`);
      await button.hover();assert.equal((await appearance(button)).background,await roleColor(hover),`${theme} ${variant} hover`);
      await page.mouse.down();
      assert.equal((await appearance(button)).background,await roleColor(variant==='outline'?'default':hover),`${theme} ${variant} pressed`);
      await page.mouse.move(0,0);await page.mouse.up();
      const disabled=page.locator('#disabled-variants').getByRole('button',{name:label,exact:true});
      await expect(disabled).toBeDisabled();await disabled.hover();
      assert.equal((await appearance(disabled)).background,normal.background,`${theme} ${variant}: disabled hover`);
      const busy=page.locator('#loading').getByRole('button',{name:label,exact:true});
      await expect(busy).toHaveAttribute('aria-busy','true');await expect(busy).toHaveAttribute('aria-disabled','true');
      await expect(busy.locator('.mk-spinner')).toHaveCount(1);
      await busy.hover();assert.equal((await appearance(busy)).background,normal.background,`${theme} ${variant}: pending hover`);
      await page.keyboard.press('Tab');await button.focus();await expect(button).toBeFocused();assert.notEqual(await button.evaluate(node=>getComputedStyle(node).outlineStyle),'none');
    }
    const custom=page.locator('#custom .mk-button-custom');
    await page.mouse.move(0,0);assert.equal((await appearance(custom)).background,await roleColor('surface-tertiary'));
    await custom.hover();assert.equal((await appearance(custom)).background,await roleColor('default'));
    const legacy=page.locator('#legacy .mk-button-error');
    await page.mouse.move(0,0);assert.deepEqual(await appearance(legacy),await appearance(page.locator('#variants .mk-button-danger-soft')));
    await page.keyboard.press('Tab');
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${width}: horizontal overflow`);
      await page.locator('#variants').screenshot({path:`verification/button-variants-${theme}-${width}.png`,animations:'disabled'});
    }
    await page.setViewportSize({width:1280,height:1000});
  }
  await page.mouse.move(0,0);
  await page.locator('.mk-website').evaluate(root=>{root.style.setProperty('--button-secondary-background','var(--success)');root.style.setProperty('--button-secondary-text','var(--success-foreground)');});
  const overridden=await appearance(page.locator('#variants .mk-button-secondary'));
  assert.equal(overridden.background,await roleColor('success'));
  assert.equal(overridden.color,await roleColor('success-foreground','color'));
  assert.deepEqual(await appearance(page.locator('#link .mk-button-secondary')),overridden);
  await page.locator('.mk-website').evaluate(root=>{root.style.removeProperty('--button-secondary-background');root.style.removeProperty('--button-secondary-text');});
  await page.locator('#sizes').getByRole('button',{name:'Continuar',exact:true}).first().focus();await page.keyboard.press('Space');
  await expect(page.locator('#sizes [role=status]')).toHaveText('1 acciones realizadas');
  await page.keyboard.press('Enter');await expect(page.locator('#sizes [role=status]')).toHaveText('2 acciones realizadas');
  await page.locator('#link').getByRole('link',{name:'Tertiary',exact:true}).click();await expect(page).toHaveURL(/\/components\/avatar$/);
  await page.goto(`http://127.0.0.1:${port}/components/table`);
  const pagination=page.locator('#default .mk-data-table-pagination');
  const next=pagination.getByRole('button',{name:'Página siguiente',exact:true});
  await next.waitFor();await expect(next.locator('[data-icon="chevron-right"]')).toHaveCount(1);
  assert.equal((await next.boundingBox()).height,32,'Table pagination uses the shared desktop small size.');
  await next.click();await expect(pagination).toContainText('Página 2 de 2');
  await page.setViewportSize({width:390,height:1000});
  assert.equal((await next.boundingBox()).height,36,'Table pagination uses the shared mobile small size.');
  assert.deepEqual(errors,[]);
  console.log('Buttons: all 7 variants, ButtonLink parity, hover/pressed/focus, disabled/loading, custom colors, legacy aliases, native keyboard, navigation and responsive light/dark views passed.');
}finally{await browser?.close();server.kill();}
