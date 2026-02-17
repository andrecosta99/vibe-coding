/* Tempo de Reação — Configuração dos temas */

const REACTION_DATA = {
  'Letras': {
    type: 'click', // user clicks the target
    generate() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return { display: letters[Math.floor(Math.random() * 26)], style: 'font-size:4rem;cursor:pointer' };
    }
  },
  'Números': {
    type: 'click',
    generate() {
      const n = Math.floor(Math.random() * 100);
      return { display: String(n), style: 'font-size:4rem;cursor:pointer' };
    }
  },
  'Símbolos': {
    type: 'click',
    generate() {
      const symbols = ['★', '●', '■', '▲', '◆', '♥', '♠', '♦', '♣', '⬟', '⬡', '⏣'];
      return { display: symbols[Math.floor(Math.random() * symbols.length)], style: 'font-size:4rem;cursor:pointer' };
    }
  },
  'Cores': {
    type: 'color', // user must click the matching color button
    colors: [
      { name: 'Vermelho', hex: '#dc2626' },
      { name: 'Azul',     hex: '#2563eb' },
      { name: 'Verde',    hex: '#16a34a' },
      { name: 'Amarelo',  hex: '#eab308' },
      { name: 'Roxo',     hex: '#9333ea' },
      { name: 'Laranja',  hex: '#ea580c' },
    ],
    generate() {
      const c = this.colors[Math.floor(Math.random() * this.colors.length)];
      return { display: c.name, targetColor: c, style: 'font-size:2.5rem;font-weight:700' };
    }
  }
};
