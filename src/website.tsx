import {StrictMode, useEffect, useRef, useState, type MouseEvent, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {CatalogPage, isComponentImplemented} from './Catalog';
import {componentCatalog} from './catalog-navigation';
import {ThemeProvider,ThemeSwitcher,useTheme} from './ThemeSwitcher';
import {lazy,Suspense} from 'react';
import {Intro, BrandFoundations, UIFoundations, ProductThemes} from './Documentation';
import {ColorFoundations} from './ColorFoundations';
import {AuthPattern, DashboardPattern, CrudPattern, FiltersPattern, EmptyPattern, SettingsPattern} from './patterns';
import './styles.css';
import './fonts.css';
import './examples.css';
import './documentation.css';
import './website.css';

type Page = {label: string; path: string; pending?: boolean; render: () => ReactNode};
const IconographyPage=lazy(()=>import('./IconographyPage').then(module=>({default:module.IconographyPage})));
const IntegrationPage=lazy(()=>import('./IntegrationPage').then(module=>({default:module.IntegrationPage})));
const ApplicationLayoutPage=lazy(()=>import('./ApplicationLayoutPage').then(module=>({default:module.ApplicationLayoutPage})));
const AdminPlatformStarterPage=lazy(()=>import('./AdminPlatformStarterPage').then(module=>({default:module.AdminPlatformStarterPage})));
const PatternCatalogPage=lazy(()=>import('./PatternCatalogPage').then(module=>({default:module.PatternCatalogPage})));
const FormPattern=lazy(()=>import('./FormPattern').then(module=>({default:module.FormPattern})));
const AnatomiesPage=lazy(()=>import('./AnatomiesPage').then(module=>({default:module.AnatomiesPage})));
const CrmPattern=lazy(()=>import('./CrmPattern').then(module=>({default:module.CrmPattern})));
const foundations: Page[] = [
  {label:'Introducción',path:'/introduction',render:()=> <Intro/>},
  {label:'Integración',path:'/integration',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando integración…</p>}><IntegrationPage/></Suspense>},
  {label:'Estructura de aplicación',path:'/foundations/application-layout',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando estructura…</p>}><ApplicationLayoutPage/></Suspense>},
  {label:'Anatomías y slots',path:'/foundations/anatomies',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando anatomías…</p>}><AnatomiesPage/></Suspense>},
  {label:'Marca',path:'/foundations/brand',render:()=> <BrandFoundations/>},
  {label:'Color',path:'/foundations/colors',render:()=> <ColorFoundations/>},
  {label:'Tipografía',path:'/foundations/typography',render:()=> <BrandFoundations/>},
  {label:'Iconografía',path:'/foundations/iconography',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando iconografía…</p>}><IconographyPage/></Suspense>},
  {label:'Fundamentos de UI',path:'/foundations/ui',render:()=> <UIFoundations/>},
  {label:'Temas',path:'/foundations/themes',render:()=> <ProductThemes/>},
];
const components: Page[] = componentCatalog.map(item=> {
  const slug=item.slug;
  return {label:item.label,path:`/components/${slug}`,pending:!isComponentImplemented(slug),render:()=> <CatalogPage slug={slug}/>};
});
const patterns: Page[] = [
  {label:'Catálogo de patrones',path:'/patterns',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando catálogo…</p>}><PatternCatalogPage/></Suspense>},
  {label:'Formularios completos',path:'/patterns/forms',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando formulario…</p>}><FormPattern/></Suspense>},
  {label:'CRM',path:'/patterns/crm',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando CRM…</p>}><CrmPattern/></Suspense>},
  {label:'Autenticación',path:'/patterns/auth',render:()=> <AuthPattern/>},
  {label:'Dashboard',path:'/patterns/dashboard',render:()=> <DashboardPattern/>},
  {label:'CRUD completo',path:'/patterns/crud',render:()=> <CrudPattern/>},
  {label:'Filtros',path:'/patterns/filters',render:()=> <FiltersPattern/>},
  {label:'Estados vacíos',path:'/patterns/empty',render:()=> <EmptyPattern/>},
  {label:'Configuración',path:'/patterns/settings',render:()=> <SettingsPattern/>},
];
const starters: Page[] = [
  {label:'Plataforma administrativa',path:'/starters/admin-platform',render:()=> <Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando starter…</p>}><AdminPlatformStarterPage/></Suspense>},
];
const pages=[...foundations,...components,...patterns,...starters];

