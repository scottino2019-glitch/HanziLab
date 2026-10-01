export type GameType = 
  | 'radicals' 
  | 'evolution' 
  | 'logic' 
  | 'memory' 
  | 'stroke' 
  | 'pronunciation';

export interface GameCatalogItem {
  id: GameType;
  name: string;
  chineseName: string;
  file: string;
  icon: string;
  description: string;
  learningFocus: string;
}

export interface RadicalItem {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  radicals: string[];
  distractors: string[];
  explanation: string;
  level?: string;
}

export interface EvolutionStage {
  symbol: string;
  label: string;
  description: string;
}

export interface EvolutionItem {
  id: string;
  char: string;
  meaning: string;
  pinyin: string;
  explanation: string;
  stages: EvolutionStage[];
}

export interface LogicItem {
  id: string;
  components: string[];
  pinyin: string;
  meaning: string;
  answer: string;
  options: string[];
  hint: string;
  explanation: string;
  category?: string;
}

export interface MemoryItem {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  category?: string;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeStep {
  order: number;
  name: string;
  type: string;
  start: StrokePoint;
  end: StrokePoint;
  path?: string;
  description: string;
}

export interface StrokeItem {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  rule: string;
  totalStrokes: number;
  strokes: StrokeStep[];
}

export interface PronunciationItem {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  options: string[];
  tone: number;
  explanation: string;
}

export interface GameScoreRecord {
  gameType: GameType;
  score: number;
  timeSpentSec: number;
  itemsAnswered: number;
  timestamp: string;
}
