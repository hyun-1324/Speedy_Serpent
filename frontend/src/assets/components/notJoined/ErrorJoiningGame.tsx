import { FC } from 'react';
import ErrorMessage from '../reusable/ErrorMessage';
import { EntryErrorMessage } from '../../types/types';
import { ErrorType } from '../../types/enums';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import Button from '../reusable/Button';
import { reconnect } from '../../helpers/gameControls';

const ErrorJoiningGame: FC = () => {
  const { gameState, socket, setGameState, setViewState } = useGameState();
  const occuredError = gameState.error;

  let message: EntryErrorMessage = '';
  switch (occuredError) {
    case ErrorType.roomFull:
      message = 'The room you are trying to join is full.';
      break;
    case ErrorType.connectionError:
      message = 'There was an error connecting to the server.';
      break;
    case ErrorType.SinglePlayMode:
      message = 'Multiplayer mode is disabled.';
      break;
    case ErrorType.gameStarted:
      message = 'The game has already started.';
      break;
    default:
      message = '';
      break;
  }

  return (
    <div className="contentBox flexColumn allignCenter">
      <h1>
        Hissss... 🐍 <br /> Something went wrong!
      </h1>
      <ErrorMessage
        error={message}
        iconSRC="images/icons/error.png"
        classes="margin10"
      />
      {occuredError !== ErrorType.connectionError && (
        <>
          <p>Try to join again by pressing the button below.</p>
          <Button
            alt="Reconnect"
            imageSRC="images/loading.png"
            onClick={() => reconnect({ socket, setGameState, setViewState })}
          />
        </>
      )}
    </div>
  );
};

export default ErrorJoiningGame;
