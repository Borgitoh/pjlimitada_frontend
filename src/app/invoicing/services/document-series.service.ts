import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DocumentSeries, DocumentType } from '../models/invoice.model';

/**
 * Serviço para gestão de séries de numeração de documentos
 * Baseado no Decreto Executivo nº 683/25 (Artigo 4º)
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentSeriesService {

  private series$ = new BehaviorSubject<DocumentSeries[]>([]);

  constructor() {
    this.initializeDefaultSeries();
  }

  /**
   * Inicializa séries padrão (será substituído por chamada à AGT)
   */
  private initializeDefaultSeries(): void {
    const defaultSeries: DocumentSeries[] = [
      {
        seriesCode: 'FAT',
        seriesYear: new Date().getFullYear(),
        documentType: 'FT',
        firstDocumentNumber: 1,
        currentNumber: 1,
        seriesStatus: 'A',
        createdAt: new Date(),
        requestedFrom: new Date(),
        approvedAt: new Date()
      },
      {
        seriesCode: 'REC',
        seriesYear: new Date().getFullYear(),
        documentType: 'FR',
        firstDocumentNumber: 1,
        currentNumber: 1,
        seriesStatus: 'A',
        createdAt: new Date(),
        requestedFrom: new Date(),
        approvedAt: new Date()
      },
      {
        seriesCode: 'NCD',
        seriesYear: new Date().getFullYear(),
        documentType: 'NC',
        firstDocumentNumber: 1,
        currentNumber: 1,
        seriesStatus: 'A',
        createdAt: new Date(),
        requestedFrom: new Date(),
        approvedAt: new Date()
      }
    ];

    this.series$.next(defaultSeries);
    this.persistSeries(defaultSeries);
  }

  /**
   * Obtém a série ativa para um tipo de documento
   */
  getActiveSeries(documentType: DocumentType): DocumentSeries | undefined {
    const series = this.series$.value.find(s =>
      s.documentType === documentType &&
      s.seriesStatus !== 'F' &&
      s.seriesYear === new Date().getFullYear()
    );

    return series;
  }

  /**
   * Incrementa o número da série para o próximo documento
   */
  incrementSeries(documentType: DocumentType): DocumentSeries | null {
    const series = this.getActiveSeries(documentType);
    
    if (!series) {
      return null;
    }

    series.currentNumber++;
    
    // Atualizar
    const updated = this.series$.value.map(s =>
      s.seriesCode === series.seriesCode ? series : s
    );
    
    this.series$.next(updated);
    this.persistSeries(updated);

    return series;
  }

  /**
   * Solicita uma nova série de numeração à AGT
   * Esta é uma operação que será integrada com o backend
   */
  requestNewSeries(
    documentType: DocumentType,
    seriesCode: string,
    year: number,
    firstDocumentNumber: number
  ): Observable<DocumentSeries> {
    return new Observable(observer => {
      try {
        // Validar série
        if (!this.validateSeriesCode(seriesCode)) {
          throw new Error('Invalid series code format');
        }

        // Verificar se já existe
        const existing = this.series$.value.find(s =>
          s.seriesCode === seriesCode && s.seriesYear === year
        );

        if (existing) {
          throw new Error('Series already exists');
        }

        // Criar nova série (inicialmente com status pendente)
        const newSeries: DocumentSeries = {
          seriesCode,
          seriesYear: year,
          documentType,
          firstDocumentNumber,
          currentNumber: firstDocumentNumber,
          seriesStatus: 'A', // Em desenvolvimento, já aprovada
          createdAt: new Date(),
          requestedFrom: new Date(),
          // approvedAt será preenchido pela AGT
        };

        // Adicionar
        const updated = [...this.series$.value, newSeries];
        this.series$.next(updated);
        this.persistSeries(updated);

        observer.next(newSeries);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Obtém todas as séries
   */
  getAllSeries(): Observable<DocumentSeries[]> {
    return this.series$.asObservable();
  }

  /**
   * Obtém séries por tipo de documento
   */
  getSeriesByDocumentType(documentType: DocumentType): Observable<DocumentSeries[]> {
    return new Observable(observer => {
      const filtered = this.series$.value.filter(s => s.documentType === documentType);
      observer.next(filtered);
      observer.complete();
    });
  }

  /**
   * Fecha uma série (após último documento do ano)
   */
  closeSeries(seriesCode: string, year: number): Observable<DocumentSeries> {
    return new Observable(observer => {
      try {
        const series = this.series$.value.find(s =>
          s.seriesCode === seriesCode && s.seriesYear === year
        );

        if (!series) {
          throw new Error('Series not found');
        }

        series.seriesStatus = 'F'; // Fechada

        const updated = this.series$.value.map(s =>
          s.seriesCode === seriesCode && s.seriesYear === year ? series : s
        );

        this.series$.next(updated);
        this.persistSeries(updated);

        observer.next(series);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Obtém informações sobre a solicitação de série
   * Será preenchido com dados retornados da AGT
   */
  getSeriesRequestStatus(seriesCode: string): {
    code: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestDate: Date;
    approvalDate?: Date;
  } | null {
    const series = this.series$.value.find(s => s.seriesCode === seriesCode);
    
    if (!series) {
      return null;
    }

    return {
      code: seriesCode,
      status: series.approvedAt ? 'APPROVED' : 'PENDING',
      requestDate: series.requestedFrom,
      approvalDate: series.approvedAt
    };
  }

  /**
   * Valida formato do código da série
   * Deve ter 3-60 caracteres alfanuméricos
   */
  private validateSeriesCode(code: string): boolean {
    const regex = /^[A-Za-z0-9]{3,60}$/;
    return regex.test(code);
  }

  /**
   * Persiste séries no localStorage (será substituído por API)
   */
  private persistSeries(series: DocumentSeries[]): void {
    try {
      localStorage.setItem('document_series', JSON.stringify(series));
    } catch (error) {
      console.error('Error persisting series', error);
    }
  }

  /**
   * Carrega séries do localStorage
   */
  private loadSeriesFromStorage(): void {
    try {
      const stored = localStorage.getItem('document_series');
      if (stored) {
        const series = JSON.parse(stored);
        this.series$.next(series);
      }
    } catch (error) {
      console.error('Error loading series from storage', error);
    }
  }

  /**
   * Retorna exemplo de requisição de série à AGT
   */
  getAGTRequestExample(seriesCode: string): string {
    return `
    POST /solicitar-serie HTTP/1.1
    Host: agtsistema.agt.gov.ao
    Content-Type: application/json
    
    {
      "schemaVersion": "1.0",
      "submissionGUID": "550e8400-e29b-41d4-a716-446655440000",
      "submissionTimeStamp": "2025-05-27T14:30:00+01:00",
      "taxRegistrationNumber": "1234567890123",
      "seriesCode": "${seriesCode}",
      "seriesYear": ${new Date().getFullYear()},
      "documentType": "FT",
      "firstDocumentNumber": 1,
      "jwsSignature": "eyJhbGciOiJSUzI1NiIs..."
    }
    `;
  }
}
