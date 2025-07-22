import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  dropdownOpen = false;
  mobileMenuOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
