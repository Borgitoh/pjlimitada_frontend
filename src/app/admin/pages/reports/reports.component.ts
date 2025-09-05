import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { ChartData, Sale, Product } from '../../models/admin.models';

interface ReportSummary {
  revenue: number;
  salesCount: number;
  avgTicket: number;
  itemsSold: number;
  topCategory: string;
  margin: number;
}

interface SellerPerformance {
  name: string;
  role: string;
  salesCount: number;
  revenue: number;
  avgTicket: number;
  performance: number;
}

interface TopProduct {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  selectedReportType = 'sales';
  selectedPeriod = 'month';
  startDate = '';
  endDate = '';

  summary: ReportSummary = {
    revenue: 0,
    salesCount: 0,
    avgTicket: 0,
    itemsSold: 0,
    topCategory: '',
    margin: 0
  };

  salesChartData: ChartData = { labels: [], datasets: [] };
  categoryChartData: ChartData = { labels: [], datasets: [] };

  sellerPerformance: SellerPerformance[] = [];
  topProducts: TopProduct[] = [];
  lowStockProducts: Product[] = [];

  private destroy$ = new Subject<void>();
  private sales: Sale[] = [];
  private products: Product[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.initializeDates();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onReportTypeChange(): void {
    this.updateReport();
  }

  onPeriodChange(): void {
    this.updatePeriodDates();
    this.updateReport();
  }

  updateReport(): void {
    this.calculateSummary();
    this.updateCharts();
    this.updateSellerPerformance();
    this.updateTopProducts();
  }

  exportReport(): void {
    // Simulated export functionality
    const reportData = {
      type: this.selectedReportType,
      period: this.selectedPeriod,
      startDate: this.startDate,
      endDate: this.endDate,
      summary: this.summary,
      sellers: this.sellerPerformance,
      topProducts: this.topProducts
    };

    console.log('Exporting report:', reportData);
    alert('Relatório exportado com sucesso! (funcionalidade simulada)');
  }

  private initializeDates(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = firstDayOfMonth.toISOString().split('T')[0];
  }

  private updatePeriodDates(): void {
    const today = new Date();

    switch (this.selectedPeriod) {
      case 'today':
        this.startDate = today.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.startDate = weekStart.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = monthStart.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        this.startDate = quarterStart.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.startDate = yearStart.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
    }
  }

  private loadData(): void {
    // Load sales data
    this.adminService.getSales()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sales => {
        this.sales = sales;
        this.updateReport();
      });

    // Load products data
    this.adminService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.updateLowStockProducts();
      });
  }

  private getFilteredSales(): Sale[] {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    endDate.setHours(23, 59, 59, 999);

    return this.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  private calculateSummary(): void {
    const filteredSales = this.getFilteredSales();

    this.summary.revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    this.summary.salesCount = filteredSales.length;
    this.summary.avgTicket = this.summary.salesCount > 0 ? this.summary.revenue / this.summary.salesCount : 0;
    this.summary.itemsSold = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);

    // Calculate top category
    const categoryTotals: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) {
          const category = this.getCategoryLabel(product.category);
          categoryTotals[category] = (categoryTotals[category] || 0) + item.quantity;
        }
      });
    });

    this.summary.topCategory = Object.keys(categoryTotals).reduce((a, b) =>
      categoryTotals[a] > categoryTotals[b] ? a : b, 'N/A');

    // Calculate margin (simplified)
    const totalCost = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        const product = this.products.find(p => p.id === item.productId);
        return itemSum + ((product?.cost || 0) * item.quantity);
      }, 0);
    }, 0);

    this.summary.margin = this.summary.revenue > 0 ?
      ((this.summary.revenue - totalCost) / this.summary.revenue) * 100 : 0;
  }

  private updateCharts(): void {
    const filteredSales = this.getFilteredSales();

    // Sales trend chart
    const salesByDate: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      const dateKey = new Date(sale.date).toLocaleDateString();
      salesByDate[dateKey] = (salesByDate[dateKey] || 0) + sale.total;
    });

    this.salesChartData = {
      labels: Object.keys(salesByDate).slice(-7), // Last 7 days
      datasets: [
        {
          label: 'Vendas (KZ)',
          data: Object.values(salesByDate).slice(-7),
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          fill: true,
          borderWidth: 2
        }
      ]
    };

    // Category chart
    const categoryTotals: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) {
          const category = this.getCategoryLabel(product.category);
          categoryTotals[category] = (categoryTotals[category] || 0) + item.total;
        }
      });
    });

    this.categoryChartData = {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          label: 'Vendas por Categoria',
          data: Object.values(categoryTotals),
          backgroundColor: [
            '#00bcd4',
            '#26c6da',
            '#4dd0e1',
            '#80deea',
            '#b2ebf2',
            '#e0f7fa'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }

  private updateSellerPerformance(): void {
    const filteredSales = this.getFilteredSales();
    const sellerData: { [key: string]: { sales: Sale[], name: string, role: string } } = {};

    // Group sales by seller
    filteredSales.forEach(sale => {
      if (!sellerData[sale.sellerId]) {
        sellerData[sale.sellerId] = { sales: [], name: sale.sellerName, role: 'Vendedor' };
      }
      sellerData[sale.sellerId].sales.push(sale);
    });

    // Calculate performance metrics
    const maxRevenue = Math.max(...Object.values(sellerData).map(data =>
      data.sales.reduce((sum, sale) => sum + sale.total, 0)
    ));

    this.sellerPerformance = Object.entries(sellerData).map(([sellerId, data]) => {
      const revenue = data.sales.reduce((sum, sale) => sum + sale.total, 0);
      const salesCount = data.sales.length;
      const avgTicket = salesCount > 0 ? revenue / salesCount : 0;
      const performance = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

      return {
        name: data.name,
        role: data.role,
        salesCount,
        revenue,
        avgTicket,
        performance: Math.round(performance)
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  private updateTopProducts(): void {
    const filteredSales = this.getFilteredSales();
    const productData: { [key: string]: { quantity: number, revenue: number, name: string, category: string } } = {};

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) {
          if (!productData[item.productId]) {
            productData[item.productId] = {
              quantity: 0,
              revenue: 0,
              name: product.name,
              category: this.getCategoryLabel(product.category)
            };
          }
          productData[item.productId].quantity += item.quantity;
          productData[item.productId].revenue += item.total;
        }
      });
    });

    this.topProducts = Object.values(productData)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  private updateLowStockProducts(): void {
    this.lowStockProducts = this.products
      .filter(product => product.stock <= product.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }

  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'brakes': 'Freios',
      'engine': 'Motor',
      'suspension': 'Suspensão',
      'bodykit': 'Bodykit',
      'interior': 'Interior',
      'exterior': 'Exterior'
    };
    return labels[category] || category;
  }
}
