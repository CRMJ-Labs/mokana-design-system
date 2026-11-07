import {Badge} from './components';
import {patternCatalog} from './pattern-catalog';
import './pattern-catalog.css';

export function PatternCatalogPage(){
  return <article className="mk-docs-component-page mk-pattern-catalog"><header><p className="mk-eyebrow">DECISIONES DE PRODUCTO</p><h1>Catálogo de patrones</h1><p>Selecciona una estructura por la tarea que resuelve. Cada patrón define estados, responsive, accesibilidad y responsabilidades de integración.</p></header>
    <div className="mk-pattern-catalog-grid">{patternCatalog.map(pattern=><article key={pattern.id} className="mk-pattern-card"><header><div><span>{pattern.category}</span><h2><a href={pattern.path}>{pattern.name}</a></h2></div><Badge size="sm" subtle tone={pattern.maturity==='stable'?'success':'warning'}>{pattern.maturity==='stable'?'Estable':'Beta'}</Badge></header><p>{pattern.summary}</p><dl><dt>Tarea principal</dt><dd>{pattern.primaryTask}</dd><dt>Estados obligatorios</dt><dd>{pattern.requiredStates.join(' · ')}</dd><dt>Base</dt><dd>{pattern.components.slice(0,5).join(', ')}</dd></dl><a className="mk-pattern-card-link" href={pattern.path}>Abrir patrón <span aria-hidden="true">→</span></a></article>)}</div>
    <section className="mk-pattern-rules"><h2>Cómo elegir</h2><ol><li>Empieza por la tarea principal, no por la apariencia de la referencia.</li><li>Comprueba que los estados obligatorios existan en la fuente de datos real.</li><li>Conserva la anatomía y sustituye únicamente contenido, rutas y reglas de negocio.</li><li>Si ningún patrón encaja, documenta la excepción antes de crear uno nuevo.</li></ol></section>
  </article>;
}
