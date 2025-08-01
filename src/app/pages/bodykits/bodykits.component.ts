import { Component, OnInit } from '@angular/core';
import { BODYKITS, CATEGORIAS_BODYKITS, MARCAS_BODYKITS } from '../../data/bodykits.mock';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-bodykits',
  templateUrl: './bodykits.component.html',
  styleUrls: ['./bodykits.component.scss']
})
export class BodykitsComponent implements OnInit {
  todosBodykits = BODYKITS;
  bodykitsFiltrados = BODYKITS;
  categorias = CATEGORIAS_BODYKITS;
  marcas = MARCAS_BODYKITS;
  materiais: string[] = [];
  loading = false;

  filtros = {
    busca: '',
    categoria: '',
    marca: '',
    material: '',
    precoMax: null as number | null
  };

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.extrairMateriais();
    this.aplicarFiltros();
  }

  extrairMateriais() {
    const materiaisUnicos = [...new Set(this.todosBodykits.map(bodykit => bodykit.material))];
    this.materiais = materiaisUnicos.sort();
  }

  aplicarFiltros() {
    this.loading = true;

    // Simular delay de loading
    setTimeout(() => {
      this.bodykitsFiltrados = this.todosBodykits.filter(bodykit => {
        // Filtro de busca
        if (this.filtros.busca) {
          const busca = this.filtros.busca.toLowerCase();
          const matchNome = bodykit.nome.toLowerCase().includes(busca);
          const matchDescricao = bodykit.descricao.toLowerCase().includes(busca);
          const matchMarca = bodykit.marca.toLowerCase().includes(busca);
          const matchModelo = bodykit.modelo.toLowerCase().includes(busca);
          const matchCategoria = bodykit.categoria.toLowerCase().includes(busca);

          if (!matchNome && !matchDescricao && !matchMarca && !matchModelo && !matchCategoria) {
            return false;
          }
        }

        // Filtro de categoria
        if (this.filtros.categoria && bodykit.categoria !== this.filtros.categoria) {
          return false;
        }

        // Filtro de marca
        if (this.filtros.marca && bodykit.marca !== this.filtros.marca) {
          return false;
        }

        // Filtro de material
        if (this.filtros.material && bodykit.material !== this.filtros.material) {
          return false;
        }

        // Filtro de preço máximo
        if (this.filtros.precoMax !== null && bodykit.preco > this.filtros.precoMax) {
          return false;
        }

        return true;
      });

      this.loading = false;
    }, 300);
  }

  limparFiltros() {
    this.filtros = {
      busca: '',
      categoria: '',
      marca: '',
      material: '',
      precoMax: null
    };
    this.aplicarFiltros();
  }

  filtrarPorMarca(marca: string) {
    this.filtros.marca = marca;
    this.aplicarFiltros();
  }

  contarPorMarca(marca: string): number {
    return this.todosBodykits.filter(bodykit => bodykit.marca === marca).length;
  }

  addToCart(bodykit: any) {
    if (bodykit.estoque > 0) {
      this.cartService.addToCart(bodykit, 'bodykit', 1);
      console.log(`${bodykit.nome} adicionado ao carrinho!`);
    }
  }
}
