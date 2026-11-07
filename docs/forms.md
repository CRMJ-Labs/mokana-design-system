# Sistema de formularios

La estructura oficial combina `FormLayout`, `FormGrid`, `FormErrorSummary`, `Fieldset` y los controles MOK.

- `FormLayout` ordena feedback, contenido y acciones.
- `Fieldset` agrupa campos por intención.
- `FormGrid` distribuye campos relacionados y vuelve a una columna en espacios estrechos.
- `FormErrorSummary` enlaza errores con campos y recibe foco cuando cambia el conjunto de errores.
- `FormReadOnly` presenta datos no editables sin fingir un control deshabilitado.

La aplicación debe controlar valores, mutaciones, archivos, permisos, bloqueo de rutas y traducción de errores remotos. El botón de envío utiliza `loading` para impedir el doble submit.

Consulta `/patterns/forms` para el ejemplo integrado con error local, error remoto, campos condicionales, archivo, cambios pendientes, confirmación de descarte y éxito.
