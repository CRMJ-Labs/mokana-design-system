import {useEffect,useRef,useState,type ComponentPropsWithRef,type CSSProperties,type ReactNode} from 'react';
import {MiddleTruncate} from './CodeComponents';
import './frame-components.css';

export interface BookProps extends Omit<ComponentPropsWithRef<'div'>,'title'> {
  title:ReactNode;
  /** simple keeps only the title; stripe adds a band with the icon. */
  variant?:'simple'|'stripe';
  /** Cover color. Prefer tokens, so it follows the theme. */
  color?:string;
  textColor?:string;
  icon?:ReactNode;
  illustration?:ReactNode;
  width?:number;
  /** Fills the container instead of using a fixed width. */
  responsive?:boolean;
  textured?:boolean;
}
export function Book({title,variant='stripe',color='var(--inverse-background)',textColor='var(--inverse-text)',icon,illustration,width=196,responsive=false,textured=false,className='',style,...props}:BookProps){
  return <div {...props} className={`mk-book mk-book-${variant}${responsive?' is-responsive':''}${textured?' is-textured':''}${className?` ${className}`:''}`} style={{'--book-color':color,'--book-text':textColor,'--book-width':`${width}px`,...style} as CSSProperties}>
    <div className="mk-book-cover">
      {variant==='stripe'&&<div className="mk-book-band" aria-hidden="true">{illustration??icon??<span className="mk-mark"/>}</div>}
      {variant==='simple'&&illustration&&<div className="mk-book-band" aria-hidden="true">{illustration}</div>}
      <div className="mk-book-title">{title}</div>
    </div>
  </div>;
}

export interface BrowserProps extends ComponentPropsWithRef<'figure'> {
  url?:string;
  /** Matches the frame to the surroundings; by default it follows the page theme. */
  tone?:'auto'|'ink';
  /** Locks the content ratio so the frame does not reflow while media loads. */
  aspectRatio?:string;
  caption?:ReactNode;
}
export function Browser({url,tone='auto',aspectRatio='16 / 10',caption,children,className='',...props}:BrowserProps){
  return <figure {...props} className={`mk-browser mk-frame-${tone}${className?` ${className}`:''}`}>
    <div className="mk-browser-chrome" aria-hidden="true"><span className="mk-browser-dots"><i/><i/><i/></span>{url&&<span className="mk-browser-address"><MiddleTruncate text={url}/></span>}</div>
    <div className="mk-frame-media" style={{aspectRatio}}>{children}</div>
    {caption&&<figcaption>{caption}</figcaption>}
  </figure>;
}

export interface PhoneProps extends ComponentPropsWithRef<'figure'> {
  url?:string;
  tone?:'auto'|'ink';
  width?:number;
  aspectRatio?:string;
  caption?:ReactNode;
}
export function Phone({url,tone='auto',width=280,aspectRatio='9 / 19.5',caption,children,className='',style,...props}:PhoneProps){
  return <figure {...props} className={`mk-phone mk-frame-${tone}${className?` ${className}`:''}`} style={{'--phone-width':`${width}px`,...style} as CSSProperties}>
    <div className="mk-phone-shell">
      <div className="mk-phone-screen" style={{aspectRatio}}>
        <div className="mk-phone-bar" aria-hidden="true"><span className="mk-phone-notch"/>{url&&<span className="mk-phone-address"><MiddleTruncate text={url}/></span>}</div>
        <div className="mk-frame-media">{children}</div>
      </div>
    </div>
    {caption&&<figcaption>{caption}</figcaption>}
  </figure>;
}

export interface VideoProps extends Omit<ComponentPropsWithRef<'video'>,'src'|'title'> {
  src:string;
  /** Describes the video for assistive technology. */
  title:string;
  /** Loads the file only when the video nears the viewport. */
  lazy?:boolean;
  aspectRatio?:string;
}
export function Video({src,title,lazy=true,controls=true,loop=true,muted,autoPlay=false,playsInline=true,aspectRatio='16 / 9',poster,children,className='',style,...props}:VideoProps){
  const node=useRef<HTMLVideoElement>(null);
  const [visible,setVisible]=useState(!lazy);
  const [motion,setMotion]=useState(false);
  useEffect(()=>{setMotion(!matchMedia('(prefers-reduced-motion: reduce)').matches);},[]);
  useEffect(()=>{
    if(!lazy||!node.current)return;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect();}},{rootMargin:'200px'});
    observer.observe(node.current);return ()=>observer.disconnect();
  },[lazy]);
  // Autoplay respects reduced motion, and needs mute to be allowed by browsers.
  return <video {...props} ref={node} className={`mk-video${className?` ${className}`:''}`} style={{aspectRatio,...style}} aria-label={title} src={visible?src:undefined} poster={poster} preload={visible?'metadata':'none'} controls={controls} loop={loop} muted={muted??autoPlay} autoPlay={autoPlay&&motion&&visible} playsInline={playsInline}>{children}</video>;
}
