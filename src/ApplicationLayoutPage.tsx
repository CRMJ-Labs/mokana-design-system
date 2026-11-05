import {useState} from 'react';
import {AdminTable} from './AdminTable';
import {AppShell,ContentContainer,FilterBar,PageHeader,PageToolbar} from './ApplicationLayout';
import {Badge,Button,Select,type Column} from './components';
import {Input} from './Input';
import {CodeDisclosure} from './CodeComponents';
import './application-layout-page.css';

const equipment=[
  {id:'EQ-001',name:'Tolva de recepción',dimensions:'4.2 m × 2.4 m × 2.8 m',validation:'No validada',status:'Activo'},
  {id:'EQ-002',name:'Banda transportadora',dimensions:'12 m × 0.9 m × 1.1 m',validation:'Pendiente',status:'Activo'},
  {id:'EQ-003',name:'Mezclador industrial',dimensions:'3.1 m × 2.6 m × 2.9 m',validation:'Validada',status:'Inactivo'},
];
type Equipment=typeof equipment[number];
const equipmentColumns:Column<Equipment>[]=[
  {key:'equipment',header:'Equipo',minWidth:180,responsivePriority:'primary',sortValue:row=>row.name,render:row=><span className="mk-admin-identity"><strong>{row.name}</strong><small>{row.id}</small></span>},
  {key:'dimensions',header:'Dimensiones',responsivePriority:'tertiary',minWidth:160,render:row=>row.dimensions},
  {key:'validation',header:'Ficha técnica',responsivePriority:'secondary',minWidth:130,render:row=><Badge size="sm" tone={row.validation==='Validada'?'success':'warning'} subtle>{row.validation}</Badge>},
  {key:'status',header:'Estado',responsivePriority:'secondary',minWidth:100,render:row=><Badge size="sm" tone={row.status==='Activo'?'success':'neutral'} subtle>{row.status}</Badge>},
];

function AdminTableExample(){
  const [message,setMessage]=useState('Selecciona una acción de fila.');
  return <div className="mk-admin-example"><AdminTable caption="Equipos registrados" rows={equipment} columns={equipmentColumns} rowKey={row=>row.id} rowActionLabel={row=>`Acciones de ${row.name}`} rowActions={row=>[
    {id:'history',label:'Ver historial',onSelect:()=>setMessage(`Historial abierto para ${row.name}.`)},
    {id:'edit',label:'Editar equipo',onSelect:()=>setMessage(`Editando ${row.name}.`)},
    {id:'validate',label:'Validar ficha',disabled:row.validation==='Validada',onSelect:()=>setMessage(`Validación iniciada para ${row.name}.`)},
    {id:'deactivate',label:row.status==='Activo'?'Desactivar':'Activar',danger:row.status==='Activo',onSelect:()=>setMessage(`${row.name}: cambio de estado solicitado.`)},
  ]}/><p className="mk-admin-example-status" role="status">{message}</p></div>;
}

const example=`<AppShell header={<ProductHeader />} sidebar={<Navigation />}>
  <ContentContainer size="wide">
    <PageHeader
      eyebrow="Inventario"
      title="Equipos"
      description="Administra equipos y documentación técnica."
      actions={<Button>Nuevo equipo</Button>}
    />
    <PageToolbar>
      <Input label="Buscar" search placeholder="Código o nombre" />
    </PageToolbar>
    <FilterBar actions={<Button variant="ghost">Limpiar</Button>}>
      <StatusFilter />
      <ValidationFilter />
    </FilterBar>
    <AdminTable
      caption="Equipos registrados"
      rows={equipment}
      columns={columns}
      rowKey={row => row.id}
      rowActionLabel={row => \`Acciones de \${row.name}\`}
      rowActions={row => equipmentActions(row)}
    />
  </ContentContainer>
</AppShell>`;

export function ApplicationLayoutPage(){
  return <article className="mk-docs-component-page mk-application-layout-page"><header><p className="mk-eyebrow">ESTRUCTURA DE PRODUCTO</p><h1>Layout de aplicación</h1><p>Regiones, ancho y jerarquía estables para que cada pantalla no reconstruya su composición.</p></header>
    <section id="complete"><h2>Composición completa</h2><p>El shell organiza las regiones globales. El contenedor y los encabezados controlan el ritmo de la página; la tabla no debe decidirlo.</p>
      <div className="mk-layout-preview">
        <AppShell mainId="layout-preview-main" header={<div className="mk-layout-preview-header"><strong>MOK Operaciones</strong><span>milton@empresa.com</span></div>} sidebar={<div className="mk-layout-preview-sidebar"><strong>Administración</strong><span aria-current="page">Equipos</span><span>Proyectos</span></div>}>
          <ContentContainer size="wide">
            <PageHeader eyebrow="Inventario" title="Equipos" description="Administra equipos y documentación técnica." actions={<Button>Nuevo equipo</Button>}/>
            <PageToolbar><Input label="Buscar" search placeholder="Código o nombre"/></PageToolbar>
            <FilterBar actions={<Button variant="ghost" size="sm">Limpiar</Button>}><Select label="Estado" options={[{value:'active',label:'Activos'},{value:'inactive',label:'Inactivos'}]}/><Select label="Ficha técnica" options={[{value:'all',label:'Todas'},{value:'pending',label:'Pendientes'}]}/></FilterBar>
            <AdminTableExample/>
          </ContentContainer>
        </AppShell>
      </div><CodeDisclosure code={example}/>
    </section>
    <section id="rules"><h2>Reglas de composición</h2><ul><li>Usa una sola acción primaria en PageHeader.</li><li>Ubica búsqueda y controles de vista en PageToolbar.</li><li>Reserva FilterBar para controles que alteran el conjunto de datos.</li><li>Usa ContentContainer wide para tablas extensas y default para páginas normales.</li><li>AdminTable añade exactamente un DotsMenu por fila; no apiles botones en la última columna.</li><li>Las columnas primary permanecen visibles; secondary pasan al detalle bajo 480 px y tertiary bajo 720 px del contenedor.</li><li>AppShell debe vivir dentro de la raíz .mk o PaletteProvider.</li></ul></section>
  </article>;
}
