# Quiz Multi-tema

## Como jogar
1. Seleciona um tema no menu pendente.
2. Clica "Começar" para iniciar 10 perguntas aleatórias.
3. Escolhe a resposta correta em cada pergunta — recebes feedback imediato.
4. No final, vê a tua pontuação e tenta melhorar o recorde.

## Estrutura dos dados (`data.js`)
```js
const QUIZ_DATA = {
  'Nome do Tema': [
    {
      q: 'Texto da pergunta?',
      options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
      answer: 0  // índice da resposta correta (0-3)
    },
    // ... mín. 20 perguntas por tema
  ]
};
```

## Temas disponíveis
- Ciência
- Geografia
- História
- Tecnologia

## Armazenamento
A melhor pontuação por tema é guardada em `localStorage`.
