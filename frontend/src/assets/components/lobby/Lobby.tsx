import { useState, FC, useEffect } from 'react';
import { LobbyMessage } from '../../types/types';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import { quitGame } from '../../helpers/gameControls';
import Playerlist from './Playerlist';
import Button from '../reusable/Button';
import Toggle from '../reusable/Toggle';
import ThreeOptionSlider from '../reusable/ThreeOptionSlider';
import BotPlayers from './BotPlayers';
import { SocketEvent } from '../../types/enums';

const Lobby: FC = () => {
  const [stateMessage, setStateMessage] = useState<LobbyMessage>('');
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(true);

  const {
    gameState,
    setGameState,
    setViewState,
    socket,
    setGameEventMessages,
    timer,
  } = useGameState();
  const playersList = gameState.players;
  const isHost = gameState.host == gameState.me;
  const additionalMessage = gameState.lobbyMessage;
  const roundInMins = timer.roundDuration / 60;

  useEffect(() => {
    if (playersList.length === 1) {
      setStateMessage('Waiting for others to join the game...');
    } else {
      if (isHost) {
        setStateMessage('Start the game when everyone is ready!');
      } else {
        setStateMessage('Waiting for the host to start the game...');
      }
    }
  }, [playersList, isHost]);

  return (
    <div id="lobby" className="contentBox flexColumn">
      <h1>Game Lobby</h1>

      <div className="flexColumn playerList">
        <h2 className="margin10 center">Players:</h2>
        {isMultiplayer ? (
          <Playerlist />
        ) : (
          <BotPlayers player={playersList[0]} />
        )}
      </div>

      <div className="center">
        {additionalMessage && (
          <p className="margin5 smallFont">{additionalMessage}</p>
        )}
        <p className="margin5 smallFont">{stateMessage}</p>
        {!isHost && (
          <p className="margin5 smallFont">
            Round duration: {roundInMins} minutes
          </p>
        )}
      </div>

      {isHost && <div className="divider"></div>}

      <div className="flexRow flexSpaceBetween margin0">
        <Button
          imageSRC="images/buttons/stopButton.png"
          alt="Quit Game"
          onClick={() =>
            quitGame({
              socket,
              setGameState,
              setViewState,
              setGameEventMessages,
            })
          }
          tooltip="Leave the game"
        />

        {isHost && (
          <>
            <div className="center width190">
              <p className="margin0 smallFont">Game Mode:</p>
              <Toggle
                isMultiplayer={isMultiplayer}
                onToggle={() => {
                  setIsMultiplayer(!isMultiplayer);
                  socket.emit(SocketEvent.TogglePlayMode);
                }}
              />
              {isMultiplayer ? (
                <p className="margin0 smallFont">Multiplayer mode enabled!</p>
              ) : (
                <p className="margin0 smallFont">Singleplayer mode enabled!</p>
              )}
            </div>

            <div className="center width190">
              <p className="margin0 smallFont">Round Duration (min):</p>
              <ThreeOptionSlider />
            </div>

            <Button
              imageSRC={
                playersList.length < 2
                  ? 'images/buttons/playButtonDisabled.png'
                  : 'images/buttons/playButton.png'
              }
              alt="Start Game"
              disabled={playersList.length < 2}
              onClick={() => socket.emit(SocketEvent.StartGame)}
              tooltip="Start the game"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Lobby;
