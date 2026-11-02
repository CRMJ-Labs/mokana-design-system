import {CodeDisclosure} from './CodeComponents';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {LoadMoreButton,type LoadMoreButtonProps} from './LoadMoreButton';

function SinglePageDemo(props:LoadMoreButtonProps){
  const [done,setDone]=useState(false);
  return <LoadMoreButton {...props} disabled={done} onClick={()=>setDone(true)}>{done?'Todos los resultados cargados':props.children}</LoadMoreButton>;
}

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-load-more-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-load-more-preview">{children}</div><CodeDisclosure code={code}/></section>;
}

function ResultsDemo(){
  const [count,setCount]=useState(3);
  const [loading,setLoading]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function load(){
    if(loading||timer.current||count>=9)return;
    setLoading(true);
    timer.current=setTimeout(()=>{setCount(value=>Math.min(value+3,9));setLoading(false);timer.current=null;},800);
  }
  return <><ul className="mk-load-more-results">{Array.from({length:count},(_,index)=><li key={index}><strong>Proyecto {String(index+1).padStart(2,'0')}</strong><span>Listo</span></li>)}</ul><LoadMoreButton loading={loading} disabled={count>=9} onClick={load} aria-controls="load-more-count">{count>=9?'Todos los proyectos cargados':'Cargar más'}</LoadMoreButton><p id="load-more-count" className="mk-load-more-count" role="status">{count} de 9 proyectos</p></>;
}

export function LoadMoreButtonPage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Load More Button</h1><p>Un botón de ancho completo para añadir resultados a una lista sin perder el contexto.</p></header>
    <nav className="mk-load-more-index" aria-label="Secciones de Load More Button"><a href="#default">Predeterminado</a><a href="#loading">Cargando</a><a href="#no-gap">Sin separación</a><a href="#no-border-radius">Sin bordes redondeados</a><a href="#custom-text">Texto personalizado</a></nav>
    <Example id="default" title="Predeterminado" description="Carga tres proyectos por vez. El botón bloquea nuevas solicitudes durante la carga y se deshabilita al llegar al final." code={'<LoadMoreButton loading={loading} disabled={!hasMore} onClick={loadNextPage}>\n  Cargar más\n</LoadMoreButton>'}><ResultsDemo/></Example>
    <Example id="loading" title="Cargando" description="Un indicador acompaña el texto de carga. loadingText permite personalizar el mensaje." code={'<LoadMoreButton loading />\n<LoadMoreButton loading loadingText="Buscando proyectos…" />'}><LoadMoreButton loading/><LoadMoreButton loading loadingText="Buscando proyectos…"/></Example>
    <Example id="no-gap" title="Sin separación" description="Elimina el margen superior para unir la acción a la lista." code={'<LoadMoreButton noGap />'}><ul className="mk-load-more-results"><li><strong>Proyecto MOK</strong><span>Listo</span></li></ul><SinglePageDemo noGap/></Example>
    <Example id="no-border-radius" title="Sin bordes redondeados" description="Usa esquinas rectas cuando el contenedor lo requiera." code={'<LoadMoreButton noBorderRadius />'}><SinglePageDemo noBorderRadius/></Example>
    <Example id="custom-text" title="Texto personalizado" description="Adapta la acción al contenido que se mostrará." code={'<LoadMoreButton>Mostrar más resultados</LoadMoreButton>'}><SinglePageDemo>Mostrar más resultados</SinglePageDemo></Example>
    <section className="mk-load-more-example"><h2>Uso y accesibilidad</h2><p>Importa LoadMoreButton desde <code>@mokanadev/design-system</code>. Acepta los atributos nativos de button, incluido ref. Usa loading durante tu solicitud y disabled cuando no queden resultados. El componente utiliza los tokens de MOK para ambos temas.</p><p>Conserva los resultados anteriores al añadir una página y anuncia el total actualizado con un elemento de estado. Si la solicitud falla, muestra el error y permite volver a intentarlo.</p><a href="https://vercel.com/geist/load-more-button" target="_blank" rel="noreferrer">Referencia: Geist Load More Button</a></section>
  </article>;
}
