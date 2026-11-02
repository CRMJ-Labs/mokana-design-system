import type {ReactNode} from 'react';
import {Menu,type MenuEntry} from './Menu';
import './interaction-components.css';

export interface ContextMenuProps {items:MenuEntry[];children:ReactNode;label?:string;disabled?:boolean}
/** A visible Menu trigger mirrors the right-click and long-press actions. */
export function ContextMenu({children,label='Acciones del elemento',...props}:ContextMenuProps){
  return <Menu {...props} label={label} contextArea={children} chevron/>;
}
