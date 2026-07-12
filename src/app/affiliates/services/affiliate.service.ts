import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  AfileadoDireto,
  AfileadoInfo,
  UtilizadorAfiliadoEstrutura,
  NodesArvoreAfiliados,
  ComissaoAfiliado,
  ConfiguracaoPrograma,
  RelatorioAfiliados
} from '../models/affiliate.models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço de Gestão de Afiliados
 * Responsável por gerenciar a estrutura de referências,
 * comissões e relatórios de afiliação
 */
@Injectable({
  providedIn: 'root'
})
export class AffiliateService {

  private readonly STORAGE_KEY_USERS = 'affiliate_users';
  private readonly STORAGE_KEY_COMMISSIONS = 'affiliate_commissions';
  private readonly STORAGE_KEY_CONFIG = 'affiliate_config';

  private usuariosAfiliadosSubject = new BehaviorSubject<UtilizadorAfiliadoEstrutura[]>([]);
  private comissoesSubject = new BehaviorSubject<ComissaoAfiliado[]>([]);
  private configSubject = new BehaviorSubject<ConfiguracaoPrograma | null>(null);

  constructor() {
    this.inicializarDadosDemo();
  }

  /**
   * Obtém os dados de afiliação do utilizador logado
   */
  obterMeusDadosAfiliacao(idUtilizador: string): Observable<UtilizadorAfiliadoEstrutura | null> {
    return this.usuariosAfiliadosSubject.pipe(
      map(usuarios => usuarios.find(u => u.id === idUtilizador) || null),
      delay(200)
    );
  }

