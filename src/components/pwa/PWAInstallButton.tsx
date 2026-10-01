import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
        title="Installa HanziLab come applicazione"
      >
        <Download className="w-3.5 h-3.5 text-amber-800" />
        <span>Installa App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          title="Installa su iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-800" />
          <span>Installa su iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#fffdf8] p-6 shadow-2xl border-2 border-amber-300 text-stone-900">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-chinese font-bold text-red-700">字</span>
                  <h3 className="text-base font-bold text-stone-900">Installa su iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Puoi aggiungere <strong>HanziLab</strong> alla schermata Home del tuo dispositivo per usarlo a schermo intero e offline:
              </p>

              <ol className="space-y-3 text-xs text-stone-700 font-medium pl-1 mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <span>Tocca il pulsante <strong className="inline-flex items-center gap-1 text-blue-600"><Share2 className="w-3.5 h-3.5 inline" /> Condividi</strong> nella barra inferiore di Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <span>Scorri il menu e seleziona <strong>&quot;Aggiungi alla schermata Home&quot;</strong>.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Ho capito, chiudi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
