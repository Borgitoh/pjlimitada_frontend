# Sistema de Faturação Eletrônica - PJ Limitada

## 1. Visão Geral

Sistema baseado no Decreto Executivo nº 683/25 da República de Angola para emissão de faturas eletrônicas de:
- Vendas de peças de carro
- Vendas de bodykits
- Importação de veículos

---

## 2. Modelo de Dados

### 2.1 Tipos de Documentos Suportados

```
FA - Fatura de Adiantamento
FT - Fatura (Vendas gerais)
FR - Fatura/Recibo
FG - Fatura Global
RC - Recibo Emitido
RG - Recibo
ND - Nota de Débito
NC - Nota de Crédito
RE - Estorno/Recibo de Estorno
```

### 2.2 Estrutura de Dados Principal

**Invoice (Fatura)**
```typescript
{
  // Identificação
  invoiceId: string;                      // UUID único
  documentNo: string;                     // Número do documento (ex: FAT-2025-000001)
  documentType: 'FT' | 'FR' | 'FA' | ...; // Tipo de documento
  documentDate: Date;                     // Data de emissão
  documentStatus: 'N' | 'S' | 'A' | ...;  // Normal, Autofacturação, Anulado
  
  // Metadados de Faturação
  submissionGUID: string;                 // ID único da submissão
  submissionTimeStamp: string;            // ISO 8601 timestamp
  schemaVersion: string;                  // "1.0"
  
  // Identificação do Contribuinte
  taxRegistrationNumber: string;          // NIF da PJ Limitada
  
  // Software
  softwareInfo: {
    productId: string;                    // Nome do software
    productVersion: string;               // Versão
    softwareValidationNumber: string;     // Certificação
  };
  
  // Cliente/Adquirente
  customer: {
    taxId: string;                        // NIF ou BO para domésticos, estrangeiro se 999999999
    country: string;                      // ISO 3166-1-alpha-2
    companyName: string;                  // Razão social
  };
  
  // Itens da Fatura
  lines: InvoiceLineItem[];
  
  // Totalizações
  documentTotals: {
    taxPayable: number;                   // Total imposto devido (soma de impostos)
    netTotal: number;                     // Total sem imposto
    grossTotal: number;                   // Total com imposto
    currency: {
      currencyCode: string;               // "AOA" (moeda)
      currencyAmount: number;             // Valor em moeda estrangeira
      exchangeRate: number;               // Taxa de câmbio para AOA
    };
  };
  
  // Retenções e Tributos
  withholding?: WithholdingTax[];
  
  // Assinatura Digital
  jwsSignature: string;                   // Assinatura JWS
  
  // Status de Validação
  validationStatus?: 'V' | 'P' | '';     // Válida, Penalizada, Não validada
  
  // Rastreamento
  createdAt: Date;
  updatedAt: Date;
}
```

**InvoiceLineItem (Linha de Item)**
```typescript
{
  lineNumber: number;                     // Número sequencial da linha
  productCode: string;                    // Código do produto/serviço
  productDescription: string;             // Descrição (até 200 caracteres)
  quantity: number;                       // Quantidade
  unitOfMeasure: string;                  // Un. medida (UN, KG, LT, etc)
  unitPrice: number;                      // Preço unitário
  unitPriceBase: number;                  // Preço após descontos por linha
  
  // Descontos e Encargos
  settlement?: {
    amount: number;                       // Desconto/encargo
  };
  
  // Referência (para devoluções/notas)
  reference?: {
    reference: string;                    // Número doc. origem
    reason: string;                       // Motivo da referência
  };
  
  // Impostos
  taxes: TaxDetail[];
  
  // Totais da Linha
  debitAmount?: number;                   // Débito (vendas normais)
  creditAmount?: number;                  // Crédito (devoluções)
}
```

**TaxDetail (Detalhe de Imposto)**
```typescript
{
  taxType: 'IVA' | 'IS' | 'IEC' | 'NS';  // Tipo de imposto
  taxCountryRegion: string;               // País/região do imposto (ISO, ou "AO-CAB" para Cabinda)
  taxCode: string;                        // Código específico do imposto
  taxBase: number;                        // Base tributável
  taxPercentage: number;                  // Percentual (ex: 14 = 14%)
  taxAmount: number;                      // Valor do imposto
  taxContribution: number;                // Contribuição calculada
  taxExemptionCode?: string;              // Código de isenção (3 caracteres)
}
```

---

## 3. Fluxo de Faturação

