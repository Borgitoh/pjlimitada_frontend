import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VEICULOS } from '../../data/veiculos.mock';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
})
export class DetalhesComponent {
  carro: any;

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    this.carro = VEICULOS.find(c => c.id === Number(id));
  }
}
