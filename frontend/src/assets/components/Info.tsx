import { FC } from 'react';
import Button from './reusable/Button';
import { useGameState } from '../contexts/gameState/GameStateContext';

const Info: FC = () => {
  const { setViewState } = useGameState();

  return (
    <div className="pauseMenu">
      <div className="infoBackGround">
        <Button
          alt="Back"
          imageSRC="images/icons/error.png"
          classes="smallButton marginLeftAuto"
          onClick={() => setViewState(prev => ({ ...prev, showInfo: false }))}
        />
        <h1>How to Play</h1>

        <h2>Game Controls</h2>
        <ul>
          <li>Use arrow keys or WASD to control your snake's direction</li>
          <li>Press Space to pause/resume the game</li>
        </ul>

        <h2>Game Rules</h2>
        <ul>
          <li>Collect resources to earn points</li>
          <li>Avoid colliding with other snakes or walls</li>
          <li>
            The game speeds up at the 1/4, halfway, and 3/4 points of the total
            game time
          </li>
          <li>
            When collecting a new speed effect, the previous effect will be
            replaced
          </li>
          <li>
            The player with the highest score after the game finishes wins
          </li>
        </ul>

        <h2>Resources</h2>
        <div className="resourceList">
          <div className="resourceItem">
            <img src="images/resources/plain.png" alt="Plain Resource" />
            <p>
              Regular points (1 point)
              <br />
              Grow snake every 3 collected
            </p>
          </div>
          <div className="resourceItem">
            <img src="images/resources/speedup.png" alt="Speedup Resource" />
            <p>
              Speed boost (2 points)
              <br />
              Double speed for 5 seconds
            </p>
          </div>
          <div className="resourceItem">
            <img src="images/resources/slowdown.png" alt="Slowdown Resource" />
            <p>
              Slow effect (2 points)
              <br />
              Half speed for 5 seconds
            </p>
          </div>
          <div className="resourceItem">
            <img src="images/resources/teleport.png" alt="Teleport Resource" />
            <p>
              Teleport (10 points)
              <br />
              Random position on map
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
