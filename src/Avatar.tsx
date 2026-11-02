import {useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode} from 'react';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>,'children'> {
  name:string;
  size?:'sm'|'md'|'lg'|number;
  src?:string;
  status?:'online'|'away'|'offline';
  letter?:string;
  icon?:ReactNode;
  placeholder?:boolean;
  git?:boolean;
}

const sizes={sm:28,md:36,lg:48};

function GitIdentity({name}:{name:string}){
  let hash=2166136261;
  for(const char of name)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  const cells=[];
  for(let y=0;y<5;y++)for(let x=0;x<3;x++){
    if((hash>>>((y*3+x)%32))&1){
      cells.push(<rect key={`${x}-${y}`} x={x+1} y={y+1} width="1" height="1"/>);
      if(x!==2)cells.push(<rect key={`${4-x}-${y}`} x={5-x} y={y+1} width="1" height="1"/>);
    }
  }
  return <svg aria-hidden="true" viewBox="0 0 7 7" className="mk-avatar-git">{cells}</svg>;
}

export function Avatar({name,size='md',src,status,letter,icon,placeholder=false,git=false,className='',style,...props}:AvatarProps){
  const [failedSrc,setFailedSrc]=useState<string>();
  const pixels=typeof size==='number'?Math.max(16,size):sizes[size];
  const initials=(letter??name.trim().split(/\s+/).slice(0,2).map(part=>part[0]??'').join('')).toLocaleUpperCase().slice(0,2);
  const accessibleName=placeholder?`Cargando avatar de ${name}`:[name,status?{online:'En línea',away:'Ausente',offline:'Desconectado'}[status]:null].filter(Boolean).join(' · ');
  return <span {...props} className={`mk-avatar${placeholder?' mk-avatar-placeholder':''} ${className}`} role="img" aria-label={props['aria-label']??accessibleName} title={props.title??name} style={{width:pixels,height:pixels,fontSize:Math.round(pixels*.32),...style}}>
    <span className="mk-avatar-content" aria-hidden="true">
      {!placeholder&&(src&&failedSrc!==src?<img src={src} alt="" onError={()=>setFailedSrc(src)}/>:icon??(git?<GitIdentity name={name}/>:initials))}
    </span>
    {status&&!placeholder&&<i className={`mk-avatar-status mk-avatar-${status}`} aria-hidden="true"/>}
  </span>;
}

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<'span'>,'children'> {
  members:AvatarProps[];
  size?:AvatarProps['size'];
  max?:number;
  reverse?:boolean;
  overlap?:'auto'|number;
  label?:string;
}

export function AvatarGroup({members,size='md',max=4,reverse=false,overlap='auto',label,className='',style,...props}:AvatarGroupProps){
  const pixels=typeof size==='number'?Math.max(16,size):sizes[size];
  const count=Math.max(1,Math.floor(max));
  const visible=members.slice(0,count);
  const remaining=members.length-visible.length;
  const spacing=overlap==='auto'?pixels*.25:Math.max(0,Math.min(overlap,pixels-4));
  const groupLabel=label??`${members.map(member=>member.name).join(', ')} · ${members.length} personas`;
  return <span {...props} className={`mk-avatar-group ${className}`} role="img" aria-label={props['aria-label']??groupLabel} style={{'--avatar-overlap':`${spacing}px`,...style} as CSSProperties}>
    {visible.map((member,index)=><span className="mk-avatar-group-member" aria-hidden="true" key={`${member.name}-${index}`} style={{zIndex:reverse?index+1:visible.length-index+1}}><Avatar {...member} size={size}/></span>)}
    {remaining>0&&<span className="mk-avatar-group-member mk-avatar-overflow" aria-hidden="true" style={{width:pixels,height:pixels,fontSize:Math.round(pixels*.3)}} title={`${remaining} personas más`}>+{remaining}</span>}
  </span>;
}
