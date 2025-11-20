export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  categoria: string;
  imagem: string;
  estoque: number;
  ativo: boolean;
}

export const SERVICOS: Servico[] = [
  {
    id: 1,
    nome: 'Instalação de Bodykits',
    descricao: 'Instalação profissional de bodykits e aeródinámica com acabamento de qualidade',
    preco: 2500,
    duracao: '2-3 dias',
    categoria: 'Instalação',
    imagem: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=300&fit=crop&q=80',
    estoque: 10,
    ativo: true
  },
  {
    id: 2,
    nome: 'Manutenção Preventiva',
    descricao: 'Inspeção completa, troca de óleo, filtros e fluidos com diagnóstico detalhado',
    preco: 450,
    duracao: '2-3 horas',
    categoria: 'Manutenção',
    imagem: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=500&h=300&fit=crop&q=80',
    estoque: 20,
    ativo: true
  },
  {
    id: 3,
    nome: 'Consultoria Automotiva',
    descricao: 'Assessoria técnica especializada para projetos de modificação e performance',
    preco: 300,
    duracao: '1-2 horas',
    categoria: 'Consultoria',
    imagem: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop&q=80',
    estoque: 15,
    ativo: true
  },
  {
    id: 4,
    nome: 'Pintura Personalizada',
    descricao: 'Serviço de pintura customizada com designs exclusivos e acabamento premium',
    preco: 3500,
    duracao: '5-7 dias',
    categoria: 'Pintura',
    imagem: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&h=300&fit=crop&q=80',
    estoque: 8,
    ativo: true
  },
  {
    id: 5,
    nome: 'Preparação para Track Day',
    descricao: 'Preparação completa do veículo com checklist de segurança e tuning para pista',
    preco: 1800,
    duracao: '1 dia',
    categoria: 'Performance',
    imagem: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop&q=80',
    estoque: 12,
    ativo: true
  }
];

export const CATEGORIAS_SERVICOS = [
  'Instalação',
  'Manutenção',
  'Consultoria',
  'Pintura',
  'Performance'
];
