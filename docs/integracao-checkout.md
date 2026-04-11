# Integração do Sistema de Faturação com Checkout

## 1. Modificações no Checkout Existente

### 1.1 Estrutura do Arquivo `checkout.service.ts`

```typescript
// src/app/checkout/checkout.service.ts

import { Injectable } from '@angular/core';
import { InvoiceService } from '../invoicing/services/invoice.service';
import { CreateInvoiceDTO, DocumentType } from '../invoicing/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    // ... existing dependencies ...
    private invoiceService: InvoiceService
  ) { }

  /**
   * Completa o checkout e cria fatura
   */
  completeCheckout(cartItems: CartItem[], customerData: CustomerFormData) {
    // 1. Processar pagamento (existente)
    const paymentResult = this.processPayment(cartItems, customerData);

    if (!paymentResult.success) {
      return {
        success: false,
        message: paymentResult.error
      };
    }

    // 2. NOVO: Criar fatura eletrônica
    const invoiceDTO = this.mapCartToInvoice(cartItems, customerData);
    
    let invoice;
    this.invoiceService.createInvoiceFromCheckout(invoiceDTO).subscribe(
      (inv) => {
        invoice = inv;
        console.log('Invoice created:', invoice.documentNo);
      },
      (error) => {
        console.error('Error creating invoice:', error);
        // Não falhar o checkout, apenas registrar erro
      }
    );

    // 3. Criar pedido com referência à fatura
    const order = this.createOrder(cartItems, customerData, invoice?.invoiceId);

    // 4. Retornar sucesso com referência de fatura
    return {
      success: true,
      orderId: order.id,
      invoiceId: invoice?.invoiceId,
      invoiceNumber: invoice?.documentNo,
      message: 'Pedido e fatura criados com sucesso'
    };
  }

  /**
   * Mapeia itens do carrinho para formato de fatura
   */
  private mapCartToInvoice(
    cartItems: CartItem[],
    customerData: CustomerFormData
  ): CreateInvoiceDTO {
    return {
      documentType: 'FT', // Fatura padrão
      customer: {
        taxId: customerData.nif || '999999999',
        country: customerData.country || 'AO',
        companyName: customerData.companyName || customerData.fullName
      },
      lines: cartItems.map(item => ({
        lineNumber: 0, // Será preenchido pelo serviço
        productCode: item.productId,
        productDescription: item.productName,
        quantity: item.quantity,
        unitOfMeasure: 'UN',
        unitPrice: item.price,
        unitPriceBase: item.price, // Sem descontos por enquanto
        taxes: [] // Calculado pelo TaxCalculatorService
      })),
      paymentMethod: customerData.paymentMethod
    };
  }

  /**
   * Cria pedido com referência à fatura
   */
  private createOrder(
    cartItems: CartItem[],
    customerData: CustomerFormData,
    invoiceId?: string
  ) {
    const order = {
      id: this.generateOrderId(),
      invoiceId, // NOVO: Referência à fatura
      invoiceNumber: undefined as string | undefined,
      customer: customerData,
      items: cartItems,
      createdAt: new Date(),
      status: 'PENDING'
    };

    this.saveOrder(order);
    return order;
  }

  // ... rest of existing methods ...
}
```

### 1.2 Modificações no Model do Pedido

```typescript
// src/app/models/order.model.ts

export interface Order {
  id: string;
  invoiceId?: string;           // NOVO: ID da fatura eletrônica
  invoiceNumber?: string;       // NOVO: Número da fatura
  customer: CustomerData;
  items: OrderItem[];
  createdAt: Date;
  updatedAt?: Date;
  status: OrderStatus;
  paymentInfo: PaymentInfo;
  shippingInfo?: ShippingInfo;
  notes?: string;
}
```

---

## 2. Fluxo Completo de Checkout com Faturação

