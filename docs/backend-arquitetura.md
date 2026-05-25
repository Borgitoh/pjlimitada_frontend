# 🔧 Backend - Arquitetura, Validação e Integração com Frontend

## 1. Visão Geral do Sistema Backend

```
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Checkout Component                                 │   │
│  │  ├─ Formulário de dados                            │   │
│  │  ├─ Cálculo local de impostos                      │   │
│  │  └─ Chamada CreateInvoiceService                   │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                             │
│                 │ HTTP POST /api/v1/invoices                 │
│                 │ { documentType, customer, lines }          │
│                 ▼                                             │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ [INTERNET/HTTPS]
                   │
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js / .NET)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Gateway / Controllers                          │  │
│  │  ├─ POST /api/v1/invoices (criar)                  │  │
│  │  ├─ GET /api/v1/invoices/:id (obter)              │  │
│  │  ├─ GET /api/v1/invoices (listar)                 │  │
│  │  ├─ PUT /api/v1/invoices/:id/cancel (anular)      │  │
│  │  ├─ POST /api/v1/auth/login (autenticação)        │  │
│  │  └─ GET /api/v1/validation/status/:invoiceId      │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Business Logic Layer                               │  │
│  │  ├─ InvoiceService                                 │  │
│  │  ├─ ValidationService                              │  │
│  │  ├─ TaxCalculationService                          │  │
│  │  ├─ AuthenticationService                          │  │
│  │  └─ AGTIntegrationService                          │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Data Access Layer (ORM)                            │  │
│  │  ├─ InvoiceRepository                              │  │
│  │  ├─ UserRepository                                 │  │
│  │  ├─ ValidationLogRepository                        │  │
│  │  └─ DocumentSeriesRepository                       │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Database Layer (PostgreSQL/MySQL)                  │  │
│  │  ├─ invoices                                       │  │
│  │  ├─ invoice_lines                                  │  │
│  │  ├─ invoice_taxes                                  │  │
│  │  ├─ users                                          │  │
│  │  ├─ validation_logs                                │  │
│  │  ├─ document_series                                │  │
│  │  └─ audit_logs                                     │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  External Services                                  │  │
│  │  ├─ AGT Validation System                          │  │
│  │  ├─ Email Service                                  │  │
│  │  └─ File Storage (PDF/QR Code)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Autenticação e Autorização

### 2.1 Sistema de Login

```
┌─────────────────────────────────┐
│  Frontend - Login Component     │
│  ├─ Input: email               │
│  ├─ Input: password            │
│  └─ Button: Login              │
└──────────────┬──────────────────┘
               │
               │ POST /api/v1/auth/login
               │ { email, password }
               ▼
┌─────────────────────────────────────────────────┐
│  Backend - AuthController                       │
│                                                 │
│  1. Validar dados de entrada                   │
│  2. Procurar usuário no banco por email        │
│  3. Comparar password (bcrypt)                 │
│  4. Gerar JWT Token                           │
│  5. Retornar Token + User Info                │
└──────────────┬──────────────────────────────────┘
               │
               │ Response 200
               │ {
               │   "token": "eyJhbGciOiJIUzI1NiIs...",
               │   "user": {
               │     "id": "123",
               │     "email": "user@company.com",
               │     "name": "João Silva",
               │     "role": "admin",
               │     "company": {
               │       "taxId": "1234567890123",
               │       "name": "PJ Limitada"
               │     }
               │   },
               │   "expiresIn": 3600
               │ }
               ▼
┌─────────────────────────────────┐
│  Frontend - Store Token         │
│  ├─ localStorage                │
│  ├─ sessionStorage              │
│  └─ HttpClient Header           │
└─────────────────────────────────┘
```

### 2.2 Fluxo de Autorização

```typescript
// Frontend: Interceptor adicionando token em todas requisições
GET /api/v1/invoices
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// Backend: Middleware validando token
┌─────────────────────────────────────────┐
│  JWTValidationMiddleware                │
│  ├─ Extrai token do header              │
│  ├─ Verifica assinatura                 │
│  ├─ Verifica expiração                  │
│  ├─ Anexa userId ao request             │
│  └─ Passa para próximo middleware       │
└──────────────┬───────────────────────────┘
               │
               ├─ Token válido → Continua
               └─ Token inválido → 401 Unauthorized
```

### 2.3 Níveis de Permissão

```typescript
enum UserRole {
  ADMIN = 'admin',              // Gerencia tudo, usuários
  ACCOUNTANT = 'accountant',    // Cria/valida faturas
  SALES = 'sales',             // Emite faturas para vendas
  VIEWER = 'viewer'            // Apenas visualiza
}

// Middleware de Autorização
@Authorize(UserRole.ADMIN, UserRole.ACCOUNTANT)
POST /api/v1/invoices/create

// Somente ADMIN pode:
- Gerenciar usuários
- Acessar relatórios financeiros
- Modificar séries de documentos

// ACCOUNTANT pode:
- Criar/editar/anular faturas
- Visualizar validações
- Gerar relatórios

// SALES pode:
- Criar faturas
- Visualizar próprias faturas
- Descarregar PDF

