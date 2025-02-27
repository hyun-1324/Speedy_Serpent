import { FC, useState } from 'react';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import { BotPlayerProps } from '../../types/interfaces';
import { BotColor, BotId, BotLevel, BotBehavior } from '../../types/types';

const botId: BotId[] = ['bot1', 'bot2', 'bot3'];
const botLevels: BotLevel[] = ['none', 'easy', 'medium', 'hard'];
const botBehaviors: BotBehavior[] = [
  'safeAndEfficient',
  'aggressive',
  'boldAndFastPaced',
];
const playerColors: BotColor[] = ['red', 'green', 'yellow', 'blue'];
const behaviorDisplayNames = {
  safeAndEfficient: 'Safe and Efficient',
  aggressive: 'Aggressive',
  boldAndFastPaced: 'Bold and Fast-paced',
};

const BotPlayers: FC<BotPlayerProps> = ({ player }) => {
  const { gameState, socket } = useGameState();
  const availableColors = playerColors.filter(
    item => item !== gameState.players[0].color
  );

  const [botColors, setBotColors] = useState<{ [key in BotId]?: BotColor }>({
    bot1: undefined,
    bot2: undefined,
    bot3: undefined,
  });

  const [botLevelsState, setBotLevelsState] = useState<{
    [key in BotId]?: BotLevel;
  }>({
    bot1: 'none',
    bot2: 'none',
    bot3: 'none',
  });

  const [botBehaviorsState, setBotBehaviorsState] = useState<{
    [key in BotId]?: BotBehavior;
  }>({
    bot1: 'safeAndEfficient',
    bot2: 'safeAndEfficient',
    bot3: 'safeAndEfficient',
  });

  const formatBotConfig = (level: BotLevel, behavior: BotBehavior): string => {
    if (level === 'none') return 'none';
    const behaviorName = behaviorDisplayNames[behavior];
    return `${level}(${behaviorName})`;
  };

  const sendBotLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    botId: BotId
  ) => {
    const botLevel = event.target.value as BotLevel;

    if (botLevel === 'none') {
      setBotColors(prevColors => ({
        ...prevColors,
        [botId]: undefined,
      }));
      setBotLevelsState(prevLevels => ({
        ...prevLevels,
        [botId]: 'none',
      }));
      socket.emit('registerBotPlayer', {
        botId: botId,
        botColor: undefined,
        botLevel: 'none',
      });
      return;
    }

    const usedColors = Object.values(botColors).filter(Boolean) as BotColor[];
    const remainingColors = availableColors.filter(
      color => !usedColors.includes(color)
    );

    const newColor = remainingColors[0];

    if (newColor || botColors[botId]) {
      const assignedColor = botColors[botId] || newColor;
      const currentBehavior = botBehaviorsState[botId] || 'safeAndEfficient';

      setBotColors(prevColors => ({
        ...prevColors,
        [botId]: assignedColor,
      }));
      setBotLevelsState(prevLevels => ({
        ...prevLevels,
        [botId]: botLevel,
      }));

      // Convert to old format for backward compatibility
      const formattedBotLevel = formatBotConfig(botLevel, currentBehavior);

      socket.emit('registerBotPlayer', {
        botId: botId,
        botColor: assignedColor,
        botLevel: formattedBotLevel,
        botBehavior: currentBehavior,
      });
    }
  };

  const sendBotBehaviorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    botId: BotId
  ) => {
    const botBehavior = event.target.value as BotBehavior;
    const currentLevel = botLevelsState[botId] || 'none';

    if (currentLevel === 'none') {
      return;
    }

    setBotBehaviorsState(prevBehaviors => ({
      ...prevBehaviors,
      [botId]: botBehavior,
    }));

    const currentColor = botColors[botId];

    const formattedBotLevel = formatBotConfig(currentLevel, botBehavior);

    socket.emit('registerBotPlayer', {
      botId: botId,
      botColor: currentColor,
      botLevel: formattedBotLevel,
      botBehavior: botBehavior,
    });
  };

  return (
    <div className="flexColumn">
      <div className={`${gameState.players[0].color} playerBox`}>
        {player.name}
        <img
          className="leaderIcon"
          src="images/starYellow.png"
          alt="Leader Icon"
        />
      </div>
      {botId.map(id => (
        <div key={id} className="botConfigContainer">
          <select
            className={`${botColors[id] || 'white'} playerBox botLevelSelect`}
            onChange={e => sendBotLevelChange(e, id)}
            value={botLevelsState[id] || 'none'}
          >
            <option value="none">Add opponent</option>
            {botLevels
              .filter(level => level !== 'none')
              .map(level => (
                <option key={level} value={level}>
                  {`${level.charAt(0).toUpperCase()}${level.slice(1)} Bot`}
                </option>
              ))}
          </select>

          {botLevelsState[id] !== 'none' && (
            <select
              className="botBehaviorSelect"
              onChange={e => sendBotBehaviorChange(e, id)}
              value={botBehaviorsState[id] || 'safeAndEfficient'}
            >
              {botBehaviors.map(behavior => (
                <option key={behavior} value={behavior}>
                  {behaviorDisplayNames[behavior]}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

export default BotPlayers;
