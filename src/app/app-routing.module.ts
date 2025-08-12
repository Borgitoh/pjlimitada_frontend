import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListagemComponent } from './pages/listagem/listagem.component';
import { DetalhesComponent } from './pages/detalhes/detalhes.component';
import { LoginComponent } from './components/login/login.component';
import { PecasComponent } from './pages/pecas/pecas.component';
import { BodykitsComponent } from './pages/bodykits/bodykits.component';
import { RegisterComponent } from './components/register/register.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { DemoInvoiceComponent } from './demo-invoice.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'veiculos', component: ListagemComponent },
  // { path: 'veiculos/:id', component: DetalhesComponent },
  { path: 'pecas', component: PecasComponent },
  { path: 'bodykits', component: BodykitsComponent },
  { path: 'pecas/:id', component: DetalhesComponent },
  { path: 'bodykits/:id', component: DetalhesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-success', component: OrderSuccessComponent },
  { path: 'rastreamento', component: OrderTrackingComponent },
  { path: 'meus-pedidos', component: MyOrdersComponent },
  { path: 'demo-fatura', component: DemoInvoiceComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
