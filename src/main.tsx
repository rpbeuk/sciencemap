import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error: any) {
  const message = error?.message || String(error);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h2>React Initialization Error</h2>
    <p>${message}</p>
    <pre>${error?.stack || ''}</pre>
  </div>`;
  console.error('React error:', error);
}
