import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { SystemSettings } from '../../models/admin.models';

interface Tab {
  id: string;
  label: string;
}

interface ProductCategory {
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  activeTab = 'company';
  hasChanges = false;
  showSuccessMessage = false;
  taxRatePercent = 0;

  settings: SystemSettings = {
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultMinStock: 5,
    taxRate: 0.18,
    currency: 'BRL',
    language: 'pt',
    theme: 'light',
    notifications: {
      email: true,
      lowStock: true,
      newSales: true
    }
  };

  productCategories: ProductCategory[] = [
    { name: 'Freios', active: true },
    { name: 'Motor', active: true },
    { name: 'Suspensão', active: true },
    { name: 'Bodykit', active: true },
    { name: 'Interior', active: true },
    { name: 'Exterior', active: true }
  ];

  tabs: Tab[] = [
    { id: 'company', label: 'Empresa' },
    { id: 'business', label: 'Negócio' },
    { id: 'system', label: 'Sistema' },
    { id: 'notifications', label: 'Notificações' },
    { id: 'security', label: 'Segurança' }
  ];

  private destroy$ = new Subject<void>();
  private originalSettings: SystemSettings | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markAsChanged(): void {
    this.hasChanges = true;
  }

  updateTaxRate(value: number): void {
    this.settings.taxRate = value / 100;
    this.markAsChanged();
  }

  addCategory(): void {
    this.productCategories.push({ name: '', active: true });
    this.markAsChanged();
  }

  removeCategory(index: number): void {
    this.productCategories.splice(index, 1);
    this.markAsChanged();
  }

  saveSettings(): void {
    if (!this.hasChanges) return;

    // Simulate saving settings
    console.log('Saving settings:', this.settings);
    console.log('Product categories:', this.productCategories);

    // Show success message
    this.showSuccessMessage = true;
    this.hasChanges = false;

    // Hide success message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);

    // Update original settings
    this.originalSettings = { ...this.settings };
  }

  createBackup(): void {
    // Simulate backup creation
    const timestamp = new Date().toLocaleString();
    alert(`Backup criado com sucesso!\nHorário: ${timestamp}\n\nEm um sistema real, isso faria backup de todos os dados.`);
  }

  viewLogs(): void {
    // Simulate viewing logs
    const logs = [
      `${new Date().toLocaleString()} - Admin PJ Limitada acessou configurações`,
      `${new Date(Date.now() - 3600000).toLocaleString()} - Maria Santos registrou nova venda`,
      `${new Date(Date.now() - 7200000).toLocaleString()} - João Silva adicionou novo produto`,
      `${new Date(Date.now() - 86400000).toLocaleString()} - Sistema executou backup automático`
    ];
    
    alert(`Logs de Atividade Recentes:\n\n${logs.join('\n')}\n\nEm um sistema real, isso abriria uma interface completa de logs.`);
  }

  private loadSettings(): void {
    this.adminService.getSystemSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
        this.originalSettings = { ...settings };
        this.taxRatePercent = settings.taxRate * 100;
      });
  }

  // Check if there are unsaved changes before leaving
  canDeactivate(): boolean {
    if (this.hasChanges) {
      return confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?');
    }
    return true;
  }
}
