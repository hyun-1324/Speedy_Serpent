import { FC } from 'react';
import { BotPlayerProps } from '../../types/interfaces';
import { BotColor } from '../../types/types';

const botLevels = [
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
const colors: BotColor[] = ['red', 'green', 'yellow'];

const BotPlayers: FC<BotPlayerProps> = ({ player }) => {
  const sendBotLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    color: BotColor
  ) => {
    const botLevel = event.target.value;
    // TODO: Send bot level change to the server
    console.log(`Bot level for ${color}: ${botLevel}`);
  };

  return (
    <div className="flexColumn">
      <div className="blue playerBox">
        {player.name}
        <img
          className="leaderIcon"
          src="images/starYellow.png"
          alt="Leader Icon"
        />
      </div>
      {colors.map((color, index) => (
        <select
          key={index}
          className={`${color} playerBox`}
          onChange={e => sendBotLevelChange(e, color)}
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
