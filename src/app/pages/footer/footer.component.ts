import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  
  onNewsletterSubmit(event: Event) {
    event.preventDefault();
    // Lógica para inscrição na newsletter
    console.log('Newsletter subscription');
  }
}
