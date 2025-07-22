export const BODYKITS = [
  {
    id: 1,
    nome: 'Liberty Walk BMW M3',
    marca: 'Liberty Walk',
    modelo: 'BMW M3 E92',
    preco: 3500,
    descricao: 'Kit completo Liberty Walk para BMW M3 - inclui para-choques, spoiler e saias laterais',
    imagem: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=500&h=300&fit=crop',
    categoria: 'Completo',
    material: 'Fibra de Carbono',
    compatibilidade: ['BMW M3 E92', 'BMW M3 E93'],
    estoque: 3,
    itens: ['Para-choque dianteiro', 'Para-choque traseiro', 'Saias laterais', 'Spoiler traseiro', 'Difusor']
  },
  {
    id: 2,
    nome: 'Rocket Bunny Honda Civic',
    marca: 'Rocket Bunny',
    modelo: 'Honda Civic Type R',
    preco: 2800,
    descricao: 'Kit aerodinâmico Rocket Bunny para Honda Civic Type R',
    imagem: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop',
    categoria: 'Completo',
    material: 'FRP (Fibra de Vidro)',
    compatibilidade: ['Honda Civic Type R FK8'],
    estoque: 5,
    itens: ['Para-choque dianteiro', 'Para-choque traseiro', 'Saias laterais', 'Wing traseiro']
  },
  {
    id: 3,
    nome: 'Mugen Spoiler Honda S2000',
    marca: 'Mugen',
    modelo: 'Honda S2000',
    preco: 450,
    descricao: 'Spoiler traseiro original Mugen para Honda S2000',
    imagem: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500&h=300&fit=crop',
    categoria: 'Spoiler',
    material: 'ABS',
    compatibilidade: ['Honda S2000 AP1', 'Honda S2000 AP2'],
    estoque: 12,
    itens: ['Spoiler traseiro', 'Kit de fixação']
  },
  {
    id: 4,
    nome: 'STI Para-choque Subaru WRX',
    marca: 'STI',
    modelo: 'Subaru WRX',
    preco: 1200,
    descricao: 'Para-choque dianteiro STI para Subaru WRX/STI',
    imagem: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=300&fit=crop',
    categoria: 'Para-choque',
    material: 'Plástico OEM',
    compatibilidade: ['Subaru WRX 2015+', 'Subaru STI 2015+'],
    estoque: 8,
    itens: ['Para-choque dianteiro', 'Grelha', 'Faróis de neblina']
  },
  {
    id: 5,
    nome: 'Varis Diffuser Nissan GT-R',
    marca: 'Varis',
    modelo: 'Nissan GT-R R35',
    preco: 1800,
    descricao: 'Difusor traseiro Varis em fibra de carbono para GT-R R35',
    imagem: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop',
    categoria: 'Difusor',
    material: 'Fibra de Carbono',
    compatibilidade: ['Nissan GT-R R35 2009+'],
    estoque: 4,
    itens: ['Difusor traseiro', 'Kit de fixação em aço inox']
  },
  {
    id: 6,
    nome: 'Amuse Saia Lateral S15',
    marca: 'Amuse',
    modelo: 'Nissan Silvia S15',
    preco: 890,
    descricao: 'Saias laterais Amuse para Nissan Silvia S15',
    imagem: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=500&h=300&fit=crop',
    categoria: 'Saias Laterais',
    material: 'FRP (Fibra de Vidro)',
    compatibilidade: ['Nissan Silvia S15'],
    estoque: 6,
    itens: ['Saias laterais (par)', 'Kit de fixação']
  },
  {
    id: 7,
    nome: 'Spoon Sports Honda S2000',
    marca: 'Spoon Sports',
    modelo: 'Honda S2000',
    preco: 2200,
    descricao: 'Kit aerodinâmico completo Spoon Sports para S2000',
    imagem: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
    categoria: 'Completo',
    material: 'Fibra de Carbono',
    compatibilidade: ['Honda S2000 AP1', 'Honda S2000 AP2'],
    estoque: 2,
    itens: ['Para-choque dianteiro', 'Saias laterais', 'Spoiler traseiro', 'Difusor']
  },
  {
    id: 8,
    nome: 'Top Secret Supra MK4',
    marca: 'Top Secret',
    modelo: 'Toyota Supra MK4',
    preco: 4200,
    descricao: 'Kit completo Top Secret para Toyota Supra MK4 - estilo V12',
    imagem: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop',
    categoria: 'Completo',
    material: 'Fibra de Carbono',
    compatibilidade: ['Toyota Supra MK4 A80'],
    estoque: 1,
    itens: ['Para-choque dianteiro', 'Para-choque traseiro', 'Saias laterais', 'Capô', 'Wing traseiro']
  }
];

export const CATEGORIAS_BODYKITS = [
  'Completo',
  'Para-choque',
  'Spoiler',
  'Saias Laterais',
  'Difusor',
  'Capô',
  'Wing'
];

export const MARCAS_BODYKITS = [
  'Liberty Walk',
  'Rocket Bunny',
  'Mugen',
  'STI', 
  'Varis',
  'Amuse',
  'Spoon Sports',
  'Top Secret'
];
