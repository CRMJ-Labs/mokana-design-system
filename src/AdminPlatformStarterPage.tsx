import {CodeDisclosure} from './CodeComponents';
import './integration-documentation.css';

const tree=`admin-platform/
├─ src/
│  ├─ pages/
│  │  ├─ ProjectsListPage.tsx
│  │  ├─ ProjectFormPage.tsx
│  │  ├─ ProjectDetailPage.tsx
│  │  └─ SettingsPage.tsx
│  ├─ App.tsx       # shell y navegación entre plantillas
│  ├─ data.ts       # tipos y datos demostrativos
│  ├─ app.css       # composición con tokens semánticos
│  └─ main.tsx      # estilos públicos y montaje
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts`;

const root=`import { MokProvider } from "@mokanadev/design-system";

export function App() {
  return <MokProvider defaultTheme="system" storageKey="my-admin-theme">
    <AdminApp />
  </MokProvider>;
}`;

export function AdminPlatformStarterPage(){
  return <article className="mk-docs-component-page mk-integration">
    <header><p className="mk-eyebrow">STARTER OFICIAL</p><h1>Plataforma administrativa</h1><p>Una base completa y copiable para iniciar productos internos, back offices y paneles operativos con MOK.</p></header>
    <nav className="mk-pending-index" aria-label="Secciones del starter"><a href="#included">Incluye</a><a href="#templates">Plantillas</a><a href="#structure">Estructura</a><a href="#adopt">Adopción</a><a href="#done">Antes de producción</a></nav>
    <section id="included"><h2>Decisiones resueltas</h2><p>El starter conecta el proveedor, el shell, la navegación responsive, la cuenta, la anatomía de página y la tabla administrativa oficial. También permite comprobar carga, error, vacío y feedback sin inventar estados en cada proyecto.</p><ul><li>Sidebar con modo expandido y compacto mediante la API pública de AppShell.</li><li>Control de apertura dentro de la topbar, búsqueda global y acciones globales.</li><li>Usuario al final del sidebar con perfil, configuración, tema y cierre de sesión.</li><li>Tabla con identidad, estado, prioridades responsive y un DotsMenu por fila.</li><li>Navegación móvil que conserva las tareas prioritarias.</li></ul></section>
    <section id="templates"><h2>Plantillas completas de página</h2><p>El proyecto conecta cuatro páginas para mostrar el recorrido completo de una entidad.</p><div className="mk-api-scroll" tabIndex={0} role="region" aria-label="Plantillas incluidas"><table><caption>Responsabilidad de cada plantilla</caption><thead><tr><th scope="col">Plantilla</th><th scope="col">Incluye</th><th scope="col">La aplicación conecta</th></tr></thead><tbody><tr><td>Listado</td><td>Búsqueda, filtros, tabla, acciones y estados.</td><td>Consulta, URL y paginación remota.</td></tr><tr><td>Crear / editar</td><td>Secciones, validación y foco en errores.</td><td>Mutación, errores del servidor y permisos.</td></tr><tr><td>Detalle</td><td>Resumen, actividad y confirmación destructiva.</td><td>Datos, auditoría y recuperación.</td></tr><tr><td>Configuración</td><td>Preferencias agrupadas y guardado explícito.</td><td>Persistencia y alcance organizacional.</td></tr></tbody></table></div></section>
    <section id="structure"><h2>Estructura copiable</h2><p>Los archivos viven en <code>starters/admin-platform</code> y se publican junto al paquete para que el equipo pueda copiarlos sin depender del sitio de documentación.</p><CodeDisclosure code={tree}/><CodeDisclosure code={root}/></section>
    <section id="adopt"><h2>Cómo adoptarlo</h2><ol><li>Copia el directorio del starter a la aplicación nueva.</li><li>Instala dependencias y ejecuta el build antes de cambiar la estructura.</li><li>Conecta el router, la sesión y la capa de datos del producto.</li><li>Sustituye entidades y textos, conservando las regiones oficiales.</li><li>Define una paleta en MokProvider si el producto no usa la oficial.</li><li>Prueba temas, teclado, foco y responsive con datos reales.</li></ol></section>
    <section id="done"><h2>Antes de producción</h2><p>Elimina los controles demostrativos de estados, reemplaza todos los handlers locales, aplica permisos reales y revisa la definición de terminado de <code>MOK_DESIGN.md</code>. El starter es una base de producto, no una capa de datos ni un sistema de autorización.</p></section>
  </article>;
}
