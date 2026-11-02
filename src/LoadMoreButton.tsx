import type {ComponentPropsWithRef, ReactNode} from 'react';
import './load-more-button.css';

export interface LoadMoreButtonProps extends ComponentPropsWithRef<'button'> {
  loading?: boolean;
  loadingText?: ReactNode;
  noGap?: boolean;
  noBorderRadius?: boolean;
}

/** Full-width pagination action. The caller owns fetching and appending items. */
export function LoadMoreButton({loading=false,loadingText='Cargando…',noGap=false,noBorderRadius=false,children='Cargar más',disabled=false,className='',type='button',...props}:LoadMoreButtonProps){
  return <button {...props} type={type} disabled={disabled||loading} aria-busy={loading} className={`mk-load-more${noGap?' mk-load-more-no-gap':''}${noBorderRadius?' mk-load-more-square':''}${className?` ${className}`:''}`}>
    {loading&&<span className="mk-load-more-spinner" aria-hidden="true"/>}
    <span>{loading?loadingText:children}</span>
  </button>;
}
