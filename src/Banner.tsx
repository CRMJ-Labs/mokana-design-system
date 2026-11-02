import type {ComponentPropsWithRef} from 'react';
import {Button,ButtonLink,Icon} from './components';
import {Separator} from './Separator';
import './banner.css';

export interface BannerAction {
  label:string;
  href?:string;
  target?:'_blank'|'_self';
  onClick?:()=>void;
}
export interface BannerProps extends ComponentPropsWithRef<'aside'> {
  eyebrow?:string;
  action?:BannerAction;
  /** ink keeps the brand panel in both themes; surface follows the page theme. */
  tone?:'ink'|'brand'|'accent'|'surface';
  mark?:boolean;
  /** Removes the radius and side borders, to sit against the edges of the page. */
  flush?:boolean;
  /** Shows the close button. The caller removes the banner and moves the focus. */
  onClose?:()=>void;
  closeLabel?:string;
}

export function Banner({children,eyebrow,action,tone='ink',mark=false,flush=false,onClose,closeLabel='Cerrar anuncio',className='',...props}:BannerProps){
  return <aside aria-label="Anuncio" {...props} className={`mk-banner mk-banner-${tone}${flush?' mk-banner-flush':''}${onClose?' mk-banner-closable':''}${className?` ${className}`:''}`}>
    {mark&&<span className="mk-mark" aria-hidden="true"/>}
    <div className="mk-banner-body">
      {eyebrow&&<><span className="mk-eyebrow">{eyebrow}</span><Separator orientation="vertical" aria-hidden/></>}
      <div className="mk-banner-message">{children}</div>
    </div>
    {action&&(action.href
      ?<ButtonLink href={action.href} target={action.target} rel={action.target==='_blank'?'noreferrer':undefined} size="sm" suffix="arrow" onClick={action.onClick}>{action.label}</ButtonLink>
      :<Button size="sm" onClick={action.onClick}>{action.label}</Button>)}
    {onClose&&<button type="button" className="mk-banner-close" aria-label={closeLabel} onClick={onClose}><Icon name="close"/></button>}
  </aside>;
}
