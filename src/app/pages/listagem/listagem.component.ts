import { Component } from '@angular/core';
import { VEICULOS } from '../../data/veiculos.mock';

@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
})
export class ListagemComponent {
  carros = VEICULOS;
  marcas = [
    { nome: 'Toyota', imagem: 'https://link-da-imagem-da-toyota.com' },
    { nome: 'Honda', imagem: 'https://link-da-imagem-da-honda.com' },
    { nome: 'BMW', imagem: 'https://link-da-imagem-da-bmw.com' },
    { nome: 'Ford', imagem: 'https://link-da-imagem-da-ford.com' },
    { nome: 'Chevrolet', imagem: 'https://link-da-imagem-da-chevrolet.com' },
    { nome: 'Mercedes', imagem: 'https://link-da-imagem-da-mercedes.com' },
    // Adicione mais marcas conforme necessário
  ];
  
}
