import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListagemComponent } from './pages/listagem/listagem.component';
import { DetalhesComponent } from './pages/detalhes/detalhes.component';
import { LoginComponent } from './components/login/login.component';
import { PecasComponent } from './pages/pecas/pecas.component';
import { BodykitsComponent } from './pages/bodykits/bodykits.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'veiculos', component: ListagemComponent },
  { path: 'veiculos/:id', component: DetalhesComponent },
  { path: 'pecas', component: PecasComponent },
  { path: 'bodykits', component: BodykitsComponent },
  { path: 'pecas/:id', component: DetalhesComponent },
  { path: 'bodykits/:id', component: DetalhesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
