# Arquitetura Visual do Sistema de Faturação

## 1. Estrutura de Módulos Angular

```
┌─────────────────────────────────────────────────────────────────┐
│                    APP MODULE                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHECKOUT MODULE (Existente)                           │  │
│  │  └─ checkout.service.ts → invoiceService.create()      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INVOICING MODULE (Novo)                               │  │
│  │                                                          │  │
│  │  ┌─ Models/                                            │  │
│  │  │  ├─ invoice.model.ts                                │  │
│  │  │  ├─ tax.model.ts                                    │  │
│  │  │  └─ document-series.model.ts                        │  │
│  │  │                                                      │  │
│  │  ├─ Services/                                          │  │
│  │  │  ├─ invoice.service.ts (Orchestrator)              │  │
│  │  │  ├─ tax-calculator.service.ts                       │  │
│  │  │  ├─ digital-signature.service.ts (JWS)            │  │
│  │  │  ├─ document-series.service.ts                      │  │
│  │  │  ├─ agt-integration.service.ts (AGT API)          │  │
│  │  │  └─ qrcode.service.ts                              │  │
│  │  │                                                      │  │
│  │  ├─ Components/                                        │  │
│  │  │  ├─ invoice-form/ (Criar fatura manual)            │  │
│  │  │  ├─ invoice-view/ (Visualizar)                     │  │
│  │  │  ├─ invoice-list/ (Listar)                         │  │
│  │  │  ├─ invoice-preview/ (Pré-visualizar)              │  │
│  │  │  └─ tax-summary/ (Resumo de impostos)              │  │
│  │  │                                                      │  │
│  │  └─ Utils/                                            │  │
│  │     ├─ invoice-generator.ts                            │  │
│  │     ├─ validators.ts                                   │  │
│  │     └─ formatters.ts                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ORDER TRACKING MODULE (Existente - Extendido)        │  │
│  │  └─ Agora mostra referência à fatura                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Dados - Checkout com Faturação

```
┌──────────────────┐
│  CARRINHO        │
│  de Compras      │
└────────┬─────────┘
         │
         │ { items, qty, prices }
         ▼
┌──────────────────────────────────────────────┐
│  CHECKOUT                                    │
│  Component                                   │
│  ├─ Validar dados do cliente                │
│  ├─ Obter dados de pagamento               │
│  └─ Chamar CheckoutService.complete()      │
└────────┬─────────────────────────────────────┘
         │
         │ { cartItems, customerData }
         ▼
┌──────────────────────────────────────────────┐
│  CHECKOUT SERVICE                            │
│                                              │
│  1. Processar Pagamento                     │
│     └─ Validar cartão/transferência         │
│                                              │
│  2. Mapear para CreateInvoiceDTO            │
│     └─ Converter items → invoiceLines       │
└────────┬─────────────────────────────────────┘
         │
         │ { documentType, customer, lines }
         ▼
┌──────────────────────────────────────────────┐
│  INVOICE SERVICE                             │
│  createInvoiceFromCheckout()                 │
│                                              │
│  1. Gerar DocumentNo                        │
│     └─ DocumentSeriesService.next()         │
│                                              │
│  2. Calcular Impostos (por linha)           │
│     ├─ TaxCalculatorService.calculateTaxes()
│     └─ Retorna TaxDetail[] para cada linha  │
│                                              │
│  3. Somar Totais                            │
│     ├─ netTotal (sem impostos)              │
│     ├─ taxPayable (soma impostos)           │
│     └─ grossTotal (total final)             │
│                                              │
│  4. Assinar Digitalmente                    │
│     └─ DigitalSignatureService.sign()       │
│        └─ Retorna JWS com assinatura       │
│                                              │
│  5. Gerar QR Code                           │
│     └─ QRCodeService.generate()             │
│                                              │
│  6. Persistir Fatura                        │
│     └─ localStorage (ou API)                │
│                                              │
└────────┬─────────────────────────────────────┘
         │
         │ { Invoice Object com JWS }
         ▼
