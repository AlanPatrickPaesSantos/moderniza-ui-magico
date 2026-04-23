import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { API_BASE } from "./lib/api-config";

// --- DIGITAL BRAND | ALAN SANTOS ---
console.log(
  "%c 🚀 DITEL SYSTEM %c Handcrafted by Alan Santos %c v1.0 ",
  "background: #004e9a; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;",
  "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px 8px;",
  "background: #e2e8f0; color: #475569; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;"
);
// -----------------------------------


// --- INTERCEPTADOR GLOBAL DE REDE (SEGURANÇA JWT) ---
// Qualquer chamada 'fetch' feita pelo sistema passará por aqui primeiro para anexar o token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  const isApiRequest = typeof resource === 'string' && (
    resource.startsWith(API_BASE) || 
    resource.startsWith('/api/') || 
    resource.startsWith('http://localhost:5001/api/')
  );

  if (isApiRequest) {
    const token = localStorage.getItem('ditel_token');
    if (token) {
      config = config || {};
      config.headers = {
        ...(config.headers || {}),
        'Authorization': `Bearer ${token}`
      };
    }
  }

  const response = await originalFetch(resource, config as RequestInit);
  
  // Se a API recusar (Token falsificado, expirado ou em falta), desloga o PM na marra
  if (response.status === 401 || response.status === 403) {
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('ditel_token');
      localStorage.removeItem('ditel_user');
      window.location.href = '/login';
    }
  }
  return response;
};
// ----------------------------------------------------

import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
