# Sistema de Afiliados - PJ Limitada

## Visão Geral

Sistema completo de gerenciamento de afiliados que permite que utilizadores vejam sua árvore de referências, compartilhem links de convite e acompanhem comissões ganhas. Administradores podem visualizar a estrutura completa de afiliações da empresa.

---

## 1. Funcionalidades Implementadas

### 1.1 Para Utilizadores Comuns

**Dashboard de Afiliados** (`/affiliates/dashboard`)

- **Visualizar Meus Dados**
  - Total de afiliados directos
  - Total de afiliados indirectos (rede completa)
  - Comissão total acumulada
  - Comissão pendente de pagamento

- **Meu Link de Convite**
  - Código único de referência (`codigoReferencia`)
  - Link para compartilhar
  - Botões de cópia rápida
  - Compartilhamento via WhatsApp e Email

- **Lista de Afiliados Directos**
  - Nome e email do afiliado
  - Data de referência
  - Total de vendas atribuídas
  - Comissão gerada
  - Estado (Ativo/Inativo)
  - Botão "Ver Detalhes" (para implementação futura)

- **Histórico de Comissões**
  - Comissões pendentes de pagamento
  - Tipo de comissão (Venda, Ativação, Bónus)
  - Data de geração
  - Valor da comissão

### 1.2 Para Administradores

**Gestão de Afiliados** (`/admin/affiliates`)

- **Resumo Geral**
  - Total de utilizadores no sistema
  - Total de comissões registadas
  - Valor total de comissões pendentes
  - Valor total de comissões já pagas

- **Filtros Avançados**
  - Filtrar por função (Administrador, Contador, Vendas, Visualizador)
  - Filtrar por estado (Ativo/Inativo)
  - Limpar filtros rapidamente

- **Tabela Completa de Utilizadores**
  - Nome e email
  - Função no sistema
  - Quem referenciou (Referenciador)
  - Número de afiliados directos + indirectos
  - Comissão total acumulada
  - Estado (Ativo/Inativo)
  - Ação "Detalhes"

- **Exportação de Relatórios**
  - Exportar dados em CSV
  - Inclui: ID, Nome, Email, Afiliados, Comissões

---

## 2. Arquitetura de Dados

### 2.1 Modelo de Utilizador com Afiliação

```typescript
interface UtilizadorAfiliadoEstrutura {
  id: string;                    // UUID único
  nome: string;
  email: string;
  nomeEmpresa?: string;
  funcao: string;                // administrador | contador | vendas | visualizador
  ativo: boolean;
  
  // Afiliação
  idReferenciador?: string;      // Quem o convidou
  nomeReferenciador?: string;
  dataAdesaoPrograma?: Date;
  
  // Estatísticas
  totalAfiliadosDirectos: number;
  totalAfiliadosIndirectos: number;
  comissaoTotal: number;
  comissaoPaga: number;
  comissaoPendente: number;
  
  // Ligação
  codigoReferencia: string;      // Ex: "JOAO001"
  linkConvite: string;           // URL completa
  
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### 2.2 Modelo de Afiliado Direto

```typescript
interface AfileadoDireto {
  id: string;
  nome: string;
  email: string;
  dataReferencia: Date;
  estadoAtivo: boolean;
  vendidoTotal: number;          // Valor total de vendas do afiliado
  comissaoGerada: number;        // Comissão do referenciador
  comissaoTaxaPercentual: number;
}
```

### 2.3 Modelo de Comissão

```typescript
interface ComissaoAfiliado {
  id: string;
  idAfiliado: string;            // Quem recebe a comissão
  idVenda?: string;              // Relacionado a uma venda (opcional)
  tipoComissao: 'venda' | 'ativacao' | 'bonus';
  valor: number;                 // Em Kwanzas
  percentual: number;            // Taxa percentual (5%, 10%, etc)
  dataGeracao: Date;
  dataPagamento?: Date;
  estado: 'pendente' | 'paga' | 'cancelada';
  descricao: string;
}
```

### 2.4 Configuração do Programa

```typescript
interface ConfiguracaoPrograma {
  comissaoTaxaDirecta: number;    // % para vendas directas (ex: 5%)
  comissaoTaxaIndirecta: number;  // % para vendas indirectas (ex: 2%)
  bonusAtivacao: number;          // Valor fixo por novo afiliado (ex: 500 KZ)
  maxNiveisDeSeparacao: number;   // Profundidade (ex: 3 níveis)
  minimoPagamento: number;        // Valor mínimo para solicitar (ex: 5000 KZ)
  ativo: boolean;
}
```

---

## 3. Fluxo de Afiliação

### 3.1 Registro com Referência

```
1. Utilizador A recebe seu código: JOAO001
2. Utiliza o link: https://app.pjlimitada.com/cadastro?ref=JOAO001
3. Novo Utilizador B se cadastra e fica vinculado a A
4. Utilizador A recebe:
   ✓ Bónus de ativação: 500 KZ
   ✓ Comissão sobre vendas de B: 5%
   ✓ Comissão sobre vendas indirectas: 2%