// VIEWER pode:
- Visualizar faturas
- Descarregar PDF
```

---

## 3. Schema Completo do Banco de Dados

### 3.1 Tabela: users

```sql
CREATE TABLE users (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Dados pessoais
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Relacionamento com empresa
  company_id VARCHAR(36) NOT NULL,
  
  -- Função/Permissões
  role ENUM('admin', 'accountant', 'sales', 'viewer') DEFAULT 'viewer',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Índices
  FOREIGN KEY (company_id) REFERENCES companies(id),
  INDEX idx_email (email),
  INDEX idx_company_id (company_id),
  INDEX idx_active (is_active)
);
```

### 3.2 Tabela: companies

```sql
CREATE TABLE companies (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  tax_registration_number VARCHAR(15) UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  
  -- Contato
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  city VARCHAR(100),
  country VARCHAR(5) DEFAULT 'AO',
  
  -- Software
  software_id VARCHAR(36),
  software_version VARCHAR(20),
  software_validation_number VARCHAR(50),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_expires_at DATE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX idx_tax_number (tax_registration_number),
  INDEX idx_active (is_active)
);
```

### 3.3 Tabela: invoices

```sql
CREATE TABLE invoices (
  -- Identificação
  id VARCHAR(36) PRIMARY KEY,
  document_no VARCHAR(60) UNIQUE NOT NULL,
  document_type VARCHAR(2) NOT NULL, -- FT, FR, NC, etc
  document_date TIMESTAMP NOT NULL,
  
  -- Status
  document_status VARCHAR(1) NOT NULL DEFAULT 'N', -- N, S, A, C, etc
  validation_status VARCHAR(1), -- V, P, null
  
  -- Relacionamentos
  company_id VARCHAR(36) NOT NULL,
  series_id INT NOT NULL,
  created_by_user_id VARCHAR(36) NOT NULL,
  
  -- Dados do Documento
  tax_registration_number VARCHAR(15) NOT NULL,
  
  -- Cliente
  customer_tax_id VARCHAR(15) NOT NULL,
  customer_country VARCHAR(5) NOT NULL DEFAULT 'AO',
  customer_name VARCHAR(200) NOT NULL,
  
  -- Totalizações
  net_total DECIMAL(15, 2) NOT NULL,
  tax_total DECIMAL(15, 2) NOT NULL,
  gross_total DECIMAL(15, 2) NOT NULL,
  
  -- Assinatura e Rastreamento
  jws_signature TEXT NOT NULL,
  qr_code_data TEXT,
  qr_code_image MEDIUMBLOB, -- Imagem PNG do QR Code
  
  -- Submissão para AGT
  agt_submission_id VARCHAR(36),
  agt_submitted_at TIMESTAMP,
  agt_validation_date TIMESTAMP,
  agt_rejection_reason TEXT,
  
  -- Referência (para NC/ND)
  reference_invoice_id VARCHAR(36),
  cancellation_reason VARCHAR(500),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  submitted_at TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (series_id) REFERENCES document_series(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (reference_invoice_id) REFERENCES invoices(id),
  
  INDEX idx_document_no (document_no),
  INDEX idx_company_id (company_id),
  INDEX idx_customer_tax_id (customer_tax_id),
  INDEX idx_status (document_status),
  INDEX idx_validation_status (validation_status),
  INDEX idx_created_at (created_at),
  UNIQUE KEY uk_document_company (document_no, company_id)
);
```

### 3.4 Tabela: invoice_lines

```sql
CREATE TABLE invoice_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(36) NOT NULL,
  line_number INT NOT NULL,
  
  -- Produto/Serviço
  product_code VARCHAR(60) NOT NULL,
  product_description VARCHAR(200) NOT NULL,
  category_code VARCHAR(20), -- SPARE_PARTS, BODYKIT, VEHICLE_IMPORT
  
  -- Quantidades e Preços
  quantity DECIMAL(10, 3) NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  unit_price_base DECIMAL(15, 2) NOT NULL, -- Após descontos
  
  -- Descontos/Encargos
  discount_amount DECIMAL(15, 2),
  discount_percentage DECIMAL(5, 2),
  
  -- Totais da Linha
  line_subtotal DECIMAL(15, 2) NOT NULL,
  line_tax_total DECIMAL(15, 2) NOT NULL,
  line_total DECIMAL(15, 2) NOT NULL,
  
  -- Débito/Crédito
  debit_amount DECIMAL(15, 2),
  credit_amount DECIMAL(15, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_line_number (invoice_id, line_number)
);
```

### 3.5 Tabela: invoice_taxes

```sql
CREATE TABLE invoice_taxes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  line_id INT NOT NULL,
  
  -- Tipo de Imposto
  tax_type VARCHAR(3) NOT NULL, -- IVA, IS, IEC, NS
  tax_code VARCHAR(10) NOT NULL, -- NOR, INT, RED, ISE, etc
  
  -- Localização do Imposto
  tax_country_region VARCHAR(10) NOT NULL DEFAULT 'AO', -- AO, AO-CAB, etc
  
  -- Valores
  tax_base DECIMAL(15, 2) NOT NULL,
  tax_percentage DECIMAL(5, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) NOT NULL,
  tax_contribution DECIMAL(15, 2),
  
  -- Isenção
  tax_exemption_code VARCHAR(3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (line_id) REFERENCES invoice_lines(id) ON DELETE CASCADE,
  INDEX idx_line_id (line_id),
  INDEX idx_tax_type (tax_type)
);
```

### 3.6 Tabela: document_series

```sql
CREATE TABLE document_series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  
  -- Identificação da Série
  series_code VARCHAR(60) NOT NULL,
  series_year INT NOT NULL,
  document_type VARCHAR(2) NOT NULL,
  
  -- Numeração
  first_document_number INT NOT NULL,
  current_number INT NOT NULL,
  last_document_number INT,
  
  -- Status
  series_status VARCHAR(1) NOT NULL DEFAULT 'A', -- A (Aberta), U (Uso), F (Fechada)
  
  -- AGT
  agt_request_id VARCHAR(36),
  agt_requested_at TIMESTAMP,
  agt_approved_at TIMESTAMP,
  agt_approval_number VARCHAR(50),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY uk_series (company_id, series_code, series_year),
  INDEX idx_company_id (company_id),
  INDEX idx_document_type (document_type),
  INDEX idx_status (series_status)
);
```

### 3.7 Tabela: validation_logs

```sql
CREATE TABLE validation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  
  -- Ação de Validação
  action VARCHAR(50) NOT NULL, -- CREATED, SUBMITTED, VALIDATED, REJECTED, CANCELLED
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Resultado
  validation_status VARCHAR(1), -- V, P, RJ, null
  status_message VARCHAR(500),
  
  -- Resultado da AGT
  agt_response_code INT,
  agt_response_message TEXT,
  agt_submission_id VARCHAR(36),
  
  -- Usuário que realizou ação
  performed_by_user_id VARCHAR(36),
  
  -- IP/User Agent (segurança)
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (performed_by_user_id) REFERENCES users(id),
  
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_company_id (company_id),
  INDEX idx_action_date (action_date)
);
```

### 3.8 Tabela: audit_logs (Auditoria Geral)

```sql
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- Rastreamento
  entity_type VARCHAR(50) NOT NULL, -- Invoice, User, DocumentSeries
  entity_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  
  -- Ação
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, CANCEL
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Dados Anteriores/Novos
  old_values JSON,
  new_values JSON,
  changes_summary VARCHAR(500),
  
  -- Usuário
  performed_by_user_id VARCHAR(36),
  
  -- Contexto
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  session_id VARCHAR(100),
  
  -- Segurança
  is_sensitive BOOLEAN DEFAULT false,
  
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (performed_by_user_id) REFERENCES users(id),
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_company_id (company_id),
  INDEX idx_action_date (action_date)
);
```

### 3.9 Tabela: tax_rates (Configuração de Impostos)

```sql
CREATE TABLE tax_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Identificação
  tax_type VARCHAR(3) NOT NULL, -- IVA, IEC, IS, NS
  tax_code VARCHAR(10) NOT NULL, -- NOR, INT, RED, ISE, etc
  
  -- Valores
  percentage DECIMAL(5, 2) NOT NULL,
  
  -- Aplicação
  applicable_to_categories VARCHAR(255), -- JSON array de categorias
  country VARCHAR(5) DEFAULT 'AO',
  
  -- Data de Validade
  valid_from DATE NOT NULL,
  valid_to DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Descrição
  description VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE KEY uk_tax_rate (tax_type, tax_code, country, valid_from),
  INDEX idx_active (is_active),
  INDEX idx_valid_from (valid_from)
);
```

### 3.10 Diagrama de Relacionamentos

```
                    ┌─────────────┐
                    │  companies  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┬──────────────┐
            │              │              │              │
            ▼              ▼              ▼              ▼
        ┌────────┐    ┌─────────┐  ┌──────────┐  ┌──────────────┐
        │ users  │    │invoices │  │document_ │  │  tax_rates   │
        └───┬────┘    └────┬────┘  │series    │  └──────────────┘
            │              │       └──────────┘
            │        ┌─────┴────────┐
            │        │              │
            │        ▼              ▼
            │   ┌──────────────┐ ┌─────────────────┐
            │   │invoice_lines │ │validation_logs  │
            │   └──────┬───────┘ └────────┬────────┘
            │          │                  │
            │          ▼                  │
            │   ┌──────────────┐         │
            │   │invoice_taxes │         │
            │   └──────────────┘         │
            │                            │
            └────────────────────────────┘
