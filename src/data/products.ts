export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  available: boolean;
  discountDay?: number; // 0 (Sunday) - 6 (Saturday)
  discountPercent?: number; // 0-100
  originalPrice?: number; // Optional, set if there is a discount
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const categories: Category[] = [
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'empanadas', name: 'Empanadas' },
  { id: 'hamburguesas', name: 'Hamburguesas' },
  { id: 'papas-fritas', name: 'Papas Fritas' },
  { id: 'milanesas', name: 'Milanesas' },
  { id: 'postres', name: 'Postres' },
  { id: 'ensaladas', name: 'Ensaladas' },
  { id: 'bebidas', name: 'Bebidas' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Pizza Muzzarella',
    description: 'Salsa de tomate, muzzarella, orégano y aceitunas.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
    categoryId: 'pizzas',
    available: true,
    discountDay: 6, // Sábado (Oferta activa para la demo)
    discountPercent: 15,
  },
  {
    id: '2',
    name: 'Pizza Napolitana',
    description: 'Salsa de tomate, muzzarella, rodajas de tomate, ajo y perejil.',
    price: 13500,
    image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80',
    categoryId: 'pizzas',
    available: true,
  },
  {
    id: '3',
    name: 'Empanada de Carne',
    description: 'Carne cortada a cuchillo, suave y jugosa.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
    categoryId: 'empanadas',
    available: true,
    discountDay: 5, // Viernes (Oferta inactiva hoy)
    discountPercent: 20,
  },
  {
    id: '4',
    name: 'Empanada de Jamón y Queso',
    description: 'Clásica empanada de jamón y queso.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
    categoryId: 'empanadas',
    available: true,
  },
  {
    id: '5',
    name: 'Coca Cola 1.5L',
    description: 'Gaseosa sabor cola.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
    categoryId: 'bebidas',
    available: true,
  },
  {
    id: '6',
    name: 'Cerveza Artesanal IPA',
    description: 'Pinta de cerveza artesanal estilo IPA.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80',
    categoryId: 'bebidas',
    available: true,
    discountDay: 6, // Sábado (Oferta activa)
    discountPercent: 10,
  },
];
