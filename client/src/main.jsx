import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './styles/responsive.css';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Development helper for seeding test data
if (import.meta.env.DEV) {
  import('./utils/seedTestData.js').then(({ seedTestData }) => {
    window.seedTestData = seedTestData;
    
    // Auto-seed if no data exists
    const existingEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
    if (existingEntries.length === 0) {
      console.log('🌱 No data found, auto-seeding test data...');
      seedTestData();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
