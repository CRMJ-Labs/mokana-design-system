import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AddressInput,Alert,Avatar,Badge,Button,ButtonLink,CustomButton,Card,Checkbox,DataTable,Input,Menu,Popover,Radio,Select,Table,Tabs,Textarea,Toggle,Tooltip,type Column} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';
import './visual.css';

const tableRows=[{id:'1',name:'MOK Design System',status:'Activo'},{id:'2',name:'Portal de clientes',status:'En revisión'},{id:'3',name:'API de pagos',status:'Activo'}];
const tableColumns:Column<typeof tableRows[number]>[]=[{key:'name',header:'Proyecto',minWidth:180,sortValue:row=>row.name,render:row=>row.name},{key:'status',header:'Estado',minWidth:130,render:row=><Badge subtle tone={row.status==='Activo'?'success':'warning'}>{row.status}</Badge>}];
function TableFixture(){
  const [selected,setSelected]=useState<string[]>(['1']),[expanded,setExpanded]=useState<string[]>(['1']),[count,setCount]=useState(1);
  return <div className="visual-stack">
    <section data-testid="primary-table"><h2>Primaria</h2><DataTable caption="Proyectos del equipo" columns={tableColumns} rows={tableRows} rowKey={row=>row.id} pageSize={2} searchText={row=>row.name} selection={{selectedKeys:selected,onChange:setSelected,rowLabel:row=>row.name}}/></section>
    <section data-testid="secondary-table"><h2>Secundaria</h2><Table caption="Detalles del proyecto" variant="secondary" columns={tableColumns.map(column=>({...column,resizable:true,defaultWidth:column.key==='name'?240:160,minWidth:column.key==='name'?180:130,maxWidth:480}))} rows={tableRows.slice(0,2)} rowKey={row=>row.id} expansion={{expandedKeys:expanded,onChange:setExpanded,rowLabel:row=>row.name,render:row=><p>Información de {row.name}.</p>}}/></section>
    <section data-testid="load-more-table"><h2>Carga progresiva</h2><Table caption="Más proyectos" columns={tableColumns} rows={tableRows.slice(0,count)} rowKey={row=>row.id} loadMore={{hasMore:count<tableRows.length,autoLoad:false,onLoadMore:()=>setCount(value=>value+1)}}/></section>
  </div>;
}

function VisualFixture(){
  const params=new URLSearchParams(location.search),view=params.get('view')??'controls';
  const [checked,setChecked]=useState(true),[tab,setTab]=useState('overview');
  return <main className="mk visual-fixture" data-theme={params.get('theme')==='dark'?'dark':'light'}>
    <h1>MOK · {view}</h1>
    {view==='tables'&&<TableFixture/>}
    {view==='button-sizes'&&<div className="visual-stack">{(['sm','md','lg'] as const).map(size=><section key={size} className="visual-stack"><h2>{size.toUpperCase()}</h2><div className="visual-row">
      <Button size={size} data-testid={`button-${size}`}>Continuar</Button>
      <ButtonLink size={size} href="#" data-testid={`link-${size}`}>Continuar</ButtonLink>
      <CustomButton size={size} colors={{background:'var(--default)',foreground:'var(--default-foreground)',border:'var(--border)'}} data-testid={`custom-${size}`}>Continuar</CustomButton>
      <Button size={size} prefix="plus" data-testid={`icon-text-${size}`}>Continuar</Button>
      <Button size={size} svgOnly prefix="plus" aria-label={`Añadir ${size}`} data-testid={`icon-${size}`}/>
      <ButtonLink size={size} svgOnly prefix="plus" href="#" aria-label={`Abrir ${size}`} data-testid={`icon-link-${size}`}/>
      <Button size={size} prefix="plus" loading data-testid={`loading-${size}`}>Continuar</Button>
      <Button size={size} disabled data-testid={`disabled-${size}`}>Continuar</Button>
    </div></section>)}</div>}
    {view==='controls'&&<div className="visual-stack">
      {(['sm','md','lg'] as const).map(size=><div className="visual-row" key={size}>{(['primary','secondary','tertiary','outline','ghost','danger','danger-soft'] as const).map(variant=><Button key={variant} size={size} variant={variant}>{({primary:'Primary',secondary:'Secondary',tertiary:'Tertiary',outline:'Outline',ghost:'Ghost',danger:'Danger','danger-soft':'Danger Soft'})[variant]}</Button>)}</div>)}
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
