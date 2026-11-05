import {Icon} from './Icon';
import {CodeDisclosure} from './CodeComponents';
import {useState,type ReactNode} from 'react';
import {CopyButton} from './CopyButton';
import {ContextMenu} from './ContextMenu';
import {ContextCard} from './ContextCard';
import {CommandMenu,type CommandItem,type CommandPage} from './CommandMenu';
import {Button} from './components';
import type {MenuEntry} from './Menu';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-interaction-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-interaction-preview">{children}</div><CodeDisclosure code={code}/></section>;
}
function Page({title,description,sections,children}:{title:string;description:string;sections:[string,string][];children:ReactNode}){
  return <article className="mk-docs-component-page" data-page-sections={JSON.stringify(sections)}><header><p className="mk-eyebrow">COMPONENTE</p><h1>{title}</h1><p>{description}</p></header>{children}</article>;
}
function Guidelines({slug,children}:{slug:string;children:ReactNode}){
  return <section className="mk-interaction-guidelines"><h2>Uso y accesibilidad</h2>{children}<a href={`https://vercel.com/geist/${slug}`} target="_blank" rel="noreferrer">Referencia: Geist</a></section>;
}

export function CopyButtonPage(){
  return <Page title="Copy Button" description="Copia un texto al portapapeles y confirma el resultado de la acción." sections={[["default","Predeterminado"],["custom-label","Etiqueta personalizada"],["disabled","Deshabilitado"]]}>
    <Example id="default" title="Predeterminado" description="Copia el comando. El icono cambia a una verificación durante dos segundos solo cuando la copia se completa." code={'<CopyButton value="npm install @mokanadev/design-system" />'}><code>npm install @mokanadev/design-system</code><CopyButton value="npm install @mokanadev/design-system"/></Example>
    <Example id="custom-label" title="Etiqueta personalizada" description="Identifica el dato que se copiará con una etiqueta accesible específica." code={'<CopyButton value="req_mok_demo_7f2a" label="Copiar identificador de solicitud" />'}><code>req_mok_demo_7f2a</code><CopyButton value="req_mok_demo_7f2a" label="Copiar identificador de solicitud"/></Example>
    <Example id="disabled" title="Deshabilitado" description="Deshabilita la acción cuando el texto todavía no esté disponible." code={'<CopyButton value="" disabled />'}><CopyButton value="" disabled/></Example>
    <Guidelines slug="copy-button"><p>Importa CopyButton y CopyButtonProps. value contiene el texto exacto; onCopy se ejecuta tras copiar y onCopyError permite gestionar fallos. Requiere acceso al portapapeles del navegador en HTTPS o localhost.</p><p>Enter y Espacio activan el botón. El resultado se anuncia sin mover el foco. Si el navegador rechaza la copia, muestra un mensaje y permite volver a intentarlo.</p></Guidelines>
  </Page>;
}