```

---

## 4. Endpoints da API REST

### 4.1 Autenticação

```
┌────────────────────────────────────────────────────┐
│ POST /api/v1/auth/login                           │
├────────────────────────────────────────────────────┤
│ Request:                                           │
│ {                                                  │
│   "email": "usuario@empresa.com",                 │
│   "password": "senha123",                         │
│   "rememberMe": true                              │
│ }                                                  │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...", │
│   "refreshToken": "rt_...",                       │
│   "expiresIn": 3600,                              │
│   "user": {                                        │
│     "id": "uuid",                                 │
│     "email": "usuario@empresa.com",               │
│     "fullName": "João Silva",                     │
│     "role": "accountant",                         │
│     "company": {                                  │
│       "id": "uuid",                               │
│       "taxId": "1234567890123",                   │
│       "name": "PJ Limitada"                       │
│     }                                             │
│   }                                               │
│ }                                                  │
│                                                    │
│ Response 401:                                      │
│ {                                                  │
│   "success": false,                               │
│   "error": "INVALID_CREDENTIALS",                 │
│   "message": "Email ou senha incorretos"          │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ POST /api/v1/auth/refresh                         │
├────────────────────────────────────────────────────┤
│ Request:                                           │
│ {                                                  │
│   "refreshToken": "rt_..."                        │
│ }                                                  │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "token": "eyJhbGc...",                          │
│   "expiresIn": 3600                               │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ POST /api/v1/auth/logout                          │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "message": "Desconectado com sucesso"           │
│ }                                                  │
└────────────────────────────────────────────────────┘
```

### 4.2 Faturas - CRUD

```
┌────────────────────────────────────────────────────────┐
│ POST /api/v1/invoices                                 │
├────────────────────────────────────────────────────────┤
│ Headers:                                              │
│   Authorization: Bearer <token>                       │
│   Content-Type: application/json                      │
│                                                        │
│ Request Body:                                         │
│ {                                                     │
│   "documentType": "FT",                              │
│   "customer": {                                      │
│     "taxId": "123456789012345",                      │
│     "country": "AO",                                 │
│     "companyName": "Cliente SARL"                    │
│   },                                                 │
│   "lines": [                                         │
│     {                                                │
│       "productCode": "PECA-001",                     │
│       "productDescription": "Filtro de Ar Original", │
│       "quantity": 2,                                 │
│       "unitOfMeasure": "UN",                         │
│       "unitPrice": 45000,                           │
│       "unitPriceBase": 45000,                       │
│       "categoryCode": "SPARE_PARTS"                 │
│     }                                                │
│   ]                                                  │
│ }                                                     │
│                                                        │
│ Response 201:                                        │
│ {                                                     │
│   "success": true,                                  │
│   "data": {                                          │
│     "invoiceId": "550e8400-e29b-41d4-a716...",     │
│     "documentNo": "FAT-2025-000001",                │
│     "documentType": "FT",                           │
│     "documentDate": "2025-05-27T14:30:00+01:00",   │
│     "documentStatus": "N",                          │
│     "customer": { ... },                            │
│     "lines": [ ... ],                               │
│     "documentTotals": {                             │
│       "netTotal": 90000,                            │
│       "taxPayable": 12600,                          │
│       "grossTotal": 102600,                         │
│       "currency": {                                 │
│         "currencyCode": "AOA",                      │
│         "currencyAmount": 102600,                   │
│         "exchangeRate": 1.0                         │
│       }                                             │
│     },                                              │
│     "jwsSignature": "eyJhbGciOi...",              │
│     "qrCodeData": "https://portaldocontribuinte..." │
│   },                                                 │
│   "message": "Fatura criada com sucesso"           │
│ }                                                     │
│                                                        │
│ Response 400:                                        │
│ {                                                     │
│   "success": false,                                 │
│   "error": "VALIDATION_ERROR",                      │
│   "details": [                                       │
│     {                                                │
│       "field": "customer.taxId",                    │
│       "message": "NIF deve ter 15 dígitos"         │
│     }                                                │
│   ]                                                  │
│ }                                                     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ GET /api/v1/invoices/:invoiceId                   │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": { ... invoiceObject ... }               │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ GET /api/v1/invoices                              │
├────────────────────────────────────────────────────┤
│ Query Parameters:                                  │
│   ?page=1&limit=20                                │
│   &startDate=2025-05-01                           │
│   &endDate=2025-05-31                             │
│   &documentType=FT                                │
│   &validationStatus=V                             │
│   &sortBy=documentDate&sortOrder=desc             │
│                                                    │
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": {                                       │
│     "items": [ ... ],                             │
│     "pagination": {                               │
│       "page": 1,                                  │
│       "limit": 20,                                │
│       "total": 150,                               │
│       "pages": 8,                                 │
│       "hasMore": true                             │
│     }                                             │
│   }                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ PUT /api/v1/invoices/:invoiceId/cancel            │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Request Body:                                      │
│ {                                                  │
│   "reason": "Erro na emissão do documento"        │
│ }                                                  │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": {                                       │
│     "originalInvoiceId": "...",                   │
│     "creditNoteId": "...",                        │
│     "creditNoteNo": "NC-2025-000001",             │
│     "message": "Fatura anulada com sucesso"       │
│   }                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘
```

### 4.3 Validação e Status

```
┌────────────────────────────────────────────────────┐
│ GET /api/v1/validation/status/:invoiceId          │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": {                                       │
│     "invoiceId": "...",                           │
│     "documentNo": "FAT-2025-000001",              │
│     "documentStatus": "N",                        │
│     "validationStatus": "V",                      │
│     "submittedToAGT": true,                       │
│     "agtSubmissionDate": "2025-05-28T10:00:00", │
│     "agtValidationDate": "2025-05-28T15:30:00",  │
│     "validationHistory": [                        │
│       {                                           │
│         "action": "CREATED",                      │
│         "date": "2025-05-27T14:30:00",            │
│         "status": "N",                            │
│         "performer": "João Silva"                 │
│       },                                          │
│       {                                           │
│         "action": "SUBMITTED",                    │
│         "date": "2025-05-28T10:00:00",            │
│         "status": "N",                            │
│         "agtSubmissionId": "..."                  │
│       },                                          │
│       {                                           │
│         "action": "VALIDATED",                    │
│         "date": "2025-05-28T15:30:00",            │
│         "status": "V",                            │
│         "message": "Fatura válida"                │
│       }                                           │
│     ]                                             │
│   }                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ POST /api/v1/validation/submit-to-agt             │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Request Body:                                      │
│ {                                                  │
│   "invoiceIds": ["uuid1", "uuid2"]                │
│ }                                                  │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": {                                       │
│     "submitted": 2,                               │
│     "failed": 0,                                  │
│     "submissions": [                              │
│       {                                           │
│         "invoiceId": "uuid1",                     │
│         "agtSubmissionId": "...",                 │
│         "submittedAt": "2025-05-28T10:00:00"     │
│       }                                           │
│     ]                                             │
│   }                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘
```

### 4.4 Séries de Documentos

```
┌────────────────────────────────────────────────────┐
│ GET /api/v1/document-series                       │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│                                                    │
│ Response 200:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": [                                       │
│     {                                             │
│       "id": 1,                                    │
│       "seriesCode": "FAT",                        │
│       "seriesYear": 2025,                         │
│       "documentType": "FT",                       │
│       "firstDocumentNumber": 1,                   │
│       "currentNumber": 5,                         │
│       "lastDocumentNumber": null,                 │
│       "seriesStatus": "A",                        │
│       "createdAt": "2025-01-01T00:00:00",        │
│       "closedAt": null                            │
│     }                                             │
│   ]                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ POST /api/v1/document-series/request              │
├────────────────────────────────────────────────────┤
│ Headers: Authorization: Bearer <token>             │
│ (Apenas ADMIN)                                     │
│                                                    │
│ Request Body:                                      │
│ {                                                  │
│   "seriesCode": "NC",                             │
│   "documentType": "NC",                           │
│   "seriesYear": 2026,                             │
│   "firstDocumentNumber": 1                        │
│ }                                                  │
│                                                    │
│ Response 201:                                      │
│ {                                                  │
│   "success": true,                                │
│   "data": {                                       │
│     "id": 4,                                      │
│     "seriesCode": "NC",                           │
│     "agtRequestId": "req_...",                    │
│     "agtRequestedAt": "2025-05-28T10:00:00",    │
│     "status": "PENDING",                          │
│     "message": "Solicitação enviada para AGT"     │
│   }                                               │
│ }                                                  │
└────────────────────────────────────────────────────┘
```

---

## 5. Fluxo Completo: Frontend → Backend → Validação

### 5.1 Sequência de Chamadas

```
PASSO 1: USUARIO FAZ LOGIN
┌──────────────────────────────┐
│ Frontend                     │
│ usuario@empresa.com          │
│ senha123                     │
└────────────┬──────────────────┘
             │
             ▼ POST /api/v1/auth/login
             
