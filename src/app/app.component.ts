import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pjlimitada';
  showHeaderFooter = true;

  constructor(private router: Router) {
    // Detectar mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Esconder header e footer nas páginas de login e registro
        this.showHeaderFooter = !this.isAuthPage(event.url);
      });
  }

  private isAuthPage(url: string): boolean {
    return url === '/login' || url === '/register';
  }
}
