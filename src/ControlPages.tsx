import {useEffect,useRef,useState} from 'react';
import {Button} from './components';
import {Calendar,RangeSlider,RelativeTimeCard,Scroller,SearchInput,Sheet,ShowMore,Slider,SplitButton,type CalendarPreset,type SheetProps} from './ControlComponents';
import {ComponentPage,Example} from './PendingPage';

function SliderCommit(){
  const [value,setValue]=useState(40);const [committed,setCommitted]=useState<number|null>(null);
  return <><Slider label="Arrastra y suelta" value={value} onChange={setValue} onCommit={setCommitted}/><p role="status" style={{margin:0,fontSize:13}}>Último valor confirmado: {committed??'—'}</p></>;
}
export function SliderPage(){
  return <ComponentPage title="Slider" intro="Permite elegir un valor dentro de un rango." reference="https://vercel.com/geist/slider" sections={[['default','Predeterminado'],['label','Con etiqueta'],['range','Rango con campos'],['disabled','Rango deshabilitado'],['commit','Confirmar al soltar']]} guidelines={<ul><li>Usa pasos razonables, y añade campos numéricos si la exactitud importa.</li><li>Muestra el valor junto a la pista y di qué representa. Con unit se anuncia también a los lectores de pantalla.</li><li>Usa los controles nativos: flechas, Re Pág, Av Pág, Inicio y Fin funcionan sin más.</li><li>Sin label visible, proporciona aria-label.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Un control nativo con el valor visible." code={'<Slider aria-label="Opacidad" defaultValue={40} />'} layout="stack"><Slider aria-label="Opacidad" defaultValue={40}/></Example>
    <Example id="label" title="Con etiqueta" description="label y unit explican qué representa el número." code={'<Slider label="Volumen" unit=" %" defaultValue={60} />'} layout="stack"><Slider label="Volumen" unit=" %" defaultValue={60}/></Example>
    <Example id="range" title="Rango con campos" description="RangeSlider elige mínimo y máximo, con campos para valores exactos. Los dos extremos no se cruzan." code={'<RangeSlider label="Memoria" inputs defaultValue={[256, 1024]} max={2048} step={64} />'} layout="stack"><RangeSlider label="Memoria" inputs defaultValue={[256,1024]} max={2048} step={64}/></Example>
    <Example id="disabled" title="Rango deshabilitado" description="disabled bloquea la pista y los campos." code={'<RangeSlider label="Memoria" inputs disabled defaultValue={[256, 1024]} max={2048} />'} layout="stack"><RangeSlider label="Límites" inputs disabled defaultValue={[256,1024]} max={2048}/></Example>
    <Example id="commit" title="Confirmar al soltar" description="onCommit se ejecuta al soltar o al terminar de pulsar una tecla, para evitar una petición por cada paso." code={'<Slider value={value} onChange={setValue} onCommit={guardar} />'} layout="stack"><SliderCommit/></Example>
  </ComponentPage>;
}

export function SearchInputPage(){
  return <ComponentPage title="Search Input" intro="Un campo de búsqueda con icono, botón para limpiar y estado de carga." reference="https://vercel.com/geist/search-input" sections={[['default','Predeterminado'],['shortcut','Con atajo'],['disabled','Deshabilitado'],['loading','Cargando'],['prefix','Prefijo personalizado']]} guidelines={<ul><li>Escape limpia el campo. El botón de limpiar devuelve el foco al campo.</li><li>shortcut es una indicación visual: el atajo global pertenece a Command Menu.</li><li>Proporciona label o aria-label.</li></ul>}>
    <Example id="default" title="Predeterminado" description="El botón de limpiar aparece cuando hay texto." code={'<SearchInput aria-label="Buscar proyectos" onValueChange={setQuery} />'} layout="stack"><SearchInput aria-label="Buscar proyectos" defaultValue="MOK"/></Example>
    <Example id="shortcut" title="Con atajo" description="Muestra Ctrl K o ⌘ K según el sistema, y Esc cuando hay texto." code={'<SearchInput aria-label="Buscar comandos" shortcut />'} layout="stack"><SearchInput aria-label="Buscar comandos" shortcut/></Example>
    <Example id="disabled" title="Deshabilitado" description="Bloquea la edición y oculta el botón de limpiar." code={'<SearchInput aria-label="Buscar" disabled defaultValue="MOK" />'} layout="stack"><SearchInput aria-label="Buscar, deshabilitado" disabled defaultValue="MOK"/></Example>
    <Example id="loading" title="Cargando" description="loading cambia el icono por un Spinner. El campo sigue siendo editable." code={'<SearchInput aria-label="Buscar" loading />'} layout="stack"><SearchInput aria-label="Buscar, cargando" loading defaultValue="MOK"/></Example>
    <Example id="prefix" title="Prefijo personalizado" description="prefix sustituye al icono de búsqueda." code={'<SearchInput aria-label="Buscar en mok" prefix="mok/" />'} layout="stack"><SearchInput aria-label="Buscar en mok" prefix="mok/"/></Example>
  </ComponentPage>;
}

const saveItems=(say:(text:string)=>void)=>[{id:'save',label:'Guardar',onSelect:()=>say('Guardar')},{id:'draft',label:'Guardar como borrador',onSelect:()=>say('Guardar como borrador')},{id:'copy',label:'Guardar una copia',onSelect:()=>say('Guardar una copia')}];
export function SplitButtonPage(){
  const [message,setMessage]=useState('Elige una acción.');
  const items=saveItems(text=>setMessage(`Acción: ${text}.`));
  return <ComponentPage title="Split Button" intro="Un botón con una acción principal y un menú con acciones relacionadas." reference="https://vercel.com/geist/split-button" sections={[['default','Predeterminado'],['position','Posición del menú'],['icon','Con icono']]} guidelines={<ul><li>Úsalo cuando haya una acción clara por defecto y de una a cuatro variantes. Para acciones sin relación usa Menu.</li><li>Repite la acción principal como primer elemento del menú.</li><li>Solo admite primary y secondary: una acción destructiva no debe quedar oculta en un menú.</li><li>menuButtonLabel nombra el botón del menú para los lectores de pantalla.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Tamaños y variantes de Button." code={'<SplitButton onClick={guardar} items={items} menuButtonLabel="Más opciones de guardado">Guardar</SplitButton>'}>{(['sm','md','lg'] as const).map(size=><SplitButton key={size} size={size} onClick={()=>setMessage(`Acción: Guardar (${size}).`)} items={items} menuButtonLabel={`Más opciones de guardado, ${size}`}>Guardar</SplitButton>)}<SplitButton variant="secondary" onClick={()=>setMessage('Acción: Guardar (secundario).')} items={items} menuButtonLabel="Más opciones, secundario">Guardar</SplitButton><p role="status" style={{margin:0,fontSize:13,width:'100%'}}>{message}</p></Example>
    <Example id="position" title="Posición del menú" description="menuPosition lo alinea con el botón del menú, y cambia de lado si no hay espacio." code={'<SplitButton menuPosition="bottom-start" …>Guardar</SplitButton>'}><SplitButton menuPosition="bottom-start" items={items} menuButtonLabel="Opciones, alineadas al inicio">Inicio</SplitButton><SplitButton menuPosition="bottom-end" items={items} menuButtonLabel="Opciones, alineadas al final">Final</SplitButton></Example>
    <Example id="icon" title="Con icono" description="prefix añade un icono de MOK antes del texto." code={'<SplitButton prefix="plus" …>Crear proyecto</SplitButton>'}><SplitButton prefix="plus" items={[{id:'new',label:'Crear proyecto'},{id:'import',label:'Importar proyecto'}]} menuButtonLabel="Más opciones para crear">Crear proyecto</SplitButton></Example>
  </ComponentPage>;
}

function ShowMoreList(){
  const [expanded,setExpanded]=useState(false);const list=useRef<HTMLUListElement>(null);
  const rows=['Button','Input','Menu','Modal','Select','Slider','Snippet','Tabs','Toast','Tooltip'];
  return <><ul id="show-more-list" ref={list} style={{listStyle:'none',margin:0,padding:0,fontSize:13}}>{(expanded?rows:rows.slice(0,5)).map((row,index)=><li key={row} tabIndex={-1} style={{padding:'8px 0'}} data-index={index}>{row}</li>)}</ul><ShowMore expanded={expanded} count={rows.length-5} controls="show-more-list" onToggle={next=>{setExpanded(next);if(next)requestAnimationFrame(()=>list.current?.querySelector<HTMLElement>('[data-index="5"]')?.focus());}}/></>;
}
export function ShowMorePage(){
  const [open,setOpen]=useState(true);const [plain,setPlain]=useState(false);const [first,setFirst]=useState(false);
  return <ComponentPage title="Show More" intro="Revela u oculta contenido adicional de una misma lista o bloque." reference="https://vercel.com/geist/show-more" sections={[['default','Predeterminado'],['expanded','Expandido'],['no-border','Sin borde'],['list','Con una lista']]} guidelines={<ul><li>Muestra suficientes elementos antes de recortar, normalmente de 5 a 10. Para páginas usa Pagination, y para secciones opcionales Collapse.</li><li>count indica cuántos elementos están ocultos.</li><li>Es un botón con aria-expanded. controls lo vincula a la lista. Al expandir, mueve el foco al primer elemento nuevo.</li></ul>}>
    <Example id="default" title="Predeterminado" description="El estado lo controla la aplicación." code={'<ShowMore expanded={open} onToggle={setOpen} />'} layout="stack"><ShowMore expanded={first} onToggle={setFirst}/></Example>
    <Example id="expanded" title="Expandido" description="Cambia a Mostrar menos." code={'<ShowMore expanded onToggle={setOpen} />'} layout="stack"><ShowMore expanded={open} onToggle={setOpen}/></Example>
    <Example id="no-border" title="Sin borde" description="border={false} oculta las líneas laterales." code={'<ShowMore border={false} expanded={open} onToggle={setOpen} />'} layout="stack"><ShowMore border={false} expanded={plain} onToggle={setPlain}/></Example>
    <Example id="list" title="Con una lista" description="Indica cuántos hay ocultos y mueve el foco al primer elemento nuevo." code={'<ShowMore count={5} controls="lista" expanded={open} onToggle={setOpen} />'} layout="stack"><ShowMoreList/></Example>
  </ComponentPage>;
}

const scrollItems=Array.from({length:16},(_,index)=>`Componente ${index+1}`);
export function ScrollerPage(){
  const items=scrollItems.map(item=><div key={item} className="mk-scroller-item">{item}</div>);
  return <ComponentPage title="Scroller" intro="Muestra una lista de elementos que desborda su contenedor." reference="https://vercel.com/geist/scroller" sections={[['vertical','Vertical'],['horizontal','Horizontal'],['free','Libre'],['vertical-buttons','Vertical con botones'],['horizontal-buttons','Horizontal con botones']]} guidelines={<ul><li>El área recibe el foco y se desplaza con las flechas, aunque ningún elemento interno sea enfocable.</li><li>label nombra la región y los botones, por ejemplo «Desplazar componentes a la derecha».</li><li>Un degradado neutro indica que hay más contenido. Los botones se desactivan al llegar al extremo.</li><li>Los botones van al siguiente hijo directo, así que no envuelvas los elementos en más capas.</li></ul>}>
    <Example id="vertical" title="Vertical" description="Para listas apiladas." code={'<Scroller label="componentes" height={220}>{items}</Scroller>'} layout="stack"><Scroller label="componentes en vertical" height={220}>{items}</Scroller></Example>
    <Example id="horizontal" title="Horizontal" description="Para filas de elementos." code={'<Scroller direction="horizontal" label="componentes">{items}</Scroller>'} layout="stack"><Scroller direction="horizontal" label="componentes en horizontal">{items}</Scroller></Example>
    <Example id="free" title="Libre" description="Solo si el contenido se desplaza en ambos ejes, como registros con líneas largas." code={'<Scroller direction="free" label="registro" height={160}>…</Scroller>'} layout="stack"><Scroller direction="free" label="registro" height={160}><div className="mk-scroller-free-content">{Array.from({length:14},(_,index)=><div key={index}>{`12:0${index%10}:14  GET /api/proyectos/${index+1}  200  ${(index+3)*7} ms  mok-design-system  iad1  respuesta servida desde caché`}</div>)}</div></Scroller></Example>
    <Example id="vertical-buttons" title="Vertical con botones" description="buttons desplaza hasta el siguiente hijo directo." code={'<Scroller buttons label="componentes" height={180}>{items}</Scroller>'} layout="stack"><Scroller buttons label="componentes con botones verticales" height={180}>{items}</Scroller></Example>
    <Example id="horizontal-buttons" title="Horizontal con botones" description="Los botones quedan a los lados." code={'<Scroller buttons direction="horizontal" label="componentes">{items}</Scroller>'} layout="stack"><Scroller buttons direction="horizontal" label="componentes">{items}</Scroller></Example>
  </ComponentPage>;
}

export function RelativeTimeCardPage(){
  const [now]=useState(()=>Date.now());
  return <ComponentPage title="Relative Time Card" intro="Muestra un tiempo relativo y, al pasar el cursor o enfocarlo, la fecha exacta." reference="https://vercel.com/geist/relative-time-card" sections={[['default','Predeterminado'],['ranges','Rangos'],['children','Texto personalizado']]} guidelines={<ul><li>Pásale el tiempo como número y no le añadas «hace»: el formato ya lo incluye.</li><li>Se actualiza cada 30 segundos.</li><li>La tarjeta se abre con el cursor o el foco, y Escape la cierra. Reutiliza Context Card.</li><li>Muestra la hora en UTC y en la zona local.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Pasa el cursor o enfoca el texto." code={'<RelativeTimeCard date={Date.now() - 300000} />'}><span>Último despliegue: <RelativeTimeCard date={now-5*6e4}/></span></Example>
    <Example id="ranges" title="Rangos" description="La unidad se adapta a la distancia." code={'<RelativeTimeCard date={fecha} />'}>{[1e3,36e5,864e5,5*864e5,40*864e5,400*864e5].map(ago=><RelativeTimeCard key={ago} date={now-ago}/>)}</Example>
    <Example id="children" title="Texto personalizado" description="children sustituye el formato en estados que no se pueden expresar como tiempo." code={'<RelativeTimeCard date={fecha}>En cola</RelativeTimeCard>'}><RelativeTimeCard date={now-6e4}>En cola</RelativeTimeCard></Example>
  </ComponentPage>;
}

function SheetDemo({side,modal,label}:{side?:SheetProps['side'];modal?:boolean;label:string}){
  const [open,setOpen]=useState(false);
  return <><Button variant="secondary" onClick={()=>setOpen(true)}>{label}</Button><Sheet open={open} onClose={()=>setOpen(false)} side={side} modal={modal} title="Detalles del despliegue" description="Información de la versión publicada." footer={<Button size="sm" onClick={()=>setOpen(false)}>Listo</Button>}><p>La página sigue disponible mientras consultas estos detalles.</p><p>Escape o el botón de cerrar devuelven el foco al botón que abrió el panel.</p></Sheet></>;
}
export function SheetPage(){
  return <ComponentPage title="Sheet" intro="Muestra contenido en un panel lateral que entra desde un borde de la pantalla." reference="https://vercel.com/geist/sheet" sections={[['default','Predeterminado'],['side','Lado'],['modal','Modal']]} guidelines={<ul><li>Úsalo para contexto asociado que permita seguir usando la página. Para una decisión que bloquea, usa Modal.</li><li>Por defecto no bloquea la página ni se cierra al hacer clic fuera. Siempre tiene un botón de cerrar y responde a Escape.</li><li>El foco entra en el panel al abrir, y vuelve al botón que lo abrió al cerrar.</li><li>No lo uses para confirmar acciones destructivas.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Entra desde la derecha, sin bloquear la página." code={'<Sheet open={open} onClose={close} title="Detalles del despliegue">…</Sheet>'}><SheetDemo label="Abrir panel"/></Example>
    <Example id="side" title="Lado" description="side elige el borde según el lugar del activador." code={'<Sheet side="left" …>…</Sheet>'}>{(['top','right','bottom','left'] as const).map(side=><SheetDemo key={side} side={side} label={{top:'Arriba',right:'Derecha',bottom:'Abajo',left:'Izquierda'}[side]}/>)}</Example>
    <Example id="modal" title="Modal" description="modal bloquea la página y mantiene el foco dentro del panel." code={'<Sheet modal …>…</Sheet>'}><SheetDemo modal label="Abrir modal"/></Example>
  </ComponentPage>;
}

const today=()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),now.getDate());};
const shift=(days:number)=>{const base=today();base.setDate(base.getDate()+days);return base;};
function presets():CalendarPreset[]{const month=today();month.setDate(1);return [{label:'Últimos 7 días',range:{start:shift(-6),end:today()}},{label:'Últimos 30 días',range:{start:shift(-29),end:today()}},{label:'Este mes',range:{start:month,end:today()}}];}
const zones=['Hora local','UTC','America/Bogota','Europe/Madrid'];
export function CalendarPage(){
  const [range,setRange]=useState<{start:Date;end:Date}|null>(null);
  const [message,setMessage]=useState('');
  useEffect(()=>{setMessage(range?`${range.start.toLocaleDateString('es')} – ${range.end.toLocaleDateString('es')}`:'Sin selección');},[range]);
  return <ComponentPage title="Calendar" intro="Permite seleccionar un rango de fechas en un calendario." reference="https://vercel.com/geist/calendar" sections={[['default','Predeterminado'],['horizontal','Disposición horizontal'],['sizes','Tamaños'],['presets','Rangos habituales'],['default-value','Con valor inicial'],['limits','Fechas mínima y máxima'],['pinned','Zona horaria fija']]} guidelines={<ul><li>Elige el inicio y luego el final; el orden se corrige solo. Si conoces la fecha exacta o la pegas, usa Date Picker o Input.</li><li>En el calendario, las flechas cambian de día, Inicio y Fin van a los extremos de la semana, Re Pág y Av Pág cambian de mes, y con Mayús cambian de año. Enter selecciona y Escape cierra.</li><li>Las fechas fuera de min y max se muestran tachadas y no se pueden elegir.</li><li>El selector de zona horaria es solo informativo: no convierte las fechas que devuelve onChange.</li></ul>}>
    <Example id="default" title="Predeterminado" description="El panel se abre bajo el activador y cambia de lado si no hay espacio." code={'<Calendar label="Periodo" timezones={zonas} onChange={setRange} />'}><Calendar label="Periodo" timezones={zones} value={range} onChange={setRange}/><p role="status" style={{margin:0,fontSize:13}}>{message}</p></Example>
    <Example id="horizontal" title="Disposición horizontal" description="horizontalLayout coloca la zona horaria junto al mes." code={'<Calendar horizontalLayout timezones={zonas} />'}><Calendar label="Periodo, horizontal" horizontalLayout timezones={zones}/></Example>
    <Example id="sizes" title="Tamaños" description="size elige entre md y sm." code={'<Calendar size="sm" />'}><Calendar label="Pequeño" size="sm"/><Calendar label="Mediano"/></Example>
    <Example id="presets" title="Rangos habituales" description="presets ofrece rangos comunes. presetsLayout los une al activador o los coloca encima." code={'<Calendar presets={rangos} presetsLayout="stacked" />'}><Calendar label="Compacto" presets={presets()}/><Calendar label="Apilado" presets={presets()} presetsLayout="stacked"/></Example>
    <Example id="default-value" title="Con valor inicial" description="defaultValue preselecciona un rango." code={'<Calendar presets={rangos} defaultValue={rangos[0].range} />'}><Calendar label="Con valor" presets={presets()} defaultValue={presets()[0].range}/></Example>
    <Example id="limits" title="Fechas mínima y máxima" description="min y max limitan el rango seleccionable." code={'<Calendar min={inicio} max={hoy} />'}><Calendar label="Últimos 14 días" min={shift(-14)} max={today()}/></Example>
    <Example id="pinned" title="Zona horaria fija" description="pinnedTimezone la muestra como texto de solo lectura." code={'<Calendar pinnedTimezone="UTC" />'}><Calendar label="Fijo en UTC" pinnedTimezone="UTC"/></Example>
  </ComponentPage>;
}
