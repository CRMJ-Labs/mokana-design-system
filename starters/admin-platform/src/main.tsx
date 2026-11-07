import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';
import {App} from './App';
import './app.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
