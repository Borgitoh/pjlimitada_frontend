import { Component, OnInit } from '@angular/core';
import { SERVICOS, CATEGORIAS_SERVICOS, Servico } from '../../../data/servicos.mock';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];
  categorias = CATEGORIAS_SERVICOS;
  selectedCategory: string = '';
  loading = false;

  currentServico: any = {
    nome: '',
    descricao: '',
    categoria: '',
    preco: 0,
    duracao: '',
    estoque: 0,
    ativo: true
  };

  isModalOpen = false;
  modalTitle = '';
  editMode = false;

  ngOnInit() {
    this.loadServicos();
  }

  loadServicos() {
    this.servicos = JSON.parse(JSON.stringify(SERVICOS));
    this.filterServicos();
  }

  filterServicos() {
    let filtered = [...this.servicos];

    if (this.selectedCategory) {
      filtered = filtered.filter(servico => 
        servico.categoria === this.selectedCategory
      );
    }

    this.servicosFiltrados = filtered;
  }

  openServicoModal() {
    this.editMode = false;
    this.modalTitle = 'Novo Serviço';
    this.currentServico = {
      nome: '',
      descricao: '',
      categoria: '',
      preco: 0,
      duracao: '',
      estoque: 0,
      ativo: true
    };
    this.isModalOpen = true;
  }

  editServico(servico: Servico) {
    this.editMode = true;
    this.modalTitle = 'Editar Serviço';
    this.currentServico = { ...servico };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return !!(
      this.currentServico.nome &&
      this.currentServico.descricao &&
      this.currentServico.categoria &&
      this.currentServico.preco > 0 &&
      this.currentServico.duracao &&
      this.currentServico.estoque >= 0
    );
  }

  saveServico() {
    if (!this.isFormValid()) return;

    if (this.editMode) {
      const servicoIndex = this.servicos.findIndex(s => s.id === this.currentServico.id);
      if (servicoIndex !== -1) {
        this.servicos[servicoIndex] = {
          ...this.currentServico
        };
      }
    } else {
      const newServico: Servico = {
        id: Math.max(...this.servicos.map(s => s.id), 0) + 1,
        nome: this.currentServico.nome,
        descricao: this.currentServico.descricao,
        preco: this.currentServico.preco,
        duracao: this.currentServico.duracao,
        categoria: this.currentServico.categoria,
        imagem: this.currentServico.imagem || 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=500&h=300&fit=crop&q=80',
        estoque: this.currentServico.estoque,
        ativo: this.currentServico.ativo
      };
      this.servicos.push(newServico);
    }

    this.filterServicos();
    this.closeModal();
  }

  deleteServico(servico: Servico) {
    if (confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?`)) {
      this.servicos = this.servicos.filter(s => s.id !== servico.id);
      this.filterServicos();
    }
  }

  toggleServico(servico: Servico) {
    const servicoIndex = this.servicos.findIndex(s => s.id === servico.id);
    if (servicoIndex !== -1) {
      this.servicos[servicoIndex].ativo = !this.servicos[servicoIndex].ativo;
    }
  }

  updateStock(servico: Servico) {
    const newStock = prompt(
      `Atualizar estoque de "${servico.nome}".\nEstoque atual: ${servico.estoque}`,
      servico.estoque.toString()
    );
    if (newStock !== null) {
      const stock = parseInt(newStock, 10);
      if (!isNaN(stock) && stock >= 0) {
        const servicoIndex = this.servicos.findIndex(s => s.id === servico.id);
        if (servicoIndex !== -1) {
          this.servicos[servicoIndex].estoque = stock;
          this.filterServicos();
        }
      }
    }
  }

  private resetForm() {
    this.currentServico = {
      nome: '',
      descricao: '',
      categoria: '',
      preco: 0,
      duracao: '',
      estoque: 0,
      ativo: true
    };
  }

  getTotalServicos(): number {
    return this.servicos.filter(s => s.ativo).length;
  }

  getTotalValor(): number {
    return this.servicos.reduce((total, s) => total + (s.preco * s.estoque), 0);
  }

  getLowStockCount(): number {
    return this.servicos.filter(s => s.estoque < 5 && s.estoque > 0).length;
  }
}
