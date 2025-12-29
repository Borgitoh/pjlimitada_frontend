import { Component, OnInit } from '@angular/core';
import { SERVICOS, CATEGORIAS_SERVICOS, Servico } from '../../../data/servicos.mock';
import { ServicesService } from '../../services/service.service';
import { Subject, takeUntil } from 'rxjs';

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
    imagem: 0,
    ativo: true
  };

  isModalOpen = false;
  modalTitle = '';
  editMode = false;

    constructor(private servicoService: ServicesService) {}
    private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadServicos();
  }

  loadServicos() {
     this.loading = true;
    this.servicoService.getServicos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data : any) => {
          this.servicos = data.data;
          this.filterServicos();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar serviços', err);
          this.loading = false;
        }
      });
    // this.servicos = JSON.parse(JSON.stringify(SERVICOS));
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
    this.currentServico = {};
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
      this.currentServico.duracao 
    );
  }

  saveServico() {
  if (!this.isFormValid()) return;

    if (this.editMode && this.currentServico.id) {
      this.servicoService.updateServico(this.currentServico.id, this.currentServico)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadServicos(),
          error: (err) => console.error(err)
        });
    } else {
      this.servicoService.createServico(this.currentServico)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadServicos(),
          error: (err) => console.error(err)
        });
    }

    this.closeModal();
  }

  deleteServico(servico: Servico) {
    if (!confirm(`Deseja excluir o serviço "${servico.nome}"?`)) return;
    this.servicoService.deleteServico(servico.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadServicos(),
        error: (err) => console.error(err)
      });
  }

  toggleServico(servico: Servico) {
    this.servicoService.toggleServico(servico.id, !servico.ativo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadServicos(),
        error: (err) => console.error(err)
      });
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
