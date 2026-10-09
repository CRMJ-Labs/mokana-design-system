import type {Meta,StoryObj} from '@storybook/react-vite';
import {Badge,Button,Card,Navigation,Table} from './components';
import {Avatar,ProgressBar} from './advanced-components';

type Project={id:string;name:string;owner:string;status:'Activo'|'Revisión'|'Pausado';progress:number};
const projects:Project[]=[
  {id:'1',name:'Portal editorial',owner:'Ana Torres',status:'Activo',progress:82},
  {id:'2',name:'Campaña de otoño',owner:'Carlos Ruiz',status:'Revisión',progress:64},
  {id:'3',name:'Catálogo digital',owner:'Laura Gómez',status:'Pausado',progress:38}
];

function TuscanWorkspace(){return <main className="mk-container mk-stack tuscan-demo"><header className="mk-demo-header"><div><p className="mk-eyebrow">TUSCAN · ESPACIO DE TRABAJO</p><h1>Todo el trabajo, con claridad.</h1><p className="mk-subtle">La misma biblioteca Mokana con una identidad construida únicamente desde la nueva paleta.</p></div><div className="mk-row"><Avatar name="Milton Esc" status="online"/><Button>Crear proyecto</Button></div></header><Navigation items={[{label:'Resumen',href:'#summary',active:true},{label:'Proyectos',href:'#projects'},{label:'Equipo',href:'#team'}]}/><section id="summary" className="tuscan-hero"><div><p className="mk-eyebrow">RESUMEN SEMANAL</p><h2>12 proyectos avanzan según el plan.</h2><p>Centraliza decisiones, entregas y responsables en un espacio sencillo.</p><div className="mk-actions"><Button>Ver actividad</Button><Button variant="secondary">Invitar equipo</Button></div></div><div className="tuscan-score"><span>86%</span><p>Objetivos completados</p></div></section><section className="mk-grid"><Card title="Proyectos activos" eyebrow="OPERACIÓN"><span className="mk-metric">12</span><Badge tone="success">+3 esta semana</Badge></Card><Card title="Tareas pendientes" eyebrow="EQUIPO"><span className="mk-metric">28</span><p className="mk-subtle">8 requieren atención hoy</p></Card><Card title="Capacidad" eyebrow="PLANIFICACIÓN"><ProgressBar value={74} label="Carga del equipo"/></Card></section><section id="projects" className="mk-stack"><div className="mk-row tuscan-section-heading"><div><p className="mk-eyebrow">PROYECTOS</p><h2>Trabajo reciente</h2></div><Button variant="ghost">Ver todos</Button></div><Table caption="Proyectos recientes" rows={projects} rowKey={row=>row.id} columns={[{key:'name',header:'Proyecto',render:row=><strong>{row.name}</strong>},{key:'owner',header:'Responsable',render:row=>row.owner},{key:'status',header:'Estado',render:row=><Badge tone={row.status==='Activo'?'success':row.status==='Revisión'?'warning':'neutral'}>{row.status}</Badge>},{key:'progress',header:'Avance',render:row=><ProgressBar value={row.progress} label={`${row.progress}%`}/>}]} /></section></main>}

const meta={title:'Product Themes/Tuscan',component:TuscanWorkspace,globals:{product:'tuscan',theme:'light'},parameters:{layout:'fullscreen'}} satisfies Meta<typeof TuscanWorkspace>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Workspace:Story={};
