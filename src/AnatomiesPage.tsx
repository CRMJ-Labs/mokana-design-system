import {Button} from './components';
import {CodeDisclosure} from './CodeComponents';
import {PageHeader,PageLayout,PageToolbar} from './ApplicationLayout';
import './integration-documentation.css';

const example=`<PageLayout
  header={<PageHeader title="Proyectos" actions={<Button>Nuevo proyecto</Button>} />}
  feedback={notice}
  toolbar={<PageToolbar>…</PageToolbar>}
  filters={<FilterBar>…</FilterBar>}
  aside={<ProjectSummary />}
  footer={<Pagination … />}
>
  <AdminTable … />
</PageLayout>`;

const rows=[
  ['AppShell','header · navigation · sidebar · main · footer','Regiones persistentes de la aplicación.'],
  ['PageLayout','header · feedback · toolbar · filters · content · aside · footer','Orden estable de una página.'],
  ['FormLayout','feedback · content · grid · actions','Envío, errores y acciones de formulario.'],
  ['Fieldset','legend · description · controls · error · warning · footer · actions','Grupo semántico de campos.'],
  ['AdminTable','toolbar · table · state · footer · row actions','Operaciones sobre entidades.'],
  ['Modal','header · title · body · footer','Decisión bloqueante con foco controlado.'],
  ['Popover','trigger · content · header','Contenido contextual no bloqueante.'],
];

export function AnatomiesPage(){
  return <article className="mk-docs-component-page mk-integration"><header><p className="mk-eyebrow">COMPOSICIÓN PÚBLICA</p><h1>Anatomías y slots</h1><p>Personaliza contenido y layout mediante regiones estables sin copiar la estructura interna de los componentes.</p></header>
    <nav className="mk-pending-index" aria-label="Secciones de anatomías"><a href="#contract">Contrato</a><a href="#inventory">Inventario</a><a href="#composition">Composición</a><a href="#rules">Reglas</a></nav>
    <section id="contract"><h2>Dos niveles de contrato</h2><p>Las propiedades como <code>header</code>, <code>actions</code>, <code>feedback</code> y <code>footer</code> son la primera opción para componer. Los atributos <code>data-slot</code> nombran las regiones resultantes para inspección, pruebas y ajustes de layout documentados.</p><p>Las clases internas no son API pública. Los slots no permiten reemplazar gestión de foco, semántica ni comportamiento.</p></section>
    <section id="inventory"><h2>Inventario</h2><div className="mk-api-scroll" tabIndex={0} role="region" aria-label="Anatomías públicas"><table><caption>Componentes complejos y sus regiones</caption><thead><tr><th scope="col">Componente</th><th scope="col">Slots</th><th scope="col">Responsabilidad</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table></div></section>
    <section id="composition"><h2>PageLayout</h2><p>PageLayout conecta regiones ya existentes y mantiene su orden. No reemplaza PageHeader, PageToolbar, FilterBar ni AdminTable.</p><CodeDisclosure code={example}/><PageLayout header={<PageHeader headingLevel={2} title="Proyectos" description="Ejemplo mínimo de anatomía." actions={<Button size="sm">Nuevo proyecto</Button>}/>} toolbar={<PageToolbar><span>Búsqueda y controles de vista</span></PageToolbar>} aside={<div className="mk-specimen"><strong>Resumen</strong><p>Contenido contextual.</p></div>}><div className="mk-specimen"><strong>Contenido principal</strong><p>La aplicación decide qué entidad y datos renderizar.</p></div></PageLayout></section>
    <section id="rules"><h2>Reglas de uso</h2><ul><li>Prefiere props de composición antes de seleccionar un data-slot.</li><li>Usa tokens semánticos; no replique valores visuales internos.</li><li>No alteres orden de foco, roles o contenido accesible desde CSS.</li><li>Un slot recibe contenido del producto; el componente conserva su interacción.</li><li>Si la misma personalización aparece en varios productos, conviértela en una prop antes de extender CSS.</li></ul></section>
  </article>;
}