┌──────────────────────────────────────────────┐
│  CREATE ORDER                                │
│                                              │
│  Pedido {                                    │
│    id,                                       │
│    invoiceId (NOVO!),                       │
│    invoiceNumber (NOVO!),                   │
│    customer,                                 │
│    items,                                    │
│    status: 'PENDING'                        │
│  }                                           │
└────────┬─────────────────────────────────────┘
         │
         │ { success, orderId, invoiceId }
         ▼
┌──────────────────────────────────────────────┐
│  CONFIRMATION PAGE                           │
│                                              │
│  Exibe:                                     │
│  ├─ Pedido #                                │
│  ├─ Fatura # (com QR Code)                  │
│  ├─ Totalizações com impostos               │
│  ├─ Botões:                                 │
│  │  ├─ Descarregar PDF                      │
│  │  ├─ Imprimir                             │
│  │  └─ Acompanhar Pedido                    │
│  └─ Email confirmação (futura)              │
└──────────────────────────────────────────────┘
```

---

## 3. Hierarquia de Serviços

```
                    ┌─────────────────────────┐
                    │  INVOICE SERVICE        │
                    │  (Orchestrator)         │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  TAX CALCULATOR │ │ DIGITAL SIG  │ │ DOCUMENT SERIES  │
    ├─ calculateTaxes│ ├─ signInvoice │ ├─ getActiveSeries│
    ├─ calculateTotals│ ├─ verifySign │ ├─ incrementSeries│
    └─────────────────┘ └──────────────┘ └──────────────────┘
              │                  │                  │
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  Tax Rates      │ │ JWS Standard │ │ AGT Integration  │
    ├─ IVA: 14%, 7%  │ ├─ RS256 Algo  │ ├─ requestSeries │
    ├─ IEC: Varies   │ ├─ SHA-256     │ ├─ checkStatus   │
    ├─ IS: 0.1-0.5%  │ └──────────────┘ └──────────────────┘
    └─────────────────┘
