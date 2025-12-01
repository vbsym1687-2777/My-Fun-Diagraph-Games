import React, { useState, useEffect } from 'react';
import { GAMES } from './constants';
import { getAppData, saveAppData } from './services/storage';
import { AppData, GameType } from './types';
import { GameEngine } from './components/GameEngine';
import { AdminPanel } from './components/AdminPanel';
import { Settings, Play, Info, Phone, Mail, User, X } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDev, setShowDev] = useState(false);

  useEffect(() => {
    // Simulate Splash Screen and load data
    const timer = setTimeout(() => {
      setData(getAppData());
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 flex flex-col items-center justify-center text-white">
         <div className="text-9xl mb-6 animate-float">🦁</div>
         <h1 className="text-4xl font-bold text-center px-4 drop-shadow-md">My Fun Digraph Games</h1>
         <div className="mt-8 w-48 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-[width_2s_ease-in-out_forwards]" style={{width: '0%'}}></div>
         </div>
      </div>
    );
  }

  if (activeGame && data) {
    return (
      <GameEngine 
        gameType={activeGame} 
        groups={data.groups}
        rhymeGroups={data.rhymeGroups}
        onExit={() => setActiveGame(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      
      {/* Header */}
      <header className="bg-white p-6 rounded-b-3xl shadow-sm mb-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hello, Friend! 👋</h1>
          <p className="text-slate-500">Ready to play?</p>
        </div>
        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-2xl border-2 border-yellow-400">
           🦄
        </div>
      </header>

      {/* Game Grid */}
      <main className="px-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Play size={20} className="fill-slate-700" /> Choose a Game
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`${game.color} aspect-square rounded-3xl p-4 shadow-lg flex flex-col items-center justify-center gap-2 text-white transition-transform active:scale-95 border-b-4 border-black/10`}
            >
              <div className="text-5xl drop-shadow-sm">{game.icon}</div>
              <span className="font-bold text-center leading-tight drop-shadow-sm">{game.title}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur shadow-lg rounded-full p-2 pointer-events-auto flex gap-4">
              <button 
                onClick={() => setShowDev(true)}
                className="p-3 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200 transition-colors"
              >
                  <Info size={24} />
              </button>
              <button 
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-transform"
              >
                  <Settings size={18} /> Admin
              </button>
          </div>
      </div>

      {showAdmin && data && (
        <AdminPanel 
          data={data} 
          onUpdate={handleUpdateData} 
          onClose={() => setShowAdmin(false)} 
        />
      )}

      {/* Developer Modal */}
      {showDev && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop relative overflow-hidden">
                
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-400 to-purple-400"></div>

                {/* Close Button - Corrected Z-Index and Position */}
                <button 
                  onClick={() => setShowDev(false)} 
                  className="absolute top-4 right-4 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 z-10 transition-colors"
                >
                  <X size={24} />
                </button>
                
                <div className="relative -mt-12 mb-4">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md p-1">
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl">👨‍💻</div>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Developer</h2>
                <p className="text-slate-400 text-sm mb-6">Built with ❤️</p>

                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Name</div>
                            <div className="font-bold text-slate-700">Bose.V</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Phone size={20} /></div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Contact</div>
                            <div className="font-bold text-slate-700">+91-9677777411</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Mail size={20} /></div>
                        <div className="overflow-hidden">
                            <div className="text-xs text-slate-400 font-bold uppercase">Email</div>
                            <div className="font-bold text-slate-700 truncate">vbsym1687@gmail.com</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-slate-300 font-bold">
                    APP VERSION 1.0.0
                </div>
            </div>
        </div>
      )}

    </div>
  );
}