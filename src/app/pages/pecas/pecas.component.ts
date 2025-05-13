import { Component } from '@angular/core';
import { VEICULOS } from 'src/app/data/veiculos.mock';
import { SwiperOptions } from 'swiper';
import SwiperCore, { Autoplay, Navigation } from 'swiper';


SwiperCore.use([Autoplay, Navigation]);
@Component({
  selector: 'app-pecas',
  templateUrl: './pecas.component.html',
  styleUrls: ['./pecas.component.scss']
})
export class PecasComponent {
  carros = VEICULOS;
 swiperConfig: SwiperOptions = {
    slidesPerView: 6,
    spaceBetween:5 ,
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    navigation:true,
    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4, spaceBetween:10 },
    },
  };

  pecas = [
    { nome: 'Motor', icone: 'settings' },
    { nome: 'Transmissão', icone: 'repeat' },
    { nome: 'Suspensão', icone: 'activity' },
    { nome: 'Freios', icone: 'pause-circle' },
    { nome: 'Sistema Elétrico', icone: 'zap' },
    { nome: 'Arrefecimento', icone: 'thermometer' },
    { nome: 'Ar e Climatização', icone: 'wind' },
    { nome: 'Direção', icone: 'compass' },
    { nome: 'Acessórios', icone: 'package' },
    { nome: 'Baterias', icone: 'battery' },
    { nome: 'Ferramentas', icone: 'wrench' }
  ];

  filtros = [
    {
      label: 'Modelo',
      opcoes: ['Modelo 1', 'Modelo 2', 'Modelo 3']
    },
    {
      label: 'Tipo de Carro',
      opcoes: ['SUV', 'Sedan', 'Hatch']
    },
    {
      label: 'Combustível',
      opcoes: ['Gasolina', 'Diesel', 'Elétrico']
    },
    {
      label: 'Transmissão',
      opcoes: ['Manual', 'Automático']
    },
    {
      label: 'Preço',
      opcoes: ['Menor que 20K', '20K - 40K', 'Maior que 40K']
    }
  ];

  marcaSelecionada: any = null;

   anoMin: number = 0;
  anoMax: number = 0;

  onAnoMinChange(event: any): void {
    const ano = new Date(event.target.value).getFullYear();  // Extrai apenas o ano
    this.anoMin = ano;
  }

  onAnoMaxChange(event: any): void {
    const ano = new Date(event.target.value).getFullYear();  // Extrai apenas o ano
    this.anoMax = ano;
  }

  selecionarPeca(marca: any) {
    this.marcaSelecionada = marca;
  }


}
