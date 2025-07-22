import { Component } from '@angular/core';
import { PECAS } from '../../data/pecas.mock';
import { BODYKITS } from '../../data/bodykits.mock';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Produtos em destaque - primeiros 4 de cada categoria
  pecasDestaque = PECAS.slice(0, 4);
  bodykitsDestaque = BODYKITS.slice(0, 3);
}
