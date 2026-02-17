# Tempo de Reação

## Como jogar
1. Seleciona um tema (cada tema muda o tipo de alvo).
2. Espera pelo alvo aparecer (delay aleatório de 1–3 s).
3. Clica no alvo o mais rápido possível.
4. Após 5 rondas, vê a tua média e o recorde.

## Temas
| Tema     | Alvo                                |
|----------|-------------------------------------|
| Letras   | Uma letra aleatória (clicar)        |
| Números  | Um número aleatório (clicar)        |
| Símbolos | Um símbolo/forma (clicar)           |
| Cores    | Palavra de cor + botões para clicar |

## Estrutura dos dados (`data.js`)
```js
const REACTION_DATA = {
  'Nome': {
    type: 'click' | 'color',
    generate() { return { display, style, targetColor? }; }
  }
};
```

## Armazenamento
A melhor média por tema é guardada em `localStorage`.
