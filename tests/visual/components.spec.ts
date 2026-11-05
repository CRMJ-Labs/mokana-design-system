import {test,expect} from '@playwright/test';

async function open(page:import('@playwright/test').Page,view:string,theme:string){
  await page.goto(`/visual.html?view=${view}&theme=${theme}`);
  await page.locator('.visual-fixture>h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.fonts.check('14px "Inter Variable"'))).toBe(true);
}
for(const view of ['controls','forms','surfaces','button-sizes','tables'])test(view,async({page},info)=>{
  await open(page,view,info.project.use.colorScheme??'light');
  if(view==='tables')for(const separator of await page.getByRole('separator').all()){
    const bounds=await separator.evaluate(node=>({min:Number(node.getAttribute('aria-valuemin')),max:Number(node.getAttribute('aria-valuemax')),value:Number(node.getAttribute('aria-valuenow'))}));
    expect(bounds.value).toBeGreaterThanOrEqual(bounds.min);expect(bounds.value).toBeLessThanOrEqual(bounds.max);
  }
  await expect(page).toHaveScreenshot(`${view}.png`,{fullPage:true});
  if(view==='tables'){
    const primary=page.getByTestId('primary-table');
    await expect(primary.getByRole('checkbox',{name:'Seleccionar MOK Design System',exact:true})).toBeChecked();
    await primary.getByRole('checkbox',{name:'Seleccionar Portal de clientes',exact:true}).check();
    await primary.getByRole('button',{name:'Página siguiente'}).click();
    await expect(primary.getByText('2 seleccionados',{exact:true})).toBeVisible();
    const secondary=page.getByTestId('secondary-table');
    await secondary.getByRole('button',{name:'Ocultar detalles de MOK Design System',exact:true}).click();
    await expect(secondary.getByRole('region',{name:'Detalles de MOK Design System',exact:true})).toHaveCount(0);
    const resizer=secondary.getByRole('separator',{name:'Ancho de Proyecto',exact:true});
    await resizer.focus();await page.keyboard.press('End');await expect(resizer).toHaveAttribute('aria-valuenow','480');
    const more=page.getByTestId('load-more-table');
    await expect(more.locator('tbody tr:not(.mk-table-load-more)')).toHaveCount(1);
    await more.getByRole('button',{name:'Cargar más registros',exact:true}).click();
    await expect(more.locator('tbody tr:not(.mk-table-load-more)')).toHaveCount(2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
});
test('select',async({page},info)=>{
  await open(page,'forms',info.project.use.colorScheme??'light');
  const select=page.getByLabel('Responsable',{exact:true});
  await select.click();
  await expect(select.getByRole('option',{name:'Luis Pérez',exact:true})).toBeVisible();
  await expect(page).toHaveScreenshot('select.png',{fullPage:false});
});
for(const overlay of ['menu','popover','tooltip','address'])test(overlay,async({page},info)=>{
  await open(page,'overlays',info.project.use.colorScheme??'light');
  if(overlay==='menu'){await page.getByRole('button',{name:'Acciones visuales'}).click();await expect(page.getByRole('menu')).toBeVisible();}
  if(overlay==='popover'){await page.getByRole('button',{name:'Ver detalles'}).click();await expect(page.getByRole('dialog')).toBeVisible();}
  if(overlay==='tooltip'){await page.getByRole('button',{name:'Ayuda visual'}).focus();await expect(page.getByRole('tooltip')).toBeVisible();}
  if(overlay==='address'){await page.getByRole('combobox',{name:'Dirección'}).fill('Calle');await page.keyboard.press('ArrowDown');}
  await expect(page).toHaveScreenshot(`${overlay}.png`,{fullPage:true});
});
