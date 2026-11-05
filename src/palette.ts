import {defaultPaletteColors,defaultPaletteSeeds} from './palette-defaults.generated';

export type PaletteToken=keyof typeof defaultPaletteColors.light;
export type PaletteColors=Record<PaletteToken,string>;
export interface Palette {light:PaletteColors;dark:PaletteColors}
export interface PaletteOptions {
  /** Brand seed in #RGB or #RRGGBB format. */
  brand:string;
  accent?:string;
  /** Optional seed for tinted surfaces and text. */
  neutral?:string;
  success?:string;
  warning?:string;
  error?:string;
  info?:string;
  /** Optional semantic overrides for a specific mode. */
  light?:Partial<PaletteColors>;
  dark?:Partial<PaletteColors>;
}
type RGB=[number,number,number];
function rgb(value:string):RGB {
  if(!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value))throw new TypeError(`Invalid palette color "${value}". Use #RGB or #RRGGBB.`);
  const hex=value.length===4?value.slice(1).split('').map(c=>c+c).join(''):value.slice(1);
  return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)) as RGB;
}
function hex(color:RGB){return '#'+color.map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');}
/** Convert upstream OKLCH neutrals only when deriving an explicitly custom palette. */
function cssRGB(value:string):RGB {
  if(value.startsWith('#'))return rgb(value);
  const match=value.match(/^oklch\(([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)\)$/);
  if(!match)throw new TypeError(`Unsupported palette base color: ${value}`);
  const lightness=Number(match[1])/(match[2]?100:1),chroma=Number(match[3]),hue=Number(match[4])*Math.PI/180;
  const a=chroma*Math.cos(hue),b=chroma*Math.sin(hue);
  const l=(lightness+.3963377774*a+.2158037573*b)**3,m=(lightness-.1055613458*a-.0638541728*b)**3,s=(lightness-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s]
    .map(channel=>Math.max(0,Math.min(1,channel<=.0031308?12.92*channel:1.055*channel**(1/2.4)-.055))*255) as RGB;
}
function mix(a:string,b:string,weight:number){const first=cssRGB(a),second=cssRGB(b);return hex(first.map((value,i)=>value*(1-weight)+second[i]*weight) as RGB);}
function luminance(color:string){const [r,g,b]=cssRGB(color).map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function readable(seed:string,background:string){
  const target=luminance(background)>.5?'#000000':'#ffffff';
  for(let step=0;step<=100;step++){const color=mix(seed,target,step/100);if(contrast(color,background)>=5.5)return color;}
  return target;
}
function on(color:string){return contrast(color,'#ffffff')>=contrast(color,'#000000')?'#ffffff':'#000000';}

/** Derives semantic colors and readable foregrounds from one product palette. */
export function createPalette(options:PaletteOptions):Palette {
  const seeds={...defaultPaletteSeeds,...options,accent:options.accent??options.brand};
  for(const key of ['brand','accent','neutral','success','warning','error','info'] as const)if(seeds[key])rgb(seeds[key]);
  const result={} as Palette;
  for(const mode of ['light','dark'] as const){
    const dark=mode==='dark';
    const defaults=defaultPaletteColors[mode];
    const background=options.neutral?mix(options.neutral,dark?'#000000':'#ffffff',dark?.94:.98):hex(cssRGB(defaults.background));
    const surface=options.neutral?mix(options.neutral,dark?'#000000':'#ffffff',dark?.87:1):hex(cssRGB(defaults.surface));
    const foreground=options.neutral?mix(options.neutral,dark?'#ffffff':'#000000',.9):hex(cssRGB(defaults.foreground));
    const secondary=options.neutral?readable(mix(foreground,surface,.35),surface):hex(cssRGB(defaults.secondary));
    const brand=readable(seeds.brand,surface);
    const accent=readable(seeds.accent??seeds.brand,surface);
    const success=readable(seeds.success,surface),warning=readable(seeds.warning,surface),error=readable(seeds.error,surface),info=readable(seeds.info,surface);
    const inverse=options.neutral?mix(options.neutral,dark?'#ffffff':'#000000',.94):hex(cssRGB(dark?defaultPaletteColors.light.surface:defaultPaletteColors.light['inverse-background']));
    const inverseText=on(inverse);
    const custom:Partial<PaletteColors>={
      accent:brand,'accent-foreground':on(brand),muted:secondary,default:mix(foreground,surface,.92),'default-foreground':foreground,
      'surface-foreground':foreground,'surface-secondary':mix(foreground,surface,.97),'surface-secondary-foreground':foreground,
      'surface-tertiary':mix(foreground,surface,.94),'surface-tertiary-foreground':foreground,'surface-hover':mix(foreground,surface,.92),
      overlay:surface,'overlay-foreground':foreground,'background-secondary':mix(foreground,background,.96),'background-tertiary':mix(foreground,background,.92),'background-inverse':foreground,
      'field-background':surface,'field-foreground':foreground,'field-placeholder':secondary,'field-border':mix(foreground,surface,.82),
      'field-hover':mix(foreground,surface,.97),'field-focus':surface,'field-border-hover':brand,'field-border-focus':brand,
      segment:surface,'segment-foreground':foreground,border:mix(foreground,surface,.82),separator:mix(foreground,surface,.82),
      'separator-secondary':mix(foreground,surface,.78),'separator-tertiary':mix(foreground,surface,.66),
      'border-secondary':mix(foreground,surface,.78),'border-tertiary':mix(foreground,surface,.66),link:foreground,
    };
    for(const [name,color]of Object.entries({accent:brand,success,warning,danger:error,default:custom.default!})){
      Object.assign(custom,{[name]:color,[`${name}-foreground`]:on(color),[`${name}-hover`]:mix(color,surface,.1),
        [`${name}-soft`]:mix(color,surface,.9),[`${name}-soft-foreground`]:name==='default'?foreground:color,[`${name}-soft-hover`]:mix(color,surface,.85)});
    }
    result[mode]={...defaults,...custom,background,surface,foreground,secondary,
      line:mix(foreground,surface,.82),
      'brand-primary':brand,'brand-on-primary':on(brand),'brand-subtle':mix(brand,surface,.9),
      'accent-text':brand,'info-text':info,focus:brand,
      'action-primary':accent,'action-primary-text':on(accent),
      'action-secondary':brand,'action-secondary-text':on(brand),
      'button-primary-background':brand,'button-primary-text':on(brand),
      'button-secondary-background':custom.default!,'button-secondary-text':brand,'button-ghost-text':foreground,
      'chart-primary':brand,'chart-secondary':accent,
      'selection-background':mix(brand,surface,.88),'selection-text':brand,
      'success-text':success,'success-background':mix(success,surface,.9),'success-solid':success,'success-on-solid':on(success),
      'warning-text':warning,'warning-background':mix(warning,surface,.9),'warning-solid':warning,'warning-on-solid':on(warning),
      'error-text':error,'error-background':mix(error,surface,.9),'error-solid':error,'error-on-solid':on(error),
      'info-background':mix(info,surface,.9),'info-solid':info,'info-on-solid':on(info),
      'inverse-background':inverse,'inverse-text':inverseText,'inverse-secondary':mix(inverseText,inverse,.25),
      'inverse-line':mix(inverseText,inverse,.7),'inverse-accent':readable(seeds.accent??seeds.brand,inverse),
      ...options[mode],
    };
  }
  return result;
}

/** Exact MOK defaults. Do not pass these through custom-palette contrast adjustment. */
export const mokPalette:Palette={light:{...defaultPaletteColors.light},dark:{...defaultPaletteColors.dark}};
