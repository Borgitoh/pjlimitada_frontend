import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  login(): void {
    // Usuário e senha fixos para fins de simulação
    const mockEmail = 'user@example.com';
    const mockPassword = 'password123';

    // Verificação simples do login
    if (this.email === mockEmail && this.password === mockPassword) {
      // Redirecionar para a página inicial (home) após login bem-sucedido
      this.router.navigate(['/']);
    } else {
      this.errorMessage = 'E-mail ou senha incorretos.';
    }
  }
}
