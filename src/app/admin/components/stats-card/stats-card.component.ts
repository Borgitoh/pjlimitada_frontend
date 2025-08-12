import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() subtitle?: string;
  @Input() change?: number;
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-blue-100';
  @Input() iconColorClass: string = 'text-blue-600';
}
