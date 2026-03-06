export interface Product {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  min_quantity: number;
  price: number;
  cost: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface DashboardStats {
  sales: number;
  profit: number;
  salesCount: number;
  totalItems: number;
  lowStockCount: number;
}

export interface User {
  id: number;
  username: string;
  is_paid: number;
}
