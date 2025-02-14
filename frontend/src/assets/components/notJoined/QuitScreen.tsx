import { FC } from "react";
import Button from "../reusable/Button";
import { reconnect } from "../../helpers/gameControls";
import { useGameState} from "../../contexts/gameState/GameStateContext";

const QuitScreen: FC = () => {
  const { setGameState, setViewState, socket } = useGameState();
  return (
    <div className="contentBox flexColumn allignCenter">
      <h1 className="margin10">Thank you for playing! 🐍</h1>
      <p>Reconnect to the game lobby: </p>
      <Button
        alt="Reconnect"
        imageSRC="images/loading.png"
        onClick={() => reconnect({socket, setGameState, setViewState})}
        />
    </div>
  );
}

export default QuitScreen;