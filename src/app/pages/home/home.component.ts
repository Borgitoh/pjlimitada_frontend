import { Component } from '@angular/core';
import { PECAS } from '../../data/pecas.mock';
import { BODYKITS } from '../../data/bodykits.mock';
import { SERVICOS } from '../../data/servicos.mock';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Produtos em destaque - primeiros 4 de cada categoria
  pecasDestaque = PECAS.slice(0, 4);
  bodykitsDestaque = BODYKITS.slice(0, 3);
  servicosDestaque = SERVICOS.slice(0, 5);

  constructor(public cartService: CartService) {}

  addServicoToCart(servico: any) {
    if (servico.estoque > 0) {
      this.cartService.addToCart(servico, 'servico', 1);
      console.log(`${servico.nome} adicionado ao carrinho!`);
    }
  }
}