export function ContextMenuPage(){
  const [message,setMessage]=useState('Prueba el clic derecho, una pulsación larga o el botón de acciones.');
  const items:MenuEntry[]=[{id:'open',label:'Abrir proyecto',onSelect:()=>setMessage('Abrir proyecto seleccionado.')},{id:'duplicate',label:'Duplicar proyecto',onSelect:()=>setMessage('Duplicar proyecto seleccionado.')},{id:'archive',label:'Archivar proyecto',onSelect:()=>setMessage('Archivar proyecto seleccionado.')}];
  return <Page title="Context Menu" description="Acciones del elemento disponibles con clic derecho, pulsación larga o teclado." sections={[["default","Predeterminado"],["disabled","Opciones deshabilitadas"],["links","Enlaces"],["prefix-suffix","Prefijo y sufijo"]]}>
    <Example id="default" title="Predeterminado" description="Abre las acciones en la posición del cursor. El botón visible ofrece las mismas acciones." code={'<ContextMenu items={items} label="Acciones del proyecto">\n  Proyecto MOK · Clic derecho o pulsación larga\n</ContextMenu>'}><ContextMenu items={items} label="Acciones del proyecto">Proyecto MOK · Clic derecho o pulsación larga</ContextMenu></Example>
    <Example id="disabled" title="Opciones deshabilitadas" description="El teclado omite las acciones que no están disponibles." code={'<ContextMenu items={[...items, { id: "export", label: "Exportar proyecto", disabled: true }]}>\n  Proyecto sin exportaciones\n</ContextMenu>'}><ContextMenu items={[...items,{id:'export',label:'Exportar proyecto',disabled:true}]}>Proyecto sin exportaciones</ContextMenu></Example>
    <Example id="links" title="Enlaces" description="Los enlaces conservan su destino y comportamiento nativo." code={'<ContextMenu items={[{ id: "button", label: "Ver Button", href: "/components/button" }]}>\n  Documentación de componentes\n</ContextMenu>'}><ContextMenu items={[{id:'button',label:'Ver Button',href:'/components/button'},{id:'copy',label:'Ver Copy Button',href:'/components/copy-button'}]}>Documentación de componentes</ContextMenu></Example>
    <Example id="prefix-suffix" title="Prefijo y sufijo" description="Añade indicadores visuales sin cambiar el nombre de las acciones. Los atajos son informativos en este ejemplo." code={'<ContextMenu items={[{ id: "duplicate", label: "Duplicar proyecto", prefix: <Icon name="copy" size={16} />, suffix: "⌘D", onSelect: duplicateProject }]}>\n  Proyecto MOK\n</ContextMenu>'}><ContextMenu items={items.map((item,index)=>({...item,prefix:<Icon name={(['external-link','copy','archive'] as const)[index]} size={16}/>,suffix:['Enter','⌘D','⌘⇧A'][index]}))}>Proyecto MOK</ContextMenu></Example>
    <p className="mk-interaction-feedback" role="status">{message}</p>
    <Guidelines slug="context-menu"><p>Importa ContextMenu y ContextMenuProps. items utiliza el tipo MenuEntry del menú MOK, con enlaces, secciones, prefijos, sufijos y opciones bloqueadas.</p><p>Enfoca el área y pulsa Shift+F10 o la tecla Menú. Usa las flechas, Inicio, Fin o escribe para buscar. Escape cierra y devuelve el foco al área. Las acciones también están disponibles en el botón visible.</p></Guidelines>
  </Page>;
}

function ProjectMetadata(){
  return <><h3>MOK Design System</h3><p>Biblioteca de componentes del equipo</p><dl><dt>Estado</dt><dd>Activo</dd><dt>Propietario</dt><dd>Equipo MOK</dd><dt>Plan</dt><dd>Profesional</dd></dl><a href="/components/description">Ver metadatos del proyecto</a></>;
}
export function ContextCardPage(){
  return <Page title="Context Card" description="Información complementaria de una entidad al pasar el cursor o enfocar su nombre." sections={[["default","Posición"],["alignment","Alineación"],["render","Activador personalizado"],["link","Como enlace"]]}>
    <Example id="default" title="Posición" description="La tarjeta se adapta al espacio disponible. Mantiene su contenido accesible al mover el cursor desde el activador." code={'<ContextCard trigger="Proyecto MOK" label="Información del proyecto" side="top">\n  <ProjectMetadata />\n</ContextCard>'}>{(['top','bottom','left','right'] as const).map(side=><ContextCard key={side} trigger={{top:'Arriba',bottom:'Abajo',left:'Izquierda',right:'Derecha'}[side]} label="Información del proyecto" side={side}><ProjectMetadata/></ContextCard>)}</Example>
    <Example id="alignment" title="Alineación" description="Alinea la tarjeta al inicio, centro o final del activador." code={'<ContextCard trigger="Proyecto MOK" label="Información del proyecto" align="start">\n  <ProjectMetadata />\n</ContextCard>'}>{(['start','center','end'] as const).map(align=><ContextCard key={align} trigger={{start:'Inicio',center:'Centro',end:'Final'}[align]} label="Información del proyecto" align={align}><ProjectMetadata/></ContextCard>)}</Example>
    <Example id="render" title="Activador personalizado" description="render permite usar tu propio botón y propagar los atributos de accesibilidad." code={'<ContextCard trigger="Proyecto MOK" label="Información del proyecto"\n  render={props => <Button {...props} variant="secondary">Proyecto MOK</Button>}\n>\n  <ProjectMetadata />\n</ContextCard>'}><ContextCard trigger="Proyecto MOK" label="Información del proyecto" render={props=><Button {...props} variant="secondary">Proyecto MOK</Button>}><ProjectMetadata/></ContextCard></Example>
    <Example id="link" title="Como enlace" description="El enlace conserva su navegación y muestra información adicional al enfocarse o pasar el cursor." code={'<ContextCard trigger="Proyecto MOK" label="Información del proyecto"\n  render={props => <a {...props} href="/components/description">Proyecto MOK</a>}\n>\n  <ProjectMetadata />\n</ContextCard>'}><ContextCard trigger="Proyecto MOK" label="Información del proyecto" render={props=><a {...props} href="/components/description">Proyecto MOK</a>}><ProjectMetadata/></ContextCard></Example>
    <Guidelines slug="context-card"><p>Importa ContextCard y ContextCardProps. El contenido admite metadatos y una acción principal. Usa elementos de texto dentro del activador predeterminado; para un enlace o botón personalizado, utiliza render.</p><p>La apertura con cursor tiene un retardo de 150 ms; el foco la abre directamente. Tab alcanza el enlace de la tarjeta. Escape la cierra y devuelve el foco al activador. Mantén la información esencial visible en la página y reserva las acciones destructivas para un menú.</p></Guidelines>
  </Page>;
}

