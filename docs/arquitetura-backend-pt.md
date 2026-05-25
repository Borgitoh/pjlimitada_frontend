# Arquitetura Backend - Sistema de Faturação PJ Limitada

Documentação técnica completa do backend de faturação eletrônica, autenticação e gestão de dados. Todas as tabelas e campos estão em português.

---

## 1. Visão Geral do Sistema Backend

```
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Componente de Checkout                             │   │
│  │  ├─ Formulário de dados                            │   │
│  │  ├─ Cálculo local de impostos                      │   │
│  │  └─ Chamada Serviço de Criação de Fatura          │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                             │
│                 │ HTTP POST /api/v1/faturas                  │
│                 │ { tipoDocumento, cliente, linhas }         │
│                 ▼                                             │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ [INTERNET/HTTPS]
                   │
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js / .NET)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Camada de API / Controladores                      │  │
│  │  ├─ POST /api/v1/faturas (criar)                   │  │
│  │  ├─ GET /api/v1/faturas/:id (obter)               │  │
│  │  ├─ GET /api/v1/faturas (listar)                  │  │
│  │  ├─ PUT /api/v1/faturas/:id/anular (anular)       │  │
│  │  ├─ POST /api/v1/autenticacao/login               │  │
│  │  └─ GET /api/v1/validacao/estado/:faturaId        │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Camada de Lógica de Negócio                        │  │
│  │  ├─ ServiçoFatura                                  │  │
│  │  ├─ ServiçoValidação                               │  │
│  │  ├─ ServiçoCálculoImposto                          │  │
│  │  ├─ ServiçoAutenticação                            │  │
│  │  └─ ServiçoIntegração AGT                          │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Camada de Acesso a Dados (ORM)                     │  │
│  │  ├─ RepositórioFatura                              │  │
│  │  ├─ RepositórioUsuário                             │  │
│  │  ├─ RepositórioRegistroValidação                   │  │
│  │  └─ RepositórioSérieDocumento                      │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Camada de Banco de Dados (PostgreSQL/MySQL)        │  │
│  │  ├─ faturas                                        │  │
│  │  ├─ linhas_fatura                                  │  │
│  │  ├─ impostos_fatura                                │  │
│  │  ├─ usuarios                                       │  │
│  │  ├─ registros_validacao                            │  │
│  │  ├─ series_documento                               │  │
│  │  └─ registros_auditoria                            │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Serviços Externos                                  │  │
│  │  ├─ Sistema AGT de Validação                       │  │
│  │  ├─ Serviço de Email                               │  │
│  │  └─ Armazenamento de Ficheiros (PDF/QR Code)       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Autenticação e Autorização

### 2.1 Sistema de Login

```
┌─────────────────────────────────┐
│  Frontend - Componente Login    │
│  ├─ Entrada: email              │
│  ├─ Entrada: senha              │
│  └─ Botão: Entrar               │
└──────────────┬──────────────────┘
               │
               │ POST /api/v1/autenticacao/login
               │ { email, senha }
               ▼
┌─────────────────────────────────────────────────┐
│  Backend - ControladorAutenticação              │
│                                                 │
│  1. Validar dados de entrada                   │
│  2. Procurar utilizador no banco por email     │
│  3. Comparar senha (bcrypt)                    │
│  4. Gerar Token JWT                           │
│  5. Retornar Token + Informações Utilizador    │
└──────────────┬──────────────────────────────────┘
               │
               │ Resposta 200
               │ {
               │   "token": "eyJhbGciOiJIUzI1NiIs...",
               │   "usuario": {
               │     "id": "123",
               │     "email": "usuario@empresa.com",
               │     "nome": "João Silva",
               │     "funcao": "administrador",
               │     "empresa": {
               │       "nif": "1234567890123",
               │       "nome": "PJ Limitada"
               │     }
               │   },
               │   "expiracaoEm": 3600
               │ }
               ▼