function currentPath(){
  return decodeURI(location.pathname).replace(/\/$/,'')||'/introduction';
}

function Website(){
  const {resolvedTheme:theme}=useTheme();
  const [query,setQuery]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null);
  const [path,setPath]=useState(currentPath);
  const previousPath=useRef(path);
  const page=pages.find(item=>item.path===path);
  useEffect(()=>{
    if(!menuOpen)return;
    const close=(event:KeyboardEvent)=>{
      if(event.key==='Escape'&&matchMedia('(max-width:800px)').matches){
        event.preventDefault();setMenuOpen(false);menuButton.current?.focus({preventScroll:true});
      }
    };
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[menuOpen]);
  useEffect(()=>{
    const onPopState=()=>setPath(currentPath());
    window.addEventListener('popstate',onPopState);
    return ()=>window.removeEventListener('popstate',onPopState);
  },[]);
  useEffect(()=>{
    if(previousPath.current===path)return;
    previousPath.current=path;
    setMenuOpen(false);
    if(!location.hash)window.scrollTo({top:0,behavior:'instant'});
    document.getElementById('main-content')?.focus({preventScroll:true});
  },[path]);
  function navigate(event:MouseEvent<HTMLDivElement>){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const anchor=event.target instanceof Element?event.target.closest('a'):null;
    if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
    const href=anchor.getAttribute('href');
    if(!href||href.startsWith('#'))return;
    const url=new URL(anchor.href,location.href);
    if(url.origin!==location.origin||!pages.some(item=>item.path===url.pathname.replace(/\/$/,'')||url.pathname==='/'))return;
    event.preventDefault();
    if(url.href!==location.href)history.pushState(null,'',url);
    setPath(currentPath());
    setMenuOpen(false);
  }
  useEffect(()=>{
    document.title=`${page?.label??'Página no encontrada'} · MOK Design System`;
    document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;
  },[theme,page]);
  function group(title:string,items:Page[]){
    const visible=items.filter(item=>item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
    if(!visible.length)return null;
    return <section className="mk-docs-nav-group"><h2>{title}</h2><ul>{visible.map(item=><li key={item.path}><a href={item.path} aria-current={path===item.path?'page':undefined}><span>{item.label}</span>{item.pending&&<span className="mk-nav-pending" title="Componente pendiente de implementar">Pendiente</span>}</a></li>)}</ul></section>;
  }
  return <div className="mk mk-docs mk-website" data-theme={theme} onClick={navigate}>
    <a className="mk-skip-link" href="#main-content">Ir al contenido</a>
    <header className="mk-docs-header">
      <a className="mk-docs-home" href="/introduction" aria-label="MOK Design System, inicio"><img className="mk-docs-logo" src="/brand/isotipo.svg" alt=""/><strong>MOK Design System</strong></a>
      <label className="mk-docs-search"><span className="mk-sr-only">Buscar componentes y páginas</span><input type="search" value={query} onChange={event=>{setQuery(event.target.value);setMenuOpen(true);}} placeholder="Buscar en MOK"/></label>
      <div className="mk-website-actions"><ThemeSwitcher small className="mk-website-theme" label="Tema de la documentación"/><button ref={menuButton} type="button" className="mk-menu-toggle" aria-expanded={menuOpen} aria-controls="website-navigation" onClick={()=>setMenuOpen(!menuOpen)}>Menú</button></div>
    </header>
    <aside id="website-navigation" className={`mk-docs-sidebar ${menuOpen?'is-open':''}`} aria-label="Documentación">
      {group('Fundamentos',foundations)}{group('Componentes',components)}{group('Patrones',patterns)}{group('Starters',starters)}
      {query&&!pages.some(item=>item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()))&&<p role="status">No se encontraron páginas.</p>}
    </aside>
    <main id="main-content" className="mk-docs-content" tabIndex={-1}>
      {page?<div key={path}>{page.render()}</div>:<section className="mk-stack"><h1>Página no encontrada</h1><p>Esta dirección no pertenece a la documentación de MOK.</p><a href="/introduction">Volver a la introducción</a></section>}
    </main>
  </div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider><Website/></ThemeProvider></StrictMode>);
