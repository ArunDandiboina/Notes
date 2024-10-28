// imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './components/App';
import './index.css';

// render
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
