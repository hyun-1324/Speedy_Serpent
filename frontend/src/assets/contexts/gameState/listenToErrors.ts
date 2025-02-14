import { UpdateGameArgs } from "../../types/interfaces";
import { SocketEvent, ErrorType } from "../../types/enums";

export function listenToErrors({
  socket,
  setGameState,
  setViewState,
  setGameEventMessages,
}: UpdateGameArgs): void {
  if (!setGameState || !setViewState || !setGameEventMessages) {
    console.error(
      'setGameState or setViewState or setgameEventMessages is not defined for listenToStatus function'
    );
    return;
  }

  socket.on(SocketEvent.Connect, () => {
    setGameEventMessages([]);
    setViewState(prev => {
      return {
        ...prev,
        status: 'notJoined',
      };
    });
  });

  socket.on(SocketEvent.ConnectError, () => {
    setGameState(prev => ({
      ...prev,
      gameOn: false,
      error: ErrorType.connectionError,
    }));
    setGameEventMessages([]);
    setViewState(prev => {
      return {
        ...prev,
        status: 'error',
      };
    });
  });

  socket.on(SocketEvent.RoomFull, () => {
    setGameState(prevState => {
      return {
        ...prevState,
        error: ErrorType.roomFull,
      };
    });
    setViewState(prev => {
      return {
        ...prev,
        status: 'error',
      };
    });
  });

  socket.on(SocketEvent.Error, ({ message }) => {
    let errorType: ErrorType;

    switch (message) {
      case 'The room is full.':
        errorType = ErrorType.roomFull;
        break;
      case 'The game has already started.':
        errorType = ErrorType.gameStarted;
        break;
      default:
        errorType = ErrorType.empty;
        break;
    }

    setGameState(prevState => {
      return {
        ...prevState,
        error: errorType,
      };
    });

    if (errorType != ErrorType.empty) {
      setViewState(prev => {
        return {
          ...prev,
          status: 'error',
        };
      });
    }
  });
};