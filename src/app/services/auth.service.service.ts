import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  active?: boolean;
}
interface LoginPayload {
  login: string;
  password: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  // Dados demo de usuários
  private demoUsers = [
    {
      id: '1',
      name: 'Admin PJ Limitada',
      email: 'admin@pjlimitada.com',
      role: 'admin',
      active: true,
      last_login: new Date('2026-06-15')
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: 'vendedor',
      active: true,
      last_login: new Date('2026-06-14')
    },
    {
      id: 'afiliado-002',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: 'contador',
      active: true,
      last_login: new Date('2026-06-13')
    }
  ];

  constructor(private http: HttpClient) { }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }
  login(payload: LoginPayload): Observable<any> {
    // Primeiro tenta a API real
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      // Se houver erro, tenta dados demo
      catchError(() => {
        // Procura o usuário nos dados demo
        const demoUser = this.demoUsers.find(u => u.email === payload.login);
        if (demoUser) {
          return of({
            user: demoUser,
            token: 'demo-token-' + demoUser.id
          });
        }
        // Se não encontrar, rejeita
        return throwError(() => new Error('Usuário não encontrado'));
      })
    );
  }
  getUsers(): Observable<any> {
    // Primeiro tenta a API real, se falhar retorna dados demo
    return this.http.get(`${this.apiUrl}/get-user`).pipe(
      // Se houver erro, retorna dados demo
      catchError(() => {
        return of({ users: this.demoUsers });
      })
    );
  }
  updateUser(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-user/${id}`, payload);
  }

}
