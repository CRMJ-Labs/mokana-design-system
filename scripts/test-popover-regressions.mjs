import assert from 'node:assert/strict';
import {expect} from '@playwright/test';
import {resolve} from 'node:path';

export async function testPopoverRegressions(page,base){
  await page.goto(`${base}/interactions.html`);
  await page.locator('#default-menu [role=menu]').waitFor();await page.keyboard.press('Escape');
  const events=page.getByLabel('Eventos de interacción');
  const section=page.locator('#popover'),trigger=section.getByRole('button',{name:'Ver detalles'});
  const dialog=section.getByRole('dialog',{name:'Detalles del proyecto'});
  await trigger.focus();await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();await expect(dialog).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-haspopup','dialog');await expect(trigger).toHaveAttribute('aria-expanded','true');
  assert.equal(await trigger.getAttribute('aria-controls'),await dialog.getAttribute('id'));
  await expect(events).toContainText('popover-trigger');await expect(events).toContainText('popover:true');
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded','false');await expect(trigger).not.toHaveAttribute('aria-controls');
  await trigger.click();await dialog.getByRole('button',{name:'Acción del panel'}).click();
  await expect(events).toContainText('popover-action');await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  await trigger.click();await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button',{name:'Cerrar',exact:true})).toBeFocused();
  await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Acción del panel'})).toBeFocused();
  await page.keyboard.press('Tab');await expect(section.getByRole('button',{name:'Después del popover'})).toBeFocused();
  await expect(dialog).toHaveCount(0);
  await trigger.click();await page.getByRole('button',{name:'Control exterior'}).click();
  await expect(dialog).toHaveCount(0);await expect(page.getByRole('button',{name:'Control exterior'})).toBeFocused();
  await page.getByRole('button',{name:'Referencias del popover'}).click();await expect(events).toContainText('popover-refs:SPAN,BUTTON');

  const controlled=page.locator('#controlled-popover'),controlledTrigger=controlled.getByRole('button',{name:'Ver panel controlado'});
  await controlled.getByRole('button',{name:'Abrir desde aplicación'}).click();await expect(controlled.getByRole('dialog')).toBeFocused();
  await page.keyboard.press('Escape');await expect(controlled.getByRole('dialog')).toHaveCount(0);await expect(controlledTrigger).toBeFocused();
  await controlledTrigger.click();await controlled.getByRole('button',{name:'Cerrar desde aplicación'}).click();
  await expect(controlled.getByRole('dialog')).toHaveCount(0);await expect(controlled.getByRole('button',{name:'Cerrar desde aplicación'})).toBeFocused();
  await controlled.getByRole('button',{name:'Programar cierre'}).click();await controlledTrigger.click();
  await expect(controlled.getByRole('dialog')).toBeFocused();
  await expect(controlled.getByRole('dialog')).toHaveCount(0);await expect(controlledTrigger).toBeFocused();

  const text=page.locator('#text-popover');
  await text.getByRole('button',{name:'Más información'}).press('Space');
  await expect(text.getByRole('dialog',{name:'Información del equipo'})).toBeVisible();await page.keyboard.press('Escape');
  const custom=page.locator('#span-popover');await custom.getByRole('button',{name:'Ayuda personalizada',exact:true}).press('Space');
  await expect(custom.getByRole('dialog')).toBeFocused();await page.keyboard.press('Escape');
  await custom.getByRole('button',{name:'Ayuda personalizada',exact:true}).press('Enter');
  await expect(custom.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  const fragment=page.locator('#fragment-popover');await fragment.getByRole('button',{name:'Ayuda en fragmento'}).click();
  await expect(fragment.getByRole('dialog',{name:'Fragmento'})).toBeFocused();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Cancelar apertura'}).click();await expect(page.locator('#cancelled-popover').getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Montar popover abierto'}).click();
  await expect(page.locator('#default-popover').getByRole('dialog',{name:'Panel inicial'})).toBeFocused();await page.keyboard.press('Escape');
  await expect(page.locator('#default-popover').getByRole('button',{name:'Panel inicial',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Popover en formulario'}).click();
  await expect(page.locator('#popover-form').getByRole('dialog')).toBeVisible();await expect(events).not.toContainText('popover-submit');await page.keyboard.press('Escape');

  await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
  for(const theme of ['light','dark']){
    await page.locator('main').evaluate((node,value)=>node.setAttribute('data-theme',value),theme);
    await trigger.click();
    const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
    assert.deepEqual(violations,[],`${theme}: accessibility with Popover open`);await page.keyboard.press('Escape');
  }
  const corner=page.locator('#corner-popover');
  for(const size of [{width:1280,height:900},{width:390,height:844},{width:390,height:320}]){
    await page.setViewportSize(size);await corner.getByRole('button',{name:'Panel de esquina'}).click();
    const panel=corner.getByRole('dialog');await expect(panel).toBeVisible();
    await expect.poll(async()=>{const box=await panel.boundingBox();return box.x>=7&&box.y>=7&&box.x+box.width<=size.width-7&&box.y+box.height<=size.height-7;}).toBe(true);
    assert.equal(await panel.evaluate(node=>node.scrollHeight>node.clientHeight),true,'Long content scrolls inside the panel');
    await page.screenshot({path:`verification/popover-${size.width}-${size.height}.png`});
    if(size.width===1280){
      await page.setViewportSize({width:390,height:320});
      await expect.poll(async()=>{const box=await panel.boundingBox();return box.x>=7&&box.y>=7&&box.x+box.width<=383&&box.y+box.height<=313;}).toBe(true);
    }
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1280,height:900});
  console.log('Popover: accessible triggers, preserved events/refs, controlled/default state, Escape/close/outside/Tab, focus restoration, form safety, light/dark axe and viewport bounds passed.');
}
