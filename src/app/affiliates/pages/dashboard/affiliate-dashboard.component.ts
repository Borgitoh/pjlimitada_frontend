import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AffiliateService } from '../../services/affiliate.service';
import {
  UtilizadorAfiliadoEstrutura,
  AfileadoDireto,
  NodesArvoreAfiliados,
  ComissaoAfiliado
} from '../../models/affiliate.models';

@Component({
  selector: 'app-affiliate-dashboard',
  templateUrl: './affiliate-dashboard.component.html',
  styleUrls: ['./affiliate-dashboard.component.scss']
})
export class AffiliateDashboardComponent implements OnInit, OnDestroy {
  
  meusDados: UtilizadorAfiliadoEstrutura | null = null;
  afiliadosDiretos: AfileadoDireto[] = [];
  minhaArvore: NodesArvoreAfiliados | null = null;
  minhasComissoes: ComissaoAfiliado[] = [];
  comissoesPendentes: ComissaoAfiliado[] = [];

  linkConviteCopiado = false;
  carregando = true;
  erroMensagem = '';

  private idUtilizadorLogado = 'afiliado-001'; // Será obtido do auth
  private destroy$ = new Subject<void>();

  constructor(private affiliateService: AffiliateService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDados(): void {
    this.carregando = true;

    // Carregar meus dados
    this.affiliateService.obterMeusDadosAfiliacao(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dados) => {
          this.meusDados = dados;
        },
        error: (err) => {
          this.erroMensagem = 'Erro ao carregar dados de afiliação';
          console.error(err);
        }
      });

    // Carregar afiliados directos
    this.affiliateService.obterAfiliadosDirectos(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (afiliados) => {
          this.afiliadosDiretos = afiliados;
        },
        error: (err) => console.error(err)
      });

    // Carregar árvore
    this.affiliateService.obterArvoreAfiliados(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (arvore) => {
          this.minhaArvore = arvore;
        },
        error: (err) => console.error(err)
      });

    // Carregar comissões
    this.affiliateService.obterComissoes(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comissoes) => {
          this.minhasComissoes = comissoes;
        },
        error: (err) => console.error(err)
      });

    // Carregar comissões pendentes
    this.affiliateService.obterComissoesPendentes(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comissoes) => {
          this.comissoesPendentes = comissoes;
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.carregando = false;
        }
      });
  }

  copiarLinkConvite(): void {
    if (!this.meusDados?.linkConvite) return;

    navigator.clipboard.writeText(this.meusDados.linkConvite).then(() => {
      this.linkConviteCopiado = true;
      setTimeout(() => {
        this.linkConviteCopiado = false;
      }, 2000);
    });
  }

  compartilharLinkWhatsApp(): void {
    if (!this.meusDados?.linkConvite) return;
    const mensagem = encodeURIComponent(
      `Junte-se ao programa de afiliados da PJ Limitada! 🚀\n\n${this.meusDados.linkConvite}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
  }

  compartilharLinkEmail(): void {
    if (!this.meusDados?.linkConvite) return;
    const mailto = `mailto:?subject=Programa de Afiliados PJ Limitada&body=Junte-se ao nosso programa: ${this.meusDados.linkConvite}`;
    window.location.href = mailto;
  }

  abrirDetalhesAfiliado(afiliado: AfileadoDireto): void {
    // Implementar modal ou página de detalhes
    alert(`Detalhes de ${afiliado.nome} - implementar detalhes completos`);
  }
}
