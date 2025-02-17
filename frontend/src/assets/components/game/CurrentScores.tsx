import { FC, useMemo } from 'react';
import { useGameState } from '../../contexts/gameState/GameStateContext';

const CurrentScores: FC = () => {
  const { gameState } = useGameState();

  const me = useMemo(() => gameState.me, [gameState.me]);
  const host = useMemo(() => gameState.host, [gameState.host]);
  const scoresList = gameState.players;

  return (
    <>
      {scoresList.map(player => {
        return (
          <div key={player.name} className={`playerBox ${player.color}`}>
            <span className={player.name === me ? 'bold' : ''}>
              {player.name}
              {player.name === host && (
                <img
                  src="images/starYellow.png"
                  className="leaderIcon"
                  alt="Leader"
                />
              )}
            </span>
            <span>{player.score}</span>
          </div>
        );
      })}
    </>
  );
};

export default CurrentScores;
