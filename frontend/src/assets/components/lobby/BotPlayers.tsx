import { FC, useState } from 'react';
import { useGameState } from '../../contexts/gameState/GameStateContext';
import { BotPlayerProps } from '../../types/interfaces';
import { BotColor, BotId, BotLevels } from '../../types/types';

const botLevels: BotLevels[] = [
  'none',
  'easy(Safe and Efficient)',
  'easy(Aggressive)',
  'easy(Bold and Fast-paced)',
  'medium(Safe and Efficient)',
  'medium(Aggressive)',
  'medium(Bold and Fast-paced)',
  'hard(Safe and Efficient)',
  'hard(Aggressive)',
  'hard(Bold and Fast-paced)',
];
const playerColors: BotColor[] = ['red', 'green', 'yellow', 'blue'];

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
    [key in BotId]?: BotLevels;
  }>({
    bot1: 'none',
    bot2: 'none',
    bot3: 'none',
  });

  const botId: BotId[] = ['bot1', 'bot2', 'bot3'];

  const sendBotLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    botId: BotId
  ) => {
    const botLevel = event.target.value;

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
        botLevel,
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
      setBotColors(prevColors => ({
        ...prevColors,
        [botId]: assignedColor,
      }));
      setBotLevelsState(prevLevels => ({
        ...prevLevels,
        [botId]: botLevel,
      }));

      socket.emit('registerBotPlayer', {
        botId: botId,
        botColor: assignedColor,
        botLevel,
      });
    }
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
      {botId.map(botId => (
        <select
          key={botId}
          className={`${botColors[botId] || 'white'} playerBox`}
          onChange={e => sendBotLevelChange(e, botId)}
          value={botLevelsState[botId] || 'none'}
        >
          <option value="none">Add opponent</option>
          {botLevels.slice(1).map(level => (
            <option key={level} value={level}>
              {`${level.charAt(0).toUpperCase()}${level.slice(1)} Bot`}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default BotPlayers;
