import tokens from '../tokens.json';
import type {CSSProperties} from 'react';
import {mokPalette} from './palette';
import './color-foundations.css';

const groups:[string,string,string[]][]=[
  ['accent','Acento',['accent','accent-hover','accent-foreground','accent-soft','accent-soft-hover','accent-soft-foreground']],
  ['default','Neutros',['default','default-hover','default-foreground','default-soft','default-soft-hover','default-soft-foreground']],
  ['success','Éxito',['success','success-hover','success-foreground','success-soft','success-soft-hover','success-soft-foreground']],
  ['warning','Advertencia',['warning','warning-hover','warning-foreground','warning-soft','warning-soft-hover','warning-soft-foreground']],
  ['danger','Peligro',['danger','danger-hover','danger-foreground','danger-soft','danger-soft-hover','danger-soft-foreground']],
  ['foreground','Texto',['foreground','muted','link','segment-foreground','overlay-foreground']],
  ['background','Fondos',['background','background-secondary','background-tertiary','background-inverse']],
  ['surface','Superficies',['surface','surface-foreground','surface-hover','surface-secondary','surface-secondary-foreground','surface-tertiary','surface-tertiary-foreground']],
  ['field','Campos',['field-background','field-hover','field-focus','field-foreground','field-placeholder','field-border','field-border-hover','field-border-focus']],
  ['separator','Separadores y bordes',['separator','separator-secondary','separator-tertiary','border','border-secondary','border-tertiary']],
  ['other','Otros',['focus','backdrop','overlay','segment','scrollbar','scrollbar-thumb','scrollbar-track']],
  ['primitive','Primitivos',['white','black','snow','eclipse']],
  ['shadow','Sombras',['surface-shadow','overlay-shadow','field-shadow']],
];
const semantics=tokens.semantic as Record<string,string[]>;
const primitives=tokens.primitives as Record<string,string>;

export function ColorFoundations(){
  return <div className="mk-container mk-stack mk-color-foundations">
    <header><p className="mk-eyebrow">FUNDAMENTOS / COLORES</p><h1>La paleta de MOK.</h1><p>Colores OKLCH, transparencias y mezclas del tema predeterminado de MOK, en claro y oscuro.</p><a href="#color-accent">Explorar los roles de color</a></header>
    <nav className="mk-color-nav" aria-label="Grupos de colores">{groups.map(([id,title])=><a key={id} href={`#color-${id}`}>{title}</a>)}</nav>
    {groups.map(([id,title,names])=><section className="mk-section" id={`color-${id}`} key={id}><h2>{title}</h2><div className="mk-color-comparison">{(['light','dark'] as const).map((mode,index)=><div className="mk-color-mode" data-theme={mode} key={mode} style={Object.fromEntries(Object.entries(mokPalette[mode]).map(([name,value])=>[`--${name}`,value])) as CSSProperties}><h3>{mode==='light'?'Claro':'Oscuro'}</h3><div className="mk-color-list">{names.map(name=><div className="mk-color-row" data-color-token={name} key={name}><div aria-hidden="true" className={`mk-color-preview${id==='shadow'?' is-shadow':''}`} style={id==='shadow'?{boxShadow:`var(--${name})`,background:'var(--surface)'}:{background:`var(--${name})`}}/><div><strong>--{name}</strong><code>{primitives[semantics[name][index]]}</code></div></div>)}</div></div>)}</div></section>)}
    <section className="mk-section"><h2>Uso en MOK</h2><p>Usa los roles originales, como <code>--accent</code>, <code>--danger-soft</code> y <code>--field-background</code>. Los componentes de MOK también exponen alias semánticos adaptados para lectura: <code>--brand-primary</code> conserva la marca, mientras <code>--secondary</code>, <code>--accent-text</code> y los roles de estado garantizan contraste sobre sus fondos previstos.</p><p>MOK no define un estado informativo separado: el rol info de MOK usa el acento oficial. El fondo que oscurece la página detrás de un diálogo se llama <code>--backdrop</code>; <code>--overlay</code> es la superficie de los elementos flotantes.</p><p>Para conservar la paleta exacta usa los estilos predeterminados o <code>mokPalette</code>. <code>createPalette</code> genera una paleta personalizada y ajusta su contraste.</p><p className="mk-subtle">Referencia fijada al commit <code>{tokens.metadata.colors.commit.slice(0,12)}</code>. Consulta la atribución y la licencia Apache-2.0 en THIRD_PARTY_NOTICES.md.</p></section>
  </div>;
}
