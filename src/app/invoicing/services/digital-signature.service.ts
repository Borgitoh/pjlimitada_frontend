import { Injectable } from '@angular/core';
import { Invoice } from '../models/invoice.model';

/**
 * Serviço para assinatura digital de faturas em formato JWS (JSON Web Signature)
 * Implementação simplificada - em produção usar biblioteca como jose ou jsonwebtoken
 */
@Injectable({
  providedIn: 'root'
})
export class DigitalSignatureService {

  /**
   * Campos que devem ser incluídos na assinatura de acordo com o decreto
   */
  private readonly SIGNATURE_FIELDS = [
    'taxRegistrationNumber',
    'documentNo',
    'documentType',
    'documentDate',
    'customer.taxId',
    'customer.country',
    'customer.companyName',
    'lines[].lineNumber',
    'lines[].quantity',
    'lines[].unitPriceBase',
    'lines[].taxes[].taxPercentage',
    'documentTotals.netTotal',
    'documentTotals.grossTotal'
  ];

  constructor() { }

  /**
   * Assina uma fatura com JWS
   * 
   * Nota: Esta é uma implementação simulada. Em produção, usar:
   * - Biblioteca 'jose' para JWS/JWT completo
   * - Chave privada do servidor armazenada de forma segura (HSM, KMS)
   * - Algoritmo RS256 (RSA-2048 ou superior)
   * 
   * @param invoice Fatura a ser assinada
   * @returns String de assinatura JWS
   */
  signInvoice(invoice: Invoice): string {
    try {
      // 1. Extrair campos para assinatura
      const dataToSign = this.extractSignatureData(invoice);

      // 2. Converter para JSON e fazer hash
      const payload = JSON.stringify(dataToSign);
      const hash = this.simpleHash(payload);

      // 3. Simular assinatura (em produção usar RSA com chave privada)
      const signature = this.simulateRSASignature(hash);

      // 4. Criar estrutura JWS simplificada
      // Formato real: Base64(header).Base64(payload).Base64(signature)
      const jws = this.createJWSToken(payload, signature);

      return jws;
    } catch (error) {
      throw new Error(`Failed to sign invoice: ${error}`);
    }
  }

  /**
   * Valida a assinatura de uma fatura
   * 
   * @param invoice Fatura com assinatura
   * @param publicKey Chave pública para validação (não implementado aqui)
   * @returns true se assinatura válida
   */
  verifySignature(invoice: Invoice, publicKey?: string): boolean {
    try {
      if (!invoice.jwsSignature) {
        return false;
      }

      // Validação simplificada - em produção fazer verificação real com chave pública
      return this.validateJWSFormat(invoice.jwsSignature);
    } catch (error) {
      console.error('Signature verification failed', error);
      return false;
    }
  }

  /**
   * Extrai os dados que devem ser assinados
   */
  private extractSignatureData(invoice: Invoice): any {
    return {
      taxRegistrationNumber: invoice.taxRegistrationNumber,
      documentNo: invoice.documentNo,
      documentType: invoice.documentType,
      documentDate: invoice.documentDate,
      customer: {
        taxId: invoice.customer.taxId,
        country: invoice.customer.country,
        companyName: invoice.customer.companyName
      },
      lines: invoice.lines.map(line => ({
        lineNumber: line.lineNumber,
        quantity: line.quantity,
        unitPriceBase: line.unitPriceBase,
        taxes: line.taxes.map(tax => ({
          taxPercentage: tax.taxPercentage,
          taxAmount: tax.taxAmount
        }))
      })),
      documentTotals: {
        netTotal: invoice.documentTotals.netTotal,
        grossTotal: invoice.documentTotals.grossTotal,
        taxPayable: invoice.documentTotals.taxPayable
      }
    };
  }

  /**
   * Função hash simplificada (em produção usar SHA-256)
   */
  private simpleHash(data: string): string {
    // Implementação simplificada de hash
    // Em produção usar crypto-js ou Crypto API nativa
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para inteiro 32-bit
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Simula assinatura RSA (em produção usar Crypto API)
   */
  private simulateRSASignature(hash: string): string {
    // Simulação - em produção usar bibliotecas como 'node-rsa' ou 'jsrsasign'
    // Usar chave privada do servidor de forma segura
    const timestamp = new Date().getTime().toString();
    const combined = hash + timestamp;
    
    // Retornar uma assinatura simulada em base64
    return btoa(combined).substring(0, 128);
  }

  /**
   * Cria token JWS (simplificado)
   * Formato real JWS: Base64url(header).Base64url(payload).Base64url(signature)
   */
  private createJWSToken(payload: string, signature: string): string {
    // Header JWS simplificado
    const header = {
      alg: 'RS256',
      typ: 'JWS',
      kid: 'AGT-2025-0001' // Key ID do certificado
    };

    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(payload);
    const signatureB64 = signature;

    // Formato JWS: header.payload.signature
    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  /**
   * Valida formato de JWS
   */
  private validateJWSFormat(jws: string): boolean {
    const parts = jws.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Tentar decodificar header
      const header = JSON.parse(atob(parts[0]));
      
      // Verificar campos obrigatórios
      return header.alg === 'RS256' && header.typ === 'JWS';
    } catch {
      return false;
    }
  }

  /**
   * Extrai informações do JWS (para debug)
   */
  decodeJWS(jws: string): { header: any; payload: any } | null {
    try {
      const parts = jws.split('.');
      if (parts.length !== 3) {
        return null;
      }

      return {
        header: JSON.parse(atob(parts[0])),
        payload: JSON.parse(atob(parts[1]))
      };
    } catch {
      return null;
    }
  }

  /**
   * Retorna a configuração necessária para implementação real de JWS
   */
  getImplementationNotes(): string {
    return `
    IMPLEMENTAÇÃO REAL DE JWS:
    
    1. Instalar dependências:
       npm install jose
    
    2. Importar e usar:
       import { SignJWT } from 'jose';
       
       const secret = new TextEncoder().encode(process.env.SIGNING_KEY);
       const token = await new SignJWT(payload)
         .setProtectedHeader({ alg: 'RS256', typ: 'JWS' })
         .setIssuedAt()
         .sign(privateKey);
    
    3. Armazenar chave privada:
       - Azure Key Vault
       - AWS KMS
       - HashiCorp Vault
       - HSM (Hardware Security Module)
    
    4. Validar assinatura:
       import { jwtVerify } from 'jose';
       const verified = await jwtVerify(token, publicKey);
    `;
  }
}
