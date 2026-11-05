import {CodeDisclosure} from './CodeComponents';
import {type ReactNode} from 'react';
import {Collapse, CollapseGroup, type CollapseItem} from './Collapse';

const questions:CollapseItem[]=[
  {id:'system',title:'¿Qué es MOK Design System?',content:<p>Es una biblioteca de fundamentos, componentes y patrones para construir productos coherentes con la identidad de MOK.</p>},
  {id:'themes',title:'¿Cómo funcionan los temas?',content:<p>Los componentes usan tokens semánticos compartidos. Puedes alternar entre claro y oscuro sin cambiar su estructura ni sus interacciones.</p>},
];
function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){return <section id={id} className="mk-collapse-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-collapse-preview">{children}</div><CodeDisclosure code={code}/></section>;}

export function CollapsePage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Collapse</h1><p>Encabezados que revelan contenido relacionado. Organiza información opcional sin perder el contexto de la página.</p></header>

    <Example id="default" title="Predeterminado" description="Los paneles comienzan cerrados. Abrir uno cierra el anterior." code={'<CollapseGroup items={questions} />'}><CollapseGroup items={questions}/></Example>
    <Example id="expanded" title="Expandido" description="Define el panel que estará abierto al entrar, cuando su contenido sea útil desde el primer momento." code={'<CollapseGroup items={questions} defaultExpanded={["system"]} />'}><CollapseGroup items={questions} defaultExpanded={['system']}/></Example>
    <Example id="multiple" title="Múltiple" description="Permite abrir varios paneles al mismo tiempo cuando sus contenidos son independientes." code={'<CollapseGroup items={questions} multiple />'}><CollapseGroup items={questions} multiple/></Example>
    <Example id="small" title="Compacto" description="Una versión de menor tamaño para detalles o ajustes dentro de una composición." code={'<Collapse title="Detalles del componente" size="sm">\n  <p>El contenido se mantiene en el DOM al cerrar.</p>\n</Collapse>'}><Collapse title="Detalles del componente" size="sm"><p>El contenido se mantiene en el DOM al cerrar. El panel deja de ser interactivo hasta que vuelvas a abrirlo.</p></Collapse></Example>
    <section className="mk-collapse-guidelines"><h2>Buenas prácticas</h2><ul><li>Usa Collapse para preguntas frecuentes, ajustes avanzados o información opcional.</li><li>Mantén visible el contenido principal de la página.</li><li>Usa apertura única para alternativas relacionadas y múltiple para temas independientes.</li><li>El título explica el tema del panel, no la acción de abrirlo.</li><li>Enter y Espacio abren o cierran el panel; el foco se mantiene en su encabezado.</li></ul></section>
  </article>;
}