```

---

## 4. Fluxo de Cálculo de Impostos

```
┌─────────────────┐
│  Line Item      │
│  {             │
│    quantity: 2  │
│    unitPrice: 500,000  │
│    productCode: BODYKIT │
│  }              │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  TaxCalculatorService                   │
│  .calculateLineItemTaxes()               │
│                                          │
│  1. Base = qty × unitPrice              │
│     1,000,000                           │
│                                          │
│  2. Determinar categoria                │
│     BODYKIT → NORMAL (14%)              │
│                                          │
│  3. Calcular IVA                        │
│     1,000,000 × 14% = 140,000           │
│                                          │
│  4. Verificar IEC (não aplicável)       │
│     Sem IEC para bodykit                │
│                                          │
│  5. Retornar array de TaxDetail[]       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  TaxDetail {                             │
│    taxType: 'IVA'                        │
│    taxCode: 'NOR' (Normal)              │
│    taxBase: 1,000,000                   │
│    taxPercentage: 14                    │
│    taxAmount: 140,000                   │
│    taxContribution: 140,000              │
│  }                                       │
│                                          │
│  Total da Linha = 1,140,000 AOA          │
└──────────────────────────────────────────┘
```

---

## 5. Estrutura de Assinatura JWS

```
┌──────────────────────────────────────────────────────┐
│  INVOICE OBJECT                                      │
│  {                                                   │
│    documentNo: "FAT-2025-000001",                    │
│    documentDate: "2025-05-27",                       │
│    lines: [ { lineNumber, qty, price, taxes } ],    │
│    documentTotals: { netTotal, taxPayable, ... },   │
│    ...                                               │
│  }                                                   │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  EXTRACT SIGNATURE FIELDS                            │
│  (Campos que devem ser assinados conforme decreto)  │
│  {                                                   │
│    taxRegistrationNumber,                           │
│    documentNo,                                       │
│    documentDate,                                     │
│    lines[].lineNumber,                              │
│    lines[].quantity,                                │
│    lines[].unitPrice,                               │
│    documentTotals.netTotal,                         │
│    documentTotals.grossTotal                        │
│  }                                                   │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  SIGN (JWS FORMAT)                                   │
│                                                      │
│  header = {                                         │
│    "alg": "RS256",                                  │
│    "typ": "JWS",                                    │
│    "kid": "AGT-2025-0001"                           │
│  }                                                   │
│                                                      │
│  payload = extracted_fields (JSON)                  │
│                                                      │
│  signature = RSA_SIGN(hash(payload))                │
│                                                      │
│  JWS = Base64(header).Base64(payload).Sig          │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  INVOICE COM ASSINATURA                             │
│  {                                                   │
│    documentNo: "FAT-2025-000001",                    │
│    jwsSignature: "eyJhbGciOiJSUzI1NiIs...",       │
│    qrCodeData: "https://portaldocontribuinte...",   │
│    ...                                               │
│  }                                                   │
│                                                      │
│  ✓ Pronto para ser persistido e submetido à AGT     │
└──────────────────────────────────────────────────────┘
```

---

## 6. Integração com AGT (Administração Geral Tributária)

```
NOSSO SISTEMA                          AGT SYSTEM
┌───────────────┐                    ┌──────────────┐
│ LOCAL         │                    │  VALIDATION  │
│               │                    │  SYSTEM      │
│ ┌───────────┐ │                    │              │
│ │ Invoice   │ │                    │ ┌──────────┐ │
│ │ Service   │─┼──submitInvoice─────→│ Validar  │ │
│ │           │ │    (JWS)           │ Invoice  │ │
│ │ Status: N │ │                    │          │ │
│ └───────────┘ │                    │ Return:  │ │
│               │                    │ Status V │ │
│               │                    │ or P     │ │
│               │                    └──────────┘ │
│               │                    │              │
│ ┌───────────┐ │                    │              │
│ │ Invoice   │←┼──updateStatus──────│ (Async)     │
│ │ Service   │ │    (Status: V)     │              │
│ │ Status: V │ │                    │              │
│ └───────────┘ │                    └──────────────┘
│               │
│ (Fatura      │
│  Validada)   │
└───────────────┘
```

**Fluxo de Validação:**
1. **Emissão (N)**: Fatura criada e armazenada localmente
2. **Submissão**: Enviada para AGT (assincrona, em background)
3. **Validação**: AGT valida dentro de 24-48 horas
4. **Resultado**: Status atualizado para V (válida) ou P (penalizada)
5. **Armazenamento**: Mantém histórico de validações

---

## 7. Banco de Dados - Schema Simplificado

```sql
-- Tabela de Faturas
CREATE TABLE invoices (
  id VARCHAR(36) PRIMARY KEY,
  document_no VARCHAR(60) UNIQUE NOT NULL,
  document_type VARCHAR(2) NOT NULL,
  document_date TIMESTAMP NOT NULL,
  document_status VARCHAR(2) NOT NULL,
  
  tax_registration_number VARCHAR(15) NOT NULL,
  customer_tax_id VARCHAR(15) NOT NULL,
  customer_country VARCHAR(5) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  
  net_total DECIMAL(15,2) NOT NULL,
  tax_total DECIMAL(15,2) NOT NULL,
  gross_total DECIMAL(15,2) NOT NULL,
  
  jws_signature TEXT NOT NULL,
  qr_code_data TEXT,
  
  validation_status VARCHAR(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (series_id) REFERENCES document_series(id)
);

-- Tabela de Linhas de Fatura
CREATE TABLE invoice_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(36) NOT NULL,
  line_number INT NOT NULL,
  product_code VARCHAR(60) NOT NULL,
  product_description VARCHAR(200) NOT NULL,
  
  quantity DECIMAL(10,2) NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  unit_price_base DECIMAL(15,2) NOT NULL,
  
  debit_amount DECIMAL(15,2),
  credit_amount DECIMAL(15,2),
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Tabela de Impostos
CREATE TABLE invoice_taxes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  line_id INT NOT NULL,
  tax_type VARCHAR(3) NOT NULL,
  tax_code VARCHAR(10) NOT NULL,
  
  tax_base DECIMAL(15,2) NOT NULL,
  tax_percentage DECIMAL(5,2) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  
  FOREIGN KEY (line_id) REFERENCES invoice_lines(id)
);

