import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AffiliateService } from '../../../affiliates/services/affiliate.service';
import { UtilizadorAfiliadoEstrutura, ComissaoAfiliado } from '../../../affiliates/models/affiliate.models';

/**
 * Dashboard simples para utilizador normal ver:
 * - Seu referenciador (afiliado de quem é)
 * - Link para compartilhar
 * - Comissão que ganhou
 */
@Component({
  selector: 'app-my-affiliate',
  templateUrl: './my-affiliate.component.html',
  styleUrls: ['./my-affiliate.component.scss']
})
export class MyAffiliateComponent implements OnInit, OnDestroy {

  meusDados: UtilizadorAfiliadoEstrutura | null = null;
  minhasComissoes: ComissaoAfiliado[] = [];
  linkCopiado = false;
  carregando = true;

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
    // Meus dados
    this.affiliateService.obterMeusDadosAfiliacao(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dados) => {
          this.meusDados = dados;
        },
        error: (err) => console.error(err)
      });

    // Minhas comissões
    this.affiliateService.obterComissoes(this.idUtilizadorLogado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comissoes) => {
          this.minhasComissoes = comissoes;
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.carregando = false;
        }
      });
  }

  copiarLink(): void {
    if (!this.meusDados?.linkConvite) return;

    navigator.clipboard.writeText(this.meusDados.linkConvite).then(() => {
      this.linkCopiado = true;
      setTimeout(() => {
        this.linkCopiado = false;
      }, 2000);
    });
  }

  compartilharWhatsApp(): void {
    if (!this.meusDados?.linkConvite) return;
    const mensagem = encodeURIComponent(
      `Junte-se ao programa de afiliados! 🚀\n${this.meusDados.linkConvite}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
  }
}
