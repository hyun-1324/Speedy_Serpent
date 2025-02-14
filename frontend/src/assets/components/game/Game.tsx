import { FC, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useGameState } from "../../contexts/gameState/GameStateContext";
import { Resource, LethalCollision, ResourceCollision,  GameEventMessage } from "../../types/interfaces";
import { isLethalCollision, isResourceCollision, moveSegment, handleLethalCollision, calculateSpeed } from "../../helpers/gameHelpers";
import { handleKeyDown } from "../../helpers/handleKeyDown";
import Countdown from "./Countdown";
import useAudio from "../../audio/useAudio";
import { SocketEvent } from "../../types/enums";
import deadSound from "../../audio/soundFiles/dead.ogg";
import resourceSound from "../../audio/soundFiles/resourceCollected.ogg";
import speedSound from "../../audio/soundFiles/speedUp.ogg";
import batchAddedSound from "../../audio/soundFiles/newResources.ogg";
import slowDownSound from "../../audio/soundFiles/slowDown.ogg";
import teleportSound from "../../audio/soundFiles/teleport.ogg";
import speedBoostSound from "../../audio/soundFiles/speedBoost.ogg";
import { SEGMENTSIZE, INITIALMOVEINTERVAL } from "../../types/constants";


const ResourceComponent = memo(({ resource }: { resource: Resource }) => (
  <div
    style={{ left: resource.x, bottom: resource.y }}
    className="resource">
    <img src={`images/resources/${resource.type}.png`} />
  </div>
));

