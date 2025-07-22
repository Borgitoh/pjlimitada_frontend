import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
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
          this.checkRoute(event.url);
        }
      });
  }

  ngOnInit() {
    // Verificar rota inicial
    this.checkRoute(this.router.url);
  }

  private checkRoute(url: string) {
    const isAuth = this.isAuthPage(url);
    this.showHeaderFooter = !isAuth;
    console.log('Current URL:', url, 'Show Header/Footer:', this.showHeaderFooter);
  }

  private isAuthPage(url: string): boolean {
    // Verificar se a URL contém login ou register
    return url.includes('/login') || url.includes('/register') || url === '/login' || url === '/register';
  }
}
