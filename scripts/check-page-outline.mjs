import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';

const port=3046,base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Outline preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],routesChecked=[];
  page.on('pageerror',error=>errors.push(`${page.url()}: ${error.message}`));
  const outline=page.getByRole('navigation',{name:'En esta página',exact:true});
  async function open(slug,hash=''){
    await page.goto(`${base}/components/${slug}${hash}`);
    await outline.locator('a[href="#api"]').waitFor({state:'attached'});
    await page.evaluate(()=>document.fonts.ready);
  }
  await open('table');
  const routes=await page.locator('#website-navigation a[href^="/components/"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  assert.ok(routes.length>70);
  for(const route of routes){
    await open(route.split('/').at(-1));
    assert.equal(await page.locator('nav[aria-label^="Secciones de"]').count(),0,`${route}: old horizontal index`);
    const links=await outline.locator('a').evaluateAll(nodes=>nodes.map(node=>({id:decodeURIComponent(node.hash.slice(1)),label:node.textContent,exists:!!document.getElementById(decodeURIComponent(node.hash.slice(1)))})));
    assert.ok(links.length>=2,`${route}: missing sections`);assert.ok(links.every(link=>link.exists),`${route}: broken targets`);
    assert.equal(new Set(links.map(link=>link.id)).size,links.length,`${route}: duplicate entries`);
    const contentBounds=await page.locator('.mk-component-content').boundingBox(),outlineBounds=await outline.boundingBox();
    assert.ok(outlineBounds.x>=contentBounds.x+contentBounds.width+20,`${route}: index is not on the right`);
    assert.ok(outlineBounds.x+outlineBounds.width<=1440,`${route}: right rail overflow`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route}: document overflow`);
    routesChecked.push({route,sections:links.length});
  }
  await open('table');
  const resizingLink=outline.locator('a[href="#resizing"]');
  await resizingLink.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#resizing$/);await expect(resizingLink).toHaveAttribute('aria-current','location');
  await expect(page.locator('#resizing')).toBeFocused();
  assert.ok(Math.abs((await page.locator('#resizing').boundingBox()).y-96)<2,'Anchor clears the fixed header.');
  assert.ok(Math.abs((await outline.boundingBox()).y-96)<2,'Right index stays sticky.');
  await page.goBack();await expect(page).not.toHaveURL(/#resizing$/);
  await page.locator('#selection').evaluate(node=>node.scrollIntoView({block:'start'}));
  await expect(outline.locator('a[href="#selection"]')).toHaveAttribute('aria-current','location');
  const api=outline.locator('a[href="#api-DataTable"]');
  assert.equal(await api.locator('..').getAttribute('data-level'),'3');
  await api.click();await expect(page.locator('#api-DataTable')).toBeFocused();await expect(api).toHaveAttribute('aria-current','location');
  await open('table','#api-Table');
  await expect.poll(async()=>Math.round((await page.locator('#api-Table').boundingBox()).y)).toBe(96);
  await expect(outline.locator('a[href="#api-Table"]')).toHaveAttribute('aria-current','location');

  mkdirSync('verification',{recursive:true});
  for(const theme of ['light','dark']){
    await open('table');await page.locator('.mk-website').evaluate((node,theme)=>node.dataset.theme=theme,theme);
    await page.screenshot({path:`verification/page-outline-desktop-${theme}.png`,animations:'disabled'});
    await outline.locator('a[href="#resizing"]').click();
    await page.screenshot({path:`verification/page-outline-scrolled-${theme}.png`,animations:'disabled'});
  }
  for(const width of [390,1024,1280]){
    await page.setViewportSize({width,height:900});await open('button');
    if(width>=1200){
      await expect(outline.getByRole('button',{name:'En esta página',exact:true})).toBeHidden();
      await expect(outline.locator('a[href="#sizes"]')).toBeVisible();
    }else{
      const toggle=outline.getByRole('button',{name:'En esta página',exact:true});
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      await expect(outline.locator('a[href="#sizes"]')).toBeHidden();
      await toggle.focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
      await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
      await page.screenshot({path:`verification/page-outline-${width}-open.png`,animations:'disabled'});
      await outline.locator('a[href="#sizes"]').click();
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      await expect(page.locator('#sizes')).toBeFocused();
      assert.ok(Math.abs((await page.locator('#sizes').boundingBox()).y-124)<2,'Mobile anchor clears the header and outline toggle.');
      await expect(toggle).toBeVisible();
      await page.screenshot({path:`verification/page-outline-${width}-closed.png`,animations:'disabled'});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: overflow`);
  }
  // The sidebar changes the component without retaining entries from the previous page.
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#website-navigation').getByRole('link',{name:'Checkbox',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/checkbox$/);
  await expect(outline.locator('a[href="#api-Checkbox"]')).toBeVisible();
  assert.equal(await outline.locator('a[href="#api-Button"]').count(),0);
  assert.deepEqual(errors,[]);
  writeFileSync('verification/page-outline.json',JSON.stringify({passed:true,routes:routesChecked,checks:['right rail on all components','no old horizontal indexes','valid unique anchors','sticky positioning','scroll spy','keyboard and focus','fragment history and lazy API deep links','nested API entries','mobile/tablet disclosure','responsive bounds','SPA navigation']},null,2));
  console.log(`Page outline: ${routesChecked.length} component pages, scroll spy, keyboard/focus, lazy anchors, history, right rail and mobile/tablet navigation passed.`);
}finally{await browser?.close();server.kill();}
