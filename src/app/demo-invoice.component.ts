import { Component } from '@angular/core';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-demo-invoice',
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Nova Fatura Melhorada - PJ Limitada</h1>
      
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
        <h2 class="text-xl font-bold mb-2">✨ Melhorias Implementadas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul class="space-y-2">
            <li class="flex items-center"><span class="mr-2">🎨</span>Design profissional e moderno</li>
            <li class="flex items-center"><span class="mr-2">📊</span>Tabela organizada com bordas</li>
            <li class="flex items-center"><span class="mr-2">💰</span>Resumo financeiro destacado</li>
            <li class="flex items-center"><span class="mr-2">🏢</span>Cabeçalho empresarial elegante</li>
          </ul>
          <ul class="space-y-2">
            <li class="flex items-center"><span class="mr-2">📱</span>QR Code para verificação</li>
            <li class="flex items-center"><span class="mr-2">🔒</span>Hash de segurança</li>
            <li class="flex items-center"><span class="mr-2">📝</span>Numeração automática dos itens</li>
            <li class="flex items-center"><span class="mr-2">✅</span>Selo de validade</li>
          </ul>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3 text-gray-700">🎨 Características Visuais</h3>
          <ul class="space-y-2 text-sm">
            <li><strong>Cores:</strong> Azul profissional (#337AB7) e verde para valores</li>
            <li><strong>Layout:</strong> Estruturado com seções bem definidas</li>
            <li><strong>Tipografia:</strong> Helvetica com hierarquia clara</li>
            <li><strong>Logo:</strong> Círculo elegante com "PJ" estilizado</li>
            <li><strong>Tabela:</strong> Listras alternadas e bordas definidas</li>
          </ul>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3 text-gray-700">📋 Seções da Fatura</h3>
          <ul class="space-y-2 text-sm">
            <li><strong>Cabeçalho:</strong> Logo, informações da empresa e número da fatura</li>
            <li><strong>Dados:</strong> Informações da empresa e cliente lado a lado</li>
            <li><strong>Detalhes:</strong> Data, vencimento, série e moeda</li>
            <li><strong>Itens:</strong> Tabela completa com códigos e valores</li>
            <li><strong>Resumo:</strong> Subtotal, desconto, impostos e total</li>
            <li><strong>Rodapé:</strong> QR code, informações legais e hash</li>
          </ul>
        </div>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-bold text-green-800 mb-2">💡 Funcionalidades Avançadas</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 class="font-semibold text-green-700">Segurança</h4>
            <ul class="text-green-600">
              <li>• Hash único para cada fatura</li>
              <li>• QR Code para verificação</li>
              <li>• Selo de validade</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-green-700">Profissionalismo</h4>
            <ul class="text-green-600">
              <li>• Informações legais completas</li>
              <li>• NIF e registro comercial</li>
              <li>• Endereço detalhado</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-green-700">Usabilidade</h4>
            <ul class="text-green-600">
              <li>• Valor por extenso</li>
              <li>• Numeração automática</li>
              <li>• Data/hora de geração</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="text-center">
        <button 
          (click)="generateDemoInvoice()" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200">
          🚀 Gerar Fatura de Demonstração
        </button>
        <p class="text-gray-500 text-sm mt-2">Clique para ver a nova fatura em ação!</p>
      </div>
    </div>
  `,
  standalone: true
})
export class DemoInvoiceComponent {
  
  constructor(private pdfService: PdfService) {}

  generateDemoInvoice(): void {
    const demoData = {
      empresa: {
        nome: 'PJ Limitada',
        endereco: 'Avenida Marginal, Edifício Torres Dipanda, 15º Andar',
        cidade: 'Luanda, Angola',
        telefone: '+244 923 456 789',
        email: 'contato@pjlimitada.com',
        website: 'www.pjlimitada.com',
        nif: '5417048598',
        registro: 'Registro Comercial: 123456789'
      },
      fatura: {
        numero: 'FAT-2024-001',
        serie: '001',
        data: new Date().toLocaleDateString('pt-BR'),
        dataVencimento: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR'),
        vendedor: 'João Silva',
        cliente: 'Cliente Demonstração Ltda',
        formaPagamento: 'Cartão de Crédito',
        moeda: 'Kwanza (KZ)'
      },
      itens: [
        {
          codigo: '001',
          nome: 'Pastilhas de Freio Dianteiras - Toyota Corolla',
          descricao: 'Pastilhas de freio cerâmicas de alta performance',
          quantidade: 2,
          unidade: 'PAR',
          precoUnitario: 15000,
          total: 30000,
          categoria: 'Freios'
        },
        {
          codigo: '002', 
          nome: 'Filtro de Óleo - Honda Civic',
          descricao: 'Filtro de óleo original com alta capacidade de filtragem',
          quantidade: 1,
          unidade: 'UN',
          precoUnitario: 2500,
          total: 2500,
          categoria: 'Motor'
        },
        {
          codigo: '003',
          nome: 'Amortecedores Traseiros - Nissan Sentra',
          descricao: 'Par de amortecedores a gás para suspensão traseira',
          quantidade: 1,
          unidade: 'PAR',
          precoUnitario: 45000,
          total: 45000,
          categoria: 'Suspensão'
        }
      ],
      resumo: {
        subtotal: 77500,
        desconto: 2500,
        impostos: 0,
        total: 75000,
        totalPorExtenso: 'Setenta e cinco mil kwanzas'
      },
      observacoes: 'Garantia de 6 meses em todas as peças. Válido apenas com apresentação desta fatura. Instalação disponível mediante agendamento.',
      condicoes: [
        'Pagamento conforme condições acordadas',
        'Mercadoria viaja por conta e risco do comprador',
        'Não nos responsabilizamos por avarias após a entrega',
        'Garantia válida apenas com apresentação desta fatura',
        'Troca somente com nota fiscal e produto em perfeito estado'
      ]
    };

    this.pdfService.generateInvoicePdf(demoData);
  }
}
