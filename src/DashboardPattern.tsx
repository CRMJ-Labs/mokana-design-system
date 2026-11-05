import {useMemo,useState,type FormEvent, type ReactNode} from 'react';
import {AdminTable} from './AdminTable';
import {AppShell,ContentContainer,PageHeader,PageToolbar} from './ApplicationLayout';
import {BarChart,LineChart,Sparkline} from './Charts';
import {Alert,Badge,Button,Icon,Input,Modal,Select,type IconName} from './components';
import type {Column} from './Table';
import './dashboard-pattern.css';
import './dashboard-sidebar.css';

type View='overview'|'sales'|'expenses';
type Period='month'|'quarter'|'year';
type Employee={id:string;name:string;email:string;role:string;type:'Tiempo completo'|'Medio tiempo'|'Contratista';status:'Activo'|'Ausente';sales:number};

const employeesSeed:Employee[]=[
  {id:'MK-1042',name:'Ana Torres',email:'ana@mok.example',role:'Líder comercial',type:'Tiempo completo',status:'Activo',sales:42800},
  {id:'MK-1088',name:'Carlos Ruiz',email:'carlos@mok.example',role:'Ejecutivo de cuenta',type:'Tiempo completo',status:'Activo',sales:36100},
  {id:'MK-1116',name:'Laura Gómez',email:'laura@mok.example',role:'Customer success',type:'Tiempo completo',status:'Ausente',sales:29400},
  {id:'MK-1164',name:'Diego Peña',email:'diego@mok.example',role:'Analista',type:'Contratista',status:'Activo',sales:18700},
  {id:'MK-1201',name:'Valentina Díaz',email:'valentina@mok.example',role:'SDR',type:'Medio tiempo',status:'Activo',sales:15200},
];

const money=new Intl.NumberFormat('es-CO',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1});
const navItems:[string,IconName,string?][]=[['Dashboard','home'],['Pedidos','clipboard'],['Seguimiento','check','Nuevo'],['Analítica','chart'],['Configuración','settings']];
const periodOptions=[{value:'month',label:'Este mes'},{value:'quarter',label:'Este trimestre'},{value:'year',label:'Este año'}];
const factors:Record<Period,number>={month:1,quarter:2.7,year:10.6};

function MetricCard({title,value,change,detail,values,tone='success'}:{title:string;value:string;change:string;detail:string;values:number[];tone?:'success'|'error'}){
  return <article className="mk-dashboard-metric"><header><span>{title}</span><Badge tone={tone} subtle size="sm" icon={false}>{change}</Badge></header><strong>{value}</strong><Sparkline values={values} label={`Tendencia de ${title}`} color={tone==='error'?'var(--error-text)':'var(--accent-text)'}/><small>{detail}</small></article>;
}

function Panel({title,description,actions,children}:{title:string;description:string;actions?:ReactNode;children:ReactNode}){
  return <article className="mk-dashboard-panel"><header><div><h2>{title}</h2><p>{description}</p></div>{actions&&<div className="mk-dashboard-panel-actions">{actions}</div>}</header>{children}</article>;
}

