import {useId,type ComponentPropsWithRef} from 'react';
import {Error as ErrorMessage} from './Error';
import './destructive.css';

export interface DestructiveConfirmationInputProps extends Omit<ComponentPropsWithRef<'input'>,'value'|'children'|'type'|'aria-label'|'aria-labelledby'> {
  verificationPhrase:string;
  verificationLabel?:string;
  value:string;
  error?:string|globalThis.Error;
}

export function DestructiveConfirmationInput({verificationPhrase,verificationLabel='el texto',value,error,id:givenId,className='',...props}:DestructiveConfirmationInputProps){
  const generated=useId();const id=givenId??generated;
  const message=typeof error==='string'?error:error?.message;
  return <div className={`mk-destructive-field ${className}`}>
    <label id={`${id}-label`} htmlFor={id} translate="no" className="notranslate">Para confirmar, escribe {verificationLabel} <strong translate="no" lang="zxx" dir="ltr">«{verificationPhrase}»</strong></label>
    <input {...props} id={id} type="text" value={value} translate="no" lang="zxx" dir="ltr" className="notranslate" aria-labelledby={`${id}-label`} aria-invalid={!!message} aria-describedby={[props['aria-describedby'],message?`${id}-error`:null].filter(Boolean).join(' ')||undefined} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}/>
    <div className="mk-destructive-field-error" aria-live="polite">{message&&<ErrorMessage id={`${id}-error`} label={false} size="sm">{message}</ErrorMessage>}</div>
  </div>;
}
