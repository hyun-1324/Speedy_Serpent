import React, { ReactNode } from "react";
import { Socket } from "socket.io-client";
import { EntryErrorMessage, View, Direction, CountdownType, GameEventMessageText, Duration } from "./types";
import { ResourceType, ErrorType } from "./enums";


// GAME STATE INTERFACES

export interface GameState {
  gameOn: boolean;
  lobbyMessage: string | null;
  error: ErrorType;
  players: Player[];
  me: string | null;
  host: string | null;
  winner: Player | null;
  tie: boolean;
  gameSpeed: number;
  pause: Paused;
  countDown: CountdownType;
  resources: Resource[];
  finalScores: FinalScore[];
};

export interface GameEventMessage {
  id: number;
  message?: GameEventMessageText;
  colorClass?: `${string}Text`;
  icon: "images/icons/replay.png" | "images/icons/error.png" | "images/icons/dead.png" | "images/icons/leader.png";
};

export interface ViewState {
  status: View;
  showInfo: boolean;
};

export interface AudioState {
  muted: boolean;
};

export interface Timer {
  roundDuration: Duration;
  timeLeft: string;
};

export interface Paused {
  paused: boolean;
  playerName: string | null;
};

export interface Player {
  name: string;
  speedMultiplier: number;
  color?: "blue" | "red" | "green" | "yellow";
  score: number;
  snake?: Snake;
};

export interface FinalScore extends Player {
  playerLeft: boolean;
};

export interface Segment {
  x: number,
  y: number
};

interface Position {
  body: Segment[];
  head: Segment;
};

export interface Snake {
  direction: Direction;
  predictedPosition: Position;
  currentPosition: Position;
  alive: boolean;
};

export interface Resource {
  x: number;
  y: number;
  id: number;
  type: ResourceType;
};

export interface LethalCollision {
  playerName: string;
  type: {
    collision: boolean;
    type: "wall" | "self" | "snake" |  null;
  };
};

export interface ResourceCollision {
  playerName: string;
  type: {
    type: ResourceType;
    x: number;
    y: number;
  }
};

export interface UserStateUpdate {
  players: Player[];
  host: string;
};

// PROPS INTERFACES

export interface GameStateContextProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  socket: Socket;
  audio: AudioState;
  setAudio: React.Dispatch<React.SetStateAction<AudioState>>;
  getPlayercolor: (playerName: string) => string | undefined;
  setGameEventMessages: React.Dispatch<React.SetStateAction<GameEventMessage[]>>;
  gameEventMessages: GameEventMessage[];
  timer: Timer;
  setTimer: React.Dispatch<React.SetStateAction<Timer>>;
};

export interface ProviderProps {
  children: ReactNode;
};

export interface ErrorMessageProps {
  error?: EntryErrorMessage | GameEventMessageText;
  iconSRC: string;
  classes?: string;
};

export interface ButtonProps {
  onClick?: () => void;
  imageSRC: string;
  alt: string;
  classes?: string;
  type?: "submit";
  disabled?: boolean;
  text?: string;
  tooltip?: string;
};

export interface ToggleProps {
  isMultiplayer: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export interface BotPlayerProps {
  player: Player;
};

// ARGUMENT INTERFACES

export interface UpdateGameArgs {
  socket: Socket;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  setViewState?: React.Dispatch<React.SetStateAction<ViewState>>;
  viewState?: ViewState;
  setTimer?: React.Dispatch<React.SetStateAction<Timer>>;
  setGameEventMessages?: React.Dispatch<React.SetStateAction<GameEventMessage[]>>;
};

export interface HandleKeyDownArgs {
  e: KeyboardEvent,
  socket: Socket,
  mySpeed: number,
};

