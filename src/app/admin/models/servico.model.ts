export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  duracao: string;
  estoque?: number;
  ativo: boolean;
  imagem?: string;
}
