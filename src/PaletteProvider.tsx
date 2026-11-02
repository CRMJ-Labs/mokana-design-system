import type {ComponentPropsWithRef,CSSProperties} from 'react';
import {useTheme} from './ThemeSwitcher';
import {mokPalette,type Palette} from './palette';

export interface PaletteProviderProps extends ComponentPropsWithRef<'div'> {
  palette?:Palette;
}
/** Place inside ThemeProvider; scopes product colors to this tree, including dialogs. */
export function PaletteProvider({palette=mokPalette,children,className='',style,...props}:PaletteProviderProps){
  const {resolvedTheme}=useTheme();
  const colors=Object.fromEntries(Object.entries(palette[resolvedTheme]).map(([name,value])=>[`--${name}`,value]));
  return <div {...props} className={`mk ${className}`.trim()} data-theme={resolvedTheme} style={{...colors,...style} as CSSProperties}>{children}</div>;
}
