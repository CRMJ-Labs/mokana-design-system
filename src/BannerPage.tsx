import {CodeDisclosure} from './CodeComponents';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Button} from './components';
import {Banner} from './Banner';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-banner-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-banner-preview">{children}</div><CodeDisclosure code={code}/></section>;
}
function ActionExample(){
  const [message,setMessage]=useState('Todavía no has guardado la preferencia.');
  return <><Banner eyebrow="Tema" action={{label:'Probar tema oscuro',onClick:()=>setMessage('Demostración: el tema oscuro se aplicaría ahora.')}}>El tema oscuro ya está disponible en la documentación</Banner><p role="status">{message}</p></>;
}
function DismissExample(){
  const [open,setOpen]=useState(true);
  const zone=useRef<HTMLDivElement>(null);
  const previous=useRef(open);
  useEffect(()=>{
    if(previous.current===open)return;
    previous.current=open;
    zone.current?.querySelector<HTMLElement>(open?'.mk-banner-close':'button')?.focus();
  },[open]);
  return <div ref={zone} style={{width:'100%'}}>{open?<Banner eyebrow="Versión 0.1.0" onClose={()=>setOpen(false)}>Revisa los cambios antes de actualizar tu producto</Banner>:<Button variant="secondary" onClick={()=>setOpen(true)}>Mostrar de nuevo</Button>}</div>;
}

export function BannerPage(){
  const sections=[['default','Predeterminado'],['mark','Con isotipo'],['tones','Tonos'],['action','Acción'],['dismiss','Descartable'],['flush','Pegado al borde'],['long','Texto largo']];
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Banner</h1><p>Un mensaje destacado que ocupa todo el ancho de su contenedor para anunciar información importante.</p></header>

    <Example id="default" title="Predeterminado" description="Un panel Ink con eyebrow y acción lima, igual en claro y en oscuro. El mensaje se alinea al inicio y la acción al final." code={'<Banner eyebrow="Novedad" action={{ label: "Leer más", href: "/components/separator" }}>\n  Nuevos componentes ya disponibles\n</Banner>'}><Banner eyebrow="Novedad" action={{label:'Leer más',href:'/components/separator'}}>Nuevos componentes ya disponibles</Banner></Example>
    <Example id="mark" title="Con isotipo" description="mark añade la hoja de MOK al inicio. Resérvalo para anuncios de la marca o del propio sistema." code={'<Banner mark eyebrow="MOK Design System" action={{ label: "Ver componentes", href: "/components/button" }}>\n  Una base compartida para diseñar y construir\n</Banner>'}><Banner mark eyebrow="MOK Design System" action={{label:'Ver componentes',href:'/components/button'}}>Una base compartida para diseñar y construir</Banner></Example>
    <Example id="tones" title="Tonos" description="ink es el tono de marca por defecto. brand usa el violeta profundo, accent el lima y surface sigue el tema de la página, para anuncios más discretos. Los tonos expresan marca, no éxito ni error." code={'<Banner tone="ink">…</Banner>\n<Banner tone="brand">…</Banner>\n<Banner tone="accent">…</Banner>\n<Banner tone="surface">…</Banner>'}>{([['ink','Ink'],['brand','Brand'],['accent','Accent'],['surface','Surface']] as const).map(([tone,name])=><Banner key={tone} tone={tone} eyebrow={name} aria-label={`Anuncio ${name}`} action={{label:'Leer más',href:'/components/separator'}}>Nuevos componentes ya disponibles</Banner>)}</Example>
    <Example id="action" title="Acción" description="Con href la acción es un enlace y lleva flecha. Sin href es un botón que ejecuta onClick. Usa una sola acción por anuncio." code={'<Banner eyebrow="Tema" action={{ label: "Probar tema oscuro", onClick: enableDarkTheme }}>\n  El tema oscuro ya está disponible en la documentación\n</Banner>'}><ActionExample/></Example>
    <Example id="dismiss" title="Descartable" description="onClose muestra el botón de cerrar. La aplicación retira el anuncio, recuerda la decisión si hace falta y mueve el foco a un lugar útil, como hace este ejemplo." code={'const [open, setOpen] = useState(true);\n{open && <Banner onClose={() => setOpen(false)}>Revisa los cambios</Banner>}'}><DismissExample/></Example>
    <Example id="flush" title="Pegado al borde" description="flush quita el radio y los bordes laterales para colocar el anuncio arriba de una página o de un panel." code={'<Banner flush eyebrow="Mantenimiento" action={{ label: "Ver detalles", href: "/introduction" }}>\n  El sitio se actualizará esta noche\n</Banner>'}><div className="mk-banner-frame"><Banner flush eyebrow="Mantenimiento" action={{label:'Ver detalles',href:'/introduction'}}>El sitio se actualizará esta noche</Banner><div>Contenido de la página</div></div></Example>
    <Example id="long" title="Texto largo" description="El mensaje ajusta sus líneas y la acción pasa a la línea siguiente cuando no hay espacio. Procura que el anuncio se entienda en una o dos líneas." code={'<Banner eyebrow="Migración" onClose={close} action={{ label: "Leer la guía", href: "/introduction" }}>\n  Los tokens de color cambian de nombre en la próxima versión…\n</Banner>'}><Banner eyebrow="Migración" onClose={()=>undefined} action={{label:'Leer la guía',href:'/introduction'}}>Los tokens de color cambian de nombre en la próxima versión. Actualiza las referencias de tu producto antes de instalarla para conservar los temas claro y oscuro.</Banner></Example>
    <section className="mk-banner-guidelines"><h2>Uso y accesibilidad</h2><ul><li>Usa Banner para anuncios que afectan a toda una página o producto. Usa Alert para estados de una tarea y Toast para respuestas breves a una acción.</li><li>Se renderiza como <code>aside</code> con el nombre «Anuncio». Cambia aria-label si hay varios en la misma página. No usa <code>role="banner"</code>, que identifica la cabecera del sitio.</li><li>No se anuncia solo a los lectores de pantalla. Si aparece después de cargar la página y es urgente, usa Alert.</li><li>La acción y el botón de cerrar se recorren con Tab, y Enter o Espacio los activan. closeLabel cambia el nombre del botón de cerrar.</li><li>Evita apilar varios anuncios: el tono de marca pierde fuerza cuando se repite.</li></ul><p>Banner acepta los atributos nativos de aside, incluido ref. Importa el componente desde <code>@mokanadev/design-system</code>.</p><a href="https://vercel.com/geist/banner" target="_blank" rel="noreferrer">Referencia: Geist Banner</a></section>
  </article>;
}
