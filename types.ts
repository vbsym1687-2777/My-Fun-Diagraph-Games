export interface DigraphGroup {
  id: string;
  digraph: string; // e.g., "ch", "sh"
  words: string[]; // e.g., ["chat", "chip"]
  images: Record<string, string>; // word -> emoji/url mapping
  // rhymes property removed/deprecated in favor of separate dataset, 
  // keeping it optional in interface for backward compatibility if needed, 
  // but logic will rely on RhymeGroup
  rhymes?: Record<string, string>; 
}

export interface RhymeGroup {
  id: string;
  sound: string; // e.g., "at" (cat, bat)
  words: string[]; // e.g., ["cat", "bat", "rat"]
}

export interface AppData {
  groups: DigraphGroup[];
  rhymeGroups: RhymeGroup[];
  pin: string;
}

export interface Progress {
  [digraph: string]: {
    correct: number;
    total: number;
  };
}

export enum GameType {
  FIND_DIGRAPH = 'find_digraph',
  FILL_MISSING = 'fill_missing',
  RHYMING = 'rhyming',
  WORD_PUZZLE = 'word_puzzle',
  SORTING = 'sorting',
  WHEEL = 'wheel',
  ODD_ONE_OUT = 'odd_one_out',
  BUILD_WORD = 'build_word',
}

export interface GameConfig {
  id: GameType;
  title: string;
  color: string;
  icon: string;
}