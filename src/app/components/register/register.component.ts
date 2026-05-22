import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  nif: string = '';
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
  nifError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  termsError: string = '';

  constructor(private router: Router,
    private authService: AuthService) { }

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
    // Validar NIF
    if (!this.nif) {
      this.nifError = 'NIF é obrigatório';
      isValid = false;

    } else if (!this.isValidNif(this.nif)) {
      this.nifError = 'NIF inválido';
      isValid = false;
    }

    return isValid;
  }
  onNifInput(): void {
    this.nif = this.nif.replace(/\s/g, '').toUpperCase();

    // limite fixo
    if (this.nif.length > 14) {
      this.nif = this.nif.substring(0, 14);
    }

    this.validateNifLive();
  }
  validateNifLive(): void {
    this.nifError = '';

    if (!this.nif) return;

    const value = this.nif;

    // regras parciais (enquanto escreve)

    // 1. só números no início (até 9)
    if (value.length <= 9) {
      if (!/^[0-9]*$/.test(value)) {
        this.nifError = 'Os primeiros 9 caracteres devem ser números';
        return;
      }
    }

    // 2. parte das letras (posição 10-11)
    if (value.length > 9 && value.length <= 11) {
      const letters = value.substring(9);
      if (!/^[A-Z]*$/.test(letters)) {
        this.nifError = 'A posição 10-11 deve conter letras';
        return;
      }
    }

    // 3. parte final números (12-14)
    if (value.length > 11) {
      const last = value.substring(11);
      if (!/^[0-9]*$/.test(last)) {
        this.nifError = 'Os últimos 3 caracteres devem ser números';
        return;
      }
    }

    // 4. validação final completa
    if (value.length === 14) {
      const regex = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;

      if (!regex.test(value)) {
        this.nifError = 'Formato inválido de NIF';
      }
    }
  }

  validateNifField(): void {
    this.nifError = '';

    if (!this.nif) {
      this.nifError = 'NIF é obrigatório';
      return;
    }

    // remove espaços e força maiúsculas
    const nif = this.nif.replace(/\s/g, '').toUpperCase();

    // tamanho exato
    if (nif.length !== 14) {
      this.nifError = 'NIF deve ter exatamente 14 caracteres';
      return;
    }

    // REGRA PRINCIPAL: 9 números + 2 letras + 3 números
    const regex = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;

    if (!regex.test(nif)) {
      this.nifError = 'Formato inválido. Use: 9 números + 2 letras + 3 números';
      return;
    }
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
    this.nifError = '';
  }
  isValidNif(nif: string): boolean {

    if (!nif) return false;

    nif = nif.replace(/\s/g, '').toUpperCase();

    // tamanho aceitável (ajusta se quiseres mais restrito)
    if (nif.length < 10 || nif.length > 15) {
      return false;
    }

    // deve conter pelo menos 1 número
    if (!/[0-9]/.test(nif)) {
      return false;
    }

    // deve conter pelo menos 1 letra (porque teu exemplo tem LA)
    if (!/[A-Z]/.test(nif)) {
      return false;
    }

    return true;
  }

  async register() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.clearErrors();

    const payload = {
      nome: this.name,
      email: this.email,
      telefone: this.phone,
      nif: this.nif,
      senha: this.password,
      role: 'cliente',
      activo: true
    };
    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        if (err.status === 422 && err.error.errors) {
          const errors = err.error.errors;
          this.nameError = errors.name ? errors.name[0] : '';
          this.emailError = errors.email ? errors.email[0] : '';
          this.passwordError = errors.password ? errors.password[0] : '';
        } else {
          this.errorMessage = 'Erro ao criar conta. Tente novamente.';
        }
      },
      complete: () => this.isLoading = false
    });
  }
}
