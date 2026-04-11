import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import {
  Invoice,
  InvoiceLineItem,
  DocumentType,
  CreateInvoiceDTO,
  DocumentSeries,
  SoftwareInfo,
  CustomerInfo,
  DocumentTotals,
  CurrencyInfo
} from '../models/invoice.model';
import { TaxCalculatorService } from './tax-calculator.service';
import { DigitalSignatureService } from './digital-signature.service';
import { DocumentSeriesService } from './document-series.service';

/**
 * Serviço principal de Faturação
 * Responsável por criar, gerenciar e persistir faturas eletrônicas
 */
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  // Configuração padrão do software emissor
  private readonly COMPANY_INFO = {
    taxRegistrationNumber: '1234567890123', // Será carregado da config
    companyName: 'PJ Limitada'
  };

  private readonly SOFTWARE_INFO: SoftwareInfo = {
    productId: 'PJ-Limitada-Faturacao',
    productVersion: '1.0.0',
    softwareValidationNumber: 'AGT-2025-0001'
  };

  // Armazenamento local (será substituído por banco de dados)
  private invoices$ = new BehaviorSubject<Invoice[]>([]);
  private currentInvoice$ = new BehaviorSubject<Invoice | null>(null);

  constructor(
    private http: HttpClient,
    private taxCalculator: TaxCalculatorService,
    private digitalSignature: DigitalSignatureService,
    private documentSeries: DocumentSeriesService
  ) {
    this.loadInvoicesFromStorage();
  }

  /**
   * Cria uma nova fatura a partir dos dados do checkout
   */
  createInvoiceFromCheckout(
    createDTO: CreateInvoiceDTO,
    productCategories: Map<string, string> = new Map()
  ): Observable<Invoice> {
    return new Observable(observer => {
      try {
        // 1. Gerar documentNo baseado na série
        const documentNo = this.generateDocumentNumber(createDTO.documentType);

        // 2. Calcular impostos para cada linha
        const lines = createDTO.lines.map((line, index) => ({
          ...line,
          lineNumber: index + 1,
          taxes: this.taxCalculator.calculateLineItemTaxes(
            line,
            productCategories.get(line.productCode) || 'SPARE_PARTS',
            createDTO.customer.country
          )
        }));

        // 3. Calcular totais
        const documentTotals = this.createDocumentTotals(lines);

        // 4. Criar objeto da fatura
        const invoice: Invoice = {
          invoiceId: uuidv4(),
          documentNo,
          documentType: createDTO.documentType,
          documentDate: new Date(),
          documentStatus: 'N', // Normal
          schemaVersion: '1.0',
          submissionGUID: uuidv4(),
          submissionTimeStamp: this.formatISO8601(new Date()),
          taxRegistrationNumber: this.COMPANY_INFO.taxRegistrationNumber,
          softwareInfo: this.SOFTWARE_INFO,
          customer: createDTO.customer,
          lines,
          documentTotals,
          jwsSignature: '', // Será preenchido depois
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system' // Será preenchido com usuário atual
        };

        // 5. Assinar digitalmente
        invoice.jwsSignature = this.digitalSignature.signInvoice(invoice);

        // 6. Gerar dados de QR Code
        invoice.qrCodeData = this.generateQRCodeData(invoice);

        // 7. Persistir
        this.persistInvoice(invoice);
        this.currentInvoice$.next(invoice);

        observer.next(invoice);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Recupera uma fatura pelo ID
   */
  getInvoice(invoiceId: string): Observable<Invoice | null> {
    return new Observable(observer => {
      const invoice = this.invoices$.value.find(inv => inv.invoiceId === invoiceId);
      observer.next(invoice || null);
      observer.complete();
    });
  }

  /**
   * Lista todas as faturas
   */
  listInvoices(): Observable<Invoice[]> {
    return this.invoices$.asObservable();
  }

  /**
   * Lista faturas por período
   */
  listInvoicesByPeriod(
    startDate: Date,
    endDate: Date,
    documentType?: DocumentType
  ): Observable<Invoice[]> {
    return new Observable(observer => {
      let filtered = this.invoices$.value.filter(inv => {
        const invDate = new Date(inv.documentDate);
        return invDate >= startDate && invDate <= endDate;
      });

      if (documentType) {
        filtered = filtered.filter(inv => inv.documentType === documentType);
      }

      observer.next(filtered);
      observer.complete();
    });
  }

  /**
   * Atualiza uma fatura
   */
  updateInvoice(invoice: Invoice): Observable<Invoice> {
    return new Observable(observer => {
      try {
        const index = this.invoices$.value.findIndex(inv => inv.invoiceId === invoice.invoiceId);
        
        if (index === -1) {
          throw new Error('Invoice not found');
        }

        invoice.updatedAt = new Date();
        const updated = [...this.invoices$.value];
        updated[index] = invoice;
        
        this.invoices$.next(updated);
        this.persistInvoices(updated);

        observer.next(invoice);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Anula uma fatura (cria nota de crédito)
   */
  cancelInvoice(invoiceId: string, reason: string): Observable<Invoice> {
    return new Observable(observer => {
      try {
        const original = this.invoices$.value.find(inv => inv.invoiceId === invoiceId);
        
        if (!original) {
          throw new Error('Invoice not found');
        }

        // Marcar original como cancelada
        original.documentStatus = 'A';
        original.updatedAt = new Date();

        // Criar nota de crédito
        const creditNote: Invoice = {
          invoiceId: uuidv4(),
          documentNo: this.generateDocumentNumber('NC'),
          documentType: 'NC',
          documentDate: new Date(),
          documentStatus: 'N',
          schemaVersion: '1.0',
          submissionGUID: uuidv4(),
          submissionTimeStamp: this.formatISO8601(new Date()),
          taxRegistrationNumber: original.taxRegistrationNumber,
          softwareInfo: original.softwareInfo,
          customer: original.customer,
          lines: original.lines.map(line => ({
            ...line,
            creditAmount: line.debitAmount, // Inverter débito/crédito
            debitAmount: undefined
          })),
          documentTotals: {
            ...original.documentTotals,
            taxPayable: -original.documentTotals.taxPayable,
            netTotal: -original.documentTotals.netTotal,
            grossTotal: -original.documentTotals.grossTotal,
            currency: original.documentTotals.currency
          },
          reference: {
            reference: original.documentNo,
            reason
          },
          jwsSignature: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        };

        creditNote.jwsSignature = this.digitalSignature.signInvoice(creditNote);
        creditNote.qrCodeData = this.generateQRCodeData(creditNote);

        // Persistir ambas
        const updated = [...this.invoices$.value];
        const originalIndex = updated.findIndex(inv => inv.invoiceId === invoiceId);
        updated[originalIndex] = original;
        updated.push(creditNote);

        this.invoices$.next(updated);
        this.persistInvoices(updated);

        observer.next(creditNote);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Gera o número do documento
   */
  private generateDocumentNumber(documentType: DocumentType): string {
    const series = this.documentSeries.getActiveSeries(documentType);
    
    if (!series) {
      throw new Error(`No active series for document type ${documentType}`);
    }

    const nextNumber = series.currentNumber.toString().padStart(6, '0');
    return `${series.seriesCode}-${nextNumber}`;
  }

  /**
   * Cria objeto de totais do documento
   */
  private createDocumentTotals(lines: InvoiceLineItem[]): DocumentTotals {
    const productCategories = new Map<string, string>();
    lines.forEach(line => {
      productCategories.set(line.productCode, 'SPARE_PARTS');
    });

    const { netTotal, taxPayable, grossTotal } = 
      this.taxCalculator.calculateDocumentTotals(lines, productCategories);

    const currency: CurrencyInfo = {
      currencyCode: 'AOA',
      currencyAmount: grossTotal,
      exchangeRate: 1.0
    };

    return {
      taxPayable,
      netTotal,
      grossTotal,
      currency
    };
  }

  /**
   * Formata data em ISO 8601 com timezone
   */
  private formatISO8601(date: Date): string {
    const offset = date.getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const hours = Math.abs(Math.floor(offset / 60)).toString().padStart(2, '0');
    const minutes = Math.abs(offset % 60).toString().padStart(2, '0');
    
    const isoString = date.toISOString().split('Z')[0];
    return `${isoString}${sign}${hours}:${minutes}`;
  }

  /**
   * Gera dados para QR Code
   */
  private generateQRCodeData(invoice: Invoice): string {
    const baseUrl = 'https://portaldocontribuinte.minfin.gov.ao/consultar-fe';
    return `${baseUrl}?documentNo=${encodeURIComponent(invoice.documentNo)}&nif=${invoice.taxRegistrationNumber}`;
  }

  /**
   * Persiste uma fatura (será substituído por API call)
   */
  private persistInvoice(invoice: Invoice): void {
    const all = [...this.invoices$.value, invoice];
    this.persistInvoices(all);
  }

  /**
   * Persiste múltiplas faturas no localStorage
   */
  private persistInvoices(invoices: Invoice[]): void {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error persisting invoices', error);
    }
  }

  /**
   * Carrega faturas do localStorage
   */
  private loadInvoicesFromStorage(): void {
    try {
      const stored = localStorage.getItem('invoices');
      if (stored) {
        const invoices = JSON.parse(stored);
        this.invoices$.next(invoices);
      }
    } catch (error) {
      console.error('Error loading invoices from storage', error);
    }
  }

  /**
   * Limpa todas as faturas (apenas para desenvolvimento)
   */
  clearAll(): void {
    this.invoices$.next([]);
    localStorage.removeItem('invoices');
  }
}
