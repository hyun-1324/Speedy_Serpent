import { FC } from "react";
import { useGameState } from "../../contexts/gameState/GameStateContext";

const ScoreList: FC = () => {
  const { gameState } = useGameState();
  const me = gameState.me;
  const host = gameState.host;
  const scoresList = gameState.finalScores;

  return (
    <>
      {scoresList.map((player) => {
        const quit = player.playerLeft;
        return (
          <div
            key={player.name}
            className={`playerBox ${player.color}`}>

            <section className="flexRow allignCenter justifyCenter" >
              <section className="scoreSection">
              {player.name === host &&
                <img
                  src="images/starYellow.png"
                  className="scoreBoardIcon"
                  alt="Leader" />
              }
              {quit &&
                <img
                  src="images/icons/cross.png"
                  className="crossIcon"
                  alt="Quit" />
              }
              </section>

              <span
                className={player.name === me ? "bold" : ""}>
                  {player.name}
              </span>
            </section>

            <span>{player.score}</span>
          </div>
        );
      })}
    </>
  );
};

export default ScoreList;