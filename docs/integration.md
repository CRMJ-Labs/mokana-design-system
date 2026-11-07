# Integración de MOK

La guía navegable está en `/integration`. Las páginas de componentes incluyen una referencia de propiedades y valores predeterminados generada desde TypeScript.

## Instalar y cargar estilos

El paquete declara React y React DOM `>=19` como dependencias pares. Para una versión publicada:

```sh
npm install @mokanadev/design-system react react-dom
```

Importa el CSS público una vez antes de tus estilos:

```tsx
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css'; // Opcional: Inter autoalojada.
import './app.css';
```

Para probar el código local sin publicarlo:

```sh
npm run consumer:prepare
npm run test:visual
```

El fixture `tests/fixtures/consumer` instala el `.tgz` generado con `npm pack` y verifica los exports públicos. Después de cambiar la biblioteca, vuelve a prepararlo. Los scripts de pruebas abren y cierran sus propios servidores.

`styles.css` incluye tokens, reglas tipográficas, componentes e isotipo, sin cargar fuentes. Importa también `fonts.css` para conservar Inter: los WOFF2 se sirven como archivos independientes y el navegador descarga solo los subconjuntos necesarios. Para usar tu propia fuente, omite ese import y define `--font-body` y `--font-heading` en la raíz `.mk`. No es necesario copiar `public/brand` ni `public/fonts`. Los recursos de demostración pertenecen al sitio; `src/examples.css`, `src/documentation.css`, `src/website.css` y los CSS específicos de páginas quedan fuera del paquete.

## Raíz, tema y notificaciones

`MokProvider` es la integración recomendada para una aplicación nueva. Crea la raíz `.mk`, aplica la paleta oficial o la paleta del producto, conecta el tema y añade la región de notificaciones.

```tsx
import { MokProvider, ThemeSwitcher } from '@mokanadev/design-system';

export function App() {
  return <MokProvider defaultTheme="system" storageKey="my-app-theme" className="app-shell">
    <ThemeSwitcher />
    <YourApplication />
  </MokProvider>;
}
```

Usa `palette` para proporcionar el resultado de `createPalette`, `forcedTheme` para fijar el modo y `enableToasts={false}` solo cuando la aplicación no utilice `useToasts`. Los atributos de `div`, `className`, `style` y `ref` llegan a la raíz visual.

Los proveedores individuales siguen disponibles para integraciones avanzadas o raíces anidadas:

```tsx
import {
  ThemeProvider, ThemeSwitcher, ToastProvider, useTheme,
} from '@mokanadev/design-system';

function Shell() {
  const { resolvedTheme } = useTheme();
  return <div className="mk app-shell" data-theme={resolvedTheme}>
    <ToastProvider>
      <ThemeSwitcher />
      <YourApplication />
    </ToastProvider>
  </div>;
}

export function App() {
  return <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
    <Shell />
  </ThemeProvider>;
}
```

`.mk` proporciona el contexto visual. La aplicación define padding, altura y ancho; la biblioteca no impone dimensiones de página. `ThemeProvider` no crea una raíz DOM: aplica `resolvedTheme` a `data-theme`. `ToastProvider` debe estar dentro de la raíz para heredar sus tokens. No envuelvas `MokProvider` con estos mismos proveedores: ya los incluye.

## Estructura de aplicación y página

No reconstruyas el ancho, los gutters y la alineación en cada pantalla. `AppShell` define las regiones de la aplicación; `ContentContainer` centra el contenido; `PageHeader`, `PageToolbar` y `FilterBar` mantienen las acciones y controles alineados al responder.

```tsx
import {
  AppShell, ContentContainer, PageHeader, PageToolbar, FilterBar,
  Button, Input,
} from '@mokanadev/design-system';

<AppShell header={<ProductHeader />} sidebar={<PrimaryNavigation />}>
  <ContentContainer>
    <PageHeader
      title="Equipos"
      description="Administra equipos y su documentación técnica."
      actions={<Button>Nuevo equipo</Button>}
    />
    <PageToolbar actions={<ViewOptions />}>
      <Input label="Buscar" search placeholder="Código o nombre" />
    </PageToolbar>
    <FilterBar actions={<Button variant="ghost">Limpiar</Button>}>
      <StatusFilter />
      <ValidationFilter />
    </FilterBar>
    <EquipmentTable />
  </ContentContainer>
</AppShell>
```

