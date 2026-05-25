import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Componentes
import { AffiliateDashboardComponent } from './pages/dashboard/affiliate-dashboard.component';

@NgModule({
  declarations: [
    AffiliateDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    AffiliateDashboardComponent
  ]
})
export class AffiliatesModule { }
