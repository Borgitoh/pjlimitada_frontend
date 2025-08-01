import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Product, TableColumn, TableAction } from '../../models/admin.models';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = '';
  stockFilter: string = '';

  currentProduct: any = {
    name: '',
    category: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    description: '',
    active: true
  };

  isModalOpen = false;
  modalTitle = '';
  editMode = false;

  // Stats
  totalProducts = 0;
  lowStockCount = 0;
  totalValue = 0;

  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Produto', sortable: true, type: 'text' },
    { key: 'categoryLabel', label: 'Categoria', sortable: true, type: 'text' },
    { key: 'sku', label: 'SKU', sortable: true, type: 'text' },
    { key: 'price', label: 'Preço', type: 'currency', sortable: true },
    { key: 'stock', label: 'Estoque', type: 'number', sortable: true },
    { key: 'stockStatus', label: 'Status', type: 'status' },
    { key: 'active', label: 'Ativo', type: 'status' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      type: 'primary',
      action: (product: Product) => this.editProduct(product)
    },
    {
      label: 'Atualizar Estoque',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      type: 'secondary',
      action: (product: Product) => this.updateStock(product)
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      type: 'danger',
      action: (product: Product) => this.deleteProduct(product)
    }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openProductModal(): void {
    this.editMode = false;
    this.modalTitle = 'Novo Produto';
    this.currentProduct = {
      name: '',
      category: '',
      sku: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      description: '',
      active: true
    };
    this.isModalOpen = true;
  }

  editProduct(product: Product): void {
    this.editMode = true;
    this.modalTitle = 'Editar Produto';
    this.currentProduct = { ...product };
    this.isModalOpen = true;
  }

  updateStock(product: Product): void {
    const newStock = prompt(`Atualizar estoque de "${product.name}".\nEstoque atual: ${product.stock}`, product.stock.toString());
    if (newStock !== null) {
      const stock = parseInt(newStock, 10);
      if (!isNaN(stock) && stock >= 0) {
        const productIndex = this.products.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
          this.products[productIndex].stock = stock;
          this.filterProducts();
          this.updateStats();
        }
      }
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      this.products = this.products.filter(p => p.id !== product.id);
      this.filterProducts();
      this.updateStats();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return !!(
      this.currentProduct.name &&
      this.currentProduct.category &&
      this.currentProduct.sku &&
      this.currentProduct.price > 0 &&
      this.currentProduct.stock >= 0 &&
      this.currentProduct.minStock >= 0
    );
  }

  saveProduct(): void {
    if (!this.isFormValid()) return;

    if (this.editMode) {
      const productIndex = this.products.findIndex(p => p.id === this.currentProduct.id);
      if (productIndex !== -1) {
        this.products[productIndex] = {
          ...this.currentProduct,
          category: this.getCategoryLabel(this.currentProduct.category)
        };
      }
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: this.currentProduct.name,
        category: this.currentProduct.category,
        compatibleModels: [],
        price: this.currentProduct.price,
        cost: this.currentProduct.cost,
        stock: this.currentProduct.stock,
        minStock: this.currentProduct.minStock,
        description: this.currentProduct.description,
        images: [],
        sku: this.currentProduct.sku,
        active: this.currentProduct.active,
        createdAt: new Date()
      };
      this.products.push(newProduct);
    }

    this.filterProducts();
    this.updateStats();
    this.closeModal();
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Stock filter
    if (this.stockFilter) {
      switch (this.stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.stock <= product.minStock && product.stock > 0);
          break;
        case 'normal':
          filtered = filtered.filter(product => product.stock > product.minStock);
          break;
        case 'out':
          filtered = filtered.filter(product => product.stock === 0);
          break;
      }
    }

    // Add stock status for display
    this.filteredProducts = filtered.map(product => ({
      ...product,
      categoryLabel: this.getCategoryLabel(product.category),
      stockStatus: this.getStockStatus(product)
    })) as any;
  }

  private loadProducts(): void {
    this.adminService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.filterProducts();
        this.updateStats();
      });
  }

  private updateStats(): void {
    this.totalProducts = this.products.length;
    this.lowStockCount = this.products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    this.totalValue = this.products.reduce((total, product) => total + (product.price * product.stock), 0);
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

  private getStockStatus(product: Product): boolean {
    return product.stock > product.minStock;
  }

  private resetForm(): void {
    this.currentProduct = {
      name: '',
      category: '',
      sku: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      description: '',
      active: true
    };
  }
}
