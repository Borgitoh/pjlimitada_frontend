import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/admin.models';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isLargeScreen = true;
  pageTitle = 'Dashboard';
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupRouterListener();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.sidebarCollapsed = false;
    } else {
      this.sidebarCollapsed = true;
    }
  }

  private setupRouterListener(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  private updatePageTitle(url: string): void {
    const titleMap: { [key: string]: string } = {
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'Gestão de Usuários',
      '/admin/brands': 'Marcas e Modelos',
      '/admin/products': 'Gestão de Produtos',
      '/admin/sales': 'Gestão de Vendas',
      '/admin/reports': 'Relatórios e Análises',
      '/admin/settings': 'Configurações'
    };

    this.pageTitle = titleMap[url] || 'Dashboard';
  }

  private loadCurrentUser(): void {
    this.adminService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }
}
