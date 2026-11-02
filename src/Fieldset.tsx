import {useId,type ComponentPropsWithRef,type ReactNode} from 'react';
import {Error as ErrorMessage} from './Error';
import {Icon} from './components';
import './structured-components.css';

export interface FieldsetProps extends Omit<ComponentPropsWithRef<'fieldset'>,'title'> {
  title?:ReactNode;
  description?:ReactNode;
  footer?:ReactNode;
  actions?:ReactNode;
  error?:string;
  warning?:ReactNode;
  disabledWall?:ReactNode;
  tone?:'default'|'error'|'warning';
}
export function Fieldset({title,description,footer,actions,error,warning,disabledWall,tone='default',disabled=false,children,className='',...props}:FieldsetProps){
  const id=useId();const wall=disabledWall!=null;
  return <fieldset {...props} disabled={disabled||wall} className={`mk-fieldset mk-fieldset-${tone}${wall?' mk-fieldset-walled':''} ${className}`} aria-describedby={[props['aria-describedby'],description?`${id}-description`:null,error?`${id}-error`:null].filter(Boolean).join(' ')||undefined}>
    {title!=null&&<legend>{title}</legend>}
    <div className="mk-fieldset-content" inert={wall}>
      {description!=null&&<div id={`${id}-description`} className="mk-fieldset-description">{description}</div>}
      {children&&<div className="mk-fieldset-controls">{children}</div>}
      {error&&<div className="mk-fieldset-error-text"><ErrorMessage id={`${id}-error`} label={false}>{error}</ErrorMessage></div>}
      {warning&&<div className="mk-fieldset-warning-text"><Icon name="warning"/><div>{warning}</div></div>}
    </div>
    {(footer!=null||actions!=null)&&<div className="mk-fieldset-footer" inert={wall}>{footer!=null&&<div>{footer}</div>}{actions!=null&&<div className="mk-fieldset-actions">{actions}</div>}</div>}
    {wall&&<div className="mk-fieldset-wall" role="note">{disabledWall}</div>}
  </fieldset>;
}
