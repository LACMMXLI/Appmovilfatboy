import React, { useState } from 'react';
import { Award, QrCode, User as UserIcon, Mail, Lock, LogOut, Sparkles, Check, Phone, ShieldAlert, MapPin, Bell, Globe, Sparkle, EyeOff, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { User } from '../types';

interface ProfileTabProps {
  currentUser: User | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onUpdatePoints: (points: number) => void;
}

export default function ProfileTab({
  currentUser,
  onLogin,
  onLogout,
  onUpdatePoints,
}: ProfileTabProps) {
  // Auth Form State
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Password update form states
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [oldPass, setOldPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [passSuccess, setPassSuccess] = useState<boolean>(false);

  // Notification toggles
  const [promoNotif, setPromoNotif] = useState<boolean>(true);
  const [pointsNotif, setPointsNotif] = useState<boolean>(true);
  const [statusNotif, setStatusNotif] = useState<boolean>(true);

  // System general config
  const [preferredLang, setPreferredLang] = useState<string>('es');
  const [dataSaver, setDataSaver] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('Comer en el negocio');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password || (isRegistering && !name)) {
      setErrorMessage('Por favor rellena todos los campos requeridos.');
      return;
    }

    const displayName = isRegistering ? name : email.split('@')[0];
    onLogin(email, displayName);
    setEmail('');
    setName('');
    setPassword('');
    setIsRegistering(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass) return;
    
    setPassSuccess(true);
    setOldPass('');
    setNewPass('');
    setTimeout(() => {
      setPassSuccess(false);
      setShowPassModal(false);
    }, 2500);
  };

  const currentPoints = currentUser ? currentUser.points : 0;
  
  // Pedidos anteriores mockeados y persistidos localmente
  const [orderHistory, setOrderHistory] = useState<Array<{ id: string; date: string; items: Array<{ name: string; quantity: number }>; total: number; pointsEarned: number }>>(() => {
    const cached = localStorage.getItem('fb_order_history');
    if (cached) return JSON.parse(cached);
    const initialHistory = [
      {
        id: 'PED-4820',
        date: 'Hace 2 días',
        items: [
          { name: 'Fatboy Especial Burger', quantity: 1 },
          { name: 'Papas Locas con Asada', quantity: 1 }
        ],
        total: 16.48,
        pointsEarned: 160
      },
      {
        id: 'PED-1293',
        date: 'Hace 1 semana',
        items: [
          { name: 'Fatboy XL Dog', quantity: 2 },
          { name: 'Malteada Oreo Premium', quantity: 1 }
        ],
        total: 16.47,
        pointsEarned: 160
      }
    ];
    localStorage.setItem('fb_order_history', JSON.stringify(initialHistory));
    return initialHistory;
  });

  const [repeatSuccess, setRepeatSuccess] = useState<{ id: string; name: string; pts: number } | null>(null);

  const handleRepeatOrder = (order: any) => {
    // 1. Generate unique key for duplicated order
    const nextId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicated = {
      ...order,
      id: nextId,
      date: 'Ahora mismo',
    };
    
    // 2. Put it in order list
    const updatedList = [duplicated, ...orderHistory];
    setOrderHistory(updatedList);
    localStorage.setItem('fb_order_history', JSON.stringify(updatedList));

    // 3. Inform system points of new simulator consume
    onUpdatePoints(order.pointsEarned);

    // 4. Toggle feedback banner
    const itemsSummary = order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' + ');
    setRepeatSuccess({
      id: nextId,
      name: itemsSummary,
      pts: order.pointsEarned
    });

    // Auto close feedback after 4.5s
    setTimeout(() => {
      setRepeatSuccess(null);
    }, 4500);
  };

  // Tier resolver
  const getTierDetails = (points: number) => {
    if (points >= 300) {
      return { 
        tier: 'Oro VIP 👑', 
        bg: 'from-amber-400 to-yellow-600', 
        text: 'text-yellow-100', 
        perks: ['15% descuento en todo su pedido', 'Papas locas de cortesía', 'Refrescos ilimitados gratis', 'Atención preferente en caja / Mesa VIP sin esperas'] 
      };
    } else if (points >= 100) {
      return { 
        tier: 'Plata VIP 🥈', 
        bg: 'from-zinc-300 to-zinc-500', 
        text: 'text-zinc-100', 
        perks: ['10% de descuento en combos de hamburguesas', 'Postre o helado semanal gratis', 'Petición preferente de aderezos'] 
      };
    } else {
      return { 
        tier: 'Bronce Club 🥉', 
        bg: 'from-orange-600 to-orange-800', 
        text: 'text-orange-100', 
        perks: ['5% descuento acumulable', 'Queso extra los viernes', 'Participación automática en sorteos'] 
      };
    }
  };

  const tier = getTierDetails(currentPoints);

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500 animate-pulse" />
          Club VIP & Configuración
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Controla tus puntos de fidelización, edita credenciales y ajusta tus notificaciones de Fatboy Restaurant.
        </p>
      </div>

      {currentUser ? (
        // LOGGED IN USER VIEW
        <div className="space-y-6">
          
          {/* VIRTUAL MEMBERSHIP PASS CARD (La información de puntos y códigos QR) */}
          <div className={`relative overflow-hidden bg-gradient-to-tr ${tier.bg} rounded-3xl p-5 shadow-2xl text-zinc-950 border border-white/10`}>
            {/* Hologram aesthetic lines */}
            <span className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl"></span>
            
            {/* Pass banner logo */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-black/25 text-white px-2 py-0.5 rounded">MIEMBRO CLUB VIP</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">Fatboy VIP Card</h4>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin duration-1000" />
            </div>

            {/* Points metric */}
            <div className="my-6 relative z-10">
              <p className="text-[10px] uppercase font-bold text-white/80 tracking-widest">Puntos Acumulados</p>
              <h3 className="text-4xl font-extrabold text-white tracking-widest mt-1">
                {currentUser.points} <span className="text-xs font-bold uppercase tracking-normal opacity-85">Pts</span>
              </h3>
            </div>

            {/* Pass QR and info */}
            <div className="flex items-end justify-between relative z-10 border-t border-white/10 pt-4.5">
              <div className="space-y-3.5">
                <div>
                  <p className="text-[9px] uppercase font-bold text-white/80 tracking-widest leading-none mb-1">CÓDIGO DE FIDELIZACIÓN ÚNICO</p>
                  <p className="text-sm font-mono font-black text-black bg-white/30 w-fit px-2.5 py-1 rounded-md border border-white/5 tracking-widest uppercase">
                    {currentUser.vipCode || 'VIP-148930'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase font-bold text-white/70 tracking-wider">Nombre del Cliente</p>
                  <p className="text-xs font-black text-white uppercase leading-none">{currentUser.name}</p>
                  <p className="text-[9px] uppercase font-extrabold text-black bg-white/75 w-fit px-1.5 py-0.5 rounded mt-1.5 border border-white/10">{tier.tier}</p>
                </div>
              </div>
              
              {/* Tap to scan barcode simulator */}
              <div className="flex flex-col items-center bg-white p-2.5 rounded-xl shadow-md border hover:scale-105 active:scale-95 cursor-pointer transition-transform duration-200">
                <QrCode className="w-11 h-11 text-zinc-950" />
                <span className="text-[8px] font-bold text-zinc-600 mt-1 uppercase leading-none">Escanear</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC ORDER REPEAT BANNER FEEDBACK */}
          {repeatSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3.5 shadow-xl animate-in fade-in slide-in-from-top-3 duration-305 text-zinc-100">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400">¡Pedido Repetido con Éxito! {repeatSuccess.id}</h5>
                <p className="text-[11px] text-zinc-300 font-semibold leading-relaxed">
                  Has ordenado nuevamente: <strong>{repeatSuccess.name}</strong>. Tu pedido está en preparación exprés.
                </p>
                <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded inline-block mt-1">
                  +{repeatSuccess.pts} Puntos VIP Ingresados de Inmediato
                </span>
              </div>
            </div>
          )}

          {/* HISTORIAL DE PEDIDOS RECIENTES */}
          <div className="bg-zinc-900 border border-zinc-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">
                  Historial de Pedidos
                </h3>
              </div>
              <span className="text-[9px] font-black bg-zinc-950 text-zinc-500 px-2.5 py-1 rounded-xl">
                {orderHistory.length} Órdenes
              </span>
            </div>

            <div className="space-y-3.5">
              {orderHistory.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-850/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5"
                >
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-[10px] font-mono font-black text-amber-500">
                        {order.id}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-500">
                        • {order.date}
                      </span>
                      <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                        +{order.pointsEarned} PTS VIP
                      </span>
                    </div>

                    {/* Products details list */}
                    <div className="text-xs text-zinc-200 font-semibold space-y-0.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <span className="text-amber-500 font-extrabold">{it.quantity}x</span>
                          <span className="text-zinc-300">{it.name}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                      Total: <strong className="text-zinc-300">${order.total.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* One click reorder action */}
                  <button
                    onClick={() => handleRepeatOrder(order)}
                    className="py-2 px-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-500 hover:text-amber-400 hover:bg-zinc-850 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shrink-0 self-start sm:self-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pedir de nuevo</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE REWARDS & TIER PERK CHECKBOXES */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3.5">
              Beneficios Activos ({tier.tier})
            </h3>
            <div className="space-y-3.5">
              {tier.perks.map((p, idx) => (
                <div key={idx} className="flex gap-3 items-center text-xs">
                  <div className="p-1 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span className="text-zinc-200 font-medium">{p}</span>
                </div>
              ))}
            </div>

            {/* Quick points creator to test card upgrades */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60">
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Simulación de Consumos en Sucursal</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onUpdatePoints(50)}
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 font-extrabold text-[10px] uppercase text-zinc-300 rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  Registrar Consumo (+50 pts)
                </button>
                <button
                  onClick={() => onUpdatePoints(150)}
                  className="flex-1 py-1.5 bg-zinc-850 hover:bg-zinc-750 font-extrabold text-[10px] uppercase text-amber-500 rounded-lg active:scale-95 transition-all cursor-pointer border border-amber-500/10"
                >
                  Registrar Combo (+150 pts)
                </button>
              </div>
            </div>
          </div>

          {/* CONFIGURACIÓN Y PREFERENCIAS DEL SISTEMA PANEL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-450 flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Configuración del Sistema</span>
            </h3>

            {/* Toggles: Activar / Desactivar Notificaciones */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-zinc-400" />
                Control de Notificaciones
              </h4>

              {/* Promo alerts */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-zinc-200">Alertas de Promociones Flash</p>
                  <p className="text-[10px] text-zinc-500">Recibe cupones del día (BURGERLOVE, PAPASVIP)</p>
                </div>
                <button
                  onClick={() => setPromoNotif(!promoNotif)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    promoNotif ? 'bg-amber-500' : 'bg-zinc-855 bg-zinc-800'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    promoNotif ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Points alerts */}
              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <p className="font-bold text-zinc-200">Alertas de Puntos VIP</p>
                  <p className="text-[10px] text-zinc-500">Aviso sonoro inmediato al sumar o canjear</p>
                </div>
                <button
                  onClick={() => setPointsNotif(!pointsNotif)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    pointsNotif ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    pointsNotif ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Order status alerts */}
              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <p className="font-bold text-zinc-200">Mensajes de Cocina</p>
                  <p className="text-[10px] text-zinc-400">Actualización en tiempo real del progreso</p>
                </div>
                <button
                  onClick={() => setStatusNotif(!statusNotif)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    statusNotif ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    statusNotif ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

            </div>

            {/* Cambiar Contraseña Section */}
            <div className="border-t border-zinc-800/60 pt-4.5 space-y-2.5">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Cambiar Contraseña Secreta</h4>
              {showPassModal ? (
                <form onSubmit={handleUpdatePassword} className="space-y-3 bg-zinc-950/80 border border-zinc-850 p-4.5 rounded-xl">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Contraseña Actual</label>
                    <input
                      type="password"
                      required
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-650"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-650"
                    />
                  </div>

                  {passSuccess ? (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-center rounded-lg text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>¡Contraseña Cambiada con Éxito!</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassModal(false)}
                        className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[11px] font-bold uppercase"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[11px] font-bold uppercase"
                      >
                        Actualizar
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowPassModal(true)}
                  className="w-full py-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modificar Contraseña</span>
                </button>
              )}
            </div>

            {/* Other configs (Idioma, Ubicación, Modo ahorro de datos) */}
            <div className="border-t border-zinc-800/60 pt-4.5 space-y-3.5">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Otras Preferencias de la Aplicación
              </h4>

              {/* Language Selector */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-zinc-200">Idioma Preferido</p>
                  <p className="text-[10px] text-zinc-500">Selección del catálogo interactivo</p>
                </div>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="bg-zinc-955 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-300 font-bold outline-none focus:border-amber-500"
                >
                  <option value="es">Español (México)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>

              {/* Data saver mode */}
              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <p className="font-bold text-zinc-200">Modo Ahorro de Datos</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Baja calidad de imágenes para Lombardo Toledano 1200</p>
                </div>
                <button
                  onClick={() => setDataSaver(!dataSaver)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    dataSaver ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    dataSaver ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Address customization input */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-zinc-200">Preferencia de Consumo & Servicio</p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Mesa 4, Para Llevar, Escalonado, etc."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* App Status Check */}
              <div className="pt-2">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse animate-bounce" />
                    <div>
                      <p className="text-[10px] text-zinc-300 font-extrabold uppercase leading-none">Versión del Sistema</p>
                      <p className="text-[9px] text-zinc-500 mt-1">v4.1.2 - Sabor Activo</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                </div>
              </div>

            </div>

          </div>

          {/* SUCURSAL INFO MAP PIN */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">Datos de la Matriz</h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-100">Dirección Física</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                  Lombardo Toledano 1200,<br /> Fraccionamiento Hacienda del Bosque
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-zinc-800/50 pt-3">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-100">Teléfono & WhatsApp</p>
                <a href="tel:6861105191" className="text-xs text-amber-500 font-semibold hover:underline block mt-0.5">
                  686 110 51 91
                </a>
              </div>
            </div>
          </div>

          {/* USER CONFIG AND LOGOUT BUTTON */}
          <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-900 rounded-xl p-3 px-4">
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-300 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-zinc-505 text-zinc-500 uppercase font-black">Cliente Autenticado</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center border border-zinc-800"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>

        </div>
      ) : (
        // AUTHENTICATION FORM (SIGNIN/SIGNUP)
        <div className="bg-zinc-900 border border-zinc-900/60 p-5 rounded-2xl shadow-xl">
          <div className="flex border-b border-zinc-800 pb-3 mb-5">
            <button
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage('');
              }}
              className={`flex-1 pb-1 text-center font-bold text-xs uppercase tracking-wider ${
                !isRegistering ? 'text-amber-500 border-b border-amber-500' : 'text-zinc-500'
              }`}
            >
              Identificarse
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage('');
              }}
              className={`flex-1 pb-1 text-center font-bold text-xs uppercase tracking-wider ${
                isRegistering ? 'text-amber-500 border-b border-amber-500' : 'text-zinc-500'
              }`}
            >
              Crear Cuenta VIP
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Alonzo Cardona"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-0"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email o Usuario</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-0"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] text-red-500 font-semibold uppercase flex gap-1.5 items-center">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-500 active:scale-98 transition-all cursor-pointer"
            >
              {isRegistering ? 'Crear Mi Membresía Club' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Quick tester bypass message */}
          <div className="mt-5 p-3 rounded-xl bg-orange-950/15 border border-orange-950/20 text-center">
            <p className="text-[10px] text-zinc-400 font-medium">
              💡 <strong>Ingreso Rápido Club:</strong> Introduce cualquier correo y contraseña para acceder de inmediato al menú interactivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
