import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Brand, CarModel, TableColumn, TableAction } from '../../models/admin.models';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit, OnDestroy {
  activeTab: 'brands' | 'models' = 'brands';
  brands: Brand[] = [];
  models: CarModel[] = [];
  filteredModels: CarModel[] = [];
  selectedBrandFilter: string = '';

  // Brand form
  currentBrand: any = { name: '', active: true };
  isBrandModalOpen = false;
  brandModalTitle = '';
  brandEditMode = false;

  // Model form
  currentModel: any = { name: '', brandId: '', year: new Date().getFullYear(), version: '', active: true };
  isModelModalOpen = false;
  modelModalTitle = '';
  modelEditMode = false;

  private destroy$ = new Subject<void>();

  brandColumns: TableColumn[] = [
    { key: 'name', label: 'Nome da Marca', sortable: true, type: 'text' },
    { key: 'modelsCount', label: 'Modelos', type: 'number', sortable: true },
    { key: 'active', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  modelColumns: TableColumn[] = [
    { key: 'brandName', label: 'Marca', sortable: true, type: 'text' },
    { key: 'name', label: 'Modelo', sortable: true, type: 'text' },
    { key: 'year', label: 'Ano', type: 'number', sortable: true },
    { key: 'version', label: 'Versão', type: 'text' },
    { key: 'active', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  brandActions: TableAction[] = [
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      type: 'primary',
      action: (brand: Brand) => this.editBrand(brand)
    },
    {
      label: 'Ver Modelos',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      type: 'secondary',
      action: (brand: Brand) => this.viewBrandModels(brand)
    }
  ];

  modelActions: TableAction[] = [
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      type: 'primary',
      action: (model: CarModel) => this.editModel(model)
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      type: 'danger',
      action: (model: CarModel) => this.deleteModel(model)
    }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadBrands();
    this.loadAllModels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Brand methods
  openBrandModal(): void {
    this.brandEditMode = false;
    this.brandModalTitle = 'Nova Marca';
    this.currentBrand = { name: '', active: true };
    this.isBrandModalOpen = true;
  }

  editBrand(brand: Brand): void {
    this.brandEditMode = true;
    this.brandModalTitle = 'Editar Marca';
    this.currentBrand = { ...brand };
    this.isBrandModalOpen = true;
  }

  closeBrandModal(): void {
    this.isBrandModalOpen = false;
    this.currentBrand = { name: '', active: true };
  }

  isBrandFormValid(): boolean {
    return !!(this.currentBrand.name && this.currentBrand.name.trim());
  }

  saveBrand(): void {
    if (!this.isBrandFormValid()) return;

    if (this.brandEditMode) {
      const brandIndex = this.brands.findIndex(b => b.id === this.currentBrand.id);
      if (brandIndex !== -1) {
        this.brands[brandIndex] = { ...this.currentBrand };
      }
    } else {
      const newBrand: Brand = {
        id: Date.now().toString(),
        name: this.currentBrand.name,
        active: this.currentBrand.active,
        modelsCount: 0
      };
      this.brands.push(newBrand);
    }

    this.closeBrandModal();
  }

  viewBrandModels(brand: Brand): void {
    this.selectedBrandFilter = brand.id;
    this.activeTab = 'models';
    this.filterModelsByBrand();
  }

  // Model methods
  openModelModal(): void {
    this.modelEditMode = false;
    this.modelModalTitle = 'Novo Modelo';
    this.currentModel = { 
      name: '', 
      brandId: '', 
      year: new Date().getFullYear(), 
      version: '', 
      active: true 
    };
    this.isModelModalOpen = true;
  }

  editModel(model: CarModel): void {
    this.modelEditMode = true;
    this.modelModalTitle = 'Editar Modelo';
    this.currentModel = { ...model };
    this.isModelModalOpen = true;
  }

  deleteModel(model: CarModel): void {
    if (confirm(`Tem certeza que deseja excluir o modelo ${model.name}?`)) {
      this.models = this.models.filter(m => m.id !== model.id);
      this.filterModelsByBrand();
      
      // Update brand models count
      const brand = this.brands.find(b => b.id === model.brandId);
      if (brand) {
        brand.modelsCount = Math.max(0, brand.modelsCount - 1);
      }
    }
  }

  closeModelModal(): void {
    this.isModelModalOpen = false;
    this.currentModel = { 
      name: '', 
      brandId: '', 
      year: new Date().getFullYear(), 
      version: '', 
      active: true 
    };
  }

  isModelFormValid(): boolean {
    return !!(
      this.currentModel.name && 
      this.currentModel.name.trim() &&
      this.currentModel.brandId &&
      this.currentModel.year
    );
  }

  saveModel(): void {
    if (!this.isModelFormValid()) return;

    if (this.modelEditMode) {
      const modelIndex = this.models.findIndex(m => m.id === this.currentModel.id);
      if (modelIndex !== -1) {
        this.models[modelIndex] = { ...this.currentModel };
      }
    } else {
      const newModel: CarModel = {
        id: Date.now().toString(),
        name: this.currentModel.name,
        brandId: this.currentModel.brandId,
        year: this.currentModel.year,
        version: this.currentModel.version,
        active: this.currentModel.active
      };
      this.models.push(newModel);
      
      // Update brand models count
      const brand = this.brands.find(b => b.id === newModel.brandId);
      if (brand) {
        brand.modelsCount++;
      }
    }

    this.filterModelsByBrand();
    this.closeModelModal();
  }

  filterModelsByBrand(): void {
    if (this.selectedBrandFilter) {
      this.filteredModels = this.models
        .filter(model => model.brandId === this.selectedBrandFilter)
        .map(model => ({
          ...model,
          brandName: this.getBrandName(model.brandId)
        }));
    } else {
      this.filteredModels = this.models.map(model => ({
        ...model,
        brandName: this.getBrandName(model.brandId)
      }));
    }
  }

  private loadBrands(): void {
    this.adminService.getBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe(brands => {
        this.brands = brands;
      });
  }

  private loadAllModels(): void {
    // For demo purposes, creating some mock models
    this.models = [
      { id: '1', name: 'Serie 3', brandId: '1', year: 2020, version: '320i', active: true },
      { id: '2', name: 'Serie 5', brandId: '1', year: 2021, version: '530i', active: true },
      { id: '3', name: 'X3', brandId: '1', year: 2022, active: true },
      { id: '4', name: 'A3', brandId: '2', year: 2021, version: 'Sportback', active: true },
      { id: '5', name: 'A4', brandId: '2', year: 2020, version: 'Avant', active: true },
      { id: '6', name: 'Q5', brandId: '2', year: 2022, active: true },
      { id: '7', name: 'Golf', brandId: '3', year: 2021, version: 'GTI', active: true },
      { id: '8', name: 'Passat', brandId: '3', year: 2020, active: true }
    ];
    this.filterModelsByBrand();
  }

  private getBrandName(brandId: string): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Marca não encontrada';
  }
}