  /**
   * Obtém a lista de afiliados directos de um utilizador
   */
  obterAfiliadosDirectos(idUtilizador: string): Observable<AfileadoDireto[]> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      const afiliadosDiretos = usuarios
        .filter(u => u.idReferenciador === idUtilizador)
        .map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          dataReferencia: u.dataAdesaoPrograma || new Date(),
          estadoAtivo: u.ativo,
          vendidoTotal: u.totalAfiliadosDirectos * 1000, // Simular dados
          comissaoGerada: u.comissaoTotal,
          comissaoTaxaPercentual: 5
        }));

      observer.next(afiliadosDiretos);
      observer.complete();
    });
  }

  /**
   * Obtém a árvore de afiliados (visualização em hierarquia)
   */
  obterArvoreAfiliados(idUtilizador: string): Observable<NodesArvoreAfiliados> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      const nodeRaiz = this.construirArvore(idUtilizador, usuarios, 0);

      observer.next(nodeRaiz);
      observer.complete();
    });
  }

  /**
   * Obtém o código de referência único para compartilhar
   */
  obterCodigoReferencia(idUtilizador: string): Observable<string> {
    return this.usuariosAfiliadosSubject.pipe(
      map(usuarios => {
        const usuario = usuarios.find(u => u.id === idUtilizador);
        return usuario?.codigoReferencia || '';
      })
    );
  }

  /**
   * Gera link de convite para compartilhar
   */
  gerarLinkConvite(idUtilizador: string, dominio: string = 'https://app.pjlimitada.com'): Observable<string> {
    return this.obterCodigoReferencia(idUtilizador).pipe(
      map(codigo => `${dominio}/cadastro?ref=${codigo}`)
    );
  }

  /**
   * Registra um novo utilizador com referência de afiliado
   */
  registrarComReferencia(
    novoUtilizador: Partial<UtilizadorAfiliadoEstrutura>,
    codigoReferencia: string
  ): Observable<UtilizadorAfiliadoEstrutura> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      const referenciador = usuarios.find(u => u.codigoReferencia === codigoReferencia);

      if (!referenciador) {
        observer.error(new Error('Código de referência inválido'));
        return;
      }

      // Criar novo utilizador
      const usuario: UtilizadorAfiliadoEstrutura = {
        id: uuidv4(),
        nome: novoUtilizador.nome || 'Novo Utilizador',
        email: novoUtilizador.email || `usuario-${Date.now()}@pjlimitada.com`,
        funcao: 'vendas',
        ativo: true,
        idReferenciador: referenciador.id,
        nomeReferenciador: referenciador.nome,
        dataAdesaoPrograma: new Date(),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 0,
        comissaoPaga: 0,
        comissaoPendente: 0,
        codigoReferencia: uuidv4(),
        linkConvite: `https://app.pjlimitada.com/cadastro?ref=${uuidv4()}`,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };

      // Dar bonus ao referenciador
      const config = this.configSubject.value || this.obterConfiguracaoPadrao();
      if (config.bonusAtivacao > 0) {
        this.criarComissao({
          idAfiliado: referenciador.id,
          tipoComissao: 'ativacao',
          valor: config.bonusAtivacao,
          percentual: 0,
          dataGeracao: new Date(),
          estado: 'pendente',
          descricao: `Bónus de ativação - novo afiliado ${usuario.nome}`
        });
      }

      // Adicionar à lista
      usuarios.push(usuario);
      this.usuariosAfiliadosSubject.next(usuarios);
      this.persistirDados();

      observer.next(usuario);
      observer.complete();
    });
  }

  /**
   * Obtém todas as comissões de um utilizador
   */
  obterComissoes(idUtilizador: string): Observable<ComissaoAfiliado[]> {
    return this.comissoesSubject.pipe(
      map(comissoes => comissoes.filter(c => c.idAfiliado === idUtilizador)),
      delay(200)
    );
  }

  /**
   * Obtém comissões pendentes
   */
  obterComissoesPendentes(idUtilizador: string): Observable<ComissaoAfiliado[]> {
    return this.obterComissoes(idUtilizador).pipe(
      map(comissoes => comissoes.filter(c => c.estado === 'pendente'))
    );
  }

  /**
   * Calcula total de comissões por período
   */
  calcularComissoesPeriodo(
    idUtilizador: string,
    dataInicio: Date,
    dataFim: Date
  ): Observable<number> {
    return this.obterComissoes(idUtilizador).pipe(
      map(comissoes =>
        comissoes
          .filter(c => {
            const data = new Date(c.dataGeracao);
            return data >= dataInicio && data <= dataFim;
          })
          .reduce((total, c) => total + c.valor, 0)
      )
    );
  }

  /**
   * Gera relatório de afiliações
   */
  gerarRelatorioAfiliados(
    idUtilizador: string,
    dataInicio: Date,
    dataFim: Date
  ): Observable<RelatorioAfiliados> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      const usuario = usuarios.find(u => u.id === idUtilizador);

      if (!usuario) {
        observer.error(new Error('Utilizador não encontrado'));
        return;
      }

      // Obter afiliados directos
      const afiliadosDirectos = usuarios
        .filter(u => u.idReferenciador === idUtilizador)
        .map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          dataReferencia: u.dataAdesaoPrograma || new Date(),
          estadoAtivo: u.ativo,
          vendidoTotal: Math.random() * 100000,
          comissaoGerada: u.comissaoTotal,
          comissaoTaxaPercentual: 5
        }));

      // Obter comissões
      const comissoes = this.comissoesSubject.value.filter(
        c => c.idAfiliado === idUtilizador &&
          new Date(c.dataGeracao) >= dataInicio &&
          new Date(c.dataGeracao) <= dataFim
      );

      const relatorio: RelatorioAfiliados = {
        idUtilizador: usuario.id,
        nomeUtilizador: usuario.nome,
        periodoRelatorio: { dataInicio, dataFim },
        estatisticas: {
          afiliadosDirectos: usuario.totalAfiliadosDirectos,
          afiliadosIndirectos: usuario.totalAfiliadosIndirectos,
          vendidoDirecto: afiliadosDirectos.reduce((sum, a) => sum + a.vendidoTotal, 0),
          vendidoIndirecto: 0, // Calcular de afiliados de 2º nível
          totalComissoes: usuario.comissaoTotal,
          comissoesRecebidas: usuario.comissaoPaga,
          comissoesPendentes: usuario.comissaoPendente
        },
        afiliadosListados: afiliadosDirectos,
        historicoComissoes: comissoes
      };

      observer.next(relatorio);
      observer.complete();
    });
  }

  /**
   * Apenas para ADMIN: Obter todos os utilizadores com estrutura de afiliação
   */
  obterTodosUtilizadoresComAfiliacao(): Observable<UtilizadorAfiliadoEstrutura[]> {
    return this.usuariosAfiliadosSubject.asObservable();
  }

  /**
   * Apenas para ADMIN: Visualizar estrutura completa de afiliações
   */
  obterArvoreAfiliadosCompleta(): Observable<NodesArvoreAfiliados[]> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      // Encontrar roots (utilizadores sem referenciador)
      const roots = usuarios.filter(u => !u.idReferenciador);
      const arvores = roots.map(root => this.construirArvore(root.id, usuarios, 0));

      observer.next(arvores);
      observer.complete();
    });
  }

  /**
   * Apenas para ADMIN: Obter relatório completo de comissões
   */
  obterRelatorioComissoesGeral(dataInicio: Date, dataFim: Date): Observable<any> {
    return new Observable(observer => {
      const usuarios = this.usuariosAfiliadosSubject.value;
      const comissoes = this.comissoesSubject.value.filter(c => {
        const data = new Date(c.dataGeracao);
        return data >= dataInicio && data <= dataFim;
      });

      const resumo = {
        periodoRelatorio: { dataInicio, dataFim },
        totalUtilizadores: usuarios.length,
        totalComissoes: comissoes.length,
        valorComissoesPendentes: comissoes
          .filter(c => c.estado === 'pendente')
          .reduce((sum, c) => sum + c.valor, 0),
        valorComissoesPagas: comissoes
          .filter(c => c.estado === 'paga')
          .reduce((sum, c) => sum + c.valor, 0),
        detalhes: usuarios.map(u => ({
          idUtilizador: u.id,
          nomeUtilizador: u.nome,
          emailUtilizador: u.email,
          afiliadosDirectos: u.totalAfiliadosDirectos,
          comissaoTotal: u.comissaoTotal,
          comissaoPaga: u.comissaoPaga,
          comissaoPendente: u.comissaoPendente
        }))
      };

      observer.next(resumo);
      observer.complete();
    });
  }

  /**
   * PRIVADA: Construir nó da árvore recursivamente
   */
  private construirArvore(
    idUtilizador: string,
    usuarios: UtilizadorAfiliadoEstrutura[],
    nivel: number
  ): NodesArvoreAfiliados {
    const usuario = usuarios.find(u => u.id === idUtilizador);
    if (!usuario) {
      return {} as NodesArvoreAfiliados;
    }

    const filhos = usuarios.filter(u => u.idReferenciador === idUtilizador);
    const descendentes = this.contagemDescendentes(idUtilizador, usuarios);

    return {
      id: usuario.id,
      nome: usuario.nome,
      nivel,
      idPai: usuario.idReferenciador,
      afiliadosFilhos: filhos.map(f => f.id),
      totalDescendentes: descendentes,
      totalVendas: Math.random() * 1000000,
      comissaoGerada: usuario.comissaoTotal
    };
  }

  /**
   * PRIVADA: Contar descendentes recursivamente
   */
  private contagemDescendentes(idUtilizador: string, usuarios: UtilizadorAfiliadoEstrutura[]): number {
    const filhos = usuarios.filter(u => u.idReferenciador === idUtilizador);
    let total = filhos.length;

    filhos.forEach(filho => {
      total += this.contagemDescendentes(filho.id, usuarios);
    });

    return total;
  }

  /**
   * PRIVADA: Criar comissão
   */
  private criarComissao(comissao: Partial<ComissaoAfiliado>): void {
    const novaComissao: ComissaoAfiliado = {
      id: uuidv4(),
      idAfiliado: comissao.idAfiliado || '',
      idVenda: comissao.idVenda,
      tipoComissao: comissao.tipoComissao || 'venda',
      valor: comissao.valor || 0,
      percentual: comissao.percentual || 0,
      dataGeracao: comissao.dataGeracao || new Date(),
      dataPagamento: comissao.dataPagamento,
      estado: comissao.estado || 'pendente',
      descricao: comissao.descricao || ''
    };

    const comissoes = this.comissoesSubject.value;
    comissoes.push(novaComissao);
    this.comissoesSubject.next(comissoes);
    this.persistirDados();
  }

  /**
   * Configuração padrão do programa
   */
  private obterConfiguracaoPadrao(): ConfiguracaoPrograma {
    return {
      comissaoTaxaDirecta: 5,
      comissaoTaxaIndirecta: 2,
      bonusAtivacao: 500,
      maxNiveisDeSeparacao: 3,
      minimoPagamento: 5000,
      ativo: true
    };
  }

  /**
   * PRIVADA: Inicializar dados de demonstração
   */
  private inicializarDadosDemo(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY_USERS);
    if (stored) {
      try {
        const usuarios = JSON.parse(stored);
        this.usuariosAfiliadosSubject.next(usuarios);
        return;
      } catch (e) {
        console.warn('Erro ao carregar dados de afiliados');
      }
    }

    // Dados demo
    const usuariosDemo: UtilizadorAfiliadoEstrutura[] = [
      {
        id: 'root-001',
        nome: 'Admin PJ Limitada',
        email: 'admin@pjlimitada.com',
        funcao: 'administrador',
        ativo: true,
        totalAfiliadosDirectos: 3,
        totalAfiliadosIndirectos: 5,
        comissaoTotal: 15000,
        comissaoPaga: 10000,
        comissaoPendente: 5000,
        codigoReferencia: 'ADM001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=ADM001',
        criadoEm: new Date('2024-01-01'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-001',
        nome: 'João Silva',
        email: 'joao@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'root-001',
        nomeReferenciador: 'Admin PJ Limitada',
        dataAdesaoPrograma: new Date('2024-02-15'),
        totalAfiliadosDirectos: 2,
        totalAfiliadosIndirectos: 2,
        comissaoTotal: 5000,
        comissaoPaga: 3000,
        comissaoPendente: 2000,
        codigoReferencia: 'JOAO001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=JOAO001',
        criadoEm: new Date('2024-02-15'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-002',
        nome: 'Maria Santos',
        email: 'maria@empresa.com',
        funcao: 'contador',
        ativo: true,
        idReferenciador: 'root-001',
        nomeReferenciador: 'Admin PJ Limitada',
        dataAdesaoPrograma: new Date('2024-03-20'),
        totalAfiliadosDirectos: 1,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 3000,
        comissaoPaga: 2000,
        comissaoPendente: 1000,
        codigoReferencia: 'MARIA001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=MARIA001',
        criadoEm: new Date('2024-03-20'),
        atualizadoEm: new Date()
      },
      // Carlos Pereira com 5 afiliados diretos
      {
        id: 'afiliado-003',
        nome: 'Carlos Pereira',
        email: 'carlos@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'root-001',
        nomeReferenciador: 'Admin PJ Limitada',
        dataAdesaoPrograma: new Date('2024-04-10'),
        totalAfiliadosDirectos: 5,
        totalAfiliadosIndirectos: 3,
        comissaoTotal: 8500,
        comissaoPaga: 5000,
        comissaoPendente: 3500,
        codigoReferencia: 'CARLOS001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=CARLOS001',
        criadoEm: new Date('2024-04-10'),
        atualizadoEm: new Date()
      },
      // 5 Afiliados de Carlos
      {
        id: 'afiliado-carlos-001',
        nome: 'Lucas Gomes',
        email: 'lucas.gomes@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-003',
        nomeReferenciador: 'Carlos Pereira',
        dataAdesaoPrograma: new Date('2024-04-15'),
        totalAfiliadosDirectos: 1,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 1200,
        comissaoPaga: 800,
        comissaoPendente: 400,
        codigoReferencia: 'LUCAS001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=LUCAS001',
        criadoEm: new Date('2024-04-15'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-carlos-002',
        nome: 'Ana Costa',
        email: 'ana.costa@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-003',
        nomeReferenciador: 'Carlos Pereira',
        dataAdesaoPrograma: new Date('2024-04-20'),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 950,
        comissaoPaga: 600,
        comissaoPendente: 350,
        codigoReferencia: 'ANA001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=ANA001',
        criadoEm: new Date('2024-04-20'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-carlos-003',
        nome: 'Ricardo Santos',
        email: 'ricardo.santos@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-003',
        nomeReferenciador: 'Carlos Pereira',
        dataAdesaoPrograma: new Date('2024-05-01'),
        totalAfiliadosDirectos: 1,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 1850,
        comissaoPaga: 1200,
        comissaoPendente: 650,
        codigoReferencia: 'RICARDO001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=RICARDO001',
        criadoEm: new Date('2024-05-01'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-carlos-004',
        nome: 'Fernanda Lima',
        email: 'fernanda.lima@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-003',
        nomeReferenciador: 'Carlos Pereira',
        dataAdesaoPrograma: new Date('2024-05-10'),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 750,
        comissaoPaga: 450,
        comissaoPendente: 300,
        codigoReferencia: 'FERNANDA001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=FERNANDA001',
        criadoEm: new Date('2024-05-10'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-carlos-005',
        nome: 'Bruno Oliveira',
        email: 'bruno.oliveira@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-003',
        nomeReferenciador: 'Carlos Pereira',
        dataAdesaoPrograma: new Date('2024-05-18'),
        totalAfiliadosDirectos: 1,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 2100,
        comissaoPaga: 1350,
        comissaoPendente: 750,
        codigoReferencia: 'BRUNO001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=BRUNO001',
        criadoEm: new Date('2024-05-18'),
        atualizadoEm: new Date()
      },
      // Afiliados de 2º nível (filhos dos afiliados de Carlos)
      {
        id: 'afiliado-lucas-001',
        nome: 'Patricia Medeiros',
        email: 'patricia.medeiros@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-carlos-001',
        nomeReferenciador: 'Lucas Gomes',
        dataAdesaoPrograma: new Date('2024-04-25'),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 500,
        comissaoPaga: 300,
        comissaoPendente: 200,
        codigoReferencia: 'PATRICIA001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=PATRICIA001',
        criadoEm: new Date('2024-04-25'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-ricardo-001',
        nome: 'Felipe Rocha',
        email: 'felipe.rocha@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-carlos-003',
        nomeReferenciador: 'Ricardo Santos',
        dataAdesaoPrograma: new Date('2024-05-05'),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 450,
        comissaoPaga: 270,
        comissaoPendente: 180,
        codigoReferencia: 'FELIPE001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=FELIPE001',
        criadoEm: new Date('2024-05-05'),
        atualizadoEm: new Date()
      },
      {
        id: 'afiliado-bruno-001',
        nome: 'Jéssica Mendes',
        email: 'jessica.mendes@empresa.com',
        funcao: 'vendas',
        ativo: true,
        idReferenciador: 'afiliado-carlos-005',
        nomeReferenciador: 'Bruno Oliveira',
        dataAdesaoPrograma: new Date('2024-05-22'),
        totalAfiliadosDirectos: 0,
        totalAfiliadosIndirectos: 0,
        comissaoTotal: 600,
        comissaoPaga: 400,
        comissaoPendente: 200,
        codigoReferencia: 'JESSICA001',
        linkConvite: 'https://app.pjlimitada.com/cadastro?ref=JESSICA001',
        criadoEm: new Date('2024-05-22'),
        atualizadoEm: new Date()
      }
    ];

    this.usuariosAfiliadosSubject.next(usuariosDemo);
    this.configSubject.next(this.obterConfiguracaoPadrao());
    this.persistirDados();
  }

  /**
   * PRIVADA: Persistir dados em localStorage
   */
  private persistirDados(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(this.usuariosAfiliadosSubject.value));
      localStorage.setItem(this.STORAGE_KEY_COMMISSIONS, JSON.stringify(this.comissoesSubject.value));
      localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(this.configSubject.value));
    } catch (error) {
      console.error('Erro ao persistir dados de afiliados:', error);
    }
  }
}
