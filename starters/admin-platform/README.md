# Starter administrativo de MOK

Aplicación React + Vite de referencia para iniciar una plataforma administrativa con APIs públicas de `@mokanadev/design-system`.

## Inicio

```bash
cp -R node_modules/@mokanadev/design-system/starters/admin-platform ./mi-plataforma
cd mi-plataforma
npm install
npm run dev
```

Si trabajas dentro del repositorio del DS, instala primero las dependencias de este directorio y cambia temporalmente la dependencia del paquete por `file:../..` para probar la versión local.

## Qué incluye

- `MokProvider` como única raíz de tema, paleta y notificaciones.
- `AppShell` con sidebar expandido y compacto.
- Topbar con búsqueda global, notificaciones e invitación.
- Navegación móvil priorizada.
- Menú de cuenta al final del sidebar.
- Anatomía oficial de página: `ContentContainer`, `PageHeader`, `PageToolbar` y `FilterBar`.
- `AdminTable` con prioridades responsive, orden, estados y `DotsMenu` por fila.
- Ejemplos locales de carga, error, vacío y feedback.
- Cuatro plantillas conectadas: listado, crear/editar, detalle y configuración.

## Plantillas de página

| Archivo | Responsabilidad |
| --- | --- |
| `pages/ProjectsListPage.tsx` | Búsqueda, filtros, tabla, acciones por fila y estados de datos. |
| `pages/ProjectFormPage.tsx` | Crear y editar con secciones, validación y foco en el primer error. |
| `pages/ProjectDetailPage.tsx` | Identidad, metadatos, actividad, edición y acción destructiva confirmada. |
| `pages/SettingsPage.tsx` | Preferencias agrupadas y guardado explícito. |

`App.tsx` conecta las plantillas con estado local para demostrar el recorrido. Sustituye su tipo `Route` por el router del producto; no conserves un router paralelo basado en estado local.

## Qué debes reemplazar

1. Sustituye `initialProjects` por tu capa de datos.
2. Conecta los enlaces con el router de tu aplicación.
3. Reemplaza los handlers demostrativos por permisos, mutaciones y confirmaciones reales.
4. Mantén el estado de búsqueda y filtros en la URL cuando deba compartirse.
5. Elimina los controles “Carga / Error / Vacío” antes de producción, pero conserva esos estados en la integración real.
6. Define la paleta del producto en `MokProvider` cuando no uses la oficial.

No copies estilos internos del DS. `app.css` contiene únicamente composición específica de esta plataforma y usa tokens semánticos.
