import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { BrandsComponent } from './pages/brands/brands.component';
import { ProductsComponent } from './pages/products/products.component';
import { SalesComponent } from './pages/sales/sales.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ChartComponent } from './components/chart/chart.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { TableComponent } from './components/table/table.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminSidebarComponent,
    DashboardComponent,
    UsersComponent,
    BrandsComponent,
    ProductsComponent,
    SalesComponent,
    OrdersComponent,
    ReportsComponent,
    SettingsComponent,
    ChartComponent,
    StatsCardComponent,
    TableComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
