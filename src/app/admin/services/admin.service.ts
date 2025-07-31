import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  User,
  Brand,
  CarModel,
  Product,
  Sale,
  DashboardStats,
  UserPermissions,
  SystemSettings
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Simulate logged in admin user
    this.setCurrentUser({
      id: '1',
      name: 'Admin PJ Limitada',
      email: 'admin@pjlimitada.com',
      role: 'admin',
      active: true,
      createdAt: new Date(),
      lastLogin: new Date()
    });
  }

  // Authentication
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserPermissions(): UserPermissions {
    const user = this.getCurrentUser();
    if (!user) {
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageSales: false,
        canViewReports: false,
        canManageSettings: false,
        canManageBrands: false
      };
    }

    switch (user.role) {
      case 'admin':
        return {
          canManageUsers: true,
          canManageProducts: true,
          canManageSales: true,
          canViewReports: true,
          canManageSettings: true,
          canManageBrands: true
        };
      case 'manager':
        return {
          canManageUsers: false,
          canManageProducts: true,
          canManageSales: true,
          canViewReports: true,
          canManageSettings: false,
          canManageBrands: true
        };
      case 'seller':
        return {
          canManageUsers: false,
          canManageProducts: false,
          canManageSales: true,
          canViewReports: false,
          canManageSettings: false,
          canManageBrands: false
        };
      default:
        return {
          canManageUsers: false,
          canManageProducts: false,
          canManageSales: false,
          canViewReports: false,
          canManageSettings: false,
          canManageBrands: false
        };
    }
  }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return of({
      todaySales: 15,
      weekSales: 87,
      monthSales: 342,
      totalProducts: 1250,
      lowStockProducts: 23,
      monthlyRevenue: 125000,
      topProducts: [
        { name: 'Kit Freio Performance BMW', sales: 45 },
        { name: 'Bodykit Audi A3', sales: 32 },
        { name: 'Suspensão Coilover VW', sales: 28 },
        { name: 'Escape Esportivo Honda', sales: 24 },
        { name: 'Rodas Aro 18 Toyota', sales: 21 }
      ],
      salesByCategory: [
        { category: 'Freios', value: 35 },
        { category: 'Bodykit', value: 25 },
        { category: 'Suspensão', value: 20 },
        { category: 'Motor', value: 15 },
        { category: 'Interior', value: 5 }
      ],
      monthlySalesData: [
        { month: 'Jan', sales: 280 },
        { month: 'Fev', sales: 320 },
        { month: 'Mar', sales: 290 },
        { month: 'Abr', sales: 350 },
        { month: 'Mai', sales: 310 },
        { month: 'Jun', sales: 342 }
      ],
      topBrands: [
        { brand: 'BMW', count: 45 },
        { brand: 'Audi', count: 38 },
        { brand: 'Volkswagen', count: 32 },
        { brand: 'Toyota', count: 28 },
        { brand: 'Honda', count: 25 }
      ],
      recentSales: this.getMockRecentSales()
    }).pipe(delay(500));
  }

  // Users
  getUsers(): Observable<User[]> {
    return of([
      {
        id: '1',
        name: 'Admin PJ Limitada',
        email: 'admin@pjlimitada.com',
        role: 'admin' as const,
        active: true,
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      },
      {
        id: '2',
        name: 'João Silva',
        email: 'joao.silva@pjlimitada.com',
        role: 'manager' as const,
        active: true,
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date(Date.now() - 86400000)
      },
      {
        id: '3',
        name: 'Maria Santos',
        email: 'maria.santos@pjlimitada.com',
        role: 'seller' as const,
        active: true,
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date(Date.now() - 3600000)
      },
      {
        id: '4',
        name: 'Pedro Costa',
        email: 'pedro.costa@pjlimitada.com',
        role: 'seller' as const,
        active: false,
        createdAt: new Date('2024-01-20'),
        lastLogin: new Date(Date.now() - 604800000)
      }
    ]).pipe(delay(300));
  }

  // Brands
  getBrands(): Observable<Brand[]> {
    return of([
      { id: '1', name: 'BMW', active: true, modelsCount: 15 },
      { id: '2', name: 'Audi', active: true, modelsCount: 12 },
      { id: '3', name: 'Volkswagen', active: true, modelsCount: 18 },
      { id: '4', name: 'Toyota', active: true, modelsCount: 20 },
      { id: '5', name: 'Honda', active: true, modelsCount: 16 },
      { id: '6', name: 'Mercedes-Benz', active: true, modelsCount: 14 },
      { id: '7', name: 'Ford', active: true, modelsCount: 22 },
      { id: '8', name: 'Chevrolet', active: true, modelsCount: 19 }
    ]).pipe(delay(300));
  }

  getModelsByBrand(brandId: string): Observable<CarModel[]> {
    const models: { [key: string]: CarModel[] } = {
      '1': [
        { id: '1', name: 'Serie 3', brandId: '1', year: 2020, version: '320i', active: true },
        { id: '2', name: 'Serie 5', brandId: '1', year: 2021, version: '530i', active: true },
        { id: '3', name: 'X3', brandId: '1', year: 2022, active: true }
      ],
      '2': [
        { id: '4', name: 'A3', brandId: '2', year: 2021, version: 'Sportback', active: true },
        { id: '5', name: 'A4', brandId: '2', year: 2020, version: 'Avant', active: true },
        { id: '6', name: 'Q5', brandId: '2', year: 2022, active: true }
      ]
    };
    return of(models[brandId] || []).pipe(delay(200));
  }

  // Products
  getProducts(): Observable<Product[]> {
    return of([
      {
        id: '1',
        name: 'Kit Freio Performance BMW Serie 3',
        category: 'brakes' as const,
        compatibleModels: ['1', '2'],
        price: 2500,
        cost: 1800,
        stock: 15,
        minStock: 5,
        description: 'Kit completo de freio performance para BMW Serie 3',
        images: ['brake-kit-1.jpg'],
        sku: 'BRK-BMW-001',
        active: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Bodykit Audi A3 Sportback',
        category: 'bodykit' as const,
        compatibleModels: ['4'],
        price: 4500,
        cost: 3200,
        stock: 8,
        minStock: 3,
        description: 'Bodykit completo para Audi A3 Sportback',
        images: ['bodykit-audi-1.jpg'],
        sku: 'BDK-AUD-001',
        active: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Filtro de Ar Esportivo',
        category: 'engine' as const,
        compatibleModels: ['1', '2', '4', '5'],
        price: 350,
        cost: 250,
        stock: 2,
        minStock: 10,
        description: 'Filtro de ar esportivo de alta performance',
        images: ['air-filter-1.jpg'],
        sku: 'FLT-UNI-001',
        active: true,
        createdAt: new Date('2024-02-01')
      }
    ]).pipe(delay(400));
  }

  // Sales
  getSales(): Observable<Sale[]> {
    return of(this.getMockSales()).pipe(delay(300));
  }

  // System Settings
  getSystemSettings(): Observable<SystemSettings> {
    return of({
      companyName: 'PJ Limitada',
      companyAddress: 'Rua das Peças, 123 - São Paulo, SP',
      companyPhone: '+55 11 1234-5678',
      companyEmail: 'contato@pjlimitada.com',
      defaultMinStock: 5,
      taxRate: 0.18,
      currency: 'BRL',
      language: 'pt' as const,
      theme: 'light' as const,
      notifications: {
        email: true,
        lowStock: true,
        newSales: true
      }
    }).pipe(delay(200));
  }

  private getMockRecentSales(): Sale[] {
    return [
      {
        id: '1',
        date: new Date(),
        sellerId: '3',
        sellerName: 'Maria Santos',
        items: [
          {
            productId: '1',
            productName: 'Kit Freio Performance BMW',
            quantity: 1,
            unitPrice: 2500,
            total: 2500
          }
        ],
        subtotal: 2500,
        discount: 0,
        total: 2500,
        paymentMethod: 'card',
        customerName: 'Carlos Silva'
      },
      {
        id: '2',
        date: new Date(Date.now() - 3600000),
        sellerId: '2',
        sellerName: 'João Silva',
        items: [
          {
            productId: '3',
            productName: 'Filtro de Ar Esportivo',
            quantity: 2,
            unitPrice: 350,
            total: 700
          }
        ],
        subtotal: 700,
        discount: 50,
        total: 650,
        paymentMethod: 'cash'
      }
    ];
  }

  private getMockSales(): Sale[] {
    const sales: Sale[] = [];
    const products = ['Kit Freio BMW', 'Bodykit Audi', 'Filtro Ar', 'Suspensão VW', 'Escape Honda'];
    const sellers = [
      { id: '2', name: 'João Silva' },
      { id: '3', name: 'Maria Santos' }
    ];
    const paymentMethods: ('cash' | 'card' | 'transfer')[] = ['cash', 'card', 'transfer'];

    for (let i = 1; i <= 50; i++) {
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Math.floor(Math.random() * 3000) + 500;
      const total = quantity * unitPrice;

      sales.push({
        id: i.toString(),
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        sellerId: seller.id,
        sellerName: seller.name,
        items: [
          {
            productId: i.toString(),
            productName: product,
            quantity,
            unitPrice,
            total
          }
        ],
        subtotal: total,
        discount: Math.floor(Math.random() * 200),
        total: total - Math.floor(Math.random() * 200),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        customerName: Math.random() > 0.3 ? `Cliente ${i}` : undefined
      });
    }

    return sales.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
