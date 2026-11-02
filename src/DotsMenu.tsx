import {Icon} from './Icon';
import {Menu,type MenuProps} from './Menu';
import './destructive.css';

export interface DotsMenuProps extends Pick<MenuProps,'items'|'position'|'disabled'> {
  label?:string;
  size?:'sm'|'md'|'lg';
}

export function DotsMenu({label='Más acciones',size='md',...props}:DotsMenuProps){
  return <Menu {...props} label={label} buttonProps={{size,className:`mk-dots-trigger mk-dots-${size}`}} trigger={<Icon name="more-horizontal" className="mk-dots-icon" size={20}/>}/>;
}
