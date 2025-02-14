import { UpdateGameArgs, Player, GameState, GameEventMessage } from "../../types/interfaces";
import {  CountdownType, Duration } from "../../types/types";
import { SocketEvent } from "../../types/enums";

export function listenToGameStateEvents({ socket, setGameState, setViewState, setTimer, setGameEventMessages}: UpdateGameArgs): void {
  if (!setGameState || !setViewState || !setTimer || !setGameEventMessages) {
    console.error("setGameState or setViewState or setTimer or setGameEventMessages is not defined for listenToGameStateEvents function");
    return;
  }

  socket.on(SocketEvent.GamePauseStateChanged, ({ isPaused, pausedBy }) => {
    const name = isPaused ? pausedBy : null;
    setGameState(prevState => {
      return {
        ...prevState,
        pause: { paused: isPaused, playerName: name },
      };
    });
  });

  socket.on(SocketEvent.GameStateUpdate, ({ players, resources, gameSpeed }) => {
    const checkIfPredictedPositionIsSame = (current: Player, updated: Player) : boolean => {
      if (!current.snake || !updated.snake) return false;
      return current.snake.predictedPosition.head.x === updated.snake.predictedPosition.head.x &&
        current.snake.predictedPosition.head.y === updated.snake.predictedPosition.head.y;
    }

    setGameState((prevState) => {
      const updatedPlayers = prevState.players.map((player) => {
        const targetPlayer = players.find((p: Player) => p.name === player.name);
        if (!targetPlayer) return player;

        const snake = targetPlayer.snake;
        const currentPosition = checkIfPredictedPositionIsSame(player, targetPlayer)
          ? player.snake?.currentPosition
          : { ...snake?.lastConfirmedPosition };

        return {
          ...player,
          speedMultiplier: targetPlayer.speedMultiplier,
          score: targetPlayer.score,
          snake: {
            ...player.snake,
            direction: snake?.direction,
            predictedPosition: snake?.predictedPosition,
            currentPosition,
            alive: targetPlayer.isAlive,
          },
        };
      });

      return {
        ...prevState,
        gameSpeed,
        resources,
        players: updatedPlayers,
      };
    });
  });

  socket.on(SocketEvent.StartGame, ({ isPaused, players, gameSpeed }) => {
    let restarted : boolean = false;
    let restartHost : string | null = null;
    let iamHost : boolean = false;

    setGameState((prevState) => {
      restarted = prevState.gameOn;
      restartHost = prevState.host;
      iamHost = prevState.me === prevState.host;

      const startsState: GameState = {
        ...prevState,
        gameOn: true,
        lobbyMessage: null,
        resources: [],
        gameSpeed: gameSpeed,
        pause: {paused: isPaused, playerName: null},
        players: prevState.players.map((player) => {
          const snake = players.find((p: Player) => p.name === player.name)?.snake;
          return {
            name: player.name,
            color: player.color,
            speedMultiplier: 1,
            score: 0,
            snake: {
              direction: snake?.direction,
              nextDirection: snake?.direction,
              predictedPosition: snake?.predictedPosition,
              currentPosition: snake?.lastConfirmedPosition,
              alive: true,
            },
          };
        }),
        winner: null,
        tie: false,
        countDown: null,
        finalScores: [],
      };

      return startsState;
    });

    setGameEventMessages((prev) => {
      let restartMessage: GameEventMessage[] = [];
      if (restarted) {
        // generate a new random id
        const id = Math.floor(Math.random() * 1000000);
        restartMessage.push({
          id,
          message: `${iamHost ? "You" : restartHost} restarted the game.`,
          colorClass: "blackText",
          icon: "images/icons/replay.png",
        });
      };
      return restarted ? prev.concat(restartMessage) : []
    });

    setViewState((prev) => {
      return {
        ...prev,
        status: 'inGame',
      };
    });

    setTimer((prev) => {
      return {
        ...prev,
        timeLeft: ("0" + Math.floor(prev.roundDuration / 60)) + ":" + "00",
      };
    });
  });

  socket.on(SocketEvent.BackToLobby, () => {
    setGameState(prevState => {
      const fromGame = prevState.gameOn;
      const host = prevState.host;
      const isHost = prevState.me === host;
      let lobbyMessage = null;
      if (!prevState.lobbyMessage) {
        lobbyMessage = fromGame ? `${isHost ? "You" : host} decided to end the game and return to lobby. ` : null;
      } else {
        lobbyMessage = prevState.lobbyMessage;
      }
      return {
        ...prevState,
        gameOn: false,
        lobbyMessage,
      };
    });
    setViewState(prev => {
      return {
        ...prev,
        status: 'lobby',
      };
    });
  });

  socket.on(SocketEvent.GameOver, ({ winner, scores }) => {
    setGameState(prevState => {
      let tie = false;
      if (scores.length > 1 && scores[0].score === scores[1].score) {
        tie = true;
      }

      let playerColor = prevState.players.find(player => player.name === winner.name)?.color;

      return {
        ...prevState,
        gameOn: false,
        winner: {... winner, color: playerColor},
        tie: tie,
        finalScores: prevState.players.map(player => {
          const score = scores.find((p: any) => p.name === player.name)?.score;
          return {
            name: player.name,
            color: player.color,
            score: score,
            speedMultiplier: 1,
            playerLeft: false,
          };
        }),
        players: prevState.players.map(player => {
          const score = scores.find((p: any) => p.name === player.name)?.score;
          return {
            name: player.name,
            color: player.color,
            score: score,
            speedMultiplier: 1,
          };
        }),
      };
    });
    setViewState(prev => {
      return {
        ...prev,
        status: "gameOver",
      }
    });;
  });

  socket.on(SocketEvent.TimerUpdate, (time: number) => {
    setTimer((prev) => {
      return {
        ...prev,
        timeLeft: ("0" + Math.floor(time / 60)) + ":" + ("0" + time % 60).slice(-2),
      };
    });
  });

  socket.on(SocketEvent.GameDuration, (gameDuration: Duration) => {
    setTimer({
        roundDuration: gameDuration,
        timeLeft: ("0" + Math.floor(gameDuration / 60)) + ":" + "00",
      });
  });

  socket.on(SocketEvent.Countdown, (countdown) => {
    let countdownMessage: CountdownType;
    if (typeof countdown === 'string') {
      countdownMessage = 'Slither!';
      setTimeout(() => {
        setGameState(prevState => {
          return {
            ...prevState,
            countDown: 'over',
          };
        });
      }, 500);
    } else {
      countdownMessage = countdown;
    }
    setGameState(prevState => {
      return {
        ...prevState,
        countDown: countdownMessage,
      };
    });
  });
}
