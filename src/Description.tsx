import type {ComponentPropsWithRef,ReactNode} from 'react';
import './description.css';

export interface DescriptionProps extends Omit<ComponentPropsWithRef<'dl'>,'title'> {
  title:ReactNode;
  textRight?:boolean;
  ellipsis?:boolean;
}

/** A semantic key/value pair. Ellipsis is intended for plain text values. */
export function Description({title,children,textRight=false,ellipsis=false,className='',...props}:DescriptionProps){
  return <dl {...props} className={`mk-description${textRight?' mk-description-right':''}${ellipsis?' mk-description-ellipsis':''}${className?` ${className}`:''}`}>
    <dt>{title}</dt>
    <dd title={ellipsis&&typeof children==='string'?children:undefined}>{children}</dd>
  </dl>;
}
