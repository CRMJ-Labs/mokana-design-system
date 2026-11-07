import {useState,type MouseEvent} from 'react';
import {AppShell,Button,ContentContainer,Icon,Input,MokProvider,Popover,ThemeSwitcher,useToasts,type IconName} from '@mokanadev/design-system';
import {initialProjects,type Project} from './data';
import {ProjectDetailPage} from './pages/ProjectDetailPage';
import {ProjectFormPage} from './pages/ProjectFormPage';
import {ProjectsListPage} from './pages/ProjectsListPage';
import {SettingsPage} from './pages/SettingsPage';

type Route='projects'|'project-new'|'project-detail'|'project-edit'|'settings';
type NavItem={label:string;icon:IconName;href:string;route?:Route};

const navigation:NavItem[]=[
  {label:'Resumen',icon:'home',href:'#summary'},
  {label:'Proyectos',icon:'folder',href:'#projects',route:'projects'},
  {label:'Personas',icon:'users',href:'#people'},
  {label:'Reportes',icon:'chart',href:'#reports'},
  {label:'Configuración',icon:'settings',href:'#settings',route:'settings'},
];

function UserMenu({collapsed,onSettings}:{collapsed:boolean;onSettings:()=>void}){
  return <Popover className="admin-user-menu" label="Menú de Karina Molina" trigger={<button className="admin-user-trigger" aria-label={collapsed?'Abrir menú de usuario':'Abrir menú de Karina Molina'}><span className="admin-avatar">KM</span><span className="admin-user-copy"><strong>Karina Molina</strong><small>karina@empresa.com</small></span></button>}>
    <div className="admin-user-card">
      <div className="admin-user-summary"><span className="admin-avatar">KM</span><span><strong>Karina Molina</strong><small>karina@empresa.com</small></span></div>
      <button type="button"><Icon name="user" size={17}/>Perfil</button>
      <button type="button" onClick={onSettings}><Icon name="settings" size={17}/>Configuración</button>
      <div className="admin-theme"><span><Icon name="monitor" size={17}/>Tema</span><ThemeSwitcher small/></div>
      <button type="button" className="is-danger"><Icon name="log-out" size={17}/>Cerrar sesión</button>
    </div>
  </Popover>;
}

