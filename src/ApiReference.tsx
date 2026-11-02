import reference from './api-reference.generated.json';
import './integration-documentation.css';

const aliases:Record<string,string[]>={progress:['ProgressBar'],'filter-params':['FilterParamsBar'],'keyboard-input':['Kbd'],'json-view':['JsonView'],avatar:['Avatar','AvatarGroup'],table:['Table','DataTable'],button:['Button','ButtonLink','CustomButton'],collapse:['Collapse','CollapseGroup'],'theme-switcher':['ThemeSwitcher','ThemeProvider'],toast:['Toast','ToastProvider']};
export const apiNames=reference.map(item=>item.name);

export function ApiReference({slug,names}:{slug?:string;names?:string[]}){
  const requested=names??(slug?(aliases[slug]??[slug.split('-').map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join('')]):[]);
  const entries=reference.filter(entry=>requested.includes(entry.name));
  return <section className="mk-api-reference" aria-label="Referencia de API">
    <h2>API y valores predeterminados</h2>
    <p>Propiedades propias extraídas del código TypeScript. Los atributos HTML heredados se consultan con el autocompletado del tipo exportado; no se repiten en estas tablas. «—» indica que no hay un valor predeterminado declarado al desestructurar las propiedades.</p>
    {entries.length?entries.map(entry=><section className="mk-api-component" key={entry.name} id={`api-${entry.name}`}>
      <h3>{entry.name}</h3><p>Tipo de propiedades: <code>{entry.signature||'sin propiedades'}</code>.</p>
      {entry.props.length?<div className="mk-api-scroll" tabIndex={0} role="region" aria-label={`Propiedades de ${entry.name}`}><table><caption>Propiedades de {entry.name}</caption><thead><tr><th scope="col">Propiedad</th><th scope="col">Tipo</th><th scope="col">Obligatoria</th><th scope="col">Predeterminado</th></tr></thead><tbody>{entry.props.map(prop=><tr key={prop.name}><th scope="row"><code>{prop.name}</code></th><td><code>{prop.type}</code></td><td>{prop.required?'Sí':('conditional' in prop&&prop.conditional)?'Según variante':'No'}</td><td><code>{prop.default??'—'}</code></td></tr>)}</tbody></table></div>:<p>Sin propiedades propias documentadas.</p>}
    </section>):<p>Consulta los tipos exportados del componente para su contrato de integración.</p>}
    <p><a href="/integration">Guía de integración y convenciones de API</a></p>
  </section>;
}
