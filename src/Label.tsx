import type {ComponentPropsWithRef} from 'react';
import './label.css';

export interface LabelProps extends ComponentPropsWithRef<'label'> {
  bypassCasing?: boolean;
}

export function Label({bypassCasing=false,className='',...props}:LabelProps){
  return <label {...props} className={`mk-label${bypassCasing?' mk-label-original':''}${className?` ${className}`:''}`}/>;
}
