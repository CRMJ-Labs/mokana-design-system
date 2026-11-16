import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const port=3034;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes(String(port))){clearTimeout(timer);resolve();}});
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview exited: ${code}`));});
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://localhost:${port}/components/split-container`);
  await page.locator('.mk-api-reference').waitFor();
  const handle=id=>page.locator(`#${id} .mk-split-handle`);
  const value=async id=>Number(await handle(id).getAttribute('aria-valuenow'));
  async function key(id,press,expected){await handle(id).focus();await page.keyboard.press(press);assert.equal(await value(id),expected,`${id}: ${press}`);}
  async function drag(id,x,y){
    await handle(id).scrollIntoViewIfNeeded();
    const box=await handle(id).boundingBox();
    const start={x:box.x+box.width/2,y:box.y+box.height/2};
    await page.mouse.move(start.x,start.y);await page.mouse.down();
    await page.mouse.move(start.x+x,start.y+y,{steps:6});
  }
  assert.equal(await value('horizontal'),35);
  assert.equal(await handle('horizontal').getAttribute('aria-orientation'),'vertical');
  const primaryId=await handle('horizontal').getAttribute('aria-controls');
  assert.equal(await page.locator(`[id="${primaryId}"]`).count(),1);
  const dimensions=await page.locator('#horizontal .mk-split-container').evaluate(node=>[...node.children].map(child=>child.getBoundingClientRect().width));
  assert.ok(Math.abs(dimensions[0]/(dimensions[0]+dimensions[2])*100-35)<.1,'initial visual proportion');
  await key('horizontal','ArrowRight',36);await key('horizontal','Shift+ArrowLeft',26);
  await key('horizontal','Home',20);await key('horizontal','ArrowLeft',20);
  await key('horizontal','End',80);await key('horizontal','ArrowRight',80);
  await key('horizontal','Shift+ArrowLeft',70);
  await drag('horizontal',-100,0);assert.ok(await value('horizontal')<70);
  await page.keyboard.press('Escape');await page.mouse.up();assert.equal(await value('horizontal'),70,'Escape restores drag start');
  await drag('horizontal',-100,0);await handle('horizontal').dispatchEvent('pointercancel',{pointerId:1,isPrimary:true});await page.mouse.up();
  assert.equal(await value('horizontal'),70,'pointercancel restores drag start');
  await drag('horizontal',-2000,0);await page.mouse.up();assert.equal(await value('horizontal'),20,'capture and lower clamp');
  await drag('horizontal',2000,0);await page.mouse.up();assert.equal(await value('horizontal'),80,'capture and upper clamp');
  assert.equal(await page.locator('.mk-split-container-dragging').count(),0);

  assert.equal(await handle('vertical').getAttribute('aria-orientation'),'horizontal');
  await key('vertical','ArrowDown',61);await key('vertical','Shift+ArrowUp',51);
  await key('vertical','ArrowRight',51);
  await drag('vertical',0,40);await page.mouse.up();assert.ok(await value('vertical')>51);
  await key('vertical','Home',20);await key('vertical','End',80);

  await key('controlled','End',65);await key('controlled','ArrowRight',65);
  await key('controlled','Home',25);
  await drag('controlled',70,0);await page.mouse.up();assert.ok(await value('controlled')>25,'controlled drag updates application state');
  await page.getByRole('button',{name:'Restablecer tamaño'}).click();assert.equal(await value('controlled'),35);

  assert.equal(await handle('disabled').getAttribute('aria-disabled'),'true');
  assert.equal(await handle('disabled').getAttribute('tabindex'),'-1');
  await key('disabled','ArrowRight',40);
  await drag('disabled',100,0);await page.mouse.up();assert.equal(await value('disabled'),40);
  assert.equal(await page.locator('#disabled').getByRole('button',{name:'Ver actividad'}).isEnabled(),true);

  await key('rtl','ArrowLeft',51);await key('rtl','ArrowRight',50);
  await drag('rtl',-70,0);await page.mouse.up();assert.ok(await value('rtl')>50,'RTL drag grows first panel to the left');
  for(const width of [1440,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);
    await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=>{
      const result=await axe.run(document.querySelector('#main-content'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
      return result.violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.html)}));
    });
    assert.deepEqual(violations,[],`${width}px ${theme}: accessibility`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'no page overflow');
    const first=await page.locator('#horizontal .mk-split-panel').first().boundingBox();
    const second=await page.locator('#horizontal .mk-split-panel').last().boundingBox();
    if(width===390){
      assert.equal(await handle('horizontal').isVisible(),false);
      assert.ok(second.y>=first.y+first.height,'mobile panels stack without loss');
      assert.equal(await handle('rtl').isVisible(),true,'opt-out remains resizable');
    }else{
      assert.equal(await value('horizontal'),80,'desktop restores size');
      assert.ok(second.x>first.x);
    }
    await page.locator('#horizontal').screenshot({path:`verification/split-container-${width}-${theme}.png`});
  }

  // Real touch input exercises pointer capture on the vertical handle in mobile layout.
  const touchContext=await browser.newContext({hasTouch:true,viewport:{width:390,height:844}});
  const touchPage=await touchContext.newPage();
  await touchPage.goto(`http://localhost:${port}/components/split-container`);
  const touchHandle=touchPage.locator('#vertical .mk-split-handle');
  await touchHandle.scrollIntoViewIfNeeded();
  const touchBox=await touchHandle.boundingBox();
  const session=await touchContext.newCDPSession(touchPage);
  const point={x:touchBox.x+touchBox.width/2,y:touchBox.y+touchBox.height/2};
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,y:point.y+35}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(Number(await touchHandle.getAttribute('aria-valuenow'))>60,'touch drag resizes');
  await touchContext.close();
  assert.deepEqual(errors,[]);
  console.log('SplitContainer: proportions, limits, keyboard, pointer/touch drag, cancellation, controlled state, disabled, RTL, themes, mobile and accessibility passed.');
}finally{await browser?.close();server.kill();}
