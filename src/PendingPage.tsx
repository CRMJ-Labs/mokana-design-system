import {CodeDisclosure} from './CodeComponents';
import type {ReactNode} from 'react';
import './status-components.css';

export function ComponentPage({title,intro,sections,reference,guidelines,children,exportName}:{title:string;intro:string;sections:string[][];reference:string;guidelines:ReactNode;children:ReactNode;exportName?:string}){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>{title}</h1><p>{intro}</p></header>
    <nav className="mk-pending-index" aria-label={`Secciones de ${title}`}>{sections.map(([id,name])=><a href={`#${id}`} key={id}>{name}</a>)}</nav>
    {children}
    <section className="mk-pending-guidelines"><h2>Uso y accesibilidad</h2>{guidelines}<p>Importa {exportName??({'Keyboard Input':'Kbd','JSON View':'JsonView'} as Record<string,string>)[title]??title.replace(/\s/g,'')} desde <code>@mokanadev/design-system</code>.</p><a href={reference} target="_blank" rel="noreferrer">Referencia: Geist {title}</a></section>
  </article>;
}
export function Example({id,title,description,code,layout,children}:{id:string;title:string;description:string;code:string;layout?:'stack'|'flush';children:ReactNode}){
  return <section id={id} className="mk-pending-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className={`mk-pending-preview${layout?` is-${layout}`:''}`}>{children}</div><CodeDisclosure code={code}/></section>;
}
