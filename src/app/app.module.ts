import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ListagemComponent } from './pages/listagem/listagem.component';
import { DetalhesComponent } from './pages/detalhes/detalhes.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule } from '@angular/forms';
import { PecasComponent } from './pages/pecas/pecas.component';
import { BodykitsComponent } from './pages/bodykits/bodykits.component';
import { SwiperModule } from 'swiper/angular';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    ListagemComponent,
    DetalhesComponent,
    SearchBarComponent,
    LoginComponent,
    RegisterComponent,
    PecasComponent,
    BodykitsComponent,
    FooterComponent
  ],
  imports: [
  BrowserModule,
    AppRoutingModule,
    FormsModule,
    SwiperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
