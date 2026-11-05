import {CodeDisclosure} from './CodeComponents';
import {useState, type ReactNode} from 'react';
import {Avatar, AvatarGroup, type AvatarProps} from './Avatar';
import {Icon} from './components';
import './avatar.css';

const members:AvatarProps[]=[{name:'Ana Torres'},{name:'Carlos Ruiz'},{name:'Laura Gómez'},{name:'Milton Escorcia'},{name:'Sofía Díaz'},{name:'Daniel Pérez'}];

function Example({id,title,description,code,children}:{id:string;title:string;description?:string;code:string;children:ReactNode}){
  return <section className="mk-avatar-example" id={id}>
    <h2><a href={`#${id}`}>{title}</a></h2>
    {description&&<p>{description}</p>}
    <div className="mk-avatar-preview">{children}</div>
    <CodeDisclosure code={code}/>
  </section>;
}

export function AvatarPage(){
  const [reverse,setReverse]=useState(false);
  const [overlap,setOverlap]=useState(12);
  return <article className="mk-docs-component-page mk-avatar-page">
    <header><p className="mk-eyebrow">COMPONENTE</p><h1>Avatar</h1><p>Representa a una persona o un equipo. Agrupa avatares para mostrar a quienes participan en un proyecto.</p></header>

    <Example id="group" title="Grupo" description="Muestra los miembros de un equipo y resume los restantes con un contador." code={'<AvatarGroup members={members} max={4} />'}><AvatarGroup members={members}/></Example>
    <Example id="stacking" title="Orden de apilado" description="La primera persona aparece encima por defecto. Invierte el apilado sin cambiar el orden de los miembros." code={'<AvatarGroup members={members} reverse={reverse} />'}>
      <AvatarGroup members={members} reverse={reverse}/><button type="button" className="mk-button mk-button-secondary" aria-pressed={reverse} onClick={()=>setReverse(!reverse)}>{reverse?'Último encima':'Primero encima'}</button>
    </Example>
    <Example id="overlap" title="Solapamiento automático" description="El espacio se adapta al tamaño de los avatares para mantener la proporción del grupo." code={'<AvatarGroup members={members} size={24} />\n<AvatarGroup members={members} size={36} />\n<AvatarGroup members={members} size={56} />'}>{[24,36,56].map(size=><AvatarGroup key={size} members={members} size={size}/>)}</Example>
    <Example id="fixed-overlap" title="Solapamiento fijo" description="Ajusta el solapamiento en píxeles. Un valor mayor crea un grupo más compacto." code={`<AvatarGroup members={members} size={48} overlap={${overlap}} />`}>
      <AvatarGroup members={members} size={48} overlap={overlap}/><label className="mk-avatar-slider">Solapamiento: {overlap} px<input type="range" min="0" max="32" value={overlap} onChange={event=>setOverlap(Number(event.target.value))}/></label>
    </Example>
    <Example id="size" title="Tamaño" description="Usa tamaños pequeños junto a texto y tamaños amplios en perfiles o cabeceras." code={'<Avatar name="Ana Torres" size="sm" />\n<Avatar name="Ana Torres" size="md" />\n<Avatar name="Ana Torres" size="lg" />\n<Avatar name="Ana Torres" size={64} />'}>{[20,24,28,36,48,64].map(size=><div className="mk-avatar-size" key={size}><Avatar name="Ana Torres" size={size}/><span>{size} px</span></div>)}</Example>
    <Example id="git" title="Git" description="Una identidad geométrica estable, generada a partir del nombre de cada usuario." code={'<Avatar name="miltonesc" git />'}>{['miltonesc','ana-torres','carlos-ruiz','mok-design-system'].map(name=><Avatar key={name} name={name} size={48} git/>)}</Example>
    <Example id="icon" title="Icono personalizado" description="Identifica una organización o una cuenta con un icono de MOK." code={'<Avatar name="Equipo MOK" icon={<Icon name="plus" />} />'}><Avatar name="Equipo MOK" size={48} icon={<Icon name="plus"/>}/><Avatar name="MOK Design System" size={48} icon={<span className="mk-mark"/>}/></Example>
    <Example id="letter" title="Iniciales" description="Usa una o dos letras del nombre cuando no hay imagen. Si una imagen falla, el avatar muestra las iniciales automáticamente." code={'<Avatar name="Ana Torres" />\n<Avatar name="Milton Escorcia" letter="ME" />'}><Avatar name="Ana Torres" size={48}/><Avatar name="Milton Escorcia" letter="ME" size={48}/><Avatar name="Laura" size={48}/></Example>
    <Example id="placeholder" title="Estado de carga" description="Reserva este estado para una imagen o un perfil que todavía está cargando." code={'<Avatar name="Ana Torres" placeholder />'}><Avatar name="Ana Torres" size={28} placeholder/><Avatar name="Carlos Ruiz" size={36} placeholder/><Avatar name="Laura Gómez" size={48} placeholder/></Example>
    <Example id="status" title="Estado de conexión" description="Los indicadores de disponibilidad conservan el lenguaje de estados de MOK." code={'<Avatar name="Ana Torres" status="online" />'}><Avatar name="Ana Torres" status="online" size={48}/><Avatar name="Carlos Ruiz" status="away" size={48}/><Avatar name="Laura Gómez" status="offline" size={48}/></Example>
    <section className="mk-avatar-guidelines"><h2>Buenas prácticas</h2><ul><li>Usa Avatar para una persona y AvatarGroup para un equipo.</li><li>Proporciona siempre el nombre para identificar el avatar de forma accesible.</li><li>Prioriza una imagen de perfil y usa iniciales como alternativa.</li><li>Mantén el mismo tamaño en contextos equivalentes.</li></ul></section>
  </article>;
}
