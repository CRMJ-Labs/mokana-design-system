import {Children,type ComponentPropsWithRef,type ReactNode} from 'react';
import './structured-components.css';

export interface EntityProps extends ComponentPropsWithRef<'div'> {
  right?:ReactNode;
  fill?:boolean;
  loading?:boolean;
  leftClassName?:string;
  rightClassName?:string;
}
export function Entity({children,right,fill=false,loading=false,leftClassName='',rightClassName='',className='',...props}:EntityProps){
  return <div {...props} className={`mk-entity${fill?' mk-entity-fill':''} ${className}`} aria-busy={loading||undefined}>
    {loading?<><span className="mk-sr-only">Cargando elemento</span><div className="mk-entity-loading" aria-hidden="true"><span/><div><i/><i/></div></div></>:<><div className={`mk-entity-left ${leftClassName}`}>{children}</div>{right!=null&&<div className={`mk-entity-right ${rightClassName}`}>{right}</div>}</>}
  </div>;
}
export function EntityList({children,className='',...props}:ComponentPropsWithRef<'ul'>){
  return <ul {...props} className={`mk-entity-list ${className}`}>{Children.map(children,child=>child!=null&&<li>{child}</li>)}</ul>;
}
