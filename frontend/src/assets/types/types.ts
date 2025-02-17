import { CollisionCause } from './enums';

export type LobbyMessage =
  | 'Waiting for the host to start the game...'
  | 'Waiting for others to join the game...'
  | 'Start the game when everyone is ready!'
  | '';

export type View =
  | 'error'
  | 'notJoined'
  | 'loading'
  | 'lobby'
  | 'inGame'
  | 'gameOver'
  | 'quit';

export type EntryErrorMessage =
  | ''
  | "Name can't be empty!"
  | 'Name is already taken!'
  | 'The room you are trying to join is full.'
  | 'There was an error connecting to the server.'
  | 'Multiplayer mode is disabled.'
  | 'The game has already started.';

export type BotColor = 'red' | 'green' | 'yellow';

export type RegistrationResultMessage =
  | 'Name already taken'
  | 'Name set successfully'
  | 'You are the host!';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CountdownType = 3 | 2 | 1 | 'Slither!' | 'over' | null;

export type GameEventMessageText =
  | `${string} restarted the game.`
  | `${string} quit!`
  | `Your snake collided with ${CollisionCause} and died!`
  | `${string}'s snake collided with ${CollisionCause} and died!`
  | `${string} is the new host!`
  | 'You are the new host!';

export type Duration = 60 | 120 | 180;
