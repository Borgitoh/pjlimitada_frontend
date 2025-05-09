import { Component } from '@angular/core';
import { VEICULOS } from 'src/app/data/veiculos.mock';

@Component({
  selector: 'app-bodykits',
  templateUrl: './bodykits.component.html',
  styleUrls: ['./bodykits.component.scss']
})
export class BodykitsComponent {
   carros = VEICULOS;
    marcas = [
      { nome: 'Toyota', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/toyota.png' },
      { nome: 'BMW', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/bmw.png' },
      { nome: 'Mercedes-Benz', imagem: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg' },
      { nome: 'Audi', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/audi.png' },
      { nome: 'Hyundai', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/hyundai.png' },
      { nome: 'Volkswagen', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/volkswagen.png' },
      { nome: 'Kia', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/kia.png' },
      { nome: 'Ford', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/ford.png' },
      { nome: 'Chevrolet', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/chevrolet.png' },
      { nome: 'Nissan', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/nissan.png' },
      { nome: 'Dodge', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/dodge.png' },
      { nome: 'Cadillac', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/cadillac.png' },
      { nome: 'Jeep', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/jeep.png' },
      { nome: 'Jetour', imagem: 'https://1000logos.net/wp-content/uploads/2023/12/Jetour-Logo-768x432.png' },
      { nome: 'Suzuki', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/suzuki.png' },
      { nome: 'Lexus', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/lexus.png' },
      { nome: 'Mazda', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/mazda.png' },
      { nome: 'Mitsubishi', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/mitub.png' },
      { nome: 'Fiat', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/fiat.png' },
      { nome: 'GMC', imagem: 'https://car-logos.org/wp-content/uploads/2022/08/gmc.png' },
    ];
  
    marcaSelecionada: any = null;
  
    selecionarMarca(marca: any) {
      this.marcaSelecionada = marca;
    }
}
