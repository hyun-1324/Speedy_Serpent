import { playersInfo, availableUserColors } from './playerUtils.js';
import { isMultyPlay } from './playModeUtils.js';

function registerBotPlayer(botNumber, botColor, callback) {
  playersInfo[botNumber] = { name: `${botColor} bot`, color: botColor };
  availableUserColors = availableUserColors.filter(item => item !== botColor);

  callback({
    success: true,
    message: 'bot set successfully',
  });
}

function removeBotPlayers() {
  [0, 1, 2].forEach(id => {
    if (playersInfo[id]) {
      const PlayerInfo = playersInfo[id];
      if (PlayerInfo) {
        availableUserColors.push(PlayerInfo.color);
        delete playersInfo[id];
      }
    }
  });
}
export { registerBotPlayer, removeBotPlayers };
