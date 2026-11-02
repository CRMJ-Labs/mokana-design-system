# Separator

- Fecha: 2026-10-31 · Tipo: componente · Estado: hecho
- Referencia: https://vercel.com/geist/separator
- Página: `/components/separator`

## Pedido y alcance

Crear el separador de MOK a partir de la referencia, con su propia identidad y no como copia visual. Conserva los ejemplos de la referencia (horizontal, vertical, marcos pintados y orientaciones) y añade énfasis de marca, etiqueta con eyebrow, isotipo y composición sobre Ink.

## Ficha del componente

- Anatomía: un `div` de 1 px sin márgenes propios. Con `label` o `mark` contiene dos segmentos de línea y, entre ellos, el eyebrow o el isotipo. El espacio alrededor lo define el contenedor.
- API: `SeparatorProps` extiende los atributos nativos de `div`, incluidos `className` y `ref`.
  - `orientation?: 'horizontal' | 'vertical'`, por defecto `horizontal`.
  - `tone?: 'line' | 'accent'`, por defecto `line`.
  - `inset?: boolean` reserva 1 px en cada extremo y usa un color sólido.
  - Solo en horizontal: `label?: string`, `mark?: boolean` y `align?: 'start' | 'center'`, por defecto `start`.
- Estados: no tiene estados interactivos, de carga ni de error.
- Teclado: no recibe el foco ni agrega manejadores.
- ARIA: `role="separator"` y `aria-orientation`. `label` también le da nombre con `aria-label`. El isotipo está oculto para lectores de pantalla. `aria-hidden` retira el separador del árbol de accesibilidad cuando es decorativo.
- Motion: no requiere animación.

## Identidad MOK

- `tone="line"` usa el rol `--line`, definido en los fundamentos como separación decorativa.
- `tone="accent"` es un trazo de 2 px con extremos redondeados (`--radius-pill`), por la cercanía en la forma. Usa el rol `--accent-text`: violeta profundo en claro y lima en oscuro.
- `label` usa `.mk-eyebrow`, el mismo estilo de los encabezados de sección de MOK.
- `mark` usa `.mk-mark`, el isotipo de la marca. Depende de `/brand/isotipo.svg`, igual que `Brand`.
- Dentro de `.mk-doc-hero` adopta el tratamiento oscuro aunque la página esté en tema claro: línea clara y énfasis lima.
- `inset` usa `color-mix(in srgb, var(--foreground) 18%, var(--surface))`, porque `--line` es translúcido y se oscurecería al cruzarse con un marco pintado. Ese color asume un fondo `--surface`.
- Vertical: usa `align-self: stretch`, por lo que necesita una fila flex para ocupar toda su altura. Fuera de una fila flex mide `1em` de alto.

## Ejemplos

1. Horizontal: dos bloques apilados.
2. Vertical: enlaces de navegación en una fila.
3. Énfasis de marca: trazo corto bajo un título, línea completa y separadores verticales.
4. Con etiqueta: eyebrow alineado al inicio y al centro, en ambos tonos.
5. Con isotipo: la hoja de MOK sobre la línea, en ambos tonos.
6. Sobre Ink: composición de marca dentro de `.mk-doc-hero`.
7. Marcos pintados: `inset` y `aria-hidden` dentro de un marco de 1 px pintado sobre el contenido.
8. Orientaciones: ambas orientaciones con su contenido.

## Validación

2026-10-31: tipos y compilaciones del sitio y de la biblioteca aprobados (`npm run typecheck`, `npm run build`, `npm run build:lib`). La declaración generada exporta `Separator`.

`node scripts/check-separator.mjs` aprobado en Microsoft Edge sin interfaz: tamaño y orientación, color por rol de `accent`, tipografía y nombre de `label`, alineaciones, isotipo, panel Ink, `inset` horizontal y vertical, color sólido, semántica y sin parada de Tab, en 1280 y 390 px, claro y oscuro, sin desbordamiento horizontal ni errores de consola.

Capturas de la página completa revisadas en `verification/separator-1280-light.png`, `verification/separator-1280-dark.png` y `verification/separator-390-dark.png`. La cobertura móvil usa un viewport emulado, no un teléfono físico. No se añadieron dependencias.
