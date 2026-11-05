import {lazy,Suspense,useRef,type ComponentType,type ReactNode} from 'react';
import {PageOutline} from './PageOutline';

const pages:Record<string,ComponentType>={
  'address-input':lazy(()=>import('./CoreFormPages').then(module=>({default:module.AddressInputPage}))),
  'alert':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.AlertPage}))),
  'avatar':lazy(()=>import('./AvatarPage').then(module=>({default:module.AvatarPage}))),
  'badge':lazy(()=>import('./BadgePage').then(module=>({default:module.BadgePage}))),
  'banner':lazy(()=>import('./BannerPage').then(module=>({default:module.BannerPage}))),
  'book':lazy(()=>import('./FramePages').then(module=>({default:module.BookPage}))),
  'breadcrumbs':lazy(()=>import('./BreadcrumbsPage').then(module=>({default:module.BreadcrumbsPage}))),
  'browser':lazy(()=>import('./FramePages').then(module=>({default:module.BrowserPage}))),
  'button':lazy(()=>import('./ButtonPage').then(module=>({default:module.ButtonPage}))),
  'calendar':lazy(()=>import('./ControlPages').then(module=>({default:module.CalendarPage}))),
  'card':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.CardPage}))),
  'charts':lazy(()=>import('./ChartsPage').then(module=>({default:module.ChartsPage}))),
  'checkbox':lazy(()=>import('./CheckboxPage').then(module=>({default:module.CheckboxPage}))),
  'choicebox':lazy(()=>import('./ChoiceboxPage').then(module=>({default:module.ChoiceboxPage}))),
  'clearable-input':lazy(()=>import('./ClearableInputPage').then(module=>({default:module.ClearableInputPage}))),
  'code':lazy(()=>import('./CodePages').then(module=>({default:module.CodePage}))),
  'code-block':lazy(()=>import('./CodePages').then(module=>({default:module.CodeBlockPage}))),
  'collapse':lazy(()=>import('./CollapsePage').then(module=>({default:module.CollapsePage}))),
  'combobox':lazy(()=>import('./CoreFormPages').then(module=>({default:module.ComboboxPage}))),
  'command-menu':lazy(()=>import('./InteractionPages').then(module=>({default:module.CommandMenuPage}))),
  'context-card':lazy(()=>import('./InteractionPages').then(module=>({default:module.ContextCardPage}))),
  'context-menu':lazy(()=>import('./InteractionPages').then(module=>({default:module.ContextMenuPage}))),
  'copy-button':lazy(()=>import('./InteractionPages').then(module=>({default:module.CopyButtonPage}))),
  'description':lazy(()=>import('./DescriptionPage').then(module=>({default:module.DescriptionPage}))),
  'destructive-action-modal':lazy(()=>import('./DestructivePages').then(module=>({default:module.DestructiveActionModalPage}))),
  'destructive-confirmation-input':lazy(()=>import('./DestructivePages').then(module=>({default:module.DestructiveConfirmationInputPage}))),
  'dots-menu':lazy(()=>import('./DestructivePages').then(module=>({default:module.DotsMenuPage}))),
  'drawer':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.DrawerPage}))),
  'empty-state':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.EmptyStatePage}))),
  'entity':lazy(()=>import('./StructuredPages').then(module=>({default:module.EntityPage}))),
  'error':lazy(()=>import('./ErrorPages').then(module=>({default:module.ErrorPage}))),
  'error-card':lazy(()=>import('./ErrorPages').then(module=>({default:module.ErrorCardPage}))),
  'feedback':lazy(()=>import('./StructuredPages').then(module=>({default:module.FeedbackPage}))),
  'fieldset':lazy(()=>import('./StructuredPages').then(module=>({default:module.FieldsetPage}))),
  'file-tree':lazy(()=>import('./StructuredPages').then(module=>({default:module.FileTreePage}))),
  'filter-params':lazy(()=>import('./MetricsLayoutPages').then(module=>({default:module.FilterParamsPage}))),
  'gauge':lazy(()=>import('./MetricsLayoutPages').then(module=>({default:module.GaugePage}))),
  'grid':lazy(()=>import('./MetricsLayoutPages').then(module=>({default:module.GridPage}))),
  'input':lazy(()=>import('./InputPage').then(module=>({default:module.InputPage}))),
  'json-view':lazy(()=>import('./CodePages').then(module=>({default:module.JsonViewPage}))),
  'keyboard-input':lazy(()=>import('./CodePages').then(module=>({default:module.KeyboardInputPage}))),
  'label':lazy(()=>import('./LabelPage').then(module=>({default:module.LabelPage}))),
  'load-more-button':lazy(()=>import('./LoadMoreButtonPage').then(module=>({default:module.LoadMoreButtonPage}))),
  'loading-dots':lazy(()=>import('./StatusPages').then(module=>({default:module.LoadingDotsPage}))),
  'menu':lazy(()=>import('./MenuPage').then(module=>({default:module.MenuPage}))),
  'middle-truncate':lazy(()=>import('./CodePages').then(module=>({default:module.MiddleTruncatePage}))),
  'modal':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.ModalPage}))),
  'multi-select':lazy(()=>import('./MultiSelectPage').then(module=>({default:module.MultiSelectPage}))),
  'note':lazy(()=>import('./StatusPages').then(module=>({default:module.NotePage}))),
  'pagination':lazy(()=>import('./CoreNavigationPages').then(module=>({default:module.PaginationPage}))),
  'phone':lazy(()=>import('./FramePages').then(module=>({default:module.PhonePage}))),
  'pie-gauge':lazy(()=>import('./StatusPages').then(module=>({default:module.PieGaugePage}))),
  'pill':lazy(()=>import('./StatusPages').then(module=>({default:module.PillPage}))),
  'progress':lazy(()=>import('./CoreNavigationPages').then(module=>({default:module.ProgressPage}))),
  'project-banner':lazy(()=>import('./StatusPages').then(module=>({default:module.ProjectBannerPage}))),
  'radio':lazy(()=>import('./CoreFormPages').then(module=>({default:module.RadioPage}))),
  'relative-time-card':lazy(()=>import('./ControlPages').then(module=>({default:module.RelativeTimeCardPage}))),
  'scroller':lazy(()=>import('./ControlPages').then(module=>({default:module.ScrollerPage}))),
  'search-input':lazy(()=>import('./ControlPages').then(module=>({default:module.SearchInputPage}))),
  'select':lazy(()=>import('./CoreFormPages').then(module=>({default:module.SelectPage}))),
  'separator':lazy(()=>import('./SeparatorPage').then(module=>({default:module.SeparatorPage}))),
  'sheet':lazy(()=>import('./ControlPages').then(module=>({default:module.SheetPage}))),
  'show-more':lazy(()=>import('./ControlPages').then(module=>({default:module.ShowMorePage}))),
  'skeleton':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.SkeletonPage}))),
  'slider':lazy(()=>import('./ControlPages').then(module=>({default:module.SliderPage}))),
  'snippet':lazy(()=>import('./CodePages').then(module=>({default:module.SnippetPage}))),
  'spinner':lazy(()=>import('./StatusPages').then(module=>({default:module.SpinnerPage}))),
  'split-button':lazy(()=>import('./ControlPages').then(module=>({default:module.SplitButtonPage}))),
  'status-dot':lazy(()=>import('./StatusPages').then(module=>({default:module.StatusDotPage}))),
  'switch':lazy(()=>import('./CoreFormPages').then(module=>({default:module.SwitchPage}))),
  'table':lazy(()=>import('./CoreNavigationPages').then(module=>({default:module.TablePage}))),
  'tabs':lazy(()=>import('./CoreNavigationPages').then(module=>({default:module.TabsPage}))),
  'text-with-copy-button':lazy(()=>import('./CodePages').then(module=>({default:module.TextWithCopyButtonPage}))),
  'textarea':lazy(()=>import('./CoreFormPages').then(module=>({default:module.TextareaPage}))),
  'theme-switcher':lazy(()=>import('./ThemeSwitcherPage').then(module=>({default:module.ThemeSwitcherPage}))),
  'toast':lazy(()=>import('./ToastPage').then(module=>({default:module.ToastPage}))),
  'toggle':lazy(()=>import('./CoreFormPages').then(module=>({default:module.TogglePage}))),
  'tooltip':lazy(()=>import('./CoreSurfacePages').then(module=>({default:module.TooltipPage}))),
  'video':lazy(()=>import('./FramePages').then(module=>({default:module.VideoPage}))),
};

const ApiReference=lazy(()=>import('./ApiReference').then(module=>({default:module.ApiReference})));

export function isComponentImplemented(slug:string){return Object.hasOwn(pages,slug);}

function ReadyPage({children}:{children:ReactNode}){
  const content=useRef<HTMLDivElement>(null);
  return <div className="mk-component-layout"><PageOutline content={content}/><div ref={content} className="mk-component-content">{children}</div></div>;
}

export function CatalogPage({slug}:{slug:string}){
  const Page=pages[slug];
  return Page?<Suspense fallback={<p className="mk-catalog-loading" role="status">Cargando componente…</p>}><ReadyPage><Page/><Suspense fallback={<p role="status">Cargando referencia de API…</p>}><ApiReference slug={slug}/></Suspense></ReadyPage></Suspense>:null;
}
