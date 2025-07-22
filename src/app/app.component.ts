import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'pjlimitada';
  showHeaderFooter = true;

  constructor(private router: Router) {
    // Detectar mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.showHeaderFooter = !this.isAuthPage(event.url);
        }
      });
  }

  ngOnInit() {
    // Verificar rota inicial
    this.showHeaderFooter = !this.isAuthPage(this.router.url);
  }

  private isAuthPage(url: string): boolean {
    return url === '/login' || url === '/register';
  }
}
