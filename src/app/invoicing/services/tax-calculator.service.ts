import { Injectable } from '@angular/core';
import { TaxDetail, InvoiceLineItem } from '../models/invoice.model';

/**
 * Tipo para as taxas de IVA disponíveis
 */
export type IVA_RATE = 'NORMAL' | 'INTERMEDIATE' | 'REDUCED' | 'EXEMPT';

/**
 * Serviço para cálculo de impostos baseado na legislação angolana
 * Referência: Decreto Executivo nº 683/25
 */
@Injectable({
  providedIn: 'root'
})
export class TaxCalculatorService {

  /**
   * Tabelas de Impostos de acordo com a legislação
   */
  private readonly IVA_RATES = {
    NORMAL: 14,      // Taxa normal
    INTERMEDIATE: 7, // Taxa intermdia
    REDUCED: 5,      // Taxa reduzida
    EXEMPT: 0        // Isento
  };

  private readonly IEC_RATES: { [key: string]: number } = {
    'ALCOHOLIC_BEVERAGES': 15,  // Bebidas alcoólicas
    'BEER_NON_ALCOHOLIC': 4,    // Cerveja sem álcool
    'WINE': 8,                  // Vinho
    'SPIRITS': 8,               // Bebidas destiladas
    'TOBACCO': 25,              // Tabaco
    'FUEL_GASOLINE': 5,         // Combustível - gasolina
    'FUEL_DIESEL': 5,           // Combustível - diesel
    'TIRES': 5,                 // Pneus
    'VEHICLES_LIGHT': 5,        // Veículos ligeiros
    'VEHICLES_HEAVY': 5         // Veículos pesados
  };

  // Mapeamento de categorias de produto para tipos de imposto
  private readonly PRODUCT_TAX_MAPPING: { [key: string]: IVA_RATE } = {
    'SPARE_PARTS': 'NORMAL',      // Peças de reposição: IVA 14%
    'BODYKIT': 'NORMAL',          // Bodykits: IVA 14%
    'VEHICLE_IMPORT': 'NORMAL',   // Importação veículos: IVA 14%
    'MAINTENANCE': 'NORMAL',      // Serviços: IVA 14%
    'ACCESSORIES': 'NORMAL'       // Acessórios: IVA 14%
  };

  constructor() { }

  /**
   * Calcula os impostos de uma linha de fatura
   * @param lineItem Item da fatura
   * @param productCategory Categoria do produto (para determinar taxa)
   * @param country País de entrega (afeta localização do imposto)
   * @returns Array de detalhes de imposto
   */
  calculateLineItemTaxes(
    lineItem: InvoiceLineItem,
    productCategory: string,
    country: string = 'AO'
  ): TaxDetail[] {
    const taxes: TaxDetail[] = [];

    // Calcular base tributável (quantidade × preço unitário)
    const baseAmount = lineItem.quantity * lineItem.unitPriceBase;

    // Determinar taxa IVA baseada na categoria do produto
    const ivaRate = this.getIVARate(productCategory);

    // Calcular IVA
    if (ivaRate !== 'EXEMPT') {
      const ivaPercentage = this.IVA_RATES[ivaRate];
      const ivaTax = this.calculateTax(baseAmount, ivaPercentage);

      taxes.push({
        taxType: 'IVA',
        taxCountryRegion: country,
        taxCode: this.getIVACode(ivaRate),
        taxBase: baseAmount,
        taxPercentage: ivaPercentage,
        taxAmount: ivaTax,
        taxContribution: ivaTax
      });
    }

    // Verificar se há Imposto Especial de Consumo (IEC)
    const iecRate = this.getIECRate(productCategory);
    if (iecRate) {
      const iecAmount = this.calculateTax(baseAmount, iecRate);

      taxes.push({
        taxType: 'IEC',
        taxCountryRegion: country,
        taxCode: this.getIECCode(productCategory),
        taxBase: baseAmount,
        taxPercentage: iecRate,
        taxAmount: iecAmount,
        taxContribution: iecAmount
      });
    }

    return taxes;
  }

