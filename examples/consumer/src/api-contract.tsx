import {useRef,useState,type ComponentProps} from 'react';
import {createRoot} from 'react-dom/client';
import {AddressInput,Alert,Avatar,AvatarGroup,Badge,Brand,Button,ButtonLink,Card,Checkbox,ClearableInput,Collapse,Combobox,DatePicker,Drawer,EmptyState,FileUpload,Input,Modal,Navigation,Pagination,Pill,ProgressBar,Radio,Select,Skeleton,Table,Tabs,Textarea,Toggle,Tooltip,type AlertProps,type CardProps,type EmptyStateProps,type ComboboxProps,type PaginationProps} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import './app.css';

// This entry compiles against the installed declarations and runs against the packed JS.
function ApiContract(){
  const card=useRef<HTMLElement>(null),alert=useRef<HTMLDivElement>(null),empty=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),input=useRef<HTMLInputElement>(null),checkbox=useRef<HTMLInputElement>(null),clearable=useRef<HTMLInputElement>(null),select=useRef<HTMLSelectElement>(null),textarea=useRef<HTMLTextAreaElement>(null),modal=useRef<HTMLDialogElement>(null),drawer=useRef<HTMLDialogElement>(null),table=useRef<HTMLDivElement>(null);
  const [events,setEvents]=useState<string[]>([]);const [open,setOpen]=useState(false);const [panel,setPanel]=useState(false);const [checked,setChecked]=useState(false);const [tab,setTab]=useState('one');const [page,setPage]=useState(1);
  const record=(name:string,value:unknown)=>setEvents(previous=>[...previous,`${name}:${String(value)}`]);
  const cardProps:CardProps={title:'Contrato de Card',className:'consumer-card',id:'contract-card',style:{padding:28},'aria-label':'Tarjeta de integración'};
  const alertProps:AlertProps={title:'Mensaje de integración',tone:'info',className:'consumer-alert'};
  const emptyProps:EmptyStateProps={title:'Sin datos de integración',className:'consumer-empty'};
  const comboProps:ComboboxProps={label:'Combinación',options:['Uno','Dos'],name:'combo',onValueChange:value=>record('combo',value)};
  const pagerProps:PaginationProps={page,pages:3,onPageChange:setPage};
  const nativeButton:ComponentProps<typeof Button>={ref:button,type:'button'};
  return <main className="mk consumer-app" data-theme="light"><h1>Contratos de integración</h1><div className="consumer-shell">
    <Card {...cardProps} ref={card} data-contract="card" onClick={event=>record('card',event.currentTarget.id)}>Contenido</Card>
    <Alert {...alertProps} ref={alert} data-contract="alert" role="note" aria-describedby="shared-help">Ayuda</Alert>
    <EmptyState {...emptyProps} ref={empty} data-contract="empty" tabIndex={-1}/>
    <Button {...nativeButton} onClick={()=>{const targets=[card.current?.tagName,alert.current?.tagName,empty.current?.tagName,button.current?.tagName,input.current?.tagName,checkbox.current?.tagName,clearable.current?.tagName,select.current?.tagName,textarea.current?.tagName,modal.current?.tagName,drawer.current?.tagName,table.current?.tagName];record('refs',targets.join(','));input.current?.focus();}}>Comprobar referencias</Button>
    <p id="shared-help">Ayuda externa compartida.</p>
    <form onSubmit={event=>{event.preventDefault();record('form',new FormData(event.currentTarget).get('name'));}}>
      <Input ref={input} label="Campo de contrato" name="name" defaultValue="Inicial" hint="Ayuda interna" aria-describedby="shared-help" rootProps={{className:'consumer-field',id:'input-container'}} onChange={event=>record('native',event.currentTarget.value)} onValueChange={value=>record('value',value)}/>
      <Input label="Campo cancelado" onChange={event=>event.preventDefault()} onValueChange={value=>record('cancelled',value)}/>
      <Select ref={select} label="Selector de contrato" name="kind" options={[{value:'one',label:'Uno'},{value:'two',label:'Dos'}]} hint="Ayuda del selector" aria-describedby="shared-help" onValueChange={value=>record('select',value)}/>
      <Textarea ref={textarea} label="Texto de contrato" onValueChange={value=>record('textarea',value)} rootProps={{className:'textarea-container'}}/>
      <Checkbox ref={checkbox} label="Casilla de contrato" onChange={value=>record('legacy-checked',value)} onCheckedChange={value=>record('checked',value)} rootProps={{id:'checkbox-container'}}/>
      <Radio label="Radio de contrato" name="radio" onCheckedChange={value=>record('radio',value)}/>
      <Toggle label="Interruptor de contrato" checked={checked} onCheckedChange={setChecked}/>
      <ClearableInput ref={clearable} label="Limpiable de contrato" defaultValue="Texto" onValueChange={value=>record('clearable',value)}/>
      <Combobox {...comboProps}/><DatePicker label="Fecha de contrato" onValueChange={value=>record('date',value)}/>
      <FileUpload label="Archivo de contrato" name="attachment" onChange={event=>record('file-native',event.currentTarget.files?.[0]?.name)} onValueChange={files=>record('file',files?.[0]?.name)}/>
      <Button type="submit">Enviar contrato</Button><Pagination {...pagerProps} data-contract="pagination"/><output aria-label="Página actual">{page}</output>
    </form>
    <Tabs tabs={[{id:'one',label:'Uno',content:'Panel uno'},{id:'two',label:'Dos',content:'Panel dos'}]} active={tab} onValueChange={setTab} className="consumer-tabs"/>
    <Button onClick={()=>setOpen(true)}>Abrir modal de contrato</Button><Modal ref={modal} open={open} onClose={()=>setOpen(false)} onOpenChange={value=>record('modal-open',value)} title="Modal de contrato" className="consumer-modal"><p>Contenido modal</p></Modal>
    <Button onClick={()=>setPanel(true)}>Abrir panel de contrato</Button><Drawer ref={drawer} open={panel} onClose={()=>setPanel(false)} title="Panel de contrato" onOpenChange={value=>record('drawer-open',value)} className="consumer-drawer"><p>Contenido del panel</p></Drawer>
    <Table ref={table} caption="Tabla de contrato" rows={[{id:'one'}]} rowKey={row=>row.id} columns={[{key:'id',header:'ID',render:row=>row.id}]} data-contract="table" className="consumer-table"/>
    <Badge id="contract-badge" className="consumer-badge" data-contract="badge">Estado</Badge><Brand id="contract-brand" className="consumer-brand" compact/>
    <Pill href="#contract-card" className="consumer-pill" data-contract="pill">Ir a tarjeta</Pill><ButtonLink href="#contract-card" data-contract="link">Ver tarjeta</ButtonLink>
    <Avatar name="Ana" className="consumer-avatar" aria-label="Avatar personalizado"/><AvatarGroup members={[{name:'Ana'}]} className="consumer-avatar-group"/>
    <Navigation items={[{label:'Tarjeta',href:'#contract-card'}]} className="consumer-navigation"/>
    <Skeleton className="consumer-skeleton"/><ProgressBar value={150} label="Progreso limitado" className="consumer-progress"/>
    <Collapse title="Sección de contrato" className="consumer-collapse">Contenido expandible</Collapse>
    <Tooltip content="Ayuda de contrato" className="consumer-tooltip" onFocusCapture={()=>record('tooltip-focus','true')}><Button>Ayuda del contrato</Button></Tooltip>
    <AddressInput className="consumer-address" onValueChange={value=>record('address',value.country)}/>
    <output aria-label="Eventos de contrato">{events.join('\n')}</output>
  </div></main>;
}

createRoot(document.getElementById('root')!).render(<ApiContract/>);
