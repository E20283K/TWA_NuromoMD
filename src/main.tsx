import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const tg = (window as any).Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  // Try to request fullscreen if supported (v7.7+)
  // if (typeof tg.requestFullscreen === 'function') {
  //   tg.requestFullscreen();
  // }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
