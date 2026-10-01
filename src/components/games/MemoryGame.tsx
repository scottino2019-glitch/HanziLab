import { useState, useEffect } from 'react';
import { MemoryItem } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';

interface MemoryCard {
  uid: string;
  itemId: string;
  type: 'char' | 'meaning';
  content: string;
  char: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  items: MemoryItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function MemoryGame({ items, onFinishRound, onBackToMenu }: MemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pairCount = 6;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const initDeck = () => {
    if (items.length === 0) return;

    const selected = [...items].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const generated: MemoryCard[] = [];

    selected.forEach((item, idx) => {
      generated.push({
        uid: `c_${item.id}_${idx}`,
        itemId: item.id,
        type: 'char',
        content: item.char,
        char: item.char,
        isFlipped: false,
        isMatched: false
      });
      generated.push({
        uid: `m_${item.id}_${idx}`,
        itemId: item.id,
        type: 'meaning',
        content: item.meaning,
        char: item.char,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(generated.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initDeck();
  }, [items]);

  const handleCardClick = (clickedCard: MemoryCard) => {
    if (isLocked || clickedCard.isFlipped || clickedCard.isMatched) return;

    if (clickedCard.type === 'char') {
      speakChinese(clickedCard.char);
    }

    playSound('card_flip');

    const nextCards = cards.map(c => (c.uid === clickedCard.uid ? { ...c, isFlipped: true } : c));
    setCards(nextCards);

    const currentFlipped = [...flippedCards, clickedCard];
    setFlippedCards(currentFlipped);

    if (currentFlipped.length === 2) {
      setIsLocked(true);
      const [cardA, cardB] = currentFlipped;

      if (cardA.itemId === cardB.itemId && cardA.type !== cardB.type) {
        playSound('correct');
        speakChinese(cardA.char);

        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.itemId === cardA.itemId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);

          if (newMatched === pairCount) {
            playSound('victory');
            setTimeout(() => {
              onFinishRound(100, elapsedSeconds);
            }, 1200);
          }
        }, 500);
      } else {
        setTimeout(() => {
          playSound('wrong');
          setCards(prev =>
            prev.map(c =>
              c.uid === cardA.uid || c.uid === cardB.uid ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-sm transition-colors cursor-pointer border border-stone-300 shadow-2xs"
        >
          ← Torna al Menu
        </button>
        <div className="text-sm font-semibold text-stone-600 bg-stone-200/60 px-3 py-1.5 rounded-lg border border-stone-300">
          Tempo: <strong className="text-stone-900 font-mono">{elapsedSeconds}s</strong>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-stone-900 font-chinese tracking-tight">
        Memory Cinese
      </h2>

      <div className="text-center mb-6 p-5 rounded-2xl bg-[#f0fdf4] border-2 border-emerald-300 shadow-xs">
        <p className="text-base font-bold text-emerald-950 mb-1">
          🧠 Allena la Memoria
        </p>
        <p className="text-sm text-emerald-900 font-medium">
          Trova le coppie abbinando ogni carattere cinese al suo significato italiano!
        </p>
      </div>

      <div className="text-center mb-4">
        <p className="font-bold text-base text-stone-800">
          Coppie trovate: <span className="text-emerald-700 font-mono text-lg">{matchedPairs}</span> / <span className="font-mono text-lg">{pairCount}</span>
        </p>
      </div>

      {/* Grid of 12 cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 mb-6">
        {cards.map(card => {
          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl border-2 flex items-center justify-center text-center cursor-pointer transition-all duration-200 select-none p-2 ${
                card.isMatched
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-xs'
                  : card.isFlipped
                  ? 'bg-[#fffdf8] border-red-500 text-stone-900 shadow-md scale-102'
                  : 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 border-amber-950 text-amber-100 shadow-xs hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                card.type === 'char' ? (
                  <span className="text-4xl sm:text-5xl font-chinese font-bold text-stone-900">
                    {card.content}
                  </span>
                ) : (
                  <span className="text-sm sm:text-base font-bold text-stone-800 px-1 leading-snug">
                    {card.content}
                  </span>
                )
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-chinese font-bold text-amber-200/90 select-none">字</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300/80">Hanzi</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
