import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { ListagemComponent } from './pages/listagem/listagem.component';
import { DetalhesComponent } from './pages/detalhes/detalhes.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PecasComponent } from './pages/pecas/pecas.component';
import { BodykitsComponent } from './pages/bodykits/bodykits.component';
import { CartModalComponent } from './components/cart-modal/cart-modal.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ListagemComponent,
    DetalhesComponent,
    SearchBarComponent,
    LoginComponent,
    RegisterComponent,
    PecasComponent,
    BodykitsComponent,
    CartModalComponent,
    CheckoutComponent,
    OrderSuccessComponent,
    OrderTrackingComponent,
    MyOrdersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SwiperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
