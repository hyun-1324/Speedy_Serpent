import { FC, useEffect } from 'react';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import useAudio from '../../audio/useAudio';
import countdownsound from "../../audio/soundFiles/countdown.ogg";
import goSound from "../../audio/soundFiles/countdownFinal.ogg";

const Countdown: FC = () => {
  const { gameState } = useGameState();

  const countdown = gameState.countDown;

  const playCountdown = useAudio(countdownsound);
  const playGo = useAudio(goSound);

  useEffect(() => {
    if (!countdown) return;
    if (typeof countdown === "number") {
      playCountdown();
    } else if (countdown === "Slither!") {
      playGo();
    }
  }, [countdown]);

  return (
    <div
      className="countdown">
        {countdown}
    </div>
  );
};

export default Countdown;