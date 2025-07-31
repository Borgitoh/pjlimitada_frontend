import { Component, OnInit } from '@angular/core';
import { PECAS, CATEGORIAS_PECAS } from '../../data/pecas.mock';

@Component({
  selector: 'app-pecas',
  templateUrl: './pecas.component.html',
  styleUrls: ['./pecas.component.scss']
})
export class PecasComponent implements OnInit {
  todasPecas = PECAS;
  pecasFiltradas = PECAS;
  categorias = CATEGORIAS_PECAS;
  marcas: string[] = [];
  loading = false;

  filtros = {
    busca: '',
    categoria: '',
    marca: '',
    precoMin: null as number | null,
    precoMax: null as number | null
  };

  ngOnInit() {
    this.extrairMarcas();
    this.aplicarFiltros();
  }

  extrairMarcas() {
    const marcasUnicas = [...new Set(this.todasPecas.map(peca => peca.marca))];
    this.marcas = marcasUnicas.sort();
  }

  aplicarFiltros() {
    this.loading = true;
    
    // Simular delay de loading
    setTimeout(() => {
      this.pecasFiltradas = this.todasPecas.filter(peca => {
        // Filtro de busca
        if (this.filtros.busca) {
          const busca = this.filtros.busca.toLowerCase();
          const matchNome = peca.nome.toLowerCase().includes(busca);
          const matchDescricao = peca.descricao.toLowerCase().includes(busca);
          const matchMarca = peca.marca.toLowerCase().includes(busca);
          const matchCategoria = peca.categoria.toLowerCase().includes(busca);
          
          if (!matchNome && !matchDescricao && !matchMarca && !matchCategoria) {
            return false;
          }
        }

        // Filtro de categoria
        if (this.filtros.categoria && peca.categoria !== this.filtros.categoria) {
          return false;
        }

        // Filtro de marca
        if (this.filtros.marca && peca.marca !== this.filtros.marca) {
          return false;
        }

        // Filtro de preço mínimo
        if (this.filtros.precoMin !== null && peca.preco < this.filtros.precoMin) {
          return false;
        }

        // Filtro de preço máximo
        if (this.filtros.precoMax !== null && peca.preco > this.filtros.precoMax) {
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
      precoMin: null,
      precoMax: null
    };
    this.aplicarFiltros();
  }

  filtrarPorCategoria(categoria: string) {
    this.filtros.categoria = categoria;
    this.aplicarFiltros();
  }

  contarPorCategoria(categoria: string): number {
    return this.todasPecas.filter(peca => peca.categoria === categoria).length;
  }
}
