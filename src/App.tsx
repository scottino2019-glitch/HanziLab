import { useState, useEffect } from 'react';
import { Volume2, VolumeX, WifiOff } from 'lucide-react';
import { GameType } from './types/game';
import { loadGameData, loadRadicalMeanings } from './services/dataService';
import { getAudioMuted, setAudioMuted, playSound } from './utils/audio';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { useOnlineStatus } from './hooks/usePWAInstall';

// Exercise Components
import { RadicalsGame } from './components/games/RadicalsGame';
import { EvolutionGame } from './components/games/EvolutionGame';
import { LogicGame } from './components/games/LogicGame';
import { MemoryGame } from './components/games/MemoryGame';
import { StrokeGame } from './components/games/StrokeGame';
import { PronunciationGame } from './components/games/PronunciationGame';

type AppView = 'MENU' | 'PLAYING' | 'SUMMARY';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('MENU');
  const [activeGame, setActiveGame] = useState<GameType>('radicals');
  const [gameItems, setGameItems] = useState<any[]>([]);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [lastScore, setLastScore] = useState<number>(0);
  const [lastTimeSpent, setLastTimeSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsMutedState(getAudioMuted());
    loadRadicalMeanings();
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setAudioMuted(nextMuted);
  };

  const handleStartGame = async (gameType: GameType) => {
    setIsLoading(true);
    setActiveGame(gameType);
    playSound('click');

    try {
      const data = await loadGameData(gameType);
      setGameItems(data);
      setCurrentView('PLAYING');
    } catch (err) {
      console.error("Errore nel caricamento dell'esercizio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishRound = (score: number, timeSpent: number) => {
    setLastScore(score);
    setLastTimeSpent(timeSpent);
    setCurrentView('SUMMARY');
    playSound('victory');
  };

  const gameList: { id: GameType; hanzi: string; title: string; desc: string; cardBg: string; borderCol: string; accentCol: string }[] = [
    {
      id: 'radicals',
      hanzi: '部首',
      title: 'Caccia ai Radicali',
      desc: 'Trova i componenti nascosti nei caratteri',
      cardBg: 'bg-[#fff5f5]',
      borderCol: 'border-red-300 hover:border-red-500',
      accentCol: 'text-red-700'
    },
    {
      id: 'evolution',
      hanzi: '演化',
      title: 'Evoluzione Caratteri',
      desc: 'Ricostruisci la storia dei simboli',
      cardBg: 'bg-[#fffbf0]',
      borderCol: 'border-amber-300 hover:border-amber-500',
      accentCol: 'text-amber-800'
    },
    {
      id: 'logic',
      hanzi: '逻辑',
      title: 'Logica Cinese',
      desc: 'Indovina il carattere dai suoi elementi',
      cardBg: 'bg-[#f0f9ff]',
      borderCol: 'border-sky-300 hover:border-sky-500',
      accentCol: 'text-sky-800'
    },
    {
      id: 'memory',
      hanzi: '记忆',
      title: 'Memory Cinese',
      desc: 'Abbina caratteri e significati',
      cardBg: 'bg-[#f0fdf4]',
      borderCol: 'border-emerald-300 hover:border-emerald-500',
      accentCol: 'text-emerald-800'
    },
    {
      id: 'stroke',
      hanzi: '笔画',
      title: 'Ordine Tratti',
      desc: "Impara l'ordine corretto dei tratti",
      cardBg: 'bg-[#faf5ff]',
      borderCol: 'border-purple-300 hover:border-purple-500',
      accentCol: 'text-purple-800'
    },
    {
      id: 'pronunciation',
      hanzi: '拼音',
      title: 'Quiz Pronuncia',
      desc: 'Abbina caratteri alla pronuncia corretta',
      cardBg: 'bg-[#fff1f2]',
      borderCol: 'border-rose-300 hover:border-rose-500',
      accentCol: 'text-rose-800'
    }
  ];

  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-[#f3ece2] text-stone-900 flex flex-col font-sans-app">
      {/* Top subtle bar */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-3 flex items-center justify-between">
        <div>
          {!isOnline && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-200/80 text-amber-950 rounded-lg border border-amber-300">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline (dati in cache)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            onClick={handleToggleMute}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-300/60 rounded-xl transition-colors cursor-pointer bg-stone-200/70 border border-stone-300 shadow-2xs"
            title={isMuted ? 'Attiva audio' : 'Disattiva audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-stone-400" /> : <Volume2 className="w-5 h-5 text-red-700" />}
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-12">
        {isLoading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-600 font-medium">Caricamento esercizio...</p>
            </div>
          </div>
        )}

        {/* 1. MENU VIEW */}
        {!isLoading && currentView === 'MENU' && (
          <div>
            {/* Header */}
            <header className="text-center my-6 sm:my-8">
              <div className="inline-block relative">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-stone-900 font-chinese tracking-tight">
                  汉字游戏 - Giochi Enigmistica Cinese
                </h1>
                <div className="h-1 w-32 bg-red-600 mx-auto rounded-full mb-3 opacity-80"></div>
              </div>
              <p className="text-base text-stone-700 font-medium">
                Scegli un gioco per iniziare a imparare il cinese divertendoti!
              </p>
            </header>

            {/* Game Cards Grid with distinct warm pastel cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameList.map(game => (
                <div
                  key={game.id}
                  onClick={() => handleStartGame(game.id)}
                  className={`group ${game.cardBg} p-6 rounded-2xl shadow-sm border-2 ${game.borderCol} hover:shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 text-center`}
                >
                  <div className={`text-5xl mb-4 font-chinese font-bold ${game.accentCol} transition-transform group-hover:scale-110 drop-shadow-2xs`}>
                    {game.hanzi}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-stone-900">
                    {game.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {game.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. PLAYING VIEW */}
        {!isLoading && currentView === 'PLAYING' && (
          <div>
            {activeGame === 'radicals' && (
              <RadicalsGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
            {activeGame === 'evolution' && (
              <EvolutionGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
            {activeGame === 'logic' && (
              <LogicGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
            {activeGame === 'memory' && (
              <MemoryGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
            {activeGame === 'stroke' && (
              <StrokeGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
            {activeGame === 'pronunciation' && (
              <PronunciationGame
                items={gameItems}
                onFinishRound={handleFinishRound}
                onBackToMenu={() => setCurrentView('MENU')}
              />
            )}
          </div>
        )}

        {/* 3. SUMMARY VIEW */}
        {!isLoading && currentView === 'SUMMARY' && (
          <div className="max-w-md mx-auto my-14 bg-[#fffdf8] p-8 rounded-2xl shadow-md border-2 border-amber-200 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl font-bold mb-3 text-stone-900 font-chinese">Complimenti! 🎉</h2>
            <div className="text-xl font-semibold mb-2 text-stone-800">
              Punteggio: <span className="text-red-700 font-bold font-mono">{lastScore}</span> punti
            </div>
            <div className="text-sm text-stone-500 mb-8">
              Tempo impiegato: <strong className="text-stone-700">{lastTimeSpent} secondi</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleStartGame(activeGame)}
                className="px-6 py-2.5 rounded-xl font-medium text-sm bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
              >
                🔄 Stesso Esercizio
              </button>
              <button
                onClick={() => setCurrentView('MENU')}
                className="px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all cursor-pointer shadow-sm hover:shadow"
              >
                🏠 Menu Principale
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
