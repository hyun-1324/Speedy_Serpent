import { FC } from 'react';
import { ToggleProps } from '../../types/interfaces';

const Toggle: FC<ToggleProps> = ({ isMultiplayer, onToggle }) => {
  return (
    <label className="switch margin10">
      <input
        id="toggle"
        type="checkbox"
        checked={isMultiplayer}
        onChange={onToggle}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default Toggle;