```

### 3.2 Rastreamento de Comissões

```
Venda de 10.000 KZ por Afiliado B
  ↓
Comissão para A (referenciador directo): 10.000 × 5% = 500 KZ
  ↓
Se A tem referenciador C:
  Comissão para C (referenciador indirecto): 10.000 × 2% = 200 KZ
```

---

## 4. Serviço de Afiliados

### Localização
`src/app/affiliates/services/affiliate.service.ts`

### Métodos Principais

#### Para Utilizadores Comuns

```typescript
// Obter dados de afiliação do utilizador logado
obterMeusDadosAfiliacao(idUtilizador: string): Observable<UtilizadorAfiliadoEstrutura>

// Obter lista de afiliados directos
obterAfiliadosDirectos(idUtilizador: string): Observable<AfileadoDireto[]>

// Obter árvore hierárquica de afiliados
obterArvoreAfiliados(idUtilizador: string): Observable<NodesArvoreAfiliados>

// Obter código de referência único
obterCodigoReferencia(idUtilizador: string): Observable<string>

// Gerar link de convite para compartilhar
gerarLinkConvite(idUtilizador: string, dominio?: string): Observable<string>

// Obter comissões (todas ou pendentes)
obterComissoes(idUtilizador: string): Observable<ComissaoAfiliado[]>
obterComissoesPendentes(idUtilizador: string): Observable<ComissaoAfiliado[]>

// Gerar relatório por período
gerarRelatorioAfiliados(idUtilizador: string, dataInicio: Date, dataFim: Date): Observable<RelatorioAfiliados>
```

#### Para Administradores

```typescript
// Obter todos os utilizadores com estrutura de afiliação
obterTodosUtilizadoresComAfiliacao(): Observable<UtilizadorAfiliadoEstrutura[]>

// Obter árvore completa de afiliações
obterArvoreAfiliadosCompleta(): Observable<NodesArvoreAfiliados[]>

// Obter relatório geral de comissões
obterRelatorioComissoesGeral(dataInicio: Date, dataFim: Date): Observable<any>

