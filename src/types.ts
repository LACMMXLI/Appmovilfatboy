export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  rating: number;
  prepTime: string; // e.g. "10-15 min"
  isPromo?: boolean;
  discountPrice?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Name of Lucide icon
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  channel: 'google' | 'app';
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'customer';
  points: number;
  avatarUrl?: string;
  phone?: string;
  tier?: 'Bronce' | 'Plata' | 'Oro';
  vipCode?: string;
  whatsappVerified?: boolean;
  termsAccepted?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'promo' | 'loyalty' | 'system';
}

export type TabType = 'home' | 'promos' | 'reviews' | 'profile';
