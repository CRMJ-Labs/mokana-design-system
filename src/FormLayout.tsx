import {useEffect,useRef,type ComponentPropsWithRef,type ReactNode} from 'react';
import {Icon} from './Icon';
import './form-layout.css';

export interface FormLayoutProps extends ComponentPropsWithRef<'form'> {
  /** Stable actions region rendered after the form content. */
  actions?:ReactNode;
  /** Persistent feedback that belongs to the complete form. */
  feedback?:ReactNode;
}

/** Complete form skeleton. Field grouping belongs to Fieldset. */
export function FormLayout({actions,feedback,children,className='',...props}:FormLayoutProps){
  return <form {...props} className={`mk-form-layout${className?` ${className}`:''}`} data-slot="form-root">
    {feedback&&<div className="mk-form-feedback" data-slot="form-feedback">{feedback}</div>}
    <div className="mk-form-content" data-slot="form-content">{children}</div>
    {actions&&<div className="mk-form-actions" data-slot="form-actions">{actions}</div>}
  </form>;
}

export interface FormGridProps extends ComponentPropsWithRef<'div'> {
  columns?:1|2|3;
}

/** Responsive field grid; every control returns to one column on narrow containers. */
export function FormGrid({columns=2,className='',...props}:FormGridProps){
  return <div {...props} className={`mk-form-grid mk-form-grid-${columns}${className?` ${className}`:''}`} data-slot="form-grid"/>;
}

export interface FormErrorItem {id:string;label:string;message:string}
export interface FormErrorSummaryProps extends Omit<ComponentPropsWithRef<'div'>,'title'> {
  title?:ReactNode;
  errors:FormErrorItem[];
  /** Moves focus to the summary whenever a non-empty error set changes. */
  focusOnChange?:boolean;
}

/** Accessible form-level error index. Field errors still remain beside each control. */
export function FormErrorSummary({title='Revisa la información',errors,focusOnChange=true,className='',...props}:FormErrorSummaryProps){
  const summary=useRef<HTMLDivElement>(null);
  const signature=errors.map(error=>`${error.id}:${error.message}`).join('|');
  useEffect(()=>{if(focusOnChange&&errors.length)summary.current?.focus({preventScroll:true})},[focusOnChange,signature,errors.length]);
  if(!errors.length)return null;
  return <div {...props} ref={summary} className={`mk-form-error-summary${className?` ${className}`:''}`} role="alert" tabIndex={-1} data-slot="form-error-summary">
    <Icon name="warning" size={20}/><div><strong>{title}</strong><ul>{errors.map(error=><li key={error.id}><a href={`#${error.id}`}>{error.label}: {error.message}</a></li>)}</ul></div>
  </div>;
}

export interface FormReadOnlyProps extends ComponentPropsWithRef<'div'> {
  label:ReactNode;
  value:ReactNode;
}

/** Read-only value that preserves the visual label/value relationship. */
export function FormReadOnly({label,value,className='',...props}:FormReadOnlyProps){
  return <div {...props} className={`mk-form-readonly${className?` ${className}`:''}`} data-slot="form-readonly"><span>{label}</span><strong>{value}</strong></div>;
}
