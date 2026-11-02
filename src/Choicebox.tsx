import {useId, useState, type ReactNode} from 'react';
import {Icon, type IconName} from './components';
import './choicebox.css';

export interface ChoiceboxOption {
  value:string;
  label:string;
  description?:string;
  icon?:IconName;
  disabled?:boolean;
  disabledReason?:string;
  content?:ReactNode;
}

type ChoiceboxBase={label:string;options:ChoiceboxOption[];name?:string;disabled?:boolean;disabledReason?:string;};
export type ChoiceboxProps=ChoiceboxBase&(
  {multiple?:false;value?:string;defaultValue?:string;onChange?:(value:string)=>void;}|
  {multiple:true;value?:string[];defaultValue?:string[];onChange?:(value:string[])=>void;}
);

export function Choicebox(props:ChoiceboxProps){
  const id=useId();
  const name=props.name??id;
  const [internal,setInternal]=useState<string[]>(()=>Array.isArray(props.defaultValue)?props.defaultValue:props.defaultValue?[props.defaultValue]:[]);
  const selected=props.value===undefined?internal:Array.isArray(props.value)?props.value:[props.value];
  function change(value:string,checked:boolean){
    if(props.multiple){
      const next=checked?[...selected.filter(item=>item!==value),value]:selected.filter(item=>item!==value);
      if(props.value===undefined)setInternal(next);
      props.onChange?.(next);
    }else{
      if(props.value===undefined)setInternal([value]);
      props.onChange?.(value);
    }
  }
  return <fieldset className="mk-choicebox" disabled={props.disabled}>
    <legend>{props.label}</legend>
    {props.disabled&&props.disabledReason&&<p className="mk-choicebox-reason">{props.disabledReason}</p>}
    <div className="mk-choicebox-options">{props.options.map((option,index)=>{
      const checked=selected.includes(option.value);
      const optionId=`${id}-${index}`;
      const reason=props.disabled?props.disabledReason:option.disabledReason;
      return <div className="mk-choicebox-option" key={option.value}>
        <label className="mk-choicebox-tile" htmlFor={optionId} title={(props.disabled||option.disabled)?reason:undefined}>
          <input id={optionId} name={name} type={props.multiple?'checkbox':'radio'} value={option.value} checked={checked} disabled={option.disabled} aria-labelledby={`${optionId}-label`} aria-describedby={option.description?`${optionId}-description`:undefined} aria-controls={option.content?`${optionId}-content`:undefined} onChange={event=>change(option.value,event.target.checked)}/>
          <span className="mk-choicebox-surface">
            {option.icon&&<span className="mk-choicebox-icon" aria-hidden="true"><Icon name={option.icon}/></span>}
            <span className="mk-choicebox-copy"><strong id={`${optionId}-label`}>{option.label}</strong>{option.description&&<span id={`${optionId}-description`}>{option.description}</span>}{option.disabled&&reason&&<small>{reason}</small>}</span>
            <span className={`mk-choicebox-indicator${props.multiple?'':' mk-choicebox-radio'}`} aria-hidden="true">{props.multiple?<Icon name="check"/>:<span/>}</span>
          </span>
        </label>
        {option.content&&<div id={`${optionId}-content`} className="mk-choicebox-content" hidden={!checked}>{option.content}</div>}
      </div>;
    })}</div>
  </fieldset>;
}
