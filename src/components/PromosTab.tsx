import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Clock, Gift, Percent, ArrowRight, ArrowLeft, Heart, Flame, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface PromosTabProps {
  currentUser: User | null;
  onTriggerNotification: (title: string, body: string, type: 'promo' | 'loyalty' | 'system') => void;
  openAuthModal: () => void;
}

export default function PromosTab({
  currentUser,
  onTriggerNotification,
  openAuthModal,
}: PromosTabProps) {
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Dynamic daily banners data
  const SLIDES_DATA = [
    {
      id: 1,
      title: '¡Súper Combo Fatboy!',
      subtitle: 'Fatboy burger especial + Papas Rústicas + Batido grande',
      discount: 'Ahorra un 25%',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      tag: 'HOT COMBO',
      bgGradient: 'from-amber-600 to-red-600'
    },
    {
      id: 2,
      title: 'Lunes de Hot Dogs XL',
      subtitle: 'Compra 1 Fatboy XL y llévate el segundo al 50%',
      discount: '50% en el 2do Dog',
      image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600&auto=format&fit=crop&q=80',
      tag: 'SOLO LUNES',
      bgGradient: 'from-orange-600 to-yellow-500'
    },
    {
      id: 3,
      title: 'Oreo Milkshake Madness',
      subtitle: 'Nuestra malteada estrella Oreo con porción extra de topping',
      discount: 'Extra Topping Gratis',
      image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80',
      tag: 'SWEET HOUR',
      bgGradient: 'from-yellow-500 to-amber-600'
    }
  ];

  const PROMOS_DATA = [
    {
      code: 'BURGERLOVE',
      title: 'Descuento 20% Especial',
      description: 'Obtén 20% de descuento directo en nuestra icónica Fatboy Especial Burger.',
      badge: 'Burger Favorita',
      timeLimit: 'VENCE HOY',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&auto=format&fit=crop&q=80'
    },
    {
      code: 'PAPASVIP',
      title: 'Papas Rústicas Gratis',
      description: 'En consumos mínimos de $12 por WhatsApp o sucursal Lombardo Toledano 1200.',
      badge: 'Cortas rústicas',
      timeLimit: 'VENCE EN 3 DÍAS',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80'
    },
    {
      code: 'SHAKEMIX',
      title: 'Malteadas 2x1 Martes',
      description: 'Disfruta de dos deliciosas malteadas Oreo Premium al precio de una.',
      badge: 'Martes de Batidos',
      timeLimit: 'PRÓXIMO MARTES',
      image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&auto=format&fit=crop&q=80'
    },
    {
      code: 'NACHOMAX',
      title: 'Nachos Supremos 15% OFF',
      description: 'Lomito asado, abundante queso líquido cheddar y jalapeños listos para compartir.',
      badge: 'Para Compartir',
      timeLimit: 'VENCE ESTA SEMANA',
      image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&auto=format&fit=crop&q=80'
    }
  ];

  // Auto carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDES_DATA.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [SLIDES_DATA.length]);

  const handleClaimCode = (code: string) => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (claimedCodes.includes(code)) return;
    
    setClaimedCodes(prev => [...prev, code]);
    onTriggerNotification(
      '🎫 ¡Cupón Guardado!',
      `Cupón ${code} reclamado para tu cuenta de Fatboy. Se reflejará automáticamente en tu orden.`,
      'promo'
    );
  };

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % SLIDES_DATA.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
          <Percent className="w-5 h-5 text-amber-500 animate-pulse" />
          Banners & Promos del Día
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Explora los cupones especiales de nuestro menú en Lombardo Toledano 1200.
        </p>
      </div>

      {/* INTERACTIVE BANNER CAROUSEL (Carrusel de Promociones) */}
      <div className="relative overflow-hidden rounded-3xl mb-6 shadow-2xl h-52 bg-zinc-950">
        {SLIDES_DATA.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-end p-5 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background cover image */}
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
              />
              {/* Dark subtle gradient overlay bottom to top */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent"></div>

              {/* Tag overlay */}
              <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 rounded-full z-20 shadow-md">
                {slide.tag}
              </span>

              {/* Discount Box */}
              <span className="absolute top-4 right-4 text-[10px] font-black uppercase text-white bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl z-20 backdrop-blur-sm">
                {slide.discount}
              </span>

              {/* Bottom text block */}
              <div className="relative z-10 max-w-[85%]">
                <h3 className="text-base font-black text-white uppercase tracking-tight leading-snug drop-shadow-md">
                  {slide.title}
                </h3>
                <p className="text-[11px] text-zinc-300 font-medium leading-relaxed mt-1 drop-shadow">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          );
        })}

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-4 right-5 z-20 flex gap-2">
          {SLIDES_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeSlide ? 'bg-amber-500 w-5' : 'bg-zinc-650 bg-zinc-600'
              }`}
            ></button>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-zinc-300 hover:text-white z-25 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-zinc-300 hover:text-white z-25 transition"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DISSCOUNT COUPONS AND TILES */}
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 px-1">Cupones de Descuento Especiales</h3>
      
      <div className="space-y-4">
        {PROMOS_DATA.map((promo) => {
          const isClaimed = claimedCodes.includes(promo.code);
          return (
            <div
              key={promo.code}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 relative ${
                isClaimed
                  ? 'bg-zinc-900/35 border-zinc-955 text-zinc-550'
                  : 'bg-zinc-900 border-zinc-900/60 hover:border-zinc-800'
              }`}
            >
              {/* Scissors design hole simulation cutout */}
              <div className="absolute top-1/2 -left-3 w-5 h-5 rounded-full bg-zinc-950 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 w-5 h-5 rounded-full bg-zinc-950 -translate-y-1/2"></div>

              <div className="flex">
                
                {/* Promo Thumbnail Image */}
                <div className="w-24 h-24 shrink-0 bg-zinc-950 relative overflow-hidden hidden sm:block">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900"></div>
                </div>

                {/* Form main context */}
                <div className="flex-1 p-4 pl-5 sm:pl-3 pr-5">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black bg-amber-500 px-1.5 py-0.5 rounded leading-none">
                      {promo.badge}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
                      <Clock className="w-2.5 h-2.5" />
                      {promo.timeLimit}
                    </span>
                  </div>

                  <h4 className={`text-xs font-extrabold mt-1.5 ${isClaimed ? 'text-zinc-550 line-through' : 'text-zinc-150 text-zinc-200'}`}>
                    {promo.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-semibold">
                    {promo.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-900 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[10px] font-mono font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/15 rounded uppercase">
                        {promo.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaimCode(promo.code)}
                      disabled={isClaimed}
                      className={`px-3.5 py-1.5 text-[10px] font-black uppercase rounded-lg transition-transform active:scale-95 cursor-pointer ${
                        isClaimed
                          ? 'bg-zinc-950 text-zinc-600 pointer-events-none border border-zinc-900'
                          : 'bg-zinc-100 text-black hover:bg-amber-400 hover:text-black hover:shadow'
                      }`}
                    >
                      {isClaimed ? 'Obtenido' : 'Reclamar'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM OUTREACH INFORMATION */}
      <div className="mt-5 p-4 bg-orange-950/15 border border-orange-950/20 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
          <Flame className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-black text-zinc-200 uppercase leading-none">¡Atención en Lombardo Toledano!</h4>
          <span className="text-[10px] text-zinc-400 mt-1 inline-block font-semibold">
            Ingresa estos códigos de cupones directamente en el chat de WhatsApp al comprar tus almuerzos o combos gourmet.
          </span>
        </div>
      </div>
    </div>
  );
}
