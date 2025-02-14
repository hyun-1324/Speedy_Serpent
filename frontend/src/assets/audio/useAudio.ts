import { useEffect, useRef } from "react";
import { useGameState } from "../contexts/gameState/GameStateContext";

const useAudio = (audioFile: string): () => void => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { audio: audioState } = useGameState();

  // Create the audio element
  useEffect(() => {
    const audio = new Audio(audioFile);
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [audioFile]);

  // Mute or unmute the audio
  useEffect(() => {
    if (audioRef.current) {
      if (audioState.muted) {
        audioRef.current.muted = true;
      } else {
        audioRef.current.muted = false;
      }
    }
  }, [audioState.muted]);

  // Function to play the audio
  const play = () => {
    const sound = audioRef.current;
    if (sound) {
      sound.currentTime = 0;
      try {
          sound.play();
          return;
      } catch (error) {
          console.error("Error playing audio: ", error);
        }
    };
  }

  return play;
};

export default useAudio;