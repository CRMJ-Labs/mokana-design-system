import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';

const port=3053;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config','vite.website.config.ts','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'pipe'});
let browser;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Auth preview did not start')),15000);server.stdout.on('data',data=>{if(String(data).includes(String(port))){clearTimeout(timer);resolve();}});server.once('error',reject);});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/patterns/auth`);
  const auth=page.locator('.mk-auth-pattern');
  await expect(auth.getByRole('heading',{name:'Qué bueno verte.'})).toBeVisible();
  await expect(auth.locator('.mk-auth-benefits>div')).toHaveCount(3);
  await expect(auth.getByRole('button',{name:'Continuar con SSO'})).toBeVisible();
  await expect(auth.getByRole('group',{name:'Seleccionar tema de apariencia'})).toBeVisible();

  const email=auth.getByLabel('Correo electrónico'),password=auth.getByLabel('Contraseña');
  await email.fill('correo-invalido');await password.fill('abc');await auth.getByRole('button',{name:'Entrar'}).click();
  await expect(auth.getByText('Ingresa un correo electrónico válido.')).toBeVisible();
  await expect(auth.getByText('Usa al menos 8 caracteres.')).toBeVisible();
  await auth.getByRole('button',{name:'Mostrar contenido'}).click();
  await expect(password).toHaveAttribute('type','text');
  await auth.getByRole('button',{name:'Ocultar contenido'}).click();
  await expect(password).toHaveAttribute('type','password');
  await email.fill('demo@example.com');await password.fill('clave-larga-demo');await auth.getByRole('button',{name:'Entrar'}).click();
  await expect(auth.getByRole('status')).toContainText('Demostración completada');

  await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
  for(const theme of ['light','dark']){
    await page.locator('.mk-website').evaluate((node,value)=>node.dataset.theme=value,theme);
    const violations=await page.evaluate(async()=>(await axe.run(document.querySelector('.mk-auth-pattern'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.target)})));
    assert.deepEqual(violations,[],`${theme}: ${JSON.stringify(violations)}`);
  }

  await page.setViewportSize({width:390,height:844});await page.reload();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Auth must not overflow mobile.');
  assert.equal(await auth.locator('.mk-auth-layout').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),1);
  assert.deepEqual(errors,[]);
  console.log('Auth pattern: split layout, SSO, validation, password visibility, themes, accessibility and mobile passed.');
}finally{await browser?.close();server.kill();}
