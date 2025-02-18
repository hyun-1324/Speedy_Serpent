import { setMultyPlayMode } from './playModeUtils.js';

const MAX_PLAYERS = 4;
let playersInfo = {};
let availableUserColors = ['red', 'blue', 'yellow', 'green'];
let hostPlayer = null;

function checkPlayerNumber(socket) {
  const numClients = Object.keys(playersInfo).length + 1;

  if (numClients > MAX_PLAYERS) {
    socket.emit('roomFull', 'The room is full.');
    socket.disconnect();
    return false;
  }
  return true;
}

function registerPlayer(socket, playerName, callback) {
  if (Object.values(playersInfo).some(player => player.name === playerName)) {
    callback({ success: false, message: 'Name already taken' });
  } else {
    const playerColor = availableUserColors.shift();
    playersInfo[socket.id] = { name: playerName, color: playerColor };
    if (!hostPlayer) {
      setMultyPlayMode();
      hostPlayer = playersInfo[socket.id].name;
      callback({
        success: true,
        message: 'You are the host!',
      });
    } else {
      callback({
        success: true,
        message: 'Name set successfully',
      });
    }
  }
}

function removePlayer(socket) {
  const PlayerInfo = playersInfo[socket.id];
  if (PlayerInfo) {
    availableUserColors.push(PlayerInfo.color);
    delete playersInfo[socket.id];
  }
  if (hostPlayer === PlayerInfo?.name) {
    assignNewHost();
  }
}

function assignNewHost() {
  const remainingPlayerIds = Object.keys(playersInfo);
  if (remainingPlayerIds.length > 0) {
    hostPlayer = playersInfo[remainingPlayerIds[0]].name;
  } else {
    hostPlayer = null;
  }
}

function getHost() {
  return hostPlayer;
}

function isPlayerRegistered(socketId) {
  return !!playersInfo[socketId];
}

function isHost(socketId) {
  return playersInfo[socketId]?.name == hostPlayer;
}

function getPlayersInfo() {
  return playersInfo;
}

export {
  checkPlayerNumber,
  registerPlayer,
  removePlayer,
  getHost,
  isPlayerRegistered,
  isHost,
  getPlayersInfo,
  MAX_PLAYERS,
};
