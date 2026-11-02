import {Icon} from './Icon';
import {createContext,useContext,useEffect,useId,useMemo,useState,type ComponentPropsWithRef,type ReactNode} from 'react';
import './theme-switcher.css';

export type ThemePreference='system'|'light'|'dark';
export type ResolvedTheme='light'|'dark';
interface ThemeContextValue {
  theme:ThemePreference;
  resolvedTheme:ResolvedTheme;
  setTheme:(theme:ThemePreference)=>void;
  forcedTheme?:ResolvedTheme;
}
const ThemeContext=createContext<ThemeContextValue|null>(null);
const isTheme=(value:unknown):value is ThemePreference=>value==='system'||value==='light'||value==='dark';
export interface ThemeProviderProps {
  children:ReactNode;
  defaultTheme?:ThemePreference;
  storageKey?:string|null;
  forcedTheme?:ResolvedTheme;
}

/** Apply resolvedTheme to the data-theme attribute of your .mk root. */
export function ThemeProvider({children,defaultTheme='system',storageKey='mok-theme',forcedTheme}:ThemeProviderProps){
  const [theme,updateTheme]=useState<ThemePreference>(()=>{
    try{const stored=storageKey?localStorage.getItem(storageKey):null;if(isTheme(stored))return stored;}catch{/* Selection still works without storage. */}
    return defaultTheme;
  });
  const [systemTheme,setSystemTheme]=useState<ResolvedTheme>(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  useEffect(()=>{
    const media=matchMedia('(prefers-color-scheme: dark)');
    const sync=()=>setSystemTheme(media.matches?'dark':'light');sync();
    media.addEventListener('change',sync);return ()=>media.removeEventListener('change',sync);
  },[]);
  useEffect(()=>{
    if(!storageKey)return;
    const sync=(event:StorageEvent)=>{if(event.key===storageKey||event.key===null)updateTheme(isTheme(event.newValue)?event.newValue:defaultTheme);};
    window.addEventListener('storage',sync);return ()=>window.removeEventListener('storage',sync);
  },[storageKey,defaultTheme]);
  const value=useMemo<ThemeContextValue>(()=>({theme,resolvedTheme:forcedTheme??(theme==='system'?systemTheme:theme),forcedTheme,setTheme(next){
    if(forcedTheme||!isTheme(next))return;
    updateTheme(next);
    try{if(storageKey)localStorage.setItem(storageKey,next);}catch{/* Private contexts can disallow storage. */}
  }}),[theme,systemTheme,forcedTheme,storageKey]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){
  const context=useContext(ThemeContext);
  if(!context)throw new globalThis.Error('useTheme and ThemeSwitcher require a ThemeProvider.');
  return context;
}

export interface ThemeSwitcherProps extends Omit<ComponentPropsWithRef<'fieldset'>,'children'> {
  small?:boolean;
  label?:string;
}

const options=[{value:'system',label:'Sistema',icon:'monitor'},{value:'light',label:'Claro',icon:'sun'},{value:'dark',label:'Oscuro',icon:'moon'}] as const;

export function ThemeSwitcher({small=false,disabled=false,label='Seleccionar tema de apariencia',className='',...props}:ThemeSwitcherProps){
  const {theme,setTheme,forcedTheme}=useTheme();
  const name=useId();
  return <fieldset {...props} disabled={disabled||!!forcedTheme} className={`mk-theme-switcher${small?' mk-theme-switcher-small':''}${className?` ${className}`:''}`}>
    <legend className="mk-sr-only">{label}</legend>
    {options.map(option=><label className="mk-theme-option" title={option.label} key={option.value}>
      <input type="radio" name={name} value={option.value} checked={(forcedTheme??theme)===option.value} onChange={()=>setTheme(option.value)}/>
      <span className="mk-theme-option-icon"><Icon name={option.icon} size={small?16:20}/><span className="mk-sr-only">{option.label}</span></span>
    </label>)}
  </fieldset>;
}
