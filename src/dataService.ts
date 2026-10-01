import { GameType, RadicalItem, EvolutionItem, LogicItem, MemoryItem, StrokeItem, PronunciationItem, GameCatalogItem } from '../types/game';

let cachedRadicalMeanings: Record<string, string> = {
  "木": "legno / albero",
  "日": "sole",
  "月": "luna",
  "人": "persona",
  "亻": "persona",
  "女": "donna",
  "子": "bambino",
  "宀": "tetto",
  "豕": "maiale",
  "水": "acqua",
  "氵": "acqua",
  "火": "fuoco",
  "土": "terra",
  "金": "metallo",
  "心": "cuore",
  "手": "mano",
  "口": "bocca",
  "目": "occhio",
  "耳": "orecchio",
  "足": "piede",
  "山": "montagna",
  "石": "pietra",
  "田": "campo",
  "竹": "bambù",
  "言": "parola",
  "相": "osservare",
  "斤": "ascia",
  "乞": "chiedere",
  "曷": "cosa",
  "冖": "copertura"
};

export async function loadRadicalMeanings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/data/radical_meanings.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      cachedRadicalMeanings = { ...cachedRadicalMeanings, ...data };
    }
  } catch {
    // Keep cached
  }
  return cachedRadicalMeanings;
}

export function getRadicalMeaning(radical: string): string {
  return cachedRadicalMeanings[radical] || "componente";
}

export async function loadGameCatalog(): Promise<GameCatalogItem[]> {
  try {
    const res = await fetch(`/data/games_catalog.json?t=${Date.now()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback catalog
  }

  return [
    {
      id: "radicals",
      name: "Caccia ai Radicali",
      chineseName: "部首",
      file: "radicals.json",
      icon: "Search",
      description: "Trova i componenti nascosti nei caratteri",
      learningFocus: "Radicali"
    },
    {
      id: "evolution",
      name: "Evoluzione Caratteri",
      chineseName: "演化",
      file: "evolution.json",
      icon: "History",
      description: "Ricostruisci la storia dei simboli",
      learningFocus: "Etimologia"
    },
    {
      id: "logic",
      name: "Logica Cinese",
      chineseName: "逻辑",
      file: "logic.json",
      icon: "Puzzle",
      description: "Indovina il carattere dai suoi elementi",
      learningFocus: "Composizione"
    },
    {
      id: "memory",
      name: "Memory Cinese",
      chineseName: "记忆",
      file: "memory.json",
      icon: "Layers",
      description: "Abbina caratteri e significati",
      learningFocus: "Vocabolario"
    },
    {
      id: "stroke",
      name: "Ordine Tratti",
      chineseName: "笔画",
      file: "stroke.json",
      icon: "PenTool",
      description: "Impara l'ordine corretto dei tratti",
      learningFocus: "Tratti"
    },
    {
      id: "pronunciation",
      name: "Quiz Pronuncia",
      chineseName: "拼音",
      file: "pronunciation.json",
      icon: "Volume2",
      description: "Abbina caratteri alla pronuncia corretta",
      learningFocus: "Pinyin"
    }
  ];
}

/**
 * Loads game data directly from /data/{gameType}.json.
 * Users can update the JSON file in public/data/ at any time;
 * reloading the page fetches the updated data with no compilation needed.
 */
export async function loadGameData<T>(gameType: GameType): Promise<T[]> {
  try {
    const res = await fetch(`/data/${gameType}.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as T[];
      }
    }
  } catch (err) {
    console.warn(`Impossibile caricare /data/${gameType}.json:`, err);
  }

  return [];
}
