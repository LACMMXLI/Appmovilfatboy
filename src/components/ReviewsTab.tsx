import React, { useState } from 'react';
import { Facebook, MessageCircle, Star, Send, Check, Heart, Award, ArrowRight, CornerDownRight, PhoneCall, ExternalLink, ThumbsUp } from 'lucide-react';
import { User, TabType } from '../types';

interface ReviewsTabProps {
  currentUser: User | null;
  openAuthModal: () => void;
  onAddReview?: (review: any) => void; // kept for TS signature check safety if called in main
  reviews?: any;
}

interface UserComment {
  id: string;
  name: string;
  comment: string;
  date: string;
  rating: number;
}

export default function ReviewsTab({
  currentUser,
  openAuthModal,
}: ReviewsTabProps) {
  const [comment, setComment] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorLocal, setErrorLocal] = useState<string>('');
  
  // Local list of sent feedback for this page to look alive when they write!
  const [localFeedback, setLocalFeedback] = useState<UserComment[]>([
    {
      id: 'lf-1',
      name: 'Daniela González',
      comment: 'Me encanta la sucursal de Lombardo Toledano 1200. Las hamburguesas son las mejores y el servicio por WhatsApp es súper veloz.',
      date: 'Hace unos momentos',
      rating: 5
    },
    {
      id: 'lf-2',
      name: 'Jorge Luis Meléndez',
      comment: 'La malteada de Oreo es perfecta. Gran restaurante para ir con amigos.',
      date: 'Hace 2 horas',
      rating: 5
    }
  ]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (!comment.trim()) {
      setErrorLocal('El comentario no puede estar vacío.');
      return;
    }

    const newComment: UserComment = {
      id: `c_${Date.now()}`,
      name: currentUser.name,
      comment: comment.trim(),
      date: 'Ahora mismo',
      rating: rating
    };

    setLocalFeedback(prev => [newComment, ...prev]);
    setComment('');
    setRating(5);
    setSubmitted(true);
    setErrorLocal('');

    // Reward user with simulated 15 points
    if (currentUser) {
      currentUser.points += 15;
      localStorage.setItem('fb_current_user', JSON.stringify(currentUser));
    }

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  // Predefined Social Networks list
  const NETWORKS = [
    {
      name: 'Facebook Oficial',
      desc: 'Fatboy Restaurant Mexicali',
      icon: <Facebook className="w-5 h-5 text-white" />,
      color: 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/20',
      actionText: 'Seguir página',
      url: 'https://facebook.com/'
    },
    {
      name: 'TikTok Trend',
      desc: '@fatboy_restaurant',
      // We will render simple music/ticktok style or Lucide icon
      icon: <Check className="w-5 h-5 text-zinc-100" />,
      color: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 shadow-zinc-950/40',
      actionText: 'Ver videos',
      url: 'https://tiktok.com/'
    },
    {
      name: 'WhatsApp Directo',
      desc: 'Pedidos prioritarios & Dudas',
      icon: <MessageCircle className="w-5 h-5 text-green-950" />,
      color: 'bg-green-500 hover:bg-green-400 text-green-950 shadow-green-950/20',
      actionText: 'Chatear ahora',
      url: 'https://wa.me/526861105191?text=Hola%20Fatboy%20Restaurant!%20Me%20gustaria%20saber%20mas%20sobre%20el%20menu.'
    }
  ];

  // Redirections to Calificarnos
  const RATE_CHANNELS = [
    {
      name: 'Google Reseñas (Maps)',
      desc: 'Califica nuestra sucursal Lombardo Toledano 1200 en Google Maps para llegar a más personas.',
      starText: '⭐ 4.9 en Google',
      color: 'hover:border-amber-500/40',
      url: 'https://maps.google.com/?q=Lombardo+Toledano+1200+Hacienda+del+Bosque+Mexicali'
    },
    {
      name: 'WhatsApp Feedback',
      desc: 'Cuéntanos tu experiencia de entrega directa con el gerente de servicio para mejora continua.',
      starText: 'Atención 1 a 1',
      color: 'hover:border-green-500/45',
      url: 'https://wa.me/526861105191?text=Hola!%20Quiero%20enviar%20mi%20feedback%20sobre%20el%20servicio%20de%20hoy.'
    }
  ];

  return (
    <div className="pb-24 animate-fade-in">
      {/* Title block */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
          <Facebook className="w-5 h-5 text-blue-500 animate-pulse" />
          Redes Sociales & Contacto
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Síguenos, califica nuestro servicio o déjanos un comentario directo. ¡Encuéntranos en Lombardo Toledano 1200!
        </p>
      </div>

      {/* QUICK CONTACT HIGHLIGHT ACTIONS */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-4.5 rounded-2xl mb-6 shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded">TELÉFONO DE ATENCIÓN</span>
          <h3 className="text-sm font-extrabold text-zinc-100 uppercase">Ordena por Teléfono</h3>
          <p className="text-xs text-amber-500 font-bold leading-none mt-1">686 110 51 91</p>
        </div>
        <a 
          href="tel:6861105191" 
          className="p-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center shadow-lg shadow-amber-500/15 active:scale-95"
        >
          <PhoneCall className="w-5 h-5" />
        </a>
      </div>

      {/* SOCIAL MEDIA CARDS LIST */}
      <div className="space-y-3 mb-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 px-1">Nuestras Redes Oficiales</h3>
        <div className="grid grid-cols-1 gap-3">
          {NETWORKS.map((net, i) => (
            <a
              key={i}
              href={net.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${net.color} flex items-center justify-center shadow-md`}>
                  {net.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">{net.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold">{net.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-500 uppercase bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900">
                <span>{net.actionText}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* RATINGS / GOOGLE MAP RESEÑAS SECTIONS */}
      <div className="bg-zinc-900 border border-zinc-900/60 p-4 rounded-2xl mb-6">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">¿Te gustó nuestro servicio? Califícanos</h4>
        <div className="grid grid-cols-1 gap-3">
          {RATE_CHANNELS.map((chan, idx) => (
            <a
              key={idx}
              href={chan.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between hover:bg-zinc-900 transition-all ${chan.color}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-xs font-bold text-zinc-200">{chan.name}</h5>
                <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono uppercase">
                  {chan.starText}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal font-semibold">
                {chan.desc}
              </p>
              <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-black text-amber-400 hover:underline uppercase tracking-wide">
                <span>Ir al canal de calificación</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* INTERNAL DIRECT COMMENT TO BUSINESS SECTION */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-5 rounded-2xl mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 leading-none">Comentario al Negocio</h3>
            <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mt-1">Tu opinión va directo a gerencia</span>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-center space-y-1">
            <Check className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-zinc-100 uppercase">¡Comentario Recibido!</p>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Se te han sumado <strong>+15 puntos VIP</strong> al club de recompensas por tu aporte constructivo. ¡Muchas gracias!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            
            {/* Simple feedback rating indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-semibold">¿Qué calificación nos das hoy?</span>
              <div className="flex gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-900/60">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRating(st)}
                    className="p-0.5 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${st <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  currentUser 
                    ? `Hola ${currentUser.name}, ¿alguna sugerencia para el chef, una recomendación o halago sobre la Fatboy Especial?`
                    : 'Regístrate por favor para dejar comentarios oficiales y ganar valiosos puntos.'
                }
                rows={3}
                disabled={!currentUser}
                className="w-full p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-40"
              />
              {errorLocal && <p className="text-[10px] font-bold text-red-500 uppercase mt-1">{errorLocal}</p>}
            </div>

            <div className="flex justify-between items-center">
              {!currentUser ? (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="text-[10px] text-amber-500 font-extrabold uppercase hover:underline"
                >
                  Identificarse para Opinar
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gana +15 puntos Club VIP</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!currentUser || !comment.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-[11px] uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Comentario</span>
              </button>
            </div>

          </form>
        )}
      </div>

      {/* LOCAL LIVE DYNAMIC COMMENT STREAM */}
      <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 px-1 mb-3">Comentarios Recientes de Clientes</h3>
      <div className="space-y-3">
        {localFeedback.map((fb) => (
          <div key={fb.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-900/60 shadow-sm space-y-2">
            <div className="flex justify-between items-baseline">
              <h5 className="text-xs font-extrabold text-zinc-200">{fb.name}</h5>
              <span className="text-[9px] font-mono text-zinc-500">{fb.date}</span>
            </div>
            
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'}`} />
              ))}
            </div>

            <p className="text-xs text-zinc-400 leading-normal font-semibold italic">
              "{fb.comment}"
            </p>

            <div className="flex items-center gap-1 border-t border-zinc-950 pt-2 text-[10px] font-bold text-zinc-500">
              <CornerDownRight className="w-3 h-3 text-amber-500" />
              <span>Gerente: <strong className="text-zinc-400">“¡Muchas gracias por informarnos!”</strong></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
