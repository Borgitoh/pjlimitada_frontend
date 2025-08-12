import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ChartData } from '../../models/admin.models';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() title: string = '';
  @Input() type: ChartType = 'line';
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() showControls: boolean = false;
  @Input() periods: string[] = ['7D', '30D', '90D', '1A'];
  @Input() chartId: string = 'chart-' + Math.random().toString(36).substr(2, 9);

  selectedPeriod: string = '30D';
  private chart: Chart | null = null;

  ngOnInit(): void {
    this.selectedPeriod = this.periods[1] || '30D';
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.data.datasets.length > 1,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: this.getScaleConfig(),
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private getScaleConfig(): any {
    if (this.type === 'pie' || this.type === 'doughnut') {
      return {};
    }

    return {
      x: {
        display: true,
        grid: {
          color: '#f3f4f6'
        }
      },
      y: {
        display: true,
        grid: {
          color: '#f3f4f6'
        },
        beginAtZero: true
      }
    };
  }

  updateChart(newData: ChartData): void {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }
}
