import {useState} from 'react';
import {Avatar} from './Avatar';
import {Badge,Button,Icon} from './components';
import {DotsMenu} from './DotsMenu';
import {Table,type Column,type TableDensity,type TableVariant} from './Table';
import {DataTable} from './DataTable';
import {ComponentPage,Example} from './PendingPage';
import './table-documentation.css';

const projects=[
  {id:'mok',name:'MOK Design System',domain:'design.mok.dev',owner:'Ana Torres',status:'Activo',budget:24000,updated:'Hace 2 minutos'},
  {id:'portal',name:'Portal de clientes',domain:'portal.acme.com',owner:'Diego Ruiz',status:'En revisión',budget:18500,updated:'Hace 30 minutos'},
  {id:'api',name:'API de pagos',domain:'api.acme.com',owner:'Laura Gómez',status:'Activo',budget:32000,updated:'Hace 1 hora'},
  {id:'commerce',name:'Tienda online',domain:'shop.acme.com',owner:'Ana Torres',status:'Pausado',budget:12500,updated:'Hace 3 horas'},
  {id:'mobile',name:'Aplicación móvil',domain:'mobile.acme.com',owner:'Diego Ruiz',status:'Activo',budget:48000,updated:'Ayer'},
  {id:'analytics',name:'Analytics',domain:'analytics.acme.com',owner:'Laura Gómez',status:'En revisión',budget:9500,updated:'Ayer'},
  {id:'docs',name:'Documentación',domain:'docs.acme.com',owner:'Ana Torres',status:'Pausado',budget:5000,updated:'Hace 2 días'},
];
type Project=typeof projects[number];
const money=new Intl.NumberFormat('es-CO',{style:'currency',currency:'USD',maximumFractionDigits:0});
const columns:Column<Project>[]=[
  {key:'name',header:'Proyecto',minWidth:230,sortValue:row=>row.name,render:row=><div className="mk-table-cell"><span className="mk-table-doc-project-icon"><Icon name="folder" size={18}/></span><span className="mk-table-cell-copy"><strong>{row.name}</strong><small>{row.domain}</small></span></div>},
  {key:'owner',header:'Responsable',minWidth:180,sortValue:row=>row.owner,render:row=><div className="mk-table-cell"><Avatar name={row.owner} size={28}/><span>{row.owner}</span></div>},
  {key:'status',header:'Estado',minWidth:130,sortValue:row=>row.status,render:row=><Badge size="sm" subtle tone={row.status==='Activo'?'success':row.status==='En revisión'?'warning':'neutral'} icon={row.status==='Activo'?'check':row.status==='En revisión'?'clock':false}>{row.status}</Badge>},
  {key:'budget',header:'Presupuesto',align:'right',minWidth:130,sortValue:row=>row.budget,render:row=><span className="mk-table-number">{money.format(row.budget)}</span>},
];

function WorkspaceTable(){
  const [rows,setRows]=useState(projects);const [selected,setSelected]=useState<string[]>([]);const [message,setMessage]=useState('Los cambios de este ejemplo solo afectan a los datos locales.');
  const richColumns:Column<Project>[]=[...columns,{key:'actions',header:<span className="mk-sr-only">Acciones</span>,align:'right',width:56,render:row=><DotsMenu size="sm" label={`Acciones de ${row.name}`} position="bottom-end" items={[{id:'details',label:'Ver detalles',prefix:<Icon name="info" size={16}/>,onSelect:()=>setMessage(`${row.name}: ${row.owner}, ${row.status.toLocaleLowerCase()}, presupuesto ${money.format(row.budget)}.`)},{id:'duplicate',label:'Duplicar proyecto',prefix:<Icon name="copy" size={16}/>,onSelect:()=>{setRows(current=>[...current,{...row,id:`${row.id}-${Date.now()}`,name:`${row.name} (copia)`}]);setMessage('Proyecto duplicado en esta demostración.');}}]}/> }];
  return <div className="mk-table-doc-stack"><DataTable caption="Proyectos del equipo" rows={rows} columns={richColumns} rowKey={row=>row.id} searchText={row=>`${row.name} ${row.owner} ${row.status}`} searchLabel="Buscar proyectos en la tabla" pageSize={4} defaultSort={{key:'name',direction:'asc'}} selection={{selectedKeys:selected,onChange:setSelected,rowLabel:row=>row.name}} actions={<Button type="button" variant="ghost" size="sm" prefix="refresh" onClick={()=>{setRows(projects);setSelected([]);setMessage('Datos de demostración restablecidos.');}}>Restablecer datos</Button>} selectionActions={<Button type="button" size="sm" prefix="archive" onClick={()=>{setRows(current=>current.filter(row=>!selected.includes(row.id)));setMessage(`${selected.length} proyectos archivados en esta demostración.`);setSelected([]);}}>Archivar selección</Button>} empty="No hay coincidencias. Prueba otro proyecto, responsable o estado."/><p className="mk-table-doc-status" role="status">{message}</p></div>;
}

