import { FC, useEffect, useRef } from "react";
import ErrorMessage from "../reusable/ErrorMessage";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import CurrentScores from "./CurrentScores";

const Scores: FC = () => {

  const { gameEventMessages } = useGameState();
  const messageBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the stateMessageBox whenever stateMessages updates
  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTo({
        top: messageBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [gameEventMessages]);

  return (
    <div className="contentBox sideBox flexColumn">
      <h2 className="center">Scores</h2>
      <CurrentScores/>
      <div className="stateMessageBox" ref={messageBoxRef}>
        <p className="errorBox margin2 bold">Game events:</p>
        {gameEventMessages.map((message) => (
          <ErrorMessage
            key={message.id}
            error={message.message}
            iconSRC={message.icon}
            classes={`margin2 ${message.colorClass}`} />
        ))}
      </div>
    </div>
  );
}

export default Scores;