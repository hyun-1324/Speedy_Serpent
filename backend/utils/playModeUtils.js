import { removeBotPlayers } from './botPlayerUtils.js';

let isMultyPlay = true;

function togglePlayMode() {
  isMultyPlay = !isMultyPlay;

  if (isMultyPlay) {
    removeBotPlayers();
  }
}

function setMultyPlayMode() {
  isMultyPlay = true;
}

export { isMultyPlay, togglePlayMode, setMultyPlayMode };
