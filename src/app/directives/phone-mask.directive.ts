import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPhoneMask]'
})
export class PhoneMaskDirective {
  private previousValue: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Se o valor está vazio, limpa o campo
    if (!value) {
      input.value = '';
      this.updateModel(input, '');
      return;
    }

    // Se não começa com 244, adiciona
    if (!value.startsWith('244')) {
      value = '244' + value;
    }

    // Limita a 12 dígitos (244 + 9 dígitos do número local)
    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    // Aplica a formatação
    let formattedValue = '+244';
    if (value.length > 3) {
      const localNumber = value.substring(3);
      
      // Aplica formatação do número local (ex: +244 923 456 789)
      if (localNumber.length <= 3) {
        formattedValue += ' ' + localNumber;
      } else if (localNumber.length <= 6) {
        formattedValue += ' ' + localNumber.substring(0, 3) + ' ' + localNumber.substring(3);
      } else {
        formattedValue += ' ' + localNumber.substring(0, 3) + ' ' + localNumber.substring(3, 6) + ' ' + localNumber.substring(6);
      }
    }

    // Define a posição do cursor
    const cursorPosition = this.getCursorPosition(input.value, formattedValue, input.selectionStart);
    
    input.value = formattedValue;
    this.updateModel(input, formattedValue);

    // Restaura a posição do cursor
    setTimeout(() => {
      input.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    
    // Permite: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(event.keyCode) !== -1 ||
        // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Permite: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }

    // Previne que o usuário apague o prefixo +244
    if ((event.keyCode === 8 || event.keyCode === 46) && input.selectionStart <= 4) {
      event.preventDefault();
      return;
    }

    // Garante que apenas números sejam digitados
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: any): void {
    const input = event.target;
    if (!input.value || input.value === '') {
      input.value = '+244 ';
      this.updateModel(input, '+244 ');
      setTimeout(() => {
        input.setSelectionRange(5, 5);
      });
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = (event.clipboardData || (window as any).clipboardData).getData('text');
    const numbers = paste.replace(/\D/g, '');
    
    if (numbers) {
      const input = event.target as HTMLInputElement;
      const mockEvent = { target: { value: numbers } };
      this.onInput(mockEvent);
    }
  }

  private getCursorPosition(oldValue: string, newValue: string, oldCursor: number): number {
    // Calcula a nova posição do cursor baseada nas mudanças
    if (oldCursor <= 4) return 5; // Sempre após +244
    
    const diff = newValue.length - oldValue.length;
    return Math.min(oldCursor + diff, newValue.length);
  }

  private updateModel(input: HTMLInputElement, value: string): void {
    // Atualiza o modelo do Angular
    const event = new Event('input', { bubbles: true });
    input.value = value;
    input.dispatchEvent(event);
  }
}
