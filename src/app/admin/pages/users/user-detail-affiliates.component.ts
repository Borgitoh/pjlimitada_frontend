import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AffiliateService } from '../../../affiliates/services/affiliate.service';
import {
  UtilizadorAfiliadoEstrutura,
  AfileadoDireto,
  ComissaoAfiliado
} from '../../../affiliates/models/affiliate.models';

@Component({
  selector: 'app-user-detail-affiliates',
  templateUrl: './user-detail-affiliates.component.html',
  styleUrls: ['./user-detail-affiliates.component.scss']
})
export class UserDetailAffiliatesComponent implements OnInit, OnDestroy {
  @Input() idUtilizador: string = '';

  dadosUtilizador: UtilizadorAfiliadoEstrutura | null = null;
  afiliadosDiretos: AfileadoDireto[] = [];
  comissoes: ComissaoAfiliado[] = [];

  // Edição de comissão
  editandoComissao = false;
  novaComissaoDireta = 5;
  novaComissaoIndirecta = 2;
  bonusAtivacao = 500;

  carregando = true;
  erroMensagem = '';

  private destroy$ = new Subject<void>();

  constructor(private affiliateService: AffiliateService) {}

  ngOnInit(): void {
    if (this.idUtilizador) {
      this.carregarDados();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDados(): void {
    this.carregando = true;

    // Carregar dados do utilizador
    this.affiliateService.obterMeusDadosAfiliacao(this.idUtilizador)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dados) => {
          this.dadosUtilizador = dados;
          if (dados) {
            // Inicializar valores de edição com valores atuais
            // Estes seriam obtidos de uma tabela de configuração por utilizador
          }
        },
        error: (err) => {
          this.erroMensagem = 'Erro ao carregar dados do utilizador';
          console.error(err);
        }
      });

    // Carregar afiliados directos
    this.affiliateService.obterAfiliadosDirectos(this.idUtilizador)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (afiliados) => {
          this.afiliadosDiretos = afiliados;
        },
        error: (err) => console.error(err)
      });

    // Carregar comissões
    this.affiliateService.obterComissoes(this.idUtilizador)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comissoes) => {
          this.comissoes = comissoes;
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.carregando = false;
        }
      });
  }

  toggleEditarComissao(): void {
    this.editandoComissao = !this.editandoComissao;
  }

  salvarConfiguracao(): void {
    if (!this.dadosUtilizador) return;

    // TODO: Chamar endpoint para salvar configuração
    alert(`Comissão actualizada:
      Directa: ${this.novaComissaoDireta}%
      Indirecta: ${this.novaComissaoIndirecta}%
      Bónus: ${this.bonusAtivacao} KZ`);

    this.editandoComissao = false;
  }

  cancelarEdicao(): void {
    this.editandoComissao = false;
    // Reset valores
  }
}
