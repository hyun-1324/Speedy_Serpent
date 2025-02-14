import { FC, useState } from "react";
import Button from "../reusable/Button";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import { fullScreen } from "../../helpers/gameControls";
import { SocketEvent } from "../../types/enums";


const Timer: FC = () => {
  const { timer, socket } = useGameState();
  const [ fullScreenOn, setFullScreenOn ] = useState<boolean>(false);

  return (
    <div className="contentBox sideBox sideBoxLeft flexColumn allignCenter">
      <div className="timer bold">
        {timer.timeLeft}
      </div>
      <Button
        onClick={() => socket.emit(SocketEvent.TogglePause)}
        imageSRC="images/buttons/pause.png"
        alt="Pause"
        tooltip="Pause the game"
      />
      <Button
        imageSRC="images/buttons/textButton.png"
        alt="Fullscreen"
        classes="textButton"
        onClick={() => fullScreen(setFullScreenOn)}
        text={fullScreenOn ? "Exit Full screen" : "Full screen"}
      />
    </div>
  );
};

export default Timer;