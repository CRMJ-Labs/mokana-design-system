import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';
import mapping from '../figma-map.json';
const preview: Preview = {
  globalTypes: { theme: { description: 'Tema Mokana', toolbar: { icon: 'circlehollow', items: [{value:'light',title:'Claro'},{value:'dark',title:'Oscuro'}], dynamicTitle: true }}},
  initialGlobals: { theme: 'light' },
  decorators: [(Story, context) => { const item=mapping.components.find(item=>item.story===context.id);return <div className="mk" data-theme={context.globals.theme} data-product="mokana">{item&&<p style={{fontSize:12,marginBottom:24}}><a href={item.figmaUrl} target="_blank" rel="noreferrer">Ver {item.export} en Figma ↗</a></p>}<Story /></div>;}],
  parameters: { layout: 'fullscreen', controls: { expanded: true }, a11y: { test: 'error' }, options: { storySort: { order: ['Inicio', 'Brand Foundations', 'UI Foundations', 'Components', 'Patterns', 'Product Themes'] }}},
};
export default preview;
