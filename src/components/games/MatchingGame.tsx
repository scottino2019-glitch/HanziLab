import { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { MatchingItem, MatchingPair } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';

interface MatchingGameProps {
  items: MatchingItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function MatchingGame({ items, onFinishRound, onBackToMenu }: MatchingGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [shuffledRight, setShuffledRight] = useState<MatchingPair[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentRound = items[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (!currentRound) return;
    setMatchedIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    // Shuffle only the right column so positions don't align directly
    const shuffled = [...currentRound.pairs].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [currentIndex, currentRound]);

  if (!currentRound) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 mb-4">Nessun esercizio trovato in abbinamenti.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-stone-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const handleSelectLeft = (pair: MatchingPair) => {
    if (matchedIds.includes(pair.id)) return;
    playSound('click');
    setSelectedLeft(pair.id);

    // If right was already selected, check match
    if (selectedRight) {
      checkMatch(pair.id, selectedRight);
    }
  };

  const handleSelectRight = (pair: MatchingPair) => {
    if (matchedIds.includes(pair.id)) return;
    playSound('click');
    setSelectedRight(pair.id);

    // If left was already selected, check match
    if (selectedLeft) {
      checkMatch(selectedLeft, pair.id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct Match!
      const pair = currentRound.pairs.find(p => p.id === leftId);
      if (pair) {
        speakChinese(pair.right);
      }
      playSound('correct');

      const nextMatched = [...matchedIds, leftId];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setScore(prev => prev + 20);

      if (nextMatched.length === currentRound.pairs.length) {
        playSound('victory');
      }
    } else {
      // Wrong Match
      playSound('wrong');
      setWrongPair({ left: leftId, right: rightId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishRound(score + 40, elapsedSeconds);
    }
  };

  const isRoundComplete = currentRound && matchedIds.length === currentRound.pairs.length;

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
          Tempo: <strong className="text-stone-900 font-mono">{elapsedSeconds}s</strong> · Livello {currentIndex + 1}/{items.length}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center text-stone-900 font-chinese tracking-tight">
        Gioco di Abbinamenti
      </h2>

      {/* Instructions Banner */}
      <div className="text-center mb-6 p-4 rounded-2xl bg-[#fffbf0] border-2 border-amber-300 shadow-xs">
        <p className="text-base font-bold text-amber-950 mb-1">
          🔗 {currentRound.modeTitle}
        </p>
        <p className="text-sm text-amber-900 font-medium">
          {currentRound.instructions}
        </p>
        <div className="mt-2 text-xs font-bold text-amber-800">
          Abbinamenti completati: <span className="text-emerald-700 font-mono text-sm font-extrabold">{matchedIds.length}</span> / {currentRound.pairs.length}
        </div>
      </div>

      {/* Two Columns for Direct Matching */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 text-center pb-1">
            Elemento da Abbinare
          </div>
          {currentRound.pairs.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isWrong = wrongPair?.left === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => handleSelectLeft(pair)}
                disabled={isMatched}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between shadow-xs min-h-[68px] ${
                  isMatched
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 opacity-60 cursor-default'
                    : isWrong
                    ? 'bg-red-100 border-red-500 text-red-950 scale-98'
                    : isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-sm'
                    : 'bg-[#fffdf8] border-stone-300 hover:border-amber-400 hover:bg-[#fff9eb]'
                }`}
              >
                <div>
                  <div className="text-base font-bold text-stone-900">
                    {pair.left}
                  </div>
                  {pair.leftHint && (
                    <div className="text-xs text-stone-500 font-normal">
                      {pair.leftHint}
                    </div>
                  )}
                </div>

                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (Ideograms / Targets) */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 text-center pb-1">
            Ideogramma Cinese (Hanzi)
          </div>
          {shuffledRight.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedRight === pair.id;
            const isWrong = wrongPair?.right === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => handleSelectRight(pair)}
                disabled={isMatched}
                className={`w-full p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex items-center justify-between shadow-xs min-h-[68px] ${
                  isMatched
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 opacity-60 cursor-default'
                    : isWrong
                    ? 'bg-red-100 border-red-500 text-red-950 scale-98'
                    : isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-sm'
                    : 'bg-[#fffdf8] border-stone-300 hover:border-amber-400 hover:bg-[#fff9eb]'
                }`}
              >
                <div className="flex-1 text-center">
                  <div className="text-3xl font-chinese font-bold text-stone-900">
                    {pair.right}
                  </div>
                  {pair.pinyin && (
                    <div className="text-xs font-mono font-semibold text-red-700">
                      {pair.pinyin}
                    </div>
                  )}
                </div>

                <div className="w-6 flex justify-end">
                  {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isRoundComplete && (
        <div className="p-6 bg-emerald-100/90 border-2 border-emerald-400 rounded-3xl text-center shadow-sm animate-in fade-in duration-200">
          <p className="font-bold text-emerald-950 text-lg mb-1">
            Bravissimo! Tutti gli abbinamenti sono corretti! 🎉
          </p>
          <p className="text-sm text-emerald-900 mb-5">
            Hai completato questo set di vocaboli ed elementi.
          </p>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <span>{currentIndex + 1 < items.length ? 'Prossimo Livello di Abbinamenti' : 'Termina Esercizio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