┌─────────────────────────────────┐
│  Frontend - Armazenar Token     │
│  ├─ localStorage                 │
│  ├─ sessionStorage               │
│  └─ Cabeçalho HttpClient        │
└─────────────────────────────────┘
```

### 2.2 Fluxo de Autorização

```typescript
// Frontend: Interceptador adicionando token em todas requisições
GET /api/v1/faturas
Headers: {
  Autorização: "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// Backend: Middleware validando token
┌─────────────────────────────────────────┐
│  MiddlewareValidaçãoJWT                 │
│  ├─ Extrai token do cabeçalho            │
│  ├─ Verifica assinatura                  │
│  ├─ Verifica expiração                   │
│  ├─ Anexa idUtilizador ao pedido         │
│  └─ Passa para próximo middleware        │
└──────────────┬───────────────────────────┘
               │
               ├─ Token válido → Continua
               └─ Token inválido → 401 Não Autorizado
```

### 2.3 Níveis de Permissão

```typescript
enum FunçãoUtilizador {
  ADMINISTRADOR = 'administrador',      // Gere tudo, utilizadores
  CONTADOR = 'contador',                // Cria/valida faturas
  VENDAS = 'vendas',                   // Emite faturas para vendas
  VISUALIZADOR = 'visualizador'         // Apenas visualiza
}

// Middleware de Autorização
@Autorizar(FunçãoUtilizador.ADMINISTRADOR, FunçãoUtilizador.CONTADOR)
POST /api/v1/faturas/criar

// Apenas ADMINISTRADOR pode:
- Gerir utilizadores
- Aceder a relatórios financeiros
- Modificar séries de documentos

// CONTADOR pode:
- Criar/editar/anular faturas
- Visualizar validações
- Gerar relatórios

// VENDAS pode:
- Criar faturas
- Visualizar próprias faturas
- Descarregar PDF

// VISUALIZADOR pode:
- Visualizar faturas
- Descarregar PDF
```

---

## 3. Esquema Completo do Banco de Dados

### 3.1 Tabela: usuarios

```sql
CREATE TABLE usuarios (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  hash_senha VARCHAR(255) NOT NULL,
  
  -- Dados pessoais
  nome_completo VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  
  -- Relacionamento com empresa
  id_empresa VARCHAR(36) NOT NULL,
  
  -- Função/Permissões
  funcao ENUM('administrador', 'contador', 'vendas', 'visualizador') DEFAULT 'visualizador',
  
  -- Estado
  ativo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  email_verificado_em TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP,
  
  -- Índices
  FOREIGN KEY (id_empresa) REFERENCES empresas(id),
  INDEX idx_email (email),
  INDEX idx_id_empresa (id_empresa),
  INDEX idx_ativo (ativo)
);
```

### 3.2 Tabela: empresas

```sql
CREATE TABLE empresas (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  nif VARCHAR(15) UNIQUE NOT NULL,
  nome_empresa VARCHAR(200) NOT NULL,
  
  -- Contato
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco VARCHAR(500),
  cidade VARCHAR(100),
  pais VARCHAR(5) DEFAULT 'AO',
  
  -- Software
  id_software VARCHAR(36),
  versao_software VARCHAR(20),
  numero_validacao_software VARCHAR(50),
  
  -- Estado
  ativo BOOLEAN DEFAULT true,
  assinatura_expira_em DATE,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP,
  
  INDEX idx_nif (nif),
  INDEX idx_ativo (ativo)
);
```

### 3.3 Tabela: faturas

```sql
CREATE TABLE faturas (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  numero_documento VARCHAR(60) UNIQUE NOT NULL,
  tipo_documento VARCHAR(2) NOT NULL, -- FT, FR, NC, etc
  data_documento TIMESTAMP NOT NULL,
  
  -- Estado
  estado_documento VARCHAR(1) NOT NULL DEFAULT 'N', -- N, S, A, C, etc
  estado_validacao VARCHAR(1), -- V, P, null
  
  -- Relacionamentos
  id_empresa VARCHAR(36) NOT NULL,
  id_serie INT NOT NULL,
  id_usuario_criador VARCHAR(36) NOT NULL,
  
  -- Dados do Documento
  nif_contribuinte VARCHAR(15) NOT NULL,
  
  -- Cliente
  nif_cliente VARCHAR(15) NOT NULL,
  pais_cliente VARCHAR(5) NOT NULL DEFAULT 'AO',
  nome_cliente VARCHAR(200) NOT NULL,
  
  -- Totalizações
  total_liquido DECIMAL(15, 2) NOT NULL,
  total_imposto DECIMAL(15, 2) NOT NULL,
  total_bruto DECIMAL(15, 2) NOT NULL,
  
  -- Assinatura e Rastreamento
  assinatura_jws TEXT NOT NULL,
  dados_codigo_qr TEXT,
  imagem_codigo_qr MEDIUMBLOB,
  
  -- Submissão para AGT
  id_submissao_agt VARCHAR(36),
  data_submissao_agt TIMESTAMP,
  data_validacao_agt TIMESTAMP,
  motivo_rejeicao_agt TEXT,
  
  -- Referência (para NC/ND)
  id_fatura_referencia VARCHAR(36),
  motivo_cancelamento VARCHAR(500),
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP,
  submetido_em TIMESTAMP,
  
  FOREIGN KEY (id_empresa) REFERENCES empresas(id),
  FOREIGN KEY (id_serie) REFERENCES series_documento(id),
  FOREIGN KEY (id_usuario_criador) REFERENCES usuarios(id),
  FOREIGN KEY (id_fatura_referencia) REFERENCES faturas(id),
  
  INDEX idx_numero_documento (numero_documento),
  INDEX idx_id_empresa (id_empresa),
  INDEX idx_nif_cliente (nif_cliente),
  INDEX idx_estado_documento (estado_documento),
  INDEX idx_estado_validacao (estado_validacao),
  INDEX idx_criado_em (criado_em),
  UNIQUE KEY uk_documento_empresa (numero_documento, id_empresa)
);
```

### 3.4 Tabela: linhas_fatura

```sql
CREATE TABLE linhas_fatura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_fatura VARCHAR(36) NOT NULL,
  numero_linha INT NOT NULL,
  
  -- Produto/Serviço
  codigo_produto VARCHAR(60) NOT NULL,
  descricao_produto VARCHAR(200) NOT NULL,
  codigo_categoria VARCHAR(20), -- PECAS, BODYKIT, IMPORTACAO_VEICULO
  
  -- Quantidades e Preços
  quantidade DECIMAL(10, 3) NOT NULL,
  unidade_medida VARCHAR(20) NOT NULL,
  preco_unitario DECIMAL(15, 2) NOT NULL,
  preco_unitario_base DECIMAL(15, 2) NOT NULL, -- Após descontos
  
  -- Descontos/Encargos
  valor_desconto DECIMAL(15, 2),
  percentual_desconto DECIMAL(5, 2),
  
  -- Totais da Linha
  subtotal_linha DECIMAL(15, 2) NOT NULL,
  total_imposto_linha DECIMAL(15, 2) NOT NULL,
  total_linha DECIMAL(15, 2) NOT NULL,
  
  -- Débito/Crédito
  valor_debito DECIMAL(15, 2),
  valor_credito DECIMAL(15, 2),
  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_fatura) REFERENCES faturas(id) ON DELETE CASCADE,
  INDEX idx_id_fatura (id_fatura),
  INDEX idx_numero_linha (id_fatura, numero_linha)
);
```

### 3.5 Tabela: impostos_fatura

```sql
CREATE TABLE impostos_fatura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_linha INT NOT NULL,
  
  -- Tipo de Imposto
  tipo_imposto VARCHAR(3) NOT NULL, -- IVA, IS, IEC, NS
  codigo_imposto VARCHAR(10) NOT NULL, -- NOR, INT, RED, ISE, etc
  
  -- Localização do Imposto
  regiao_pais_imposto VARCHAR(10) NOT NULL DEFAULT 'AO', -- AO, AO-CAB, etc
  
  -- Valores
  base_imposto DECIMAL(15, 2) NOT NULL,
  percentual_imposto DECIMAL(5, 2) NOT NULL,
  valor_imposto DECIMAL(15, 2) NOT NULL,
  contribuicao_imposto DECIMAL(15, 2),
  
  -- Isenção
  codigo_isencao_imposto VARCHAR(3),
  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_linha) REFERENCES linhas_fatura(id) ON DELETE CASCADE,
  INDEX idx_id_linha (id_linha),
  INDEX idx_tipo_imposto (tipo_imposto)
);
```

### 3.6 Tabela: series_documento

```sql
CREATE TABLE series_documento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa VARCHAR(36) NOT NULL,
  
  -- Identificação da Série
  codigo_serie VARCHAR(60) NOT NULL,
  ano_serie INT NOT NULL,
  tipo_documento VARCHAR(2) NOT NULL,
  
  -- Numeração
  numero_primeiro_documento INT NOT NULL,
  numero_atual INT NOT NULL,
  numero_ultimo_documento INT,
  
  -- Estado
  estado_serie VARCHAR(1) NOT NULL DEFAULT 'A', -- A (Aberta), U (Uso), F (Fechada)
  
  -- AGT
  id_requisicao_agt VARCHAR(36),
  data_requisicao_agt TIMESTAMP,
  data_aprovacao_agt TIMESTAMP,
  numero_aprovacao_agt VARCHAR(50),
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechado_em TIMESTAMP,
  
  FOREIGN KEY (id_empresa) REFERENCES empresas(id),
  UNIQUE KEY uk_serie (id_empresa, codigo_serie, ano_serie),
  INDEX idx_id_empresa (id_empresa),
  INDEX idx_tipo_documento (tipo_documento),
  INDEX idx_estado_serie (estado_serie)
);
```

### 3.7 Tabela: registros_validacao

```sql
CREATE TABLE registros_validacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_fatura VARCHAR(36) NOT NULL,
  id_empresa VARCHAR(36) NOT NULL,
  
  -- Ação de Validação
  acao VARCHAR(50) NOT NULL, -- CRIADA, SUBMETIDA, VALIDADA, REJEITADA, CANCELADA
  data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Resultado
  estado_validacao VARCHAR(1), -- V, P, RJ, null
  mensagem_estado VARCHAR(500),
  
  -- Resultado da AGT
  codigo_resposta_agt INT,
  mensagem_resposta_agt TEXT,
  id_submissao_agt VARCHAR(36),
  
  -- Utilizador que realizou ação
  id_usuario_acao VARCHAR(36),
  
  -- IP/User Agent (segurança)
  endereco_ip VARCHAR(45),
  agente_usuario VARCHAR(500),
  
  FOREIGN KEY (id_fatura) REFERENCES faturas(id),
  FOREIGN KEY (id_empresa) REFERENCES empresas(id),
  FOREIGN KEY (id_usuario_acao) REFERENCES usuarios(id),
  
  INDEX idx_id_fatura (id_fatura),
  INDEX idx_id_empresa (id_empresa),
  INDEX idx_data_acao (data_acao)
);
```

### 3.8 Tabela: registros_auditoria

```sql
CREATE TABLE registros_auditoria (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- Rastreamento
  tipo_entidade VARCHAR(50) NOT NULL, -- Fatura, Usuario, SérieDocumento
  id_entidade VARCHAR(36) NOT NULL,
  id_empresa VARCHAR(36) NOT NULL,
  
  -- Ação
  acao VARCHAR(50) NOT NULL, -- CRIAR, ATUALIZAR, DELETAR, CANCELAR
  data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Dados Anteriores/Novos
  valores_antigos JSON,
  valores_novos JSON,
  resumo_alteracoes VARCHAR(500),
  
  -- Utilizador
  id_usuario_acao VARCHAR(36),
  
  -- Contexto
  endereco_ip VARCHAR(45),
  agente_usuario VARCHAR(500),
  id_sessao VARCHAR(100),
  
  -- Segurança
  sensivel BOOLEAN DEFAULT false,
  
  FOREIGN KEY (id_empresa) REFERENCES empresas(id),
  FOREIGN KEY (id_usuario_acao) REFERENCES usuarios(id),
  
  INDEX idx_entidade (tipo_entidade, id_entidade),
  INDEX idx_id_empresa (id_empresa),
  INDEX idx_data_acao (data_acao)
);
```

### 3.9 Tabela: taxas_imposto (Configuração)

```sql
CREATE TABLE taxas_imposto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Identificação
  tipo_imposto VARCHAR(3) NOT NULL, -- IVA, IEC, IS, NS
  codigo_imposto VARCHAR(10) NOT NULL, -- NOR, INT, RED, ISE, etc
  
  -- Valores
  percentual DECIMAL(5, 2) NOT NULL,
  
  -- Aplicação
  categorias_aplicacao VARCHAR(255), -- JSON array de categorias
  pais VARCHAR(5) DEFAULT 'AO',
  
  -- Data de Validade
  valido_a_partir_de DATE NOT NULL,
  valido_ate DATE,
  
  -- Estado
  ativo BOOLEAN DEFAULT true,
  
  -- Descrição
  descricao VARCHAR(255),
  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP,
  
  UNIQUE KEY uk_taxa_imposto (tipo_imposto, codigo_imposto, pais, valido_a_partir_de),
  INDEX idx_ativo (ativo),
  INDEX idx_valido_a_partir_de (valido_a_partir_de)
);
```

### 3.10 Diagrama de Relacionamentos

```
                    ┌──────────────┐
                    │  empresas    │
                    └────────┬─────┘
                             │
            ┌────────────────┼────────────────┬──────────────┐
            │                │                │              │
            ▼                ▼                ▼              ▼
        ┌────────┐      ┌─────────┐  ┌──────────────┐  ┌─────────────┐
        │usuarios│      │ faturas │  │ series_      │  │ taxas_      │
        └───┬────┘      └────┬────┘  │ documento    │  │ imposto     │
            │                │       └──────────────┘  └─────────────┘
            │        ┌─────┴────────┐
            │        │              │
            │        ▼              ▼
            │   ┌──────────────┐ ┌──────────────────┐
            │   │linhas_fatura │ │registros_        │
            │   └──────┬───────┘ │validacao         │
            │          │         └────────┬─────────┘
            │          ▼                  │
            │   ┌──────────────┐         │
            │   │impostos_     │         │
            │   │fatura        │         │
            │   └──────────────┘         │
            │                            │
            └────────────────────────────┘
