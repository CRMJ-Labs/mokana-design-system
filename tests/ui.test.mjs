import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const port = 3022;
const base = `http://127.0.0.1:${port}`;

function startPreview() {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--config', 'vite.website.config.ts', '--port', String(port)], { stdio: 'pipe' });
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('La vista previa no arrancó')), 15000);
    server.stdout.on('data', data => { if (data.toString().includes(String(port))) { clearTimeout(timer); resolve(); } });
    server.once('error', reject);
  });
  return { server, ready };
}

test('MOK: pages, contrast, mobile, keyboard and local workflows', async () => {
  assert.ok(fs.existsSync('website-dist/index.html'), 'Falta el build del sitio. Ejecuta npm test o npm run build.');
  const failures = [];
  const report = { pages: [], interactions: [], mobile: [], errors: [] };
  let preview;
  let browser;
  try {
    // Everything that holds the process open starts inside try, so a failure cannot hang the run.
    preview = startPreview();
    await preview.ready;
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => report.errors.push(`${page.url()}: ${error.message}`));
    async function open(route, theme = 'light') {
      await page.goto(base + route);
      await page.locator('#main-content > div > :not(.mk-catalog-loading)').first().waitFor();
      if(route.startsWith('/components/'))await page.locator('.mk-api-reference').waitFor();
      await page.locator('.mk-website').evaluate((node, value) => node.setAttribute('data-theme', value), theme);
      // Contrast must be measured on final colors, not halfway through a theme transition.
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
      await page.evaluate(() => document.fonts.ready);
    }

    await open('/introduction');
    const routes = await page.locator('#website-navigation a').evaluateAll(nodes => nodes.map(node => new URL(node.href).pathname));
    assert.ok(routes.length > 80, `Se esperaban todas las rutas del menú y hay ${routes.length}`);

    for (const theme of ['light', 'dark']) for (const route of routes) {
      await open(route, theme);
      // Code panels render when opened, and their syntax colors must pass contrast too.
      await page.evaluate(() => document.querySelectorAll('.mk-code-disclosure').forEach(node => { node.open = true; }));
      await page.waitForFunction(() => [...document.querySelectorAll('.mk-code-disclosure')].every(node => node.querySelector('.mk-code-block-frame')));
      await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
      const result = await page.evaluate(() => axe.run(document.querySelector('.mk-website'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
      const violations = result.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => ({ html: node.html, summary: node.failureSummary })) }));
      report.pages.push({ route, theme, violations });
      if (violations.length) failures.push({ route, theme, violations });
    }

    await open('/components/modal');
    const trigger = page.getByRole('button', { name: 'Abrir modal', exact: true });
    await trigger.click();
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').isVisible(), false);
    assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
    report.interactions.push('Modal: Escape and focus restoration');

    await open('/patterns/crud');
    const crudTable=page.locator('.mk-admin-table');
    await page.getByRole('button', { name: 'Nuevo equipo', exact: true }).first().click();
    await page.getByLabel('Nombre del equipo').fill('Equipo verificado');
    await page.getByRole('button', { name: 'Crear equipo', exact: true }).click();
    assert.equal(await crudTable.getByText('Equipo verificado', { exact: true }).count(), 1);
    await crudTable.getByRole('button', { name: 'Acciones de Equipo verificado', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Editar equipo', exact: true }).click();
    await page.getByLabel('Nombre del equipo').fill('Equipo editado');
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    assert.equal(await crudTable.getByText('Equipo editado', { exact: true }).count(), 1);
    await crudTable.getByRole('button', { name: 'Acciones de Equipo editado', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Eliminar equipo', exact: true }).click();
    await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
    assert.equal(await crudTable.getByText('Equipo editado', { exact: true }).count(), 0);
    report.interactions.push('CRUD: create, edit and confirmed delete');

    await open('/patterns/filters');
    await page.getByLabel('Buscar proyectos').fill('no-existe');
    assert.match(await page.locator('#main-content').getByRole('status').textContent(), /0 proyectos/);
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    assert.match(await page.locator('#main-content').getByRole('status').textContent(), /3 proyectos/);
    report.interactions.push('Filters: search, empty results and reset');

    await open('/patterns/auth');
    await page.getByLabel('Correo electrónico').fill('demo@example.com');
    await page.getByLabel('Contraseña').fill('abc');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const invalidPassword = page.getByLabel('Contraseña');
    assert.equal(await invalidPassword.getAttribute('aria-invalid'), 'true');
    await invalidPassword.focus();
    assert.deepEqual(await invalidPassword.evaluate(node => {
      const frame = node.closest('.mk-input-control') ?? node;
      const style = getComputedStyle(frame);
      return { borderWidth: style.borderTopWidth, outlineWidth: style.outlineWidth };
    }), { borderWidth: '2px', outlineWidth: '0px' }, 'Invalid password focus has one red boundary');
    await page.getByLabel('Contraseña').fill('clave-larga-demo');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    assert.match(await page.locator('#main-content').getByRole('status').textContent(), /Demostración completada/);
    report.interactions.push('Auth: validation and explicit demo feedback');

    await open('/patterns/settings');
    const toggle = page.getByRole('switch', { name: 'Resumen semanal' });
    await toggle.focus();
    await page.keyboard.press('Space');
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await page.getByRole('button', { name: 'Guardar preferencias' }).click();
    assert.match(await page.locator('#main-content').getByRole('status').textContent(), /Preferencias actualizadas/);
    report.interactions.push('Settings: keyboard switch and save feedback');

    await open('/patterns/empty');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    assert.match(await page.locator('#main-content').getByRole('status').textContent(), /primer proyecto está listo/);
    report.interactions.push('Empty state: actionable transition');

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of routes) {
      await open(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      report.mobile.push({ route, overflow });
    }
  } finally {
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/ui-report.json', JSON.stringify(report, null, 2));
    await browser?.close();
    preview?.server.kill();
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.mobile.filter(item => item.overflow).map(item => item.route), [], 'Rutas con desbordamiento en móvil');
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
});
