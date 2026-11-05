import {CodeDisclosure} from './CodeComponents';
import type {ReactNode} from 'react';
import {ThemeSwitcher,useTheme} from './ThemeSwitcher';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-theme-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-theme-preview">{children}</div><CodeDisclosure code={code}/></section>;
}
export function ThemeSwitcherPage(){
  const {theme,resolvedTheme}=useTheme();
  const names={system:'Sistema',light:'Claro',dark:'Oscuro'};
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Theme Switcher</h1><p>Selecciona el tema claro, oscuro o la apariencia del sistema.</p></header>

    <Example id="default" title="Predeterminado" description="La selección cambia el tema de todo el sitio y se conserva al recargar. Sistema sigue la preferencia de tu dispositivo, incluso si cambia mientras usas la página." code={'<ThemeSwitcher />'}><ThemeSwitcher/><p role="status">Preferencia: {names[theme]} · Tema activo: {names[resolvedTheme]}</p></Example>
    <Example id="small" title="Compacto" description="Usa small en pies de página y espacios reducidos. Los ejemplos comparten la misma preferencia." code={'<ThemeSwitcher small />'}><ThemeSwitcher small/></Example>
    <Example id="disabled" title="Deshabilitado" description="El control muestra la selección actual sin permitir cambios. También se deshabilita si ThemeProvider define forcedTheme." code={'<ThemeSwitcher disabled />'}><ThemeSwitcher disabled/></Example>
    <section className="mk-theme-guidelines"><h2>Integración</h2><p>Importa ThemeProvider, ThemeSwitcher y useTheme desde <code>@mokanadev/design-system</code>. Envuelve la aplicación una vez y aplica resolvedTheme al atributo data-theme de la raíz MOK.</p><CodeDisclosure label="Ver integración completa" code={'function Appearance() {\n  const { resolvedTheme } = useTheme();\n  return (\n    <div className="mk" data-theme={resolvedTheme}>\n      <ThemeSwitcher />\n      {/* Contenido de la aplicación */}\n    </div>\n  );\n}\n\n<ThemeProvider defaultTheme="system" storageKey="mok-theme">\n  <Appearance />\n</ThemeProvider>'}/><ul><li>Usa un único selector de apariencia en la interfaz final; aquí se repite para documentar variantes.</li><li>Tab entra al grupo y las flechas cambian la opción, como en un grupo de radios nativo.</li><li>La preferencia se guarda en mok-theme. storageKey permite cambiar la clave o desactivar el guardado con null.</li><li>forcedTheme="light" o forcedTheme="dark" fija el tema sin sobrescribir la preferencia guardada.</li><li>Si el almacenamiento no está disponible, el selector sigue funcionando durante la sesión.</li></ul><a href="https://vercel.com/geist/theme-switcher" target="_blank" rel="noreferrer">Referencia: Geist Theme Switcher</a></section>
  </article>;
}
