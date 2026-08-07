const words = [
  // Animals
  'cat', 'dog', 'elephant', 'giraffe', 'penguin', 'lion', 'tiger', 'rabbit', 'dolphin',
  'monkey', 'owl', 'koala', 'kangaroo', 'shark', 'butterfly', 'turtle', 'flamingo',
  'octopus', 'zebra', 'panda', 'bear', 'frog', 'duck', 'snake', 'fox', 'wolf', 'camel',

  // Everyday Objects & Tools
  'apple', 'banana', 'pizza', 'hamburger', 'ice cream', 'donut', 'cupcake', 'guitar',
  'camera', 'phone', 'laptop', 'clock', 'key', 'pencil', 'book', 'backpack', 'umbrella',
  'glasses', 'watch', 'candle', 'balloon', 'scissors', 'hammer', 'flashlight', 'telescope',

  // Transportation & Vehicles
  'car', 'airplane', 'rocket', 'bicycle', 'submarine', 'bus', 'train', 'helicopter',
  'sailboat', 'skateboard', 'scooter', 'tractor', 'ambulance', 'fire truck',

  // Nature & Landscapes
  'sun', 'moon', 'star', 'rainbow', 'volcano', 'tree', 'flower', 'mountain', 'island',
  'beach', 'waterfall', 'snowflake', 'lightning', 'cloud', 'ocean', 'river',

  // Buildings & Structures
  'house', 'castle', 'pyramid', 'bridge', 'lighthouse', 'windmill', 'skyscraper',
  'igloo', 'tent', 'statue of liberty', 'eiffel tower',

  // Fantasy & Characters
  'dragon', 'unicorn', 'robot', 'alien', 'pirate', 'ninja', 'superhero', 'ghost',
  'wizard', 'vampire', 'mermaid', 'snowman', 'dinosaur',

  // Sports & Fun
  'basketball', 'soccer', 'bowling', 'trophy', 'kite', 'yo-yo', 'palette', 'dice',
  'crown', 'diamond', 'treasure'
];

function getRandomWords(count = 3, excludeWords = []) {
  const available = words.filter(w => !excludeWords.includes(w));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  words,
  getRandomWords
};
