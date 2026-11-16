# SplitContainer

- Fecha: 2026-11-15 · Tipo: componente
- Página: `/components/split-container`

Contenedor de dos paneles redimensionables para navegación y detalle, editor y resultado o filtros y contenido. Se exporta desde `@mokanadev/design-system` con `SplitContainerProps`.

```tsx
<SplitContainer defaultSize={35} separatorLabel="Ancho de proyectos" style={{height:320}}>
  <ProjectList />
  <ProjectDetails />
</SplitContainer>
```

## API

- `children`: exactamente dos nodos React, en orden de lectura.
- `orientation`: `horizontal` (paneles en paralelo, predeterminado) o `vertical` (apilados). La orientación ARIA corresponde al separador, perpendicular a la distribución.
- `defaultSize`: porcentaje inicial del primer panel, 50 por defecto.
- `size` y `onSizeChange`: estado controlado opcional. La aplicación decide si persiste el valor.
- `minSize` / `maxSize`: límites porcentuales del primer panel, 20 / 80 por defecto. Se normalizan entre 0 y 100; un máximo inferior al mínimo se eleva al mínimo. Los valores no finitos usan sus valores de respaldo. Límites iguales bloquean el ajuste.
- `disabled`: bloquea el ajuste sin deshabilitar el contenido.
- `stackOnMobile`: `true` por defecto; apila la distribución horizontal por debajo de 640 px, con altura automática y separador oculto. Al volver a escritorio conserva la proporción.
- `separatorLabel`: nombre accesible del control; por defecto «Tamaño del primer panel». Debe describir el panel ajustado.
- Atributos nativos de `div`, incluidos `style`, `className`, `dir` y `ref`.

Define una altura para repartir el espacio vertical o para obtener desplazamiento independiente de los paneles. Los porcentajes excluyen los 24 px del separador. El componente usa tokens de superficie, línea, texto secundario, acento, foco y radio de MOK y responde al tema heredado.

## Interacción y accesibilidad

El control expone `role="separator"`, nombre, orientación, límites, valor porcentual y `aria-controls` apuntando al primer panel. Es accesible con Tab; `disabled` o límites iguales retiran esa parada de foco.

Las flechas del eje cambian 1 punto; Mayús + flecha, 10. Inicio y Fin alcanzan los límites. La disposición horizontal respeta `dir="rtl"` en flechas y arrastre. La captura de puntero conserva el gesto fuera del control; Escape y pointercancel restauran el tamaño inicial. No se añaden listeners globales ni animaciones. Los controles de los paneles siguen funcionando cuando el tamaño está bloqueado.

Los paneles reciben foco para permitir desplazamiento con teclado incluso si no contienen controles. La aplicación aporta sus títulos y semántica. El modo móvil conserva todo el contenido y oculta el separador también del árbol accesible.

## Validación

`node scripts/check-split-container.mjs` verifica proporciones, límites, teclado, arrastre, cancelación, RTL, estado controlado, bloqueo, temas, accesibilidad y distribución móvil sobre el sitio compilado.