const Game: FC = () => {
  const { gameState, setGameState, socket, getPlayercolor, setGameEventMessages } = useGameState();

  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const pauseRef = useRef<boolean>(false);
  const pulseTimeOutRef = useRef<NodeJS.Timeout | null>(null);
  const moveIntervalRef = useRef<number>(0);
  const mySnakeRef = useRef<HTMLDivElement | null>(null);
  const mySpeedRef = useRef<number>(0);

  const mySpeedMultiplier = useMemo(() => {
    return gameState.players.filter((player) => player.name === gameState.me)[0].speedMultiplier;
  }, [gameState.players, gameState.me]);

  const iAmAlive = useMemo(() => {
    return gameState.players.filter((player) => player.name === gameState.me)[0].snake?.alive;
  }, [gameState.players, gameState.me]);

  const resources: Resource[] = useMemo(() => gameState.resources, [gameState.resources]);
  const countdown = useMemo(() => gameState.countDown, [gameState.countDown]);
  const moveInterval = useMemo(() => gameState.gameSpeed, [gameState.gameSpeed]);
  const me = useMemo(() => gameState.me, [gameState.me]);

  const playDead = useAudio(deadSound);
  const playResource = useAudio(resourceSound);
  const playSpeedUp = useAudio(speedSound);
  const playBatchAdded = useAudio(batchAddedSound);
  const playTeleport = useAudio(teleportSound);
  const playSpeedBoost = useAudio(speedBoostSound);
  const playSlowDown = useAudio(slowDownSound);

  const handleCollisions = useCallback((collisions: (ResourceCollision | LethalCollision)[]) => {
    const newCollisions: GameEventMessage[] = [];

    collisions.forEach((collision) => {
      if (isResourceCollision(collision)) {
        // Play sound if I collide with a resource
        const playerName = collision.playerName;
        if (playerName === me) {
          switch (collision.type.type) {
            case "slowdown":
              playSlowDown();
              break;
            case "teleport":
              playTeleport();
              break;
            case "speedup":
              playSpeedBoost();
              break;
            default:
              playResource();
              break;
          }
        }

      } else if (isLethalCollision(collision)) {
        const isMe = collision.playerName === me;
        // Add message about lethal collision
        if (collision.type.collision) {
          const message = handleLethalCollision(collision, getPlayercolor, isMe);
          newCollisions.push(message);

          // Play sound if I die
          if (isMe) {
            playDead();
          }
        }
      }
    });

    // Add messages about new collisions to the state
    if (newCollisions.length > 0) {
      setGameEventMessages((prev) => {
        return [...prev, ...newCollisions];
      });
    }

  }, [me]);


  const moveAndAnimate = useCallback((timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }

    if (!pauseRef.current) {
      // Calculate distance to move every frame based on moveInterval and elapsed time
      const elapsedTime = timestamp - lastUpdateTimeRef.current;
      let distance = (elapsedTime / (moveIntervalRef.current + 21)) * SEGMENTSIZE;

      setGameState((prev) => {
        if (prev.players.length === 0) {
          console.log("No players");
          return prev;
        }

        return {
          ...prev,
          players: prev.players.map((player) => {
            if (!player.snake?.currentPosition) {
              console.log("No snake currentPosition");
              return player;
            }
            let playerSpeed = distance;

            // Adjust distance based on speedMultiplier
            if (player.speedMultiplier < 1) {
              playerSpeed /= 2
            } else if (player.speedMultiplier > 1) {
              playerSpeed *= 2
            }

            // Move the head one distance towards the target
            const newSnake = {...player.snake};
            const targetHead = newSnake.predictedPosition.head;
            let newHead = { ...newSnake.currentPosition.head };

            newHead = moveSegment(newHead, targetHead, playerSpeed);

            // Update the body segments
            // Make body parts move one distance towards their target
            const targetBody = newSnake.predictedPosition.body;
            const newBody = newSnake.currentPosition.body.map((segment, index) => {
              const target = targetBody[index];
              let newSegment = { ...segment };

              newSegment = moveSegment(newSegment, target, playerSpeed);

              return newSegment;
            });

            newSnake.currentPosition.head = newHead;
            newSnake.currentPosition.body = newBody;
            player.snake = newSnake;

            return player;
          }),
        };
      });

    }

    // Force style recalculation using getComputedStyle
    if (mySnakeRef.current) {
      window.getComputedStyle(mySnakeRef.current).transform;
    }

    lastUpdateTimeRef.current = timestamp;
    animationRef.current = requestAnimationFrame(moveAndAnimate);

  }, []);

  // Listen and handle collisions and resource batch added events
  useEffect(() => {
    socket.on(SocketEvent.Collisions, handleCollisions);
    socket.on(SocketEvent.ResourceBatchAdded, playBatchAdded);

    return () => {
      socket.off(SocketEvent.Collisions, handleCollisions);
      socket.off(SocketEvent.ResourceBatchAdded, playBatchAdded);
    };
  }, [socket]);

  // Play speed up sound when speed changes
  useEffect(() => {
    moveIntervalRef.current = moveInterval;
    if (moveInterval && moveInterval !== INITIALMOVEINTERVAL) {
      playSpeedUp();
    }
  }, [moveInterval]);

  // Pulse the snake at the beginning of the game
  useEffect(() => {
    if (mySnakeRef.current && countdown === 3) {
      // Add the pulse class to your snake at the beginning of the game
      mySnakeRef.current.classList.add("pulse");

      // Remove the pulse class after 5 seconds
      pulseTimeOutRef.current = setTimeout(() => {
        if (mySnakeRef.current) {
          mySnakeRef.current.classList.remove("pulse");
        }
      }, 5000);

    };
  }, [countdown]);

  // Update mySpeedRef when gameSpeed or mySpeedMultiplier changes
  useEffect(() => {
    mySpeedRef.current = calculateSpeed(gameState.gameSpeed, mySpeedMultiplier);
  }, [gameState.gameSpeed, mySpeedMultiplier, calculateSpeed]);

  // Update pauseRef when pause is toggled
  useEffect(() => {
      pauseRef.current = gameState.pause.paused;
  }, [gameState.pause.paused]);

  // Listen and handle key events
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => handleKeyDown({e, socket, mySpeed: mySpeedRef.current});
    addEventListener("keydown", keyDownHandler);

    return () => {
      removeEventListener("keydown", keyDownHandler);
    };
  }, [socket]);

  // Preload images to prevent frame drops when images are loaded during the game
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        "images/resources/teleport.png",
        "images/resources/plain.png",
        "images/resources/slowdown.png",
        "images/resources/speedup.png",
        "images/icons/dead.png",
        "images/icons/replay.png",
        "images/icons/error.png",
        "images/icons/leader.png",
        "images/buttons/playButton.png",
        "images/buttons/restartButton.png",
        "images/buttons/stopButton.png",
        "images/buttons/toLobby.png",
      ];

      const promises = imageUrls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve();
          img.onerror = (error) => {
            reject(error);
          }
        });
      });

      try {
        await Promise.all(promises);
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    preloadImages();

  }, []);

   // Move the snake from lastConfirmed position to predicted position using requestAnimationFrame
  useEffect(() => {
    animationRef.current = requestAnimationFrame(moveAndAnimate);

    // Cleanup animation frame on component unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastUpdateTimeRef.current = null;
    };
  }, [moveAndAnimate]);

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      if (mySnakeRef.current) {
        mySnakeRef.current.classList.remove("pulse");
        mySnakeRef.current = null;
      }
      if (pulseTimeOutRef.current) {
        clearTimeout(pulseTimeOutRef.current);
        pulseTimeOutRef.current = null;
      }
      pauseRef.current = false;
      mySpeedRef.current = 0;
      moveIntervalRef.current = 0;

    }
  }, []);

  return (
    <div className="contentBox gameBox">
      {gameState.players.map((player) => {
        const isMySnake = player.name === me;
        return (
          <div
            key={player.name}
            ref={isMySnake ? mySnakeRef : null}
            >
            {player.snake?.alive && (
              <>
                <div
                  className="snakePart"
                  style={{
                    left: player.snake.currentPosition.head.x,
                    bottom: player.snake.currentPosition.head.y,
                    borderColor: `var(--${player.color}3)`,
                    backgroundColor: `var(--${player.color}2)`,
                  }}
                ></div>
                {player.snake.currentPosition.body.map((segment, index) => (
                  <div
                    key={index}
                    style={{
                      left: segment.x,
                      bottom: segment.y,
                      borderColor: `var(--${player.color}3)`,
                      backgroundColor: `var(--${player.color}1)`,
                    }}
                    className="snakePart"
                  ></div>
                ))}
              </>
            )}
          </div>
        );
      })}

      {resources.map((resource) => (
        <ResourceComponent key={resource.id} resource={resource} />
      ))}

      {!iAmAlive && <div className="youDied">YOUR SNAKE DIED!</div>}
      {countdown !== "over" && <Countdown/>}

    </div>
  )
};

export default memo(Game);