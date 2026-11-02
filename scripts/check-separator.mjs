import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--port','3015'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview did not start')),15000);
    server.stdout.on('data',data=>{if(data.toString().includes('3015')){clearTimeout(timer);resolve();}});
    server.once('error',reject);
  });
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto('http://localhost:3015/components/separator');
  const rgba=(locator,property='backgroundColor')=>locator.evaluate((node,property)=>{const canvas=document.createElement('canvas').getContext('2d',{willReadFrequently:true});canvas.fillStyle=getComputedStyle(node)[property];canvas.fillRect(0,0,1,1);return [...canvas.getImageData(0,0,1,1).data].join(',');},property);
  const alpha=async locator=>Number((await rgba(locator)).split(',')[3]);
  const accents={light:'88,53,217,255',dark:'184,243,61,255'};
  for(const width of [1280,390])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.locator('.mk-website').evaluate((node,theme)=>node.setAttribute('data-theme',theme),theme);

    const horizontal=page.locator('#horizontal').getByRole('separator');
    assert.equal(await horizontal.getAttribute('aria-orientation'),'horizontal');
    const horizontalBox=await horizontal.boundingBox();const horizontalParent=await page.locator('#horizontal .mk-separator-preview').evaluate(node=>{const style=getComputedStyle(node);return node.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);});
    assert.equal(horizontalBox.height,1);assert.equal(Math.round(horizontalBox.width),Math.round(horizontalParent));
    assert.ok(await alpha(horizontal)<255,'default line uses the translucent token');

    const vertical=page.locator('#vertical').getByRole('separator');
    assert.equal(await vertical.count(),3);
    assert.equal(await vertical.first().getAttribute('aria-orientation'),'vertical');
    const verticalBox=await vertical.first().boundingBox();
    assert.equal(verticalBox.width,1);assert.ok(verticalBox.height>=20,`vertical height ${verticalBox.height}`);

    // Accent: 2px rounded brand stroke driven by the --accent-text role.
    const stroke=page.locator('#accent .mk-separator-stroke');
    const strokeBox=await stroke.boundingBox();
    assert.equal(strokeBox.height,2);assert.equal(strokeBox.width,48);
    assert.equal(await rgba(stroke),accents[theme]);
    assert.notEqual(await stroke.evaluate(node=>getComputedStyle(node).borderTopLeftRadius),'0px');
    const accentVertical=await page.locator('#accent .mk-separator-vertical').first().boundingBox();
    assert.equal(accentVertical.width,2);assert.ok(accentVertical.height>=20);

    // Label: eyebrow typography, named separator, both alignments.
    const named=page.locator('#label').getByRole('separator',{name:'01 / Fundamentos'});
    const eyebrow=named.locator('.mk-eyebrow');
    assert.deepEqual(await eyebrow.evaluate(node=>{const style=getComputedStyle(node);return [style.textTransform,style.fontSize,style.fontWeight];}),['uppercase','11px','600']);
    assert.equal(await named.locator('.mk-separator-rule:visible').count(),1,'start alignment keeps only the trailing line');
    const centered=page.locator('#label').getByRole('separator',{name:'O continúa con'});
    assert.equal(await centered.locator('.mk-separator-rule:visible').count(),2);
    const accentLabel=page.locator('#label').getByRole('separator',{name:'02 / Componentes'});
    assert.equal(await rgba(accentLabel.locator('.mk-eyebrow'),'color'),accents[theme]);

    // Mark: the MOK isotype on the line, hidden from assistive tech.
    const mark=page.locator('#mark .mk-mark').first();
    assert.equal(await mark.getAttribute('aria-hidden'),'true');
    assert.match(await mark.evaluate(node=>getComputedStyle(node).maskImage),/data:image\/svg\+xml/,'The isotype is embedded in the CSS without requiring a host asset');
    const markBox=await mark.boundingBox();assert.equal(markBox.width,20);assert.equal(markBox.height,20);

    // Ink panel: always the dark treatment, whatever the page theme.
    const ink=page.locator('#ink .mk-separator-ink');
    assert.equal(await rgba(ink),'11,13,22,255');
    assert.equal(await rgba(ink.getByRole('separator',{name:'MOK Design System'}).locator('.mk-eyebrow'),'color'),accents.dark);

    // Inset: hidden from assistive tech, 1px short at each end, solid so it does not darken over the frame.
    const inset=page.locator('#inset .mk-separator');
    assert.equal(await inset.getAttribute('aria-hidden'),'true');
    assert.equal(await page.locator('#inset').getByRole('separator').count(),0);
    const frame=await page.locator('#inset .mk-separator-frame').boundingBox();const box=await inset.boundingBox();
    assert.equal(box.x-frame.x,1);assert.equal(frame.x+frame.width-(box.x+box.width),1);
    assert.equal(await alpha(inset),255,'inset line is solid');
    const verticalInset=await vertical.first().evaluate(node=>{node.classList.add('mk-separator-inset');const self=node.getBoundingClientRect().height;const row=node.parentElement.getBoundingClientRect().height;node.classList.remove('mk-separator-inset');return {self,row};});
    assert.equal(verticalInset.self,verticalInset.row-2,'vertical inset reserves 1px at each end');

    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('.mk-docs-content').screenshot({path:`verification/separator-${width}-${theme}.png`});
  }
  // Native attributes and the Tab order stay untouched.
  assert.equal(await page.locator('.mk-separator[tabindex]').count(),0);
  assert.deepEqual(errors,[]);
  console.log('Separator: orientations, accent, label, mark, Ink, inset, semantics, themes and mobile passed.');
}finally{await browser?.close();server.kill();}
