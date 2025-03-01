import { playersInfo, availableUserColors } from './playerUtils.js';

function registerBotPlayer(botId, botColor, botLevel, botBehavior, callback) {
  if (botLevel === 'none') {
    const PlayerInfo = playersInfo[botId];
    if (PlayerInfo) {
      availableUserColors.push(PlayerInfo.color);
      delete playersInfo[botId];
    }
  } else {
    playersInfo[botId] = {
      name: `${botColor} bot`,
      color: botColor,
      botLevel: botLevel,
      botBehavior: botBehavior,
    };

    availableUserColors.splice(
      0,
      availableUserColors.length,
      ...availableUserColors.filter(item => item !== botColor)
    );
  }

  callback({
    success: true,
  });
}

function removeBotPlayers() {
  ['bot1', 'bot2', 'bot3'].forEach(id => {
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
