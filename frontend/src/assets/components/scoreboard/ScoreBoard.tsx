import { FC } from 'react';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import ScoreList from './ScoreList';
import Button from '../reusable/Button';
import { quitGame } from '../../helpers/gameControls';
import { SocketEvent } from '../../types/enums';

const ScoreBoard: FC = () => {
  const { gameState, setGameState, setViewState, socket, setGameEventMessages} = useGameState();
  const tie = gameState.tie;
  const winner = gameState.winner;

  return (
    <div className="contentBox flexColumn">
      <h1 className="margin10">Game over!</h1>
      {tie
        ? <div className= "winnerBox">
            <h1 className="blackText margin10 largeFont">It's a tie!</h1>
        </div>

        : <div className="winnerBox">
            <h1 className="blackText margin10 largeFont">
                The Winner is{" "}
                <span
                  style={{color: `var(--${winner?.color}1`}}
                  className="bold">
                    {winner?.name}
                </span>
                !
            </h1>
            <div className="flexRow flexSpaceBetween">
              <img className="winnerStar" src="images/starYellow.png" alt="star"/>
              <h2 className="center blackText margin10">{winner?.score} points</h2>
              <img className="winnerStar" src="images/starYellow.png" alt="star"/>
            </div>
          </div>
      }
      <div className="winnerBox">
        <h2 className="blackText center margin5">Scores:</h2>
        <ScoreList />
      </div>

      <div>
        {gameState.host === gameState.me
        ? <p className="center margin10">What should we do next? </p>
        : <p className="center margin10">Waiting for the host to continue...</p>}
      </div>

      <div className="flexRow justifyCenter">
      { gameState.host === gameState.me &&
        <>
        <Button
          alt="Play again"
          imageSRC="images/buttons/playAgainButton.png"
          onClick={() => socket.emit(SocketEvent.StartGame)}
          tooltip="Play again"
        />
        <Button
          alt="Back to lobby"
          imageSRC="images/buttons/toLobby.png"
          onClick={() => socket.emit(SocketEvent.BackToLobby)}
          tooltip="Return to lobby"
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
  )
};

export default ScoreBoard;