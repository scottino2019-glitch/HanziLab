import { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { RadicalItem } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';
import { getRadicalMeaning } from '../../services/dataService';

interface RadicalsGameProps {
  items: RadicalItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function RadicalsGame({ items, onFinishRound, onBackToMenu }: RadicalsGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [foundRadicals, setFoundRadicals] = useState<string[]>([]);
  const [wrongSelection, setWrongSelection] = useState<string | null>(null);
  const [gridOptions, setGridOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentItem = items[currentIndex];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Setup options for current character
  useEffect(() => {
    if (!currentItem) return;

    const all = [...currentItem.radicals, ...currentItem.distractors];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setGridOptions(shuffled);
    setFoundRadicals([]);
    setWrongSelection(null);
    setIsCompleted(false);
  }, [currentIndex, currentItem]);

  if (!currentItem) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Nessun carattere trovato in radicals.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const requiredCount = currentItem.radicals.length;
  const foundCount = foundRadicals.length;

  const handleSelectRadical = (radical: string) => {
    if (isCompleted) return;

    const requiredForThis = currentItem.radicals.filter(r => r === radical).length;
    const foundOfThis = foundRadicals.filter(r => r === radical).length;

    if (requiredForThis > foundOfThis) {
      const nextFound = [...foundRadicals, radical];
      setFoundRadicals(nextFound);
      playSound('correct');

      if (nextFound.length === requiredCount) {
        setIsCompleted(true);
        setScore(prev => prev + 30);
        playSound('victory');
      }
    } else {
      setWrongSelection(radical);
      playSound('wrong');
      setTimeout(() => setWrongSelection(null), 800);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishRound(score + 30, elapsedSeconds);
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
          Tempo: <strong className="text-stone-900 font-mono">{elapsedSeconds}s</strong> · Esercizio {currentIndex + 1}/{items.length}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-stone-900 font-chinese tracking-tight">
        Caccia ai Radicali
      </h2>

      {/* Main Target Character */}
      <div className="bg-[#fffdf8] rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm text-center mb-6">
        <p className="text-base text-stone-700 font-medium mb-3">
          Trova tutti i radicali nascosti in questo carattere complesso!
        </p>

        <div className="inline-flex flex-col items-center justify-center my-2">
          <div className="w-32 h-32 tianzige-grid border-2 border-red-400 rounded-2xl flex items-center justify-center shadow-inner mb-3">
            <span className="text-7xl font-chinese font-bold text-stone-900 select-none">
              {currentItem.char}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-red-700">{currentItem.pinyin}</span>
            <button
              onClick={() => speakChinese(currentItem.char)}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors"
              title="Ascolta pronuncia"
            >
              <Volume2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
          <p className="text-sm text-stone-600 italic font-medium mt-1">«{currentItem.meaning}»</p>
        </div>

        {/* Found Radicals Counter */}
        <div className="mt-4 pt-4 border-t border-amber-100">
          <p className="font-semibold text-sm mb-3 text-stone-800">
            Radicali trovati: <span className="text-emerald-700 font-mono font-bold text-base">{foundCount}</span> / <span className="font-mono text-base">{requiredCount}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 min-h-8">
            {foundRadicals.map((rad, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-sm font-chinese font-bold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{rad} ({getRadicalMeaning(rad)})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Radicals Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {gridOptions.map((rad, idx) => {
          const isWrong = wrongSelection === rad;
          const meaning = getRadicalMeaning(rad);

          return (
            <button
              key={idx}
              onClick={() => handleSelectRadical(rad)}
              disabled={isCompleted}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center shadow-xs ${
                isWrong
                  ? 'bg-red-100 border-red-500 scale-95'
                  : 'bg-[#fbf6ec] border-stone-300 hover:bg-[#fff9ed] hover:border-red-500 hover:-translate-y-0.5'
              }`}
            >
              <span className="text-3xl font-chinese font-bold text-stone-900">
                {rad}
              </span>
              <span className="text-xs text-stone-600 font-medium mt-1 truncate max-w-full">
                {meaning}
              </span>
            </button>
          );
        })}
      </div>

      {/* Success Box */}
      {isCompleted && (
        <div className="bg-[#ecfdf5] border-2 border-emerald-300 rounded-2xl p-5 text-center mb-6 shadow-sm animate-in fade-in duration-200">
          <h3 className="text-lg font-bold text-emerald-950 mb-1">
            Complimenti! Hai trovato tutti i radicali! 🎉
          </h3>
          <p className="text-sm text-emerald-900 mb-4 max-w-xl mx-auto">
            {currentItem.explanation}
          </p>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{currentIndex + 1 < items.length ? 'Prossimo Carattere' : 'Termina Esercizio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
