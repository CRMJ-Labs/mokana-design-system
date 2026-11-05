import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const port=3045;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Table preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/components/table`);
  await page.locator('#default table').waitFor();
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  const variants=page.locator('#variants'),work=page.locator('#default');
  await expect(work.locator('.mk-table-root')).toHaveClass(/variant-primary/);
  const first=work.getByRole('checkbox',{name:'Seleccionar Analytics',exact:true});
  await first.focus();await page.keyboard.press('Space');
  await expect(first).toBeChecked();
  await expect(work.locator('tbody tr').first()).toHaveAttribute('data-selected','true');
  assert.equal(await work.locator('.mk-table-checkbox').first().locator('.mk-choice-control').count(),1,'Use the MOK checkbox, including mixed state.');
  await work.getByRole('button',{name:'Página siguiente'}).click();
  await expect(work.getByText('1 seleccionados',{exact:true})).toBeVisible();
  await work.getByRole('button',{name:'Página anterior'}).click();await expect(first).toBeChecked();

  const expansion=page.locator('#expansion'),opener=expansion.getByRole('button',{name:'Mostrar detalles de MOK Design System',exact:true});
  await opener.focus();await page.keyboard.press('Enter');
  const detail=expansion.getByRole('region',{name:'Detalles de MOK Design System',exact:true});
  await expect(detail).toContainText('Ana Torres');
  assert.equal(await expansion.getByRole('button',{name:'Ocultar detalles de MOK Design System',exact:true}).getAttribute('aria-controls'),await detail.getAttribute('id'));
  await expansion.getByRole('button',{name:'Ordenar por Proyecto',exact:true}).click();
  await expect(detail).toBeVisible();
  await expansion.getByRole('button',{name:'Ocultar detalles de MOK Design System',exact:true}).click();await expect(detail).toHaveCount(0);

  const resizing=page.locator('#resizing'),handle=resizing.getByRole('separator',{name:'Ancho de Proyecto',exact:true});
  for(const separator of await resizing.getByRole('separator').all()){
    const bounds=await separator.evaluate(node=>({min:Number(node.getAttribute('aria-valuemin')),max:Number(node.getAttribute('aria-valuemax')),value:Number(node.getAttribute('aria-valuenow'))}));
    assert.ok(bounds.value>=bounds.min&&bounds.value<=bounds.max,'Initial width honors the declared bounds.');
  }
  const th=resizing.locator('th').first(),other=resizing.locator('th').nth(1);
  const originalOther=(await other.boundingBox()).width;
  await handle.focus();await page.keyboard.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow','180');
  assert.ok(Math.abs((await th.boundingBox()).width-180)<1);
  await page.keyboard.press('End');await expect(handle).toHaveAttribute('aria-valuenow','560');
  await page.keyboard.press('Shift+ArrowLeft');await expect(handle).toHaveAttribute('aria-valuenow','510');
  await page.keyboard.press('ArrowLeft');await expect(handle).toHaveAttribute('aria-valuenow','500');
  const point=await handle.boundingBox();
  await page.mouse.move(point.x+point.width/2,point.y+point.height/2);await page.mouse.down();await page.mouse.move(point.x+point.width/2+40,point.y+point.height/2,{steps:4});await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-valuenow','540');
  assert.ok(Math.abs((await other.boundingBox()).width-originalOther)<1,'Resizing preserves adjacent widths.');
  await expect(th).toHaveAttribute('aria-sort','none');
  await expect(resizing.getByRole('status')).toContainText('540');
  // Column geometry and keyboard direction also follow right-to-left content.
  await resizing.locator('.mk-table-root').evaluate(node=>node.dir='rtl');
  await handle.focus();await page.keyboard.press('ArrowRight');await expect(handle).toHaveAttribute('aria-valuenow','530');
  await resizing.locator('.mk-table-root').evaluate(node=>node.dir='ltr');

  const more=page.locator('#load-more'),moreTable=more.getByRole('table');
  await more.getByRole('button',{name:'Simular error de carga'}).scrollIntoViewIfNeeded();
  await expect(moreTable).not.toHaveAttribute('aria-busy','true');
  await more.getByRole('button',{name:'Simular error de carga'}).click();
  // The automatic prefetch may complete while Playwright waits for the button
  // to become enabled. Capture the rows at the start of this explicit request.
  const existingRows=await more.locator('tbody tr:not(.mk-table-load-more)').allTextContents();
  const before=existingRows.length;
  await expect(moreTable).toHaveAttribute('aria-busy','true');
  await expect(more.getByRole('alert')).toContainText('No se pudo cargar');
  assert.deepEqual(await more.locator('tbody tr:not(.mk-table-load-more)').allTextContents(),existingRows,'Additional loading errors preserve existing rows.');
  await more.getByRole('button',{name:'Reintentar carga',exact:true}).click();
  await expect(more.getByRole('alert')).toHaveCount(0);
  for(let attempt=0;attempt<5;attempt++){
    await more.locator('.mk-table-scroll').evaluate(node=>node.scrollTop=node.scrollHeight);
    await expect(moreTable).not.toHaveAttribute('aria-busy','true');
    if(await more.locator('tbody tr:not(.mk-table-load-more)').count()===7)break;
    await expect.poll(()=>more.locator('tbody tr:not(.mk-table-load-more)').count()).toBeGreaterThan(before);
  }
  await expect(more.locator('tbody tr')).toHaveCount(7);await expect(more.locator('.mk-table-load-more')).toHaveCount(0);
  await expect(more.getByRole('button',{name:'Simular error de carga'})).toBeDisabled();

  mkdirSync('verification',{recursive:true});
  const presentations=[];
  for(const width of [1440,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1080});await page.locator('.mk-website').evaluate((node,theme)=>node.dataset.theme=theme,theme);
    for(const variant of ['primary','secondary','bordered','plain','striped']){
      await variants.getByLabel('Superficie').selectOption(variant);
      await expect(variants.locator('.mk-table-root')).toHaveClass(new RegExp(`variant-${variant}`));
      const style=await variants.locator('.mk-table-frame').evaluate(node=>{const style=getComputedStyle(node);return {border:style.borderTopWidth,background:style.backgroundColor};});
      if(variant==='secondary'){assert.equal(style.border,'0px');assert.equal(style.background,'rgba(0, 0, 0, 0)');}
      else assert.equal(style.border,'1px');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${theme} ${variant}: document overflow`);
      if(variant==='primary'||variant==='secondary')await variants.screenshot({path:`verification/table-${variant}-${width}-${theme}.png`,animations:'disabled'});
      presentations.push({width,theme,variant,...style});
    }
    await work.scrollIntoViewIfNeeded();await page.screenshot({path:`verification/table-work-${width}-${theme}.png`,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  writeFileSync('verification/table-patterns.json',JSON.stringify({passed:true,presentations,checks:['MOK selection and cross-page persistence','controlled expansion and sort stability','pointer/keyboard resizing and bounds','RTL resizing','incremental loading, retry and preserved rows','five variants in two themes and viewports']},null,2));
  console.log('MOK table patterns: selection, expansion, pointer/keyboard/RTL resizing, incremental loading/retry and 20 responsive presentations passed.');
}finally{await browser?.close();server.kill();}
