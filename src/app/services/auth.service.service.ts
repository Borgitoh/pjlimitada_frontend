import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 7
import { environment } from '../../environments/environment';

interface RegisterPayload {

  nome: string;
  nif: string;
  email: string;
  telefone?: string;
  senha: string;
  role?: string;
  activo?: boolean;
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

  constructor(private http: HttpClient) { }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }
  login(payload: LoginPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload);
  }
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-user`);
  }
  updateUser(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-user/${id}`, payload);
  }

}
