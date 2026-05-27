import React, { useState, useEffect } from 'react';
import { Bell, Flame, Award, ShieldAlert, Sparkles, X, ShieldCheck, Smartphone, Check, Lock, ArrowRight, Eye, Facebook } from 'lucide-react';
import { Product, Category, Review, User, Notification, TabType } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './data';

import BottomNav from './components/BottomNav';
import Notifications from './components/Notifications';
import MenuTab from './components/MenuTab';
import PromosTab from './components/PromosTab';
import ReviewsTab from './components/ReviewsTab';
import ProfileTab from './components/ProfileTab';

// Live Firebase integration elements
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  testConnection, 
  seedDatabaseIfEmpty, 
  fetchProducts, 
  fetchCategories, 
  fetchReviews, 
  submitReview, 
  fetchUserById, 
  saveUserToFirestore, 
  updateUserPoints, 
  updateUserWhatsApp,
  addNotification as addNotifToDb
} from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

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

  // Specialized firebase auth registration states & steps
  const [pendingRegUser, setPendingRegUser] = useState<{
    uid: string;
    email: string;
    name: string;
    avatarUrl?: string;
  } | null>(null);

  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappStep, setWhatsappStep] = useState<'terms' | 'phone' | 'code' | 'verified'>('terms');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [sentCode, setSentCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Initialize general connections, seeding & auth changes on mount in background
  useEffect(() => {
    const initFirebaseConnection = async () => {
      try {
        await testConnection();
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.warn("Seeding or initial connection issue in background", err);
      }
    };
    initFirebaseConnection();

    // Setup Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if profile exists in Firestore
          const profile = await fetchUserById(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('fb_current_user', JSON.stringify(profile));
            setPendingRegUser(null);
          } else {
            // Initiate multi-step registration (terms and WhatsApp verification)
            setPendingRegUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Cliente Fatboy',
              avatarUrl: firebaseUser.photoURL || '',
            });
            setWhatsappStep('terms');
            setErrorMessage('');
            setShowAuthModal(true);
          }
        } catch (error) {
          console.error("Error looking up profile in Firestore:", error);
          setPendingRegUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Cliente Fatboy',
            avatarUrl: firebaseUser.photoURL || '',
          });
        }
      } else {
        const localUser = localStorage.getItem('fb_current_user');
        if (localUser && JSON.parse(localUser).uid === 'user_default') {
          setCurrentUser(JSON.parse(localUser));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('fb_current_user');
        }
      }
    });

    // Notifications fallback
    const localNotifs = localStorage.getItem('fb_notifications');
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem('fb_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }

    return () => unsubscribe();
  }, []);

  // DEFERRED / LAZY LOADING STRATEGY: Fetch products, categories and reviews ONLY after splash screen is dismissed
  useEffect(() => {
    if (isSplashing) {
      setDbLoading(true);
      return;
    }

    const loadDataPostSplash = async () => {
      setDbLoading(true);
      const startTime = Date.now();
      try {
        // Fetch products, categories and reviews from Firebase
        const [dbProds, dbCats, dbRevs] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchReviews()
        ]);

        if (dbProds && dbProds.length > 0) {
          setProducts(dbProds);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }

        if (dbCats && dbCats.length > 0) {
          setCategories(dbCats);
        } else {
          setCategories(INITIAL_CATEGORIES);
        }

        if (dbRevs && dbRevs.length > 0) {
          setReviews(dbRevs);
        } else {
          setReviews(INITIAL_REVIEWS);
        }
      } catch (err) {
        console.error("Failed to load live Firebase data, using offline fallback:", err);
        setProducts(INITIAL_PRODUCTS);
        setCategories(INITIAL_CATEGORIES);
        setReviews(INITIAL_REVIEWS);
      } finally {
        // Enforce a premium minimum display delay of 1200ms to allow smooth skeleton pulse visuals
        const elapsed = Date.now() - startTime;
        const minDelay = 1200;
        if (elapsed < minDelay) {
          await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
        }
        setDbLoading(false);
      }
    };

    loadDataPostSplash();
  }, [isSplashing]);

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
      // If we logout of firebase we reset to default demo user or null
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
  const handleAddNewNotification = async (title: string, body: string, type: Notification['type']) => {
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

    // Sync to Firestore notifications if signed in
    if (currentUser && currentUser.uid !== 'user_default') {
      try {
        await addNotifToDb(newNotif);
      } catch (err) {
        console.error("Failed to sync notification to Firestore:", err);
      }
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setErrorMessage('');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Popup block or OAuth error: activating sandboxed simulator:", err);
      setErrorMessage("No se pudo iniciar con Google (Popup bloqueado). Activando simulador...");
      setTimeout(() => {
        handleFakeGoogleLogin();
      }, 1500);
    }
  };

  const handleSignInWithFacebook = async () => {
    try {
      setErrorMessage('');
      await signInWithPopup(auth, facebookProvider);
    } catch (err: any) {
      console.warn("Popup block or FB OAuth error: activating sandboxed simulator:", err);
      setErrorMessage("No se pudo iniciar con Facebook (Popup bloqueado). Activando simulador...");
      setTimeout(() => {
        handleFakeFacebookLogin();
      }, 1500);
    }
  };

  const handleFakeGoogleLogin = () => {
    setErrorMessage('');
    const demoUid = `gp_${Date.now()}`;
    setPendingRegUser({
      uid: demoUid,
      email: 'alonzocardona123@gmail.com',
      name: 'Alonzo Cardona',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });
    setWhatsappStep('terms');
  };

  const handleFakeFacebookLogin = () => {
    setErrorMessage('');
    const demoUid = `fb_${Date.now()}`;
    setPendingRegUser({
      uid: demoUid,
      email: 'facebook_user@gmail.com',
      name: 'Juan Pérez',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    });
    setWhatsappStep('terms');
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
      vipCode: `VIP-${randomVipNum}`,
      whatsappVerified: true,
      termsAccepted: true
    };
    saveUser(loggedIn);
    handleAddNewNotification(
      `🔑 ¡Bienvenido, ${name}!`,
      `Iniciaste sesión con éxito. Código de Fidelidad VIP asignado: VIP-${randomVipNum}`,
      'system'
    );
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    const oldName = currentUser?.name || 'Cliente';
    
    // Explicitly sign out of Firebase Auth if active
    try {
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.error("Sign out error", err);
    }

    // Set fallback default user
    const defaultUser: User = {
      uid: 'user_default',
      email: 'alonzocardona123@gmail.com',
      name: 'Alonzo Cardona',
      role: 'customer',
      points: 120,
      phone: '686 110 51 91',
      tier: 'Plata',
      vipCode: 'VIP-148930',
      whatsappVerified: true,
      termsAccepted: true
    };
    setCurrentUser(defaultUser);
    localStorage.setItem('fb_current_user', JSON.stringify(defaultUser));

    setPendingRegUser(null);
    setWhatsappStep('terms');

    handleAddNewNotification(
      '🚪 Sesión Finalizada',
      `Hasta luego ${oldName}. Se restableció la cuenta demo. ¡Vuelve pronto!`,
      'system'
    );
    setActiveTab('home');
  };

  // Points modification
  const handleAddPoints = async (ptsAmt: number) => {
    if (!currentUser) return;
    const nextPoints = currentUser.points + ptsAmt;
    let nextTier: 'Bronce' | 'Plata' | 'Oro' = 'Bronce';
    if (nextPoints >= 400) nextTier = 'Oro';
    else if (nextPoints >= 100) nextTier = 'Plata';

    const updated = { ...currentUser, points: nextPoints, tier: nextTier };
    saveUser(updated);

    if (currentUser.uid !== 'user_default') {
      try {
        await updateUserPoints(currentUser.uid, nextPoints, nextTier);
      } catch (err) {
        console.error("Error updating user points in database:", err);
      }
    }
  };

  const handleUpdatePoints = async (newPointsOffset: number) => {
    if (!currentUser) return;
    const nextPoints = currentUser.points + newPointsOffset;
    let nextTier: 'Bronce' | 'Plata' | 'Oro' = 'Bronce';
    if (nextPoints >= 400) nextTier = 'Oro';
    else if (nextPoints >= 100) nextTier = 'Plata';

    const updated = { ...currentUser, points: nextPoints, tier: nextTier };
    saveUser(updated);
    handleAddNewNotification(
      '🌟 Puntos VIP Actualizados',
      `Se te añadieron ${newPointsOffset} puntos de fidelidad al Club VIP de Fatboy.`,
      'loyalty'
    );

    if (currentUser.uid !== 'user_default') {
      try {
        await updateUserPoints(currentUser.uid, nextPoints, nextTier);
      } catch (err) {
        console.error("Error updating user points in database:", err);
      }
    }
  };

  // Client add review action
  const handleAddReview = async (newRevData: Omit<Review, 'id' | 'date'>) => {
    const item: Review = {
      ...newRevData,
      id: `r_${Date.now()}`,
      date: 'Ahora mismo',
    };
    const updated = [item, ...reviews];
    saveReviews(updated);

    // Save review to Firestore!
    try {
      await submitReview(item);
    } catch (err) {
      console.error("Could not write review to Firebase:", err);
    }
    
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
        <header className="pt-safe-top flex items-center justify-between px-5 pb-4 border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40">
          
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
              isLoading={dbLoading}
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
              openAuthModal={() => setShowAuthModal(true)}
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
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-5 flex items-center justify-center animate-fade-in">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800/80 rounded-3xl p-5 relative shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
              
              {/* Close Button unless we are in the middle of completing profile registration */}
              {!pendingRegUser && (
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setErrorMessage('');
                  }}
                  className="absolute top-4.5 right-4.5 p-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* VIEW 1: SOCIAL LOGIN SELECTION */}
              {!pendingRegUser ? (
                <>
                  <div className="text-center mb-5 mt-2">
                    <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500">
                      <Award className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-tight">Únete al Club VIP</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px] mx-auto leading-normal font-semibold">
                      Inicia sesión con tu red social favorita para registrar tus visitas, acumular puntos y reclamar hamburguesas gratis.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl text-center">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Google Login */}
                    <button
                      onClick={handleSignInWithGoogle}
                      className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl duration-200 cursor-pointer shadow flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.104C18.251 1.02 15.524 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.794-.085-1.4-.188-1.925H12.24z"/>
                      </svg>
                      Google Directo
                    </button>

                    {/* Facebook Login */}
                    <button
                      onClick={handleSignInWithFacebook}
                      className="w-full py-3 px-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-white font-black text-xs uppercase tracking-wider rounded-xl duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Facebook className="w-4 h-4 text-[#1877F2]" fill="#1877F2" />
                      Facebook
                    </button>

                    {/* Quick Simulation Fallback */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-zinc-800"></div>
                      <span className="flex-shrink mx-3 text-[9px] text-zinc-600 font-extrabold uppercase tracking-widest">O SIMULADORES</span>
                      <div className="flex-grow border-t border-zinc-800"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleFakeGoogleLogin}
                        className="py-2.5 px-2 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase rounded-lg border border-zinc-700/50 cursor-pointer transition text-center"
                      >
                        ⚡ Google Demo
                      </button>
                      <button
                        onClick={handleFakeFacebookLogin}
                        className="py-2.5 px-2 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase rounded-lg border border-zinc-700/50 cursor-pointer transition text-center"
                      >
                        ⚡ FB Demo
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* VIEW 2: PROFILE PROFILE REGISTRATION AND VALIDATIONS */
                <div className="space-y-4">
                  {/* Stepper Header icons */}
                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${whatsappStep === 'terms' ? 'bg-amber-500 animate-pulse' : 'bg-green-600'}`}></span>
                    <span className="w-6 h-[1.5px] bg-zinc-800"></span>
                    <span className={`w-2.5 h-2.5 rounded-full ${whatsappStep === 'phone' ? 'bg-amber-500 animate-pulse' : whatsappStep === 'terms' ? 'bg-zinc-800' : 'bg-green-600'}`}></span>
                    <span className="w-6 h-[1.5px] bg-zinc-800"></span>
                    <span className={`w-2.5 h-2.5 rounded-full ${whatsappStep === 'code' ? 'bg-amber-500 animate-pulse' : whatsappStep === 'verified' ? 'bg-green-600' : 'bg-zinc-800'}`}></span>
                  </div>

                  {errorMessage && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold rounded-lg text-center animate-shake">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  {/* STEP 1: TERMS AND CONDITIONS */}
                  {whatsappStep === 'terms' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5 text-blue-400">
                          <Eye className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100">1. Responsabilidad de la Información</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-medium">
                          Por favor lee y acepta la política de tratamiento de datos personales de Fatboy Restaurant.
                        </p>
                      </div>

                      {/* Policy Document view box */}
                      <div className="h-28 overflow-y-auto p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[9px] text-zinc-500 font-semibold space-y-2 leading-relaxed scrollbar-thin">
                        <p className="font-bold text-zinc-400 text-center text-[10px]">TÉRMINOS DE CONFIDENCIALIDAD</p>
                        <p>En cumplimiento de las leyes de privacidad, Fatboy Restaurant Club VIP informa:</p>
                        <p>1. **Propósito**: Sus datos de contacto (nombre, email y número de WhatsApp) se utilizarán exclusivamente para validar su membresía VIP en 2 fases, evitar fraudes de duplicación de puntos, notificar sobre sus recompensas conseguidas y procesar de manera directa pedidos al negocio.</p>
                        <p>2. **Seguridad Absoluta**: Sus datos se encriptan bajo estricto certificado SSL y se almacenan de forma permanente e intransferible en Firestore de Google Base de Datos.</p>
                        <p>3. **No SPAM**: Fatboy jamás divulgará, venderá o alquilará su número de contacto con anunciantes de ningún tipo.</p>
                        <p>Usted puede retirar sus datos escribiendo a baja@fatboyrest.com.</p>
                      </div>

                      <button
                        onClick={() => {
                          setWhatsappStep('phone');
                          setErrorMessage('');
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer duration-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        Aceptar y Continuar <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          await fbSignOut(auth);
                          setPendingRegUser(null);
                        }}
                        className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 font-bold transition-colors cursor-pointer"
                      >
                        Cancelar Registro
                      </button>
                    </div>
                  )}

                  {/* STEP 2: WHATSAPP INPUT */}
                  {whatsappStep === 'phone' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5 text-green-400 animate-pulse">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100">2. Registro de WhatsApp Activo</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-medium">
                          Indispensable para enlazar su cuenta del Club VIP y validar transacciones de canje de comida gratis.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">Número de WhatsApp (10 Dígitos)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 font-mono">+52</span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="6861105191"
                            value={whatsappPhone}
                            onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-11 pr-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (whatsappPhone.length < 10) {
                            setErrorMessage('Ingresa un número válido de 10 dígitos.');
                            return;
                          }
                          // Generate random code for simulated verification
                          const code = Math.floor(100000 + Math.random() * 900000).toString();
                          setSentCode(code);
                          setWhatsappStep('code');
                          setErrorMessage('');
                          
                          // Feed simulated SMS notification
                          handleAddNewNotification(
                            '💬 Código de Validación VIP',
                            `[WhatsApp SMS] Tu código de seguridad es: ${code}. Ingrésalo en la aplicación para activar tus 120 pts.`,
                            'system'
                          );
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer duration-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        Enviar Código de Validación <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setWhatsappStep('terms')}
                        className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 font-bold transition-colors cursor-pointer"
                      >
                        Atrás
                      </button>
                    </div>
                  )}

                  {/* STEP 3: OTP CODE INPUT */}
                  {whatsappStep === 'code' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5 text-amber-500">
                          <Lock className="w-5 h-5 animate-bounce" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100">3. Control de Canje Seguro</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-medium">
                          Ingresa el código temporal de 6 dígitos que fue enviado de forma automática a tu WhatsApp.
                        </p>
                      </div>

                      {/* Simulation Hint Helper adhering to "un-obstructive visual sandbox guides" */}
                      <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Código Simulado Recibido</span>
                        <span className="text-sm font-black text-amber-500 font-mono tracking-widest">{sentCode}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block text-center">Código de Seguridad de 6 dígitos</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full py-2.5 text-center text-sm font-black bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none tracking-widest"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (verificationCode !== sentCode) {
                            setErrorMessage('Código incorrecto. Revisa el código indicado arriba.');
                            return;
                          }
                          setErrorMessage('');
                          
                          // Complete user profile creation in Firestore
                          const randomVipNum = Math.floor(100000 + Math.random() * 900000);
                          const newUser: User = {
                            uid: pendingRegUser.uid,
                            email: pendingRegUser.email,
                            name: pendingRegUser.name,
                            role: 'customer',
                            points: 120, // 120 starter points seeded directly
                            phone: `+52 ${whatsappPhone}`,
                            tier: 'Plata',
                            vipCode: `VIP-${randomVipNum}`,
                            whatsappVerified: true,
                            termsAccepted: true
                          };

                          try {
                            // Persistence trigger
                            await saveUserToFirestore(newUser);
                            saveUser(newUser);

                            handleAddNewNotification(
                              `👑 ¡Bienvenido al Club, ${pendingRegUser.name}!`,
                              `Su número fue validado. Cuenta con +120 puntos de regalo VIP para canjear atractores menús.`,
                              'loyalty'
                            );
                            
                            // Success Reset
                            setPendingRegUser(null);
                            setWhatsappStep('terms');
                            setWhatsappPhone('');
                            setVerificationCode('');
                            setShowAuthModal(false);
                          } catch (err) {
                            console.error("Critical Profile Storage Error:", err);
                            setErrorMessage("Fallo de guardado en el servidor Firebase Firestore. Por favor intenta de nuevo.");
                          }
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer duration-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        Verificar & Activar Miembros <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setVerificationCode('');
                          setWhatsappStep('phone');
                        }}
                        className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 font-bold transition-colors cursor-pointer"
                      >
                        Atrás (Cambiar número)
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
