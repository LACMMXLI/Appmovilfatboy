import { Product, Category, Review, Notification } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Todo', icon: 'Utensils' },
  { id: 'burgers', name: 'Hamburguesas', icon: 'Flame' },
  { id: 'hotdogs', name: 'Hot Dogs', icon: 'Flame' },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie' },
  { id: 'burritos', name: 'Burritos', icon: 'Flame' },
  { id: 'sushi', name: 'Sushi', icon: 'Utensils' },
  { id: 'tortas', name: 'Tortas', icon: 'Cookie' },
  { id: 'nachos', name: 'Nachos', icon: 'Cookie' },
  { id: 'papas', name: 'Papas', icon: 'Cookie' },
  { id: 'drinks', name: 'Bebidas', icon: 'CupSoda' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Hamburguesas
  {
    id: 'fb-b1',
    name: 'Fatboy Especial Burger',
    description: 'Doble carne de res 160g seleccionada, costra de queso cheddar, cebolla crispy caramelizada, tocino ahumado y aderezo especial Fatboy.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    categoryId: 'burgers',
    rating: 4.9,
    prepTime: '10-12 min',
    tags: ['La Casa', 'Más Vendida']
  },
  {
    id: 'fb-b2',
    name: 'Monster Bacon Cheeseburger',
    description: 'Triple carne, triple dosis de tocino ahumado grueso, bañada en cheddar fundido sobre pan brioche horneado al día.',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    categoryId: 'burgers',
    rating: 4.8,
    prepTime: '12-15 min',
    tags: ['Para Campeones']
  },

  // Hot Dogs
  {
    id: 'fb-hd1',
    name: 'Fatboy XL Dog',
    description: 'Salchicha de pavo de 22cm envuelta en tocino crujiente, mayonesa jalapeño, pico de gallo fresco y queso cheddar derretido.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=500&auto=format&fit=crop&q=80',
    categoryId: 'hotdogs',
    rating: 4.7,
    prepTime: '8 min',
    tags: ['Clásico']
  },
  {
    id: 'fb-hd2',
    name: 'Hot Dog Chilorio',
    description: 'Nuestra salchicha jumbo con deliciosa carne deshebrada de chilorio norteño, cebolla morada curtida y crema de chipotle.',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80',
    categoryId: 'hotdogs',
    rating: 4.9,
    prepTime: '10 min',
    tags: ['Especialidad']
  },

  // Snacks
  {
    id: 'fb-s1',
    name: 'Alitas Fatboy Crujientes (x8)',
    description: 'Alitas cubiertas en salsa Buffalo original o BBQ Ahumada dulce. Servidas con varitas de apio fresco y aderezo azul original.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
    categoryId: 'snacks',
    rating: 4.6,
    prepTime: '12 min',
    tags: ['Favorito']
  },
  {
    id: 'fb-s2',
    name: 'Dedos de Queso Fundidos',
    description: 'Bastones de queso mozzarella Premium empanizados con finas hierbas y fritos. Acompañados de salsa pomodoro templada.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=500&auto=format&fit=crop&q=80',
    categoryId: 'snacks',
    rating: 4.5,
    prepTime: '7 min'
  },

  // Burritos
  {
    id: 'fb-bur1',
    name: 'Burrito Fatboy de Asada',
    description: 'Tortilla gigante de harina sobaquera llena de fina carne asada al carbón, aguacate molido, frijoles refritos y queso asadero hilos.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&auto=format&fit=crop&q=80',
    categoryId: 'burritos',
    rating: 4.9,
    prepTime: '9 min',
    tags: ['Norteño']
  },

  // Sushi
  {
    id: 'fb-sus1',
    name: 'Fatboy Roll Especial',
    description: 'Rollo empanizado por fuera, relleno de camarón tempura, queso crema de ajo, aguacate fresco y bañado en salsa cremosa de anguila.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80',
    categoryId: 'sushi',
    rating: 4.8,
    prepTime: '15 min',
    tags: ['Estilo Mexicali']
  },

  // Tortas
  {
    id: 'fb-t1',
    name: 'Torta de Asada Ahumada',
    description: 'Pan telera untado de mantequilla y dorado, cargado de carne asada, guacamole especial de la casa, tomate, cebolla asada y aderezo.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&auto=format&fit=crop&q=80',
    categoryId: 'tortas',
    rating: 4.7,
    prepTime: '8 min'
  },

  // Nachos
  {
    id: 'fb-n1',
    name: 'Nachos Fatboy Supremos',
    description: 'Totopos de maíz crujientes cubiertos con queso cheddar líquido caliente, frijoles, carne asada de primera, crema y jalapeños frescos.',
    price: 7.49,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=80',
    categoryId: 'nachos',
    rating: 4.8,
    prepTime: '6 min',
    tags: ['Para Compartir']
  },

  // Papas
  {
    id: 'fb-pap1',
    name: 'Papas Locas con Asada',
    description: 'Papas fritas sazonadas corte rústico, con queso cheddar y mozzarella gratinados, coronadas con abundante carne asada picada.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    categoryId: 'papas',
    rating: 4.9,
    prepTime: '8 min',
    tags: ['Recomendado']
  },

  // Bebidas
  {
    id: 'fb-d1',
    name: 'Malteada Oreo Premium',
    description: 'Batido ultra espeso con base de helado de vainilla fina, galletas Oreo trituradas, crema batida y chocolate belga raspado.',
    price: 4.49,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=80',
    categoryId: 'drinks',
    rating: 4.9,
    prepTime: '5 min',
    tags: ['Dulce tentación']
  },
  {
    id: 'fb-d2',
    name: 'Soda Italiana de Maracuyá',
    description: 'Jarabe concentrado natural de maracuyá maduro, agua mineral carbonatada, hojas de menta orgánica y hielo triturado.',
    price: 3.29,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    categoryId: 'drinks',
    rating: 4.6,
    prepTime: '3 min'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-fb1',
    author: 'Daniela González',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: '¡Las mejores hamburguesas y papas locas de Mexicali! La Fatboy Especial es gigante y su aderezo es inigualable. El servicio en Lombardo Toledano 1200 es excelente.',
    date: 'Hace 3 días',
    reply: '¡Muchísimas gracias, Daniela! Amamos ponerle todo el sabor premium a nuestras hamburguesas. ¡Feliz de tenerte en nuestro Club VIP!',
    channel: 'google',
  },
  {
    id: 'rev-fb2',
    author: 'Carlos Alberto Meléndez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Por fin un lugar con excelentes Burritos de asada y Sushi en el mismo menú. Tienen un sabor maravilloso. Pedí por WhatsApp y llegó súper rápido y calientito.',
    date: 'Hace 1 semana',
    reply: '¡Apreciamos tu lealtad, Carlos! Nos esforzamos por fusionar lo mejor de la comida urbana con alta calidad. ¡Disfruta tus puntos!',
    channel: 'google',
  },
  {
    id: 'rev-fb3',
    author: 'Sofía Romero Corona',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Las malteadas de Oreo son una locura de ricas. Acumular puntos VIP es súper fácil y ya canjeé un Fatboy XL Dog gratis. ¡Recomendadísimo Fatboy Restaurant!',
    date: 'Hace 2 semanas',
    channel: 'google',
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-fb1',
    title: '🍔 ¡Bienvenido a Fatboy Restaurant!',
    body: 'Estamos en Lombardo Toledano 1200, Fracc. Hacienda del Bosque. Ordene por WhatsApp al 686 110 51 91 para atención inmediata.',
    timestamp: 'Hace unos minutos',
    isRead: false,
    type: 'system',
  },
  {
    id: 'notif-fb2',
    title: '🔥 Promo Flash: 10% OFF en Burritos',
    body: 'Llévate el Burrito Fatboy de Asada con un descuento especial del Club VIP hoy.',
    timestamp: 'Hace 1 hora',
    isRead: false,
    type: 'promo',
  },
  {
    id: 'notif-fb3',
    title: '🎁 Tus primeros 120 puntos VIP',
    body: 'Por crear tu membresía digital en la app de Fatboy, te agregamos 120 puntos directos de cortesía.',
    timestamp: 'Hace 2 horas',
    isRead: false,
    type: 'loyalty',
  }
];
