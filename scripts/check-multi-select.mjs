import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3014'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3014')){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto('http://localhost:3014/components/multi-select');
  const focused=()=>page.evaluate(()=>{const node=document.activeElement;return `${node?.tagName}:${node?.getAttribute('aria-label')}`;});
  const panel=page.getByRole('dialog');
  const isFocused=locator=>locator.evaluate(node=>node===document.activeElement);

  // Trigger: stable name, summaries and smart actions.
  const actions=page.locator('#actions');
  const trigger=actions.getByRole('button',{name:/^Recursos/});
  assert.equal(await trigger.getAttribute('aria-haspopup'),'dialog');
  assert.match(await trigger.textContent(),/^2 seleccionados/);
  await trigger.focus();await page.keyboard.press('ArrowDown');
  assert.equal(await focused(),'INPUT:Design System');
  await page.keyboard.press('Space');assert.match(await trigger.textContent(),/^Componentes/);
  await page.keyboard.press('Enter');assert.match(await trigger.textContent(),/^2 seleccionados/);
  await page.keyboard.press('ArrowRight');assert.equal(await focused(),'BUTTON:Design System. Marcar todos');
  await page.keyboard.press('Enter');assert.match(await trigger.textContent(),/^Todos seleccionados/);
  assert.equal(await focused(),'BUTTON:Design System. Solo');
  await page.keyboard.press('Enter');assert.match(await trigger.textContent(),/^Design System/);
  assert.equal(await focused(),'BUTTON:Design System. Marcar todos');
  assert.equal(await panel.count(),1,'panel stays open while selecting');

  // Keyboard: rows keep their column, wrap, and Home/End reach the edges.
  await page.keyboard.press('ArrowDown');assert.equal(await focused(),'BUTTON:Componentes. Solo');
  await page.keyboard.press('ArrowLeft');assert.equal(await focused(),'INPUT:Componentes');
  await page.keyboard.press('End');assert.equal(await focused(),'INPUT:Tokens de diseño');
  await page.keyboard.press('ArrowDown');assert.equal(await focused(),'INPUT:Design System');
  await page.keyboard.press('ArrowUp');assert.equal(await focused(),'INPUT:Tokens de diseño');
  await page.keyboard.press('Home');assert.equal(await focused(),'INPUT:Design System');
  await page.keyboard.press('Escape');
  assert.equal(await panel.count(),0);assert.equal(await isFocused(trigger),true);
  await page.keyboard.press('ArrowUp');assert.equal(await focused(),'INPUT:Tokens de diseño');
  await page.keyboard.press('Tab');
  assert.equal(await panel.count(),0);assert.equal(await isFocused(trigger),false);

  // Mouse: checkbox toggles, name runs the action, outside click closes without moving focus back.
  await trigger.click();
  await panel.getByRole('checkbox',{name:'Tokens de diseño'}).click({force:true});
  assert.match(await trigger.textContent(),/^2 seleccionados/);
  await panel.getByRole('button',{name:'Componentes. Solo'}).click();
  assert.match(await trigger.textContent(),/^Componentes/);
  const row=panel.locator('li',{hasText:'Tokens de diseño'});
  await row.getByRole('button').hover();
  assert.equal(await row.locator('.mk-multi-select-hint').evaluate(node=>getComputedStyle(node).opacity),'1');
  await page.getByRole('heading',{name:'Multi Select',exact:true}).click();
  assert.equal(await panel.count(),0);

  // Controlled: external buttons drive the value and the component reports back.
  const controlled=page.locator('#controlled');
  const controlledTrigger=controlled.getByRole('button',{name:/^Funciones/}).first();
  const status=controlled.getByRole('status');
  await controlled.getByRole('button',{name:'Funciones avanzadas'}).click();
  assert.equal(await status.textContent(),'Valor: security, performance');
  await controlled.getByRole('button',{name:'Limpiar'}).click();
  assert.match(await controlledTrigger.textContent(),/^Sin selección/);
  await controlledTrigger.click();
  await panel.getByRole('button',{name:'Monitoreo. Solo'}).click();
  assert.equal(await status.textContent(),'Valor: monitoring');
  await page.keyboard.press('Escape');

  // Disabled: locked options keep their state and are skipped.
  const disabled=page.locator('#disabled');
  assert.equal(await disabled.getByRole('button',{name:/^No disponible/}).isDisabled(),true);
  const plan=disabled.locator('.mk-multi-select-trigger').nth(1);
  await plan.click();
  assert.equal(await panel.getByRole('button',{name:'Plan base',exact:true}).isDisabled(),true);
  assert.equal(await focused(),'INPUT:Soporte');
  await page.keyboard.press('ArrowUp');assert.equal(await focused(),'INPUT:Auditoría');
  await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');
  assert.match(await plan.textContent(),/^2 seleccionados/,'Solo keeps the locked option');
  await page.keyboard.press('Escape');

  // Empty: message is announced and focus stays in the panel.
  await page.locator('#empty').getByRole('button',{name:/^Equipos/}).click();
  assert.equal(await panel.getByRole('status').textContent(),'Este proyecto todavía no tiene equipos.');
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');
  assert.equal(await panel.count(),0);

  for(const width of [390,1280])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    for(const position of ['bottom-start','bottom-end','top-start','top-end']){
      await page.locator('#position').getByRole('button',{name:new RegExp(`^${position}`)}).click();
      const bounds=await panel.boundingBox();
      assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=900,position);
      await page.keyboard.press('Escape');
    }
    await trigger.scrollIntoViewIfNeeded();await trigger.click();
    await panel.locator('li').nth(1).getByRole('button').hover();
    await page.screenshot({path:`verification/multi-select-${width}-${theme}.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  console.log('Multi Select: smart actions, keyboard, focus, controlled state, disabled, empty, positioning, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
