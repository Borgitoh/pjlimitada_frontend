import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SERVICOS } from '../../data/servicos.mock';
import { CartService } from '../../services/cart.service';

interface ServicoSolicitacao {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Component({
  selector: 'app-solicitar-servicos',
  templateUrl: './solicitar-servicos.component.html',
  styleUrls: ['./solicitar-servicos.component.scss']
})
export class SolicitarServicosComponent implements OnInit {
  servicos = SERVICOS;
  solicitacaoForm!: FormGroup;
  servicosSelecionados: ServicoSolicitacao[] = [];
  totalOrcamento = 0;
  formularioSubmetido = false;
  mensagemSucesso = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.solicitacaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      veiculo: ['', [Validators.required, Validators.minLength(3)]],
      descricaoAdicional: [''],
      dataPreferida: ['', Validators.required],
      servicosIds: [[], Validators.required]
    });
  }

  toggleServico(servico: any) {
    const control = this.solicitacaoForm.get('servicosIds');
    const valores = control?.value || [];
    
    const index = valores.indexOf(servico.id);
    if (index > -1) {
      valores.splice(index, 1);
      this.servicosSelecionados = this.servicosSelecionados.filter(s => s.id !== servico.id);
    } else {
      valores.push(servico.id);
      this.servicosSelecionados.push({
        id: servico.id,
        nome: servico.nome,
        preco: servico.preco,
        quantidade: 1
      });
    }
    
    control?.setValue(valores);
    this.calcularTotal();
  }

  isServicoSelecionado(servicoId: number): boolean {
    const control = this.solicitacaoForm.get('servicosIds');
    return control?.value?.includes(servicoId) || false;
  }

  calcularTotal() {
    this.totalOrcamento = this.servicosSelecionados.reduce((total, servico) => 
      total + (servico.preco * servico.quantidade), 0
    );
  }

  updateQuantidade(servicoId: number, novaQuantidade: number) {
    if (novaQuantidade <= 0) return;
    
    const servico = this.servicosSelecionados.find(s => s.id === servicoId);
    if (servico) {
      servico.quantidade = novaQuantidade;
      this.calcularTotal();
    }
  }

  removerServico(servicoId: number) {
    this.servicosSelecionados = this.servicosSelecionados.filter(s => s.id !== servicoId);
    const control = this.solicitacaoForm.get('servicosIds');
    const valores = (control?.value || []).filter((id: number) => id !== servicoId);
    control?.setValue(valores);
    this.calcularTotal();
  }

  enviarSolicitacao() {
    if (this.solicitacaoForm.invalid || this.servicosSelecionados.length === 0) {
      this.formularioSubmetido = true;
      return;
    }

    const dadosSolicitacao = {
      cliente: this.solicitacaoForm.value.nome,
      email: this.solicitacaoForm.value.email,
      telefone: this.solicitacaoForm.value.telefone,
      veiculo: this.solicitacaoForm.value.veiculo,
      descricao: this.solicitacaoForm.value.descricaoAdicional,
      dataPreferida: this.solicitacaoForm.value.dataPreferida,
      servicos: this.servicosSelecionados,
      totalOrcamento: this.totalOrcamento,
      dataSolicitacao: new Date()
    };

    // Adicionar serviços ao carrinho
    this.servicosSelecionados.forEach(servico => {
      const servicoOriginal = SERVICOS.find(s => s.id === servico.id);
      if (servicoOriginal) {
        this.cartService.addToCart(servicoOriginal, 'servico', servico.quantidade);
      }
    });

    console.log('Solicitação enviada:', dadosSolicitacao);
    
    this.mensagemSucesso = true;
    this.formularioSubmetido = false;
    this.servicosSelecionados = [];
    this.solicitacaoForm.reset();

    setTimeout(() => {
      this.mensagemSucesso = false;
    }, 5000);
  }

  getServicoNome(servicoId: number): string {
    return SERVICOS.find(s => s.id === servicoId)?.nome || '';
  }
}
