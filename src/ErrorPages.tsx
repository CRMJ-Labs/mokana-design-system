import {CodeDisclosure} from './CodeComponents';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Error} from './Error';
import {ErrorCard} from './ErrorCard';
import {Button} from './components';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-error-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-error-preview">{children}</div><CodeDisclosure code={code}/></section>;
}

function RecoveryDemo(){
  const [state,setState]=useState<'error'|'loading'|'ready'>('error');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const result=useRef<HTMLDivElement>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  useEffect(()=>{if(state==='ready')result.current?.focus();},[state]);
  function retry(){if(timer.current)return;setState('loading');timer.current=setTimeout(()=>{setState('ready');timer.current=null;},800);}
  return <div className="mk-error-recovery" aria-live="polite" aria-busy={state==='loading'}>{state==='ready'?<div ref={result} tabIndex={-1} className="mk-error-recovered"><strong>Proyectos cargados</strong><p>La solicitud de demostración se completó. Ya puedes continuar.</p><Button variant="secondary" onClick={()=>setState('error')}>Reiniciar ejemplo</Button></div>:<ErrorCard title="No se pudieron cargar los proyectos" requestId="req_mok_demo_7f2a" action={<Button variant="secondary" disabled={state==='loading'} loading={state==='loading'} onClick={retry}>{state==='loading'?'Reintentando…':'Volver a intentar'}</Button>}>Revisa tu conexión y vuelve a intentarlo. Los datos existentes se conservan.</ErrorCard>}</div>;
}

export function ErrorPage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Error</h1><p>Mensajes claros que explican qué ocurrió y cómo continuar.</p></header>
    <nav className="mk-error-index" aria-label="Secciones de Error"><a href="#default">Predeterminado</a><a href="#custom-label">Etiqueta personalizada</a><a href="#no-label">Sin etiqueta</a><a href="#sizes">Tamaños</a><a href="#error-property">Propiedad error</a></nav>
    <Example id="default" title="Predeterminado" description="El icono y la etiqueta identifican el mensaje sin depender solo del color." code={'<Error>No se pudo cargar el proyecto. Actualiza la página.</Error>'}><Error>No se pudo cargar el proyecto. Actualiza la página.</Error></Example>
    <Example id="custom-label" title="Etiqueta personalizada" description="Especifica el recurso o la operación que produjo el error." code={'<Error label="Error de conexión:">\n  Revisa tu conexión y vuelve a intentarlo.\n</Error>'}><Error label="Error de conexión:">Revisa tu conexión y vuelve a intentarlo.</Error></Example>
    <Example id="no-label" title="Sin etiqueta" description="Omite la etiqueta cuando el contexto ya comunica el estado de error." code={'<Error label={false}>No se pudo verificar el acceso. Inicia sesión de nuevo.</Error>'}><Error label={false}>No se pudo verificar el acceso. Inicia sesión de nuevo.</Error></Example>
    <Example id="sizes" title="Tamaños" description="Tres tamaños de texto con el icono alineado a la primera línea del mensaje." code={'<Error size="sm">No se pudo cargar el proyecto.</Error>\n<Error size="md">No se pudo cargar el proyecto.</Error>\n<Error size="lg">No se pudo cargar el proyecto.</Error>'}><div className="mk-error-preview-stack"><Error size="sm">No se pudo cargar el proyecto.</Error><Error size="md">No se pudo cargar el proyecto.</Error><Error size="lg">No se pudo cargar el proyecto.</Error></div></Example>
    <Example id="error-property" title="Propiedad error" description="Acepta una cadena o un objeto Error. Solo se muestra su mensaje; children permite sustituirlo por contenido con contexto." code={'<Error error={new globalThis.Error("La solicitud falló. Vuelve a intentarlo.")} />\n<Error error="La solicitud falló.">\n  La solicitud falló. <a href="/components/error-card">Ver opciones de recuperación</a>\n</Error>'}><div className="mk-error-preview-stack"><Error error={new globalThis.Error('La solicitud falló. Vuelve a intentarlo.')}/><Error error="La solicitud falló.">La solicitud falló. <a href="/components/error-card">Ver opciones de recuperación</a></Error></div></Example>
    <section className="mk-error-guidelines"><h2>Uso y accesibilidad</h2><p>Importa Error y ErrorProps desde <code>@mokanadev/design-system</code>. El componente acepta atributos nativos de div, incluido ref. Al importar Error con ese nombre, usa <code>new globalThis.Error()</code> para crear un error nativo.</p><ul><li>Describe el problema y el siguiente paso con palabras concretas.</li><li>Para validación de campos, utiliza la propiedad error del control correspondiente.</li><li>Para errores con recuperación o detalles técnicos, utiliza Error Card.</li><li>Si el mensaje aparece tras una solicitud, colócalo en una región aria-live="polite" ya montada. Los ejemplos estáticos no generan anuncios automáticos.</li><li>Muestra mensajes aptos para el usuario; evita exponer información interna del servidor.</li></ul><a href="https://vercel.com/geist/error" target="_blank" rel="noreferrer">Referencia: Geist Error</a></section>
  </article>;
}

export function ErrorCardPage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Error Card</h1><p>Una tarjeta que explica un estado de error y ofrece un siguiente paso.</p></header>
    <nav className="mk-error-index" aria-label="Secciones de Error Card"><a href="#default">Predeterminado</a><a href="#with-message">Con mensaje</a><a href="#recovery">Recuperación</a></nav>
    <Example id="default" title="Predeterminado" description="Una tarjeta compacta con un icono y un título que identifica el problema." code={'<ErrorCard title="No quedan créditos" />'}><ErrorCard title="No quedan créditos"/></Example>
    <Example id="with-message" title="Con mensaje" description="Añade contexto e instrucciones sin sobrecargar el título." code={'<ErrorCard title="No tienes acceso a este proyecto">\n  Solicita acceso al administrador del equipo para continuar.\n</ErrorCard>'}><ErrorCard title="No tienes acceso a este proyecto">Solicita acceso al administrador del equipo para continuar.</ErrorCard></Example>
    <Example id="recovery" title="Recuperación" description="El reintento simula una solicitud de 800 ms, bloquea clics repetidos y muestra el resultado. El identificador de demostración se puede consultar en los detalles." code={'<div aria-live="polite" aria-busy={loading}>\n  <ErrorCard\n    title="No se pudieron cargar los proyectos"\n    requestId={requestId}\n    action={<Button disabled={loading} loading={loading} onClick={retry}>Volver a intentar</Button>}\n  >\n    Revisa tu conexión y vuelve a intentarlo.\n  </ErrorCard>\n</div>'}><RecoveryDemo/></Example>
    <section className="mk-error-guidelines"><h2>Uso y accesibilidad</h2><p>Importa ErrorCard y ErrorCardProps desde <code>@mokanadev/design-system</code>. title identifica el problema, children aporta el mensaje y action recibe la acción de recuperación. requestId añade detalles plegados para soporte. Acepta atributos nativos de section, incluido ref.</p><ul><li>Usa títulos concretos que nombren el recurso que falló.</li><li>Ofrece reintentos solo para operaciones que puedan repetirse con seguridad.</li><li>Para errores del sistema, incluye un identificador estable de la solicitud real.</li><li>La tarjeta no realiza solicitudes: la aplicación controla la recuperación y sus estados.</li><li>En errores de página completa, gestiona el foco hacia la acción de recuperación. En actualizaciones asíncronas, utiliza una región aria-live="polite".</li></ul><a href="https://vercel.com/geist/error-card" target="_blank" rel="noreferrer">Referencia: Geist Error Card</a></section>
  </article>;
}
