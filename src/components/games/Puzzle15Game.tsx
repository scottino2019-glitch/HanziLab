import { useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff, Trophy, ArrowRight } from 'lucide-react';
import { Puzzle15Item, PuzzleTile } from '../../types/game';
import { playSound, speakChinese } from '../../utils/audio';

interface Puzzle15GameProps {
  items: Puzzle15Item[];
  onFinishRound: (score: number, timeSpent: number) => void;
  onBackToMenu: () => void;
}

export function Puzzle15Game({ items, onFinishRound, onBackToMenu }: Puzzle15GameProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [board, setBoard] = useState<(PuzzleTile | null)[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showNumbersHelp, setShowNumbersHelp] = useState(false);

  const currentLevel = items[levelIndex];
  const size = currentLevel?.size || 4;
  const totalSlots = size * size;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Scramble board by making valid moves from solved state (guarantees 100% solvability)
  const initScrambledBoard = () => {
    if (!currentLevel) return;

    // Start with solved array: tiles 1..N-1 followed by null
    const initial: (PuzzleTile | null)[] = [...currentLevel.tiles];
    while (initial.length < totalSlots - 1) {
      initial.push({ id: initial.length + 1, content: `${initial.length + 1}` });
    }
    initial.push(null); // empty space in last slot

    // Perform random legal moves to shuffle
    let blankIndex = totalSlots - 1;
    let prevMove = -1;
    const movesCount = size === 3 ? 60 : 120;

    for (let i = 0; i < movesCount; i++) {
      const neighbors: number[] = [];
      const row = Math.floor(blankIndex / size);
      const col = blankIndex % size;

      if (row > 0) neighbors.push(blankIndex - size); // UP
      if (row < size - 1) neighbors.push(blankIndex + size); // DOWN
      if (col > 0) neighbors.push(blankIndex - 1); // LEFT
      if (col < size - 1) neighbors.push(blankIndex + 1); // RIGHT

      // Avoid immediately undoing the previous move
      const validNeighbors = neighbors.filter(idx => idx !== prevMove);
      const chosen = validNeighbors.length > 0
        ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
        : neighbors[0];

      // Swap blank with chosen
      initial[blankIndex] = initial[chosen];
      initial[chosen] = null;
      prevMove = blankIndex;
      blankIndex = chosen;
    }

    setBoard(initial);
    setMoves(0);
    setIsSolved(false);
  };

  useEffect(() => {
    initScrambledBoard();
  }, [levelIndex, currentLevel]);

  if (!currentLevel) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 mb-4">Nessun livello trovato in puzzle15.json.</p>
        <button onClick={onBackToMenu} className="px-5 py-2.5 bg-stone-800 text-white rounded-xl">
          ← Torna al Menu
        </button>
      </div>
    );
  }

  const handleTileClick = (clickedIndex: number) => {
    if (isSolved) return;

    const blankIndex = board.findIndex(t => t === null);
    if (blankIndex === -1) return;

    const clickedRow = Math.floor(clickedIndex / size);
    const clickedCol = clickedIndex % size;
    const blankRow = Math.floor(blankIndex / size);
    const blankCol = blankIndex % size;

    // Check if adjacent (one step horizontal or vertical)
    const isAdjacent =
      (Math.abs(clickedRow - blankRow) === 1 && clickedCol === blankCol) ||
      (Math.abs(clickedCol - blankCol) === 1 && clickedRow === blankRow);

    if (isAdjacent) {
      const nextBoard = [...board];
      const clickedTile = nextBoard[clickedIndex];
      nextBoard[blankIndex] = clickedTile;
      nextBoard[clickedIndex] = null;
      setBoard(nextBoard);
      setMoves(prev => prev + 1);
      playSound('click');

      if (clickedTile?.content) {
        speakChinese(clickedTile.content);
      }

      // Check if solved
      checkWin(nextBoard);
    }
  };

  const checkWin = (currentBoard: (PuzzleTile | null)[]) => {
    // Blank must be at last index
    if (currentBoard[totalSlots - 1] !== null) return;

    for (let i = 0; i < totalSlots - 1; i++) {
      if (!currentBoard[i] || currentBoard[i]?.id !== i + 1) {
        return;
      }
    }

    // WIN!
    setIsSolved(true);
    playSound('victory');
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < items.length) {
      setLevelIndex(prev => prev + 1);
    } else {
      onFinishRound(150, elapsedSeconds);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-sm transition-colors cursor-pointer border border-stone-300 shadow-2xs"
        >
          ← Torna al Menu
        </button>
        <div className="text-sm font-semibold text-stone-600 bg-stone-200/60 px-3 py-1.5 rounded-lg border border-stone-300">
          Tempo: <strong className="text-stone-900 font-mono">{elapsedSeconds}s</strong> · Mosse: <strong className="text-stone-900 font-mono">{moves}</strong>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center text-stone-900 font-chinese tracking-tight">
        {currentLevel.title}
      </h2>

      {/* Description banner */}
      <div className="text-center mb-6 p-4 rounded-2xl bg-[#fffbf0] border-2 border-amber-300 shadow-xs">
        <p className="text-sm text-amber-950 font-medium">
          {currentLevel.description}
        </p>

        {/* Level Switcher & Help Toggle */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-amber-200 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-amber-100/80 p-1 rounded-xl">
            {items.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => setLevelIndex(idx)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  levelIndex === idx
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-amber-900 hover:bg-amber-200'
                }`}
              >
                {lvl.size}x{lvl.size}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNumbersHelp(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-stone-50 border border-amber-300 rounded-xl text-stone-700 font-semibold cursor-pointer shadow-2xs"
          >
            {showNumbersHelp ? <EyeOff className="w-3.5 h-3.5 text-stone-500" /> : <Eye className="w-3.5 h-3.5 text-stone-500" />}
            <span>{showNumbersHelp ? 'Nascondi numeri arabi' : 'Aiuto numeri (1, 2...)'}</span>
          </button>
        </div>
      </div>

      {/* Sliding Puzzle Board */}
      <div className="flex justify-center mb-6">
        <div
          className={`p-3.5 rounded-3xl bg-[#e5dacb] border-4 border-[#bca894] shadow-md grid gap-2.5 sm:gap-3 ${
            size === 3 ? 'grid-cols-3 w-[320px] sm:w-[360px]' : 'grid-cols-4 w-[340px] sm:w-[420px]'
          }`}
        >
          {board.map((tile, idx) => {
            if (!tile) {
              // Empty Slot
              return (
                <div
                  key="blank"
                  className="rounded-2xl border-2 border-dashed border-[#cbb8a2] bg-[#dcd0bf]/40 flex items-center justify-center aspect-square shadow-inner"
                >
                  <span className="text-xs text-[#a89580] font-mono select-none">空</span>
                </div>
              );
            }

            const isCorrectPosition = tile.id === idx + 1;

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(idx)}
                className={`relative rounded-2xl border-2 p-1 flex flex-col items-center justify-center aspect-square select-none transition-all duration-150 cursor-pointer shadow-sm hover:scale-102 active:scale-98 ${
                  isSolved
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                    : isCorrectPosition
                    ? 'bg-[#fffef8] border-amber-400 text-stone-900 hover:border-amber-500'
                    : 'bg-[#fffaf0] border-stone-300 text-stone-800 hover:border-amber-400'
                }`}
              >
                {/* Chinese Character */}
                <span
                  className={`font-chinese font-bold leading-none ${
                    size === 3
                      ? 'text-4xl sm:text-5xl'
                      : tile.content.length > 1
                      ? 'text-2xl sm:text-3xl'
                      : 'text-3xl sm:text-4xl'
                  }`}
                >
                  {tile.content}
                </span>

                {/* Pinyin Subtitle */}
                {tile.pinyin && (
                  <span className="text-[10px] font-mono text-red-700 font-semibold mt-0.5">
                    {tile.pinyin}
                  </span>
                )}

                {/* Optional Arabic Number Helper Badge */}
                {showNumbersHelp && (
                  <span className="absolute top-1 right-1.5 text-[10px] font-mono text-stone-400 font-bold">
                    {tile.arabic || tile.id}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={initScrambledBoard}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 border border-stone-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rimescola Caselle</span>
        </button>
      </div>

      {/* Solved Celebration Modal */}
      {isSolved && (
        <div className="p-6 bg-emerald-100/95 border-2 border-emerald-400 rounded-3xl text-center shadow-md animate-in fade-in duration-200 mb-6">
          <div className="w-12 h-12 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-emerald-950 mb-1">
            Complimenti! Enigma del 15 Risolto! 🎉
          </h3>
          <p className="text-sm text-emerald-900 mb-4">
            Hai ordinato perfettamente tutte le caselle in <strong>{moves} mosse</strong> e {elapsedSeconds} secondi!
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={initScrambledBoard}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 cursor-pointer shadow-2xs"
            >
              Gioca ancora
            </button>
            <button
              onClick={handleNextLevel}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>{levelIndex + 1 < items.length ? 'Prossimo Schema' : 'Termina Esercizio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
