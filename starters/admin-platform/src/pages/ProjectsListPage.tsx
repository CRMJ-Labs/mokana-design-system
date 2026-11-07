import {useMemo,useState} from 'react';
import {AdminTable,Badge,Button,FilterBar,Icon,Input,PageHeader,PageLayout,PageToolbar,Select,type Column,type MenuEntry} from '@mokanadev/design-system';
import type {Project} from '../data';

const statusOptions=[{value:'all',label:'Todos los estados'},{value:'Activo',label:'Activos'},{value:'Pendiente',label:'Pendientes'},{value:'Archivado',label:'Archivados'}];

interface ProjectsListPageProps {
  projects:Project[];
  onProjectsChange:(projects:Project[])=>void;
  onCreate:()=>void;
  onOpen:(project:Project)=>void;
  onEdit:(project:Project)=>void;
  onExport:()=>void;
}

export function ProjectsListPage({projects,onProjectsChange,onCreate,onOpen,onEdit,onExport}:ProjectsListPageProps){
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('all');
  const [loading,setLoading]=useState(false);
  const [tableError,setTableError]=useState('');
  const filtered=useMemo(()=>projects.filter(project=>`${project.name} ${project.code} ${project.owner}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())&&(status==='all'||project.status===status)),[projects,query,status]);
  const columns:Column<Project>[]=[
    {key:'project',header:'Proyecto',responsivePriority:'primary',sortValue:row=>row.name,render:row=><span className="admin-entity"><strong>{row.name}</strong><small>{row.code}</small></span>},
    {key:'owner',header:'Responsable',responsivePriority:'secondary',sortValue:row=>row.owner,render:row=>row.owner},
    {key:'status',header:'Estado',responsivePriority:'secondary',render:row=><Badge size="sm" subtle tone={row.status==='Activo'?'success':row.status==='Pendiente'?'warning':'neutral'}>{row.status}</Badge>},
    {key:'updated',header:'Actualizado',responsivePriority:'tertiary',render:row=>row.updated},
  ];
  function actions(project:Project):MenuEntry[]{return [
    {id:'open',label:'Abrir proyecto',prefix:<Icon name="external-link" size={16}/>,onSelect:()=>onOpen(project)},
    {id:'edit',label:'Editar',prefix:<Icon name="edit" size={16}/>,onSelect:()=>onEdit(project)},
    {id:'archive',label:project.status==='Archivado'?'Restaurar':'Archivar',prefix:<Icon name="archive" size={16}/>,onSelect:()=>onProjectsChange(projects.map(item=>item.id===project.id?{...item,status:item.status==='Archivado'?'Activo':'Archivado'}:item))},
    {id:'delete',label:'Eliminar',danger:true,prefix:<Icon name="trash" size={16}/>,onSelect:()=>onProjectsChange(projects.filter(item=>item.id!==project.id))},
  ]}
  function retry(){setTableError('');setLoading(true);window.setTimeout(()=>setLoading(false),500)}
  return <PageLayout header={<PageHeader eyebrow="Gestión / Proyectos" title="Proyectos" description="Administra el trabajo activo, sus responsables y estados." actions={<Button prefix="plus" onClick={onCreate}>Nuevo proyecto</Button>}/>} toolbar={<PageToolbar actions={<Button variant="secondary" prefix="download" onClick={onExport}>Exportar</Button>}><Input search aria-label="Buscar proyectos" placeholder="Buscar por nombre, código o responsable" value={query} onValueChange={setQuery} onClear={()=>setQuery('')}/></PageToolbar>} filters={<FilterBar actions={<Button variant="ghost" onClick={()=>{setQuery('');setStatus('all')}} disabled={!query&&status==='all'}>Limpiar filtros</Button>}><Select label="Estado" value={status} options={statusOptions} onValueChange={setStatus}/></FilterBar>} footer={<div className="admin-demo-controls" aria-label="Estados de demostración"><span>Verifica el listado:</span><Button size="sm" variant="ghost" onClick={()=>{setTableError('');setLoading(true);window.setTimeout(()=>setLoading(false),700)}}>Carga</Button><Button size="sm" variant="ghost" onClick={()=>setTableError('No pudimos cargar los proyectos.')}>Error</Button><Button size="sm" variant="ghost" onClick={()=>{setQuery('sin-resultados');setTableError('')}}>Vacío</Button></div>}>
    <AdminTable caption="Proyectos de la organización" rows={filtered} columns={columns} rowKey={row=>row.id} defaultSort={{key:'project',direction:'asc'}} loading={loading} error={tableError} onRetry={retry} empty={<div><strong>No hay proyectos para mostrar.</strong><p>Cambia los filtros o crea el primer proyecto.</p><Button size="sm" onClick={onCreate}>Nuevo proyecto</Button></div>} footer={<span role="status">{filtered.length} de {projects.length} proyectos</span>} rowActionLabel={row=>`Acciones de ${row.name}`} rowActions={actions}/>
  </PageLayout>;
}
