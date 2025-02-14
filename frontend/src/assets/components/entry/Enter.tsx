import { useState, FC, useEffect, useRef, useCallback } from "react";
import ErrorMessage from "../reusable/ErrorMessage";
import { EntryErrorMessage, RegistrationResultMessage } from "../../types/types";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import Button from "../reusable/Button";
import { SocketEvent } from "../../types/enums";

const EnterLobby: FC = () => {
  const [error, setError] = useState<EntryErrorMessage>("");
  const nameRef = useRef<string>("");

  const { setGameState, setViewState, socket } = useGameState();

   // Send name to server using WebSocket
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nameRef.current) {
      setError("Name can't be empty!");
      return;
    }

    socket.emit(SocketEvent.RegisterPlayer, nameRef.current);
  }, [socket]);


  // Listen to Websocket response
  useEffect(() => {
    const handleSuccess = (result: { success: boolean, message: RegistrationResultMessage }) => {
      if (!result.success) {
        setError("Name is already taken!");
        return;
      }

      // Render lobby if registration is successful
      setError("");

      setGameState((prevState) => {
        const name = nameRef.current;
        return {
          ...prevState,
          me: name,
        };
      });
      setViewState(prev => {
        return {
          ...prev,
          status: "lobby"}
      });
    }

    socket.on(SocketEvent.RegistrationResult, handleSuccess);

    return () => {
      socket.off(SocketEvent.RegistrationResult, handleSuccess);
      nameRef.current = "";
    }
  }, [setGameState, setViewState, socket]);

  return (
    <form
      id="entry"
      className="contentBox flexColumn entryBox"
      onSubmit={handleSubmit} >

      <label
        id="entryLabel"
        className="margin10"
        htmlFor="entryInput" >
        Enter your name to join the game lobby.
      </label>
      <input
        id="entryInput"
        className="margin10"
        type="text"
        maxLength={10}
        defaultValue={nameRef.current}
        placeholder="Type your name here..."
        onChange={(e) => (nameRef.current = e.target.value)} />
      {error &&
        <ErrorMessage
          error={error}
          iconSRC="images/icons/error.png"
          classes="margin10" />}
      <Button
        imageSRC="images/buttons/arrow.png"
        alt="Submit"
        type="submit"
        classes="flexEnd"
        tooltip="Join the game lobby"
      />
    </form>
  );

};

export default EnterLobby;

