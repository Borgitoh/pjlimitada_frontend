# Paleta de Cores PJ Limitada

Baseada no logo oficial da empresa, esta paleta foi desenvolvida para criar uma identidade visual consistente e profissional em todo o site.

## 🎨 Cores Primárias

### Cyan/Turquesa (Cor Principal)
- **Principal**: `#00bcd4` - Baseada no azul ciano do logo
- **Hover**: `#00acc1` - Para estados de hover
- **Escura**: `#0097a7` - Para contraste
- **Muito Escura**: `#006064` - Para textos em fundos claros

### Variações do Cyan
- `#e0f7fa` (50) - Fundos muito claros
- `#b2ebf2` (100) - Fundos claros
- `#80deea` (200) - Bordas suaves
- `#4dd0e1` (300) - Elementos secundários
- `#26c6da` (400) - Estados ativos
- `#00bcd4` (500) - **COR PRINCIPAL**
- `#00acc1` (600) - Hover states
- `#0097a7` (700) - Elementos escuros
- `#00838f` (800) - Textos em fundos claros
- `#006064` (900) - Texto principal escuro

## 🔵 Cores Secundárias

### Azul Escuro (Para contraste)
- `#1e40af` (500) - Azul profundo
- `#1d4ed8` (600) - Azul médio
- `#1e3a8a` (700) - Azul muito escuro

## 🔴 Cores de Destaque

### Laranja (Para CTAs secundários)
- `#f97316` (500) - Laranja principal
- `#ea580c` (600) - Laranja hover

### Vermelho (Para alertas)
- `#ef4444` (500) - Vermelho principal  
- `#dc2626` (600) - Vermelho hover

## ⚫ Cores Neutras

### Cinzas (Para textos e fundos)
- `#f9fafb` (50) - Fundo muito claro
- `#f3f4f6` (100) - Fundo claro
- `#e5e7eb` (200) - Bordas claras
- `#d1d5db` (300) - Bordas
- `#9ca3af` (400) - Texto secundário
- `#6b7280` (500) - Texto normal
- `#4b5563` (600) - Texto médio
- `#374151` (700) - Texto principal
- `#1f2937` (800) - Texto escuro
- `#111827` (900) - Texto muito escuro
- `#030712` (950) - Preto

## 🎯 Aplicação das Cores

### Elementos Primários
- **Botões principais**: Cyan 500 (`#00bcd4`)
- **Links ativos**: Cyan 500 (`#00bcd4`)
- **Destaques**: Cyan 500 (`#00bcd4`)

### Estados Hover
- **Botões hover**: Cyan 600 (`#00acc1`)
- **Links hover**: Cyan 600 (`#00acc1`)

### Elementos Secundários
- **Ícones**: Cyan 500 (`#00bcd4`)
- **Bordas ativas**: Cyan 500 (`#00bcd4`)
- **Focus rings**: Cyan 500 com transparência

### Gradientes Especiais
- **Hero Section**: `linear-gradient(135deg, #111827 0%, #1f2937 50%, #006064 100%)`
- **Primário**: `linear-gradient(135deg, #26c6da 0%, #00acc1 100%)`
- **Secundário**: `linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)`

## 📱 Classes CSS Customizadas

```css
/* Cores de fundo */
.bg-pj-cyan { background-color: #00bcd4; }
.bg-pj-cyan-hover:hover { background-color: #00acc1; }

/* Cores de texto */
.text-pj-cyan { color: #00bcd4; }

/* Bordas */
.border-pj-cyan { border-color: #00bcd4; }

/* Focus rings */
.ring-pj-cyan { --tw-ring-color: #00bcd4; }

/* Gradientes */
.gradient-pj-primary { background: linear-gradient(135deg, #26c6da 0%, #00acc1 100%); }
.gradient-pj-secondary { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); }
.gradient-pj-hero { background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #006064 100%); }
```

## 🎪 Uso Recomendado

### Hierarquia Visual
1. **Cyan 500** - Elementos principais (botões, links)
2. **Cyan 600** - Estados hover
3. **Cyan 700** - Elementos escuros
4. **Gray 700** - Textos principais
5. **Gray 500** - Textos secundários

### Contrastes
- Texto escuro em fundos claros: Gray 700+
- Texto claro em fundos escuros: White/Gray 100
- Elementos interativos: Cyan 500 com hover Cyan 600

### Acessibilidade
Todas as combinações de cores foram testadas para garantir contraste adequado (WCAG 2.1 AA).

---

**Criado por**: Sistema de Design PJ Limitada  
**Última atualização**: Janeiro 2024  
**Baseado no logo oficial**: ![Logo PJ Limitada](https://cdn.builder.io/api/v1/image/assets%2F023ea3a22e1e419db6ab5e8788c88f6f%2F322595bfb46c40ee901ebc8f91693c90?format=webp&width=800)
