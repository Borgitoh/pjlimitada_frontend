import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VEICULOS } from '../../data/veiculos.mock';
import { PECAS } from '../../data/pecas.mock';
import { BODYKITS } from '../../data/bodykits.mock';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class DetalhesComponent implements OnInit {
  produto: any = null;
  tipoProduto: 'veiculo' | 'peca' | 'bodykit' = 'veiculo';
  produtosRelacionados: any[] = [];
  loading = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      this.carregarProduto(id);
    });
  }

  carregarProduto(id: number) {
    this.loading = true;
    
    // Simular delay de carregamento
    setTimeout(() => {
      // Determinar o tipo do produto baseado na URL atual
      const url = this.route.snapshot.url[0]?.path;
      
      if (url === 'veiculos') {
        this.tipoProduto = 'veiculo';
        this.produto = VEICULOS.find(v => v.id === id);
        this.carregarVeiculosRelacionados();
      } else if (url === 'pecas') {
        this.tipoProduto = 'peca';
        this.produto = PECAS.find(p => p.id === id);
        this.carregarPecasRelacionadas();
      } else if (url === 'bodykits') {
        this.tipoProduto = 'bodykit';
        this.produto = BODYKITS.find(b => b.id === id);
        this.carregarBodykitsRelacionados();
      }
      
      this.loading = false;
    }, 500);
  }

  carregarVeiculosRelacionados() {
    if (this.produto) {
      // Buscar veículos da mesma marca ou preço similar
      this.produtosRelacionados = VEICULOS
        .filter(v => v.id !== this.produto.id && 
                    (v.marca === this.produto.marca || 
                     Math.abs(v.preco - this.produto.preco) < 2000))
        .slice(0, 4);
    }
  }

  carregarPecasRelacionadas() {
    if (this.produto) {
      // Buscar peças da mesma categoria ou marca
      this.produtosRelacionados = PECAS
        .filter(p => p.id !== this.produto.id && 
                    (p.categoria === this.produto.categoria || 
                     p.marca === this.produto.marca))
        .slice(0, 4);
    }
  }

  carregarBodykitsRelacionados() {
    if (this.produto) {
      // Buscar bodykits da mesma marca ou categoria
      this.produtosRelacionados = BODYKITS
        .filter(b => b.id !== this.produto.id && 
                    (b.marca === this.produto.marca || 
                     b.categoria === this.produto.categoria))
        .slice(0, 4);
    }
  }

  getNomeProduto(): string {
    if (!this.produto) return '';
    
    switch (this.tipoProduto) {
      case 'veiculo':
        return this.produto.modelo;
      case 'peca':
        return this.produto.nome;
      case 'bodykit':
        return this.produto.nome;
      default:
        return '';
    }
  }

  getDescricao(): string {
    if (!this.produto) return '';
    
    switch (this.tipoProduto) {
      case 'veiculo':
        return `${this.produto.marca} ${this.produto.modelo} ${this.produto.ano} - Câmbio ${this.produto.cambio}`;
      case 'peca':
        return this.produto.descricao;
      case 'bodykit':
        return this.produto.descricao;
      default:
        return '';
    }
  }

  getEstoque(): number {
    if (!this.produto) return 0;
    
    return this.produto.estoque || 1; // Veículos geralmente tem estoque 1
  }

  getProdutoUrl(produto: any): string {
    // Determinar a URL baseada no tipo do produto relacionado
    if (produto.modelo && produto.ano) {
      return `/veiculos/${produto.id}`;
    } else if (produto.categoria && produto.compatibilidade) {
      return `/pecas/${produto.id}`;
    } else {
      return `/bodykits/${produto.id}`;
    }
  }
}