┌──────────────────────────────┐
│ Backend - AuthController     │
│ 1. Validar entrada           │
│ 2. Hash password (bcrypt)    │
│ 3. Procurar user no BD       │
│ 4. Gerar JWT                 │
│ 5. Inserir audit log         │
└────────────┬──────────────────┘
             │
             ▼ Response: Token + User
             
┌──────────────────────────────┐
│ Frontend                     │
│ Armazena token em            │
│ localStorage/sessionStorage  │
│ Redireciona para dashboard   │
└──────────────────────────────┘


PASSO 2: USUARIO CRIA FATURA
┌──────────────────────────────────┐
│ Frontend - Checkout              │
│ 1. Validar dados do cliente     │
│ 2. Calcular impostos (local)    │
│ 3. Preparar JSON com items     │
│ 4. Adicionar token no header   │
└────────────┬────────────────────┘
             │
             ▼ POST /api/v1/invoices
             │ + Bearer Token
             │ + CreateInvoiceDTO
             
┌─────────────────────────────────────┐
│ Backend - InvoiceController         │
│ 1. Validar JWT Token                │
│ 2. Extrair usuário/empresa do token │
│ 3. Validar permissões (SALES/ACC)   │
│ 4. Validar dados de entrada         │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Backend - InvoiceService            │
│ 1. Gerar documentNo (série)         │
│ 2. Calcular impostos (validação)    │
│ 3. Calcular totais                  │
│ 4. Assinar JWS (chave privada)      │
│ 5. Gerar QR Code                    │
│ 6. Persistir no BD                  │
│ 7. Inserir audit log                │
└────────────┬────────────────────────┘
             │
