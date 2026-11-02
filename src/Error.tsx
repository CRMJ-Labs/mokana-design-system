import {Icon} from './Icon';
import type {ComponentPropsWithRef,ReactNode} from 'react';
import './error.css';

export interface ErrorProps extends ComponentPropsWithRef<'div'> {
  label?:ReactNode|false;
  size?:'sm'|'md'|'lg';
  error?:string|globalThis.Error;
}

/** Only the public message is displayed; stack traces are never rendered. */
export function Error({label='Error:',size='md',error,children,className='',...props}:ErrorProps){
  const message=children??(typeof error==='string'?error:error?.message);
  return <div {...props} className={`mk-error mk-error-${size}${className?` ${className}`:''}`}>
    <Icon name="error" className="mk-error-icon"/>
    <div className="mk-error-content">{label!==false&&label!=null&&<strong className="mk-error-label">{label}</strong>}{message}</div>
  </div>;
}
