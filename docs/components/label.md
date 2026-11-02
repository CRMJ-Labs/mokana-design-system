# Label

- Fecha: 2026-10-30 · Tipo: componente · Estado: hecho
- Referencia: https://vercel.com/geist/label
- Página: `/components/label`

## Pedido y alcance

Crear la etiqueta accesible de MOK para controles de formulario, con los tres ejemplos de la referencia: predeterminado, con campo y sin transformación de mayúsculas. Conserva Inter, los tokens y la estructura documental de MOK.

## Ficha del componente

- Anatomía: un elemento HTML `label`, sin envoltorios ni elementos interactivos adicionales.
- API: `LabelProps` extiende los atributos nativos de `label` de React, incluido `htmlFor`, `children`, `className`, eventos y `ref`. `bypassCasing?: boolean` conserva el texto original; por defecto se presenta con `text-transform: capitalize`.
- Estados: predeterminado y casing original. No tiene estado de carga ni estado propio de selección/error. El control asociado conserva sus estados nativos, incluidos `disabled` y `required`.
- Teclado: la etiqueta no agrega una parada de Tab; el campo recibe el foco por la navegación nativa. Pulsar o tocar la etiqueta asociada enfoca el campo. No se implementan manejadores de teclado personalizados.
- ARIA: semántica HTML nativa, sin `role` redundante. `htmlFor` coincide con un `id` único del control. No reemplaza el nombre visible con un placeholder.
- Motion: no requiere animación.
- Visual: tipografía de las etiquetas de formulario MOK; color semántico `--foreground`, herencia de la familia Inter y temas claro/oscuro existentes.

## Ejemplos

1. Predeterminado: etiqueta independiente para mostrar la tipografía.
2. Con campo: `htmlFor` y campo email con `id` coincidente; el clic enfoca el campo.
3. Texto original: el mismo campo con `bypassCasing` para preservar sentence case o nombres propios.

## Validación

2026-10-30: tipos, compilación del sitio y compilación de biblioteca aprobados (`npm run typecheck`, `npm run build`, `npm run build:lib`). La declaración generada exporta `LabelProps` y conserva los atributos y la referencia nativos.

QA aprobado en Microsoft Edge visible: 1280×960 y 390×844, ambos en claro y oscuro. Pulsar cada etiqueta enfoca el campo correcto; los campos siguen siendo editables y tienen una sola etiqueta. El casing predeterminado es `capitalize` y `bypassCasing` es `none`. Los ejemplos de código abren y cierran con Enter; la navegación de escritorio/móvil y la recarga conservan página y tema. Sin errores de página ni desbordamiento horizontal.

Capturas revisadas en `verification/label-qa-1280-light.png` y `verification/label-qa-390-dark.png`. La cobertura móvil usa viewport emulado, no un teléfono físico. No se añadieron dependencias ni se modificó el `package-lock.json` preexistente del usuario.