function AdminApp(){
  const toasts=useToasts();
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [route,setRoute]=useState<Route>('projects');
  const [projects,setProjects]=useState(initialProjects);
  const [selectedId,setSelectedId]=useState(initialProjects[0].id);
  const selected=projects.find(project=>project.id===selectedId)??projects[0];
  const projectSection=route.startsWith('project');
  const pageLabel=route==='settings'?'Configuración':route==='project-new'?'Nuevo proyecto':route==='project-edit'?'Editar proyecto':route==='project-detail'?'Detalle del proyecto':'Proyectos';

  function navigate(next:Route,project?:Project){
    if(project)setSelectedId(project.id);
    setRoute(next);
    window.setTimeout(()=>document.getElementById('main-content')?.focus({preventScroll:true}),0);
  }
  function selectNavigation(item:NavItem,event:MouseEvent<HTMLAnchorElement>){
    event.preventDefault();
    if(item.route)navigate(item.route);
    else toasts.message(`${item.label}: conecta esta entrada con el router del producto.`);
  }
  function saveProject(value:Pick<Project,'name'|'code'|'owner'|'status'|'description'>){
    if(route==='project-edit'&&selected){
      const updated={...selected,...value,updated:'Ahora'};
      setProjects(current=>current.map(project=>project.id===selected.id?updated:project));
      toasts.success('Proyecto actualizado');navigate('project-detail',updated);return;
    }
    const project:Project={...value,id:String(Date.now()),updated:'Ahora'};
    setProjects(current=>[project,...current]);toasts.success('Proyecto creado');navigate('project-detail',project);
  }
  function archiveSelected(){
    if(!selected)return;
    const status=selected.status==='Archivado'?'Activo':'Archivado';
    setProjects(current=>current.map(project=>project.id===selected.id?{...project,status}:project));
    toasts.success(status==='Archivado'?'Proyecto archivado':'Proyecto restaurado');
  }
  function deleteSelected(){
    if(!selected)return;
    setProjects(current=>current.filter(project=>project.id!==selected.id));
    toasts.success('Proyecto eliminado');navigate('projects');
  }

  const sidebar=<div className={`admin-sidebar${sidebarOpen?'':' is-collapsed'}`}>
    <a className="admin-brand" href="#projects" aria-label="MOK Operaciones" onClick={event=>{event.preventDefault();navigate('projects')}}><span aria-hidden="true">M</span><strong>MOK Operaciones</strong></a>
    <nav aria-label="Secciones">{navigation.map(item=>{const current=item.route==='settings'?route==='settings':item.route==='projects'&&projectSection;return <a key={item.label} href={item.href} aria-current={current?'page':undefined} title={sidebarOpen?undefined:item.label} onClick={event=>selectNavigation(item,event)}><Icon name={item.icon} size={18}/><span>{item.label}</span></a>})}</nav>
    <UserMenu collapsed={!sidebarOpen} onSettings={()=>navigate('settings')}/>
  </div>;

  const mobileNavigation=<nav className="admin-mobile-nav" aria-label="Navegación móvil">{navigation.slice(0,4).map(item=>{const current=item.route==='projects'&&projectSection;return <a key={item.label} href={item.href} aria-current={current?'page':undefined} onClick={event=>selectNavigation(item,event)}><Icon name={item.icon} size={17}/><span>{item.label}</span></a>})}</nav>;

  return <div className="admin-starter">
    <AppShell sidebarCollapsed={!sidebarOpen} sidebarLabel="Navegación de administración" mainLabel={pageLabel} navigation={mobileNavigation} sidebar={sidebar}>
      <header className="admin-topbar">
        <div className="admin-topbar-context"><Button variant="ghost" shape="circle" svgOnly icon={sidebarOpen?'panel-left-close':'panel-left-open'} aria-label={sidebarOpen?'Cerrar navegación lateral':'Abrir navegación lateral'} aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(open=>!open)}>Alternar navegación</Button><strong>{pageLabel}</strong></div>
        <Input search aria-label="Buscar en toda la plataforma" placeholder="Buscar proyectos, personas o reportes…" rootProps={{className:'admin-global-search'}}/>
        <div className="admin-topbar-actions"><Button variant="ghost" shape="circle" svgOnly icon="bell" aria-label="Notificaciones">Notificaciones</Button><Button size="sm" prefix="user-plus" aria-label="Invitar persona" onClick={()=>toasts.success('Invitación preparada',{description:'Conecta esta acción con tu flujo real.'})}>Invitar</Button></div>
      </header>
      <ContentContainer size={route==='projects'?'wide':'default'}>
        {route==='projects'&&<ProjectsListPage projects={projects} onProjectsChange={setProjects} onCreate={()=>navigate('project-new')} onOpen={project=>navigate('project-detail',project)} onEdit={project=>navigate('project-edit',project)} onExport={()=>toasts.success('Exportación preparada')}/>} 
        {route==='project-new'&&<ProjectFormPage onCancel={()=>navigate('projects')} onSave={saveProject}/>} 
        {route==='project-edit'&&selected&&<ProjectFormPage project={selected} onCancel={()=>navigate('project-detail')} onSave={saveProject}/>} 
        {route==='project-detail'&&selected&&<ProjectDetailPage project={selected} onBack={()=>navigate('projects')} onEdit={()=>navigate('project-edit')} onArchive={archiveSelected} onDelete={deleteSelected}/>} 
        {route==='settings'&&<SettingsPage onSave={()=>toasts.success('Configuración guardada')}/>} 
      </ContentContainer>
    </AppShell>
  </div>;
}

export function App(){return <MokProvider defaultTheme="system" storageKey="mok-admin-starter-theme"><AdminApp/></MokProvider>}