```

---

## 4. Endpoints da API REST

### 4.1 Autenticação

```
┌─────────────────────────────────────────────────────┐
│ POST /api/v1/autenticacao/login                    │
├─────────────────────────────────────────────────────┤
│ Pedido:                                             │
│ {                                                   │
│   "email": "usuario@empresa.com",                   │
│   "senha": "senha123",                              │
│   "lembre-me": true                                 │
│ }                                                   │
│                                                     │
│ Resposta 200:                                       │
│ {                                                   │
│   "sucesso": true,                                  │
│   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",   │
│   "tokenAtualizacao": "rt_...",                     │
│   "expiracaoEm": 3600,                              │
│   "usuario": {                                      │
│     "id": "uuid",                                   │
│     "email": "usuario@empresa.com",                 │
│     "nomeCompleto": "João Silva",                   │
│     "funcao": "contador",                           │
│     "empresa": {                                    │
│       "id": "uuid",                                 │
│       "nif": "1234567890123",                       │
│       "nome": "PJ Limitada"                         │
│     }                                               │
│   }                                                 │
│ }                                                   │
│                                                     │
│ Resposta 401:                                       │
│ {                                                   │
│   "sucesso": false,                                 │
│   "erro": "CREDENCIAIS_INVALIDAS",                 │
│   "mensagem": "Email ou senha incorretos"          │
│ }                                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ POST /api/v1/autenticacao/atualizar-token          │
├─────────────────────────────────────────────────────┤
│ Pedido:                                             │
│ {                                                   │
│   "tokenAtualizacao": "rt_..."                      │
│ }                                                   │
│                                                     │
│ Resposta 200:                                       │
│ {                                                   │
│   "token": "eyJhbGc...",                            │
│   "expiracaoEm": 3600                               │
│ }                                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ POST /api/v1/autenticacao/sair                     │
├─────────────────────────────────────────────────────┤
│ Cabeçalhos: Autorização: Bearer <token>             │
│                                                     │
│ Resposta 200:                                       │
│ {                                                   │
│   "sucesso": true,                                  │
│   "mensagem": "Desconectado com sucesso"           │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

### 4.2 Faturas - CRUD

```
┌──────────────────────────────────────────────────────────┐
│ POST /api/v1/faturas                                     │
├──────────────────────────────────────────────────────────┤
│ Cabeçalhos:                                              │
│   Autorização: Bearer <token>                            │
│   Content-Type: application/json                         │
│                                                           │
│ Corpo do Pedido:                                         │
│ {                                                        │
│   "tipoDocumento": "FT",                                 │
│   "cliente": {                                           │
│     "nif": "123456789012345",                            │
│     "pais": "AO",                                        │
│     "nome": "Cliente SARL"                               │
│   },                                                     │
│   "linhas": [                                            │
│     {                                                    │
│       "codigoProduto": "PECA-001",                       │
│       "descricaoProduto": "Filtro de Ar Original",       │
│       "quantidade": 2,                                   │
│       "unidadeMedida": "UN",                             │
│       "precoUnitario": 45000,                            │
│       "precoUnitarioBase": 45000,                        │
│       "codigoCategoria": "PECAS"                         │
│     }                                                    │
│   ]                                                      │
│ }                                                        │
│                                                           │
│ Resposta 201:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": {                                             │
│     "idFatura": "550e8400-e29b-41d4-a716...",            │
│     "numeroDocumento": "FAT-2025-000001",                │
│     "tipoDocumento": "FT",                               │
│     "dataDocumento": "2025-05-27T14:30:00+01:00",        │
│     "estadoDocumento": "N",                              │
│     "cliente": { ... },                                  │
│     "linhas": [ ... ],                                   │
│     "totaisDocumento": {                                 │
│       "totalLiquido": 90000,                             │
│       "totalImposto": 12600,                             │
│       "totalBruto": 102600,                              │
│       "moeda": {                                         │
│         "codigoMoeda": "AOA",                            │
│         "valor": 102600,                                 │
│         "taxaCambio": 1.0                                │
│       }                                                  │
│     },                                                   │
│     "assinaturaJWS": "eyJhbGciOi...",                    │
│     "dadosCodigoQR": "https://portaldocontribuinte..." │
│   },                                                     │
│   "mensagem": "Fatura criada com sucesso"              │
│ }                                                        │
│                                                           │
│ Resposta 400:                                            │
│ {                                                        │
│   "sucesso": false,                                      │
│   "erro": "ERRO_VALIDACAO",                              │
│   "detalhes": [                                          │
│     {                                                    │
│       "campo": "cliente.nif",                            │
│       "mensagem": "NIF deve ter 15 dígitos"             │
│     }                                                    │
│   ]                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ GET /api/v1/faturas/:idFatura                           │
├──────────────────────────────────────────────────────────┤
│ Cabeçalhos: Autorização: Bearer <token>                 │
│                                                           │
│ Resposta 200:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": { ... objetoFatura ... }                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ GET /api/v1/faturas                                      │
├──────────────────────────────────────────────────────────┤
│ Parâmetros de Consulta:                                  │
│   ?pagina=1&limite=20                                    │
│   &dataInicio=2025-05-01                                 │
│   &dataFim=2025-05-31                                    │
│   &tipoDocumento=FT                                      │
│   &estadoValidacao=V                                     │
│   &ordenarPor=dataDocumento&ordem=desc                   │
│                                                           │
│ Cabeçalhos: Autorização: Bearer <token>                 │
│                                                           │
│ Resposta 200:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": {                                             │
│     "itens": [ ... ],                                    │
│     "paginacao": {                                       │
│       "pagina": 1,                                       │
│       "limite": 20,                                      │
│       "total": 150,                                      │
│       "paginas": 8,                                      │
│       "temMais": true                                    │
│     }                                                    │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PUT /api/v1/faturas/:idFatura/anular                     │
├──────────────────────────────────────────────────────────┤
│ Cabeçalhos: Autorização: Bearer <token>                 │
│                                                           │
│ Corpo do Pedido:                                         │
│ {                                                        │
│   "motivo": "Erro na emissão do documento"              │
│ }                                                        │
│                                                           │
│ Resposta 200:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": {                                             │
│     "idFaturaOriginal": "...",                           │
│     "idNotaCredito": "...",                              │
│     "numeroNotaCredito": "NC-2025-000001",               │
│     "mensagem": "Fatura anulada com sucesso"            │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Validação e Estado

```
┌──────────────────────────────────────────────────────────┐
│ GET /api/v1/validacao/estado/:idFatura                  │
├──────────────────────────────────────────────────────────┤
│ Cabeçalhos: Autorização: Bearer <token>                 │
│                                                           │
│ Resposta 200:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": {                                             │
│     "idFatura": "...",                                   │
│     "numeroDocumento": "FAT-2025-000001",                │
│     "estadoDocumento": "N",                              │
│     "estadoValidacao": "V",                              │
│     "submetidoAGT": true,                                │
│     "dataSubmissaoAGT": "2025-05-28T10:00:00",          │
│     "dataValidacaoAGT": "2025-05-28T15:30:00",          │
│     "motivoRejeicao": null,                              │
│     "historicoValidacao": [                              │
│       {                                                  │
│         "data": "2025-05-28T10:00:00",                  │
│         "estado": "P",                                   │
│         "mensagem": "Fatura submetida para AGT"         │
│       },                                                 │
│       {                                                  │
│         "data": "2025-05-28T15:30:00",                  │
│         "estado": "V",                                   │
│         "mensagem": "Fatura validada com sucesso"       │
│       }                                                  │
│     ]                                                    │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ POST /api/v1/validacao/submeter-agt                      │
├──────────────────────────────────────────────────────────┤
│ Cabeçalhos:                                              │
│   Autorização: Bearer <token>                            │
│   Content-Type: application/json                         │
│                                                           │
│ Corpo do Pedido:                                         │
│ {                                                        │
│   "idFatura": "550e8400-e29b-41d4-a716...",             │
│   "imediatamente": true                                  │
│ }                                                        │
│                                                           │
│ Resposta 202:                                            │
│ {                                                        │
│   "sucesso": true,                                       │
│   "dados": {                                             │
│     "idFatura": "...",                                   │
│     "estado": "P",                                       │
│     "mensagem": "Fatura em fila de validação"          │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Fluxo de Validação e Comportamento Backend

### 5.1 Fluxo Criação → Validação → AGT

```
1. UTILIZADOR CRIA FATURA (POST /api/v1/faturas)
   ├─ Validação de dados no frontend
   ├─ HTTP POST para backend
   └─ Backend recebe pedido

2. BACKEND PROCESSA FATURA
   ├─ Valida permissão (JWT + função)
   ├─ Valida dados de entrada (NIF, cliente, linhas)
   ├─ Calcula impostos (IVA, IEC, etc)
   ├─ Gera número de documento (série)
   ├─ Cria assinatura digital (JWS)
   ├─ Gera código QR
   ├─ Insere em BD (estado: N - Normal)
   └─ Retorna fatura ao frontend

3. FATURA ARMAZENADA EM BD
   ├─ Estado: N (Normal)
   ├─ Estado Validação: vazio (não submetida)
   ├─ Criado em: timestamp atual
   └─ Pronta para ser visualizada/manipulada

4. UTILIZADOR SUBMETE PARA AGT (POST /api/v1/validacao/submeter-agt)
   ├─ Backend muda estado para P (Pendente)
   ├─ Envia pacote JWS para sistema AGT
   ├─ Armazena id_submissao_agt
   └─ Retorna confirmação ao frontend

5. SISTEMA AGT VALIDA
   ├─ Verifica assinatura JWS
   ├─ Valida conformidade fiscal
   ├─ Retorna resultado (V - Validada ou RJ - Rejeitada)
   └─ Backend atualiza estado_validacao

6. FATURA FINALIZADA
   ├─ Estado: S (Submetida) ou A (Anulada se rejeitada)
   ├─ Estado Validação: V (Validada) ou RJ (Rejeitada)
   ├─ QR code acessível em: /consultar-fe?documentNo=...&nif=...
   └─ Disponível para consulta e auditoria
```

### 5.2 Estrutura de Validações

```
VALIDAÇÃO NO FRONTEND:
- Email válido
- Campos obrigatórios preenchidos
- NIF cliente com 15 dígitos
- Quantidade > 0
- Preços > 0

VALIDAÇÃO NO BACKEND:
- Token JWT válido e não expirado
- Utilizador tem permissão (rol)
- NIF cliente é número de 15 dígitos
- Série ativa existe
- Impostos calculados corretamente
- Assinatura gerada com sucesso
- Limite de faturas/mês não atingido

VALIDAÇÃO NA AGT:
- Assinatura JWS válida
- Formatação conforme AGT
- Série solicitada previamente
- Sequência numérica correta
- Datas válidas
- Dados fiscais conformes
```

### 5.3 Tratamento de Erros

```
ERRO 400 - Pedido Inválido
{
  "sucesso": false,
  "erro": "ERRO_VALIDACAO",
  "detalhes": [{
    "campo": "cliente.nif",
    "mensagem": "NIF deve ser número de 15 dígitos"
  }]
}

ERRO 401 - Não Autorizado
{
  "sucesso": false,
  "erro": "NAO_AUTORIZADO",
  "mensagem": "Token expirou. Faça login novamente."
}

ERRO 403 - Proibido
{
  "sucesso": false,
  "erro": "PROIBIDO",
  "mensagem": "Utilizador não tem permissão para criar faturas"
}

ERRO 404 - Não Encontrado
{
  "sucesso": false,
  "erro": "NAO_ENCONTRADO",
  "mensagem": "Fatura com ID especificado não existe"
}

ERRO 409 - Conflito
{
  "sucesso": false,
  "erro": "NUMERO_DOCUMENTO_DUPLICADO",
  "mensagem": "Número de documento já existe para esta empresa"
}

ERRO 500 - Erro Servidor
{
  "sucesso": false,
  "erro": "ERRO_INTERNO",
  "mensagem": "Erro ao processar pedido. Contacte suporte."
}
```

---

## 6. Relacionamento Frontend ↔ Backend

### 6.1 Fluxo de Dados Checkout → Fatura

```
1. UTILIZADOR COMPLETA CHECKOUT
   ├─ Dados pessoais (nome, NIF, endereço)
   ├─ Itens do carrinho (produto, qtd, preço)
   ├─ Forma de pagamento
   └─ Observações

2. FRONTEND PREPARA PEDIDO
   ├─ Mapeia itens carrinho → linhas fatura
   ├─ Calcula impostos localmente (preview)
   ├─ Monta CreateInvoiceDTO
   └─ Adiciona token JWT

3. FRONTEND ENVIA (POST /api/v1/faturas)
   {
     "tipoDocumento": "FT",
     "cliente": {
       "nif": "123456789012345",
       "pais": "AO",
       "nome": "Cliente Final"
     },
     "linhas": [...]
   }

4. BACKEND PROCESSA
   ├─ Valida toda entrada
   ├─ Recalcula impostos (confirmação)
   ├─ Gera número documento
   ├─ Cria assinatura
   ├─ Persiste em BD
   └─ Retorna Invoice completa

5. FRONTEND RECEBE
   {
     "idFatura": "uuid",
     "numeroDocumento": "FAT-2025-000001",
     "totalBruto": 102600,
     "assinaturaJWS": "...",
     "dadosCodigoQR": "..."
   }

6. FRONTEND EXIBE CONFIRMAÇÃO
   ├─ Número fatura
   ├─ Código QR
   ├─ Total pago
   └─ Opções: Descarregar PDF, Ver Fatura, Voltar ao Início
```

### 6.2 Interceptador de Autenticação (Frontend)

```typescript
// Interceptador HTTP - adiciona token em todas requisições
export class AutenticacaoInterceptador implements HttpInterceptor {
  constructor(private armazenamento: ArmazenamentoDados) {}

  intercept(
    requisicao: HttpRequest<any>,
    proximo: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.armazenamento.obterToken();
    
    if (token) {
      requisicao = requisicao.clone({
        setHeaders: {
          Autorização: `Bearer ${token}`
        }
      });
    }

    return proximo.handle(requisicao).pipe(
      catchError((erro) => {
        if (erro.status === 401) {
          // Token expirou - tentar atualizar
          return this.atualizarToken().pipe(
            switchMap(() => proximo.handle(requisicao))
          );
        }
        return throwError(() => erro);
      })
    );
  }
}
```

---

## Próximos Passos de Implementação

### Backend (Prioridade 1)
- [ ] Criar controladores (Controllers)
- [ ] Implementar repositórios (Repositories)
- [ ] Migrations do banco de dados
- [ ] Testes unitários e E2E

### Integrações Externas (Prioridade 2)
- [ ] Integração real com API AGT
- [ ] Serviço de envio de email
- [ ] Armazenamento seguro de ficheiros

### Frontend (Prioridade 3)
- [ ] Componentes de visualização de faturas
- [ ] Gerador de PDF
- [ ] QR Code renderer
- [ ] Relatórios e filtros avançados
