import { FC, useEffect, useState } from "react";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import { SocketEvent } from "../../types/enums";

const ThreeOptionSlider: FC = () => {
  const { socket, timer } = useGameState();

  const roundInMins = timer.roundDuration / 60;

  const [background, setBackground] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Send the new game duration to the server in seconds
    const roundInSecs = parseInt(event.target.value, 10) * 60;
    socket.emit(SocketEvent.GameDuration, roundInSecs);
  };

  useEffect(() => {
    switch (roundInMins) {
      case 1:
        setBackground("var(--greenWithOpacity)");
        break;
      case 2:
        setBackground("var(--blueWithOpacity)");
        break;
      case 3:
        setBackground("var(--redWithOpacity)");
        break;
    }
  }, [roundInMins]);

  useEffect(() => {
    return () => {
      setBackground("");
    };
  }, []);

  return (
    <div className="three-option-slider">
      <input
        type="range"
        min="1"
        max="3"
        step="1"
        value={roundInMins}
        style={{ background: background }}
        onChange={handleChange}
        className="threeSlider"
      />
      <div className="sliderLabels">
        <span
          className={roundInMins === 1 ? "bold" : ""}
          style={{ color: roundInMins === 1 ? "var(--green1)" : "inherit" }}
        >
          1
        </span>
        <span
          className={roundInMins === 2 ? "bold" : ""}
          style={{ color: roundInMins === 2 ? "var(--blue1)" : "inherit" }}
          >
            2
          </span>
        <span
          className={roundInMins === 3 ? "bold" : ""}
          style={{ color: roundInMins === 3 ? "var(--red1)" : "inherit" }}
          >
            3
        </span>
      </div>
    </div>
  );
};

export default ThreeOptionSlider;