  /**
   * Calcula o total de impostos de uma fatura
   * @param lineItems Items da fatura
   * @param productCategories Mapa de code -> categoria
   * @returns Total de impostos
   */
  calculateTotalTaxes(
    lineItems: InvoiceLineItem[],
    productCategories: Map<string, string> = new Map()
  ): number {
    let totalTax = 0;

    lineItems.forEach(line => {
      const category = productCategories.get(line.productCode) || 'SPARE_PARTS';
      const taxes = this.calculateLineItemTaxes(line, category);
      
      taxes.forEach(tax => {
        totalTax += tax.taxAmount;
      });
    });

    return Math.round(totalTax * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Calcula totais da fatura (net, tax, gross)
   * @param lineItems Items da fatura
   * @param productCategories Mapa de categoria por produto
   * @returns Objeto com totais
   */
  calculateDocumentTotals(
    lineItems: InvoiceLineItem[],
    productCategories: Map<string, string> = new Map()
  ): { netTotal: number; taxPayable: number; grossTotal: number } {
    let netTotal = 0;
    let taxPayable = 0;

    lineItems.forEach(line => {
      const baseAmount = line.quantity * line.unitPriceBase;
      netTotal += baseAmount;

      const category = productCategories.get(line.productCode) || 'SPARE_PARTS';
      const taxes = this.calculateLineItemTaxes(line, category);
      
      taxes.forEach(tax => {
        taxPayable += tax.taxAmount;
      });
    });

    netTotal = Math.round(netTotal * 100) / 100;
    taxPayable = Math.round(taxPayable * 100) / 100;
    const grossTotal = Math.round((netTotal + taxPayable) * 100) / 100;

    return { netTotal, taxPayable, grossTotal };
  }

  /**
   * Obtém a taxa IVA para uma categoria de produto
   */
  private getIVARate(productCategory: string): IVA_RATE {
    const defaultRate: IVA_RATE = 'NORMAL';
    return this.PRODUCT_TAX_MAPPING[productCategory] || defaultRate;
  }

  /**
   * Obtém o código de taxa IVA
   */
  private getIVACode(rateType: IVA_RATE): string {
    switch (rateType) {
      case 'NORMAL':
        return 'NOR';
      case 'INTERMEDIATE':
        return 'INT';
      case 'REDUCED':
        return 'RED';
      case 'EXEMPT':
        return 'ISE';
      default:
        return 'NOR';
    }
  }

  /**
   * Obtém a taxa de IEC para um produto, se aplicável
   */
  private getIECRate(productCategory: string): number | null {
    const iecKey = Object.keys(this.IEC_RATES).find(key =>
      productCategory.toUpperCase().includes(key.toUpperCase())
    );

    return iecKey ? this.IEC_RATES[iecKey] : null;
  }

  /**
   * Obtém o código de IEC
   */
  private getIECCode(productCategory: string): string {
    // Verificar se é categoria que tem IEC
    if (productCategory.toUpperCase().includes('VEHICLE')) {
      return '4012';
    }
    if (productCategory.toUpperCase().includes('FUEL')) {
      return '2710';
    }
    if (productCategory.toUpperCase().includes('TOBACCO')) {
      return '2401';
    }
    if (productCategory.toUpperCase().includes('ALCOHOL') || 
        productCategory.toUpperCase().includes('BEVERAGE')) {
      return '2204';
    }
    return 'IEC';
  }

  /**
   * Calcula um imposto específico com arredondamento
   */
  private calculateTax(baseAmount: number, taxPercentage: number): number {
    const rawTax = baseAmount * (taxPercentage / 100);
    // Arredondar para cima ao centavo seguinte
    return Math.ceil(rawTax * 100) / 100;
  }

  /**
   * Valida se uma taxa de imposto é válida
   */
  isValidTaxRate(
    taxType: string,
    taxPercentage: number,
    country: string
  ): boolean {
    if (taxType === 'IVA') {
      return Object.values(this.IVA_RATES).includes(taxPercentage);
    }

    if (taxType === 'IEC') {
      return Object.values(this.IEC_RATES).includes(taxPercentage);
    }

    return false;
  }

  /**
   * Retorna as taxas IVA disponíveis
   */
  getAvailableIVARates(): { label: string; value: number }[] {
    return [
      { label: 'Taxa Normal (14%)', value: this.IVA_RATES.NORMAL },
      { label: 'Taxa Intermdia (7%)', value: this.IVA_RATES.INTERMEDIATE },
      { label: 'Taxa Reduzida (5%)', value: this.IVA_RATES.REDUCED },
      { label: 'Isento (0%)', value: this.IVA_RATES.EXEMPT }
    ];
  }

  /**
   * Obtém lista de categorias de produto com seus impostos
   */
  getProductCategories(): { code: string; label: string; ivaRate: number; iecRate?: number }[] {
    return [
      {
        code: 'SPARE_PARTS',
        label: 'Peças de Reposição',
        ivaRate: this.IVA_RATES.NORMAL
      },
      {
        code: 'BODYKIT',
        label: 'Bodykit',
        ivaRate: this.IVA_RATES.NORMAL
      },
      {
        code: 'VEHICLE_IMPORT',
        label: 'Importação de Veículos',
        ivaRate: this.IVA_RATES.NORMAL,
        iecRate: this.IEC_RATES['VEHICLES_LIGHT']
      },
      {
        code: 'MAINTENANCE',
        label: 'Serviços de Manutenção',
        ivaRate: this.IVA_RATES.NORMAL
      },
      {
        code: 'ACCESSORIES',
        label: 'Acessórios',
        ivaRate: this.IVA_RATES.NORMAL
      }
    ];
  }
}
