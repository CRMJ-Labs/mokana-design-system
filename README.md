# MOK Design System

Sitio de documentación de MOK: fundamentos, componentes React y patrones de interfaz. Usa Inter, los colores exactos del tema predeterminado de MOK y temas claro y oscuro.

Cada página de componente tiene un índice «En esta página» a la derecha, con
sección activa al desplazarse y subapartados de API. En móvil y tablet funciona
como un desplegable. `node scripts/check-page-outline.mjs` comprueba los enlaces,
el foco, el historial, los índices de todo el catálogo y los tamaños responsivos.

La [guía de colores](docs/colors.md) documenta los 74 roles oficiales, su procedencia,
los alias de MOK y los resultados de contraste. El catálogo completo está en
`/foundations/colors`. Usa `mokPalette` para conservar la paleta oficial;
`createPalette` permite crear una identidad personalizada.

## Abrir la web

```sh
npm ci
npm run dev
```

Abre [MOK en localhost:3000](http://localhost:3000/introduction). En Windows también puedes ejecutar `ABRIR-MOK.cmd`.

| Página | Ruta |
| --- | --- |
| Introducción | `/introduction` |
| Marca | `/foundations/brand` |
| Colores | `/foundations/colors` |
| Tipografía | `/foundations/typography` |
| Button | `/components/button` |
| Address Input | `/components/address-input` |
| Autenticación | `/patterns/auth` |
| Dashboard | `/patterns/dashboard` |

El menú permite buscar y navegar por todas las páginas. Las 78 entradas del catálogo tienen ejemplos, variantes, código y guía de uso. Las páginas de componentes se cargan bajo demanda al navegar. Las URLs desconocidas muestran una página de recuperación.

## Compilar y servir

```sh
npm run typecheck
npm run build
npm run preview
```

`npm run build` genera el sitio en `website-dist/`. Para desplegarlo, sirve esa carpeta y configura el servidor para devolver `index.html` en las rutas de la aplicación. Se incluye `public/_redirects` para alojamientos compatibles. Vite resuelve las rutas al desarrollar o usar preview.

## Publicar en Cloudflare

Para publicar mediante Cloudflare Workers Builds, conecta la rama `main` y configura:

| Campo | Valor |
| --- | --- |
| Project name | `mok-design-system` |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |
| Root directory | Raíz del repositorio |

`wrangler.jsonc` sirve `website-dist` con navegación SPA para las rutas internas. El build específico de Cloudflare retira del resultado la regla `_redirects` destinada a Pages; Workers utiliza su propia configuración de navegación. El build habitual conserva la regla para otros alojamientos.

## Verificación

```sh
npm run verify
```

Las pruebas del sitio usan Playwright y Microsoft Edge instalado. Comprueban rutas, navegación, recarga de páginas internas, tema persistente, formularios, carga bajo demanda, recuperación de URLs desconocidas y menú móvil. Las pruebas de componentes base verifican Escape y foco en Drawer, navegación y paneles de Tabs, y contadores y reinicio de Textarea.

## Biblioteca React

Para dar una identidad a cada producto define `createPalette({ brand: '#15803d' })` y pasa el resultado a `PaletteProvider` dentro de `ThemeProvider`. Botones, controles, estados, selección y gráficas consumen tokens semánticos compartidos. Consulta [la guía de paletas por aplicación](docs/integration.md#una-paleta-por-aplicación). La configuración utilizada por las pruebas está en `tests/fixtures/consumer/src/palette.ts`.

```sh
npm run build:lib
```

```tsx
import { Button, Input, AddressInput } from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css'; // Opcional: Inter autoalojada.

export function Form() {
  return <div className="mk" data-theme="light">
    <Input label="Nombre" />
    <AddressInput />
    <Button>Continuar</Button>
  </div>;
}
```

La biblioteca se genera en `dist/`. `styles.css` incluye componentes, tokens e isotipo. Para conservar Inter, importa también `fonts.css`: carga archivos WOFF2 independientes según los caracteres utilizados. Puedes omitirlo y definir tu propia familia con `--font-body` y `--font-heading`. No necesitas copiar `public/brand` ni `public/fonts`. Address Input incluye sugerencias de demostración; sus propiedades `suggestions`, `value` y `onValueChange` permiten conectarlo a tus datos.

La [guía de integración](docs/integration.md), disponible también en `/integration`, documenta atributos HTML, refs, estilos, contenedores, formularios y compatibilidad de eventos. Las páginas del catálogo incluyen tablas de propiedades generadas desde TypeScript. Ejecuta `npm run docs:api` después de cambiar una API y `npm run docs:check` para detectar documentación desactualizada.

## Organización

- `src/website.tsx`: aplicación web y rutas.
- `src/catalog-navigation.ts`: catálogo compartido de componentes.
- `src/Catalog.tsx`: registro de las 78 páginas con carga bajo demanda.
- `src/CoreFormPages.tsx`, `src/CoreSurfacePages.tsx`, `src/CoreNavigationPages.tsx`: ejemplos y guías de los componentes base.
- `src/Drawer.tsx`, `src/Tabs.tsx`, `src/Textarea.tsx`: componentes con gestión de foco, teclado y estado nativo.
- `src/Documentation.tsx`: fundamentos de MOK.
- `src/components.tsx`, `src/advanced-components.tsx`: biblioteca de componentes.
- `tokens.json`: fuente de colores, espaciado, radios, sombras y tipografía por escala y rol; `npm run tokens` genera el CSS y `npm run tokens:check` detecta archivos desactualizados.
- `src/Icon.tsx`: registro de 80 iconos Lucide, con compatibilidad para los nombres anteriores. El catálogo buscable está en `/foundations/iconography`.
- `figma-map.json`: referencias de diseño y ejemplos de la biblioteca.

La web principal funciona en el puerto 3000. `npm run verify` comprueba tokens y API, tipos, builds y todas las pruebas, incluidas las comparaciones visuales. Es el mismo comando que ejecuta CI en GitHub.

CI y publicación instalan las dependencias con `npm ci --ignore-scripts`, preparan Microsoft Edge con `npx playwright install --with-deps msedge` y ejecutan `npm run verify`. La instalación explícita del navegador sigue la [guía de Playwright](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge).

### Comparaciones visuales

Las 40 referencias en `tests/visual/baselines/win32` cubren controles, tamaños de Button, formularios, superficies, tablas, el desplegable de Select y cuatro overlays, en claro/oscuro y a 390/1280 px. Se comparan con el paquete instalado, usando fuentes locales y animaciones desactivadas. No constituyen una cobertura visual de los 98 componentes públicos.

```sh
npm run consumer:prepare
npm run test:visual
# Solo para cambios visuales intencionales, revisando cada PNG modificado:
npm run test:visual:update
```

La comparación falla ante imágenes ausentes o diferencias; el comando normal nunca actualiza referencias. El informe HTML queda en `verification/visual-report` y las imágenes actual/diff en `test-results/visual`. CI y publicación adjuntan ambos como artefactos incluso si fallan. Sustituye el antiguo workflow incompleto de Chromatic/Storybook.

Genera y revisa estas referencias en Windows con Edge; los workflows usan Windows para reducir diferencias de renderizado. Playwright recomienda mantener el mismo entorno al [comparar capturas](https://playwright.dev/docs/test-snapshots). Si cambia el navegador o el entorno, revisa los diffs antes de actualizar los PNG.

`prepublishOnly` también ejecuta `verify` para las publicaciones manuales con `npm publish`. El workflow de tags ejecuta esa misma verificación en un paso previo y después usa `npm publish --ignore-scripts` para evitar repetirla. `consumer:prepare` empaqueta con `--ignore-scripts`, por lo que verificar el consumidor no vuelve a entrar en el hook de publicación. Véase el [ciclo de scripts de npm](https://docs.npmjs.com/cli/v11/using-npm/scripts/).

## Verificación del paquete instalado

El fixture de integración está en [`tests/fixtures/consumer`](tests/fixtures/consumer/README.md). Instala el paquete creado con `npm pack` y utiliza únicamente sus exports públicos:

```sh
npm run consumer:prepare
npm run test:visual
```

`npm run test:consumer` prepara el paquete y verifica su integración en navegador; también forma parte de `npm run verify`. El fixture es soporte de pruebas, no una aplicación de demostración del producto.

`src/styles.css` y los CSS de componentes forman los estilos publicados. `src/examples.css`, `src/documentation.css`, `src/website.css` y los CSS específicos de páginas pertenecen al sitio y quedan fuera del paquete. `scripts/example-css-classes.json` permite comprobar que las clases extraídas no reaparezcan en el CSS instalado. El paquete conserva tokens, reglas tipográficas, estilos base y utilidades de composición; las fuentes se ofrecen por separado. La raíz `.mk` no impone padding ni altura de página. Cada aplicación define su layout y aplica `data-theme` dentro de su propio `ThemeProvider`.

## Tablas

El catálogo `/components/table` contiene once ejemplos interactivos: superficies primaria y secundaria, selección, expansión, columnas ajustables y carga progresiva, además de búsqueda, paginación y estados de contenido.

```tsx
import { DataTable, type Column } from '@mokanadev/design-system';

type Project = { id: string; name: string; budget: number };
const columns: Column<Project>[] = [
  { key: 'name', header: 'Proyecto', render: row => row.name, sortValue: row => row.name },
  { key: 'budget', header: 'Presupuesto', align: 'right',
    render: row => formatCurrency(row.budget), sortValue: row => row.budget },
];

<DataTable caption="Proyectos" columns={columns} rows={projects}
  rowKey={row => row.id} searchText={row => row.name} pageSize={5} />;
```

`Table` ofrece `density` (`compact`, `normal`, `comfortable`), `variant` (`primary` por defecto, `secondary`, `bordered`, `plain`, `striped`), `selection`, `expansion`, `loadMore`, `loading`, `error`, `onRetry`, `stickyHeader` y `maxHeight`. Conserva la API anterior. La ordenación puede ser interna o controlada mediante `sort` y `onSortChange`. Para datos de servidor, usa `sortMode="manual"` y gestiona las peticiones en la aplicación. `Column.resizable` habilita ajuste por puntero o teclado; `defaultWidth`, `minWidth` y `maxWidth` numéricos delimitan el ancho. `onColumnWidthsChange` permite guardar los anchos resultantes.

`DataTable` compone búsqueda local sin distinguir acentos, ordenación estable sobre todos los resultados y paginación. El checkbox del encabezado afecta a las filas visibles y habilitadas; conserva la selección de otras páginas. `rowLabel` da nombre a cada checkbox. Las acciones por fila se componen con `DotsMenu`; `actions` y `selectionActions` permiten añadir acciones al conjunto.

`AdminTable` formaliza el patrón operativo: usa densidad compacta y añade una sola columna de acciones con `DotsMenu`. `rowActionLabel` identifica la fila para tecnologías de asistencia y `rowActions` entrega sus opciones. No apiles botones en una celda.

Las columnas pueden declarar `responsivePriority`: `primary` permanece visible, `secondary` pasa al detalle cuando la tabla mide menos de 480 px y `tertiary` cuando mide menos de 720 px. Los umbrales usan el ancho del contenedor, no el viewport. Las columnas sin prioridad conservan el comportamiento anterior y permanecen visibles.

El CSS de producción está en `src/table.css`. Los estilos exclusivos de los ejemplos están en `src/table-documentation.css` y no se incluyen en el paquete. `node scripts/check-tables.mjs` comprueba los comportamientos, estados, accesibilidad y vistas móvil/escritorio sobre el build de la documentación.

`node scripts/check-table-patterns.mjs` comprueba expansión controlada, redimensionado con puntero/teclado/RTL, carga progresiva con recuperación, selección entre páginas y las cinco superficies en ambos temas y tamaños. Las pruebas visuales de `tables` verifican también estas capacidades desde el paquete instalado.

## Iconografía

```tsx
import { Icon, Button } from '@mokanadev/design-system';

<Icon name="folder" size={20} />;
<Icon name="warning" size={24} label="Requiere atención" />;
<Button prefix="save">Guardar proyecto</Button>;
```

Los iconos decorativos se ocultan al lector de pantalla. Los botones sin texto necesitan su propio `aria-label`. Usa tamaños de 16, 20 y 24 px, trazo de 1.8 px y `currentColor`. Conserva 8 px entre icono y texto en los controles. `arrow` y `chevron` siguen disponibles como alias de `arrow-right` y `chevron-down`.

Lucide se importa de forma explícita; no se incluye su catálogo completo. Las licencias y atribuciones se distribuyen con el paquete en `THIRD_PARTY_NOTICES.md`. Los símbolos de marca y los SVG de gráficas permanecen separados de los iconos de interfaz.

[Figma](https://www.figma.com/design/0aIrchHaC4p0je6UxVYfZV) · [Repositorio](https://github.com/CRMJ-Labs/mokana-design-system)
