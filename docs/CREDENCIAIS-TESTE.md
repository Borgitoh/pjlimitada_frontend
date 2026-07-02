# Credenciais de Teste - PJ Limitada

## Visão Geral

O sistema possui contas de teste pré-configuradas em localStorage para fins de demonstração. Estas credenciais funcionam com a API mockada do sistema.

---

## Contas de Teste Disponíveis

### 1. Administrador
- **Nome**: Admin PJ Limitada
- **Email**: `admin@pjlimitada.com`
- **Senha**: `senha123` (qualquer senha válida com 6+ caracteres)
- **Função**: Administrador
- **Permissões**: 
  - Gestão total de usuários
  - Gestão de produtos, marcas
  - Gestão de vendas/faturas
  - Visualização de afiliados (todos os usuários)
  - Configuração de comissões por afiliado
  - Relatórios completos

### 2. Usuário Normal (Afiliado)
- **Nome**: João Silva
- **Email**: `joao@empresa.com`
- **Senha**: `senha123` (qualquer senha válida com 6+ caracteres)
- **Função**: Vendedor/Afiliado
- **Permissões**:
  - Visualizar seus próprios dados de afiliação
  - Ver seu referidor
  - Compartilhar link de convite
  - Visualizar afiliados diretos
  - Ver comissões ganhas (pagas e pendentes)
  - Gerar relatório de afiliações

### 3. Usuário Normal 2 (Afiliado com Afiliados)
- **Nome**: Maria Santos
- **Email**: `maria@empresa.com`
- **Senha**: `senha123` (qualquer senha válida com 6+ caracteres)
- **Função**: Contador/Afiliado
- **Afiliados**: 1 direto
- **Permissões**: Mesmas do usuário 2

### 4. **Usuário Normal 3 (COM 5 AFILIADOS)** ⭐ NOVO
- **Nome**: Carlos Pereira
- **Email**: `carlos@empresa.com`
- **Senha**: `senha123`
- **Função**: Vendedor/Afiliado
- **Afiliados Diretos**: 5
  1. Lucas Gomes (lucas.gomes@empresa.com)
  2. Ana Costa (ana.costa@empresa.com)
  3. Ricardo Santos (ricardo.santos@empresa.com)
  4. Fernanda Lima (fernanda.lima@empresa.com)
  5. Bruno Oliveira (bruno.oliveira@empresa.com)
- **Afiliados Indiretos**: 3 (filhos dos afiliados diretos)
- **Comissão Total**: 8.500 KZ
  - Paga: 5.000 KZ
  - Pendente: 3.500 KZ

---

## Como Fazer Login

1. Navegue até a página de login (`/login`)
2. Digite o email da credencial desejada
3. Digite uma senha com 6+ caracteres (qualquer senha funciona no modo demo)
4. Clique em "Entrar"

### Exemplo:
```
Email: admin@pjlimitada.com
Senha: senha123
```

---

## Onde o Sistema de Afiliados Está Implementado

### Para Administradores:
1. Navegue para **Admin → Utilizadores** (Menu lateral esquerdo)
2. Veja a lista de todos os usuários
3. Clique no botão **"Afiliados"** (ícone de pessoas) para cada usuário
4. No painel lateral direito, você verá:
   - Dados de afiliação do usuário
   - Afiliados diretos vinculados
   - Histórico de comissões
   - **Opção para configurar comissões**:
     - Taxa de comissão direta (%)
     - Taxa de comissão indireta (%)
     - Bónus de ativação (KZ)

**Localização no código**: 
- Componente: `src/app/admin/pages/users/user-detail-affiliates.component.ts`
- Template: `src/app/admin/pages/users/user-detail-affiliates.component.html`
- Integração: `src/app/admin/pages/users/users.component.ts` (ação "Afiliados" na tabela)

### Para Usuários Normais:
1. Após fazer login como usuário normal, navegue para **Meu Afiliado** (se disponível no menu de usuário)
2. Ou acesse diretamente a rota `/my-affiliate`
3. Você verá:
   - Seu referidor (quem o indicou)
   - Link de convite para compartilhar
   - Total de comissões ganhas
   - Comissões pagas vs pendentes
   - Lista de afiliados diretos
   - Histórico de comissões

**Localização no código**:
- Componente: `src/app/user/pages/my-affiliate/my-affiliate.component.ts`
- Template: `src/app/user/pages/my-affiliate/my-affiliate.component.html`
- Rota: `/my-affiliate`

---

## Dados Demo de Afiliados

O sistema possui uma estrutura hierárquica pré-configurada:

```
Admin PJ Limitada (root-001)
├── João Silva (afiliado-001)
│   ├── Afiliado Indireto 1
│   └── Afiliado Indireto 2
├── Maria Santos (afiliado-002)
│   └── Afiliado Indireto 3
└── [Outros...]
```

Comissões demo:
- **Admin**: 15.000 KZ total (10.000 paga, 5.000 pendente)
- **João**: 5.000 KZ total (3.000 paga, 2.000 pendente)
- **Maria**: 3.000 KZ total (2.000 paga, 1.000 pendente)

---

## Testando o Sistema de Afiliados

### Teste 1: Admin vendo todos os afiliados
1. Login como `admin@pjlimitada.com`
2. Vá a **Admin → Utilizadores**
3. Clique em "Afiliados" em qualquer usuário
4. Veja os afiliados, comissões e opção de configuração

### Teste 2: Usuário vendo seus próprios afiliados
1. Login como `joao@empresa.com`
2. Vá a **Meu Afiliado** (se disponível)
3. Veja seu referidor (Admin PJ Limitada)
4. Veja seus afiliados diretos
5. Copie e compartilhe seu link de convite

### Teste 3: Teste de Compras
1. Faça login como qualquer usuário
2. Vá a **Admin → Vendas**
3. Crie uma nova venda
4. Selecione o cliente/vendedor
5. Adicione produtos
6. A venda será registrada no sistema

---

## Estrutura de Dados

### Armazenamento
Todos os dados são armazenados em **localStorage** durante o desenvolvimento:

- `affiliate_users` - Lista de usuários e estrutura de afiliação
- `affiliate_commissions` - Histórico de comissões
- `affiliate_config` - Configuração do programa (taxa de comissão, bónus)
- `admin_sales` - Vendas criadas manualmente no admin
- `user` - Dados do usuário logado

### Tabelas Esperadas no Backend (Futuro)
```sql
-- Usuários e Afiliação
utilizadores
├── id
├── nome
├── email
├── funcao (admin, vendedor, contador, etc)
├── id_referenciador (FK para utilizadores)
├── ativo
└── ...

-- Comissões
comissoes_afiliados
├── id
├── id_afiliado (FK para utilizadores)
├── id_venda (FK para vendas)
├── tipo_comissao (venda, ativacao)
├── valor
├── percentual
├── estado (pendente, paga)
└── ...

-- Configuração por Afiliado
configuracao_afiliados
├── id
├── id_afiliado (FK para utilizadores)
├── taxa_comissao_direta
├── taxa_comissao_indireta
├── bonus_ativacao
└── ...
```

---

## Próximos Passos

1. ✅ Sistema de afiliados frontend implementado
2. ⏳ Conectar a API backend para persistência real
3. ⏳ Implementar pagamento de comissões
4. ⏳ Adicionar notificações de novas afiliações
5. ⏳ Relatórios avançados de afiliados

---

## Suporte

Para mais informações sobre a implementação, consulte:
- `docs/SISTEMA-AFILIADOS-V2.md` - Documentação técnica do sistema
- `docs/arquitetura-backend-pt.md` - Arquitetura do backend
