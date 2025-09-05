import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCurrencyMask]'
})
export class CurrencyMaskDirective {
  @Input() currencySymbol: string = 'KZ';
  @Input() allowNegative: boolean = false;
  @Input() decimalPlaces: number = 2;

  private previousValue: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target;
    let value = input.value;

    // Remove todos os caracteres não numéricos exceto ponto e vírgula
    let numericValue = value.replace(/[^\d,.-]/g, '');
    
    // Remove múltiplos pontos e vírgulas
    numericValue = this.sanitizeDecimalSeparators(numericValue);

    // Converte vírgula em ponto para processamento
    const processValue = numericValue.replace(',', '.');
    
    // Valida se é um número válido
    if (processValue && !isNaN(parseFloat(processValue))) {
      const floatValue = parseFloat(processValue);
      
      // Verifica valores negativos se não permitido
      if (!this.allowNegative && floatValue < 0) {
        input.value = this.previousValue;
        return;
      }

      // Formata o valor
      const formattedValue = this.formatCurrency(floatValue);
      input.value = formattedValue;
      this.updateModel(input, this.getNumericValue(formattedValue));
    } else if (numericValue === '' || numericValue === '-') {
      input.value = '';
      this.updateModel(input, 0);
    } else {
      // Valor inválido, mantém o anterior
      input.value = this.previousValue;
      return;
    }

    this.previousValue = input.value;
  }

  @HostListener('focus', ['$event'])
  onFocus(event: any): void {
    const input = event.target;
    if (input.value === '' || input.value === '0' || input.value === `${this.currencySymbol} 0,00`) {
      input.value = '';
      setTimeout(() => {
        input.setSelectionRange(0, 0);
      });
    } else {
      // Remove a formatação para edição
      const numericValue = this.getNumericValue(input.value);
      if (numericValue !== 0) {
        input.value = this.formatNumberForEditing(numericValue);
      }
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    const input = event.target;
    const numericValue = this.getNumericValue(input.value);
    const formattedValue = this.formatCurrency(numericValue);
    input.value = formattedValue;
    this.updateModel(input, numericValue);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Permite: backspace, delete, tab, escape, enter, home, end, left, right
    if ([46, 8, 9, 27, 13, 35, 36, 37, 39].indexOf(event.keyCode) !== -1 ||
        // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (event.ctrlKey === true && [65, 67, 86, 88, 90].indexOf(event.keyCode) !== -1)) {
      return;
    }

    // Permite apenas números, vírgula e ponto
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
        (event.keyCode < 96 || event.keyCode > 105) &&
        event.keyCode !== 188 && // vírgula
        event.keyCode !== 190 && // ponto
        event.keyCode !== 109 && // menos (numpad)
        event.keyCode !== 189) { // menos (teclado normal)
      event.preventDefault();
    }

    // Permite apenas um sinal de menos no início
    const target = event.target as HTMLInputElement;
    if ((event.keyCode === 109 || event.keyCode === 189) &&
        (!this.allowNegative || !target || target.selectionStart !== 0)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = (event.clipboardData || (window as any).clipboardData).getData('text');
    const numbers = paste.replace(/[^\d,.-]/g, '');
    
    if (numbers) {
      const input = event.target as HTMLInputElement;
      input.value = numbers;
      const mockEvent = { target: input };
      this.onInput(mockEvent);
    }
  }

  private sanitizeDecimalSeparators(value: string): string {
    // Remove múltiplos separadores decimais
    const parts = value.split(/[,.]/);
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    return value;
  }

  private formatCurrency(value: number): string {
    if (isNaN(value)) value = 0;
    
    return `${this.currencySymbol} ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces
    })}`;
  }

  private formatNumberForEditing(value: number): string {
    if (isNaN(value)) value = 0;
    
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces
    });
  }

  private getNumericValue(formattedValue: string): number {
    if (!formattedValue) return 0;
    
    // Remove símbolo da moeda e espaços
    let numericStr = formattedValue.replace(this.currencySymbol, '').trim();
    
    // Remove pontos de milhares e converte vírgula em ponto
    numericStr = numericStr.replace(/\./g, '').replace(',', '.');
    
    const value = parseFloat(numericStr);
    return isNaN(value) ? 0 : value;
  }

  private updateModel(input: HTMLInputElement, value: number): void {
    // Dispara evento para atualizar o modelo Angular
    const event = new Event('input', { bubbles: true });
    
    // Atualiza o valor para o FormControl se existir
    if (input.getAttribute('formControlName') || input.getAttribute('ngModel')) {
      // Define uma propriedade customizada para o valor numérico
      (input as any)._numericValue = value;
    }
    
    input.dispatchEvent(event);
  }
}
