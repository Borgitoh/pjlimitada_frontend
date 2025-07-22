import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;
  acceptNewsletter: boolean = false;
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  
  errorMessage: string = '';
  successMessage: string = '';
  nameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  termsError: string = '';

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(): number {
    let strength = 0;
    
    if (this.password.length >= 8) strength++;
    if (/[a-z]/.test(this.password)) strength++;
    if (/[A-Z]/.test(this.password)) strength++;
    if (/[0-9]/.test(this.password)) strength++;
    if (/[^A-Za-z0-9]/.test(this.password)) strength++;
    
    return Math.min(strength, 4);
  }

  getPasswordStrengthClass(index: number): string {
    const strength = this.getPasswordStrength();
    
    if (index >= strength) return 'bg-gray-200';
    
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-yellow-500';
    if (strength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    
    if (!this.password) return '';
    if (strength <= 1) return 'Senha muito fraca';
    if (strength <= 2) return 'Senha fraca';
    if (strength <= 3) return 'Senha média';
    return 'Senha forte';
  }

  getPasswordStrengthTextClass(): string {
    const strength = this.getPasswordStrength();
    
    if (!this.password) return 'text-gray-500';
    if (strength <= 1) return 'text-red-500';
    if (strength <= 2) return 'text-yellow-500';
    if (strength <= 3) return 'text-blue-500';
    return 'text-green-500';
  }

  validateForm(): boolean {
    this.clearErrors();
    let isValid = true;

    // Validar nome
    if (!this.name.trim()) {
      this.nameError = 'Nome é obrigatório';
      isValid = false;
    } else if (this.name.trim().length < 2) {
      this.nameError = 'Nome deve ter pelo menos 2 caracteres';
      isValid = false;
    }

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
    } else if (this.password.length < 8) {
      this.passwordError = 'Senha deve ter pelo menos 8 caracteres';
      isValid = false;
    } else if (this.getPasswordStrength() < 3) {
      this.passwordError = 'Senha deve conter pelo menos: maiúscula, minúscula e número';
      isValid = false;
    }

    // Validar confirmação de senha
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirmação de senha é obrigatória';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Senhas não coincidem';
      isValid = false;
    }

    // Validar termos
    if (!this.acceptTerms) {
      this.termsError = 'Você deve aceitar os termos de uso';
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
    this.successMessage = '';
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.termsError = '';
  }

  async register() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.clearErrors();

    try {
      // Simular chamada de API
      await this.simulateApiCall();
      
      // Simular validação de email único
      if (this.email === 'admin@pjlimitada.com') {
        this.errorMessage = 'Este e-mail já está cadastrado';
        return;
      }
      
      // Registro bem-sucedido
      this.successMessage = 'Conta criada com sucesso! Redirecionando...';
      
      // Simular salvamento
      localStorage.setItem('user', JSON.stringify({
        name: this.name,
        email: this.email,
        phone: this.phone,
        newsletter: this.acceptNewsletter,
        createdAt: new Date().toISOString()
      }));
      
      // Redirecionar após sucesso
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (error) {
      this.errorMessage = 'Erro ao criar conta. Tente novamente.';
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