`ContentContainer` acepta `size="compact" | "default" | "wide" | "full"`; el valor predeterminado limita el contenido a 1200 px y mantiene gutters fluidos. Reserva `wide` para tablas con muchas columnas. Las acciones principales pertenecen a `PageHeader`; búsqueda y controles de vista a `PageToolbar`; los filtros que alteran el conjunto de datos a `FilterBar`. Ninguno sustituye el uso de `DotsMenu` para acciones secundarias por fila.

### Tabla administrativa y prioridades responsive

`AdminTable` añade una sola columna de acciones por fila y la implementa con `DotsMenu`. Las columnas `primary` permanecen en la fila; las `secondary` y `tertiary` se trasladan automáticamente a un bloque de detalles al reducirse el contenedor. No uses renderizadores interactivos en columnas que puedan trasladarse: las acciones pertenecen a `rowActions`.

```tsx
const columns: Column<Equipment>[] = [
  { key: 'name', header: 'Equipo', responsivePriority: 'primary',
    render: row => row.name },
  { key: 'dimensions', header: 'Dimensiones', responsivePriority: 'tertiary',
    render: row => row.dimensions },
  { key: 'status', header: 'Estado', responsivePriority: 'secondary',
    render: row => <Badge>{row.status}</Badge> },
];

<AdminTable caption="Equipos" rows={equipment} columns={columns}
  rowKey={row => row.id}
  rowActionLabel={row => `Acciones de ${row.name}`}
  rowActions={row => [
    { id: 'history', label: 'Ver historial', onSelect: () => openHistory(row) },
    { id: 'edit', label: 'Editar equipo', onSelect: () => edit(row) },
    { id: 'deactivate', label: 'Desactivar', danger: true,
      onSelect: () => deactivate(row) },
  ]}
/>
```

| Propiedad | Predeterminado | Uso |
| --- | --- | --- |
| `MokProvider.defaultTheme` / `ThemeProvider.defaultTheme` | `system` | Preferencia si no hay una guardada. |
| `MokProvider.storageKey` / `ThemeProvider.storageKey` | `mok-theme` | Clave independiente por aplicación; `null` desactiva la persistencia. |
| `MokProvider.forcedTheme` / `ThemeProvider.forcedTheme` | Sin definir | Fuerza `light` o `dark` y bloquea el selector. |
| `MokProvider.enableToasts` | `true` | Incluye la región y el contexto de notificaciones. |
| `ThemeSwitcher.small` | `false` | Tamaño compacto del selector. |

## Una paleta por aplicación

Define los colores una sola vez en `palette.ts`. `createPalette` genera los tokens semánticos para claro y oscuro; `PaletteProvider` aplica la variante elegida por `ThemeProvider` y crea la raíz `.mk`.

```tsx
// palette.ts
import { createPalette } from '@mokanadev/design-system';
export const appPalette = createPalette({ brand: '#15803d' });
```

```tsx
import { PaletteProvider, ThemeProvider, ThemeSwitcher, ToastProvider } from '@mokanadev/design-system';
import { appPalette } from './palette';
import '@mokanadev/design-system/styles.css';

export function App() {
  return <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
    <PaletteProvider palette={appPalette} className="app-shell">
      <ToastProvider><ThemeSwitcher /><YourApplication /></ToastProvider>
    </PaletteProvider>
  </ThemeProvider>;
}
```

No añadas otra raíz `.mk` entre `PaletteProvider` y los componentes: el proveedor ya crea esa raíz. Los diálogos nativos y las notificaciones dentro del proveedor heredan la misma paleta. Para una sección con otra identidad, anida otro `PaletteProvider`. Si una aplicación utiliza portales propios fuera de esta raíz, sitúa el contenedor del portal dentro del proveedor o envuélvelo con su propio proveedor.

