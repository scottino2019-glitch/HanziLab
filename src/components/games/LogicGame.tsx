import { useState, useEffect } from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { LogicItem } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';

interface LogicGameProps {
  items: LogicItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function LogicGame({ items, onFinishRound, onBackToMenu }: LogicGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentItem = items[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex]);

  if (!currentItem) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Nessun elemento trovato in logic.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentItem.answer;
    setIsCorrect(correct);

    if (correct) {
      playSound('correct');
      setScore(prev => prev + 30);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishRound(score + (isCorrect ? 30 : 0), elapsedSeconds);
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
        Logica dei Caratteri
      </h2>

      {/* Main Puzzle Card */}
      <div className="bg-[#fffdf8] rounded-3xl p-6 sm:p-8 border-2 border-sky-300 shadow-sm mb-6 text-center">
        <div className="p-4 rounded-2xl bg-sky-100/70 border border-sky-300 mb-6 text-center">
          <p className="text-base font-bold text-sky-950 mb-1">
            🧩 Enigma della Composizione
          </p>
          <p className="text-sm text-sky-900 font-medium">
            Indovina quale carattere corrisponde alla pronuncia e al significato indicati.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-5xl font-bold font-mono text-stone-900">{currentItem.pinyin}</span>
          <button
            onClick={() => speakChinese(currentItem.answer)}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-xl cursor-pointer transition-colors"
            title="Ascolta pronuncia"
          >
            <Volume2 className="w-5 h-5 text-red-600" />
          </button>
        </div>

        <div className="text-xl italic font-serif text-stone-700 mb-4 font-semibold">
          «{currentItem.meaning}»
        </div>

        <div className="p-4 rounded-xl bg-amber-100/80 border-2 border-amber-300 text-sm text-amber-950 max-w-md mx-auto mb-2 font-medium shadow-2xs">
          💡 <strong>Indizio:</strong> {currentItem.hint}
        </div>
      </div>

      <p className="text-sm font-semibold text-stone-700 text-center mb-4">
        Scegli la risposta corretta:
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {currentItem.options.map((opt, idx) => {
          let style = 'bg-[#f0f9ff] border-sky-300 hover:border-sky-500 hover:bg-[#e0f2fe] text-stone-900 shadow-xs';

          if (isAnswered) {
            if (opt === currentItem.answer) {
              style = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs';
            } else if (opt === selectedOption && !isCorrect) {
              style = 'bg-red-100 border-red-500 text-red-950';
            } else {
              style = 'bg-stone-200 border-stone-300 opacity-40';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
              className={`p-6 rounded-2xl border-2 text-center text-5xl font-chinese font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {isAnswered && (
        <div
          className={`p-5 rounded-2xl border-2 text-center mb-6 shadow-xs animate-in fade-in duration-200 ${
            isCorrect ? 'bg-emerald-100/80 border-emerald-400' : 'bg-red-100/80 border-red-400'
          }`}
        >
          <p className="font-bold text-lg mb-1 text-stone-900">
            {isCorrect ? 'Perfetto! Hai capito la logica! 🎉' : `La risposta corretta era: ${currentItem.answer}`}
          </p>
          <p className="text-sm text-stone-800 mb-4 max-w-lg mx-auto">
            {currentItem.explanation}
          </p>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <span>{currentIndex + 1 < items.length ? 'Prossimo Enigma' : 'Termina Esercizio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
