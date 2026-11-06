import {useMemo,useState,type ReactNode} from 'react';
import {AdminTable} from './AdminTable';
import {Avatar} from './Avatar';
import {Checkbox} from './Checkbox';
import {Badge,Button,Icon,Input} from './components';
import type {Column} from './Table';
import {Pagination} from './advanced-components';
import './business-table-examples.css';

type FrameProps={title:string;description:string;count:number;action:ReactNode;toolbar:ReactNode;children:ReactNode;footer:ReactNode};
function TablePatternFrame({title,description,count,action,toolbar,children,footer}:FrameProps){return <section className="mk-business-table-example"><header className="mk-business-table-heading"><div><div className="mk-business-table-title"><h3>{title}</h3><Badge size="sm" subtle>{count}</Badge></div><p>{description}</p></div>{action}</header><div className="mk-business-table-toolbar">{toolbar}</div>{children}<footer className="mk-business-table-footer">{footer}</footer></section>}
function SegmentedFilter({label,items,value,onChange}:{label:string;items:string[];value:string;onChange:(value:string)=>void}){return <div className="mk-business-table-segments" role="group" aria-label={label}>{items.map(item=><button key={item} type="button" aria-pressed={value===item} onClick={()=>onChange(item)}>{item}</button>)}</div>}

type Lead={id:string;name:string;email:string;stage:'Nuevo'|'Contactado'|'Propuesta'|'Ganado'|'Perdido';owner?:string;received:string;value:number};
const leads:Lead[]=[
  {id:'l1',name:'Esteban Moreno',email:'esteban@altavista.co',stage:'Nuevo',received:'Hoy, 09:42',value:18000000},
  {id:'l2',name:'Camila Rojas',email:'camila@novaterra.co',stage:'Contactado',owner:'Ana Torres',received:'Hoy, 08:15',value:9200000},
  {id:'l3',name:'Santiago Vélez',email:'santiago@horizonte.io',stage:'Propuesta',owner:'Carlos Ruiz',received:'Ayer, 16:30',value:24500000},
  {id:'l4',name:'Laura Méndez',email:'laura@cuarzo.com',stage:'Ganado',owner:'Ana Torres',received:'5 nov, 11:20',value:31000000},
  {id:'l5',name:'Nicolás Peña',email:'nicolas@prisma.co',stage:'Perdido',owner:'Laura Gómez',received:'4 nov, 14:08',value:6800000},
];
const cop=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
const leadTone:Record<Lead['stage'],'info'|'neutral'|'warning'|'success'|'error'>={Nuevo:'info',Contactado:'neutral',Propuesta:'warning',Ganado:'success',Perdido:'error'};

