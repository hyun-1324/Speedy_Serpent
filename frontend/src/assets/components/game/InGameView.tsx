import { FC, useMemo, memo } from "react";
import Scores from "./Scores";
import Game from "./Game";
import Timer from "./Timer";
import PauseMenu from "./PauseMenu";
import { useGameState } from "../../contexts/gameState/GameStateContext";

const InGameView: FC = () => {
  const { gameState } = useGameState();

  const paused = useMemo(() => gameState.pause.paused, [gameState.pause.paused]);

  return (
    <>
      <div className="gameView">
        <Scores />
        <Game />
        <Timer />
      </div>
      {paused && <PauseMenu />}
    </>
  );
};

export default memo(InGameView);