export enum ResourceType {
  Plain = 'plain',
  Speedup = 'speedup',
  Slowdown = 'slowdown',
  Teleport = 'teleport',
}

export enum SocketEvent {
  GameStateUpdate = 'gameStateUpdate',
  RoomFull = 'roomFull',
  RegisterPlayer = 'registerPlayer',
  RegistrationResult = 'registrationResult',
  UserStateUpdate = 'userStateUpdate',
  TogglePause = 'togglePause',
  GamePauseStateChanged = 'gamePauseStateChanged',
  PlayerQuit = 'playerQuit',
  BackToLobby = 'backTolobby',
  Error = 'error',
  Connect = 'connect',
  ConnectError = 'connect_error',
  StartGame = 'startGame',
  GameOver = 'gameOver',
  TimerUpdate = 'timerUpdate',
  Countdown = 'countdown',
  ResourceBatchAdded = 'resourceBatchAdded',
  Collisions = 'collisions',
  GameDuration = 'gameDuration',
  TogglePlayMode = 'togglePlayMode',
}

export enum ErrorType {
  roomFull = 'roomFull',
  connectionError = 'connectionError',
  gameStarted = 'gameStarted',
  SinglePlayMode = 'singlePlayMode',
  empty = '',
}

export enum CollisionCause {
  Wall = 'a wall',
  Self = 'its own tail',
  Snake = 'another snake',
}
