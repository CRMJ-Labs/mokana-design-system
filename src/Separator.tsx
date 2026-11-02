import type {ComponentPropsWithRef} from 'react';
import './separator.css';

interface SeparatorBaseProps extends ComponentPropsWithRef<'div'> {
  /** line is the subtle default; accent is the 2px brand stroke, driven by --accent-text. */
  tone?:'line'|'accent';
  /** Reserves 1px at each end and uses a solid color, for frames painted over the content. */
  inset?:boolean;
}
export type SeparatorProps=SeparatorBaseProps&(
  {orientation?:'horizontal';label?:string;mark?:boolean;align?:'start'|'center'}|
  {orientation:'vertical';label?:undefined;mark?:undefined;align?:undefined}
);

export function Separator({orientation='horizontal',tone='line',inset=false,label,mark=false,align='start',className='',...props}:SeparatorProps){
  const classes=`mk-separator mk-separator-${orientation} mk-separator-${tone}${inset?' mk-separator-inset':''}${className?` ${className}`:''}`;
  if(!label&&!mark)return <div role="separator" aria-orientation={orientation} {...props} className={classes}/>;
  return <div role="separator" aria-orientation="horizontal" aria-label={label} {...props} className={`${classes} mk-separator-decorated mk-separator-${align}`}>
    <span className="mk-separator-rule"/>
    {mark&&<span className="mk-mark" aria-hidden="true"/>}
    {label&&<span className="mk-eyebrow mk-separator-label">{label}</span>}
    <span className="mk-separator-rule"/>
  </div>;
}
