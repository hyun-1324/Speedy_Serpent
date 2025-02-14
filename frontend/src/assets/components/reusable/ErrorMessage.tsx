import { FC } from 'react';
import { ErrorMessageProps } from '../../types/interfaces';

const ErrorMessage: FC<ErrorMessageProps> = ({ error, iconSRC, classes }) => {
  return (
    <div className={`errorBox${classes !== undefined ? ` ${classes}` : "" }`}>
      <img src={iconSRC} alt="icon" />
      <p>{ error }</p>
    </div>
  )
};

export default ErrorMessage;
