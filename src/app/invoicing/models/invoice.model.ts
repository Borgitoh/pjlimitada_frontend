/**
 * Modelo de Fatura Eletrônica
 * Baseado no Decreto Executivo nº 683/25 da República de Angola
 */

export interface SoftwareInfo {
  productId: string;              // Nome do software (ex: "PJ-Limitada-Faturacao")
  productVersion: string;         // Versão do software
  softwareValidationNumber: string; // Número de certificação AGT
}

export interface CustomerInfo {
  taxId: string;                  // NIF (15 dígitos) ou estrangeiro (999999999)
  country: string;                // Código ISO 3166-1-alpha-2 (ex: "AO") ou "AO-CAB"
  companyName: string;            // Razão social (máx 200 caracteres)
}

export interface CurrencyInfo {
  currencyCode: string;           // "AOA" para moeda angolana
  currencyAmount: number;         // Valor em moeda estrangeira
  exchangeRate: number;           // Taxa de câmbio para AOA
}

export interface DocumentTotals {
  taxPayable: number;             // Total de impostos devidos
  netTotal: number;               // Total sem impostos
  grossTotal: number;             // Total com impostos
  currency: CurrencyInfo;
}

export interface WithholdingTax {
  withholdingTaxType: string;     // IRT, II, IS, IVA, IP, IAC, OU, IRPC, IRPS
  withholdingTaxDescription?: string; // Descrição do motivo
  withholdingTaxAmount: number;   // Valor de retenção
}

export type DocumentStatus = 'N' | 'S' | 'A' | 'C' | 'R' | 'RJ' | 'V' | 'P' | 'I';
export type ValidationStatus = 'V' | 'P' | '';
export type DocumentType = 
  | 'FA'  // Fatura de Adiantamento
  | 'FT'  // Fatura
  | 'FR'  // Fatura/Recibo
  | 'FG'  // Fatura Global
  | 'AC'  // Aviso de Cobrança
  | 'AR'  // Aviso de Cobrança/Recibo
  | 'TV'  // Talão de Venda
  | 'RC'  // Recibo Emitido
  | 'RG'  // Recibo
  | 'RE'  // Estorno ou Recibo de Estorno
  | 'ND'  // Nota de Débito
  | 'NC'  // Nota de Crédito
  | 'AF'  // Fatura/Recibo de Autofacturação
  | 'RP'  // Prémio ou Recibo de Prémio
  | 'RA'  // Resseguro Aceite
  | 'CS'  // Imputação a Co-seguradoras
  | 'LD'; // Imputação a Co-seguradora Lider

export interface Invoice {
  // Identificação Principal
  invoiceId: string;              // UUID único
  documentNo: string;             // Número do documento (ex: "FAT-2025-000001")
  documentType: DocumentType;
  documentDate: Date;
  documentStatus: DocumentStatus;
  
  // Metadados de Faturação Eletrônica
  schemaVersion: string;          // "1.0"
  submissionGUID: string;         // UUID da submissão
  submissionTimeStamp: string;    // ISO 8601 com timezone
  
  // Contribuinte Emissor
  taxRegistrationNumber: string;  // NIF da PJ Limitada (15 dígitos)
  
  // Software de Faturação
  softwareInfo: SoftwareInfo;
  
  // Cliente/Adquirente
  customer: CustomerInfo;
  
  // Itens da Fatura
  lines: InvoiceLineItem[];
  
  // Totalizações
  documentTotals: DocumentTotals;
  
  // Retenções Opcionais
  withholdingTaxList?: WithholdingTax[];
  
  // Dados de Pagamento (para recibos)
  paymentReceipt?: PaymentReceipt;
  
  // Referência (para notas de crédito/débito)
  reference?: InvoiceReference;
  
  // Assinatura Digital
  jwsSignature: string;           // JWS com RS256
  
  // Status de Validação (após submissão à AGT)
  validationStatus?: ValidationStatus;
  rejectedDocumentNo?: string;    // Se NC referencia outro doc rejeitado
  
  // QR Code
  qrCodeData?: string;            // Dados para gerar QR code
  
  // Rastreamento
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;              // Usuário que criou
  sourceSaleId?: string;          // ID da venda no admin/e-commerce
  sourceModule?: string;          // Origem da emissão
}

export interface InvoiceLineItem {
  lineNumber: number;             // Sequencial (1, 2, 3...)
  productCode: string;            // Código do produto/serviço
  productDescription: string;     // Descrição (máx 200 caracteres)
  quantity: number;               // Inteiro ou decimal
  unitOfMeasure: string;          // UN, KG, LT, etc (máx 20 caracteres)
  unitPrice: number;              // Preço sem descontos
  unitPriceBase: number;          // Preço após descontos por linha
  
  // Descontos e Encargos
  settlementAmount?: number;      // Valor do desconto/encargo
  
  // Referência (para devoluções)
  reference?: LineItemReference;
  
  // Impostos
  taxes: TaxDetail[];
  
  // Totais da Linha
  debitAmount?: number;           // Débito (vendas)
  creditAmount?: number;          // Crédito (devoluções)
}

export interface LineItemReference {
  reference: string;              // Número do documento origem
  reason: string;                 // Motivo da referência
}

export interface TaxDetail {
  taxType: 'IVA' | 'IS' | 'IEC' | 'NS';  // Tipo de imposto
  taxCountryRegion: string;       // "AO" ou código ISO 3166, ou "AO-CAB"
  taxCode: string;                // Código específico (NOR, INT, RED, ISE, etc)
  taxBase: number;                // Base tributável
  taxPercentage: number;          // Percentual (14 = 14%)
  taxAmount: number;              // Valor calculado do imposto
  taxContribution: number;        // Contribuição (pode diferir do amount)
  taxExemptionCode?: string;      // Código de isenção (3 caracteres)
}

export interface PaymentReceipt {
  paymentDate?: Date;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'OTHER';
  bankDetails?: string;
}

export interface InvoiceReference {
  reference: string;              // Número do documento referenciado
  reason: string;                 // Motivo da devolução/ajuste
}

/**
 * DTO para criar fatura a partir do checkout
 */
export interface CreateInvoiceDTO {
  documentType: DocumentType;
  customer: CustomerInfo;
  lines: InvoiceLineItem[];
  paymentMethod?: string;
  notes?: string;
}

/**
 * Resposta de validação da AGT
 */
export interface ValidationResponse {
  requestId: string;
  resultCode: number;
  documentNo: string;
  validationStatus: ValidationStatus;
  timestamp: Date;
}

/**
 * Série de Numeração
 */
export interface DocumentSeries {
  seriesCode: string;             // Código da série (3-60 caracteres)
  seriesYear: number;             // Ano (2025, 2026, etc)
  documentType: DocumentType;
  firstDocumentNumber: number;    // Primeiro número da série
  currentNumber: number;          // Próximo número a usar
  seriesStatus: 'A' | 'U' | 'F';  // Aberta, Em uso, Fechada
  createdAt: Date;
  requestedFrom: Date;            // Data da solicitação à AGT
  approvedAt?: Date;              // Data de aprovação
}
