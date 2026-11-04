import {test,expect} from '@playwright/test';

async function open(page:import('@playwright/test').Page,view:string,theme:string){
  await page.goto(`/visual.html?view=${view}&theme=${theme}`);
  await page.locator('.visual-fixture>h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.fonts.check('14px "Inter Variable"'))).toBe(true);
}
for(const view of ['controls','forms','surfaces'])test(view,async({page},info)=>{
  await open(page,view,info.project.use.colorScheme??'light');
  await expect(page).toHaveScreenshot(`${view}.png`,{fullPage:true});
});
for(const overlay of ['menu','popover','tooltip','address'])test(overlay,async({page},info)=>{
  await open(page,'overlays',info.project.use.colorScheme??'light');
  if(overlay==='menu'){await page.getByRole('button',{name:'Acciones visuales'}).click();await expect(page.getByRole('menu')).toBeVisible();}
  if(overlay==='popover'){await page.getByRole('button',{name:'Ver detalles'}).click();await expect(page.getByRole('dialog')).toBeVisible();}
  if(overlay==='tooltip'){await page.getByRole('button',{name:'Ayuda visual'}).focus();await expect(page.getByRole('tooltip')).toBeVisible();}
  if(overlay==='address'){await page.getByRole('combobox',{name:'Dirección'}).fill('Calle');await page.keyboard.press('ArrowDown');}
  await expect(page).toHaveScreenshot(`${overlay}.png`,{fullPage:true});
});
