import React, { useState, useMemo } from 'react';
import { Search, Flame, Cookie, CupSoda, Percent, Utensils, Star, Clock, ShoppingBag, Plus, Minus, X, Check, Heart, QrCode } from 'lucide-react';
import { Product, Category, User } from '../types';

interface MenuTabProps {
  products: Product[];
  categories: Category[];
  currentUser: User | null;
  onAddPoints: (points: number) => void;
  onTriggerNotification: (title: string, body: string, type: 'promo' | 'loyalty' | 'system') => void;
  openAuthModal: () => void;
}

export default function MenuTab({
  products,
  categories,
  currentUser,
  onAddPoints,
  onTriggerNotification,
  openAuthModal,
}: MenuTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [calculatedPointsEarned, setCalculatedPointsEarned] = useState<number>(0);

  // Helper to resolve Icons
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Cookie': return <Cookie className="w-4 h-4" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4" />;
      case 'Percent': return <Percent className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as { product: Product; quantity: number }[]);
  };

  const clearCart = () => setCart([]);

  const isCartEmpty = cart.length === 0;

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => {
      const activePrice = item.product.isPromo && item.product.discountPrice 
        ? item.product.discountPrice 
        : item.product.price;
      return acc + (activePrice * item.quantity);
    }, 0);
    const serviceFee = subtotal > 0 ? 0.99 : 0;
    const total = subtotal + serviceFee;
    // 10 points for every 1 USD spent
    const points = Math.floor(subtotal * 10);
    return { subtotal, serviceFee, total, points };
  }, [cart]);

  const handleCheckout = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }

    const pointsToEarn = cartTotals.points;
    setCalculatedPointsEarned(pointsToEarn);
    onAddPoints(pointsToEarn);
    
    // Trigger localized notification
    onTriggerNotification(
      '🎉 ¡Pedido procesado exitosamente!',
      `Has ganado +${pointsToEarn} puntos VIP. Tu pedido de Fatboy Restaurant ya se está preparando en cocina.`,
      'loyalty'
    );

    setOrderSuccess(true);
    setCart([]);
  };

  return (
    <div className="pb-24">
      {/* Header Promo Carousel Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 p-4 mb-6 shadow-lg shadow-orange-950/20">
        <div className="relative z-10 flex flex-col justify-center max-w-[70%]">
          <span className="text-[10px] w-fit font-black tracking-widest text-[#150a00] bg-yellow-400 px-2 py-0.5 rounded-full mb-1">PROMO EXCLUSIVA APP</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">Canjea tus Puntos acumulados</h2>
          <p className="text-xs text-orange-100 mt-1 opacity-90 font-medium">Cada compra te acerca más a hamburguesas, papas gourmet y malteadas gratis.</p>
        </div>
        
        {/* Dynamic floating badge */}
        <div className="absolute right-3 bottom-2 top-2 w-[110px] bg-black/30 backdrop-blur-sm border border-white/15 rounded-xl p-2 flex flex-col justify-center items-center text-center">
          <QrCode className="w-9 h-9 text-yellow-300 animate-pulse mb-1" />
          <span className="text-[9px] text-white font-extrabold tracking-wider uppercase leading-none">Auto-Scanner para Mesa</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-5" id="search-box">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca hamburguesas, papas, bebidas..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* FLOATING CART BUTTON (if items inside) */}
      {!isCartEmpty && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black p-4 rounded-full shadow-[0_10px_20px_-3px_rgba(245,158,11,0.4)] flex items-center gap-2 animate-bounce cursor-pointer group"
          id="cart-trigger-btn"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-zinc-950" />
            <span className="absolute -top-2.5 -right-2 bg-zinc-950 text-white rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center font-black">
              {cart.reduce((acu, index) => acu + index.quantity, 0)}
            </span>
          </div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-zinc-950 hidden sm:inline">Ver Carrito</span>
        </button>
      )}

      {/* CATEGORY SELECTOR TABS CONTAINER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none snap-x -mx-4 px-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap scroll-mx-4 transition-all duration-300 snap-start ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* PRODUCTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1 text-zinc-400 text-xs">
          <span>Mostrando {filteredProducts.length} deliciosos productos</span>
          {currentUser && (
            <span className="text-amber-500 font-semibold tracking-wide">
              {currentUser.points} Puntos Club
            </span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
            <ShoppingBag className="w-12 h-12 text-zinc-600 opacity-30 mb-3" />
            <p className="font-bold text-sm text-zinc-300">No encontramos resultados</p>
            <p className="text-xs text-zinc-500 mt-1">Prueba seleccionando otra categoría o cambiando tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5" id="products-grid">
            {filteredProducts.map((prod) => {
              const isFav = favorites.includes(prod.id);
              const hasPromo = prod.isPromo && prod.discountPrice !== undefined;
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group relative flex flex-col bg-zinc-900 border border-zinc-900/60 rounded-2xl overflow-hidden cursor-pointer hover:border-zinc-800 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 transform active:scale-[0.98]"
                  id={`product-${prod.id}`}
                >
                  {/* Image section */}
                  <div className="relative h-28 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Heart favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(prod.id, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Tags */}
                    {prod.tags && prod.tags.length > 0 && (
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase tracking-widest bg-amber-500 text-black px-1.5 py-0.5 rounded-md shadow">
                        {prod.tags[0]}
                      </span>
                    )}

                    {/* Preptime */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-[9px] text-zinc-300 px-1.5 py-0.5 rounded-md">
                      <Clock className="w-2.5 h-2.5 text-amber-500" />
                      <span>{prod.prepTime}</span>
                    </div>
                  </div>

                  {/* Body section */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-normal">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {hasPromo ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-amber-500">
                              ${prod.discountPrice?.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-zinc-500 line-through">
                              ${prod.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-zinc-200">
                            ${prod.price.toFixed(2)}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-[9px] font-bold text-zinc-400">{prod.rating}</span>
                        </div>
                      </div>

                      {/* Add button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod);
                        }}
                        className="p-2 h-fit rounded-xl bg-zinc-800 text-amber-500 hover:bg-amber-500 hover:text-black hover:shadow-md active:scale-95 transition-all duration-300 cursor-pointer"
                        title="Añadir rápido"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Top Image & Back button */}
            <div className="relative h-48 bg-zinc-950">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-950/70 border border-zinc-800/40 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-zinc-100 tracking-tight">
                  {selectedProduct.name}
                </h3>
                
                {/* Price display */}
                <span className="text-base font-black text-amber-500">
                  ${selectedProduct.isPromo && selectedProduct.discountPrice 
                    ? selectedProduct.discountPrice.toFixed(2) 
                    : selectedProduct.price.toFixed(2)}
                </span>
              </div>

              {/* Badges row */}
              <div className="flex gap-2 items-center mt-2">
                <span className="flex items-center gap-1 text-[10px] bg-zinc-950/60 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full font-semibold">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {selectedProduct.prepTime}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] bg-zinc-950/60 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full font-semibold">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {selectedProduct.rating} Calificación
                </span>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Descripción</h4>
                <p className="text-xs text-zinc-400 leading-normal mt-1.5 font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              {/* VIP Reward Info block */}
              <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="p-1 px-1.5 text-[9px] font-black uppercase text-black bg-amber-500 rounded">Club</div>
                  <p className="text-[10px] text-zinc-300">Esta compra te otorga:</p>
                </div>
                <span className="text-xs font-black text-amber-500">
                  +{Math.floor((selectedProduct.isPromo && selectedProduct.discountPrice ? selectedProduct.discountPrice : selectedProduct.price) * 10)} pts
                </span>
              </div>

              {/* Buttons panel */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const quantityInCart = cart.find(item => item.product.id === selectedProduct.id)?.quantity || 0;
                    if (quantityInCart > 0) {
                      updateCartQuantity(selectedProduct.id, 1);
                    } else {
                      addToCart(selectedProduct);
                    }
                    onTriggerNotification(
                      '🛒 Producto Añadido',
                      `Se agregó ${selectedProduct.name} a tu carrito.`,
                      'system'
                    );
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 active:scale-98 transition-all"
                >
                  Agregar Pedido
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY CART DRAWER SHEET */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in-backdrop">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setShowCart(false)}></div>
          
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tight">Tu Orden de Fast Food</h3>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-1 px-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[220px] overflow-y-auto space-y-2.5 mb-4 pr-1">
              {cart.map((item) => {
                const activePrice = item.product.isPromo && item.product.discountPrice
                  ? item.product.discountPrice
                  : item.product.price;
                return (
                  <div key={item.product.id} className="flex justify-between items-center p-2 rounded-xl bg-zinc-900/60 border border-zinc-900">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-200 line-clamp-1">{item.product.name}</p>
                      <span className="text-[10px] text-amber-500 font-extrabold">${activePrice.toFixed(2)} c/u</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded-md p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="p-1 rounded text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-zinc-200 font-mono font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="p-1 rounded text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <span className="text-xs font-black text-zinc-300 w-14 text-right">
                        ${(activePrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary info */}
            <div className="space-y-1.5 border-t border-zinc-900 pt-3 mb-4 text-xs">
              <div className="flex justify-between text-zinc-400 font-medium">
                <span>Subtotal Comida:</span>
                <span className="text-zinc-200">${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-medium">
                <span>Servicio / Cubiertos (Digital):</span>
                <span className="text-zinc-200">${cartTotals.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-500 font-bold">
                <span className="flex items-center gap-1">Acumula puntos Club VIP:</span>
                <span>+{cartTotals.points} Pts</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-zinc-900 pt-1.5 mt-2.5 text-zinc-100">
                <span>TOTAL A PAGAR:</span>
                <span className="text-amber-500">${cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order actions */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-black text-xs uppercase tracking-wider text-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20 hover:scale-98 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-black" />
              <span>Confirmar Mi Pedido</span>
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMED ANIMATED POPUP */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 border border-green-400/20 shadow-lg shadow-green-950/25">
              <Check className="w-8 h-8 text-white stroke-[3px]" />
            </div>

            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight">¡Pedido Recibido! 🍔</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-semibold">
              Tu orden de comida rápida fue enviada a cocina. Hemos debitado tu tarjeta simulación e ingresado a preparación rápida.
            </p>

            <div className="my-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Puntos VIP Ingresados</p>
              <span className="text-2xl font-black text-amber-500 mt-1 block">+{calculatedPointsEarned} Pts</span>
              <p className="text-[10px] text-zinc-400 mt-1 font-medium">Acumulados en tu cuenta del Burger Club VIP.</p>
            </div>

            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 font-extrabold text-xs uppercase tracking-wider text-zinc-200 rounded-xl transition-colors"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
