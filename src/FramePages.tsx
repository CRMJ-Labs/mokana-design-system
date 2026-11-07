import {useState} from 'react';
import {Icon} from './components';
import {Slider} from './ControlComponents';
import {Book,Browser,Phone,Video} from './FrameComponents';
import {ComponentPage,Example} from './PendingPage';

/** A branded sample image, drawn inline so the demos work without external files. */
function Art({label,tall=false}:{label:string;tall?:boolean}){
  const [width,height]=tall?[360,780]:[1200,750];
  const scale=tall?.6:.8;const cx=width/2;const cy=height*(tall?.42:.46);
  return <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className="mk-frame-art">
    <rect width={width} height={height} fill="var(--eclipse)"/>
    <image href="/brand/isotipo.svg" x={cx-120*scale} y={cy-120*scale} width={240*scale} height={240*scale} style={{filter:'invert(1)'}}/>
    <text x={cx} y={height*(tall?.62:.76)} fill="var(--snow)" fontFamily="Inter Variable, sans-serif" fontSize={tall?30:44} fontWeight="600" textAnchor="middle">MOK Design System</text>
    <text x={cx} y={height*(tall?.67:.83)} fill="var(--inverse-secondary)" fontFamily="Inter Variable, sans-serif" fontSize={tall?17:22} textAnchor="middle">Ideas que toman forma</text>
  </svg>;
}
const title='Guía de la identidad de MOK';

