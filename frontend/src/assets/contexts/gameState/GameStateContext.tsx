import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { socket } from '../../../socket';
import {
  ProviderProps,
  GameStateContextProps,
  GameState,
  ViewState,
  AudioState,
  GameEventMessage,
  Timer,
} from '../../types/interfaces';
import { initialGameState } from '../../types/constants';
import { listenToPlayerEvents } from './listenToPlayerEvents';
import { listenToGameStateEvents } from './listenToGameStateEvents';
import { listenToErrors } from './listenToErrors';

const GameStateContext = createContext<GameStateContextProps | undefined>(
  undefined
);

export const useGameState = (): GameStateContextProps => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export const GameStateProvider: React.FC<ProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameEventMessages, setGameEventMessages] = useState<
    GameEventMessage[]
  >([]);
  const [timer, setTimer] = useState<Timer>({
    roundDuration: 120,
    timeLeft: '02:00',
  });
  const [viewState, setViewState] = useState<ViewState>({
    status: 'loading',
    showInfo: false,
  });
  const [audio, setAudio] = useState<AudioState>({ muted: false });

  // Create and set the AudioContextRef to resume the browser's audiocontext and play audio
  const audioContextRef = useRef<AudioContext | null>(null);

  const setAudioContext = () => {
    if (!audioContextRef.current) {
      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = context;
    }
    if (
      audioContextRef.current &&
      audioContextRef.current.state === 'suspended'
    ) {
      audioContextRef.current.resume();
    }
  };

  const getPlayercolor = (playerName: string): string | undefined => {
    return gameState.players.filter(player => player.name === playerName)[0]
      .color;
  };

  useEffect(() => {
    // Listen for game state updates from the server
    listenToPlayerEvents({ socket, setGameState, setGameEventMessages });
    listenToGameStateEvents({
      socket,
      setGameState,
      setViewState,
      setTimer,
      setGameEventMessages,
    });
    listenToErrors({
      socket,
      setGameState,
      setViewState,
      setGameEventMessages,
    });

    document.addEventListener('click', setAudioContext);
    document.addEventListener('keydown', setAudioContext);

    // Log all socket messages
    // socket.onAny((event, ...args) => {
    //   console.log("SOCKET MESSAGE: ", event, args);
    // });

    // Handle socket connection
    socket.connect();

    return () => {
      document.removeEventListener('click', setAudioContext);
      document.removeEventListener('keydown', setAudioContext);

      socket.removeAllListeners();
      socket.disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setGameState,
        viewState,
        setViewState,
        socket,
        audio,
        setAudio,
        getPlayercolor,
        setGameEventMessages,
        gameEventMessages,
        timer,
        setTimer,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};