```
┌─────────────────────────────────────────────────────────┐
│  1. EMISSÃO DE FATURA (No Checkout)                     │
│     - Coletar dados do cliente                          │
│     - Gerar número de fatura                            │
│     - Calcular impostos                                 │
│     - Criar estrutura de fatura                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  2. ASSINATURA DIGITAL (JWS)                            │
│     - Assinar com chave privada do software             │
│     - Usar algoritmos SHA-256 + RSA                     │
│     - Incluir campos obrigatórios na assinatura         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  3. SUBMISSÃO PARA VALIDAÇÃO (Later)                    │
│     - Armazenar fatura com status 'PENDING'             │
│     - Registrar em banco de dados local                 │
│     - QR Code com dados da fatura                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  4. VALIDAÇÃO POSTERIOR (AGT - Async)                   │
│     - Enviar para Administração Geral Tributária        │
│     - Receber confirmação de validação                  │
│     - Atualizar status (V=Válida, P=Penalizada)         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  5. GESTÃO DE FATURAS                                   │
│     - Listar faturas por período                        │
│     - Consultar detalhes                                │
│     - Anular facturas (gerar nota de crédito)          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Cálculo de Impostos

### 4.1 Imposto sobre o Valor Acrescentado (IVA)

- **Taxa Normal**: 14%
- **Taxa Intermdia**: 7%
- **Taxa Reduzida**: 5%
- **Isento**: Sem IVA

```typescript
const calculateIVA = (baseAmount: number, rate: number): number => {
  return baseAmount * (rate / 100);
};
```

### 4.2 Imposto Especial de Consumo (IEC)

Aplicável a:
- Bebidas alcoólicas: 3-15%
- Tabaco: 25%
- Combustíveis: 0-5%
- Pneus: 5-20%

### 4.3 Imposto de Selo (IS)

- Operações financeiras: 0,1%-0,5%
- Garantias e títulos: 0,1%-0,3%
- Contratos: 1.000,00 Kz por contrato

---

## 5. Integração com Sistema Existente

### 5.1 Estrutura de Pastas

```
src/app/
├── invoicing/                          # Novo módulo
│   ├── models/
│   │   ├── invoice.model.ts           # Modelo principal
│   │   ├── invoice-item.model.ts      # Itens da fatura
│   │   ├── tax.model.ts               # Cálculo de impostos
│   │   ├── document-series.model.ts   # Série de numeração
│   │   └── validation.model.ts        # Status de validação
│   │
│   ├── services/
│   │   ├── invoice.service.ts         # CRUD de faturas
│   │   ├── tax-calculator.service.ts  # Cálculo de impostos
│   │   ├── digital-signature.service.ts # Assinatura JWS
│   │   ├── document-series.service.ts # Gestão de séries
│   │   ├── agt-integration.service.ts # Integração com AGT
│   │   └── qrcode.service.ts          # Geração de QR Code
│   │
│   ├── components/
│   │   ├── invoice-form/              # Emissão de fatura
│   │   ├── invoice-view/              # Visualização
│   │   ├── invoice-list/              # Listagem
│   │   ├── invoice-preview/           # Pré-visualização
│   │   └── tax-summary/               # Resumo de impostos
│   │
│   ├── utils/
│   │   ├── invoice-generator.ts       # Gerador de nº de fatura
│   │   ├── qrcode-encoder.ts          # Encoder de QR code
│   │   └── validators.ts              # Validadores específicos
│   │
│   └── invoicing.module.ts            # Módulo principal
│
├── checkout/                           # Existente - será estendido
│   └── checkout.service.ts            # Integração com fatura
│
└── order-tracking/                     # Existente
    └── order.model.ts                 # Incluir referência a fatura
```

### 5.2 Integração com Checkout

```typescript
// checkout.service.ts - Modificação
export class CheckoutService {
  
