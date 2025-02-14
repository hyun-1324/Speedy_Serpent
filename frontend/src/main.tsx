// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './css/index.css'
import { GameStateProvider } from './assets/contexts/gameState/GameStateContext.tsx';

createRoot(document.getElementById('root')!).render(
  //<StrictMode>

      <GameStateProvider>
        <App />
      </GameStateProvider>

  //</StrictMode>,
)
