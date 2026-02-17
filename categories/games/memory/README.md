# Jogo da Memória

## Como jogar
1. Seleciona um tema e o modo (fácil: 6 pares / difícil: 8 pares).
2. Clica nas cartas para as virar — encontra todos os pares.
3. O jogo conta jogadas e tempo.
4. No final, verifica o teu recorde.

## Estrutura dos dados (`data.js`)
```js
const MEMORY_DATA = {
  'Nome do Tema': ['🐶', '🐱', '🐸', ...],  // mín. 10 emojis por tema
};
```
Cada tema tem pelo menos 10 emojis. O jogo usa 6 (fácil) ou 8 (difícil) escolhidos aleatoriamente.

## Temas disponíveis
- Animais
- Frutas
- Desporto
- Bandeiras

## Armazenamento
O melhor tempo por tema+modo é guardado em `localStorage`.
