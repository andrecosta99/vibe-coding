# Ordenação (Drag & Drop)

## Como jogar
1. Seleciona um tema.
2. Os itens aparecem numa ordem aleatória.
3. Arrasta e solta para os reorganizar na ordem correta.
4. Clica "Verificar" para ver quantos estão na posição certa.
5. Quando todos estiverem corretos, vês o ecrã de vitória.

## Estrutura dos dados (`data.js`)
```js
const ORDERING_DATA = {
  'Nome do Tema': [
    'Item 1',   // posição correta = índice 0
    'Item 2',   // posição correta = índice 1
    // ...
  ]
};
```
A ordem no array é a ordem correta.

## Temas disponíveis
- Planetas (do Sol)
- Meses do Ano
- Números Romanos
- Reis de Portugal

## Armazenamento
A melhor pontuação por tema é guardada em `localStorage`.
