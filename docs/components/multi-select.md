# Multi Select

- Fecha: 2026-10-31 · Tipo: componente · Estado: hecho
- Referencia: https://vercel.com/geist/multi-select
- Página: `/components/multi-select`

## Pedido y alcance

Crear el desplegable de selección múltiple de MOK a partir de la referencia, con sus tres ejemplos: acciones de selección, navegación por teclado y estado controlado. Conserva Inter, los tokens y la estructura documental de MOK, y añade ejemplos de deshabilitado, sin opciones y posición.

## Ficha del componente

- Anatomía: etiqueta, activador con resumen y chevron, y un panel con filas. Cada fila combina el `Checkbox` de MOK y un botón con el nombre y la acción disponible.
- API: `label`, `options` (`value`, `label`, `disabled?`), `value`, `defaultValue`, `onChange(value: string[])`, `placeholder`, `summary(selected, options)`, `emptyMessage`, `position`, `hideLabel`, `disabled`, `id` y `className`. Se usa una sola pieza basada en datos, como `Menu`, en lugar de las piezas compuestas de la referencia.
- Estados: cerrado, abierto, sin selección, una selección, varias, todas, opción deshabilitada, control deshabilitado y lista vacía.
- Acción de la fila: una opción sin marcar ofrece Solo. Una opción marcada ofrece Marcar todos si quedan otras sin marcar, y Solo si están todas marcadas. Con una única opción habilitada, la acción marca o desmarca. Solo y Marcar todos no cambian las opciones deshabilitadas.
- Teclado: Enter, Espacio o las flechas abren el panel desde el activador. Arriba, Abajo, Inicio y Fin cambian de fila y conservan la columna; Izquierda y Derecha alternan entre checkbox y acción. Enter o Espacio activan el control enfocado. Escape cierra y devuelve el foco al activador. Tab cierra y continúa por la página, como `Menu` y la demo real de Geist.
- ARIA: el activador usa `aria-haspopup="dialog"`, `aria-expanded` y un nombre compuesto por la etiqueta y el resumen, por lo que nunca queda vacío. El panel es un `dialog` con nombre. Cada checkbox se nombra con su opción y cada acción como `Opción. Acción`, igual que el texto visible.
- Motion: sin animación; el chevron gira al abrir.
- Visual: el activador sigue la forma de los campos MOK (`--radius-sm`, borde `--secondary`, 44 px) y el panel la de `Menu`. Colores semánticos y temas claro/oscuro existentes. En pantallas táctiles la acción queda siempre visible.

## Ejemplos

1. Acciones de selección: dos de tres opciones marcadas.
2. Navegación por teclado: cuatro categorías con los atajos documentados.
3. Estado controlado: botones externos que modifican `value` y muestran el resultado.
4. Deshabilitado: control completo y opción bloqueada.
5. Sin opciones: mensaje específico en `emptyMessage`.
6. Posición: las cuatro alineaciones, con cambio de lado y ajuste a la ventana.

## Validación

2026-10-31: tipos y compilaciones del sitio y de la biblioteca aprobados (`npm run typecheck`, `npm run build`, `npm run build:lib`). La declaración generada exporta `MultiSelect` y sus tipos.

`node scripts/check-multi-select.mjs` aprobado en Microsoft Edge sin interfaz: acciones, teclado, foco, ratón, estado controlado, deshabilitado, lista vacía y límites del panel en 1280 y 390 px, claro y oscuro, sin desbordamiento horizontal ni errores de consola.

Capturas revisadas en `verification/multi-select-1280-light.png` y `verification/multi-select-390-dark.png`. La cobertura móvil usa un viewport emulado, no un teléfono físico; la regla para pantallas táctiles no se ejercitó. No se añadieron dependencias.

