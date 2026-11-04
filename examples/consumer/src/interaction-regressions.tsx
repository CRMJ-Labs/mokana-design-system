import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AddressInput,Button,DropdownMenu,Menu,Popover,Tooltip,type AddressValue} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';

function InteractionRegressions(){
  const [address,setAddress]=useState<Partial<AddressValue>>({address:'Calle inicial'});
  const [disabled,setDisabled]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [popoverOpen,setPopoverOpen]=useState(false);
  const [showInitialPopover,setShowInitialPopover]=useState(false);
  const [events,setEvents]=useState<string[]>([]);
  const addressRoot=useRef<HTMLDivElement>(null),dropdownRoot=useRef<HTMLSpanElement>(null);
  const popoverRoot=useRef<HTMLSpanElement>(null),popoverTrigger=useRef<HTMLButtonElement>(null);
  const record=(message:string)=>setEvents(previous=>[...previous,message]);
  const items=[{label:'Editar',icon:'edit' as const,onSelect:()=>record('edit')},{label:'Bloqueada',disabled:true},{label:'Eliminar',danger:true,onSelect:()=>record('delete')}];
  return <main className="mk" data-theme="light" style={{padding:24,minHeight:'100vh'}}>
    <h1>Regresiones de interacción</h1>
    <section id="controlled-address">
      <h2>Dirección controlada</h2>
      <Button onClick={()=>setAddress({address:'Carrera actualizada'})}>Cargar dirección</Button>
      <Button onClick={()=>setAddress({address:''})}>Reiniciar dirección</Button>
      <Button onClick={()=>setDisabled(current=>!current)}>Alternar bloqueo</Button>
      <AddressInput ref={addressRoot} value={address} disabled={disabled} onValueChange={setAddress} onChange={()=>record('address-change')}/>
      <output aria-label="Dirección actual">{JSON.stringify(address)}</output>
    </section>
    <section id="uncontrolled-address"><h2>Dirección sin control</h2><form onSubmit={event=>{event.preventDefault();record('submit');}}><AddressInput defaultValue={{address:'Calle'}}/><Button type="submit">Enviar dirección</Button></form></section>
    <section id="dropdown"><h2>Menú compatible</h2><DropdownMenu ref={dropdownRoot} data-contract="dropdown" label="Acciones compatibles" items={items}/></section>
    <section id="controlled-menu"><h2>Menú controlado</h2><DropdownMenu label="Acciones controladas" items={items} open={menuOpen} onOpenChange={next=>{setMenuOpen(next);record(`menu:${next}`);}}/></section>
    <section id="default-menu"><h2>Menú inicialmente abierto</h2><DropdownMenu label="Acciones iniciales" defaultOpen items={items}/></section>
    <section id="shared-menu"><h2>Menú compartido</h2><Menu label="Acciones nuevas" items={[{id:'edit',label:'Editar'},{id:'delete',label:'Eliminar'}]} onOpenChange={next=>record(`shared-menu:${next}`)}/></section>
    <section id="popover"><h2>Popover</h2><Popover ref={popoverRoot} data-contract="popover" title="Detalles del proyecto" trigger={<Button ref={popoverTrigger} onClick={()=>record('popover-trigger')}>Ver detalles</Button>} onOpenChange={next=>record(`popover:${next}`)}><p>Información del proyecto.</p><Button onClick={()=>record('popover-action')}>Acción del panel</Button></Popover><Button>Después del popover</Button></section>
    <section id="controlled-popover"><h2>Popover controlado</h2><Popover title="Detalles controlados" open={popoverOpen} onOpenChange={setPopoverOpen} trigger={<Button>Ver panel controlado</Button>}>Contenido controlado.</Popover><Button onClick={()=>setPopoverOpen(true)}>Abrir desde aplicación</Button><Button onClick={()=>setPopoverOpen(false)}>Cerrar desde aplicación</Button><Button onClick={()=>setTimeout(()=>setPopoverOpen(false),500)}>Programar cierre</Button></section>
    <section id="text-popover"><h2>Disparador de texto</h2><Popover trigger="Más información" label="Información del equipo">Texto del equipo.</Popover></section>
    <section id="span-popover"><h2>Disparador personalizado</h2><Popover trigger={<span>Ayuda personalizada</span>} title="Ayuda personalizada del equipo">Contenido personalizado.</Popover></section>
    <section id="fragment-popover"><h2>Disparador en fragmento</h2><Popover trigger={<><Button>Ayuda en fragmento</Button></>} title="Fragmento">Contenido del fragmento.</Popover></section>
    <section id="cancelled-popover"><h2>Apertura cancelada</h2><Popover trigger={<Button onClick={event=>event.preventDefault()}>Cancelar apertura</Button>} title="No abrir">Contenido.</Popover></section>
    <section id="default-popover"><h2>Popover inicialmente abierto</h2><Button onClick={()=>setShowInitialPopover(true)}>Montar popover abierto</Button>{showInitialPopover&&<Popover trigger="Panel inicial" title="Panel inicial" defaultOpen>Contenido inicial.</Popover>}</section>
    <form id="popover-form" onSubmit={event=>{event.preventDefault();record('popover-submit');}}><Popover trigger={<button>Popover en formulario</button>} title="Sin envío">Contenido sin enviar.</Popover></form>
    <div id="corner-popover" style={{position:'fixed',bottom:8,right:8,zIndex:120}}><Popover trigger="Panel de esquina" title="Contenido largo"><div style={{height:1500}}>Contenido más alto que la ventana.</div><Button>Fin del panel</Button></Popover></div>
    <Button id="outside" onClick={()=>record(`refs:${addressRoot.current?.tagName},${dropdownRoot.current?.tagName}`)}>Control exterior</Button>
    <Button onClick={()=>record(`popover-refs:${popoverRoot.current?.tagName},${popoverTrigger.current?.tagName}`)}>Referencias del popover</Button>
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:100,padding:100}}>
      {(['top','bottom','left','right'] as const).map(placement=><Tooltip key={placement} placement={placement} content={`Ayuda ${placement}`}><Button>Ayuda {placement}</Button></Tooltip>)}
    </div>
    <output aria-label="Eventos de interacción">{events.join('\n')}</output>
  </main>;
}
createRoot(document.getElementById('root')!).render(<InteractionRegressions/>);
