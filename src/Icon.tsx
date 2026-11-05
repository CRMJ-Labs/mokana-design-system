import type {LucideProps} from 'lucide-react';
import {
  ArrowRight,ArrowLeft,ArrowUp,ArrowDown,ChevronRight,ChevronLeft,ChevronUp,ChevronDown,
  House,Menu,Ellipsis,EllipsisVertical,ExternalLink,Settings,Plus,Minus,X,Search,Check,
  Copy,Clipboard,Pencil,Trash2,Download,Upload,RefreshCw,Undo2,Save,Share2,Filter,
  User,Users,UserPlus,LogIn,LogOut,Lock,LockOpen,KeyRound,Shield,ShieldCheck,Eye,EyeOff,
  Folder,FolderOpen,File,FileText,FileCode,Image,Paperclip,Archive,Package,CodeXml,
  Terminal,Database,Server,Globe,Mail,MessageSquare,Bell,BellOff,Send,Smile,Frown,Laugh,
  Info,TriangleAlert,CircleX,CircleCheck,CircleHelp,LoaderCircle,Clock,Calendar,Wifi,
  Sun,Moon,Monitor,Smartphone,ChartNoAxesColumnIncreasing,CreditCard,Meh,PanelLeftClose,PanelLeftOpen,
} from 'lucide-react';
import './icon.css';

/** Curated imports: do not import the complete Lucide icon registry. */
const glyphs={
  'arrow-right':ArrowRight,'arrow-left':ArrowLeft,'arrow-up':ArrowUp,'arrow-down':ArrowDown,
  'chevron-right':ChevronRight,'chevron-left':ChevronLeft,'chevron-up':ChevronUp,'chevron-down':ChevronDown,
  home:House,menu:Menu,'more-horizontal':Ellipsis,'more-vertical':EllipsisVertical,'external-link':ExternalLink,settings:Settings,
  plus:Plus,minus:Minus,close:X,search:Search,check:Check,copy:Copy,clipboard:Clipboard,edit:Pencil,trash:Trash2,
  download:Download,upload:Upload,refresh:RefreshCw,undo:Undo2,save:Save,share:Share2,filter:Filter,
  user:User,users:Users,'user-plus':UserPlus,'log-in':LogIn,'log-out':LogOut,lock:Lock,unlock:LockOpen,key:KeyRound,
  shield:Shield,'shield-check':ShieldCheck,eye:Eye,'eye-off':EyeOff,
  folder:Folder,'folder-open':FolderOpen,file:File,'file-text':FileText,'file-code':FileCode,image:Image,
  paperclip:Paperclip,archive:Archive,package:Package,code:CodeXml,terminal:Terminal,database:Database,server:Server,globe:Globe,
  mail:Mail,message:MessageSquare,bell:Bell,'bell-off':BellOff,send:Send,smile:Smile,frown:Frown,laugh:Laugh,meh:Meh,
  info:Info,warning:TriangleAlert,error:CircleX,success:CircleCheck,help:CircleHelp,loading:LoaderCircle,clock:Clock,calendar:Calendar,wifi:Wifi,
  sun:Sun,moon:Moon,monitor:Monitor,smartphone:Smartphone,chart:ChartNoAxesColumnIncreasing,'credit-card':CreditCard,
  'panel-left-close':PanelLeftClose,'panel-left-open':PanelLeftOpen,
} as const;
export type CanonicalIconName=keyof typeof glyphs;
export const iconAliases={arrow:'arrow-right',chevron:'chevron-down'} as const satisfies Record<string,CanonicalIconName>;
export type IconName=CanonicalIconName|keyof typeof iconAliases;
export const iconNames=Object.keys(glyphs) as CanonicalIconName[];
export interface IconProps extends Omit<LucideProps,'name'|'children'|'role'|'aria-hidden'> {
  name?:IconName;
  /** Names a meaningful standalone icon; omit inside an already labelled control. */
  label?:string;
}
export function Icon({name='arrow',size=24,strokeWidth=1.8,label,className='',...props}:IconProps){
  const canonical=(iconAliases as Partial<Record<IconName,CanonicalIconName>>)[name]??name as CanonicalIconName;
  const Glyph=glyphs[canonical];
  const accessible=Boolean(label||props['aria-label']||props['aria-labelledby']);
  return <Glyph {...props} size={size} strokeWidth={strokeWidth} className={`mk-icon ${className}`} data-icon={canonical} focusable="false" role={accessible?'img':undefined} aria-hidden={accessible?undefined:true} aria-label={label??props['aria-label']}/>;
}
