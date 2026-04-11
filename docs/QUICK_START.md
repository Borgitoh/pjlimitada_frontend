# 🚀 Quick Start - Sistema de Faturação Eletrônica

## Resumo Executivo

Sistema de faturação eletrônica completo baseado no **Decreto Executivo nº 683/25** da República de Angola para vendas de:
- **Peças de carro**
- **Bodykits**
- **Importação de veículos**

---

## 📋 O Que Foi Entregue

### ✅ Arquivos Criados

#### Modelos de Dados
```
src/app/invoicing/models/
├── invoice.model.ts          (198 linhas)
   ├─ Invoice (fatura principal)
   ├─ InvoiceLineItem (linhas de item)
   ├─ TaxDetail (detalhes de imposto)
   ├─ DocumentSeries (numeração)
   ├─ DocumentType, DocumentStatus enums
   └─ Interfaces para validação AGT
```

#### Serviços
```
src/app/invoicing/services/
├── invoice.service.ts              (362 linhas)
│   └─ Criar, listar, atualizar, anular faturas
├── tax-calculator.service.ts       (294 linhas)
│   └─ Calcular IVA, IEC, impostos por legislação
├── digital-signature.service.ts    (237 linhas)
│   └─ Assinar digitalmente (JWS/RS256)
└── document-series.service.ts      (283 linhas)
    └─ Gerenciar séries de numeração
```

#### Documentação Completa
```
docs/
├── sistema-faturacao.md           (454 linhas)
│   └─ Visão geral, modelos, requisitos técnicos
├── integracao-checkout.md         (551 linhas)
│   └─ Como integrar com checkout existente
└── arquitetura-visual.md          (506 linhas)
    └─ Diagramas, fluxos, database schema
```

**Total: 2.885 linhas de código/documentação**

---

## 🔧 Próximos Passos para Implementação

### Fase 1: Setup e Módulo (1-2 dias)

```bash
# 1. Criar o módulo invoicing
ng generate module invoicing --routing

# 2. Copiar os arquivos criados para:
src/app/invoicing/

# 3. Instalar dependências opcionais
npm install uuid qrcode ng-qrcode
npm install jose  # Para JWS em produção

# 4. Registrar o módulo em app.module.ts
import { InvoicingModule } from './invoicing/invoicing.module';

@NgModule({
  imports: [InvoicingModule]
})
export class AppModule { }
```

### Fase 2: Integração com Checkout (1-2 dias)

```typescript
// checkout.service.ts - Adicionar:
import { InvoiceService } from '../invoicing/services/invoice.service';

completeCheckout(cartItems, customerData) {
  // ... pagamento ...
  
  // NOVO:
  const invoiceDTO = this.mapCartToInvoice(cartItems, customerData);
  this.invoiceService.createInvoiceFromCheckout(invoiceDTO).subscribe(
    invoice => {
      console.log('Fatura criada:', invoice.documentNo);
      // Retornar com referência
    }
  );
}
```

### Fase 3: Componentes de UI (2-3 dias)

```typescript
// Criar componentes:
src/app/invoicing/components/
├── checkout-confirmation/    // Mostrar fatura no final do checkout
├── invoice-list/            // Listar faturas emitidas
├── invoice-view/            // Visualizar uma fatura
├── invoice-preview/         // PDF preview
└── tax-summary/             // Resumo de impostos

// Exemplo:
ng generate component invoicing/components/checkout-confirmation
ng generate component invoicing/components/invoice-list
```

### Fase 4: Testes (1-2 dias)

```bash
# Testes unitários
ng test

# Testes e2e
ng e2e

# Cobertura
ng test --code-coverage
```

### Fase 5: Integração com AGT (Backend)

```typescript
// agt-integration.service.ts
export class AGTIntegrationService {
  
  submitInvoice(invoice: Invoice): Observable<ValidationResponse> {
    // POST para AGT API
    return this.http.post('/api/agt/submitInvoice', invoice);
  }
  
  requestDocumentSeries(): Observable<DocumentSeries> {
    // POST para solicitar série
  }
  
  checkValidationStatus(invoiceId: string): Observable<ValidationStatus> {
    // GET status de validação
  }
}
```

---

## 💡 Conceitos-Chave Implementados

