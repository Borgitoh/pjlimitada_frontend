# Sistema de Afiliados - Versão 2 (Reorganizado)

## Mudanças Realizadas

### ❌ Removido
- Menu separado "Afiliados" na barra lateral do admin
- Rota `/admin/affiliates` (página isolada)

### ✅ Novo Estrutura

#### 1. Para Administradores
**Localização:** Dentro de "Utilizadores" → Clicar em um utilizador

Ao clicar em um utilizador na página de "Utilizadores", o admin pode:
- Ver **árvore de afiliados** daquele utilizador
- Ver **afiliados directos** com detalhes de vendas e comissões
- **Configurar taxas de comissão** personalizadas:
  - Comissão directa (%)
  - Comissão indirecta (%)
  - Bónus de ativação (KZ)
- Ver **histórico de comissões** geradas

**Componente:** `UserDetailAffiliatesComponent`
**Template:** `src/app/admin/pages/users/user-detail-affiliates.component.html`

#### 2. Para Utilizadores Normais
**Localização:** Nova rota `/my-affiliate`

Utilizador comum pode:
- Ver **seu referenciador** (quem o convidou)
- Ver **link pessoal para compartilhar**
- Copiar link ou compartilhar via:
  - WhatsApp
  - Email
- Ver **comissão total ganha**
- Ver **comissão já recebida**
- Ver **comissão pendente**
- Acompanhar **histórico de comissões**

**Componente:** `MyAffiliateComponent`
**Template:** `src/app/user/pages/my-affiliate/my-affiliate.component.html`

---

## Arquitetura Revisada

### 1. Serviço Compartilhado
`AffiliateService` (`src/app/affiliates/services/affiliate.service.ts`)

Métodos usados por ambos os componentes:
- `obterMeusDadosAfiliacao()` - Dados de afiliação do utilizador
- `obterAfiliadosDirectos()` - Lista de afiliados directos
- `obterComissoes()` - Histórico de comissões
- `registrarComReferencia()` - Registar novo afiliado com referência

### 2. Modelos de Dados
`src/app/affiliates/models/affiliate.models.ts`

Estruturas reutilizáveis:
```typescript
- UtilizadorAfiliadoEstrutura
- AfileadoDireto
- ComissaoAfiliado
- ConfiguracaoPrograma
```

### 3. Componentes

#### AdminComponent
```
src/app/admin/pages/users/
├── user-detail-affiliates.component.ts
├── user-detail-affiliates.component.html
└── user-detail-affiliates.component.scss
```

**Uso:** Incluído na página de detalhes do utilizador (admin)

#### UserComponent
```
src/app/user/pages/my-affiliate/
├── my-affiliate.component.ts
├── my-affiliate.component.html
└── my-affiliate.component.scss
```

**Uso:** Rota `/my-affiliate` na navegação do utilizador

---

## Fluxo de Interação

### Para Admin
```
Admin → Lado Utilizadores → Clica num Utilizador
  ↓
Vê Detalhes do Utilizador
  ↓
Componente UserDetailAffiliatesComponent aparece
  ↓
Admin pode:
  - Ver afiliados directos daquele utilizador
  - Configurar comissão personalizada
  - Aprovar/bloquear afiliado
  - Ver histórico de comissões
```

### Para Utilizador Normal
```
Utilizador → Menu Principal → "Minha Comissão" (ou similar)
  ↓
Rota /my-affiliate
  ↓
Vê Componente MyAffiliateComponent
  ↓
Pode:
  - Ver seu referenciador
  - Copiar/compartilhar link
  - Acompanhar ganhos
  - Ver histórico de comissões
```

---

## Integração no Sistema

### Admin Module
```typescript
declarations: [
  ...
  UserDetailAffiliatesComponent  // Novo
  ...
]
```

### User Module (A criar)
```typescript
declarations: [
  MyAffiliateComponent  // Novo
]
```

### Rotas Necessárias
```typescript
// User Routes
{
  path: 'my-affiliate',
  component: MyAffiliateComponent
}
```

### Sidebar (Admin)
Menu simplificado - sem item separado de "Afiliados"

---

## Próximos Passos

### Imediato
1. [ ] Integrar `UserDetailAffiliatesComponent` na página de utilizadores (após modal de detalhes)
2. [ ] Criar rota `/my-affiliate` no app-routing
3. [ ] Adicionar link no menu do utilizador para `/my-affiliate`
4. [ ] Testar componentes com dados reais

### Backend
1. [ ] Criar endpoint `PUT /api/v1/admin/usuarios/:id/comissao` para salvar configuração
2. [ ] Criar tabela `usuarios_configuracao_comissao` com campos:
   - `id_usuario`
   - `taxa_comissao_direta`
   - `taxa_comissao_indirecta`
   - `bonus_ativacao`

### Melhorias Futuras
1. [ ] Gráficos de desempenho do afiliado
2. [ ] Relatório mensal automático
3. [ ] Integração bancária para pagamento
4. [ ] Notificações de nova comissão
5. [ ] Dashboard de referências (quantas convertidas, taxa de conversão)

---

## Exemplo de Uso

### Admin vendo afiliados de um utilizador
```
1. Admin vai para "Utilizadores"
2. Clica em "João Silva"
3. Aparece abaixo os dados:
   - Referenciador: Admin PJ Limitada
   - 2 Afiliados Directos
   - Comissão Total: 5.000 KZ
4. Admin pode clicar "Configurar Comissão"
5. Altera taxas e salva
```

### Utilizador vendo sua comissão
```
1. Utilizador logado
2. Clica em menu "Minha Comissão"
3. Vê página bonita com:
   - Referenciador: "Admin PJ Limitada"
   - Link para compartilhar
   - Comissão: 3.000 KZ total
   - Pendente: 1.000 KZ
4. Clica botão WhatsApp para compartilhar
```

---

## Segurança

### Validações Implementadas
- ✓ Utilizador só vê seus próprios dados (MyAffiliate)
- ✓ Admin só pode editar comissões se autenticado
- ✓ Verificação de referência válida ao registar

### Próximas Validações
- [ ] Rate limiting em endpoints de comissão
- [ ] Auditoria de alterações de taxas
- [ ] Verificação de fraude em referências
- [ ] Dois-fatores para pagamentos

---

## Dados Demo

### Estrutura Demo
```
Admin (root)
├── João Silva (afiliador)
│   ├── Comissão Directa: 5%
│   ├── Comissão Indirecta: 2%
│   └── 2 Afiliados
└── Maria Santos (afiliadora)
    ├── Comissão Directa: 5%
    ├── Comissão Indirecta: 2%
    └── 1 Afiliado
```

### Como Testar
1. Login como Admin
2. Ir para "Utilizadores"
3. Clicar em "João Silva"
4. Ver componente `UserDetailAffiliatesComponent` com:
   - Stats: 2 afiliados, 5.000 KZ comissão
   - Lista de afiliados
   - Botão "Configurar Comissão"

---

## Diferenças da V1

| Aspecto | V1 | V2 |
|---------|----|----|
| Menu Admin | Separado "Afiliados" | Dentro de "Utilizadores" |
| Rota Admin | `/admin/affiliates` | Nenhuma (modal em Utilizadores) |
| Localização | Página isolada | Detalhe do utilizador |
| Admin controla | Todos os afiliados gerais | Comissão por utilizador |
| Utilizador vê | Apenas dados pessoais | Dashboard dedicado `/my-affiliate` |
| UX | Menos intuitiva | Mais focada no fluxo do utilizador |
