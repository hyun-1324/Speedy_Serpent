import { FC } from 'react';
import { ButtonProps } from '../../types/interfaces';

const Button: FC<ButtonProps> = ({ imageSRC, alt, onClick, classes, disabled, type, text, tooltip }) => {
    return (
      <div className={`tooltipContainer${classes !== undefined ? ` ${classes}` : "" }`}>
      <button
        disabled={disabled}
        type={type}
        className={`button${classes !== undefined ? ` ${classes}` : "" }`}
        onClick={onClick}
        data-tooltip={tooltip}>
        <img
          className="buttonImage"
          src={imageSRC}
          alt={alt} />
        {text && <span>{text}</span>}
      </button>
      {tooltip && <span className="tooltipText">{tooltip}</span>}
    </div>
    )
  };

export default Button;