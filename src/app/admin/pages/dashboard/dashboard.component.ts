import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { DashboardStats, ChartData } from '../../models/admin.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
    topProducts: [],
    salesByCategory: [],
    monthlySalesData: [],
    topBrands: [],
    recentSales: []
  };

  salesChartData: ChartData = { labels: [], datasets: [] };
  categoryChartData: ChartData = { labels: [], datasets: [] };
  
  private destroy$ = new Subject<void>();
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'transfer': 'Transferência'
    };
    return labels[method] || method;
  }

  private loadDashboardData(): void {
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
        this.setupCharts();
        this.loading = false;
      });
  }

  private setupCharts(): void {
    // Sales trend chart
    this.salesChartData = {
      labels: this.stats.monthlySalesData.map(item => item.month),
      datasets: [
        {
          label: 'Vendas',
          data: this.stats.monthlySalesData.map(item => item.sales),
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          fill: true,
          borderWidth: 2
        }
      ]
    };

    // Category pie chart
    this.categoryChartData = {
      labels: this.stats.salesByCategory.map(item => item.category),
      datasets: [
        {
          data: this.stats.salesByCategory.map(item => item.value),
          backgroundColor: [
            '#00bcd4',
            '#26c6da',
            '#4dd0e1',
            '#80deea',
            '#b2ebf2'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }
}
