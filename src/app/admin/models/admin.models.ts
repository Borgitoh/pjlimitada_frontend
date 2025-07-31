export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'seller';
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  active: boolean;
  modelsCount: number;
}

export interface CarModel {
  id: string;
  name: string;
  brandId: string;
  year: number;
  version?: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'brakes' | 'engine' | 'suspension' | 'bodykit' | 'interior' | 'exterior';
  compatibleModels: string[];
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  description: string;
  images: string[];
  sku: string;
  active: boolean;
  createdAt: Date;
}

export interface Sale {
  id: string;
  date: Date;
  sellerId: string;
  sellerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  customerName?: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  topProducts: Array<{ name: string; sales: number }>;
  salesByCategory: Array<{ category: string; value: number }>;
  monthlySalesData: Array<{ month: string; sales: number }>;
  topBrands: Array<{ brand: string; count: number }>;
  recentSales: Sale[];
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageSales: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageBrands: boolean;
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultMinStock: number;
  taxRate: number;
  currency: string;
  language: 'pt' | 'en';
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    lowStock: boolean;
    newSales: boolean;
  };
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'actions';
  width?: string;
}

export interface TableAction {
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'danger';
  action: (item: any) => void;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  seller?: string;
  brand?: string;
  product?: string;
}