-- Tabela de Séries de Numeração
CREATE TABLE document_series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  series_code VARCHAR(60) UNIQUE NOT NULL,
  series_year INT NOT NULL,
  document_type VARCHAR(2) NOT NULL,
  
  first_document_number INT NOT NULL,
  current_number INT NOT NULL,
  series_status VARCHAR(1) NOT NULL,
  
  requested_from TIMESTAMP,
  approved_at TIMESTAMP,
  
  UNIQUE (series_code, series_year)
);

-- Tabela de Auditoria (Rastreamento)
CREATE TABLE invoice_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(2),
  new_status VARCHAR(2),
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

---

## 8. Estados da Fatura (Máquina de Estados)

```
        ┌─────────────────────────────┐
        │         CRIADA              │
        │   documentStatus: 'N'        │
        │   validationStatus: null    │
        └────────────┬────────────────┘
                     │
         ┌───────────┴──────────────┬──────────────┐
         │                          │              │
         ▼                          ▼              ▼
    ┌─────────┐              ┌─────────┐    ┌──────────┐
    │ ENVIADA │              │ ANULADA │    │CORRIGIDA │
    │ PARA    │              │         │    │          │
    │ AGT     │              │ Status:│    │Status: C │
    │         │              │   'A'  │    └──────────┘
    │Status:N │              └─────────┘
    └────┬────┘
         │
    ┌────┴──────────────┬──────────────────┐
    │  AGT Validating   │                  │
    │ (24-48 horas)     │                  │
    └────┬──────────────┘                  │
         │                                 │
    ┌────┴──────────────┐          ┌──────┴──────┐
    │                   │          │             │
    ▼                   ▼          ▼             ▼
┌──────────┐      ┌──────────┐ ┌────────┐ ┌──────────┐
│ VÁLIDA   │      │PENALIZADA│ │REJEITADA│ │ INVÁLIDA │
│          │      │          │ │        │ │          │
│Status: N │      │Status: N │ │Status: │ │ Status:  │
│Validation│      │Validation│ │  'RJ'  │ │   'I'    │
│Status: V │      │Status: P │ └────────┘ └──────────┘
└──────────┘      └──────────┘
```

---

## 9. Checklist de Implementação

```
├─ MODELOS DE DADOS
│  ├─ ✅ invoice.model.ts
│  ├─ ✅ tax.model.ts
│  └─ ✅ document-series.model.ts
│
├─ SERVIÇOS CORE
│  ├─ ✅ invoice.service.ts
│  ├─ ✅ tax-calculator.service.ts
│  ├─ ✅ digital-signature.service.ts
│  └─ ✅ document-series.service.ts
│
├─ INTEGRAÇÕES
│  ├─ ⏳ agt-integration.service.ts
│  ├─ ⏳ checkout.service.ts (modificado)
│  └─ ⏳ order-tracking.service.ts (modificado)
│
├─ COMPONENTES UI
│  ├─ ⏳ invoice-form/
│  ├─ ⏳ invoice-view/
│  ├─ ⏳ invoice-list/
│  ├─ ⏳ invoice-preview/
│  └─ ⏳ checkout-confirmation/
│
├─ UTILITÁRIOS
│  ├─ ⏳ qrcode.service.ts
│  ├─ ⏳ pdf-generator.service.ts
│  └─ ⏳ validators.ts
│
├─ TESTES
│  ├─ ⏳ tax-calculator.spec.ts
│  ├─ ⏳ invoice.service.spec.ts
│  ├─ ⏳ checkout-integration.spec.ts
│  └─ ⏳ e2e/checkout-to-invoice.e2e.ts
│
└─ DOCUMENTAÇÃO
   ├─ ✅ sistema-faturacao.md
   ├─ ✅ integracao-checkout.md
   └─ ✅ arquitetura-visual.md
```

**Legenda:**
- ✅ Implementado
- ⏳ Pendente
- 🔧 Em Progresso

