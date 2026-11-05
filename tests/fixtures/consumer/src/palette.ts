import {createPalette,mokPalette} from '@mokanadev/design-system';

// Change this file to define the identity of the whole application.
export const appPalettes={
  mok:mokPalette,
  forest:createPalette({brand:'#15803d'}),
  ocean:createPalette({brand:'#0369a1'}),
};
export type AppPaletteName=keyof typeof appPalettes;
export const defaultAppPalette:AppPaletteName='mok';