```
┌─────────────────────────────────────────────────────────┐
│  1. CARRINHO                                             │
│     Usuário adiciona: Peças, Bodykits, Veículos        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  2. CHECKOUT - Dados do Cliente                         │
│     Nome, NIF, Endereço, Dados de Contato              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  3. VALIDAÇÃO DE DADOS                                  │
│     - NIF: 15 dígitos ou estrangeiro (999999999)       │
│     - País: ISO 3166-1-alpha-2                         │
│     - Email e telefone                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  4. CÁLCULO DE TOTAIS COM IMPOSTOS                      │
│     - Subtotal (items)                                 │
│     - IVA 14% (normal)                                 │
│     - IEC (se aplicável)                              │
│     - Total Final                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  5. PROCESSAMENTO DO PAGAMENTO                          │
│     - Validar cartão/transferência                     │
│     - Débito da conta                                  │
│     - Confirmação                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  6. CRIAÇÃO DE FATURA ELETRÔNICA                        │
│     - Gerar número de documento                         │
│     - Assinar digitalmente (JWS)                       │
│     - Gerar QR Code                                    │
│     - Armazenar em BD                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  7. CRIAÇÃO DO PEDIDO                                   │
│     - Registrar pedido com ref. à fatura               │
│     - Atribuir status PENDING                          │
│     - Enviar confirmação por email                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  8. CONFIRMAÇÃO FINAL                                   │
│     - Mostrar:                                         │
│       • Número do pedido                               │
│       • Número da fatura                               │
│       • QR Code para consulta                          │
│       • Opção de download/impressão                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Página de Confirmação de Checkout

```typescript
// src/app/checkout/checkout-confirmation/checkout-confirmation.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../invoicing/services/invoice.service';
import { Invoice } from '../../invoicing/models/invoice.model';

@Component({
  selector: 'app-checkout-confirmation',
  templateUrl: './checkout-confirmation.component.html',
  styleUrls: ['./checkout-confirmation.component.scss']
})
export class CheckoutConfirmationComponent implements OnInit {

  invoice: Invoice | null = null;
  loading = true;
  qrCodeUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const invoiceId = params['invoiceId'];
      
      if (invoiceId) {
        this.loadInvoice(invoiceId);
      } else {
        this.loading = false;
      }
    });
  }

  private loadInvoice(invoiceId: string): void {
    this.invoiceService.getInvoice(invoiceId).subscribe(
      (inv) => {
        this.invoice = inv;
        if (inv?.qrCodeData) {
          this.generateQRCode(inv.qrCodeData);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading invoice', error);
        this.loading = false;
      }
    );
  }

  private generateQRCode(data: string): void {
    // Usar biblioteca como qrcode ou ng-qrcode
    // this.qrCodeUrl = this.qrcodeService.generate(data);
  }

  downloadInvoice(): void {
    if (this.invoice) {
      // Gerar PDF e fazer download
      // this.pdfService.generateInvoicePDF(this.invoice);
    }
  }

  printInvoice(): void {
    if (this.invoice) {
      window.print();
    }
  }
}
```

```html
<!-- checkout-confirmation.component.html -->

