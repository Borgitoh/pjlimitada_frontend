// services.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico } from '../models/servico.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ServicesService {
 private apiUrl = `${environment.apiUrl}/servico`

  constructor(private http: HttpClient) {}

  // Listar serviços (paginação opcional)
  getServicos(page: number = 1): Observable<{data: Servico[], current_page: number, last_page: number}> {
    return this.http.get<{data: Servico[], current_page: number, last_page: number}>(`${this.apiUrl}?page=${page}`);
  }

  // Obter um serviço pelo id
  getServico(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }

  // Criar novo serviço
  createServico(servico: Partial<Servico>): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, servico);
  }

  // Atualizar serviço existente
  updateServico(id: number, servico: Partial<Servico>): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, servico);
  }

  // Deletar serviço
  deleteServico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alternar status ativo/inativo
  toggleServico(id: number, ativo: boolean): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, { ativo });
  }
}
