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
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  
  errorMessage: string = '';
  emailError: string = '';
  passwordError: string = '';

  constructor(private router: Router) {}

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

    try {
      // Simular chamada de API
      await this.simulateApiCall();
      
      // Simular validação
      if (this.email === 'admin@pjlimitada.com' && this.password === 'admin123') {
        // Login bem-sucedido
        localStorage.setItem('user', JSON.stringify({
          email: this.email,
          name: 'Administrador',
          rememberMe: this.rememberMe
        }));
        
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'E-mail ou senha incorretos';
      }
    } catch (error) {
      this.errorMessage = 'Erro ao fazer login. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  private simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500); // Simular delay de rede
    });
  }
}
