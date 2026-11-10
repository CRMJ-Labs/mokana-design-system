# Ejemplo de revisión de facturas

Ruta local: `/examples/invoice-review`. Se abre desde **Revisión de facturas** en
la navegación del catálogo. Es una vista independiente dentro de este repositorio;
no modifica ni se conecta a la aplicación Arribo.

La referencia es la captura proporcionada de la factura NB-2611-0520. Los 520
ítems y los campos de cabecera se recrean para la demostración. La vista del
documento es una representación HTML, identificada como tal, no el PDF original.
Los datos, los cambios y la aprobación viven únicamente en memoria.

## Composición explícita con MOK

El ejemplo consume `src/index.ts`, la entrada pública del design system:

| Región | Componentes MOK |
| --- | --- |
| Raíz, tema y feedback | MokProvider, ThemeSwitcher, Toast |
| Estructura | AppShell, ContentContainer, PageHeader, PageToolbar |
| Navegación | Breadcrumbs, Tabs, ButtonLink |
| Datos | AdminTable, Pagination, Select, Input, Badge, Description |
| Revisión y edición | ProgressBar, Modal, FormLayout, FormGrid, Alert |
| Contexto | Drawer, Popover, Avatar, Icon |
| Consulta de un PDF local | FileUpload |

Los estilos de la vista definen composición usando los tokens de MOK. Los ajustes
de layout del shell usan sus slots públicos. El documento reconstruido mantiene
papel blanco y tinta oscura en los dos temas, como contenido documental; su tabla
HTML representa la factura, mientras `AdminTable` presenta los datos operativos.
La lógica específica de factura queda en `src/examples/invoice-review`, fuera
de los exports de la biblioteca.

## Decisiones de revisión

- Las columnas son Referencia, Descripción, Cantidad, Unidad, Precio unit. USD,
  Valor total USD y acciones. Cantidades e importes se alinean a la derecha.
- Cada dato tiene un indicador compacto: correcto, por revisar, regla fallida o
  editado. Una leyenda explica los iconos sin repetir etiquetas en todas las celdas.
- Los indicadores de atención abren el motivo y acciones para confirmar, editar
  o consultar el documento. Los editados muestran el valor anterior y el actual.
- El total se valida contra cantidad × precio unitario. Una regla fallida tiene
  prioridad visual sobre el estado editado; corregirla registra el cambio.
- Los filtros cuentan ítems, no celdas. Un ítem editado puede tener también una
  regla fallida, por lo que los grupos pueden coincidir.
- La referencia seleccionada localiza la fila correspondiente del documento.
- El documento conserva los valores originales aunque se editen los extraídos.
- El ejemplo comienza con cuatro datos que requieren atención: uno de cabecera,
  dos por revisar y un total incorrecto. El progreso solo llega a 100 % al resolverlos.
- Cabecera, ítems y reglas tienen contextos separados.
- La aprobación local requiere completar el NIT, confirmar los datos pendientes
  y resolver las reglas fallidas; después solicita confirmación explícita.
- La búsqueda, los filtros, la paginación, el historial y la exportación CSV son funcionales.
- En portátil, la navegación se reduce a iconos para conservar ambas columnas.
- En tablet y móvil, el documento se consulta bajo demanda y los datos complementarios
  se presentan mediante el comportamiento responsive de Table.
- Un PDF elegido con FileUpload se abre mediante una URL local; no se envía a un servidor
  y no reemplaza los datos recreados por una extracción automática.

## Verificación

`node scripts/check-invoice-review.mjs` comprueba selección vinculada, búsqueda,
filtros, paginación, edición, dato pendiente, progreso, reglas, historial,
exportación y aprobación; también los temas claro/oscuro y ventanas de
390, 768, 1280 y 1920 px. Sus informes y capturas se guardan en `verification/`.
