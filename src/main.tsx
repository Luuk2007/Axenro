import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Hide splash screen after app mounts
const hideSplash = () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    setTimeout(() => splash.remove(), 500);
  }
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Hide splash after a short delay to ensure first paint
requestAnimationFrame(() => {
  setTimeout(hideSplash, 800);
});
