import { DigraphGroup, GameConfig, GameType, RhymeGroup } from './types';

export const DEFAULT_PIN = "0000";

export const INITIAL_GROUPS: DigraphGroup[] = [
  {
    id: 'g1',
    digraph: 'ch',
    words: ['chip', 'chat', 'rich', 'chop', 'chin'],
    images: {
      'chip': '🍟', 'chat': '💬', 'rich': '💰', 'chop': '🪓', 'chin': '🤔'
    }
  },
  {
    id: 'g2',
    digraph: 'sh',
    words: ['ship', 'fish', 'shop', 'shell', 'shoe'],
    images: {
      'ship': '🚢', 'fish': '🐟', 'shop': '🏪', 'shell': '🐚', 'shoe': '👟'
    }
  },
  {
    id: 'g3',
    digraph: 'th',
    words: ['moth', 'bath', 'path', 'thin', 'math'],
    images: {
      'moth': '🦋', 'bath': '🛁', 'path': '🛣️', 'thin': '📏', 'math': '➗'
    }
  },
  {
    id: 'g4',
    digraph: 'wh',
    words: ['whale', 'whip', 'wheel', 'white', 'whisk'],
    images: {
      'whale': '🐋', 'whip': '🤠', 'wheel': '🎡', 'white': '⬜', 'whisk': '🍳'
    }
  }
];

export const INITIAL_RHYME_GROUPS: RhymeGroup[] = [
  { id: 'r1', sound: 'at', words: ['cat', 'bat', 'rat', 'mat', 'hat'] },
  { id: 'r2', sound: 'og', words: ['dog', 'log', 'frog', 'fog', 'jog'] },
  { id: 'r3', sound: 'en', words: ['hen', 'pen', 'ten', 'men', 'den'] },
  { id: 'r4', sound: 'ip', words: ['ship', 'chip', 'dip', 'lip', 'tip'] },
  { id: 'r5', sound: 'an', words: ['fan', 'man', 'pan', 'van', 'can'] },
  { id: 'r6', sound: 'op', words: ['hop', 'pop', 'mop', 'top', 'shop'] }
];

export const GAMES: GameConfig[] = [
  { id: GameType.FIND_DIGRAPH, title: "Find the Digraph", color: "bg-yellow-400", icon: "🔍" },
  { id: GameType.FILL_MISSING, title: "Fill Missing", color: "bg-green-400", icon: "✏️" },
  { id: GameType.RHYMING, title: "Rhyming Match", color: "bg-blue-400", icon: "🎵" },
  { id: GameType.WORD_PUZZLE, title: "Word Puzzle", color: "bg-red-400", icon: "🧩" },
  { id: GameType.SORTING, title: "Sorting Game", color: "bg-purple-400", icon: "🧺" },
  { id: GameType.WHEEL, title: "Spin the Wheel", color: "bg-orange-400", icon: "🎡" },
  { id: GameType.ODD_ONE_OUT, title: "Odd One Out", color: "bg-pink-400", icon: "🤔" },
  { id: GameType.BUILD_WORD, title: "Build Word", color: "bg-teal-400", icon: "🏗️" },
];