<div class="confirmation-container" *ngIf="invoice">
  
  <div class="success-message">
    <h2>✓ Pedido Confirmado!</h2>
    <p>Sua fatura eletrônica foi gerada com sucesso.</p>
  </div>

  <div class="invoice-details">
    
    <div class="invoice-header">
      <div class="detail-row">
        <label>Número da Fatura:</label>
        <strong>{{ invoice.documentNo }}</strong>
      </div>
      <div class="detail-row">
        <label>Data:</label>
        <span>{{ invoice.documentDate | date: 'dd/MM/yyyy HH:mm' }}</span>
      </div>
      <div class="detail-row">
        <label>Status:</label>
        <span class="status-badge" [class.status-normal]="invoice.documentStatus === 'N'">
          {{ invoice.documentStatus }}
        </span>
      </div>
    </div>

    <!-- Cliente -->
    <div class="section">
      <h3>Dados do Cliente</h3>
      <p>{{ invoice.customer.companyName }}</p>
      <p>NIF: {{ invoice.customer.taxId }}</p>
      <p>País: {{ invoice.customer.country }}</p>
    </div>

    <!-- Itens -->
    <div class="section">
      <h3>Itens da Fatura</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Preço</th>
            <th>Impostos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let line of invoice.lines">
            <td>{{ line.productDescription }}</td>
            <td>{{ line.quantity }}</td>
            <td>{{ line.unitPrice | currency: 'AOA' }}</td>
            <td>{{ calculateLineTax(line) | currency: 'AOA' }}</td>
            <td>{{ (line.debitAmount || 0) | currency: 'AOA' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totais -->
    <div class="section totals">
      <div class="total-row">
        <label>Subtotal:</label>
        <span>{{ invoice.documentTotals.netTotal | currency: 'AOA' }}</span>
      </div>
      <div class="total-row">
        <label>Impostos:</label>
        <span>{{ invoice.documentTotals.taxPayable | currency: 'AOA' }}</span>
      </div>
      <div class="total-row total-final">
        <label>Total:</label>
        <strong>{{ invoice.documentTotals.grossTotal | currency: 'AOA' }}</strong>
      </div>
    </div>

    <!-- QR Code -->
    <div class="section qrcode-section" *ngIf="qrCodeUrl">
      <h3>Código QR para Consulta</h3>
      <img [src]="qrCodeUrl" alt="QR Code da Fatura" class="qrcode">
      <p class="qrcode-hint">Escanear para consultar fatura no portal da AGT</p>
    </div>

  </div>

  <div class="actions">
    <button class="btn btn-primary" (click)="downloadInvoice()">
      📥 Descarregar PDF
    </button>
    <button class="btn btn-secondary" (click)="printInvoice()">
      🖨️ Imprimir
    </button>
    <a routerLink="/orders" class="btn btn-outline">
      Acompanhar Pedido
    </a>
  </div>

</div>

<div class="loading" *ngIf="loading">
  <p>Carregando fatura...</p>
</div>
```

---

## 4. Integração com Order Tracking

```typescript
// src/app/order-tracking/order-tracking.component.ts

export class OrderTrackingComponent implements OnInit {

  order: Order | null = null;
  invoice: Invoice | null = null;

  constructor(
    private orderService: OrderTrackingService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    
    this.orderService.getOrder(orderId).subscribe(order => {
      this.order = order;
      
      // NOVO: Carregar fatura se existir
      if (order.invoiceId) {
        this.loadInvoice(order.invoiceId);
      }
    });
  }

  private loadInvoice(invoiceId: string): void {
    this.invoiceService.getInvoice(invoiceId).subscribe(
      inv => this.invoice = inv
    );
  }

  downloadInvoice(): void {
    if (this.invoice) {
      // Gerar e fazer download do PDF da fatura
    }
  }
}
```

---

## 5. Exemplo de Chamada na Prática

```typescript
// Exemplo no componente de checkout final

export class CheckoutFinalComponent {

  onCompleteOrder(): void {
    const checkoutData = {
      cartItems: this.cart.items,
      customerData: {
        fullName: 'João Silva',
        email: 'joao@example.com',
        nif: '123456789012345',
        country: 'AO',
        address: '...'
      }
    };

    this.checkoutService.completeCheckout(
      checkoutData.cartItems,
      checkoutData.customerData
    ).then(result => {
      if (result.success) {
        // Redirecionar para confirmação com fatura
        this.router.navigate(['/checkout/confirmation'], {
          queryParams: {
            orderId: result.orderId,
            invoiceId: result.invoiceId
          }
        });
      }
    });
  }
}
```

---

## 6. Considerações de Segurança

### 6.1 Validação de NIF

```typescript
// Validador customizado
export function nifValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Deixar para required validator
    }

    // NIF doméstico: 15 dígitos
    if (/^\d{15}$/.test(value)) {
      return null;
    }

    // Estrangeiro: sempre 999999999
    if (value === '999999999') {
      return null;
    }

    return { invalidNif: true };
  };
}
```

### 6.2 Proteção de Dados Pessoais

- NIF armazenado apenas na fatura (conforme legislação)
- Email/telefone em campo separado
- Hash de dados pessoais para segurança
- Conformidade GDPR

---

## 7. Testes de Integração

```typescript
// src/app/checkout/checkout.service.spec.ts

describe('CheckoutService with Invoicing', () => {
  
  let service: CheckoutService;
  let invoiceService: InvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutService, InvoiceService]
    });
    service = TestBed.inject(CheckoutService);
    invoiceService = TestBed.inject(InvoiceService);
  });

  it('should create invoice when checkout completes', (done) => {
    const cartItems = [...];
    const customerData = {...};

    service.completeCheckout(cartItems, customerData).then(result => {
      expect(result.success).toBe(true);
      expect(result.invoiceId).toBeDefined();
      expect(result.invoiceNumber).toBeDefined();
      done();
    });
  });

  it('should link order to invoice', (done) => {
    // ... test implementation
  });
});
```

