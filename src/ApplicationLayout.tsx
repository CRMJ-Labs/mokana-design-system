import {createElement,type ComponentPropsWithRef,type ReactNode} from 'react';
import './application-layout.css';

export interface AppShellProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {
  children:ReactNode;
  /** Product header, normally brand, primary navigation and account actions. */
  header?:ReactNode;
  /** Optional secondary navigation placed below the header. Supply its own nav landmark. */
  navigation?:ReactNode;
  /** Persistent navigation or contextual content beside the main region. */
  sidebar?:ReactNode;
  /** Uses the official compact sidebar width while preserving its content. */
  sidebarCollapsed?:boolean;
  /** Accessible name for the sidebar landmark. */
  sidebarLabel?:string;
  footer?:ReactNode;
  mainId?:string;
  mainLabel?:string;
  skipLinkLabel?:string;
}

/** Application-level regions. Use inside a `.mk` root or PaletteProvider. */
export function AppShell({children,header,navigation,sidebar,sidebarCollapsed=false,sidebarLabel='Navegación principal',footer,mainId='main-content',mainLabel,skipLinkLabel='Saltar al contenido',className='',...props}:AppShellProps){
  return <div {...props} className={`mk-app-shell${sidebar?' mk-app-shell-with-sidebar':''}${sidebarCollapsed?' mk-app-shell-sidebar-collapsed':''}${className?` ${className}`:''}`}>
    <a className="mk-skip-link" href={`#${mainId}`}>{skipLinkLabel}</a>
    {header&&<header className="mk-app-shell-header">{header}</header>}
    {navigation&&<div className="mk-app-shell-navigation">{navigation}</div>}
    <div className="mk-app-shell-body">
      {sidebar&&<aside className="mk-app-shell-sidebar" aria-label={sidebarLabel}>{sidebar}</aside>}
      <main id={mainId} className="mk-app-shell-main" aria-label={mainLabel} tabIndex={-1}>{children}</main>
    </div>
    {footer&&<footer className="mk-app-shell-footer">{footer}</footer>}
  </div>;
}

export type ContentContainerSize='compact'|'default'|'wide'|'full';
export interface ContentContainerProps extends ComponentPropsWithRef<'div'> {
  size?:ContentContainerSize;
}

/** Centers page content and supplies stable responsive gutters. */
export function ContentContainer({size='default',className='',...props}:ContentContainerProps){
  return <div {...props} className={`mk-content-container mk-content-container-${size}${className?` ${className}`:''}`}/>;
}

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'header'>,'title'> {
  title:ReactNode;
  description?:ReactNode;
  eyebrow?:ReactNode;
  actions?:ReactNode;
  headingLevel?:1|2;
}

/** Page identity and its small set of primary actions. */
export function PageHeader({title,description,eyebrow,actions,headingLevel=1,className='',children,...props}:PageHeaderProps){
  const heading=createElement(`h${headingLevel}`,{className:'mk-page-header-title'},title);
  return <header {...props} className={`mk-page-header${className?` ${className}`:''}`}>
    <div className="mk-page-header-copy">{eyebrow&&<div className="mk-page-header-eyebrow">{eyebrow}</div>}{heading}{description&&<div className="mk-page-header-description">{description}</div>}{children}</div>
    {actions&&<div className="mk-page-header-actions">{actions}</div>}
  </header>;
}

export interface PageToolbarProps extends ComponentPropsWithRef<'section'> {
  actions?:ReactNode;
  label?:string;
}

/** Search, view controls and page-level actions in one responsive row. */
export function PageToolbar({actions,label='Herramientas de página',className='',children,...props}:PageToolbarProps){
  return <section {...props} className={`mk-page-toolbar${className?` ${className}`:''}`} aria-label={label}>
    <div className="mk-page-toolbar-content">{children}</div>
    {actions&&<div className="mk-page-toolbar-actions">{actions}</div>}
  </section>;
}

export interface FilterBarProps extends ComponentPropsWithRef<'section'> {
  actions?:ReactNode;
  label?:string;
  activeFilters?:ReactNode;
}

/** Related filters with a dedicated area for reset/apply controls and active values. */
export function FilterBar({actions,label='Filtros',activeFilters,className='',children,...props}:FilterBarProps){
  return <section {...props} className={`mk-filter-bar${className?` ${className}`:''}`} aria-label={label}>
    <div className="mk-filter-bar-fields">{children}</div>
    {actions&&<div className="mk-filter-bar-actions">{actions}</div>}
    {activeFilters&&<div className="mk-filter-bar-active" aria-label="Filtros activos">{activeFilters}</div>}
  </section>;
}