function TableVariants(){
  const [density,setDensity]=useState<TableDensity>('normal');const [variant,setVariant]=useState<TableVariant>('bordered');
  return <div className="mk-table-doc-stack"><div className="mk-table-doc-controls"><label>Densidad<select value={density} onChange={event=>setDensity(event.target.value as TableDensity)}><option value="compact">Compacta</option><option value="normal">Normal</option><option value="comfortable">Cómoda</option></select></label><label>Superficie<select value={variant} onChange={event=>setVariant(event.target.value as TableVariant)}><option value="bordered">Con borde</option><option value="plain">Abierta</option><option value="striped">Filas alternadas</option></select></label></div><Table caption="Comparar presentaciones" columns={columns} rows={projects.slice(0,3)} rowKey={row=>row.id} density={density} variant={variant}/></div>;
}

function ErrorExample(){
  const [failed,setFailed]=useState(true);
  return <div className="mk-table-doc-stack"><Table caption="Estado de conexión" columns={columns} rows={projects.slice(0,2)} rowKey={row=>row.id} error={failed?'No pudimos cargar los proyectos. Vuelve a intentarlo.':undefined} onRetry={()=>setFailed(false)}/>{!failed&&<Button type="button" variant="ghost" size="sm" onClick={()=>setFailed(true)}>Simular error</Button>}</div>;
}

function SelectionExample(){
  const [selected,setSelected]=useState<string[]>([]);
  return <div className="mk-table-doc-stack"><Table caption="Selección de proyectos activos" rows={projects.slice(0,4)} columns={columns.filter(column=>column.key==='name'||column.key==='status')} rowKey={row=>row.id} selection={{selectedKeys:selected,onChange:setSelected,rowLabel:row=>row.name,isDisabled:row=>row.status==='Pausado'}}/><p role="status" className="mk-table-doc-status">{selected.length} seleccionados. Los proyectos pausados no se pueden seleccionar.</p></div>;
}

