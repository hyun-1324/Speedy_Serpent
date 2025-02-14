import "./css/App.css"
import "./css/Slider.css"
import Logo from "./assets/components/Logo"
import Info from "./assets/components/Info"
import Enter from "./assets/components/entry/Enter"
import QuitScreen from "./assets/components/notJoined/QuitScreen"
import { useGameState } from "./assets/contexts/gameState/GameStateContext"
import Lobby from "./assets/components/lobby/Lobby"
import ErrorJoiningGame from "./assets/components/notJoined/ErrorJoiningGame"
import Loading from "./assets/components/notJoined/Loading"
import InGameView from "./assets/components/game/InGameView"
import ScoreBoard from "./assets/components/scoreboard/ScoreBoard"

function App() {
  const { viewState } = useGameState();
  const status = viewState.status;
  const showInfo = viewState.showInfo;

  return (
    <>
      <Logo />
      {status === "loading" && <Loading />}
      {status === "error" && <ErrorJoiningGame />}
      {status === "notJoined" && <Enter />}
      {status === "lobby" && <Lobby />}
      {status === "quit" && <QuitScreen />}
      {status === "inGame" && <InGameView />}
      {status === "gameOver" && <ScoreBoard />}
      {showInfo && <Info />}
    </>
  )
}

export default App