// Registrar novo utilizador com referência
registrarComReferencia(novoUtilizador: Partial<UtilizadorAfiliadoEstrutura>, codigoReferencia: string): Observable<UtilizadorAfiliadoEstrutura>
```

---

## 5. Componentes Implementados

### 5.1 AffiliateDashboardComponent
**Localização:** `src/app/affiliates/pages/dashboard/`

Componente para utilizadores visualizarem suas afiliações e comissões.

**Funcionalidades:**
- Exibir estatísticas pessoais
- Compartilhar link de convite via WhatsApp/Email
- Copiar link para clipboard
- Listar afiliados directos
- Exibir comissões pendentes

**Entrada:**
- Nenhuma (usa serviço com ID do utilizador logado)

**Saída:**
- Visualizações e interações do utilizador

### 5.2 AdminAffiliatesComponent
**Localização:** `src/app/admin/pages/affiliates/`

Componente para administradores visualizarem toda a estrutura de afiliações.

**Funcionalidades:**
- Resumo de estatísticas gerais
- Filtros por função e estado
- Tabela com todos os utilizadores
- Exportação em CSV

---

## 6. Persistência de Dados

### localStorage

Chaves utilizadas:
- `affiliate_users`: Array de UtilizadorAfiliadoEstrutura
- `affiliate_commissions`: Array de ComissaoAfiliado
- `affiliate_config`: ConfiguracaoPrograma

### Fluxo
1. Dados carregam do localStorage ao iniciar
2. Operações de escrita atualizam localStorage automaticamente
3. Em produção, será substituído por API REST

---

## 7. Integração no Sistema

### Rotas
- Utilizador: `/affiliates/dashboard` (não está roteada ainda, precisa de routing.module)
- Admin: `/admin/affiliates` (✓ implementada)

### Módulos
- `AffiliatesModule` - Contém componentes de afiliados
- `AdminModule` - Importa e declara `AdminAffiliatesComponent`

### Sidebar
- Menu "Afiliados" adicionado no admin (✓)

---

## 8. Dados de Demonstração

O serviço inicia com 3 utilizadores demo:

```
Admin PJ Limitada (root)
  ├── João Silva (JOAO001)
  │   ├── Afiliado da João Silva
  │   └── Outro Afiliado
  └── Maria Santos (MARIA001)
      └── Afiliado da Maria
```

Cada um com comissões simuladas.

---

## 9. Próximos Passos para Completar

### Frontend (Prioridade 1)
- [ ] Criar routing para `/affiliates/dashboard`
- [ ] Adicionar menu de "Meus Afiliados" na navegação principal
- [ ] Criar componente de detalhes de afiliado
- [ ] Criar página de pagamento de comissões
- [ ] Adicionar gráficos de performance

### Backend (Prioridade 2)
- [ ] Criar endpoints REST para afiliados
  - `GET /api/v1/afiliados/meus-dados`
  - `GET /api/v1/afiliados/meus-afiliados`
  - `GET /api/v1/afiliados/comissoes`
  - `POST /api/v1/afiliados/registrar-com-referencia`
  - `GET /api/v1/admin/afiliados` (admin only)
  - `GET /api/v1/admin/comissoes/relatorio` (admin only)

- [ ] Criar banco de dados
  - Tabela `usuarios_afiliacao` com campos de afiliação
  - Tabela `comissoes_afiliados`
  - Tabela `configuracao_programa`

- [ ] Implementar lógica de geração automática de comissões
  - Ao criar venda → verificar se vendedor tem referenciador
  - Ao criar venda → criar registos de comissão

### Integrações (Prioridade 3)
- [ ] Link de convite com rastreamento de conversão
- [ ] Email de boas-vindas ao novo afiliado
- [ ] Notificações de nova comissão gerada
- [ ] Relatórios automáticos mensais
- [ ] Pagamento automático de comissões (integração bancária)

---

## 10. Configuração Padrão

A configuração inicial do programa é:

```
Comissão Taxa Directa: 5%
Comissão Taxa Indirecta: 2%
Bónus Ativação: 500 KZ
Máximo Níveis Separação: 3
Mínimo Pagamento: 5.000 KZ
```

Pode ser alterada em produção via interface de admin.

---

## 11. Segurança

### Controles Implementados
- ✓ Validação de código de referência no registro
- ✓ Verificação de utilizador logado para acessar dados
- ✓ Acesso restrito ao admin para relatórios globais

### Melhorias Futuras
- [ ] Rate limiting em endpoints de afiliação
- [ ] Detecção de fraude (referências suspeitas)
- [ ] Auditoria de alterações de comissões
- [ ] Dois-fatores para solicitações de pagamento
