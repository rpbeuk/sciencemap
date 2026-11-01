import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd; overflow: auto;">
      <h2>Error Caught</h2>
      <p><strong>Message:</strong> ${(event.error?.message || 'Unknown error').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <details style="margin-top: 10px;">
        <summary>Stack trace</summary>
        <pre style="background: #fff; padding: 10px; margin-top: 10px; overflow: auto; max-height: 300px;">${(event.error?.stack || 'No stack').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </details>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd;">
      <h2>Unhandled Promise Rejection</h2>
      <p>${String(event.reason).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>`;
  }
});

console.log('[ScienceMap] Starting...');

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  console.log('[ScienceMap] Creating React root...');
  
  const reactRoot = createRoot(root);
  
  console.log('[ScienceMap] Rendering App component...');
  
  reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  
  console.log('[ScienceMap] Rendered successfully');
} catch (error: any) {
  console.error('[ScienceMap] Fatal error:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #fff3cd;">
      <h2>React Error</h2>
      <p>${(error?.message || String(error)).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <pre style="background: #fff; padding: 10px; margin-top: 10px; overflow: auto;">${(error?.stack || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>`;
  }
}
