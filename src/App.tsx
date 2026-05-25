import React, { useState, useEffect } from 'react';
import { Bell, Flame, Award, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Product, Category, Review, User, Notification, TabType } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './data';

import BottomNav from './components/BottomNav';
import Notifications from './components/Notifications';
import MenuTab from './components/MenuTab';
import PromosTab from './components/PromosTab';
import ReviewsTab from './components/ReviewsTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [isSplashing, setIsSplashing] = useState<boolean>(true);
  const [animationActive, setAnimationActive] = useState<boolean>(true);

  // Splash screen animation timer
  useEffect(() => {
    if (isSplashing) {
      const timer = setTimeout(() => {
        setAnimationActive(false);
      }, 15000); // 15 seconds active animation
      return () => clearTimeout(timer);
    }
  }, [isSplashing]);

  // Core Data Persistent states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  // Initialize data from localStorage or seed file
  useEffect(() => {
    const localProds = localStorage.getItem('fb_products');
    const localCats = localStorage.getItem('fb_categories');
    const localRevs = localStorage.getItem('fb_reviews');
    const localNotifs = localStorage.getItem('fb_notifications');
    const localUser = localStorage.getItem('fb_current_user');

    if (localProds) setProducts(JSON.parse(localProds));
    else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('fb_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (localCats) setCategories(JSON.parse(localCats));
    else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem('fb_categories', JSON.stringify(INITIAL_CATEGORIES));
    }

    if (localRevs) setReviews(JSON.parse(localRevs));
    else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('fb_reviews', JSON.stringify(INITIAL_REVIEWS));
    }

    if (localNotifs) setNotifications(JSON.parse(localNotifs));
    else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem('fb_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }

    if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    } else {
      // Default demo logged-in user so the experience starts beautifully with unique VIP code!
      const defaultUser: User = {
        uid: 'user_default',
        email: 'alonzocardona123@gmail.com',
        name: 'Alonzo Cardona',
        role: 'customer',
        points: 120,
        phone: '686 110 51 91',
        tier: 'Plata',
        vipCode: 'VIP-148930'
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('fb_current_user', JSON.stringify(defaultUser));
    }
  }, []);

  const saveReviews = (updatedRevs: Review[]) => {
    setReviews(updatedRevs);
    localStorage.setItem('fb_reviews', JSON.stringify(updatedRevs));
  };

  const saveNotifications = (updatedNotifs: Notification[]) => {
    setNotifications(updatedNotifs);
    localStorage.setItem('fb_notifications', JSON.stringify(updatedNotifs));
  };

  const saveUser = (updatedUser: User | null) => {
    setCurrentUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('fb_current_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('fb_current_user');
    }
  };

  // Toast alert trigger helper
  const triggerToast = (title: string, body: string) => {
    setToast({ title, body });
    // Auto clear after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  // Trigger Notification helper + push to state
  const handleAddNewNotification = (title: string, body: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      title,
      body,
      timestamp: 'Ahora mismo',
      isRead: false,
      type,
    };
    const updated = [newNotif, ...notifications];
    saveNotifications(updated);
    triggerToast(title, body);
  };

  // User auth actions
  const handleLogin = (email: string, name: string) => {
    const randomVipNum = Math.floor(100000 + Math.random() * 900000);
    const loggedIn: User = {
      uid: `u_${Date.now()}`,
      email,
      name,
      role: 'customer',
      points: 120, // default starter points
      tier: 'Plata',
      vipCode: `VIP-${randomVipNum}`
    };
    saveUser(loggedIn);
    handleAddNewNotification(
      `🔑 ¡Bienvenido, ${name}!`,
      `Iniciaste sesión con éxito. Código de Fidelidad VIP asignado: VIP-${randomVipNum}`,
      'system'
    );
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    const oldName = currentUser?.name || 'Cliente';
    saveUser(null);
    handleAddNewNotification(
      '🚪 Sesión Finalizada',
      `Hasta luego ${oldName}. ¡Vuelve pronto a Fatboy Restaurant!`,
      'system'
    );
    setActiveTab('home');
  };

  // Points modification
  const handleAddPoints = (ptsAmt: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, points: currentUser.points + ptsAmt };
    saveUser(updated);
  };

  const handleUpdatePoints = (newPointsOffset: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, points: currentUser.points + newPointsOffset };
    saveUser(updated);
    handleAddNewNotification(
      '🌟 Puntos VIP Actualizados',
      `Se te añadieron ${newPointsOffset} puntos de simulación al Club VIP de Fatboy.`,
      'loyalty'
    );
  };

  // Client add review action
  const handleAddReview = (newRevData: Omit<Review, 'id' | 'date'>) => {
    const item: Review = {
      ...newRevData,
      id: `r_${Date.now()}`,
      date: 'Ahora mismo',
    };
    const updated = [item, ...reviews];
    saveReviews(updated);
    
    // Automatically reward review submission with 15 loyalty points!
    if (currentUser) {
      handleAddPoints(15);
      handleAddNewNotification(
        '🎁 ¡Gracias por tu reseña!',
        'Agradecemos tu feedback. Se te han sumado +15 puntos de fidelización por tu opinión.',
        'loyalty'
      );
    }
  };

  // Mark notifications read
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-zinc-950 font-sans min-h-screen grid place-items-center text-zinc-100 antialiased p-0 md:p-6 select-none overflow-x-hidden animate-fade-in">
      
      {/* MOBILE CONTAINER FRAME */}
      <div 
        id="app-iphone-shell"
        className="w-full max-w-md bg-zinc-950 md:rounded-[40px] md:border-[10px] md:border-zinc-800 md:h-[840px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden transition-all duration-300"
      >
        
        {/* Dynamic iOS status bar decoration */}
        <div className="hidden md:flex justify-between items-center px-8 pt-3 pb-1 text-[11px] font-bold tracking-tight text-zinc-400 bg-zinc-950 select-none z-50 rounded-t-[34px]">
          <span>9:41 AM</span>
          {/* iOS notch block */}
          <div className="w-28 h-4.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2.5"></div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>5G</span>
            <span>100% 🔋</span>
          </div>
        </div>

        {/* STARTUP SPLASH ANIMATED SCREEN OVERLAY */}
        {isSplashing && (
          <div 
            onClick={() => setIsSplashing(false)}
            className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden w-full h-full transition-all duration-500"
            title="Toca en cualquier parte para ingresar"
          >
            {/* Glowing outer rings with dynamic animation status */}
            <div className="relative flex flex-col items-center justify-center p-6 text-center transform -translate-y-6">
              <div className={`absolute w-52 h-52 rounded-full bg-orange-600/10 blur-3xl ${animationActive ? 'animate-pulse' : ''}`}></div>
              <div className={`absolute w-32 h-32 rounded-full border border-orange-500/15 ${animationActive ? 'animate-ping duration-1000' : 'border-zinc-800'}`}></div>
              
              {/* Brand Logo icon */}
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/35 transform transition-all duration-1000 ${animationActive ? 'animate-bounce scale-110' : 'scale-100 shadow-amber-500/10'}`}>
                <Flame className={`w-12 h-12 text-black ${animationActive ? 'animate-pulse' : ''}`} />
              </div>

              {/* Big bold slogan */}
              <div className="space-y-1.5 mt-2">
                <h1 className="text-3xl font-black text-white tracking-[0.25em] uppercase leading-none">
                  FATBOY
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-500">
                  RESTAURANTE
                </p>
                <div className="w-14 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full mt-4"></div>
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block pt-2">Lombardo Toledano 1200</span>
              </div>
            </div>

            {/* Micro loading details / interactive instruction */}
            <div className="absolute bottom-16 text-center space-y-4 px-6 w-full">
              <div className="max-w-[280px] mx-auto py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 rounded-full hover:bg-amber-500/20 active:scale-95 transition-all shadow-lg animate-pulse">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                  👉 Toca la pantalla para entrar
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {animationActive ? (
                  <>
                    <div className="w-36 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-infinite-loading w-3/4"></div>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Animación de Carga Activa (15s)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-36 h-1 bg-amber-500 rounded-full"></div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">
                      Carga Lista • Haz clic para ingresar
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY APP HEADER */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40">
          
          {/* Brand Title */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-black animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1">
                FATBOY <span className="text-amber-500">REST.</span>
              </h1>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block leading-none">Lombardo Toledano 1200</span>
            </div>
          </div>

          {/* User notification bell trigger without redundant header stats */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-transform relative"
              id="header-notif-bell"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>

        </header>

        {/* DYNAMIC SCROLL CONTAINER VIEW */}
        <main className="flex-1 overflow-y-auto px-5 pt-5 pb-28 scroll-smooth select-none">
          
          {/* Tab Content Router */}
          {activeTab === 'home' && (
            <MenuTab
              products={products}
              categories={categories}
              currentUser={currentUser}
              onAddPoints={handleAddPoints}
              onTriggerNotification={handleAddNewNotification}
              openAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'promos' && (
            <PromosTab
              currentUser={currentUser}
              onTriggerNotification={handleAddNewNotification}
              openAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              onAddReview={handleAddReview}
              currentUser={currentUser}
              openAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onUpdatePoints={handleUpdatePoints}
            />
          )}

        </main>

        {/* PERSISTENT TAB BAR NAVIGATION */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadNotifs}
        />

        {/* PUSH ALERT INTERACTIVE TOAST */}
        {toast && (
          <div className="absolute top-16 left-4 right-4 z-50 p-3 rounded-2xl bg-zinc-900 border border-amber-500/10 shadow-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="p-1 px-1.5 h-fit text-[9px] font-black uppercase text-black bg-amber-500 rounded font-mono shrink-0">VIP</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-100">{toast.title}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{toast.body}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-zinc-600 hover:text-zinc-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* NOTIFICATIONS TAB OVERLAY SCREEN SHEET */}
        <Notifications
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
        />

        {/* REQUIRES AUTHENTICATION BACKDROP FORCE MODAL */}
        {showAuthModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-5 flex items-center justify-center">
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5 mt-2">
                <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-tight">Regístrate para continuar</h3>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px] mx-auto leading-normal font-semibold">
                  Únete al Fatboy Restaurant Club VIP para canjear atractivos cupones calientes y ganar puntos en tus pedidos.
                </p>
              </div>

              {/* Nested form to log in or switch path directly */}
              <button
                onClick={() => {
                  handleLogin('alonzocardona123@gmail.com', 'Alonzo Cardona');
                  setShowAuthModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center"
              >
                Iniciar Sesión Rápida Demo ⚡
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