┌────────────▼──────────────────────┐
│ Database                          │
│ INSERT INTO invoices VALUES(...)  │
│ INSERT INTO invoice_lines VALUES()│
│ INSERT INTO invoice_taxes VALUES()│
│ INSERT INTO audit_logs VALUES()   │
└────────────┬──────────────────────┘
             │
             ▼ Response 201
             │ invoiceId, documentNo,
             │ jwsSignature, qrCodeData
             
┌──────────────────────────────────────┐
│ Frontend - CheckoutConfirmation      │
│ 1. Receber invoice                   │
│ 2. Mostrar número da fatura          │
│ 3. Renderizar QR Code                │
│ 4. Oferecr download/impressão        │
│ 5. Oferecer acompanhamento do pedido │
└──────────────────────────────────────┘


PASSO 3: CONSULTAR STATUS DE VALIDAÇÃO
┌──────────────────────────────────┐
│ Frontend - Invoice Details       │
│ Button: "Ver Status de Validação"│
└────────────┬────────────────────┘
             │
             ▼ GET /api/v1/validation/status/:invoiceId
             │ + Bearer Token
             
┌──────────────────────────────────────┐
│ Backend - ValidationController       │
│ 1. Validar JWT                       │
│ 2. Procurar invoice no BD            │
│ 3. Verificar permissões              │
│ 4. Retornar histórico de validação   │
└────────────┬─────────────────────────┘
             │
┌────────────▼──────────────────────┐
│ Database SELECT validation_logs   │
│ WHERE invoice_id = ?              │
└────────────┬──────────────────────┘
             │
             ▼ Response 200
             │ validationStatus,
             │ validationHistory
             
┌────────────────────────────────────┐
│ Frontend - Display Status          │
│ Status: VÁLIDA (V)                 │
│ Validada em: 28/05/2025 15:30     │
│ Histórico:                         │
│ - Criada: 27/05/2025              │
│ - Submetida: 28/05/2025           │
│ - Validada: 28/05/2025            │
└────────────────────────────────────┘


PASSO 4: ANULAR FATURA
┌──────────────────────────────────┐
│ Frontend - Invoice Details       │
│ Button: "Anular Fatura"          │
│ Input: Motivo da anulação        │
└────────────┬────────────────────┘
             │
             ▼ PUT /api/v1/invoices/:invoiceId/cancel
             │ + Bearer Token
             │ { reason: "Erro na emissão" }
             
┌────────────────────────────────────────┐
│ Backend - InvoiceController.cancel()   │
│ 1. Validar JWT                         │
│ 2. Validar permissões                  │
│ 3. Procurar invoice                    │
│ 4. Validar status (não anulado)        │
└────────────┬───────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Backend - InvoiceService.cancel()   │
│ 1. Marcar original como ANULADA     │
│ 2. Criar nota de crédito (NC)       │
│ 3. Gerar documentNo para NC         │
│ 4. Assinar NC                       │
│ 5. Persistir ambos                  │
│ 6. Inserir audit logs               │
└────────────┬────────────────────────┘
             │
┌────────────▼──────────────────────┐
│ Database                          │
│ UPDATE invoices SET status='A'    │
│ INSERT INTO invoices (NC document)│
│ INSERT INTO invoice_lines (NC)    │
│ INSERT INTO audit_logs            │
└────────────┬──────────────────────┘
             │
             ▼ Response 200
             │ creditNoteId, creditNoteNo
             │ originalInvoiceId
             
┌──────────────────────────────────┐
│ Frontend - Display Success       │
│ "Fatura anulada com sucesso"    │
│ "Nota de crédito: NC-2025-001" │
│ Links:                          │
│ - Ver original                  │
│ - Descarregar NC               │
└──────────────────────────────────┘
```

---

## 6. Validação de Regras de Negócio

### 6.1 Validações no Backend

```typescript
class InvoiceValidator {
  
  // 1. VALIDAÇÃO DE ENTRADA
  validateCreateRequest(dto: CreateInvoiceDTO): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Cliente
    if (!dto.customer.taxId || dto.customer.taxId.length !== 15) {
      errors.push({
        field: 'customer.taxId',
        message: 'NIF deve ter 15 dígitos para residentes'
      });
    }
    
    if (!this.isValidCountry(dto.customer.country)) {
      errors.push({
        field: 'customer.country',
        message: 'País inválido'
      });
    }
    
    // Linhas
    if (!dto.lines || dto.lines.length === 0) {
      errors.push({
        field: 'lines',
        message: 'Fatura deve ter pelo menos uma linha'
      });
    }
    
