import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  if (tg.themeParams) {
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
    document.body.style.color = tg.themeParams.text_color || '#000000';
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
