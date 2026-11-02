import {Icon} from './Icon';
import {useId,type ComponentPropsWithRef,type ReactNode} from 'react';
import './error.css';

export interface ErrorCardProps extends Omit<ComponentPropsWithRef<'section'>,'title'> {
  title:ReactNode;
  action?:ReactNode;
  requestId?:string;
}

export function ErrorCard({title,children,action,requestId,className='',...props}:ErrorCardProps){
  const titleId=useId();
  return <section aria-labelledby={titleId} {...props} className={`mk-error-card${className?` ${className}`:''}`}>
    <div className="mk-error-card-heading"><Icon name="warning" size={20}/><h3 id={titleId}>{title}</h3></div>
    {children!=null&&<div className="mk-error-card-message">{children}</div>}
    {requestId&&<details className="mk-error-card-details"><summary>Detalles del error</summary><p>Identificador de solicitud</p><code>{requestId}</code></details>}
    {action&&<div className="mk-error-card-action">{action}</div>}
  </section>;
}
