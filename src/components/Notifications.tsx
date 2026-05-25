import React from 'react';
import { Bell, Check, X, Tag, Star, Award, Zap } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen,
  onClose,
}: NotificationsProps) {
  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-orange-400 animate-pulse" />;
      case 'loyalty':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Background click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Sheet content */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500 animate-bounce" />
            <h3 className="text-base font-bold text-zinc-100 tracking-tight">Notificaciones Club VIP</h3>
          </div>
          <div className="flex items-center space-x-3">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium tracking-wide underline"
              >
                Tratar todas
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500">
              <Bell className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm font-medium">No tienes notificaciones en este momento</p>
              <p className="text-xs opacity-60">¡Te avisaremos sobre promociones candentes!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-3 p-3 rounded-xl border transition-all duration-200 group relative ${
                  notif.isRead
                    ? 'bg-zinc-950/40 border-zinc-900/60 text-zinc-400'
                    : 'bg-gradient-to-r from-zinc-900 to-amber-950/20 border-zinc-800 text-zinc-200 shadow-sm'
                }`}
              >
                {/* Active Indicator dot */}
                {!notif.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}

                {/* Left icon wrapper */}
                <div className={`p-2 h-fit rounded-lg ${notif.isRead ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-800/80 text-amber-500 font-bold'}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Text section */}
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-xs font-semibold tracking-tight ${notif.isRead ? 'text-zinc-300' : 'text-zinc-100'}`}>
                    {notif.title}
                  </p>
                  <p className="text-[11px] opacity-80 leading-relaxed mt-1">{notif.body}</p>
                  <span className="text-[9px] text-zinc-500 block mt-1.5 font-mono">{notif.timestamp}</span>
                </div>

                {/* Mark read button */}
                {!notif.isRead && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="self-center p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 bg-zinc-800 hover:bg-zinc-700 hover:text-amber-400 text-zinc-400 transition-all duration-200"
                    title="Marcar como leída"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info card */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/50 rounded-xl mt-4 flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">AUTO-PUSH</span>
          <p className="text-[10px] text-zinc-400">Recibe descuentos exclusivos directamente en tu móvil.</p>
        </div>
      </div>
    </div>
  );
}