  completeCheckout(cartItems, customerData) {
    // ... lógica existente ...
    
    // Nova: Criar fatura
    const invoice = this.invoiceService.createFromCheckout(
      cartItems,
      customerData,
      this.getProductDetails()
    );
    
    // Retornar referência da fatura com pedido
    return {
      ...orderResult,
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.documentNo
    };
  }
}
```

---

## 6. Requisitos Técnicos

### 6.1 Campos Obrigatórios por Tipo de Documento

**Fatura (FT)**
- documentNo, documentType, documentDate
- customer (taxId, country, companyName)
- lines com produtos
- documentTotals
- jwsSignature

**Fatura/Recibo (FR)**
- Além de FT: paymentReceipt (dados do pagamento)

**Nota de Crédito (NC)**
- documentNo, documentType, documentDate
- reference (documento original)
- reason (motivo da devolução)

### 6.2 Validações

- NIF do cliente: 15 dígitos (domestico) ou estrangeiro (999999999)
- País: ISO 3166-1-alpha-2 ou especial ("AO-CAB" para Cabinda)
- Quantidade: Mínimo 1
- Valores monetários: Máximo 2 casas decimais
- Descrição: Máximo 200 caracteres

### 6.3 Numeração de Séries

Formato solicitado à AGT:
- **Código da série**: 3-60 caracteres alfanuméricos
- **Ano**: De 2025 a próximo ano disponível
- **Tipo de documento**: FA, FT, FR, FG, AC, AR, TV, RC, RG, RE, ND, NC, AF, RP, RA, CS, LD
- **Primeiro número**: Inteiro positivo

Exemplo: `FAT-2025-` (série com auto-incremento)

---

## 7. Assinatura Digital (JWS)

### 7.1 Campos Assinados

```typescript
const fieldsToSign = {
  taxRegistrationNumber: "...",
  documentNo: "...",
  documentType: "...",
  documentDate: "...",
  customerTaxID: "...",
  customerCountry: "...",
  companyName: "...",
  // ... + lineNumber, qty, unitPrice, taxes para cada linha
};
```

### 7.2 Algoritmo

- Hash: SHA-256
- Algoritmo: RSA-2048 ou superior
- Encoding: JWS (JSON Web Signature)

---

## 8. Geração de QR Code

Formato para impressão em fatura:
- **Padrão**: QR Code Model 2
- **Nível de Correção de Erros**: M (15%)
- **Tamanho**: 350x350 pixels
- **Conteúdo URL**:
  ```
  https://portaldocontribuinte.minfin.gov.ao/consultar-fe?documentNo=...
  ```

---

## 9. Estados de Fatura

```
N  - Normal (emitida e armazenada)
S  - Autofacturação
A  - Anulada (substituída por nota de crédito)
C  - Corrigida (há nota de crédito pendente)
R  - Registrada (resumo de outros documentos)
RJ - Rejeitada pela AGT
V  - Válida (após validação)
P  - Penalizada (validada com atraso)
I  - Inválida
```

---

## 10. Exemplo de Fatura Completa

```json
{
  "schemaVersion": "1.0",
  "submissionGUID": "550e8400-e29b-41d4-a716-446655440000",
  "submissionTimeStamp": "2025-05-27T14:30:00+01:00",
  "taxRegistrationNumber": "1234567890123",
  "softwareInfo": {
    "productId": "PJ-Limitada-Faturacao",
    "productVersion": "1.0.0",
    "softwareValidationNumber": "AGT-2025-0001"
  },
  "documentNo": "FAT-2025-000001",
  "documentType": "FT",
  "documentDate": "2025-05-27",
  "documentStatus": "N",
  "customer": {
    "taxId": "1234567890987",
    "country": "AO",
    "companyName": "Cliente SARL"
  },
  "lines": [
    {
      "lineNumber": 1,
      "productCode": "PECA-001",
      "productDescription": "Filtro de Ar Original BMW",
      "quantity": 2,
      "unitOfMeasure": "UN",
      "unitPrice": 45000.00,
      "unitPriceBase": 45000.00,
      "taxes": [
        {
          "taxType": "IVA",
          "taxCountryRegion": "AO",
          "taxCode": "NOR",
          "taxBase": 90000.00,
          "taxPercentage": 14,
          "taxAmount": 12600.00,
          "taxContribution": 12600.00
        }
      ],
      "debitAmount": 102600.00
    }
  ],
  "documentTotals": {
    "taxPayable": 12600.00,
    "netTotal": 90000.00,
    "grossTotal": 102600.00,
    "currency": {
      "currencyCode": "AOA",
      "currencyAmount": 102600.00,
      "exchangeRate": 1.0
    }
  },
  "jwsSignature": "eyJhbGciOiJSUzI1NiIs..."
}
```

---

## 11. Próximos Passos de Implementação

1. ✅ Criar modelos de dados TypeScript
2. ✅ Implementar serviço de cálculo de impostos
3. ✅ Implementar assinatura digital JWS
4. ✅ Criar CRUD de faturas com persistência
5. ✅ Integrar com checkout existente
6. ✅ Criar componentes de visualização
7. ✅ Implementar geração de QR Code
8. ✅ Integração com AGT (mock para desenvolvimento)
9. ✅ Testes unitários e E2E
10. ✅ Documentação de API

