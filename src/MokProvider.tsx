import type {ReactNode} from 'react';
import {PaletteProvider,type PaletteProviderProps} from './PaletteProvider';
import {mokPalette,type Palette} from './palette';
import {ThemeProvider,type ResolvedTheme,type ThemePreference} from './ThemeSwitcher';
import {ToastProvider} from './Toast';

export interface MokProviderProps extends Omit<PaletteProviderProps,'palette'|'children'> {
  children:ReactNode;
  /** Product palette. Uses the official MOK palette by default. */
  palette?:Palette;
  /** Initial preference when no persisted value exists. */
  defaultTheme?:ThemePreference;
  /** Independent persistence key for this application; null disables persistence. */
  storageKey?:string|null;
  /** Locks the rendered theme without replacing the saved preference. */
  forcedTheme?:ResolvedTheme;
  /** Includes the notification region and useToasts context. */
  enableToasts?:boolean;
}

/** Recommended application root: theme, product palette, MOK scope and notifications. */
export function MokProvider({children,palette=mokPalette,defaultTheme='system',storageKey='mok-theme',forcedTheme,enableToasts=true,...rootProps}:MokProviderProps){
  return <ThemeProvider defaultTheme={defaultTheme} storageKey={storageKey} forcedTheme={forcedTheme}>
    <PaletteProvider {...rootProps} palette={palette}>
      {enableToasts?<ToastProvider>{children}</ToastProvider>:children}
    </PaletteProvider>
  </ThemeProvider>;
}
