import assert from 'node:assert/strict';
import {expect} from '@playwright/test';
import {resolve} from 'node:path';
import {testPopoverRegressions} from './test-popover-regressions.mjs';

/** Runs against the installed package, not imports from the source tree. */
export async function testInteractionRegressions(page,base){
  await page.goto(`${base}/interactions.html`);
  const events=page.getByLabel('Eventos de interacción');
  const initial=page.locator('#default-menu');
  await expect(initial.getByRole('menu')).toBeVisible();
  await expect(initial.getByRole('menuitem',{name:'Editar'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(initial.getByRole('menu')).toHaveCount(0);
  await expect(initial.getByRole('button',{name:'Acciones iniciales'})).toBeFocused();

  const addressRoot=page.locator('#controlled-address');
  const address=addressRoot.getByRole('combobox',{name:'Dirección'});
  await expect(address).toHaveValue('Calle inicial');
  await page.getByRole('button',{name:'Cargar dirección'}).click();
  await expect(address).toHaveValue('Carrera actualizada');
  await page.getByRole('button',{name:'Reiniciar dirección'}).click();
  await expect(address).toHaveValue('');
  await address.fill('Calle');
  await expect(page.getByLabel('Dirección actual')).toContainText('"address":"Calle"');
  await expect(events).toContainText('address-change');
  const options=addressRoot.getByRole('listbox').getByRole('option');
  await expect(options).toHaveCount(2);
  await expect(address).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('ArrowDown');
  await expect(options.first()).toHaveAttribute('aria-selected','true');
  assert.equal(await address.getAttribute('aria-activedescendant'),await options.first().getAttribute('id'));
  await expect(address).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(options.last()).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Enter');
  await expect(address).toHaveValue('Calle 10 # 34–11');
  await expect(page.getByLabel('Dirección actual')).toContainText('Medellín');
  await expect(address).toHaveAttribute('aria-expanded','false');
  await expect(address).not.toHaveAttribute('aria-activedescendant');
  await expect(address).toBeFocused();

  await address.fill('Calle');
  await page.keyboard.press('Escape');
  await expect(address).toHaveValue('Calle');
  await expect(addressRoot.getByRole('listbox')).toHaveCount(0);
  await page.keyboard.press('ArrowUp');
  await expect(options.last()).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Tab');
  await expect(addressRoot.getByRole('listbox')).toHaveCount(0);
  await address.focus();
  await page.getByRole('heading',{name:'Regresiones de interacción'}).click();
  await expect(addressRoot.getByRole('listbox')).toHaveCount(0);
  await address.fill('Calle');
  await addressRoot.getByRole('option',{name:/Calle 93/}).click();
  await expect(address).toHaveValue('Calle 93 # 13–24');
  await expect(address).toBeFocused();
  await expect(addressRoot.getByRole('listbox')).toHaveCount(0);
  await address.fill('Calle');
  await page.getByRole('button',{name:'Alternar bloqueo'}).click();
  await expect(address).toBeDisabled();
  await expect(addressRoot.getByRole('listbox')).toHaveCount(0);
  await page.getByRole('button',{name:'Alternar bloqueo'}).click();
  await addressRoot.getByRole('button',{name:'Ingresar la dirección manualmente'}).click();
  await page.getByRole('button',{name:'Cargar dirección'}).click();
  await expect(addressRoot.getByRole('textbox',{name:'Dirección',exact:true})).toHaveValue('Carrera actualizada');
  await addressRoot.getByRole('button',{name:'Buscar una dirección'}).click();
  await expect(address).toHaveValue('Carrera actualizada');
  await address.fill('Calle');
  await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[],'Accessibility with the address suggestions open');
  await page.keyboard.press('Escape');

  const plain=page.locator('#uncontrolled-address').getByRole('combobox',{name:'Dirección'});
  await plain.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await expect(plain).toHaveValue('Calle 93 # 13–24');
  await expect(events).not.toContainText('submit');
  await page.locator('#uncontrolled-address').getByRole('button',{name:'Limpiar dirección'}).click();
  await expect(plain).toHaveValue('');
  await expect(plain).toBeFocused();

  const dropdown=page.locator('#dropdown');
  const trigger=dropdown.getByRole('button',{name:'Acciones compatibles'});
  await expect(trigger).toHaveAttribute('aria-haspopup','menu');
  await trigger.focus();await page.keyboard.press('Enter');
  await expect(dropdown.getByRole('menuitem',{name:'Editar'})).toBeFocused();
  await expect(dropdown.getByRole('menuitem',{name:'Bloqueada'})).toBeDisabled();
  await page.keyboard.press('ArrowDown');
  await expect(dropdown.getByRole('menuitem',{name:'Eliminar'})).toBeFocused();
  await page.keyboard.press('Home');await page.keyboard.press('Enter');
  await expect(events).toContainText('edit');
  await expect(dropdown.getByRole('menu')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press('ArrowUp');
  await expect(dropdown.getByRole('menuitem',{name:'Eliminar'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await trigger.click();await page.keyboard.press('Tab');
  await expect(dropdown.getByRole('menu')).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
  await trigger.click();await page.getByRole('button',{name:'Control exterior'}).click();
  await expect(dropdown.getByRole('menu')).toHaveCount(0);
  await expect(events).toContainText('refs:DIV,SPAN');
  const controlled=page.locator('#controlled-menu');
  await controlled.getByRole('button').click();
  await expect(controlled.getByRole('menu')).toBeVisible();
  await expect(events).toContainText('menu:true');
  await page.keyboard.press('Escape');
  await expect(controlled.getByRole('menu')).toHaveCount(0);
  await expect(events).toContainText('menu:false');
  await page.locator('#shared-menu').getByRole('button').click();
  await expect(page.locator('#shared-menu').getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(events).toContainText('shared-menu:false');

  for(const placement of ['top','bottom','left','right']){
    const help=page.getByRole('button',{name:`Ayuda ${placement}`,exact:true});
    const bubble=page.getByRole('tooltip',{name:`Ayuda ${placement}`,exact:true});
    await page.getByRole('button',{name:'Control exterior'}).focus();
    await help.hover();await expect(bubble).toBeVisible();
    const anchor=await help.boundingBox(),tip=await bubble.boundingBox();
    const gap=placement==='top'?{x:anchor.x+anchor.width/2,y:(anchor.y+tip.y+tip.height)/2}:placement==='bottom'?{x:anchor.x+anchor.width/2,y:(anchor.y+anchor.height+tip.y)/2}:placement==='left'?{x:(anchor.x+tip.x+tip.width)/2,y:anchor.y+anchor.height/2}:{x:(anchor.x+anchor.width+tip.x)/2,y:anchor.y+anchor.height/2};
    await page.mouse.move(gap.x,gap.y);
    // Wait beyond the leave delay to prove the transparent bridge keeps hover.
    await page.waitForTimeout(220);await expect(bubble).toBeVisible();
    await page.mouse.move(tip.x+tip.width/2,tip.y+tip.height/2);
    await expect(bubble).toBeVisible();
    await page.keyboard.press('Escape');await expect(bubble).not.toBeVisible();
    await expect(page.getByRole('button',{name:'Control exterior'})).toBeFocused();
    await page.mouse.move(0,0);await page.waitForTimeout(180);
    await help.hover();await expect(bubble).toBeVisible();
    await page.mouse.move(0,0);await expect(bubble).not.toBeVisible();
    await help.focus();await expect(bubble).toBeVisible();
    await page.keyboard.press('Escape');await expect(bubble).not.toBeVisible();await expect(help).toBeFocused();
    await page.getByRole('button',{name:'Control exterior'}).focus();await page.waitForTimeout(180);
  }

  const touchContext=await page.context().browser().newContext({hasTouch:true,viewport:{width:390,height:844}});
  try{
    const touchPage=await touchContext.newPage();await touchPage.goto(`${base}/interactions.html`);
    await touchPage.keyboard.press('Escape');
    const input=touchPage.locator('#controlled-address').getByRole('combobox',{name:'Dirección'});
    await input.fill('Calle');
    await touchPage.locator('#controlled-address').getByRole('option',{name:/Calle 93/}).tap();
    await expect(input).toHaveValue('Calle 93 # 13–24');
    await expect(input).toHaveAttribute('aria-expanded','false');
  }finally{await touchContext.close();}
  await testPopoverRegressions(page,base);
  console.log('Interaction regressions: controlled addresses, keyboard/pointer/touch suggestions, open-state axe, shared/controlled menus, refs and tooltip hover bridges/Escape in four placements passed.');
}
