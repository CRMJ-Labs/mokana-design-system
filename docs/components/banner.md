# Banner

- Fecha: 2026-10-31 · Tipo: componente · Estado: hecho
- Referencia: https://vercel.com/geist/banner
- Página: `/components/banner`

## Pedido y alcance

Crear el anuncio de ancho completo de MOK con su propia identidad. La referencia solo documenta un mensaje y un botón. La biblioteca de Figma no tiene un componente Banner (búsqueda del 2026-10-31), así que el diseño parte de los fundamentos de MOK y es una propuesta.

## Ficha del componente

- Anatomía: isotipo opcional, eyebrow opcional con separador, mensaje, acción opcional y botón de cerrar opcional.
- API: `BannerProps` extiende los atributos nativos de `aside`, incluidos `className` y `ref`.
  - `tone?: 'ink' | 'brand' | 'accent' | 'surface'`, por defecto `ink`.
  - `eyebrow?: string` y `mark?: boolean`.
  - `action?: { label, href?, target?, onClick? }`. Con `href` es un enlace con flecha; sin `href` es un botón.
  - `flush?: boolean` quita el radio y los bordes laterales.
  - `onClose?: () => void` muestra el botón de cerrar. `closeLabel?: string` cambia su nombre.
- Estados: visible y sin acción, con acción o descartable. La aplicación decide cuándo retirarlo y si recuerda la decisión.
- Teclado: la acción y el botón de cerrar se recorren con Tab, y Enter o Espacio los activan. No hay manejadores propios.
- ARIA: `aside` con el nombre «Anuncio», que se puede cambiar con `aria-label`. No usa `role="banner"`, ni se anuncia como región viva. El isotipo y el separador están ocultos para lectores de pantalla.
- Foco al cerrar: el componente no lo gestiona. Lo mueve la aplicación, como muestra el ejemplo Descartable.
- Motion: solo la transición de color del botón de cerrar, con `--duration-fast` y `--ease`.

## Identidad MOK

- `ink`: panel Ink con eyebrow y acción lima, igual en ambos temas, como el panel de la introducción.
- `brand`: violeta profundo `--accent-light` con texto Paper. No usa `--violet` porque el texto pequeño no alcanza 4.5:1, como advierten los fundamentos.
- `accent`: fondo lima con texto y acción Ink.
- `surface`: sigue el tema de la página.
- Reutiliza `.mk-eyebrow`, `.mk-mark`, `Separator`, `Button` y `ButtonLink`.
- Los tonos expresan marca. Para estados de una tarea se usa `Alert`.

## Ejemplos

1. Predeterminado.
2. Con isotipo.
3. Tonos.
4. Acción con `onClick` y estado de respuesta.
5. Descartable, con foco gestionado al cerrar y al reabrir.
6. Pegado al borde.
7. Texto largo.

## Validación

2026-10-31: `npm run typecheck`, `npm run build`, `npm run build:lib` y `npm run test:website` aprobados. La declaración generada exporta `Banner`. `scripts/check-website.mjs` usaba esta página como ejemplo de página pendiente; ahora usa `/components/book`.

`node scripts/check-banner.mjs` aprobado en Microsoft Edge sin interfaz: semántica, enlace y botón, foco al cerrar y reabrir, `flush`, contraste de 4.5:1 en mensaje, eyebrow y acción de cada tono, texto largo y límites del botón de cerrar, en 1280 y 390 px, claro y oscuro, sin desbordamiento horizontal ni errores de consola.

Capturas revisadas en `verification/banner-1280-light.png`, `verification/banner-1280-dark.png` y `verification/banner-390-dark.png`. La cabecera fija aparece superpuesta sobre el tono `accent` por la forma de capturar, no por el diseño; ese tono se ve completo en la captura móvil. La cobertura móvil usa un viewport emulado, no un teléfono físico. No se añadieron dependencias.
