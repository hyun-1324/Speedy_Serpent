  import { GameEventMessage, LethalCollision, ResourceCollision, Segment } from "../types/interfaces";
  import { GameEventMessageText } from "../types/types";
  import { CollisionCause } from "../types/enums";

  // Type guard to check if collision is a LethalCollision
  export const isLethalCollision = (collision: any): collision is LethalCollision => {
    return collision.type && "collision" in collision.type;
  };

  // Type guard to check if collision is a ResourceCollision
  export const isResourceCollision = (collision: any): collision is ResourceCollision => {
    return collision.type && "x" in collision.type;
  };

  // moveSegment moves the snake part towards a target segment by a given distance
  export const moveSegment = (previousSegment: Segment, targetSegment: Segment, distance: number) : Segment => {
    if (previousSegment.x === targetSegment.x && previousSegment.y === targetSegment.y) {
      previousSegment.x += 0.01;
      previousSegment.y += 0.01;
    }
    if (previousSegment.x < targetSegment.x) {
      previousSegment.x += distance;
    }
    if (previousSegment.x > targetSegment.x) {
      previousSegment.x -= distance;
    }
    if (previousSegment.y < targetSegment.y) {
      previousSegment.y += distance;
    }
    if (previousSegment.y > targetSegment.y) {
      previousSegment.y -= distance;
    }
    return previousSegment;
  };


// handleResourceCollision returns a GameEventMessage based on the collision information
  export const handleLethalCollision = (collision: LethalCollision, getPlayercolor: (playerName: string) => string | undefined, isMe: boolean) : GameEventMessage => {
    const cause = collision.type.type;

    let message: GameEventMessageText | undefined = undefined;
    switch (cause) {
      case "wall":
        isMe
          ? message = `Your snake collided with ${CollisionCause.Wall} and died!`
          : message = `${collision.playerName}'s snake collided with ${CollisionCause.Wall} and died!`;
        break;
      case "self":
        isMe
          ? message = `Your snake collided with ${CollisionCause.Self} and died!`
          : message = `${collision.playerName}'s snake collided with ${CollisionCause.Self} and died!`;
        break;
      case "snake":
        isMe
          ? message = `Your snake collided with ${CollisionCause.Snake} and died!`
          : message = `${collision.playerName}'s snake collided with ${CollisionCause.Snake} and died!`;
        break;
      default:
        console.error("Unknown collision type when handling lethal collision");
    }
    const color = getPlayercolor(collision.playerName);
    const colorClass: `${string}Text` | undefined = color ? `${color}Text` : undefined;

    return {
      id: Math.random() * 1000000,
      message: message,
      colorClass: colorClass,
      icon: "images/icons/dead.png",
    };
  };

  // calculateSpeed calculates the speed value in milliseconds based on the speedMultiplier and the gameSpeed
  export const calculateSpeed = (speed: number, speedMultiplier: number) => {
    switch (speedMultiplier) {
      case 1:
        return speed;
      case 0.5:
        return speed * 2;
      case 1.5:
        return speed / 2;
      default:
        return speed;
    }
  };