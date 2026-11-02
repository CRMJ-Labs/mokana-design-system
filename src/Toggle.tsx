import {useId,type ComponentPropsWithRef} from 'react';
export interface ToggleProps extends Omit<ComponentPropsWithRef<'button'>,'onChange'|'children'> {label:string;checked:boolean;onChange?:(checked:boolean)=>void;onCheckedChange?:(checked:boolean)=>void;description?:string;rootProps?:ComponentPropsWithRef<'div'>}
export function Toggle({label,checked,onChange,onCheckedChange,description,rootProps={},id:givenId,...props}:ToggleProps){
  const generated=useId();const id=givenId??generated;
  return <div {...rootProps} className={`mk-toggle-field ${rootProps.className??''}`}><div><label htmlFor={id}>{label}</label>{description&&<p id={`${id}-help`}>{description}</p>}</div><button {...props} id={id} type="button" className={`mk-toggle ${props.className??''}`} role="switch" aria-checked={checked} aria-describedby={[props['aria-describedby'],description?`${id}-help`:null].filter(Boolean).join(' ')||undefined} onClick={event=>{props.onClick?.(event);if(!event.defaultPrevented){onChange?.(!checked);onCheckedChange?.(!checked);}}}><span/></button></div>;
}
export {Toggle as Switch};
