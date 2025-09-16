export type Id = string;

export interface Category {
  id: Id;
  name: string;
  slug: string;
  order: number;
}

export interface Product {
  id: Id;
  name: string;
  price: number; // в ₽
  currency: 'RUB';
  categoryId: Id;
  images: string[];
  active: boolean;
  createdAt: number;
}

export interface Banner {
  id: Id;
  imageUrl: string;
  linkUrl: string;
  order: number;
  active: boolean;
}