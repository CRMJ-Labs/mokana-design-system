# Starter oficial de plataforma administrativa

El starter convierte las reglas de `MOK_DESIGN.md` en una aplicación React + Vite que puede copiarse y adaptar. Vive en `starters/admin-platform` y usa únicamente la API pública de MOK.

## Anatomía incluida

1. `MokProvider` como raíz única.
2. `AppShell` con sidebar expandido y compacto.
3. Topbar con control de navegación, búsqueda global, notificaciones e invitación.
4. Menú de cuenta al final del sidebar.
5. Navegación móvil con las tareas prioritarias.
6. `ContentContainer`, `PageHeader`, `PageToolbar` y `FilterBar`.
7. `AdminTable` con prioridades responsive y `DotsMenu`.
8. Estados demostrables de carga, error, vacío y feedback.
9. Plantillas conectadas de listado, formulario, detalle y configuración.

## Plantillas completas

### Listado administrativo

Combina identidad de página, búsqueda, filtros, tabla responsive, acciones por fila y estados de carga, error y vacío. Los filtros que deban compartirse o sobrevivir una recarga deben migrarse a la URL del producto.

### Crear y editar

Ambos modos comparten el mismo contrato de formulario. Los campos se agrupan por intención, los errores aparecen después del envío y el foco se mueve al primer campo inválido. En producción, asocia también los errores devueltos por el servidor.

### Detalle

Conserva la identidad de la entidad, presenta metadatos comparables, actividad y acciones jerarquizadas. La eliminación utiliza confirmación y debe sustituirse por la política real de permisos y recuperación.

### Configuración

Agrupa preferencias por tema y utiliza guardado explícito. Los cambios inmediatos deben reservarse para preferencias personales reversibles; las configuraciones compartidas requieren confirmación de guardado.

## Responsabilidades de la aplicación

El starter no decide rutas, permisos, consultas, mutaciones ni reglas de negocio. Al adoptarlo:

- Conecta la navegación con el router real.
- Sustituye los datos locales por tu capa de acceso a datos.
- Lleva filtros compartibles a la URL.
- Conecta formularios y confirmaciones a operaciones reales.
- Resuelve permisos tanto en la interfaz como en el servidor.
- Mantén los estados de carga, error y vacío aunque cambie la fuente de datos.
- Sustituye la navegación local entre plantillas por rutas reales y URLs recuperables.

## Regla de adaptación

Cambia contenido y composición antes de cambiar componentes. No copies estilos internos de MOK ni reemplaces `AdminTable`, `DotsMenu`, formularios u overlays con versiones locales. Si falta un contrato reutilizable, propón primero su incorporación al DS.

Consulta el `README.md` dentro del starter para instalarlo y para conocer qué partes deben eliminarse antes de producción.
