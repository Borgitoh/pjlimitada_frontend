/**
 * Modelos para o sistema de afiliados
 * Gerencia a árvore de referências e comissões
 */

export interface AfileadoInfo {
  id: string;                    // UUID do utilizador
  nome: string;
  email: string;
  nomeEmpresa?: string;
  dataAdesao: Date;              // Quando aderiu ao programa
  dataCadastro: Date;            // Quando foi registado na plataforma
}

export interface UtilizadorAfiliadoEstrutura {
  id: string;
  nome: string;
  email: string;
  nomeEmpresa?: string;
  funcao: 'administrador' | 'contador' | 'vendas' | 'visualizador';
  ativo: boolean;
  
  // Informações de afiliação
  idReferenciador?: string;      // Quem o convidou
  nomeReferenciador?: string;
  dataAdesaoPrograma?: Date;
  
  // Estatísticas do afiliado
  totalAfiliadosDirectos: number;
  totalAfiliadosIndirectos: number;
  comissaoTotal: number;
  comissaoPaga: number;
  comissaoPendente: number;
  
  // Ligação de afiliação
  codigoReferencia: string;      // Código único para compartilhar
  linkConvite: string;           // URL completa com código
  
  // Auditoria
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface AfileadoDireto {
  id: string;
  nome: string;
  email: string;
  dataReferencia: Date;          // Quando foi referenciado
  estadoAtivo: boolean;
  vendidoTotal: number;          // Valor total vendido
  comissaoGerada: number;        // Comissão do utilizador (referenciador)
  comissaoTaxaPercentual: number; // Ex: 5%, 10%, etc
}

export interface NodesArvoreAfiliados {
  id: string;
  nome: string;
  nivel: number;                 // 0 = root, 1 = filhos, 2 = netos, etc
  idPai?: string;
  afiliadosFilhos: string[];     // IDs dos afiliados directos
  totalDescendentes: number;
  totalVendas: number;
  comissaoGerada: number;
}

export interface ComissaoAfiliado {
  id: string;
  idAfiliado: string;
  idVenda?: string;              // Se relacionado a uma venda
  tipoComissao: 'venda' | 'ativacao' | 'bonus';
  valor: number;
  percentual: number;
  dataGeracao: Date;
  dataPagamento?: Date;
  estado: 'pendente' | 'paga' | 'cancelada';
  descricao: string;
}

export interface ConfiguracaoPrograma {
  comissaoTaxaDirecta: number;   // % para vendas directas (ex: 5%)
  comissaoTaxaIndirecta: number; // % para vendas indirectas (ex: 2%)
  bonusAtivacao: number;         // Valor fixo por novo afiliado
  maxNiveisDeSeparacao: number;  // Profundidade da comissão
  minimoPagamento: number;       // Valor mínimo para solicitar pagamento
  ativo: boolean;
}

export interface RelatorioAfiliados {
  idUtilizador: string;
  nomeUtilizador: string;
  periodoRelatorio: {
    dataInicio: Date;
    dataFim: Date;
  };
  estatisticas: {
    afiliadosDirectos: number;
    afiliadosIndirectos: number;
    vendidoDirecto: number;
    vendidoIndirecto: number;
    totalComissoes: number;
    comissoesRecebidas: number;
    comissoesPendentes: number;
  };
  afiliadosListados: AfileadoDireto[];
  historicoComissoes: ComissaoAfiliado[];
}
