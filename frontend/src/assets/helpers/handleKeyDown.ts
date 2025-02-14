import { HandleKeyDownArgs } from '../types/interfaces';
import { SocketEvent } from '../types/enums';

const keyBuffer: string[] = [];
let isProcessing = false;

const processKeyBuffer = (socket: any, mySpeed: number) => {
  if (keyBuffer.length === 0) {
    isProcessing = false;
    return;
  }

  const direction = keyBuffer.shift();
  socket.emit('move', direction);
  setTimeout(() => processKeyBuffer(socket, mySpeed), mySpeed);
};

// Keydown event handler
// Keydowns are stored in a buffer and processed one by one to make the game feel more responsive
export const handleKeyDown = (args: HandleKeyDownArgs) => {
  const { socket, e, mySpeed } = args;
  e.preventDefault();

  let newDirection: string | null = null;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      newDirection = 'up';
      break;

    case 'ArrowDown':
    case 's':
      newDirection = 'down';
      break;

    case 'ArrowLeft':
    case 'a':
      newDirection = 'left';
      break;

    case 'ArrowRight':
    case 'd':
      newDirection = 'right';
      break;

    case ' ':
      socket.emit(SocketEvent.TogglePause);
      break;

    default:
      return;
  }

  if (newDirection) {
    if (keyBuffer.length < 2) {
      keyBuffer.push(newDirection);
    }

    if (!isProcessing) {
      isProcessing = true;
      processKeyBuffer(socket, mySpeed);
    }
  }
};