| Opción de `createPalette` | Uso |
| --- | --- |
| `brand` | Color de marca obligatorio; botones, enlaces, selección, foco y gráficas. |
| `accent` | Acento opcional; por defecto sigue a `brand`. |
| `neutral` | Semilla opcional para tintar superficies y texto. |
| `success`, `warning`, `error`, `info` | Colores de estado opcionales, independientes de la marca. |
| `light`, `dark` | Sobrescrituras avanzadas de tokens semánticos por tema. |

Las semillas aceptan `#RGB` o `#RRGGBB`. El generador ajusta su luminosidad y elige texto claro u oscuro para mantener legibilidad; el color aplicado puede diferir del hexadecimal original. Los estados mantienen su significado al cambiar la marca. Las sobrescrituras avanzadas y los colores explícitos de `CustomButton`, `Book`, `Gauge` o `style` pertenecen al consumidor y deben verificarse por separado.

Los componentes existentes también siguen funcionando con `.mk` y `data-theme`, sin proveedor de paleta. `mokPalette` ofrece la identidad MOK con acciones de marca cuando se utiliza `PaletteProvider`.

Para estilos propios de la aplicación utiliza funciones, no nombres de pigmentos:

```css
.app-chart { color: var(--chart-primary); }
.app-selected {
  background: var(--selection-background);
  color: var(--selection-text);
}
.app-message { color: var(--success-text); }
```

Otros tokens disponibles: `--background`, `--surface`, `--foreground`, `--secondary`, `--line`, `--brand-primary`, `--brand-on-primary`, `--focus`, `--action-primary`, `--action-primary-text`, `--error-text`, `--warning-text` y los pares de estado `--success-solid` / `--success-on-solid`, etc. Los tokens base y los valores predeterminados del generador proceden de `tokens.json`; después de cambiarlos ejecuta `npm run tokens`.

La escala exporta `--font-size-9` a `--font-size-64` para los tamaños declarados en JSON; los roles incluyen `--text-body`, `--text-ui`, `--text-caption` y `--text-heading-lg`. También hay pesos `--weight-*`, alturas `--leading-*`, radios `--radius-*`, sombras y espaciado: `--space-2` equivale a 8 px y `--space-0-5` a 2 px. Button consume `--text-button` (14 px en sm/md), `--text-button-lg` (16 px en lg) y `--space-2` para la separación; usa peso 500 y alturas de línea de 20/24 px. Puedes sobrescribir esos roles en tu raíz. Las alturas sm/md/lg son 36/40/44 px por debajo de 768 px y 32/36/40 px desde 768 px; los botones de solo icono son cuadrados con esas dimensiones. El padding horizontal es 12 px en sm y 16 px en md/lg, sin padding vertical. `npm run tokens:check`, incluido en builds de biblioteca y `verify`, falla si los archivos generados no corresponden al JSON.

El fixture `tests/fixtures/consumer/src/palette.ts` concentra tres paletas para las pruebas de integración; `defaultAppPalette` selecciona la inicial. Las pruebas verifican que cambiar el selector modifica la paleta completa sin recargar ni recrear los componentes.

## Atributos HTML y referencias

Los componentes base exponen tipos `ComponentPropsWithRef` del elemento correspondiente. `className` añade clases; `style`, `id`, `data-*`, `aria-*`, manejadores nativos y `ref` llegan al destino indicado.

| Componentes | Destino de atributos / ref |
| --- | --- |
| `Card` | `article` |
| `Alert`, `EmptyState`, `Table`, `DataTable`, `Tabs`, `Skeleton`, `ProgressBar` | Contenedor `div` |
| `Brand`, `Badge`, `Avatar`, `AvatarGroup`, `Tooltip`, `Popover`, `DropdownMenu` | Contenedor `span` |
| `Pill`, `ButtonLink` | `a` |
| `Button`, `CustomButton`, `Toggle` / `Switch` | `button` |
| `Input`, `Checkbox`, `Radio`, `ClearableInput`, `Combobox`, `DatePicker`, `FileUpload` | `input` |
| `Select`, `Textarea` | `select`, `textarea` |
| `Modal`, `Drawer` | `dialog` |
| `Navigation`, `Pagination` | `nav` |
| `Collapse`, `CollapseGroup` | `section`, `div` |
| `AddressInput` | Contenedor `div`; sus campos se gestionan mediante `value` y eventos de dirección. |