export function TablePage(){
  return <ComponentPage title="Table" intro="Un sistema para presentar y explorar datos: jerarquía de celdas, densidades, ordenación, selección y estados de contenido." reference="https://vercel.com/geist/table" sections={[["default","Tabla de trabajo"],["variants","Densidad y superficie"],["sorting","Ordenación numérica"],["selection","Selección controlada"],["sticky","Encabezado fijo"],["loading","Cargando"],["empty","Sin resultados"],["error","Error y recuperación"]]} guidelines={<>
    <p>Usa Table para controlar los datos desde tu aplicación o servidor. DataTable añade búsqueda local, ordenación antes de paginar y navegación entre páginas. El filtrado usa searchText para decidir qué datos se pueden buscar; no depende del contenido renderizado.</p>
    <p>Column admite render, align, width, minWidth y sortValue. Las cifras se alinean a la derecha y se ordenan como números. Usa celdas de dos líneas para identidad y contexto, badges para estados y un menú con nombre específico para las acciones de cada fila.</p>
    <p>La selección es controlada mediante selectedKeys, onChange y rowLabel; isDisabled excluye filas de la selección general. El checkbox del encabezado opera sobre las filas visibles y conserva las seleccionadas en otras páginas. La selección parcial usa el estado nativo indeterminate.</p>
    <p>Conserva caption, encabezados scope="col" y aria-sort. La región permite desplazamiento horizontal con teclado en pantallas pequeñas, sin ocultar columnas. Los controles mantienen nombres accesibles y las filas no actúan como botones.</p>
    <p>Elige compact para tablas operativas, normal como base y comfortable para lectura. stickyHeader requiere limitar maxHeight. Para ordenar en el servidor, usa sortMode="manual", sort y onSortChange; la aplicación gestiona la petición y sus estados loading y error.</p>
  </>}>
    <Example id="default" title="Tabla de trabajo" description="Busca por proyecto, responsable o estado. Ordena columnas, selecciona filas entre páginas y prueba acciones locales." code={'<DataTable caption="Proyectos del equipo" columns={columns}\n  rows={projects} rowKey={row => row.id}\n  searchText={row => `${row.name} ${row.owner} ${row.status}`}\n  pageSize={4} defaultSort={{ key: "name", direction: "asc" }}\n  selection={{ selectedKeys, onChange: setSelectedKeys, rowLabel: row => row.name }}\n/>'}><WorkspaceTable/></Example>
    <Example id="variants" title="Densidad y superficie" description="Una misma estructura con tres ritmos verticales y tres tratamientos de superficie." code={'<Table caption="Proyectos" rows={projects} columns={columns}\n  rowKey={row => row.id} density="compact" variant="striped" />'}><TableVariants/></Example>
    <Example id="sorting" title="Ordenación numérica" description="El presupuesto utiliza su valor numérico; el formato de moneda solo afecta a la presentación." code={'const columns = [{ key: "budget", header: "Presupuesto", align: "right",\n  sortValue: row => row.budget, render: row => formatCurrency(row.budget) }];\n<Table caption="Presupuestos" rows={projects} columns={columns}\n  rowKey={row => row.id} defaultSort={{ key: "budget", direction: "desc" }} />'}><Table caption="Presupuestos" columns={columns.filter(column=>column.key==='name'||column.key==='budget')} rows={projects} rowKey={row=>row.id} defaultSort={{key:'budget',direction:'desc'}}/></Example>
    <Example id="selection" title="Selección controlada" description="La cabecera refleja la selección parcial y omite las filas deshabilitadas al seleccionar el conjunto." code={'<Table caption="Proyectos" rows={projects} columns={columns}\n  rowKey={row => row.id} selection={{ selectedKeys, onChange: setSelectedKeys,\n    rowLabel: row => row.name, isDisabled: row => row.status === "Pausado" }} />'}><SelectionExample/></Example>
    <Example id="sticky" title="Encabezado fijo" description="El encabezado permanece visible al recorrer una tabla con altura limitada." code={'<Table caption="Historial" rows={projects} columns={columns}\n  rowKey={row => row.id} stickyHeader maxHeight={280} density="compact" />'}><Table caption="Historial de proyectos" columns={columns} rows={projects} rowKey={row=>row.id} stickyHeader maxHeight={280} density="compact"/></Example>
    <Example id="loading" title="Cargando registros" description="La tabla comunica la carga y deshabilita la ordenación y selección durante la espera." code={'<Table caption="Proyectos" rows={[]} columns={columns}\n  rowKey={row => row.id} loading loadingLabel="Cargando proyectos…" />'}><Table caption="Carga de proyectos" columns={columns} rows={[]} rowKey={(row:Project)=>row.id} loading loadingLabel="Cargando proyectos…"/></Example>
    <Example id="empty" title="Sin resultados" description="Un mensaje ocupa todo el ancho y explica cómo recuperar contenido." code={'<Table caption="Proyectos archivados" rows={[]} columns={columns}\n  rowKey={row => row.id} empty="No hay proyectos archivados." />'}><Table caption="Proyectos archivados" columns={columns} rows={[]} rowKey={(row:Project)=>row.id} empty="No hay proyectos archivados."/></Example>
    <Example id="error" title="Error y recuperación" description="El error se anuncia y la acción de reintentar recupera los datos locales de este ejemplo." code={'<Table caption="Proyectos" rows={projects} columns={columns}\n  rowKey={row => row.id} error={error} onRetry={reload} />'}><ErrorExample/></Example>
  </ComponentPage>;
}