export function LeadsTableExample(){
  const [query,setQuery]=useState(''),[stage,setStage]=useState('Todos'),[message,setMessage]=useState('Selecciona una acción para trabajar con un lead.');
  const rows=useMemo(()=>leads.filter(row=>(stage==='Todos'||row.stage===stage)&&`${row.name} ${row.email} ${row.owner??''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())),[query,stage]);
  const columns:Column<Lead>[]=[
    {key:'lead',header:'Lead',minWidth:240,responsivePriority:'primary',sortValue:row=>row.name,render:row=><div className="mk-business-table-identity"><Avatar name={row.name} size={32}/><span><strong>{row.name}</strong><small>{row.email}</small></span></div>},
    {key:'stage',header:'Etapa',minWidth:130,responsivePriority:'secondary',sortValue:row=>row.stage,render:row=><Badge size="sm" subtle tone={leadTone[row.stage]}>{row.stage}</Badge>},
    {key:'owner',header:'Responsable',minWidth:170,responsivePriority:'secondary',sortValue:row=>row.owner??'',render:row=>row.owner?<div className="mk-business-table-person"><Avatar name={row.owner} size={24}/><span>{row.owner}</span></div>:<span className="mk-business-table-muted">Sin asignar</span>},
    {key:'value',header:'Valor estimado',align:'right',minWidth:150,responsivePriority:'tertiary',sortValue:row=>row.value,render:row=><span className="mk-business-table-money">{cop.format(row.value)}</span>},
    {key:'received',header:'Recibido',minWidth:120,responsivePriority:'tertiary',sortValue:row=>row.received,render:row=>row.received},
  ];
  return <TablePatternFrame title="Leads" description="Prioriza, asigna y mueve oportunidades sin abandonar la lista." count={rows.length} action={<Button size="sm" prefix="plus">Nuevo lead</Button>} toolbar={<><Input aria-label="Buscar leads" search size="sm" placeholder="Buscar por nombre, correo o responsable" value={query} onValueChange={setQuery}/><SegmentedFilter label="Filtrar leads por etapa" items={['Todos','Nuevo','Contactado','Propuesta','Ganado']} value={stage} onChange={setStage}/></>} footer={<><span role="status">{rows.length} de {leads.length} leads</span><span className="mk-business-table-footer-note">Ordena por cualquier encabezado</span></>}><AdminTable caption="Leads del pipeline" rows={rows} columns={columns} rowKey={row=>row.id} variant="plain" empty="No hay leads que coincidan con estos filtros." rowActionLabel={row=>`Acciones de ${row.name}`} rowActions={row=>[
    {id:'open',label:'Abrir lead',prefix:<Icon name="external-link" size={16}/>,onSelect:()=>setMessage(`Abriste el lead de ${row.name}.`)},
    {id:'assign',label:'Asignar responsable',prefix:<Icon name="user-plus" size={16}/>,onSelect:()=>setMessage(`Asigna un responsable a ${row.name}.`)},
    {id:'move',label:'Mover de etapa',prefix:<Icon name="arrow-right" size={16}/>,onSelect:()=>setMessage(`Mueve a ${row.name} a otra etapa.`)},
    {id:'discard',label:'Descartar',tone:'danger',prefix:<Icon name="trash" size={16}/>,onSelect:()=>setMessage(`Confirma antes de descartar a ${row.name}.`)},
  ]}/><p className="mk-sr-only" role="status">{message}</p></TablePatternFrame>;
}

type ProjectRow={id:string;name:string;code:string;description:string;owner:string;status:'Activo'|'En riesgo'|'Archivado';progress:number;updated:string};
const portfolio:ProjectRow[]=[
  {id:'p1',name:'Portal de clientes',code:'PRJ-1042',description:'Autoservicio y seguimiento de solicitudes',owner:'Ana Torres',status:'Activo',progress:72,updated:'Hoy'},
  {id:'p2',name:'Migración ERP',code:'PRJ-1038',description:'Integración de finanzas y operaciones',owner:'Carlos Ruiz',status:'En riesgo',progress:46,updated:'Ayer'},
  {id:'p3',name:'App de operaciones',code:'PRJ-1031',description:'Flujos móviles para el equipo de campo',owner:'Laura Gómez',status:'Activo',progress:88,updated:'4 nov'},
  {id:'p4',name:'Archivo documental',code:'PRJ-0994',description:'Proyecto cerrado del ciclo anterior',owner:'Ana Torres',status:'Archivado',progress:100,updated:'12 oct'},
  {id:'p5',name:'Analítica comercial',code:'PRJ-1028',description:'Tableros y alertas de ventas',owner:'Carlos Ruiz',status:'Activo',progress:61,updated:'1 nov'},
];

export function ProjectsTableExample(){
  const [query,setQuery]=useState(''),[archived,setArchived]=useState(false),[page,setPage]=useState(1);
  const filtered=portfolio.filter(row=>(archived||row.status!=='Archivado')&&`${row.name} ${row.code} ${row.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const pageSize=3,pages=Math.max(1,Math.ceil(filtered.length/pageSize)),safePage=Math.min(page,pages),rows=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
  const columns:Column<ProjectRow>[]=[
    {key:'project',header:'Proyecto',minWidth:240,responsivePriority:'primary',sortValue:row=>row.name,render:row=><div className="mk-business-table-identity"><span className="mk-business-table-icon"><Icon name="folder" size={17}/></span><span><strong>{row.name}</strong><small>{row.code}</small></span></div>},
    {key:'description',header:'Descripción',minWidth:260,responsivePriority:'tertiary',render:row=><span className="mk-business-table-description">{row.description}</span>},
    {key:'owner',header:'Responsable',minWidth:160,responsivePriority:'secondary',sortValue:row=>row.owner,render:row=><div className="mk-business-table-person"><Avatar name={row.owner} size={24}/><span>{row.owner}</span></div>},
    {key:'progress',header:'Progreso',minWidth:150,responsivePriority:'tertiary',sortValue:row=>row.progress,render:row=><div className="mk-business-table-progress"><span><i style={{width:`${row.progress}%`}}/></span><strong>{row.progress}%</strong></div>},
    {key:'status',header:'Estado',minWidth:120,responsivePriority:'secondary',sortValue:row=>row.status,render:row=><Badge size="sm" subtle tone={row.status==='Activo'?'success':row.status==='En riesgo'?'warning':'neutral'}>{row.status}</Badge>},
    {key:'updated',header:'Actualizado',minWidth:100,responsivePriority:'tertiary',render:row=>row.updated},
  ];
  return <TablePatternFrame title="Proyectos" description="Reúne avance, responsables y señales de riesgo en una sola vista." count={filtered.length} action={<Button size="sm" prefix="plus">Nuevo proyecto</Button>} toolbar={<><Input aria-label="Buscar proyectos" search size="sm" placeholder="Buscar proyectos" value={query} onValueChange={value=>{setQuery(value);setPage(1)}}/><Checkbox label="Incluir archivados" checked={archived} onChange={value=>{setArchived(value);setPage(1)}}/></>} footer={<><span role="status">{filtered.length?`${(safePage-1)*pageSize+1}–${Math.min(safePage*pageSize,filtered.length)} de ${filtered.length} proyectos`:'0 proyectos'}</span><Pagination page={safePage} pages={pages} onChange={setPage} aria-label="Páginas de proyectos"/></>}><AdminTable caption="Portafolio de proyectos" rows={rows} columns={columns} rowKey={row=>row.id} variant="plain" empty="No hay proyectos que coincidan con la búsqueda." rowActionLabel={row=>`Acciones de ${row.name}`} rowActions={row=>[
    {id:'open',label:'Ver proyecto',prefix:<Icon name="external-link" size={16}/>,onSelect:()=>{}},{id:'copy',label:'Duplicar',prefix:<Icon name="copy" size={16}/>,onSelect:()=>{}},{id:'archive',label:'Archivar',prefix:<Icon name="archive" size={16}/>,onSelect:()=>{}},
  ]}/></TablePatternFrame>;
}

type Expense={id:string;date:string;title:string;reference:string;payer:string;amount:number;status:'Aprobado'|'Pendiente'|'Rechazado';support?:string};
const expenses:Expense[]=[
  {id:'e1',date:'6 nov 2026',title:'Infraestructura cloud',reference:'GAS-24018 · Koma SAS',payer:'La empresa',amount:500000,status:'Aprobado',support:'factura.pdf'},
  {id:'e2',date:'6 nov 2026',title:'Licencias de diseño',reference:'GAS-24017 · Figma',payer:'Ana Torres · Reembolsable',amount:82000,status:'Pendiente',support:'recibo.pdf'},
  {id:'e3',date:'5 nov 2026',title:'Servicio de mensajería',reference:'GAS-24012 · EntregaYa',payer:'La empresa',amount:36500,status:'Aprobado',support:'factura.pdf'},
  {id:'e4',date:'5 nov 2026',title:'Equipo de oficina',reference:'GAS-24009 · Kubo',payer:'Carlos Ruiz · Reembolsable',amount:680000,status:'Rechazado'},
  {id:'e5',date:'4 nov 2026',title:'Dominio anual',reference:'GAS-24002 · Namebase',payer:'La empresa',amount:74000,status:'Pendiente',support:'factura.pdf'},
];

export function FinanceTableExample(){
  const [query,setQuery]=useState(''),[filter,setFilter]=useState('Todos');
  const rows=expenses.filter(row=>(filter==='Todos'||row.status===filter)&&`${row.title} ${row.reference} ${row.payer}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const columns:Column<Expense>[]=[
    {key:'date',header:'Fecha',minWidth:120,responsivePriority:'tertiary',sortValue:row=>row.date,render:row=>row.date},
    {key:'expense',header:'Gasto',minWidth:270,responsivePriority:'primary',sortValue:row=>row.title,render:row=><div className="mk-business-table-identity"><span className="mk-business-table-icon"><Icon name="credit-card" size={17}/></span><span><strong>{row.title}</strong><small>{row.reference}</small></span></div>},
    {key:'payer',header:'Pagó',minWidth:210,responsivePriority:'secondary',render:row=>row.payer},
    {key:'amount',header:'Monto (COP)',align:'right',minWidth:140,responsivePriority:'secondary',sortValue:row=>row.amount,render:row=><span className="mk-business-table-money">{cop.format(row.amount)}</span>},
    {key:'status',header:'Estado',minWidth:125,responsivePriority:'secondary',sortValue:row=>row.status,render:row=><Badge size="sm" subtle tone={row.status==='Aprobado'?'success':row.status==='Pendiente'?'warning':'error'}>{row.status}</Badge>},
    {key:'support',header:'Soporte',minWidth:130,responsivePriority:'tertiary',render:row=>row.support?<button type="button" className="mk-business-table-file"><Icon name="paperclip" size={15}/>{row.support}</button>:<span className="mk-business-table-muted">Sin soporte</span>},
  ];
  return <TablePatternFrame title="Gastos" description="Compara montos, responsables y estados de aprobación con menos ruido." count={rows.length} action={<Button size="sm" prefix="plus">Registrar gasto</Button>} toolbar={<><Input aria-label="Buscar gastos" search size="sm" placeholder="Buscar gasto, referencia o responsable" value={query} onValueChange={setQuery}/><SegmentedFilter label="Filtrar gastos por estado" items={['Todos','Pendiente','Aprobado','Rechazado']} value={filter} onChange={setFilter}/></>} footer={<><span role="status">{rows.length} de {expenses.length} gastos</span><strong>Total visible: {cop.format(rows.reduce((sum,row)=>sum+row.amount,0))}</strong></>}><AdminTable caption="Gastos de la organización" rows={rows} columns={columns} rowKey={row=>row.id} variant="plain" empty="No hay gastos que coincidan con estos filtros." rowActionLabel={row=>`Acciones de ${row.title}`} rowActions={row=>[
    {id:'details',label:'Ver detalle',prefix:<Icon name="eye" size={16}/>,onSelect:()=>{}},...(row.support?[{id:'download',label:'Descargar soporte',prefix:<Icon name="download" size={16}/>,onSelect:()=>{}}]:[]),{id:'edit',label:'Editar gasto',prefix:<Icon name="edit" size={16}/>,onSelect:()=>{}},
  ]}/></TablePatternFrame>;
}
