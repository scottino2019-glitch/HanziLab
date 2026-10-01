import { useState, useEffect } from 'react';
import { EvolutionItem, EvolutionStage } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';

interface EvolutionGameProps {
  items: EvolutionItem[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function EvolutionGame({ items, onFinishRound, onBackToMenu }: EvolutionGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedStages, setPlacedStages] = useState<(EvolutionStage | null)[]>([]);
  const [availablePieces, setAvailablePieces] = useState<EvolutionStage[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; checked: boolean }>({
    isCorrect: false,
    checked: false
  });
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
    if (!currentItem) return;

    const shuffled = [...currentItem.stages].sort(() => Math.random() - 0.5);
    setAvailablePieces(shuffled);
    setPlacedStages(new Array(currentItem.stages.length).fill(null));
    setFeedback({ isCorrect: false, checked: false });
  }, [currentIndex, currentItem]);

  if (!currentItem) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Nessun carattere trovato in evolution.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const handleSelectPiece = (stage: EvolutionStage) => {
    if (feedback.checked && feedback.isCorrect) return;

    const firstEmptyIndex = placedStages.findIndex(s => s === null);
    if (firstEmptyIndex === -1) return;

    const nextPlaced = [...placedStages];
    nextPlaced[firstEmptyIndex] = stage;
    setPlacedStages(nextPlaced);

    setAvailablePieces(prev => {
      const idx = prev.findIndex(p => p.symbol === stage.symbol);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });

    playSound('click');
  };

  const handleRemoveFromSlot = (index: number) => {
    if (feedback.checked && feedback.isCorrect) return;

    const stage = placedStages[index];
    if (!stage) return;

    const nextPlaced = [...placedStages];
    nextPlaced[index] = null;
    setPlacedStages(nextPlaced);
    setAvailablePieces(prev => [...prev, stage]);
    setFeedback({ isCorrect: false, checked: false });
    playSound('click');
  };

  const handleVerify = () => {
    if (placedStages.some(s => s === null)) {
      playSound('wrong');
      return;
    }

    const isExact = placedStages.every((stage, idx) => stage?.symbol === currentItem.stages[idx].symbol);

    if (isExact) {
      playSound('correct');
      playSound('victory');
      setFeedback({ isCorrect: true, checked: true });
      setScore(prev => prev + 50);
    } else {
      playSound('wrong');
      setFeedback({ isCorrect: false, checked: true });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishRound(score + 50, elapsedSeconds);
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
        Evoluzione dei Caratteri
      </h2>

      {/* Instruction box */}
      <div className="text-center mb-6 p-5 rounded-2xl bg-[#fffbf0] border-2 border-amber-300 shadow-xs">
        <p className="text-base font-bold text-amber-950 mb-1">
          📜 Come si è evoluto questo carattere nella storia?
        </p>
        <p className="text-sm text-amber-900 mb-3 font-medium">
          Clicca sui simboli in basso per posizionarli in ordine dal reperto antico (sinistra) al carattere moderno (destra)
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-100/70 px-4 py-1.5 rounded-full border border-amber-300">
          <span className="text-xs text-amber-800 font-medium">Carattere finale:</span>
          <span className="text-3xl font-chinese font-bold text-stone-900">{currentItem.char}</span>
          <span className="text-xs text-amber-900 italic font-semibold">«{currentItem.meaning}»</span>
        </div>
      </div>

      {/* Ancient -> Modern Indicator */}
      <div className="mb-3 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <span>Antico</span>
          <div className="w-16 h-0.5 bg-amber-400"></div>
          <span>Moderno</span>
        </div>
      </div>

      {/* 4 Timeline Slots */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8 flex-wrap">
        {placedStages.map((stage, idx) => {
          const isSlotCorrect = feedback.checked && stage?.symbol === currentItem.stages[idx].symbol;
          const isSlotWrong = feedback.checked && stage !== null && !isSlotCorrect;

          const labels = ['1° Pittogramma', '2° Semplificato', '3° Stilizzato', '4° Moderno'];

          return (
            <div key={idx} className="flex items-center gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-xs mb-1 text-stone-600 font-bold">{labels[idx]}</div>
                <div
                  onClick={() => handleRemoveFromSlot(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-3 border-dashed flex items-center justify-center text-3xl font-chinese cursor-pointer transition-all ${
                    stage
                      ? isSlotCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : isSlotWrong
                        ? 'bg-red-100 border-red-500 text-red-950 font-bold shadow-xs'
                        : 'bg-[#fffdf8] border-amber-500 text-stone-900 shadow-sm'
                      : 'border-amber-300/80 bg-[#fcf8ee] text-amber-300 hover:border-amber-500'
                  }`}
                >
                  {stage ? stage.symbol : '?'}
                </div>
              </div>
              {idx < 3 && <div className="text-2xl text-amber-400 font-bold">→</div>}
            </div>
          );
        })}
      </div>

      {/* Symbols list */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-stone-700 mb-3">
          Clicca sui simboli qui sotto per posizionarli in ordine:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {availablePieces.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPiece(stage)}
              className="p-4 rounded-2xl border-2 border-stone-300 bg-[#fbf6ec] hover:border-amber-500 hover:bg-[#fff9ed] text-3xl font-chinese text-center shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              {stage.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Action / Check Button */}
      <div className="text-center mb-6">
        {!feedback.isCorrect ? (
          <button
            onClick={handleVerify}
            disabled={placedStages.some(s => s === null)}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-40 text-white transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Verifica Sequenza
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all cursor-pointer shadow-sm hover:shadow"
          >
            {currentIndex + 1 < items.length ? 'Prossima Evoluzione →' : 'Termina Esercizio →'}
          </button>
        )}
      </div>

      {/* Explanation when verified */}
      {feedback.checked && feedback.isCorrect && (
        <div className="p-5 bg-emerald-100/80 border-2 border-emerald-400 rounded-2xl text-center shadow-xs animate-in fade-in duration-200">
          <p className="font-bold text-emerald-950 text-base mb-1">Bravissimo! Sequenza Esatta! 🎉</p>
          <p className="text-sm text-emerald-900">{currentItem.explanation}</p>
        </div>
      )}
    </div>
  );
}
