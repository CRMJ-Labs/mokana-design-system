# Lote de componentes pendientes

- Fecha: 2026-10-31 · Tipo: componentes · Estado: hecho
- Referencia: https://vercel.com/geist/introduction y la página de cada componente
- Páginas: `/components/<slug>`

## Pedido y alcance

Completar los 26 componentes que seguían pendientes, con el diseño de MOK. Geist guía la funcionalidad; el aspecto parte de los tokens y fundamentos de MOK. La biblioteca de Figma no tiene estos componentes, así que el diseño es una propuesta.

## Archivos

| Grupo | Componentes | Código | Páginas |
|---|---|---|---|
| Estado | Spinner, LoadingDots, StatusDot, PieGauge, Note, ProjectBanner | `src/StatusComponents.tsx` | `src/StatusPages.tsx` |
| Código | Code, CodeBlock, Snippet, TextWithCopyButton, Kbd, MiddleTruncate, JsonView | `src/CodeComponents.tsx` | `src/CodePages.tsx` |
| Controles | Slider, RangeSlider, SearchInput, SplitButton, ShowMore, Scroller, RelativeTimeCard, Sheet, Calendar | `src/ControlComponents.tsx` | `src/ControlPages.tsx` |
| Marcos | Book, Browser, Phone, Video | `src/FrameComponents.tsx` | `src/FramePages.tsx` |
| Existente | Pill | `src/components.tsx` | `src/StatusPages.tsx` |

Keyboard Input se exporta como `Kbd`. `RangeSlider` y `makeJsonViewHighlightPattern` son exportaciones adicionales. `CopyButton` ganó la prop `copied`. `public/demo/mok-loop.webm` es un clip de 48 KB con la marca MOK para la demo de Video, y se incluye en el paquete publicado porque `files` contiene `public`.

## Identidad MOK

- Color por rol: `--accent-text`, `--info-text`, `--secondary`, `--action-primary`. El lima marca la acción y la selección, como en los bordes del rango de Calendar y el pulgar de Slider.
- Estados sin depender del color, como piden los fundamentos: Status Dot usa una forma por estado; Note y Project Banner combinan icono, texto oculto y borde (punteado en advertencia, 2 px o invertido en error); Code Block usa signo y texto oculto en líneas añadidas y eliminadas.
- Paneles Ink en ambos temas: Snippet `inverted`, Browser y Phone `tone="ink"`, y Book por defecto, con la hoja de `.mk-mark`.
- Campos de 44 px con `--radius-sm`, y botones en píldora.

## Diferencias con Geist

- Status Dot usa estados en minúscula y en español, y una forma por estado.
- Calendar: los rangos habituales usan un `select` nativo, y el selector de zona horaria es solo informativo: no convierte las fechas de `onChange`.
- Code Block usa un tokenizador simple por líneas, sin dependencias. No cubre comentarios de varias líneas.
- Split Button alinea el menú con el botón del menú, no con el botón principal.
- Relative Time Card reutiliza Context Card, cuyo activador es un botón.
- Sheet no bloquea por defecto, como Geist, y `modal` usa `showModal()`.
- Pill: Geist no publica una página propia (`/geist/pill` redirige a su portada). Se documentó el `Pill` que ya existía en MOK.
- No implementado: SecretValue, que Geist presenta como exploración dentro de Snippet, y la opción de animación de MiddleTruncate.

## Validación

2026-10-31: `npm run typecheck`, `npm run build`, `npm run build:lib` y `npm run test:website` aprobados.

`node scripts/check-pending-components.mjs` aprobado en Microsoft Edge sin interfaz: teclado, foco, copia, estado controlado, límites y semántica de los componentes interactivos, y los 26 sin desbordamiento horizontal en 1280 y 390 px, claro y oscuro, sin errores de consola. Ningún componente queda marcado como pendiente.

Capturas en `verification/<slug>-1280-light.png` y `verification/<slug>-390-dark.png`. Se revisaron en hojas de contacto a escala reducida, con paneles abiertos de Calendar, Sheet y Split Button. No se revisó cada página a tamaño completo, ni se hizo una auditoría con lector de pantalla real. La cobertura móvil usa un viewport emulado. No se añadieron dependencias.
