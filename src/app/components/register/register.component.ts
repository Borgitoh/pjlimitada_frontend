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
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  register(): void {
    // Validação simples de campos
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    // Simulação de registro
    if (this.name && this.email && this.password) {
      this.successMessage = 'Registro bem-sucedido! Agora você pode fazer login.';
      this.errorMessage = '';
      setTimeout(() => {
        this.router.navigate(['/login']); 
      }, 2000);
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos.';
    }
  }
}