### 1. Cálculo de Impostos
```typescript
// IVA - Imposto sobre Valor Acrescentado
- Taxa Normal: 14% (maioria dos produtos)
- Taxa Intermdia: 7%
- Taxa Reduzida: 5%
- Isento: 0%

// IEC - Imposto Especial de Consumo
- Aplicável a: Bebidas, Tabaco, Combustível, etc.
- Taxa varia conforme produto

// IS - Imposto de Selo
- Operações financeiras: 0.1%-0.5%
```

### 2. Assinatura Digital (JWS)
```
Campos assinados:
- Documentação: nº, tipo, data
- Cliente: NIF, país, nome
- Linhas: quantidade, preço, impostos
- Totais: net, tax, gross

Algoritmo: RS256 (RSA + SHA-256)
Formato: Header.Payload.Signature
```

### 3. Fluxo de Validação
```
1. EMISSÃO (N): Fatura criada e armazenada
2. SUBMISSÃO: Enviada para AGT (assincrona)
3. VALIDAÇÃO: AGT valida em 24-48 horas
4. RESULTADO: Status V (válida) ou P (penalizada)
5. ARMAZENAMENTO: Mantém histórico
```

### 4. Estados da Fatura
```
N - Normal (emitida)
S - Autofacturação
A - Anulada
C - Corrigida
V - Válida (após AGT)
P - Penalizada
```

---

## 📊 Tabelas de Impostos Incorporadas

### Tabela 1: IVA Rates
| Taxa | Percentual | Produtos |
|------|-----------|----------|
| Normal | 14% | Peças, Bodykits, Importação |
| Intermdia | 7% | - |
| Reduzida | 5% | - |
| Isento | 0% | Medicamentos, Alimentos básicos |

### Tabela 2: IEC (Excises)
| Categoria | Taxa |
|-----------|------|
| Bebidas Alcoólicas | 15% |
| Cerveja | 4% |
| Tabaco | 25% |
| Combustível | 5% |
| Veículos | 5% |

---

## 🔐 Segurança Implementada

✅ **Validação de NIF**
- Doméstico: 15 dígitos
- Estrangeiro: 999999999

✅ **Assinatura Digital**
- JWS (JSON Web Signature)
- RSA-2048 ou superior
- SHA-256 hash

✅ **Formatos Validados**
- ISO 8601 timestamps
- ISO 3166-1-alpha-2 países
- Campos obrigatórios conforme decreto

---

## 📱 Estrutura de Resposta (Exemplos)

### Criar Fatura
```json
POST /api/invoices
{
  "documentType": "FT",
  "customer": {
    "taxId": "123456789012345",
    "country": "AO",
    "companyName": "Cliente SARL"
  },
  "lines": [{
    "productCode": "PECA-001",
    "productDescription": "Filtro de Ar",
    "quantity": 2,
    "unitPrice": 45000
  }]
}

RESPONSE 201:
{
  "invoiceId": "550e8400-e29b-41d4-a716-446655440000",
  "documentNo": "FAT-2025-000001",
  "documentStatus": "N",
  "documentTotals": {
    "netTotal": 90000,
    "taxPayable": 12600,
    "grossTotal": 102600
  },
  "jwsSignature": "eyJhbGciOiJSUzI1NiIs...",
  "qrCodeData": "https://portaldocontribuinte.minfin.gov.ao/...",
  "createdAt": "2025-05-27T14:30:00+01:00"
}
```

### Listar Faturas
```json
GET /api/invoices?startDate=2025-05-01&endDate=2025-05-31

RESPONSE:
[
  {
    "invoiceId": "...",
    "documentNo": "FAT-2025-000001",
    "documentType": "FT",
    "documentDate": "2025-05-27",
    "customer": { "companyName": "..." },
    "documentTotals": { "grossTotal": 102600 },
    "validationStatus": null
  },
  ...
]
```

---

## 🧪 Exemplo de Uso no Componente

```typescript
// checkout-confirmation.component.ts

export class CheckoutConfirmationComponent implements OnInit {
  invoice: Invoice | null = null;
  qrCodeUrl: string | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['invoiceId']) {
        this.invoiceService.getInvoice(params['invoiceId'])
          .subscribe(invoice => {
            this.invoice = invoice;
            // Gerar QR Code a partir de invoice.qrCodeData
            this.generateQRCode(invoice.qrCodeData);
          });
      }
    });
  }

  downloadInvoice() {
    // Gerar PDF usando invoice.documentNo, lines, totals
    // this.pdfService.generatePDF(this.invoice);
  }

  printInvoice() {
    window.print();
  }
}
```

