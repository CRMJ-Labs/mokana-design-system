# Anatomías y slots

Los componentes complejos exponen regiones nombradas mediante propiedades y atributos `data-slot`. Las propiedades componen contenido; `data-slot` sirve para inspección, pruebas y personalizaciones de layout documentadas. No sustituye los tokens ni autoriza copiar estilos internos.

## AppShell

Slots: `app-shell`, `app-header`, `app-navigation`, `app-body`, `app-sidebar`, `app-main` y `app-footer`.

Propiedades de composición: `header`, `navigation`, `sidebar`, `footer` y `children`.

## PageLayout

Slots: `page-layout`, `page-layout-header`, `page-layout-feedback`, `page-layout-toolbar`, `page-layout-filters`, `page-layout-body`, `page-layout-content`, `page-layout-aside` y `page-layout-footer`.

El orden es estable: identidad, feedback, herramientas, filtros, contenido y pie. `aside` pasa debajo del contenido en espacios estrechos.

## FormLayout

Slots: `form-root`, `form-feedback`, `form-content`, `form-grid`, `form-actions`, `form-error-summary` y `form-readonly`.

`Fieldset` añade legend, description, controls, error, warning, footer, actions y disabled-wall.

## Overlays

`Modal` expone modal, header, title, body y footer. `Popover` expone raíz, trigger, content y header. La gestión de foco y cierre sigue perteneciendo al componente; no debe reemplazarse desde el slot.

## Reglas

- Usa primero las propiedades de composición.
- Usa `data-slot` como selector estable únicamente cuando un token o prop de layout no resuelva la necesidad.
- No cambies semántica, orden de foco ni visibilidad accesible mediante CSS.
- No dependas de clases internas `mk-*` desde una aplicación consumidora.
- Un slot acepta contenido de la aplicación, no lógica interna del DS.
