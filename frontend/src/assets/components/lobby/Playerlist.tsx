import { FC } from 'react';

import { useGameState } from '../../contexts/gameState/GameStateContext';

const Playerlist: FC = () => {
  const { gameState } = useGameState();
  const host = gameState.host;
  const players = gameState.players;
  const me = gameState.me;

  return (
    <>
      {players.map((player) => (
        <div
          key={player.name}
          className={`${player.color} playerBox`} >
          {<span className={player.name === me ? "bold" : ""} >{player.name}</span>}
          {host === player.name &&
            <img
              src="images/starYellow.png"
              className="leaderIcon"
              alt="Leader" />}
        </div>
      ))}
    </>
  );
};

export default Playerlist;