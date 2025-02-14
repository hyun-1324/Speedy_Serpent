import { GameState } from './interfaces';
import { ErrorType } from './enums';

export const SEGMENTSIZE = 18;
export const INITIALMOVEINTERVAL = 200;

export const initialGameState: GameState = {
  gameOn: false,
  lobbyMessage: null,
  error: ErrorType.empty,
  players: [],
  me: null,
  host: null,
  winner: null,
  tie: false,
  gameSpeed: 0,
  pause: {paused: false, playerName: null},
  countDown: null,
  resources: [],
  finalScores: [],
};