    return errors;
  }
  
  // 2. VALIDAÇÃO DE REGRAS DE NEGÓCIO
  validateInvoiceRules(invoice: Invoice): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Total não pode ser zero
    if (invoice.documentTotals.grossTotal <= 0) {
      errors.push({
        field: 'documentTotals.grossTotal',
        message: 'Total da fatura deve ser maior que zero'
      });
    }
    
    // Não pode criar fatura de um cliente inativo
    // Verificar se empresa é válida
    // Verificar se série está ativa
    
    return errors;
  }
  
  // 3. VALIDAÇÃO DE IMPOSTOS
  validateTaxes(invoice: Invoice): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Cada linha deve ter impostos
    // Validar percentuais de imposto
    // Validar cálculo de impostos
    
    return errors;
  }
  
  // 4. VALIDAÇÃO DE ESTADO
  validateStatusTransition(
    currentStatus: DocumentStatus,
    newStatus: DocumentStatus
  ): boolean {
    const validTransitions: Record<DocumentStatus, DocumentStatus[]> = {
      'N': ['S', 'A', 'C'],  // Normal → Autofact, Anulada, Corrigida
      'S': ['A'],             // Autofact → Anulada
      'A': [],                // Anulada → final
      'C': [],                // Corrigida → final
      'V': ['A'],             // Válida → Anulada
      'P': ['A'],             // Penalizada → Anulada
      'RJ': []                // Rejeitada → final
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
```

### 6.2 Fluxo de Validação de Fatura

```
┌─────────────────────────────────┐
│ Receber CreateInvoiceDTO        │
└────────────┬────────────────────┘
             │
             ▼ 1. VALIDAÇÃO DE ENTRADA
     ┌───────────────────────┐
     │ ├─ NIF válido?       │
     │ ├─ País válido?      │
     │ ├─ Linhas presentes? │
     │ └─ Campos obrig.?    │
     └───────────┬───────────┘
                 │
            Sim  │  Não → Erro 400
                 ▼
             ┌─────────────────────────────┐
             │ 2. VALIDAÇÃO DE NEGÓCIO     │
             │ ├─ Cliente ativo?          │
             │ ├─ Empresa ativa?          │
             │ ├─ Série ativa?            │
             │ ├─ Usuário tem permissão?  │
             │ └─ Total > 0?              │
             └─────────┬───────────────────┘
                       │
                  Sim  │  Não → Erro 400
                       ▼
            ┌──────────────────────────┐
            │ 3. CALCULAR IMPOSTOS     │
            │ ├─ IVA por categoria     │
            │ ├─ IEC (se aplicável)    │
            │ ├─ Validar percentuais   │
            │ └─ Somar totais          │
            └──────────┬───────────────┘
                       │
                  OK   │
                       ▼
            ┌──────────────────────────┐
            │ 4. GERAR DOCUMENTO       │
            │ ├─ documentNo            │
            │ ├─ UUID único            │
            │ ├─ Timestamp ISO 8601    │
            │ └─ JWS signature         │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │ 5. PERSISTIR NO BD       │
            │ ├─ INSERT invoices       │
            │ ├─ INSERT invoice_lines  │
            │ ├─ INSERT invoice_taxes  │
            │ └─ INSERT audit_logs     │
            └──────────┬───────────────┘
                       │
                  OK   │
                       ▼
            ┌──────────────────────────┐
            │ 6. RETORNAR SUCCESS      │
            │ Response 201             │
            │ Invoice Object           │
            └──────────────────────────┘
```

---

## 7. Segurança e Autenticação

### 7.1 JWT Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpvb... 
    .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

┌─────────────────────────────────────────────┐
│ HEADER                                      │
├─────────────────────────────────────────────┤
│ {                                           │
│   "alg": "HS256",                          │
│   "typ": "JWT"                             │
│ }                                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PAYLOAD                                     │
├─────────────────────────────────────────────┤
│ {                                           │
│   "sub": "user_id_uuid",                   │
│   "email": "usuario@empresa.com",          │
│   "fullName": "João Silva",                │
│   "companyId": "company_uuid",             │
│   "role": "accountant",                    │
│   "iat": 1685193600,  (Issued at)          │
│   "exp": 1685197200,  (Expiration: 1h)    │
│   "iss": "pj-limitada-faturacao"           │
│ }                                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ SIGNATURE                                   │
├─────────────────────────────────────────────┤
│ HMACSHA256(                                 │
│   base64UrlEncode(header) + "." +          │
│   base64UrlEncode(payload),                │
│   secret_key                               │
│ )                                           │
└─────────────────────────────────────────────┘
```

### 7.2 Fluxo de Autenticação

```
┌────────────────┐
│  Login Form    │
│ email/password │
└────────┬───────┘
         │
         ▼ POST /api/v1/auth/login
         
┌──────────────────────────────────┐
│  AuthController.login()          │
│ 1. Validar schema                │
│ 2. Procurar usuário por email    │
│ 3. Comparar hash de password     │
│    bcrypt.compare(pwd, hash)     │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │          │
Erro│      OK │
    │         ▼
    │   ┌──────────────────────┐
    │   │ Gerar JWT            │
    │   │ sign({payload}, key) │
    │   └────────┬─────────────┘
    │            │
    │            ▼
    │   ┌───────────────────────┐
    │   │ Inserir Audit Log     │
    │   │ action: LOGIN         │
    │   │ ip, user_agent        │
    │   └────────┬──────────────┘
    │            │
    │            ▼
    │   ┌──────────────────────┐
    │   │ Response 200         │
    │   │ token, user, expires │
    │   └──────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ Response 401             │
│ INVALID_CREDENTIALS      │
│ Message: Email ou senha  │
│          incorretos      │
└──────────────────────────┘
```

---

## 8. Padrões de Resposta da API

### 8.1 Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "invoiceId": "550e8400-e29b-41d4-a716-446655440000",
    "documentNo": "FAT-2025-000001",
    "documentType": "FT",
    "documentDate": "2025-05-27T14:30:00+01:00",
    "documentStatus": "N",
    "documentTotals": {
      "netTotal": 1000000,
      "taxPayable": 140000,
      "grossTotal": 1140000,
      "currency": {
        "currencyCode": "AOA",
        "currencyAmount": 1140000,
        "exchangeRate": 1.0
      }
    },
    "jwsSignature": "eyJhbGciOiJSUzI1NiIs...",
    "qrCodeData": "https://portaldocontribuinte.minfin.gov.ao/...",
    "createdAt": "2025-05-27T14:30:00+01:00",
    "validationStatus": null
  },
  "message": "Fatura criada com sucesso",
  "timestamp": "2025-05-27T14:30:00+01:00"
}
```

### 8.2 Resposta de Erro - Validação

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "customer.taxId",
      "message": "NIF deve ter 15 dígitos",
      "code": "INVALID_LENGTH",
      "value": "12345"
    },
    {
      "field": "lines[0].quantity",
      "message": "Quantidade deve ser maior que zero",
      "code": "MIN_VALUE",
      "value": 0
    }
  ],
  "message": "Validação falhou",
  "timestamp": "2025-05-27T14:30:00+01:00"
}
```

