import React from 'react';
import { Home, Percent, MessageSquare, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadCount: number;
}

export default function BottomNav({ activeTab, setActiveTab, unreadCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-zinc-800/80 bg-zinc-900/95 py-2 px-6 backdrop-blur-md pb-safe-bottom shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        
        {/* HOME (MENU) */}
        <button
          id="nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
            activeTab === 'home'
              ? 'text-amber-500 scale-110 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Menú</span>
        </button>

        {/* PROMOS */}
        <button
          id="nav-promos"
          onClick={() => setActiveTab('promos')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
            activeTab === 'promos'
              ? 'text-amber-500 scale-110 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Percent className="w-5 h-5 mb-1" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Promos</span>
        </button>

        {/* REVIEWS */}
        <button
          id="nav-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
            activeTab === 'reviews'
              ? 'text-amber-500 scale-110 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Contacto</span>
        </button>

        {/* CLIENTE / FIDELIZACIÓN */}
        <button
          id="nav-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
            activeTab === 'profile'
              ? 'text-amber-500 scale-110 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-1" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-black">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Club VIP</span>
        </button>

      </div>
    </nav>
  );
}
