# MOK Design System

Sitio de documentación de MOK: fundamentos, componentes React y patrones de interfaz. Usa Inter, los tokens originales de marca y temas claro y oscuro.

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

Para dar una identidad a cada producto define `createPalette({ brand: '#15803d' })` y pasa el resultado a `PaletteProvider` dentro de `ThemeProvider`. Botones, controles, estados, selección y gráficas consumen tokens semánticos compartidos. Consulta [la guía de paletas por aplicación](docs/integration.md#una-paleta-por-aplicación). La demo local está en `/palette.html` de la aplicación consumidora (puerto 3001).

```sh
npm run build:lib
```

```tsx
import { Button, Input, AddressInput } from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';

export function Form() {
  return <div className="mk" data-theme="light">
    <Input label="Nombre" />
    <AddressInput />
    <Button>Continuar</Button>
  </div>;
}
```

La biblioteca se genera en `dist/`. Las fuentes y el isotipo se incluyen en sus estilos; no necesitas copiar `public/brand` ni `public/fonts` para consumirla. Address Input incluye sugerencias de demostración; sus propiedades `suggestions`, `value` y `onValueChange` permiten conectarlo a tus datos.

La [guía de integración](docs/integration.md), disponible también en `/integration`, documenta atributos HTML, refs, estilos, contenedores, formularios y compatibilidad de eventos. Las páginas del catálogo incluyen tablas de propiedades generadas desde TypeScript. Ejecuta `npm run docs:api` después de cambiar una API y `npm run docs:check` para detectar documentación desactualizada.

## Organización

- `src/website.tsx`: aplicación web y rutas.
- `src/catalog-navigation.ts`: catálogo compartido de componentes.
- `src/Catalog.tsx`: registro de las 78 páginas con carga bajo demanda.
- `src/CoreFormPages.tsx`, `src/CoreSurfacePages.tsx`, `src/CoreNavigationPages.tsx`: ejemplos y guías de los componentes base.
- `src/Drawer.tsx`, `src/Tabs.tsx`, `src/Textarea.tsx`: componentes con gestión de foco, teclado y estado nativo.
- `src/Documentation.tsx`: fundamentos de MOK.
- `src/components.tsx`, `src/advanced-components.tsx`: biblioteca de componentes.
- `tokens.json`: fuente de tokens; `npm run tokens` genera el CSS.
- `src/Icon.tsx`: registro de 80 iconos Lucide, con compatibilidad para los nombres anteriores. El catálogo buscable está en `/foundations/iconography`.
- `figma-map.json`: referencias de diseño y ejemplos de la biblioteca.

La web principal funciona en el puerto 3000. `npm run verify` corre tipos, builds y todas las pruebas, y es el mismo comando que ejecuta CI en GitHub.

## Integración en una aplicación independiente

La aplicación de prueba está en [`examples/consumer`](examples/consumer/README.md). Instala el paquete creado con `npm pack` y utiliza únicamente sus exports públicos:

```sh
npm run consumer:prepare
npm run consumer:dev
```

Disponible en http://127.0.0.1:3001. `npm run test:consumer` prepara el paquete y verifica su integración en navegador; también forma parte de `npm run verify`.

`src/styles.css` y los CSS de componentes forman los estilos publicados. `src/documentation.css` contiene la navegación, fundamentos y ejemplos de la documentación, y solo se importa desde `src/website.tsx`, junto a `src/website.css`. El paquete conserva tokens, tipografía, estilos base y utilidades de composición; la raíz `.mk` ya no impone padding ni altura de página. Cada aplicación define su layout y aplica `data-theme` dentro de su propio `ThemeProvider`.

## Tablas

El catálogo `/components/table` contiene ocho ejemplos interactivos: tabla de trabajo, densidades y superficies, ordenación numérica, selección controlada, encabezado fijo, carga, vacío y recuperación de errores.

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

`Table` conserva sus props anteriores y añade `density` (`compact`, `normal`, `comfortable`), `variant` (`bordered`, `plain`, `striped`), `selection`, `loading`, `error`, `onRetry`, `stickyHeader` y `maxHeight`. La ordenación puede ser interna o controlada mediante `sort` y `onSortChange`. Para datos de servidor, usa `sortMode="manual"` y gestiona las peticiones en la aplicación.

`DataTable` compone búsqueda local sin distinguir acentos, ordenación estable sobre todos los resultados y paginación. El checkbox del encabezado afecta a las filas visibles y habilitadas; conserva la selección de otras páginas. `rowLabel` da nombre a cada checkbox. Las acciones por fila se componen con `DotsMenu`; `actions` y `selectionActions` permiten añadir acciones al conjunto.

El CSS de producción está en `src/table.css`. Los estilos exclusivos de los ejemplos están en `src/table-documentation.css` y no se incluyen en el paquete. `node scripts/check-tables.mjs` comprueba los comportamientos, estados, accesibilidad y vistas móvil/escritorio sobre el build de la documentación.

## Iconografía

```tsx
import { Icon, Button } from '@mokanadev/design-system';

<Icon name="folder" size={20} />;
<Icon name="warning" size={24} label="Requiere atención" />;
<Button prefix="save">Guardar proyecto</Button>;
```

Los iconos decorativos se ocultan al lector de pantalla. Los botones sin texto necesitan su propio `aria-label`. Usa tamaños de 16, 20 y 24 px, trazo de 1.8 px y `currentColor`. Conserva 8 px entre icono y texto en los controles. `arrow` y `chevron` siguen disponibles como alias de `arrow-right` y `chevron-down`.

Lucide se importa de forma explícita; no se incluye su catálogo completo. Las licencias y atribuciones se distribuyen con el paquete en `THIRD_PARTY_NOTICES.md`. Los símbolos de marca y los SVG de gráficas permanecen separados de los iconos de interfaz.

[Figma](https://www.figma.com/design/0aIrchHaC4p0je6UxVYfZV) · [Repositorio](https://github.com/MiltonEsc/mok-design-system)
