import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() showConfirmButton: boolean = true;
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmText: string = 'Confirmar';
  @Input() confirmType: 'primary' | 'danger' | 'success' = 'primary';
  @Input() confirmDisabled: boolean = false;
  @Input() closeOnBackdrop: boolean = true;

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.closeOnBackdrop && target.classList.contains('fixed')) {
      this.close();
    }
  }

  open(): void {
    this.isOpen = true;
    this.opened.emit();
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
    // Restore body scroll
    document.body.style.overflow = '';
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  confirm(): void {
    if (!this.confirmDisabled) {
      this.confirmed.emit();
    }
  }
}
