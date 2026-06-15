import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  errorMessage: string = '';
  emailError: string = '';
  passwordError: string = '';

  // Dados demo de usuários
  private demoUsers = [
    { id: '1', name: 'Admin PJ Limitada', email: 'admin@pjlimitada.com', role: 'admin', active: true },
    { id: '2', name: 'João Silva', email: 'joao@empresa.com', role: 'vendedor', active: true },
    { id: 'afiliado-002', name: 'Maria Santos', email: 'maria@empresa.com', role: 'contador', active: true }
  ];

  constructor(private router: Router, private authService: AuthService) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validateForm(): boolean {
    this.clearErrors();
    let isValid = true;

    // Validar email
    if (!this.email) {
      this.emailError = 'E-mail é obrigatório';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'E-mail inválido';
      isValid = false;
    }

    // Validar senha
    if (!this.password) {
      this.passwordError = 'Senha é obrigatória';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearErrors() {
    this.errorMessage = '';
    this.emailError = '';
    this.passwordError = '';
  }

  async login() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.clearErrors();
    const payload = {
      login: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        // Supondo que a API retorne usuário e token
        localStorage.setItem('user', JSON.stringify({
          name: res.user.name,
          email: res.user.email,
          token: res.token,
          role: res.user.role,
          rememberMe: this.rememberMe
        }));

        this.router.navigate(['/']); // redireciona após login
      },
      error: (err) => {
        // Fallback: verificar se é um usuário demo
        const demoUser = this.demoUsers.find(u => u.email === this.email);

        if (demoUser) {
          // Login com dados demo (sem API)
          localStorage.setItem('user', JSON.stringify({
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            token: 'demo-token-' + demoUser.id,
            role: demoUser.role,
            rememberMe: this.rememberMe
          }));
          this.router.navigate(['/']); // redireciona após login
          return;
        }

        if (err.status === 422 && err.error.errors) {
          this.emailError = err.error.errors.email ? err.error.errors.email[0] : '';
          this.passwordError = err.error.errors.password ? err.error.errors.password[0] : '';
        } else if (err.status === 401) {
          this.errorMessage = 'E-mail ou senha incorretos';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  private simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500); // Simular delay de rede
    });
  }
}
