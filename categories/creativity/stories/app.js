/* Gerador de Histórias — Combinação aleatória de elementos narrativos */

(function () {
  const GENRES = {
    'Aventura': {
      heroes: ['Um jovem explorador', 'Uma cartógrafa destemida', 'Um pirata reformado', 'Uma arqueóloga corajosa', 'Dois irmãos aventureiros'],
      settings: ['numa ilha desconhecida no Pacífico', 'nas ruínas de uma cidade submersa', 'no coração da floresta amazónica', 'num deserto onde nunca chove há mil anos', 'nas montanhas mais altas do mundo'],
      objects: ['um mapa antigo feito de pele de dragão', 'uma bússola que aponta para tesouros', 'um diário com coordenadas misteriosas', 'uma chave de ouro que abre qualquer porta', 'um amuleto que brilha na presença de perigo'],
      conflicts: ['mas o caminho estava guardado por armadilhas ancestrais', 'porém uma organização secreta também procurava o mesmo artefacto', 'contudo a tempestade que se aproximava ameaçava destruir tudo', 'no entanto o mapa continha um enigma que ninguém conseguira decifrar', 'mas o tempo estava a esgotar-se rapidamente'],
      hooks: ['Sem hesitar, deu o primeiro passo rumo ao desconhecido.', 'Era agora ou nunca — a aventura estava prestes a começar.', 'Respirou fundo e abriu a porta que nunca deveria ter sido aberta.', 'O que encontraria do outro lado mudaria tudo para sempre.', 'A jornada de mil quilómetros começou com aquele único gesto.']
    },
    'Ficção Científica': {
      heroes: ['Uma engenheira de naves espaciais', 'Um robot com consciência própria', 'Uma cientista de outra dimensão', 'Um piloto intergaláctico', 'Uma IA que despertou sentimentos'],
      settings: ['numa estação espacial à deriva no cinto de asteróides', 'num planeta onde os oceanos são de mercúrio líquido', 'no ano 3047, na última cidade da Terra', 'dentro de uma simulação dentro de outra simulação', 'a bordo de uma nave geracional com destino a Proxima Centauri'],
      objects: ['um cristal capaz de dobrar o espaço-tempo', 'uma mensagem codificada de uma civilização extinta', 'um protótipo de motor de propulsão quântica', 'um fragmento de matéria escura estabilizada', 'um holocomunicador com uma transmissão de 500 anos no futuro'],
      conflicts: ['mas os sistemas de suporte de vida estavam a falhar um a um', 'porém a mensagem continha um aviso terrível', 'contudo um paradoxo temporal ameaçava destruir a realidade', 'no entanto algo estranho estava a acordar nas profundezas do planeta', 'mas as leis da física ali funcionavam ao contrário'],
      hooks: ['Os sensores dispararam — algo se aproximava a velocidade impossível.', 'O ecrã piscou uma única palavra: "CORRE."', 'Pela primeira vez na sua existência, a máquina sentiu medo.', 'Lá fora, as estrelas começaram a apagar-se, uma a uma.', 'A contagem decrescente já tinha começado.']
    },
    'Mistério': {
      heroes: ['Uma detetive de casos impossíveis', 'Um livreiro com memória fotográfica', 'Uma jornalista investigativa', 'Um professor de criminologia', 'Uma hacker com sentido de justiça'],
      settings: ['num solar abandonado no norte de Portugal', 'numa pequena aldeia onde todos guardam segredos', 'num museu fechado ao público há décadas', 'num comboio noturno entre Lisboa e Madrid', 'num arquivo secreto debaixo de uma biblioteca centenária'],
      objects: ['uma carta lacrada que chegou 50 anos atrasada', 'uma fotografia onde aparece alguém que não deveria estar lá', 'um relógio parado sempre na mesma hora', 'um livro com páginas cortadas que escondiam outra mensagem', 'uma lista de nomes em que o último era o seu'],
      conflicts: ['mas cada pista levava a mais perguntas do que respostas', 'porém alguém estava sempre um passo à frente', 'contudo a única testemunha desapareceu sem deixar rasto', 'no entanto as provas apontavam para alguém que já morrera há anos', 'mas revelar a verdade significava destruir uma família inteira'],
      hooks: ['Alguma coisa não batia certo — e ela sabia exatamente o quê.', 'A resposta esteve sempre à vista de todos. Bastava olhar com atenção.', 'Quando abriu o envelope, percebeu que o mistério era muito maior do que pensava.', 'A última peça do puzzle estava prestes a encaixar-se.', 'Era impossível. E, no entanto, ali estava a prova.']
    },
    'Fantasia': {
      heroes: ['Uma jovem feiticeira autodidata', 'Um guerreiro amaldiçoado', 'Uma princesa que recusou o trono', 'Um dragão que perdeu a memória', 'Dois viajantes de mundos diferentes'],
      settings: ['num reino onde as árvores falam e as pedras cantam', 'numa torre flutuante acima das nuvens', 'numa floresta encantada onde o tempo corre ao contrário', 'nas ruínas de um castelo guardado por espectros', 'num vale escondido entre duas montanhas impossíveis'],
      objects: ['um grimório cujas páginas se escrevem sozinhas', 'uma espada que só pode ser empunhada por quem diz a verdade', 'um espelho que mostra não o reflexo, mas os desejos', 'uma coroa que concede poder mas rouba anos de vida', 'um anel que permite falar com os mortos uma vez por lua cheia'],
      conflicts: ['mas a magia do mundo estava a desaparecer misteriosamente', 'porém uma profecia antiga anunciava o fim de todos os reinos', 'contudo o preço do poder era mais alto do que imaginara', 'no entanto o verdadeiro inimigo estava disfarçado de aliado', 'mas cada feitiço lançado cobrava um preço inesperado'],
      hooks: ['As primeiras faíscas de magia dançaram-lhe entre os dedos — e o mundo mudou.', 'O portal abriu-se com um rugido. Não havia volta atrás.', 'Quando o sol se pôs naquela noite, o céu tinha duas luas.', 'A profecia falava dela. Sempre falou.', 'O dragão abriu os olhos pela primeira vez em mil anos e sorriu.']
    }
  };

  const genreChips  = document.getElementById('genre-chips');
  const generateBtn = document.getElementById('generate-btn');
  const outputEl    = document.getElementById('story-output');
  const copyBtn     = document.getElementById('copy-btn');

  let selectedGenre = Object.keys(GENRES)[0];

  // Build genre chips
  Object.keys(GENRES).forEach((genre, i) => {
    const chip = document.createElement('button');
    chip.className = 'story-chip' + (i === 0 ? ' active' : '');
    chip.textContent = genre;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.story-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedGenre = genre;
    });
    genreChips.appendChild(chip);
  });

  generateBtn.addEventListener('click', generate);

  function generate() {
    const g = GENRES[selectedGenre];
    const hero     = pick(g.heroes);
    const setting  = pick(g.settings);
    const object   = pick(g.objects);
    const conflict = pick(g.conflicts);
    const hook     = pick(g.hooks);

    const story = `${hero} encontrou ${object} ${setting}. ${conflict}.\n\n${hook}`;
    outputEl.textContent = story;
  }

  copyBtn.addEventListener('click', () => {
    const text = outputEl.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar Texto', 1500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar Texto', 1500);
    });
  });

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
})();
