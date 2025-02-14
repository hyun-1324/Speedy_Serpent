import { UpdateGameArgs } from "../types/interfaces";
import { initialGameState } from "../types/constants";

export function quitGame({socket, setGameState, setViewState, setGameEventMessages}: UpdateGameArgs): void {
  if (!setGameState || !setViewState || !setGameEventMessages) {
    console.error("setGameState or setViewState or serGameEventMessages is not defined for quitGame function");
    return;
  }

  setGameState(initialGameState);
  setGameEventMessages([]);

  setViewState((prev) =>{
    return {
      ...prev,
      status: "quit",
    }
  });

  socket.disconnect();
};

export function reconnect({ socket }: UpdateGameArgs): void {
  socket.connect();
};

export function fullScreen(setFullscreenOn: React.Dispatch<React.SetStateAction<boolean>>): void {
  if (window.document.fullscreenElement) {
    window.document.exitFullscreen();
    setFullscreenOn(false);
  } else {
    window.document.documentElement.requestFullscreen();
    setFullscreenOn(true);
  }
}