import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { registerSW } from 'virtual:pwa-register';

const dispatchPwaReadyEvent = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('pwa:ready'));
};

registerSW({
  immediate: true,
  onRegisteredSW: (_swUrl, registration) => {
    if (registration?.active) {
      dispatchPwaReadyEvent();
    }
  },
  onRegisterError: (error) => {
    console.error('Service worker registration failed', error);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then(() => {
      dispatchPwaReadyEvent();
    })
    .catch(() => {
      // ignore ready failure
    });

  navigator.serviceWorker.addEventListener('controllerchange', dispatchPwaReadyEvent);
  navigator.serviceWorker.addEventListener('message', (event) => {
    if ((event.data as { type?: string } | undefined)?.type === 'PWA_READY') {
      dispatchPwaReadyEvent();
    }
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