En los controles con envoltorio, `rootProps` permite personalizar ese contenedor y referenciarlo de forma independiente. En `Checkbox`, `Radio` y `FileUpload` es un `label`; en los demás controles base es un `div`.

**Compatibilidad de `className`:** en `Input`, `Checkbox` y `ClearableInput` conserva su aplicación histórica al contenedor. En los demás controles de la tabla llega al control nativo. Para expresar el destino del contenedor sin depender de esa diferencia, usa `rootProps.className`.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const containerRef = useRef<HTMLDivElement>(null);

<Input label="Nombre" name="name" ref={inputRef}
  rootProps={{ ref: containerRef, className: 'project-field' }} />;
```

Los componentes que necesitan una referencia interna comparten el nodo con el consumidor. Los tipos exportados, por ejemplo `CardProps`, `AlertProps`, `EmptyStateProps`, `ComboboxProps` o `PaginationProps`, permiten ampliar componentes sin volver a declarar sus contratos.

`title` sigue siendo el título de contenido en componentes como Card, Alert y Modal. No se interpreta como tooltip HTML. Los nombres, relaciones accesibles y roles internos se preservan; no los sustituyas salvo que proporciones una alternativa completa. Las ayudas internas se combinan con `aria-describedby` del consumidor.

## Convenciones de eventos

| Componentes | API explícita | API anterior conservada |
| --- | --- | --- |
| Input, Select, Textarea, DatePicker | `onValueChange(value)` y `onChange(event)` nativo | `onChange(event)` |
| Combobox, ClearableInput, AddressInput, Tabs | `onValueChange(value)` | `onChange(value)` |
| Checkbox, Radio, Toggle / Switch | `onCheckedChange(checked)` | `onChange(checked)` |
| Pagination | `onPageChange(page)` | `onChange(page)` |
| FileUpload | `onValueChange(files)` y `onChange(event)` nativo | `onFiles(files)` |
| Modal, Drawer | `onOpenChange(false)` al solicitar cierre | `onClose()` sigue siendo necesario. |
| Popover, Menu, DropdownMenu | `open`, `defaultOpen`, `onOpenChange(open)` | Funcionan sin props de control como antes. |

Los alias son aditivos: si pasas ambos manejadores de valor, se ejecutan ambos. Elige uno para cada efecto. En controles nativos, `onChange` se ejecuta primero; si llama a `preventDefault`, no se dispara la notificación adicional de valor. Esto no revierte por sí solo el valor de un campo no controlado.

Los componentes especializados conservan contratos propios: consulta, por ejemplo, los tipos de Slider, Calendar, MultiSelect o Feedback. No se cambian automáticamente sus eventos de valor por eventos DOM.

`DropdownMenu` conserva su contenedor `span`, propiedades HTML y API anterior, y utiliza `Menu` para foco, flechas, búsqueda por letras, Escape y cierre exterior. Para nuevos menús utiliza `Menu`; admite también estado controlado con `open` y `onOpenChange`.

En `AddressInput`, `value.address` controla el texto visible tanto en búsqueda como en entrada manual. Las actualizaciones externas y los reinicios de ese valor se reflejan en el campo. ArrowUp/Down recorre las sugerencias sin sacar el foco del campo, Enter selecciona y Escape o Tab cierra la lista. `mode` sigue indicando el modo inicial; `onModeChange` informa de los cambios del usuario.

`Tooltip` permanece visible al recorrer con el puntero el control, la separación y la ayuda. Escape lo descarta también al abrirlo solo por hover, sin mover el foco. Después de descartarlo, deja de enfocar y de señalar el conjunto para volver a abrirlo.

`Popover` abre un diálogo **no modal**: el foco entra en el panel al abrir y Tab continúa por sus controles y el resto de la página. Escape y el botón de cierre devuelven el foco al disparador. Al hacer clic o enfocar fuera, cierra sin quitar el foco al destino elegido. También admite `open`, `defaultOpen` y `onOpenChange`; un cierre externo devuelve el foco si estaba dentro del panel.

Pasa a `trigger` texto, contenido o un único control que propague los atributos y eventos recibidos, como `Button`. Un control conserva sus eventos y su ref; `preventDefault()` en su clic cancela la apertura. No incluyas varios controles interactivos dentro de un disparador. El título da nombre accesible al diálogo; si lo omites, utiliza `label` (por defecto, «Información adicional»). El panel adapta su posición, ancho y altura al viewport, y permite desplazar contenido largo.

```tsx
<Popover title="Detalles del proyecto" trigger={<Button>Ver detalles</Button>}>
  <p>Información adicional y acciones del proyecto.</p>