### 8.3 Resposta de Erro - Autenticação

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Token inválido ou expirado",
  "code": "INVALID_TOKEN",
  "timestamp": "2025-05-27T14:30:00+01:00"
}
```

### 8.4 Resposta de Erro - Permissão

```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Você não tem permissão para acessar este recurso",
  "requiredRole": "admin",
  "userRole": "sales",
  "timestamp": "2025-05-27T14:30:00+01:00"
}
```

---

## 9. Comportamento do Backend em Detalhes

### 9.1 Criar Fatura - Passo a Passo

```
REQUEST:
POST /api/v1/invoices
{
  documentType: "FT",
  customer: { taxId: "123456789012345", country: "AO", companyName: "..." },
  lines: [{ productCode: "PECA-001", ... }]
}

═══════════════════════════════════════════════════════════════

PROCESSAMENTO NO BACKEND:

1️⃣  VALIDAR TOKEN
   ├─ Extrair Bearer token do header
   ├─ Decodificar JWT
   ├─ Verificar assinatura
   ├─ Verificar expiração
   └─ Extrair userId e companyId

2️⃣  VALIDAR PERMISSÕES
   ├─ Procurar usuário no BD
   ├─ Verificar role (SALES ou ACCOUNTANT)
   └─ Se role == VIEWER → Erro 403

3️⃣  VALIDAR ENTRADA
   ├─ Validar documentType (FT, FR, FA, etc)
   ├─ Validar customer.taxId (15 dígitos)
   ├─ Validar customer.country (ISO code)
   ├─ Validar lines (array não vazio)
   ├─ Validar cada linha:
   │  ├─ productCode (não vazio)
   │  ├─ quantity > 0
   │  ├─ unitPrice >= 0
   │  └─ unitOfMeasure válido
   └─ Se erro → Response 400 com detalhes

4️⃣  VALIDAR REGRAS DE NEGÓCIO
   ├─ Procurar empresa no BD
   ├─ Verificar if empresa is_active
   ├─ Procurar serie ativa para documentType
   ├─ Verificar if serie status == 'A'
   ├─ Verificar if cliente é válido
   └─ Se erro → Response 400

5️⃣  CALCULAR IMPOSTOS
   ├─ Para cada linha:
   │  ├─ Determinar categoria do produto
   │  ├─ Buscar taxa de IVA na tabela
   │  ├─ Calcular: line_tax = quantity × unitPrice × iva%
   │  ├─ Verificar IEC (se aplicável)
   │  └─ Armazenar TaxDetail[]
   ├─ Somar taxas: total_tax = SUM(line_tax)
   ├─ Calcular netto: total_netto = SUM(quantity × unitPrice)
   └─ Calcular brutto: brutto = netto + total_tax

6️⃣  GERAR DOCUMENTO
   ├─ Gerar UUID: invoiceId = uuid()
   ├─ Gerar documentNo:
   │  ├─ SELECT currentNumber FROM document_series
   │  ├─ Format: seriesCode + currentNumber
   │  └─ documentNo = "FAT-2025-000001"
   ├─ Timestamp: submissionTimeStamp = now() ISO 8601
   └─ Status: documentStatus = 'N' (Normal)

7️⃣  ASSINAR DIGITALMENTE
   ├─ Extrair campos para assinatura:
   │  ├─ documentNo
   │  ├─ documentDate
   │  ├─ customer info
   │  ├─ lines info
   │  └─ totals
   ├─ Serializar para JSON
   ├─ Hash: sha256(json)
   ├─ Assinar: RSA.sign(hash, private_key)
   └─ Formato JWS: header.payload.signature

8️⃣  GERAR QR CODE
   ├─ Dados: documentNo, taxId, customer.taxId
   ├─ URL: https://portaldocontribuinte.../consultar-fe?...
   ├─ Encoder: QR Code Model 2
   ├─ Nível correção: M (15%)
   └─ Output: Base64 ou PNG blob

9️⃣  PERSISTIR NO BANCO
   ├─ BEGIN TRANSACTION
   ├─ INSERT INTO invoices (
   │    id, document_no, document_type, ...
   │  ) VALUES (...)
   ├─ Get invoice_id for next step
   ├─ INSERT INTO invoice_lines (
   │    invoice_id, line_number, product_code, ...
   │  ) VALUES (...)
   ├─ INSERT INTO invoice_taxes (
   │    line_id, tax_type, tax_amount, ...
   │  ) VALUES (...)
   ├─ UPDATE document_series
   │    SET current_number = current_number + 1
   │    WHERE id = :seriesId
   ├─ INSERT INTO audit_logs (
   │    entity_type='Invoice', action='CREATE', ...
   │  )
   ├─ COMMIT TRANSACTION
   └─ Se erro → ROLLBACK

🔟 VALIDAR DADOS PERSISTIDOS
   ├─ SELECT invoice FROM invoices WHERE id = :invoiceId
   ├─ Verificar integridade dos dados
   ├─ Contar linhas vs linhas enviadas
   └─ Validar totals

1️⃣1️⃣ RESPONDER CLIENT
   └─ Response 201
      {
        success: true,
        data: {
          invoiceId: "550e8400-...",
          documentNo: "FAT-2025-000001",
          documentStatus: "N",
          documentTotals: { netTotal, taxPayable, grossTotal },
          jwsSignature: "eyJhbGc...",
          qrCodeData: "https://...",
          createdAt: "2025-05-27T14:30:00+01:00",
          validationStatus: null
        }
      }

