# Vibe Playground

Uma coleção de micro-apps 100 % estáticas para demonstrar Vibe Coding.

## Como executar

O projeto é inteiramente estático (HTML/CSS/JS puro) — não precisa de build, backend ou dependências externas.

### Opção 1 — Abrir diretamente no browser
Abre o ficheiro `index.html` no teu browser (duplo-clique ou `File → Open`).

> **Nota:** Alguns browsers podem restringir `localStorage` em `file://`. Se tiveres problemas, usa a opção 2.

### Opção 2 — Servidor local (recomendado)
```bash
# Com Python 3
python3 -m http.server 8000

# Ou com Node.js (npx)
npx serve .
```
Depois abre `http://localhost:8000` no browser.

## Estrutura do projeto
```
/
├── index.html                  # Página inicial
├── assets/
│   ├── styles.css              # Estilos globais
│   ├── app.js                  # Helpers partilhados
│   └── img/
│       └── andrefcosta.png     # Foto do autor
├── categories/
│   ├── games/
│   │   ├── index.html          # Lista de jogos
│   │   ├── quiz/               # Quiz multi-tema
│   │   ├── memory/             # Jogo da memória
│   │   ├── reaction/           # Tempo de reação
│   │   └── ordering/           # Ordenação (drag & drop)
│   ├── productivity/
│   │   ├── index.html          # Lista de ferramentas
│   │   ├── checklist/          # Checklist de projeto
│   │   ├── eisenhower/         # Matriz de Eisenhower
│   │   ├── todo/               # Lista de tarefas
│   │   └── pomodoro/           # Pomodoro + Deep Work
│   ├── utilities/
│   │   ├── index.html          # Lista de utilitários
│   │   ├── converter/          # Conversor de unidades
│   │   ├── password/           # Gerador de palavras-passe
│   │   ├── random/             # Gerador aleatório
│   │   └── calculator/         # Calculadora
│   └── creativity/
│       ├── index.html          # Lista de ferramentas criativas
│       ├── drawing/            # Quadro de desenho
│       ├── beatmaker/          # Batida musical (sequenciador)
│       ├── stories/            # Gerador de histórias
│       └── emoji/              # Criador de emojis
└── README.md
```

## Categorias

| Categoria         | Estado         | Apps |
|-------------------|----------------|------|
| Jogos Educativos  | Implementado   | Quiz, Memória, Reação, Ordenação |
| Produtividade     | Implementado   | Checklist, Eisenhower, To-Do, Pomodoro |
| Utilitários       | Implementado   | Conversor, Palavras-passe, Aleatório, Calculadora |
| Criatividade      | Implementado   | Desenho, Batida Musical, Histórias, Emojis |

## Tecnologias
- HTML5, CSS3, JavaScript (ES6+)
- Web Audio API (batida musical)
- Canvas API (quadro de desenho)
- Sem frameworks, sem CDN, sem backend
- Funciona offline

## Autor
Desenvolvido por [Superhumano](https://superhumano.ai) e [André F. Costa](https://andrefcosta.com)
