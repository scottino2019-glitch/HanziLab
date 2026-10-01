import { useState, useEffect } from 'react';
import { StrokeItem, StrokeStep } from '../../types/game';
import { playSound } from '../../utils/audio';

interface StrokeGameProps {
  items: StrokeItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function StrokeGame({ items, onFinishRound, onBackToMenu }: StrokeGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setCurrentStrokeIndex(0);
    setCompletedStrokes([]);
    setIsCompleted(false);
    setErrorMessage(null);
  }, [currentIndex]);

  if (!currentItem) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Nessun carattere trovato in stroke.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const handleStrokeClick = (clickedOrder: number, stroke: StrokeStep) => {
    if (isCompleted) return;

    const expectedOrder = currentStrokeIndex + 1;

    if (clickedOrder === expectedOrder) {
      playSound('stroke');
      const nextCompleted = [...completedStrokes, stroke.order];
      setCompletedStrokes(nextCompleted);
      setErrorMessage(null);

      if (nextCompleted.length === currentItem.totalStrokes) {
        setIsCompleted(true);
        playSound('victory');
      } else {
        setCurrentStrokeIndex(prev => prev + 1);
      }
    } else {
      playSound('wrong');
      const curStroke = currentItem.strokes[currentStrokeIndex];
      setErrorMessage(
        `Ordine errato! Devi tracciare il tratto ${expectedOrder}: ${curStroke?.description || curStroke?.name}`
      );
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishRound(100, elapsedSeconds);
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
        Ordine dei Tratti
      </h2>

      <div className="text-center mb-6 p-5 rounded-2xl bg-[#faf5ff] border-2 border-purple-300 shadow-xs">
        <p className="text-base font-bold text-purple-950 mb-1">
          ✍️ Impara a Scrivere
        </p>
        <p className="text-sm text-purple-900 font-medium">
          Clicca sui tratti nell&apos;ordine corretto per scrivere il carattere!
        </p>
      </div>

      <div className="text-center mb-4">
        <div className="text-6xl font-chinese font-bold mb-2 text-stone-900">
          {currentItem.char}
        </div>
        <p className="text-lg italic text-stone-700 font-semibold mb-1">«{currentItem.meaning}»</p>
        <p className="text-sm text-stone-600 font-medium">
          Tratto <span className="font-bold text-purple-700 font-mono text-base">{currentStrokeIndex + 1}</span> di <span className="font-mono text-base">{currentItem.totalStrokes}</span>
        </p>
      </div>

      {/* SVG Canvas */}
      <div className="relative mx-auto mb-6 w-[300px] h-[300px] border-2 border-purple-300 bg-[#fffdf9] rounded-3xl overflow-hidden shadow-sm select-none">
        <svg width="300" height="300" className="absolute inset-0">
          <line x1="150" y1="0" x2="150" y2="300" stroke="#e9d5ff" strokeWidth="2" strokeDasharray="4,4" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="#e9d5ff" strokeWidth="2" strokeDasharray="4,4" />
          <line x1="0" y1="0" x2="300" y2="300" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="4,4" />

          {/* Completed strokes */}
          {currentItem.strokes.map(stroke => {
            if (!completedStrokes.includes(stroke.order)) return null;

            if (stroke.path) {
              return (
                <path
                  key={stroke.order}
                  d={stroke.path}
                  fill="none"
                  stroke="#1e1b18"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            }

            return (
              <line
                key={stroke.order}
                x1={stroke.start.x}
                y1={stroke.start.y}
                x2={stroke.end.x}
                y2={stroke.end.y}
                stroke="#1e1b18"
                strokeWidth="15"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Clickable areas */}
        {!isCompleted && (
          <div className="absolute inset-0">
            {currentItem.strokes.map(stroke => {
              if (completedStrokes.includes(stroke.order)) return null;

              const minX = Math.min(stroke.start.x, stroke.end.x);
              const minY = Math.min(stroke.start.y, stroke.end.y);
              const width = Math.max(Math.abs(stroke.end.x - stroke.start.x), 50);
              const height = Math.max(Math.abs(stroke.end.y - stroke.start.y), 50);

              return (
                <div
                  key={stroke.order}
                  onClick={() => handleStrokeClick(stroke.order, stroke)}
                  style={{
                    left: `${minX - 15}px`,
                    top: `${minY - 15}px`,
                    width: `${width + 30}px`,
                    height: `${height + 30}px`
                  }}
                  className="absolute cursor-pointer border-2 border-dashed border-purple-400 bg-purple-500/15 hover:bg-purple-500/25 rounded-2xl flex items-center justify-center transition-colors"
                  title={stroke.description}
                >
                  <span className="text-xs font-bold text-purple-900 bg-white/95 px-2 py-0.5 rounded-full shadow-xs border border-purple-300">
                    {stroke.order}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error feedback */}
      {errorMessage && (
        <div className="p-3.5 bg-red-100 border-2 border-red-300 rounded-2xl text-center text-sm text-red-900 font-semibold mb-4 animate-in fade-in duration-150">
          {errorMessage}
        </div>
      )}

      {/* Finished feedback */}
      {isCompleted && (
        <div className="text-center p-5 bg-emerald-100/80 border-2 border-emerald-400 rounded-2xl mb-6 shadow-xs animate-in fade-in duration-200">
          <p className="font-bold text-emerald-950 text-lg mb-2">
            Perfetto! Hai completato il carattere! 🎉
          </p>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all cursor-pointer shadow-sm"
          >
            {currentIndex + 1 < items.length ? 'Prossimo Carattere →' : 'Termina Esercizio →'}
          </button>
        </div>
      )}
    </div>
  );
}