═══════════════════════════════════════════════════════════════
```

---

## 10. Diagrama Completo Frontend ↔ Backend

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND (Angular)                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐                 │
│  │  AuthGuard       │  │  HttpInterceptor │  │  Service Layer       │                 │
│  │                  │  │                  │  │                      │                 │
│  │ Verifica se tem  │  │ Adiciona token   │  │ createInvoice()      │                 │
│  │ token válido     │  │ em cada request  │  │ getInvoices()        │                 │
│  │ antes de acessar │  │ Intercepta 401   │  │ getValidationStatus()│                 │
│  │ rota             │  │ e faz refresh    │  │ cancelInvoice()      │                 │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘                 │
│          │                      │                       │                              │
│          │ Guards               │ HTTP Calls            │ Business Logic               │
│          └──────────────────┬───┴───────────────────────┘                              │
│                             │                                                          │
│  ┌────────────────┐        │      ┌──────────────────────────┐                        │
│  │ Components     │────────┼─────→│ State Management         │                        │
│  │ CheckoutForm   │        │      │ (NgRx/Signal/Service)    │                        │
│  │ InvoiceList    │        │      │                          │                        │
│  │ InvoiceView    │        │      │ invoices$: BehaviorSubj  │                        │
│  └────────────────┘        │      │ currentInvoice$          │                        │
│          ▲                  │      │ validationStatus$        │                        │
│          │                  │      └──────────────────────────┘                        │
│          │                  │              │                                           │
│          └──────────────────┼──────────────┘                                           │
│                             │                                                          │
│                             ▼ HTTP/HTTPS                                              │
│                                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                            ┌───────┴───────┐
                            │ API GATEWAY   │
                            │ (CORS allowed)│
                            └───────┬───────┘
                                    │
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND (Node.js / .NET)                               │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────┐      │
│  │  HTTP Handlers / Routes                                                      │      │
│  │                                                                              │      │
│  │  POST   /api/v1/auth/login                    → AuthController.login()      │      │
│  │  POST   /api/v1/auth/refresh                  → AuthController.refresh()    │      │
│  │  POST   /api/v1/invoices                      → InvoiceController.create()  │      │
│  │  GET    /api/v1/invoices/:id                  → InvoiceController.getOne()  │      │
│  │  GET    /api/v1/invoices                      → InvoiceController.list()    │      │
│  │  PUT    /api/v1/invoices/:id/cancel           → InvoiceController.cancel()  │      │
│  │  GET    /api/v1/validation/status/:invoiceId  → ValidationController.status()│     │
│  │  POST   /api/v1/document-series/request       → SeriesController.request()  │      │
│  └──────────────────────┬───────────────────────────────────────────────────────┘      │
│                         │                                                             │
│  ┌──────────────────────▼──────────────────────────────────────────────────────┐      │
│  │  Middleware Stack                                                          │      │
│  │                                                                            │      │
│  │  1. Error Handling                                                        │      │
│  │  2. Request Logging                                                       │      │
│  │  3. CORS                                                                  │      │
│  │  4. Body Parser (JSON)                                                    │      │
│  │  5. JWT Validation                                                        │      │
│  │  6. Role-Based Authorization                                             │      │
│  │  7. Request Validation                                                    │      │
│  └──────────────────────┬───────────────────────────────────────────────────────┘      │
│                         │                                                             │
│  ┌──────────────────────▼──────────────────────────────────────────────────────┐      │
│  │  Business Logic Services                                                   │      │
│  │                                                                            │      │
│  │  • AuthService          → Login, Refresh, Logout                          │      │
│  │  • InvoiceService       → CRUD, Calculations                              │      │
│  │  • TaxCalculatorService → IVA, IEC, IS Calculations                       │      │
│  │  • ValidationService    → AGT Integration                                 │      │
│  │  • DocumentSeriesService → Series Management                              │      │
│  │  • DigitalSignatureService → JWS Signing                                  │      │
│  │  • QRCodeService        → QR Code Generation                              │      │
│  │  • EmailService         → Notifications (future)                          │      │
│  └──────────────────────┬───────────────────────────────────────────────────────┘      │
│                         │                                                             │
│  ┌──────────────────────▼──────────────────────────────────────────────────────┐      │
│  │  Data Access Layer (Repositories)                                          │      │
│  │                                                                            │      │
│  │  • InvoiceRepository     → SELECT, INSERT, UPDATE                         │      │
│  │  • UserRepository        → User CRUD                                      │      │
│  │  • CompanyRepository     → Company Data                                   │      │
│  │  • ValidationLogRepository → Audit Trail                                  │      │
│  │  • DocumentSeriesRepository → Series Data                                 │      │
│  │  • TaxRateRepository     → Tax Rates                                      │      │
│  └──────────────────────┬───────────────────────────────────────────────────────┘      │
│                         │                                                             │
│  ┌──────────────────────▼──────────────────────────────────────────────────────┐      │
│  │  Database Layer                                                            │      │
│  │                                                                            │      │
│  │  PostgreSQL / MySQL                                                       │      │
│  │                                                                            │      │
│  │  Tables:                                                                  │      │
│  │  • users                     • invoices                                   │      │
│  │  • companies                 • invoice_lines                              │      │
│  │  • document_series           • invoice_taxes                              │      │
│  │  • tax_rates                 • validation_logs                            │      │
│  │  • audit_logs                                                             │      │
│  └──────────────────────┬───────────────────────────────────────────────────────┘      │
│                         │                                                             │
│  ┌──────────────────────▼──────────────────────────────────────────────────────┐      │
│  │  External Services                                                         │      │
│  │                                                                            │      │
│  │  • AGT Validation API  → Submit/Check Invoice Status                     │      │
│  │  • Email Service       → Send Confirmations (future)                     │      │
│  │  • File Storage        → Store QR Code Images                            │      │
│  │  • Signature Service   → Manage Signing Keys (HSM)                       │      │
│  └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

**Este documento forma a base técnica completa do sistema backend!**

