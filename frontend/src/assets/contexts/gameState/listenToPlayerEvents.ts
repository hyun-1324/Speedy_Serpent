import {
  Player,
  UserStateUpdate,
  UpdateGameArgs,
  GameEventMessage,
} from '../../types/interfaces';
import { SocketEvent } from '../../types/enums';

export function listenToPlayerEvents({
  socket,
  setGameState,
  setGameEventMessages,
}: UpdateGameArgs): void {
  if (!setGameState || !setGameEventMessages) {
    console.error(
      'setGameState or setGameEventMessages is not defined for updatePlayers function'
    );
    return;
  }

  socket.on(SocketEvent.UserStateUpdate, (userStateUpdate: UserStateUpdate) => {
    const playerList: Player[] = [];
    const { players, host } = userStateUpdate;

    players.forEach((player: Player) => {
      playerList.push({
        speedMultiplier: 1,
        name: player.name,
        color: player.color,
        score: 0,
      });
    });

    setGameState(prevState => {
      return {
        ...prevState,
        players: playerList,
        host: host,
      };
    });
  });

  socket.on(SocketEvent.PlayerQuit, ({ playerName, host }) => {
    let playerColor: string | undefined;
    let hostColor: string | undefined;
    let hostChanged: boolean = false;
    let me: string | null = null;

    setGameState(prevState => {
      playerColor = prevState.players.find(
        player => player.name === playerName
      )?.color;
      hostColor = prevState.players.find(player => player.name === host)?.color;
      me = prevState.me;
      host !== prevState.host ? (hostChanged = true) : (hostChanged = false);

      // Remove the player who quit
      const newPlayers = prevState.players.filter(player => {
        return player.name !== playerName;
      });

      // If there is only one player left, add a message to the lobby
      let lobbyMessage = null;
      if (newPlayers.length === 1) {
        lobbyMessage = `${playerName} left the game. You were quided back to the lobby.`;
      }

      // If final scores are shown, add playerleft value to the player that quit
      let finalScores = prevState.finalScores;
      if (finalScores.length > 0) {
        finalScores = finalScores.map(player => {
          if (player.name === playerName) {
            return {
              ...player,
              playerLeft: true,
            };
          }
          return player;
        });
      }

      return {
        ...prevState,
        lobbyMessage: lobbyMessage,
        players: newPlayers,
        host: host,
        finalScores,
      };
    });

    setGameEventMessages(prev => {
      const newMessages: GameEventMessage[] = [];

      newMessages.push({
        // generate a new random id
        id: Math.floor(Math.random() * 1000000),
        message: `${playerName} quit!`,
        colorClass: `${playerColor}Text`,
        icon: 'images/icons/error.png',
      });

      // If host changes, add a message to the gameEventMessages
      if (hostChanged) {
        if (host === me) {
          newMessages.push({
            id: Math.floor(Math.random() * 1000000),
            message: 'You are the new host!',
            colorClass: `${hostColor}Text`,
            icon: 'images/icons/leader.png',
          });
        } else {
          newMessages.push({
            id: Math.floor(Math.random() * 1000000),
            message: `${host} is the new host!`,
            colorClass: `${hostColor}Text`,
            icon: 'images/icons/leader.png',
          });
        }
      }
      return prev.concat(newMessages);
    });
  });
}
