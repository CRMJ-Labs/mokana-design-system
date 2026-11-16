import {useState,type ReactNode} from 'react';
import {Button} from './components';
import {CodeDisclosure} from './CodeComponents';
import {SplitContainer} from './SplitContainer';
import './split-container-documentation.css';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-split-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-split-preview">{children}</div><CodeDisclosure code={code}/></section>;
}
function Panel({title,children}:{title:string;children:ReactNode}){
  return <div style={{padding:'var(--space-5)',display:'grid',gap:'var(--space-3)'}}><strong>{title}</strong><div>{children}</div></div>;
}

export function SplitContainerPage(){
  const [size,setSize]=useState(35);
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Split Container</h1><p>Dos paneles que comparten espacio y permiten ajustar su proporción sin perder el contexto de trabajo.</p></header>
    <Example id="horizontal" title="Horizontal" description="Arrastra el separador para cambiar el ancho de los paneles. El primero empieza en 35% y puede ocupar entre 20% y 80%. En móvil se apilan en orden de lectura." code={'<SplitContainer defaultSize={35} separatorLabel="Ancho de proyectos" style={{ height: 280 }}>\n  <div>Lista de proyectos</div>\n  <div>Detalle del proyecto</div>\n</SplitContainer>'}>
      <SplitContainer defaultSize={35} separatorLabel="Ancho de proyectos" style={{height:280}}><Panel title="Proyectos"><ul><li>Portal de clientes</li><li>Design System</li><li>Centro de ayuda</li></ul></Panel><Panel title="Portal de clientes"><p>Todo el contexto del proyecto junto a su lista de navegación.</p><Button variant="secondary">Abrir proyecto</Button></Panel></SplitContainer>
    </Example>
    <Example id="vertical" title="Vertical" description="Divide la altura entre el área de trabajo y la salida. Define una altura en el contenedor para repartir el espacio disponible." code={'<SplitContainer orientation="vertical" defaultSize={60}\n  separatorLabel="Altura del editor" style={{ height: 320 }}>\n  <div>Editor</div>\n  <div>Resultado</div>\n</SplitContainer>'}>
      <SplitContainer orientation="vertical" defaultSize={60} separatorLabel="Altura del editor" style={{height:320}}><Panel title="Editor"><p>Construye una interfaz con los componentes de MOK.</p></Panel><Panel title="Resultado"><p>Los cambios se muestran aquí.</p></Panel></SplitContainer>
    </Example>
    <Example id="controlled" title="Tamaño controlado y límites" description="size y onSizeChange conectan el tamaño al estado de la aplicación. Este ejemplo limita el primer panel a 25–65%; el botón restaura el 35%." code={'const [size, setSize] = useState(35);\n<SplitContainer size={size} onSizeChange={setSize} minSize={25} maxSize={65}>\n  <div>Filtros</div>\n  <div>Resultados</div>\n</SplitContainer>\n<Button onClick={() => setSize(35)}>Restablecer tamaño</Button>'}>
      <SplitContainer size={size} onSizeChange={setSize} minSize={25} maxSize={65} separatorLabel="Ancho de filtros" style={{height:240}}><Panel title="Filtros"><p>Estado, equipo y fecha.</p></Panel><Panel title="Resultados"><p>El primer panel ocupa {Math.round(size)}% del espacio disponible.</p></Panel></SplitContainer><div className="mk-row"><Button variant="secondary" onClick={()=>setSize(35)}>Restablecer tamaño</Button><span>Primer panel: {Math.round(size)}%</span></div>
    </Example>
    <Example id="disabled" title="Distribución fija" description="disabled bloquea el ajuste y retira el separador del recorrido de Tab. Los controles dentro de los paneles siguen disponibles." code={'<SplitContainer disabled defaultSize={40}>\n  <div>Resumen</div>\n  <div>Actividad</div>\n</SplitContainer>'}>
      <SplitContainer disabled defaultSize={40} style={{height:220}}><Panel title="Resumen"><p>Una proporción estable.</p></Panel><Panel title="Actividad"><Button variant="secondary">Ver actividad</Button></Panel></SplitContainer>
    </Example>
    <Example id="rtl" title="Dirección de lectura" description="Respeta dir=rtl en el orden, el arrastre y las flechas. stackOnMobile=false conserva los paneles en paralelo también en pantallas pequeñas." code={'<SplitContainer dir="rtl" stackOnMobile={false} style={{ height: 220 }}>\n  <div>Primer panel</div>\n  <div>Segundo panel</div>\n</SplitContainer>'}>
      <SplitContainer dir="rtl" stackOnMobile={false} separatorLabel="Ancho del primer panel RTL" style={{height:220}}><Panel title="Primer panel"><p>Inicio de la lectura.</p></Panel><Panel title="Segundo panel"><p>Contenido complementario.</p></Panel></SplitContainer>
    </Example>
    <section className="mk-split-example"><h2>Uso y accesibilidad</h2><ul><li>Proporciona exactamente dos hijos y un separatorLabel que identifique el panel que se ajusta.</li><li>Con el foco en el separador, usa las flechas del eje para ajustar 1 punto porcentual, Mayús + flecha para 10, e Inicio y Fin para alcanzar los límites.</li><li>Escape o la cancelación del gesto restauran el tamaño anterior al arrastre. El foco permanece en el separador.</li><li>Los paneles tienen desplazamiento independiente. El tamaño se expresa como porcentaje del espacio disponible, descontando el separador.</li><li>En horizontal, stackOnMobile apila los paneles por debajo de 640 px y oculta el control. La proporción se recupera al ampliar la pantalla.</li><li>minSize y maxSize limitan el primer panel. La aplicación administra la persistencia mediante size y onSizeChange.</li></ul><p>Importa <code>SplitContainer</code> y <code>SplitContainerProps</code> desde <code>@mokanadev/design-system</code>. Admite los atributos nativos de div, incluido ref. No añade semántica de región a los paneles: usa encabezados o regiones con nombre según el contenido.</p></section>
  </article>;
}
