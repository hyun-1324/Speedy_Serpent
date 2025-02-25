import { resources } from '../models/resources.js';

function processAIBot(name, snake, botLevel) {
  switch (botLevel) {
    case 'easy(Safe and Efficient)':
      return easySafeAndEfficient(name, snake);
    case 'easy(Aggressive)':
      return easyAggressive(name, snake);
    case 'easy(Bold and Fast-paced)':
      return easyBoldAndFastPaced(name, snake);
    case 'medium(Safe and Efficient)':
      return mediumSafeAndEfficient(name, snake);
    case 'medium(Aggressive)':
      return mediumAggressive(name, snake);
    case 'medium(Bold and Fast-paced)':
      return mediumBoldAndFastPaced(name, snake);
    case 'hard(Safe and Efficient)':
      return hardSafeAndEfficient(name, snake);
    case 'hard(Aggressive)':
      return hardAggressive(name, snake);
    case 'hard(Bold and Fast-paced)':
      return hardBoldAndFastPaced(name, snake);
    default:
      throw new Error('invaild botLevel: ' + botLevel);
  }
}

function easySafeAndEfficient(botName, snake) {
  console.log(resources.getResources());
}

export { processAIBot };