export function CommandMenuPage(){
  const [open,setOpen]=useState(false);const [variant,setVariant]=useState('default');
  const [message,setMessage]=useState('Selecciona un comando para probar la paleta.');
  const items:CommandItem[]=[{id:'projects',label:'Buscar proyectos',page:'projects',keywords:['proyectos','equipo']},{id:'create',label:'Crear proyecto',onSelect:()=>setMessage('Crear proyecto seleccionado.')},{id:'invite',label:'Invitar al equipo',onSelect:()=>setMessage('Invitar al equipo seleccionado.')},{id:'export',label:'Exportar proyectos',disabled:true}];
  const pages:CommandPage[]=[{id:'projects',label:'Proyectos',placeholder:'Busca un proyecto…',items:[{id:'design',label:'Abrir MOK Design System',keywords:['diseño','componentes'],onSelect:()=>setMessage('MOK Design System seleccionado.')},{id:'website',label:'Abrir sitio web',onSelect:()=>setMessage('Sitio web seleccionado.')},{id:'docs',label:'Consultar documentación',href:'/components/description'}]}];
  function show(next:string){setVariant(next);setOpen(true);}
  const configured=items.map((item,index)=>({...item,group:variant==='divider'?(index<2?'Proyectos':'Equipo'):undefined,suffix:variant==='suffix'?['4 proyectos','Nuevo','Equipo','Próximamente'][index]:undefined}));
  return <Page title="Command Menu" description="Una paleta de búsqueda para encontrar recursos y ejecutar acciones con el teclado." sections={[["default","Predeterminado"],["divider","Con divisiones"],["suffix","Con sufijo"]]}>
    <Example id="default" title="Predeterminado" description="Abre con el botón o Ctrl+K / ⌘K. Busca un comando o entra en Proyectos para explorar otra página." code={'<CommandMenu open={open} onOpenChange={setOpen} items={items} pages={pages} />'}><Button variant="secondary" onClick={()=>show('default')}>Abrir comandos</Button><kbd>Ctrl / ⌘ K</kbd></Example>
    <Example id="divider" title="Con divisiones" description="Agrupa comandos por ámbito para recorrer una lista con claridad." code={'const items = [\n  { id: "create", label: "Crear proyecto", group: "Proyectos", onSelect: createProject },\n  { id: "invite", label: "Invitar al equipo", group: "Equipo", onSelect: inviteMember },\n];'}><Button variant="secondary" onClick={()=>show('divider')}>Abrir comandos</Button></Example>
    <Example id="suffix" title="Con sufijo" description="El sufijo aporta contexto adicional, como el número de recursos o el alcance de una acción." code={'const items = [\n  { id: "projects", label: "Buscar proyectos", suffix: "4 proyectos", page: "projects" },\n];'}><Button variant="secondary" onClick={()=>show('suffix')}>Abrir comandos</Button></Example>
    <p className="mk-interaction-feedback" role="status">{message}</p>
    <CommandMenu open={open} onOpenChange={setOpen} items={configured} pages={pages}/>
    <Guidelines slug="command-menu"><p>Importa CommandMenu, CommandItem y CommandPage. Controla open con onOpenChange y define items. page abre una página de pages; keywords añade términos de búsqueda y keybind muestra una indicación de atajo. Configura una sola instancia con shortcut activo por aplicación.</p><p>Flechas, Inicio y Fin cambian la selección; Enter ejecuta; Escape cierra. Retroceso en una búsqueda vacía vuelve a la página anterior y conserva su consulta. El diálogo mantiene el foco dentro mientras está abierto y lo devuelve al control original al cerrar. Los resultados se anuncian con aria-live="polite".</p></Guidelines>
  </Page>;
}
