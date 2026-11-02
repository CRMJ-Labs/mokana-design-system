import {Icon} from './Icon';
import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type ComponentPropsWithRef,type KeyboardEvent,type ReactNode} from 'react';
import {CopyButton} from './CopyButton';
import {Tabs} from './advanced-components';
import './code-components.css';

const tokenPattern=/((?<![:\w])\/\/.*$|^\s*#.*$|^\s*--\s.*$|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|export|from|default|function|return|const|let|var|if|else|for|of|in|while|class|new|await|async|type|interface|void|typeof|as|extends|local|end|then|module)\b|\b(true|false|null|undefined|\d+(?:\.\d+)?)\b|((?<=<\/?)[A-Za-z][\w.]*)|([a-zA-Z_][\w-]*(?==(?!=))|\b[A-Za-z_$][\w$]*(?=\())/g;
const tokenKinds=['comment','string','keyword','constant','tag','function'];
/** A small line tokenizer: enough for documentation samples, not a full parser. */
function highlight(line:string):ReactNode[]{
  const parts:ReactNode[]=[];let last=0;
  for(const match of line.matchAll(tokenPattern)){
    const index=match.index;
    if(index>last)parts.push(line.slice(last,index));
    const kind=tokenKinds[match.slice(1).findIndex(Boolean)];
    parts.push(<span key={index} className={'mk-token-'+kind}>{match[0]}</span>);
    last=index+match[0].length;
  }
  if(last<line.length)parts.push(line.slice(last));
  return parts;
}

export interface CodeProps extends ComponentPropsWithRef<'code'> {
  /** Renders inside a line of text instead of as a block. */
  inline?:boolean;
  children:string;
}
export function Code({inline=false,children,className='',...props}:CodeProps){
  const code=<code {...props} className={`mk-code${inline?' mk-code-inline':''}${className?` ${className}`:''}`}>{inline?children:children.split('\n').map((line,index)=><span className="mk-code-text" key={index}>{highlight(line)}{'\n'}</span>)}</code>;
  return inline?code:<pre className="mk-code-block" tabIndex={0}>{code}</pre>;
}

export interface CodeBlockLanguage {id:string;label:string;code:string}
export interface CodeBlockProps extends Omit<ComponentPropsWithRef<'figure'>,'children'> {
  code?:string;
  languages?:CodeBlockLanguage[];
  /** select keeps the header compact; tabs shows every language at once. */
  languageSwitcher?:'select'|'tabs';
  filename?:string;
  highlightLines?:number[];
  addedLines?:number[];
  removedLines?:number[];
  /** Makes each line number a link to that line. */
  linkableLines?:boolean;
}
export function CodeBlock({code='',languages,languageSwitcher='select',filename,highlightLines=[],addedLines=[],removedLines=[],linkableLines=false,className='',...props}:CodeBlockProps){
  const id=useId().replace(/[^a-zA-Z0-9]/g,'');
  const [language,setLanguage]=useState(languages?.[0]?.id);
  const source=languages?.find(item=>item.id===language)?.code??code;
  const lines=source.replace(/\n$/,'').split('\n');
  const copyable=source.split('\n').filter((_,index)=>!removedLines.includes(index+1)).join('\n');
  const showSelect=languages&&languageSwitcher==='select';
  return <figure {...props} className={`mk-code-block-frame${className?` ${className}`:''}`}>
    {(filename||showSelect)&&<figcaption className="mk-code-block-header">{filename&&<span className="mk-code-block-file">{filename}</span>}{showSelect&&<label className="mk-code-block-select"><span className="mk-sr-only">Lenguaje</span><select value={language} onChange={event=>setLanguage(event.target.value)}>{languages.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}</figcaption>}
    {languages&&languageSwitcher==='tabs'&&<div className="mk-code-block-tabs"><Tabs label="Lenguaje" active={language??''} onChange={setLanguage} tabs={languages.map(item=>({id:item.id,label:item.label}))}/></div>}
    <div className="mk-code-block-body">
      <pre tabIndex={0}><code>{lines.map((line,index)=>{
        const number=index+1;const state=addedLines.includes(number)?'added':removedLines.includes(number)?'removed':highlightLines.includes(number)?'highlighted':undefined;
        return <span key={number} id={linkableLines?`${id}-L${number}`:undefined} className={`mk-code-line${state?` is-${state}`:''}`}>
          {linkableLines?<a className="mk-code-gutter" href={`#${id}-L${number}`} aria-label={`Enlace a la línea ${number}`}>{number}</a>:<span className="mk-code-gutter" aria-hidden="true">{number}</span>}
          <span className="mk-code-sign" aria-hidden="true">{state==='added'?'+':state==='removed'?'−':''}</span>
          {(state==='added'||state==='removed')&&<span className="mk-sr-only">{state==='added'?'Línea añadida: ':'Línea eliminada: '}</span>}
          <span className="mk-code-text">{highlight(line)}{'\n'}</span>
        </span>;
      })}</code></pre>
      <CopyButton value={copyable} label="Copiar código"/>
    </div>
  </figure>;
}

export interface CodeDisclosureProps extends Omit<ComponentPropsWithRef<'details'>,'children'> {
  code:string;
  label?:string;
  openLabel?:string;
}
/** The code panel of each documentation example. It renders only once opened. */
export function CodeDisclosure({code,label='Ver código',openLabel='Ocultar código',className='',onToggle,...props}:CodeDisclosureProps){
  const [open,setOpen]=useState(false);
  return <details {...props} className={`mk-code-disclosure ${className}`} onToggle={event=>{setOpen(event.currentTarget.open);onToggle?.(event);}}><summary>{open?openLabel:label}</summary>{open&&<CodeBlock code={code}/>}</details>;
}

export interface SnippetProps extends Omit<ComponentPropsWithRef<'div'>,'onCopy'> {
  text:string|string[];
  prompt?:boolean;
  /** Ink panel with a lime prompt, in both themes. */
  inverted?:boolean;
  tone?:'default'|'success'|'warning'|'error';
  width?:string|number;
  copied?:boolean;
  onCopy?:()=>void;
}
export function Snippet({text,prompt=true,inverted=false,tone='default',width,copied,onCopy,className='',style,...props}:SnippetProps){
  const lines=Array.isArray(text)?text:[text];
  return <div {...props} className={`mk-snippet mk-snippet-${tone}${inverted?' mk-snippet-inverted':''}${className?` ${className}`:''}`} style={{width,...style}}>
    <pre tabIndex={0}><code>{lines.map((line,index)=><span key={index}>{prompt&&<span className="mk-snippet-prompt" aria-hidden="true">$ </span>}{line}{'\n'}</span>)}</code></pre>
    <CopyButton value={lines.join('\n')} label="Copiar comando" copied={copied} onCopy={onCopy}/>
  </div>;
}

export interface TextWithCopyButtonProps extends Omit<ComponentPropsWithRef<'span'>,'onCopy'> {
  text:string;
  size?:'sm'|'md';
  label?:string;
  onCopy?:()=>void;
}
export function TextWithCopyButton({text,size='md',label,onCopy,className='',...props}:TextWithCopyButtonProps){
  return <span {...props} className={`mk-text-copy mk-text-copy-${size}${className?` ${className}`:''}`}><span className="mk-text-copy-value">{text}</span><CopyButton value={text} label={label??`Copiar ${text}`} onCopy={onCopy}/></span>;
}

export interface KbdProps extends ComponentPropsWithRef<'kbd'> {
  meta?:boolean;
  shift?:boolean;
  alt?:boolean;
  ctrl?:boolean;
  small?:boolean;
}
/** meta shows ⌘ on Apple devices and Ctrl elsewhere. */
export function Kbd({meta=false,shift=false,alt=false,ctrl=false,small=false,children,className='',...props}:KbdProps){
  const [apple,setApple]=useState(false);
  useEffect(()=>{setApple(/Mac|iPhone|iPad/.test(navigator.platform));},[]);
  const keys:[string,string][]=[];
  if(meta)keys.push(apple?['⌘','Comando']:['Ctrl','Control']);
  if(ctrl)keys.push(apple?['⌃','Control']:['Ctrl','Control']);
  if(alt)keys.push(apple?['⌥','Opción']:['Alt','Alt']);
  if(shift)keys.push(['⇧','Mayús']);
  const spoken=[...keys.map(key=>key[1]),typeof children==='string'?children:''].filter(Boolean).join(' ');
  return <kbd {...props} className={`mk-kbd${small?' mk-kbd-small':''}${className?` ${className}`:''}`}>{spoken&&<span className="mk-sr-only">{spoken}</span>}{keys.map((key,index)=><span key={index} aria-hidden="true">{key[0]}</span>)}{children!=null&&<span aria-hidden={spoken?true:undefined}>{children}</span>}</kbd>;
}

export interface MiddleTruncateProps extends Omit<ComponentPropsWithRef<'span'>,'children'> {
  text:string;
}
export function MiddleTruncate({text,className='',title,...props}:MiddleTruncateProps){
  const root=useRef<HTMLSpanElement>(null);
  const [visible,setVisible]=useState(text);
  useLayoutEffect(()=>{
    const node=root.current;if(!node)return;
    const context=document.createElement('canvas').getContext('2d');
    function fit(){
      if(!node||!context)return;
      const style=getComputedStyle(node);
      context.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const available=node.clientWidth;
      if(context.measureText(text).width<=available){setVisible(text);return;}
      let low=2;let high=text.length-1;let best=`${text[0]}…${text.at(-1)}`;
      while(low<=high){
        const keep=Math.floor((low+high)/2);
        const candidate=`${text.slice(0,Math.ceil(keep/2))}…${text.slice(text.length-Math.floor(keep/2))}`;
        if(context.measureText(candidate).width<=available){best=candidate;low=keep+1;}else high=keep-1;
      }
      setVisible(best);
    }
    fit();
    const observer=new ResizeObserver(fit);observer.observe(node);
    void document.fonts?.ready.then(fit);
    return ()=>observer.disconnect();
  },[text]);
  return <span ref={root} title={title??(visible===text?undefined:text)} {...props} className={`mk-middle-truncate${className?` ${className}`:''}`}><span className="mk-sr-only">{text}</span><span aria-hidden="true">{visible}</span></span>;
}

export function makeJsonViewHighlightPattern(terms:string[]){
  const clean=terms.map(term=>term.trim()).filter(Boolean).map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return clean.length?new RegExp(`(${clean.join('|')})`,'gi'):undefined;
}
type JsonRow={path:string;depth:number;name?:string;kind:'open'|'close'|'value';value?:unknown;brackets?:string;expanded?:boolean;comma:boolean;inline?:boolean};
const isContainer=(value:unknown):value is object=>typeof value==='object'&&value!==null;
function isInlinable(value:object){
  const entries=Object.entries(value);
  return !Array.isArray(value)&&entries.length===1&&!isContainer(entries[0][1])&&String(entries[0][1]).length<=32;
}
function buildRows(value:unknown,open:Set<string>,path='$',depth=0,name?:string,comma=false,rows:JsonRow[]=[]){
  if(!isContainer(value)){rows.push({path,depth,name,kind:'value',value,comma});return rows;}
  const entries=Object.entries(value);const brackets=Array.isArray(value)?'[]':'{}';
  if(!entries.length||isInlinable(value)){rows.push({path,depth,name,kind:'value',value,comma,inline:true});return rows;}
  const expanded=open.has(path);
  rows.push({path,depth,name,kind:'open',brackets,expanded,comma});
  if(expanded){
    entries.forEach(([key,item],index)=>buildRows(item,open,`${path}.${key}`,depth+1,Array.isArray(value)?undefined:key,index<entries.length-1,rows));
    rows.push({path:`${path}:close`,depth,kind:'close',brackets,comma});
  }
  return rows;
}
function initialOpen(value:unknown,limit:number,path='$',depth=0,set=new Set<string>()){
  if(!isContainer(value)||depth>=limit)return set;
  set.add(path);
  Object.entries(value).forEach(([key,item])=>initialOpen(item,limit,`${path}.${key}`,depth+1,set));
  return set;
}
function Highlighted({text,pattern}:{text:string;pattern?:RegExp}){
  if(!pattern)return <>{text}</>;
  return <>{text.split(new RegExp(pattern.source,pattern.flags)).map((part,index)=>index%2?<mark key={index}>{part}</mark>:part)}</>;
}
function primitive(value:unknown,pattern?:RegExp):ReactNode{
  if(isContainer(value)){
    const entries=Object.entries(value);
    if(!entries.length)return <span className="mk-json-punctuation">{Array.isArray(value)?'[]':'{}'}</span>;
    const [key,item]=entries[0];
    return <><span className="mk-json-punctuation">{'{ '}</span><span className="mk-json-key"><Highlighted text={key} pattern={pattern}/></span><span className="mk-json-punctuation">: </span>{primitive(item,pattern)}<span className="mk-json-punctuation">{' }'}</span></>;
  }
  const kind=value===null?'null':typeof value;
  return <span className={`mk-json-${kind}`}><Highlighted text={typeof value==='string'?JSON.stringify(value):String(value)} pattern={pattern}/></span>;
}
export interface JsonViewProps extends ComponentPropsWithRef<'div'> {
  value:unknown;
  /** Levels strictly below this depth start expanded. */
  defaultExpandDepth?:number;
  highlightPattern?:RegExp;
  /** Flows with the surrounding text. */
  embedded?:boolean;
  label?:string;
}
export function JsonView({value,defaultExpandDepth=Number.POSITIVE_INFINITY,highlightPattern,embedded=false,label='Datos JSON',className='',...props}:JsonViewProps){
  const [open,setOpen]=useState(()=>initialOpen(value,defaultExpandDepth));
  const [active,setActive]=useState('$');
  const root=useRef<HTMLDivElement>(null);
  const rows=useMemo(()=>buildRows(value,open,'$',0),[value,open]);
  const items=rows.filter(row=>row.kind!=='close');
  const current=items.some(row=>row.path===active)?active:'$';
  function toggle(path:string,force?:boolean){setOpen(previous=>{const next=new Set(previous);if(force??!next.has(path))next.add(path);else next.delete(path);return next;});}
  function focusRow(path:string){setActive(path);queueMicrotask(()=>root.current?.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"]`)?.focus());}
  function navigate(event:KeyboardEvent,row:JsonRow){
    const index=items.findIndex(item=>item.path===row.path);
    const go=(path?:string)=>{event.preventDefault();if(path)focusRow(path);};
    if(event.key==='ArrowDown')go(items[index+1]?.path);
    else if(event.key==='ArrowUp')go(items[index-1]?.path);
    else if(event.key==='Home')go(items[0]?.path);
    else if(event.key==='End')go(items.at(-1)?.path);
    else if(event.key==='ArrowRight'&&row.kind==='open'){event.preventDefault();if(row.expanded)go(items[index+1]?.path);else toggle(row.path,true);}
    else if(event.key==='ArrowLeft'){event.preventDefault();if(row.kind==='open'&&row.expanded)toggle(row.path,false);else if(row.depth>0)focusRow(row.path.slice(0,row.path.lastIndexOf('.')));}
    else if((event.key==='Enter'||event.key===' ')&&row.kind==='open'){event.preventDefault();toggle(row.path);}
  }
  const name=(row:JsonRow)=>row.name!==undefined&&<><span className="mk-json-key"><Highlighted text={row.name} pattern={highlightPattern}/></span><span className="mk-json-punctuation">: </span></>;
  const comma=(row:JsonRow)=>row.comma&&<span className="mk-json-punctuation">,</span>;
  return <div ref={root} role="tree" aria-label={label} {...props} className={`mk-json-view${embedded?' mk-json-view-embedded':''}${className?` ${className}`:''}`}>
    {rows.map(row=>{
      if(row.kind==='close')return <div role="none" key={row.path} className="mk-json-row" style={{'--json-depth':row.depth} as React.CSSProperties}><span className="mk-json-punctuation">{row.brackets?.[1]}</span>{comma(row)}</div>;
      return <div role="treeitem" key={row.path} data-path={row.path} aria-level={row.depth+1} aria-expanded={row.kind==='open'?row.expanded:undefined} tabIndex={row.path===current?0:-1} className="mk-json-row" style={{'--json-depth':row.depth} as React.CSSProperties} onFocus={()=>setActive(row.path)} onKeyDown={event=>navigate(event,row)}>
        {row.kind==='open'&&<button type="button" tabIndex={-1} aria-hidden="true" className="mk-json-toggle" data-expanded={row.expanded} onClick={()=>{toggle(row.path);setActive(row.path);}}><Icon name="chevron-down" size={16}/></button>}
        {name(row)}
        {row.kind==='value'?primitive(row.value,highlightPattern):<span className="mk-json-punctuation">{row.expanded?row.brackets?.[0]:`${row.brackets?.[0]}…${row.brackets?.[1]}`}</span>}
        {(row.kind==='value'||!row.expanded)&&comma(row)}
      </div>;
    })}
  </div>;
}
