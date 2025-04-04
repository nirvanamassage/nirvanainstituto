import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initGA, initializeTracking } from './lib/analytics';

// Inicializa o Google Analytics
initGA();

// Componente que envolve o App com analytics
function AppWithAnalytics() {
  React.useEffect(() => {
    // Inicializa todos os rastreamentos
    initializeTracking();
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithAnalytics />
    </BrowserRouter>
  </React.StrictMode>
);