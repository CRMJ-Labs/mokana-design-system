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
function mix(a:string,b:string,weight:number){const first=rgb(a),second=rgb(b);return hex(first.map((value,i)=>value*(1-weight)+second[i]*weight) as RGB);}
function luminance(color:string){const [r,g,b]=rgb(color).map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;}
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
    const background=options.neutral?mix(options.neutral,dark?'#000000':'#ffffff',dark?.94:.98):defaults.background;
    const surface=options.neutral?mix(options.neutral,dark?'#000000':'#ffffff',dark?.87:1):defaults.surface;
    const foreground=options.neutral?mix(options.neutral,dark?'#ffffff':'#000000',.9):defaults.foreground;
    const secondary=options.neutral?readable(mix(foreground,surface,.35),surface):defaults.secondary;
    const brand=readable(seeds.brand,surface);
    const accent=readable(seeds.accent??seeds.brand,surface);
    const success=readable(seeds.success,surface),warning=readable(seeds.warning,surface),error=readable(seeds.error,surface),info=readable(seeds.info,surface);
    const inverse=options.neutral?mix(options.neutral,dark?'#ffffff':'#000000',.94):dark?defaultPaletteColors.light.surface:defaultPaletteColors.light['inverse-background'];
    const inverseText=on(inverse);
    result[mode]={...defaults,background,surface,foreground,secondary,
      line:mix(foreground,surface,.82),
      'brand-primary':brand,'brand-on-primary':on(brand),'brand-subtle':mix(brand,surface,.9),
      'accent-text':brand,'info-text':info,focus:brand,
      'action-primary':accent,'action-primary-text':on(accent),
      'action-secondary':brand,'action-secondary-text':on(brand),
      'button-primary-background':brand,'button-primary-text':on(brand),
      'button-secondary-background':surface,'button-secondary-text':foreground,'button-ghost-text':foreground,
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

/** MOK defaults with brand-colored actions, ready for PaletteProvider. */
export const mokPalette=createPalette({brand:defaultPaletteSeeds.brand,accent:defaultPaletteSeeds.accent});
