import { FC } from "react";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import Button from "../reusable/Button";
import { quitGame } from "../../helpers/gameControls";
import { SocketEvent } from "../../types/enums";

const Pausemenu: FC = () => {
  const { gameState, setGameState, setViewState, socket, setGameEventMessages } = useGameState();

  const pauser = gameState.pause.playerName;
  const me = gameState.me;
  const isPauser = pauser === me;
  const isHost = gameState.host === me;

  return (
    <div className="pauseMenu">
      <div className="pauseBackGround">
        <h1>Paused</h1>
        <p>{isPauser ? "You" : pauser} paused the game.</p>
        <div className="flexRow flexSpaceBetween">
          <Button
            alt="Resume game"
            imageSRC="images/buttons/playButton.png"
            onClick={() => socket.emit(SocketEvent.TogglePause)}
            tooltip="Resume game"
          />
          {isHost &&
          <>
            <Button
              alt="Restart game"
              imageSRC="images/buttons/restartButton.png"
              onClick={() => socket.emit(SocketEvent.StartGame)}
              tooltip="Restart the game"
            />
            <Button
              alt="Back to lobby"
              imageSRC="images/buttons/toLobby.png"
              onClick={() => socket.emit(SocketEvent.BackToLobby)}
              tooltip="Quit game and return to lobby"
            />
          </>
          }
          <Button
            alt="Quit game"
            imageSRC="images/buttons/stopButton.png"
            onClick={() => quitGame({socket, setGameState, setViewState, setGameEventMessages})}
            tooltip="Leave the game"
          />
        </div>
      </div>

    </div>
  );
}

export default Pausemenu;