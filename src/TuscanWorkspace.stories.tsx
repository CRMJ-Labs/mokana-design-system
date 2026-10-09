import {useMemo,useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react-vite';
import {Badge,Button,Card,Input,Modal,Navigation,Table} from './components';
import {Avatar,ProgressBar,Tabs,Toast} from './advanced-components';

type Project={id:string;name:string;owner:string;status:'Activo'|'Revisión'|'Pausado';progress:number};
const initialProjects:Project[]=[
  {id:'1',name:'Portal editorial',owner:'Ana Torres',status:'Activo',progress:82},
  {id:'2',name:'Campaña de otoño',owner:'Carlos Ruiz',status:'Revisión',progress:64},
  {id:'3',name:'Catálogo digital',owner:'Laura Gómez',status:'Pausado',progress:38}
];

function TuscanWorkspace(){
  const [projects,setProjects]=useState(initialProjects);
  const [query,setQuery]=useState('');
  const [view,setView]=useState('all');
  const [modalOpen,setModalOpen]=useState(false);
  const [name,setName]=useState('');
  const [notice,setNotice]=useState(false);
  const filtered=useMemo(()=>projects.filter(project=>{const matches=project.name.toLowerCase().includes(query.toLowerCase())||project.owner.toLowerCase().includes(query.toLowerCase());return matches&&(view==='all'||project.status.toLowerCase()===view)}),[projects,query,view]);
  const createProject=()=>{const clean=name.trim();if(!clean)return;setProjects(current=>[{id:String(Date.now()),name:clean,owner:'Milton Esc',status:'Activo',progress:8},...current]);setName('');setModalOpen(false);setNotice(true)};
  return <main className="mk-container mk-stack tuscan-demo">
    <header className="mk-demo-header"><div><p className="mk-eyebrow">TUSCAN · ESPACIO DE TRABAJO</p><h1>Todo el trabajo, con claridad.</h1><p className="mk-subtle">Una mini app construida con los componentes compartidos de Mokana.</p></div><div className="mk-row"><Avatar name="Milton Esc" status="online"/><Button onClick={()=>setModalOpen(true)}>Crear proyecto</Button></div></header>
    <Navigation items={[{label:'Resumen',href:'#summary',active:true},{label:'Proyectos',href:'#projects'},{label:'Equipo',href:'#team'}]}/>
    {notice&&<Toast title="Proyecto creado" tone="success" onClose={()=>setNotice(false)}>El nuevo proyecto ya aparece en tu espacio.</Toast>}
    <section id="summary" className="tuscan-hero"><div><p className="mk-eyebrow">RESUMEN SEMANAL</p><h2>{projects.length} proyectos avanzan según el plan.</h2><p>Centraliza decisiones, entregas y responsables en un espacio sencillo.</p><div className="mk-actions"><Button onClick={()=>document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'})}>Ver actividad</Button><Button variant="secondary">Invitar equipo</Button></div></div><div className="tuscan-score"><span>86%</span><p>Objetivos completados</p></div></section>
    <section className="mk-grid"><Card title="Proyectos activos" eyebrow="OPERACIÓN"><span className="mk-metric">{projects.filter(p=>p.status==='Activo').length}</span><Badge tone="success">Equipo en marcha</Badge></Card><Card title="En revisión" eyebrow="EQUIPO"><span className="mk-metric">{projects.filter(p=>p.status==='Revisión').length}</span><p className="mk-subtle">Esperando comentarios</p></Card><Card title="Capacidad" eyebrow="PLANIFICACIÓN"><ProgressBar value={74} label="Carga del equipo"/></Card></section>
    <section id="projects" className="mk-stack"><div className="mk-row tuscan-section-heading"><div><p className="mk-eyebrow">PROYECTOS</p><h2>Trabajo reciente</h2></div><Button variant="ghost" onClick={()=>setModalOpen(true)}>Nuevo proyecto</Button></div><div className="tuscan-toolbar"><Input label="Buscar" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Proyecto o responsable"/><Tabs active={view} onChange={setView} tabs={[{id:'all',label:'Todos'},{id:'activo',label:'Activos'},{id:'revisión',label:'En revisión'},{id:'pausado',label:'Pausados'}]}/></div><Table caption={`${filtered.length} proyectos encontrados`} rows={filtered} rowKey={row=>row.id} empty="No hay proyectos que coincidan con estos filtros." columns={[{key:'name',header:'Proyecto',render:row=><strong>{row.name}</strong>},{key:'owner',header:'Responsable',render:row=>row.owner},{key:'status',header:'Estado',render:row=><Badge tone={row.status==='Activo'?'success':row.status==='Revisión'?'warning':'neutral'}>{row.status}</Badge>},{key:'progress',header:'Avance',render:row=><ProgressBar value={row.progress} label={`${row.progress}%`}/>}]}/></section>
    <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title="Crear proyecto" footer={<><Button variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Button><Button onClick={createProject} disabled={!name.trim()}>Crear proyecto</Button></>}><div className="mk-stack"><p className="mk-subtle">Añade un proyecto nuevo al espacio Tuscan.</p><Input label="Nombre del proyecto" value={name} onChange={event=>setName(event.target.value)} placeholder="Ej. Lanzamiento de producto" autoFocus/></div></Modal>
  </main>
}

const meta={title:'Product Themes/Tuscan',component:TuscanWorkspace,globals:{product:'tuscan',theme:'light'},parameters:{layout:'fullscreen'}} satisfies Meta<typeof TuscanWorkspace>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Workspace:Story={};