export function DashboardPattern(){
  const [view,setView]=useState<View>('overview');
  const [period,setPeriod]=useState<Period>('month');
  const [query,setQuery]=useState('');
  const [employees,setEmployees]=useState(employeesSeed);
  const [inviteOpen,setInviteOpen]=useState(false);
  const [invite,setInvite]=useState({name:'',email:'',role:'Ejecutivo de cuenta'});
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const factor=factors[period];
  const visibleEmployees=useMemo(()=>employees.filter(employee=>`${employee.name} ${employee.email} ${employee.role}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())),[employees,query]);
  const columns:Column<Employee>[]=[
    {key:'member',header:'Colaborador',render:employee=><div className="mk-dashboard-member"><span>{employee.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><strong>{employee.name}</strong><small>{employee.email}</small></div></div>,sortValue:employee=>employee.name,sortLabel:'colaborador',responsivePriority:'primary'},
    {key:'role',header:'Rol',render:employee=>employee.role,sortValue:employee=>employee.role,responsivePriority:'secondary'},
    {key:'type',header:'Tipo',render:employee=>employee.type,responsivePriority:'tertiary'},
    {key:'status',header:'Estado',render:employee=><Badge tone={employee.status==='Activo'?'success':'warning'} subtle size="sm">{employee.status}</Badge>,responsivePriority:'secondary'},
    {key:'sales',header:'Ventas',align:'right',render:employee=>money.format(employee.sales),sortValue:employee=>employee.sales,responsivePriority:'tertiary'},
  ];
  function download(){
    const csv=['ID,Nombre,Correo,Rol,Tipo,Estado,Ventas',...visibleEmployees.map(item=>[item.id,item.name,item.email,item.role,item.type,item.status,item.sales].map(value=>`"${String(value).replaceAll('"','""')}"`).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='equipo-mok.csv';anchor.click();URL.revokeObjectURL(url);setNotice('Reporte descargado en formato CSV.');
  }
  function submitInvite(event:FormEvent){
    event.preventDefault();
    if(!invite.name.trim()){setError('Escribe el nombre del colaborador.');return;}
    if(!/^\S+@\S+\.\S+$/.test(invite.email)){setError('Ingresa un correo válido.');return;}
    setEmployees(current=>[...current,{id:`MK-${1202+current.length}`,name:invite.name.trim(),email:invite.email.trim(),role:invite.role,type:'Tiempo completo',status:'Activo',sales:0}]);
    setNotice(`Invitación preparada para ${invite.name.trim()}.`);setInviteOpen(false);setInvite({name:'',email:'',role:'Ejecutivo de cuenta'});setError('');
  }
  const metrics=[
    {title:'Ingresos',value:money.format(228441*factor),change:'+3,3%',detail:'frente al periodo anterior',values:[22,29,27,35,32,41,44,52]},
    {title:'Gastos',value:money.format(25108*factor),change:'+3,3%',detail:'dentro del presupuesto',values:[18,21,20,24,23,27,28,31],tone:'error' as const},
    {title:'Ventas',value:String(Math.round(458*factor)),change:'+3,3%',detail:'operaciones completadas',values:[24,31,29,38,42,39,48,53]},
    {title:'Beneficio',value:money.format(203133*factor),change:'+4,1%',detail:'margen neto del periodo',values:[20,26,25,33,31,39,42,49]},
  ];
  return <article className={`mk-dashboard-pattern${sidebarOpen?'':' is-sidebar-collapsed'}`}>
    <AppShell mainId="dashboard-pattern-main" mainLabel="Dashboard de operaciones" header={<div className="mk-dashboard-product-header"><a href="#dashboard-pattern-main" className="mk-dashboard-brand"><span className="mk-mark" aria-hidden="true"/><strong>MOK Operaciones</strong></a><Input search aria-label="Buscar en el dashboard" placeholder="Buscar pedidos, personas o reportes…" rootProps={{className:'mk-dashboard-global-search'}}/><div className="mk-dashboard-header-actions"><Button variant="ghost" shape="circle" svgOnly icon="bell" aria-label="Notificaciones">Notificaciones</Button><Button size="sm" prefix="user-plus" onClick={()=>setInviteOpen(true)}>Invitar</Button></div></div>} navigation={<nav className="mk-dashboard-mobile-nav" aria-label="Dashboard móvil">{navItems.slice(0,4).map(([label,,badge],index)=><a key={label} href="#dashboard-pattern-main" aria-current={index===0?'page':undefined}>{label}{badge&&<Badge size="sm" subtle>{badge}</Badge>}</a>)}</nav>} sidebar={<aside className={`mk-dashboard-sidebar${sidebarOpen?'':' is-collapsed'}`}><div className="mk-dashboard-account"><span className="mk-dashboard-avatar">KM</span><div style={{flex:1}}><strong>Karina Molina</strong><small>Administradora</small></div><Button variant="ghost" shape="circle" svgOnly icon={sidebarOpen?'panel-left-close':'panel-left-open'} aria-label={sidebarOpen?'Cerrar navegación lateral':'Abrir navegación lateral'} title={sidebarOpen?'Cerrar navegación lateral':'Abrir navegación lateral'} aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(open=>!open)}>{sidebarOpen?'Cerrar navegación lateral':'Abrir navegación lateral'}</Button></div><nav aria-label="Secciones del dashboard">{navItems.map(([label,icon,badge],index)=><a key={label} href="#dashboard-pattern-main" aria-current={index===0?'page':undefined}><Icon name={icon} size={17}/><span>{label}</span>{badge&&<Badge size="sm" tone="brand" subtle>{badge}</Badge>}</a>)}</nav><nav className="mk-dashboard-sidebar-bottom" aria-label="Ayuda y sesión"><a href="#dashboard-pattern-main"><Icon name="help" size={17}/><span>Ayuda e información</span></a><a href="#dashboard-pattern-main"><Icon name="log-out" size={17}/><span>Cerrar sesión</span></a></nav></aside>}>
      <ContentContainer size="wide">
        <PageHeader eyebrow="Operaciones / Resumen" title="Buenos días, Karina" description="Sigue el rendimiento del negocio y las tareas de tu equipo." actions={<Button prefix="user-plus" onClick={()=>setInviteOpen(true)}>Invitar colaborador</Button>}/>
        {notice&&<Alert tone="success" title={notice}>Esta acción pertenece a la demostración local.</Alert>}
        <PageToolbar label="Controles del dashboard" actions={<div className="mk-dashboard-toolbar-actions"><Select label="Periodo" value={period} options={periodOptions} onValueChange={value=>setPeriod(value as Period)}/><Button variant="secondary" prefix="download" onClick={download}>Descargar</Button></div>}><div className="mk-dashboard-tabs" role="group" aria-label="Vista del dashboard">{([['overview','Resumen'],['sales','Ventas'],['expenses','Gastos']] as [View,string][]).map(([id,label])=><Button key={id} size="sm" variant={view===id?'primary':'ghost'} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</Button>)}</div></PageToolbar>
        <section className="mk-dashboard-metrics" aria-label="Indicadores del negocio">{metrics.map(metric=><MetricCard key={metric.title} {...metric}/>)}</section>
        <section className="mk-dashboard-analysis" aria-label="Análisis del negocio">
          <Panel title="Rendimiento de ventas" description="Comparativo semanal de ventas cerradas." actions={<Badge tone="brand" subtle>{periodOptions.find(option=>option.value===period)?.label}</Badge>}><div className="mk-dashboard-panel-summary"><span><strong>{money.format(28441*factor)}</strong><small>Ventas semanales</small></span><span><strong>{money.format(4063*factor)}</strong><small>Ventas diarias</small></span><span><strong>{Math.round(278*factor)}</strong><small>Total de ventas</small></span></div><BarChart label="Rendimiento de ventas durante doce periodos" labels={['01','02','03','04','05','06','07','08','09','10','11','12']} series={[{label:view==='expenses'?'Gastos':'Ventas',values:view==='expenses'?[18,24,20,29,22,31,26,34,28,36,33,38]:[29,52,34,16,43,23,25,30,9,43,37,32],color:'var(--accent-text)'}]}/></Panel>
          <Panel title="Fuentes de tráfico" description="Sesiones orgánicas y campañas pagadas." actions={<Button variant="ghost" shape="circle" svgOnly icon="more-horizontal" aria-label="Más opciones de tráfico">Más opciones</Button>}><div className="mk-dashboard-traffic-total"><strong>{(231856*factor).toLocaleString('es-CO',{maximumFractionDigits:0})}</strong><small>Sesiones</small></div><LineChart label="Tráfico orgánico y pagado durante doce meses" labels={['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']} series={[{label:'Orgánico',values:[3,16,9,15,17,8,18,18,20,15,22,16],color:'var(--foreground)'},{label:'Anuncios',values:[2,11,14,15,8,9,13,11,5,12,19,9],color:'var(--accent-text)'}]}/></Panel>
        </section>
        <section className="mk-dashboard-team" aria-labelledby="dashboard-team-title"><header><div><h2 id="dashboard-team-title">Equipo</h2><p><strong>{visibleEmployees.length}</strong> de {employees.length} colaboradores visibles</p></div><Input search aria-label="Buscar colaboradores" placeholder="Buscar colaborador…" value={query} onValueChange={setQuery} onClear={()=>setQuery('')}/></header><AdminTable caption="Colaboradores del equipo" rows={visibleEmployees} rowKey={employee=>employee.id} columns={columns} defaultSort={{key:'member',direction:'asc'}} empty="No hay colaboradores que coincidan con la búsqueda." rowActionLabel={employee=>`Acciones de ${employee.name}`} rowActions={employee=>[{id:'profile',label:'Ver perfil',prefix:<Icon name="user" size={16}/>,onSelect:()=>setNotice(`Abriendo el perfil de ${employee.name}.`)},{id:'absence',label:employee.status==='Activo'?'Marcar ausente':'Marcar activo',prefix:<Icon name="clock" size={16}/>,onSelect:()=>setEmployees(current=>current.map(item=>item.id===employee.id?{...item,status:item.status==='Activo'?'Ausente':'Activo'}:item))},{id:'remove',label:'Quitar del equipo',danger:true,prefix:<Icon name="trash" size={16}/>,onSelect:()=>setEmployees(current=>current.filter(item=>item.id!==employee.id))}]}/></section>
        <p className="mk-dashboard-demo-note">Patrón demostrativo con datos locales: estructura inspirada en un dashboard operativo y construida íntegramente con MOK.</p>
      </ContentContainer>
    </AppShell>
    <Modal open={inviteOpen} onClose={()=>{setInviteOpen(false);setError('');}} title="Invitar colaborador"><form className="mk-dashboard-invite-form" onSubmit={submitInvite} noValidate><Input label="Nombre completo" value={invite.name} onValueChange={name=>setInvite({...invite,name})} error={error&& !invite.name.trim()?error:undefined} autoFocus required/><Input label="Correo electrónico" type="email" value={invite.email} onValueChange={email=>setInvite({...invite,email})} error={error&&invite.name.trim()?error:undefined} required/><Select label="Rol" value={invite.role} options={['Ejecutivo de cuenta','Customer success','Analista','SDR'].map(value=>({value,label:value}))} onValueChange={role=>setInvite({...invite,role})}/><footer><Button type="submit">Enviar invitación</Button><Button variant="ghost" onClick={()=>setInviteOpen(false)}>Cancelar</Button></footer></form></Modal>
  </article>;
}
