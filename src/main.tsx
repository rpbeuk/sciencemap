import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd;">
      <h2>Error</h2>
      <p>${event.error?.message || 'Unknown error'}</p>
      <pre>${event.error?.stack || ''}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd;">
      <h2>Unhandled Promise Rejection</h2>
      <p>${event.reason?.message || String(event.reason)}</p>
    </div>`;
  }
});

console.log('ScienceMap is starting...');

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  console.log('Root element found, creating React root...');
  
  const reactRoot = createRoot(root);
  
  console.log('Rendering App component...');
  
  reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  
  console.log('App rendered successfully');
} catch (error: any) {
  console.error('Fatal error during React initialization:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd;">
      <h2>React Initialization Error</h2>
      <p>${error?.message || String(error)}</p>
      <pre>${error?.stack || ''}</pre>
    </div>`;
  }
}
