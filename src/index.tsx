import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// ====================================================================
// FILTRO GLOBAL: Silenciar AbortError do Supabase SDK
// O React 18 StrictMode e navegação rápida causam cancelamento de fetch
// interno na biblioteca Supabase. Esses erros são INTENCIONAIS e seguros.
// Sem este filtro, eles aparecem como "Uncaught (in promise)" no console.
// ====================================================================
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'AbortError' ||
    (event.reason instanceof DOMException && event.reason.name === 'AbortError') ||
    (typeof event.reason?.message === 'string' && event.reason.message.includes('signal is aborted'))
  ) {
    event.preventDefault(); // Impede que o erro apareça no console
  }
});
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);