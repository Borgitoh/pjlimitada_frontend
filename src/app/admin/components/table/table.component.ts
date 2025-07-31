import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TableColumn, TableAction } from '../../models/admin.models';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() searchable: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() addButtonText: string = 'Adicionar';
  @Input() emptyMessage: string = 'Nenhum item cadastrado';
  @Input() pageSize: number = 10;

  @Output() add = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  filteredData: any[] = [];
  paginatedData: any[] = [];
  totalPages: number = 1;
  Math = Math;

  ngOnInit(): void {
    this.updateFilteredData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateFilteredData();
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateFilteredData();
    this.search.emit(this.searchTerm);
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.updateFilteredData();
  }

  onAdd(): void {
    this.add.emit();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getFieldValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getStatusLabel(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Ativo' : 'Inativo';
    }
    if (value === 'active') return 'Ativo';
    if (value === 'inactive') return 'Inativo';
    return value;
  }

  getActionClasses(type: string): string {
    const baseClasses = 'p-2 rounded-md transition-colors';
    switch (type) {
      case 'primary':
        return `${baseClasses} text-blue-600 hover:bg-blue-100`;
      case 'secondary':
        return `${baseClasses} text-gray-600 hover:bg-gray-100`;
      case 'danger':
        return `${baseClasses} text-red-600 hover:bg-red-100`;
      default:
        return `${baseClasses} text-gray-600 hover:bg-gray-100`;
    }
  }

  private updateFilteredData(): void {
    let filtered = [...this.data];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        this.columns.some(column => {
          const value = this.getFieldValue(item, column.key);
          return value && value.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const aValue = this.getFieldValue(a, this.sortColumn);
        const bValue = this.getFieldValue(b, this.sortColumn);
        
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredData = filtered;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }
}
