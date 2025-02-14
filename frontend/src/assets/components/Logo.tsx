import { FC, memo } from 'react';
import { useGameState } from '../contexts/gameState/GameStateContext';
import Button from './reusable/Button';

const Logo:FC = () => {
  const { viewState, audio, setAudio, setViewState } = useGameState();
  const fullWidth = viewState.status === "inGame" ? "widthFull" : "";

  return (
    <div className={`contentBox logoContainer ${fullWidth}`}>
      <Button
        imageSRC="images/buttons/infoButton.png"
        alt="Info Button"
        onClick={() => setViewState((prev => ({...prev, showInfo: true})))}
        tooltip="How to play?" />
      <img className="logoImage" src="images/logo-no-background.png" alt="Logo" />
      {audio.muted
        ? <Button
            imageSRC="images/buttons/audioMuted.png"
            alt="Sound On Button"
            onClick={() => setAudio({muted: false})}
            tooltip="Sound on" />
        : <Button
            imageSRC="images/buttons/audioOn.png"
            alt="Sound Off Button"
            onClick={() => setAudio({muted: true})}
            tooltip="Sound off" />
      }
    </div>
  );
}

export default memo(Logo);