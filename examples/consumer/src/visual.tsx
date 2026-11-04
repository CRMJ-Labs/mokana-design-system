import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AddressInput,Alert,Avatar,Badge,Button,Card,Checkbox,Input,Menu,Popover,Radio,Select,Table,Tabs,Textarea,Toggle,Tooltip} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';
import './visual.css';

function VisualFixture(){
  const params=new URLSearchParams(location.search),view=params.get('view')??'controls';
  const [checked,setChecked]=useState(true),[tab,setTab]=useState('overview');
  return <main className="mk visual-fixture" data-theme={params.get('theme')==='dark'?'dark':'light'}>
    <h1>MOK · {view}</h1>
    {view==='controls'&&<div className="visual-stack">
      {(['sm','md','lg'] as const).map(size=><div className="visual-row" key={size}>{(['primary','secondary','ghost','error','warning'] as const).map(variant=><Button key={variant} size={size} variant={variant}>Continuar</Button>)}</div>)}
      <div className="visual-row"><Button prefix="plus">Crear proyecto</Button><Button disabled>Deshabilitado</Button><Button loading>Cargando</Button><Button svgOnly prefix="plus" aria-label="Añadir"/></div>
      <div className="visual-row">{(['neutral','brand','info','success','warning','error'] as const).map(tone=><Badge key={tone} tone={tone}>{tone}</Badge>)}</div>
      <div className="visual-row"><Checkbox label="Activo" defaultChecked/><Checkbox label="Mixto" indeterminate/><Radio label="Inicial" name="visual-plan" defaultChecked/><Toggle label="Notificaciones" checked={checked} onChange={setChecked}/></div>
      <div className="visual-row"><Avatar name="Ana Torres"/><Avatar name="Luis Pérez" size="lg" status="online"/><Avatar name="Equipo"/></div>
    </div>}
    {view==='forms'&&<div className="visual-grid">
      <Input label="Nombre" defaultValue="Proyecto MOK" hint="Elige un nombre descriptivo."/><Input label="Correo" type="email" error="Revisa el correo electrónico." defaultValue="correo"/>
      <Input label="Buscar" search defaultValue="Proyectos"/><Input label="Bloqueado" disabled defaultValue="Sin permisos"/>
      <Select label="Responsable" options={[{value:'ana',label:'Ana Torres'},{value:'luis',label:'Luis Pérez'}]}/>
      <Textarea label="Descripción" defaultValue="Un producto compartido por todo el equipo." maxLength={160}/>
      <AddressInput mode="manual" defaultValue={{address:'Calle 93 # 13–24',city:'Bogotá',postalCode:'110221'}}/>
    </div>}
    {view==='surfaces'&&<div className="visual-stack">
      <div className="visual-grid"><Card title="Proyecto MOK" eyebrow="PRODUCTO" footer={<Button size="sm">Ver proyecto</Button>}>Una base común para construir productos claros.</Card><Card title="Identidad compartida" tone="brand">Color, tipografía y componentes.</Card></div>
      {(['info','success','warning','error'] as const).map(tone=><Alert key={tone} title="Estado del proyecto" tone={tone}>Información para continuar con la tarea.</Alert>)}
      <Tabs active={tab} onChange={setTab} tabs={[{id:'overview',label:'Resumen',content:'Información del proyecto.'},{id:'activity',label:'Actividad',content:'Últimos cambios.'},{id:'settings',label:'Ajustes',disabled:true}]}/>
      <Table caption="Proyectos del equipo" rows={[{id:'1',name:'MOK',status:'Activo'},{id:'2',name:'Portal',status:'Pendiente'}]} rowKey={row=>row.id} columns={[{key:'name',header:'Proyecto',render:row=>row.name},{key:'status',header:'Estado',render:row=><Badge tone={row.status==='Activo'?'success':'neutral'}>{row.status}</Badge>}]} selection={{selectedKeys:['1'],onChange:()=>{},rowLabel:row=>row.name}}/>
    </div>}
    {view==='overlays'&&<div className="visual-stack visual-overlays">
      <div className="visual-row"><Menu label="Acciones visuales" items={[{id:'edit',label:'Editar proyecto'},{id:'copy',label:'Duplicar proyecto'},{id:'disabled',label:'Exportar',disabled:true},{id:'delete',label:'Eliminar proyecto',danger:true}]}/>
        <Popover trigger={<Button>Ver detalles</Button>} title="Detalles del proyecto"><p>Información adicional para tomar una decisión.</p><Button size="sm">Abrir proyecto</Button></Popover>
      </div>
      <Tooltip content="Consulta la información del proyecto."><Button variant="secondary">Ayuda visual</Button></Tooltip>
      <AddressInput/>
    </div>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<VisualFixture/>);
