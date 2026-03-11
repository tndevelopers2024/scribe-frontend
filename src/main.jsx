import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Anti-Inspect Logic
const antiInspect = () => {
  // Check if bypass is active (localhost or secret flag in localStorage)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasBypass = localStorage.getItem('dev_bypass') === 'true';

  if (isLocalhost || hasBypass) return;

  // Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });

  // Debugger trap
  setInterval(() => {
    debugger;
  }, 1000);
};

// Secret key to toggle bypass: Ctrl + Shift + L
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'L') {
    const currentState = localStorage.getItem('dev_bypass') === 'true';
    localStorage.setItem('dev_bypass', !currentState);
    alert(`Developer bypass ${!currentState ? 'ENABLED' : 'DISABLED'}. Please refresh the page.`);
  }
});

antiInspect();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
