import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AffiliateService } from '../../../affiliates/services/affiliate.service';
import { UtilizadorAfiliadoEstrutura, NodesArvoreAfiliados } from '../../../affiliates/models/affiliate.models';

@Component({
  selector: 'app-admin-affiliates',
  templateUrl: './admin-affiliates.component.html',
  styleUrls: ['./admin-affiliates.component.scss']
})
export class AdminAffiliatesComponent implements OnInit, OnDestroy {

  todosUtilizadores: UtilizadorAfiliadoEstrutura[] = [];
  arvoresCompletas: NodesArvoreAfiliados[] = [];
  relatorioComissoes: any = null;
  
  filtroFuncao: string = '';
  filtroAtivo: string = '';
  dataInicio: string = '';
  dataFim: string = '';

  carregando = true;
  erroMensagem = '';

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

    // Carregar todos os utilizadores com afiliação
    this.affiliateService.obterTodosUtilizadoresComAfiliacao()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuarios) => {
          this.todosUtilizadores = usuarios;
        },
        error: (err) => {
          this.erroMensagem = 'Erro ao carregar utilizadores';
          console.error(err);
        }
      });

    // Carregar árvore completa
    this.affiliateService.obterArvoreAfiliadosCompleta()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (arvores) => {
          this.arvoresCompletas = arvores;
        },
        error: (err) => console.error(err)
      });

    // Carregar relatório de comissões
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    
    this.affiliateService.obterRelatorioComissoesGeral(mesPassado, hoje)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (relatorio) => {
          this.relatorioComissoes = relatorio;
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.carregando = false;
        }
      });
  }

  filtrarUtilizadores(): UtilizadorAfiliadoEstrutura[] {
    let filtrados = [...this.todosUtilizadores];

    if (this.filtroFuncao) {
      filtrados = filtrados.filter(u => u.funcao === this.filtroFuncao);
    }

    if (this.filtroAtivo !== '') {
      const ativo = this.filtroAtivo === 'true';
      filtrados = filtrados.filter(u => u.ativo === ativo);
    }

    return filtrados.sort((a, b) => {
      // Ordenar por número de afiliados (descendente)
      return (b.totalAfiliadosDirectos + b.totalAfiliadosIndirectos) - 
             (a.totalAfiliadosDirectos + a.totalAfiliadosIndirectos);
    });
  }

  obterNomeReferenciador(idReferenciador: string | undefined): string {
    if (!idReferenciador) return 'Root';
    const user = this.todosUtilizadores.find(u => u.id === idReferenciador);
    return user?.nome || 'Desconhecido';
  }

  abrirDetalhesUtilizador(usuario: UtilizadorAfiliadoEstrutura): void {
    alert(`Detalhes de ${usuario.nome} - Implementar página de detalhes completos`);
  }

  exportarRelatorio(): void {
    if (!this.relatorioComissoes) return;

    const csv = this.gerarCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-afiliados-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private gerarCSV(): string {
    if (!this.relatorioComissoes) return '';

    let csv = 'ID,Nome,Email,Afiliados Directos,Comissão Total,Comissão Paga,Comissão Pendente\n';
    
    this.relatorioComissoes.detalhes.forEach((detail: any) => {
      csv += `${detail.idUtilizador},"${detail.nomeUtilizador}",${detail.emailUtilizador},${detail.afiliadosDirectos},${detail.comissaoTotal},${detail.comissaoPaga},${detail.comissaoPendente}\n`;
    });

    return csv;
  }
}
