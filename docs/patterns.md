# Catálogo de patrones MOK

El catálogo público vive en `/patterns` y su representación estructurada se exporta como `patternCatalog`. Cada entrada identifica tarea principal, criterios de uso, estados obligatorios, responsive, accesibilidad y componentes base.

## Contrato

Un patrón no es una captura ni un componente monolítico. Es una decisión repetible de producto compuesta con APIs públicas de MOK. La aplicación conserva rutas, datos, permisos, contenido y reglas de negocio.

Los patrones estables son: plataforma administrativa, CRUD, formularios completos, dashboard, CRM, autenticación, configuración, filtros y estados vacíos.

Antes de adoptar uno:

1. Comprueba que su tarea principal coincide con la tarea real.
2. Implementa todos sus estados obligatorios.
3. Conserva su jerarquía responsive y accesible.
4. Sustituye datos y acciones demostrativas.
5. Documenta cualquier excepción.