export function BookPage(){
  const [width,setWidth]=useState(240);
  return <ComponentPage title="Book" intro="Una portada de libro para guías, documentación y lanzamientos." reference="https://vercel.com/geist/book" sections={[['default','Predeterminado'],['variants','Variantes'],['color','Color'],['icon','Icono'],['illustration','Ilustración'],['responsive','Adaptable'],['width','Ancho'],['textured','Con textura']]} guidelines={<ul><li>Úsalo en páginas de marketing y portadas de documentación. En interfaces de producto usa Card: Book es demasiado decorativo para repetirlo.</li><li>Usa tokens en color, para que siga el tema.</li><li>Comprueba el contraste entre color y textColor.</li><li>El título es texto real. El icono y la ilustración son decorativos.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Una portada Ink con la hoja de MOK." code={`<Book title="${title}" />`}><Book title={title}/></Example>
    <Example id="variants" title="Variantes" description="stripe añade una banda con el icono. simple deja que el título lleve el diseño." code={`<Book variant="simple" title="${title}" />`}><Book title={title}/><Book variant="simple" title={title}/></Example>
    <Example id="color" title="Color" description="color y textColor cambian la portada, con los colores de la marca." code={'<Book color="var(--lime)" textColor="var(--action-primary-text)" title="…" />'}><Book color="var(--lime)" textColor="var(--action-primary-text)" title="Fundamentos de color"/><Book color="var(--accent-light)" title="Diseño e ingeniería en MOK"/><Book color="var(--surface)" textColor="var(--foreground)" title={title}/></Example>
    <Example id="icon" title="Icono" description="icon sustituye a la hoja." code={'<Book icon={<Icon name="info" />} title="…" />'}><Book icon={<Icon name="info"/>} title="Guía de la plataforma"/><Book icon={<Icon name="search"/>} color="var(--accent-light)" title="Documentación"/><Book icon={<Icon name="check"/>} color="var(--lime)" textColor="var(--action-primary-text)" title="Lo esencial de React"/></Example>
    <Example id="illustration" title="Ilustración" description="illustration ocupa la banda de la portada." code={'<Book illustration={<svg … />} title="…" />'}><Book title={title} illustration={<svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="6" fill="currentColor"/></svg>}/><Book variant="simple" color="var(--lime)" textColor="var(--action-primary-text)" title={title} illustration={<svg viewBox="0 0 100 100" width="80" height="80" fill="currentColor"><rect x="10" y="10" width="36" height="36" rx="8"/><rect x="54" y="54" width="36" height="36" rx="18"/></svg>}/></Example>
    <Example id="responsive" title="Adaptable" description="responsive ocupa todo el ancho del contenedor." code={'<div style={{ width: 280 }}><Book responsive title="…" /></div>'}><div style={{width:'min(280px,100%)'}}><Book responsive title={title}/></div></Example>
    <Example id="width" title="Ancho" description="width define el ancho en píxeles, y la portada conserva su proporción." code={'<Book width={240} title="…" />'} layout="stack"><Slider label="Ancho" min={140} max={320} step={20} value={width} onChange={setWidth} unit=" px"/><Book width={width} title={title}/></Example>
    <Example id="textured" title="Con textura" description="textured añade una trama sutil a la portada." code={'<Book textured title="…" />'}><Book textured title="Diseño e ingeniería en MOK"/><Book textured variant="simple" color="var(--accent-light)" title="Diseño e ingeniería en MOK"/><Book textured color="var(--lime)" textColor="var(--action-primary-text)" title="Diseño e ingeniería en MOK"/></Example>
  </ComponentPage>;
}

export function BrowserPage(){
  return <ComponentPage title="Browser" intro="Muestra capturas o videos dentro de un marco de navegador." reference="https://vercel.com/geist/browser" sections={[['default','Predeterminado'],['ink','Sobre Ink'],['long-url','URL larga']]} guidelines={<ul><li>Úsalo para capturas y grabaciones en páginas de marketing y documentación. No pongas una interfaz real en vivo: el marco sugiere una captura.</li><li>El marco es decorativo y está oculto para lectores de pantalla, sin controles enfocables.</li><li>Describe la imagen interior con texto alternativo, sin mencionar el navegador.</li><li>aspectRatio evita que el marco cambie de tamaño mientras carga la imagen.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Sigue el tema de la página." code={'<Browser url="mokana.dev"><img src="captura.png" alt="…" /></Browser>'} layout="stack"><Browser url="mokana.dev"><Art label="Portada de MOK Design System"/></Browser></Example>
    <Example id="ink" title="Sobre Ink" description="tone=&quot;ink&quot; usa el marco oscuro en ambos temas." code={'<Browser tone="ink" url="mokana.dev">…</Browser>'} layout="stack"><Browser tone="ink" url="mokana.dev"><Art label="Portada de MOK en marco oscuro"/></Browser></Example>
    <Example id="long-url" title="URL larga" description="La dirección usa MiddleTruncate para conservar el dominio y el final de la ruta." code={'<Browser url="…" caption="…">…</Browser>'} layout="stack"><div style={{width:'min(420px,100%)'}}><Browser url="mokana.dev/documentacion/componentes/fundamentos/color/roles-semanticos" caption="La página de roles semánticos"><Art label="Página de roles semánticos de MOK"/></Browser></div></Example>
  </ComponentPage>;
}

export function PhonePage(){
  return <ComponentPage title="Phone" intro="Muestra capturas o videos dentro de un marco de teléfono." reference="https://vercel.com/geist/phone" sections={[['default','Predeterminado'],['ink','Sobre Ink'],['width','Ancho']]} guidelines={<ul><li>Úsalo para capturas móviles. Combínalo con Browser para mostrar la misma pantalla en ambos tamaños.</li><li>El marco es decorativo. Describe la imagen interior con texto alternativo.</li><li>No añadas más sombras al contenedor: el marco ya tiene su elevación.</li><li>En videos, respeta prefers-reduced-motion.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Sigue el tema de la página, con una proporción de 19.5:9." code={'<Phone url="mokana.dev"><img src="captura.png" alt="…" /></Phone>'}><Phone url="mokana.dev"><Art tall label="Portada de MOK en un teléfono"/></Phone></Example>
    <Example id="ink" title="Sobre Ink" description="tone=&quot;ink&quot; usa el marco oscuro en ambos temas." code={'<Phone tone="ink">…</Phone>'}><Phone tone="ink"><Art tall label="Portada de MOK en un teléfono oscuro"/></Phone></Example>
    <Example id="width" title="Ancho" description="width ajusta el marco." code={'<Phone width={200}>…</Phone>'}><Phone width={200} caption="200 px"><Art tall label="Portada de MOK, 200 píxeles"/></Phone><Phone width={160} caption="160 px"><Art tall label="Portada de MOK, 160 píxeles"/></Phone></Example>
  </ComponentPage>;
}

const clip='/demo/mok-loop.webm';
export function VideoPage(){
  return <ComponentPage title="Video" intro="Inserta un video con controles de reproducción y carga diferida." reference="https://vercel.com/geist/video" sections={[['default','Predeterminado'],['no-loop','Sin bucle'],['no-controls','Sin controles']]} guidelines={<ul><li>title describe el video para los lectores de pantalla.</li><li>Si hay habla, añade subtítulos como <code>&lt;track&gt;</code> dentro del componente.</li><li>lazy carga el archivo solo cuando se acerca a la pantalla.</li><li>autoPlay silencia el video y no se activa con movimiento reducido.</li><li>No uses controls={'{false}'} si dura más de unos segundos: la persona debe poder pausarlo.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Con controles, en bucle y carga diferida." code={`<Video src="${clip}" title="Animación de la marca MOK" />`} layout="stack"><Video src={clip} title="Animación de la marca MOK"/></Example>
    <Example id="no-loop" title="Sin bucle" description="loop={false} se detiene al terminar." code={`<Video loop={false} src="${clip}" title="…" />`} layout="stack"><Video loop={false} src={clip} title="Animación de la marca MOK, sin bucle"/></Example>
    <Example id="no-controls" title="Sin controles" description="Para clips breves y decorativos que se reproducen solos." code={`<Video controls={false} autoPlay src="${clip}" title="…" />`} layout="stack"><Video controls={false} autoPlay src={clip} title="Animación decorativa de la marca MOK"/></Example>
  </ComponentPage>;
}