---

## 📚 Arquivos de Referência

Consulte os documentos criados para detalhes:

1. **sistema-faturacao.md** (454 linhas)
   - Visão geral completa
   - Modelos de dados
   - Requisitos técnicos
   - Tabelas de impostos

2. **integracao-checkout.md** (551 linhas)
   - Como integrar com checkout
   - Fluxo de checkout com fatura
   - Componentes de confirmação
   - Testes de integração

3. **arquitetura-visual.md** (506 linhas)
   - Diagramas de módulos
   - Fluxo de dados
   - Hierarquia de serviços
   - Schema do banco de dados

---

## 🎯 Funcionalidades por Fase

### MVP (Mínimo Viável) - Fase 1-2
- ✅ Criar faturas no checkout
- ✅ Cálculo de impostos automático
- ✅ Assinatura digital (JWS)
- ✅ Listagem de faturas
- ✅ Visualização de fatura

### v1.1 - Fase 3-4
- ⏳ PDF geração/download
- ⏳ QR Code para consulta
- ⏳ Anulação com nota de crédito
- ⏳ Testes completos
- ⏳ Impressão

### v1.2 - Fase 5+
- ⏳ Integração com AGT (submissão)
- ⏳ Notificações de validação
- ⏳ Integração com email
- ⏳ Dashboard de relatórios
- ⏳ Histórico de validações

---

## 🚨 Considerações Importantes

### 1. Ambiente de Desenvolvimento
- Use dados mock para testes
- `localStorage` para persistência temporária
- Sem submissão real à AGT durante dev

### 2. Ambiente de Produção
- Usar banco de dados real (PostgreSQL, MySQL)
- Integração com AGT API
- Certificado SSL/TLS
- Backup de faturas
- Logs de auditoria

### 3. Configuração
```typescript
// environment.ts
export const environment = {
  production: false,
  invoicing: {
    companyNIF: '1234567890123',
    softwareVersion: '1.0.0',
    agtApiUrl: 'https://agtsistema.agt.gov.ao/api',
    submitToAGT: false // true em produção
  }
};
```

### 4. Chave Privada de Assinatura
```typescript
// IMPORTANTE: Em produção, usar:
// - Azure Key Vault
// - AWS KMS
// - HashiCorp Vault
// - Hardware Security Module (HSM)
// NÃO armazenar em código!
```

---

## 📞 Suporte e Próximas Ações

### Entregáveis
✅ Arquitetura completa documentada
✅ Modelos de dados TypeScript
✅ Serviços de negócio implementados
✅ Guia de integração com checkout
✅ Exemplos de componentes

### Necessário para Produção
- [ ] Backend Node.js/C# com endpoints REST
- [ ] Database schema completo
- [ ] Integração com AGT
- [ ] Certificado digital para assinatura
- [ ] Componentes Angular visuais
- [ ] Testes completos (unit + e2e)
- [ ] CI/CD pipeline

---

## 🔗 Estrutura de Pastas Final

```
src/app/
├── invoicing/                          # NOVO: Módulo de faturação
│   ├── models/
│   │   ├── invoice.model.ts
│   │   └── ...
│   ├── services/
│   │   ├── invoice.service.ts
│   │   ├── tax-calculator.service.ts
│   │   ├── digital-signature.service.ts
│   │   ├── document-series.service.ts
│   │   └── agt-integration.service.ts (future)
│   ├── components/
│   │   ├── checkout-confirmation/
│   │   ├── invoice-list/
│   │   ├── invoice-view/
│   │   ├── invoice-preview/
│   │   └── tax-summary/
│   ├── utils/
│   │   ├── invoice-generator.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   └── invoicing.module.ts
│
├── checkout/                           # EXISTENTE: Modificado
│   ├── checkout.service.ts (integrado)
│   └── checkout-confirmation/
│
├── order-tracking/                     # EXISTENTE: Integrado
│   └── order.model.ts (com invoiceId)
│
└── ...
```

---

**Versão:** 1.0  
**Data:** Maio 2025  
**Status:** ✅ Pronto para implementação