</Popover>
```

## Formularios

Usa `name`, `required`, `disabled`, `defaultValue` y atributos nativos cuando correspondan. `value` o `checked` proporcionados por la aplicación requieren actualizar el estado en su manejador. Un valor predeterminado solo inicializa el control.

```tsx
const [name, setName] = useState('');

<form onSubmit={event => {
  event.preventDefault();
  saveProject(new FormData(event.currentTarget));
}}>
  <Input label="Nombre" name="name" required
    value={name} onValueChange={setName} />
  <Button type="submit">Guardar</Button>
</form>;
```

`Button` usa `type="button"` por defecto. Los botones de paginación, acciones de archivo y cierre de diálogos no envían formularios. Los controles compuestos como AddressInput devuelven objetos que la aplicación debe añadir al envío; sus datos de demostración no representan una integración con un proveedor de direcciones.

Un `error` del componente tiene prioridad sobre `aria-invalid`. El `hint` o error se relaciona con el campo sin perder las descripciones externas.

## Tablas y datos remotos

`Table` admite datos de servidor mediante `sortMode="manual"`, `sort`, `onSortChange`, `loading`, `error` y `onRetry`. Tu aplicación realiza la petición y controla los resultados.

`DataTable` busca, ordena y pagina datos locales. `searchText` define los campos buscables. La selección es controlada y el checkbox general opera sobre las filas visibles y habilitadas, conservando las seleccionadas en otras páginas.

`variant="primary"` agrupa el cuerpo en una tarjeta; `variant="secondary"` presenta
una cabecera redondeada y filas abiertas. Ambas conservan los tokens de MOK.
`bordered`, `plain` y `striped` siguen disponibles.

`expansion={{ expandedKeys, onChange, rowLabel, render }}` controla los detalles de
cada fila. `Column.resizable` habilita ajuste mediante puntero y teclado; usa
`defaultWidth`, `minWidth` y `maxWidth` numéricos. `onColumnWidthsChange` recibe los
anchos para persistirlos. Los anchos y las filas expandidas sobreviven al ordenado.

Para cargar datos remotos por grupos, usa `Table` con
`loadMore={{ hasMore, loading, onLoadMore, error, onRetry }}`. La carga inicial
pertenece a `loading`; `loadMore.loading` conserva las filas ya recibidas. El
observador solicita un grupo por número de filas y mantiene un botón alternativo.
`autoLoad: false` desactiva las solicitudes automáticas. El consumidor controla
errores, cancelación de peticiones y `hasMore`. `DataTable` usa paginación local;
la carga progresiva se ofrece en `Table`.

## Compatibilidad y verificación

La integración automatizada cubre React + Vite en navegador y el paquete real instalado. Valida el renderizado de servidor en el framework de destino antes de adoptarlo. Los componentes interactivos necesitan un entorno cliente; no se declara soporte SSR verificado.

```sh
npm run docs:api     # Actualiza la referencia desde el código.
npm run docs:check   # Falla si la referencia está desactualizada.
npm run verify      # Tokens, tipos, builds, sitio, consumidor y comparación visual.
```

La referencia generada muestra propiedades propias, tipos, obligatoriedad y valores predeterminados declarados al desestructurar las propiedades. Los atributos HTML heredados no se repiten; TypeScript ofrece su lista completa. Los requisitos condicionales de variantes se marcan como «Según variante». Los valores calculados se muestran como expresiones del código y no como resultados evaluados.
