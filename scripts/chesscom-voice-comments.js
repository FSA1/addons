// ==UserScript==
// @name        Krikor Sound Theme
// @namespace   Violentmonkey Scripts
// @match       *://www.chess.com/game/*
// @match       *://www.chess.com/play/online*
// @grant        GM_xmlhttpRequest
// @version     1.0
// @author      ChessSkins
// @description 22/03/2024, 11:59:26
// ==/UserScript==

(function() {
    'use strict';
    var ready = false;
    var scoreNotice = null;
    var scorePieceNotice = null;
    let lastRandomNumber = null;
    let stopComments = 0;
    let intervNum = 300; // Inicializa o intervalo com 300 milissegundos
    const chat = document.getElementsByClassName('chat-scroll-area-component');
    // Enable the mutation observer to observe the child elements of the Twitch chat, the chat messages
    var mutationConfig = { childList: true, subtree: true };
    // Recursive function to check if the chess.com chat contains messages
    function addObserverIfDesiredNodeAvailable() {
        if (chat.length == 0) {
            window.setTimeout(addObserverIfDesiredNodeAvailable, intervNum);
            intervNum += 100; // Incrementa o intervalo em 100 milissegundos para a próxima tentativa
            console.log('Target node is not available. New atempt in ' + (intervNum / 1000) + 's.');
            ready=false;
            return;
        } else {
            ready = true;
            Array.from(chat).forEach(x => {
                startObserver.observe(x, mutationConfig)
            })
            Array.from(chat).forEach(x => {
                endObserver.observe(x, mutationConfig)
            })
        }
    }

    addObserverIfDesiredNodeAvailable();
    //=== Função tocar som referenciado aleatoreamente ===============================================================================
    // Variável global para armazenar o último número sorteado
    var ultimoNumeroSorteado;
    let imglastRandomNumber = null;
    // Função para gerar um número aleatório entre min e max (inclusive)
    function random(min, max) {
        let randomNumber;
        do {
            randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (randomNumber === lastRandomNumber);
        lastRandomNumber = randomNumber;
        return randomNumber;
    }
    // Função para gerar um número aleatório excluindo o último número sorteado
    function gerarNumeroAleatorio(excluirNumero, max) {
        var rndmNum;
        do {
            rndmNum = Math.floor(Math.random() * (max + 1));
        } while (rndmNum === excluirNumero);
        return rndmNum;
    }

    // Função para tocar um áudio de início personalizado
    function playSound(audioFiles) {
        var rndmNum;

        // Se houver apenas um arquivo, toca o mesmo arquivo
        if (audioFiles.length === 1) {
            rndmNum = 0;
        } else if (audioFiles.length === 2) {
            // Se houver dois arquivos, escolhe o arquivo que não foi o último tocado
            rndmNum = ultimoNumeroSorteado === 0 ? 1 : 0;
        } else {
            // Se houver mais de dois arquivos, gera um número aleatório que não seja o último sorteado
            rndmNum = gerarNumeroAleatorio(ultimoNumeroSorteado, audioFiles.length - 1);
        }

        // Atualiza o último número sorteado
        ultimoNumeroSorteado = rndmNum;

        var myAudio = new Audio(audioFiles[rndmNum]);

        // Toca o áudio escolhido
        if (myAudio) {
            console.log('Audio = ' + audioFiles[rndmNum]); // Mensagem de console
            myAudio.volume = 0.8;
            myAudio.play();
        }
    }

    //================================================================================================================================
    // Variável global para armazenar a referência do intervalo
    let audioInterval;

    // Função para obter a lista de arquivos do diretório e configurar o intervalo
    function getAudioFilesListAndSetInterval(namePrefix, apiName, interval) {
        const baseURL='https://github.com/FSA1/addons/raw/main/audio/GMKrikor/'+ apiName + '/';
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.github.com/repos/FSA1/addons/contents/audio/GMKrikor/' + apiName,
            onload: function(response) {
                const files = JSON.parse(response.responseText);
                // Filtra os arquivos que começam com o prefixo fornecido e terminam com '.mp3'
                let audioFiles = files.filter(file => file.name.match(new RegExp('^' + namePrefix + '.*\\.mp3$', 'i')))
                                      .map(file => baseURL + file.name);
                //console.log('Arquivos filtrados: ' + audioFiles);
                // Se nenhum arquivo for encontrado com o prefixo, omite o prefixo e seleciona todos os arquivos .mp3
                if (audioFiles.length === 0 && namePrefix) {
                    console.log('Nenhum arquivo encontrado com o prefixo "' + namePrefix + '". Selecionando todos os arquivos .mp3.');
                    audioFiles = files.filter(file => file.name.match(/\.mp3$/i))
                                      .map(file => baseURL + file.name);
                }
                // Cancela o intervalo anterior, se houver
                if (interval===0){
                    playSound(audioFiles);
                } else {
                    if (audioInterval) {
                        clearInterval(audioInterval);
                    }
                    // Configura um novo temporizador para tocar os sons personalizados a cada certo tempo em segundos
                    audioInterval = setInterval(function() {
                        playSound(audioFiles);
                    }, interval);
                }
            }
        });
    }
    //=== FIM de Função tocar som referenciado aleatoreamente ========================================================================

    //score monitoring============================================/

    // Objeto para armazenar o último score e timestamp
    let lastScoreData = { score: null, timestamp: null };
    let lastScorePieceData = { score: null, timestamp: null };

    //==========score pieces============
    var pieceScoreId;
    var scoreCommentPlayed = false;
    // Função para verificar a pontuação do jogador e do oponente
    function commentPieceScoreChange() {
      const scorePieceElement = document.querySelector('.player-bottom .captured-pieces-cpiece.captured-pieces-score');
      const opponentScorePieceElement = document.querySelector('.player-top .captured-pieces-cpiece.captured-pieces-score');
      if (scorePieceElement || opponentScorePieceElement) {
        var scorePieceValue = parseInt(scorePieceElement.textContent, 10);
        var opponentScorePieceValue = parseInt(opponentScorePieceElement.textContent, 10);
        if (isNaN(scorePieceValue)) {
            scorePieceValue = 0;
        }
        if (isNaN(opponentScorePieceValue)) {
            opponentScorePieceValue = 0;
        }
        const currentTimestamp1 = new Date().getTime();

        if (scorePieceValue !== lastScorePieceData.score || currentTimestamp1 - lastScorePieceData.timestamp > 10000) { // 10 segundos
            lastScorePieceData = { score: scorePieceValue, timestamp: currentTimestamp1 }; // Atualiza o último score e timestamp

            // Calcula a pontuação do jogador considerando a do oponente
            const adjustedScore = scorePieceValue - opponentScorePieceValue;

        if (!scoreCommentPlayed) {
            if (adjustedScore < 0) {
                scorePieceNotice = 'bad';
                getAudioFilesListAndSetInterval('', 'negativescore', 0);
                console.log('🙄👉 ' + adjustedScore + ' pontos.♟️♟️♟️');
            } else if (adjustedScore > 0) {
                scorePieceNotice = 'good';
                getAudioFilesListAndSetInterval('', 'positivescore', 0);
                console.log('😏👉 ' + adjustedScore + ' pontos.♟️♟️♟️');
            }
        }

            scoreCommentPlayed = false;
        } else {
            // Se o tempo não tiver passado, redefina scoreCommentPlayed para permitir novos comentários
            scoreCommentPlayed = true;
        }

      }
    }

    // Inicia o intervalo
    function iniciarIntervalo1() {
      if (pieceScoreId) {
        clearInterval(pieceScoreId);
      }
      pieceScoreId = setInterval(commentPieceScoreChange, 10000);
    }

    // Chama a função para iniciar o intervalo
    iniciarIntervalo1();
    //END score pieces ============================================/


    // Função para verificar a mudança de score
    function commentScoreChange() {
        const scoreElement = document.querySelector('.player-bottom .rating-score-component .rating-score-change');
        if (scoreElement) {
            const scoreValue = parseInt(scoreElement.textContent, 10);
            const currentTimestamp = new Date().getTime();
            // Verifica se o score atual é diferente do último score detectado ou se passou tempo suficiente
            if (scoreValue !== lastScoreData.score || currentTimestamp - lastScoreData.timestamp > 10000) { // 10 segundos
                lastScoreData = { score: scoreValue, timestamp: currentTimestamp }; // Atualiza o último score e timestamp
                if (scoreElement.classList.contains('rating-score-negative') && scoreValue < 0) {
                    scoreNotice='bad';
                    console.log('🥲👎Perdeu ' + scoreValue + ' pontos de rating.');
                } else if (scoreElement.classList.contains('rating-score-positive') && scoreValue > 0) {
                    scoreNotice='good';
                    console.log('😀👍Ganhou ' + scoreValue + ' pontos de rating.');
                }
            }
        }
    }
    //End score monitoring==========================================/

    // Função para extrair o tempo da partida e calcular o intervalo
    function calculateInterval(matchTimeText) {
        const timeMatch = matchTimeText.match(/(\d+)\s*(segs|min)/);
        if (timeMatch) {
            const timeValue = parseInt(timeMatch[1], 10);
            const timeUnit = timeMatch[2];
            if (timeUnit === 'segs') {
                // Para partidas de até 10 segundos (ultra bullet), intervalos de 3 segundos
                console.log('⏱️Tempo de partida: ' + timeValue + ' ' + timeUnit);
                return timeValue <= 10 ? 3000 : 10000; // 10 segundos para intervalo padrão
            } else if (timeUnit === 'min') {
                // Para partidas de 1 a 5 minutos, intervalo de 30 segundos
                // Para partidas superiores a 5 minutos, intervalo de 1 minuto
                console.log('⏱️Tempo de partida: ' + timeValue + ' ' + timeUnit);
                return timeValue <= 1 ? 20000 : 30000;
            } else if (timeUnit === 'min') {
                // Para partidas de 1 a 5 minutos, intervalo de 30 segundos
                // Para partidas superiores a 5 minutos, intervalo de 1 minuto
                console.log('⏱️Tempo de partida: ' + timeValue + ' ' + timeUnit);
                return timeValue <= 5 ? 30000 : 60000;
            }
        }
        return 30000; // Intervalo padrão se não conseguir extrair o tempo
    }

    const callbackStart = function(mutationsList, startObserver) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('game-start-message-component')) {
                        setTimeout(getAudioFilesListAndSetInterval('', 'startgame', 0), 500);
                        stopComments = 0;
                        // Extrai o tempo da partida do texto do elemento
                        const matchTimeText = node.querySelector('span').textContent;
                        // Calcula o intervalo com base no tempo da partida
                        const verifInterval = calculateInterval(matchTimeText);
                        console.log('New game started'); // Mensagem de console
                        getAudioFilesListAndSetInterval('', 'movefast', verifInterval);
                    }
                }
            }
        }
    };

    const callbackEnd = function(mutationsList, endObserver) {
          for (const mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  for (const node of mutation.addedNodes) {
                      // Verifica se o nó adicionado possui a classe '.game-over-message-component'
                      if (node.classList && node.classList.contains('game-over-message-component')) {
                          commentScoreChange();
                          if (scoreNotice === 'bad') {
                              getAudioFilesListAndSetInterval('', 'badgame', 0);
                              console.log('Perdemo!'); // Mensagem de console
                          }else if (scoreNotice === 'good') {
                              getAudioFilesListAndSetInterval('', 'goodgame', 0);
                              console.log('Boa!'); // Mensagem de console
                          }
                          console.log('Game ended, Comments paused.'); // Mensagem de console
                          stopComments = 1;
                          if (audioInterval) {
                              clearInterval(audioInterval);
                          }
                      }
                  }
              }
          }
      };
    const startObserver = new MutationObserver(callbackStart);
    const endObserver = new MutationObserver(callbackEnd);

    // fakecam========================================================/
    // CSS para o div da imagem
    var css = `
    #imagemDiv {
      width: 300px;
      height: 231px;
      position: fixed;
      bottom: 10px;
      right: 10px;
      background-size: cover;
      background-position: center;
      //border: 1px solid #000;
      z-index: 1000;
      cursor: move;
      transition: opacity 0.3s;
    }

    #imagemDiv:hover {
      opacity: 0.7;
    }

    #fecharBtn {
      position: absolute;
      width: 16px;
      right: 16px;
      top: 0;
      cursor: pointer;
      opacity: 0; /* Inicialmente invisível */
      transition: opacity 0.3s; /* Suaviza a transição da opacidade */
      font-family: 'Chess V3', sans-serif;
      font-size:1.8rem;
      color:lightgray;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      font-weight: 400;
      line-height: 1;
      text-align: center;
    }

    #fecharBtn::before {
      content: "\\0042";
      display: inline-block;
    }

    #imagemDiv:hover #fecharBtn {
      opacity: 1; /* O botão se torna visível */
    }
    `;

    // Adicionando o CSS ao documento
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    function updateImageURL() {
      var imgRndNum = random(1, 4);
      var imageUrl = 'https://github.com/FSA1/addons/raw/main/images/GMKrikor/fakecam' + imgRndNum + '.gif';
      return imageUrl;
    }
    function mostrarImagem(imgURL) {
      //imagem base64 não usada por enquanto
      var imageClipBase64='';
      var imgSvg = `data:image/svg+xml;charset=UTF-8,%3c?xml version='1.0' encoding='UTF-8'?%3e%3c!-- Created with Inkscape (http://www.inkscape.org/) --%3e%3csvg width='600' height='460' version='1.1' viewBox='0 0 600 460' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cclipPath id='clipPath56'%3e%3cpath d='m51.56 23.794c-1.4416 0-2.6006 1.1542-2.6006 2.5873v364.6c0 1.4332 1.159 2.5873 2.6006 2.5873h492.43c1.4416 0 2.6025-1.1542 2.6025-2.5873v-364.6c0-1.4332-1.1609-2.5873-2.6025-2.5873z' fill='%23010101'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%3e%3cimage width='600' height='460' clip-path='url(%23clipPath56)' preserveAspectRatio='none' xlink:href='${imageClipBase64}'/%3e%3cpath d='m51.56 23.794c-1.4416 0-2.6006 1.1542-2.6006 2.5873v364.6c0 1.4332 1.159 2.5873 2.6006 2.5873h492.43c1.4416 0 2.6025-1.1542 2.6025-2.5873v-364.6c0-1.4332-1.1609-2.5873-2.6025-2.5873zm9.3039 13.053h474.64l0.0507 302.27-272.2-0.25213c-4.2691 0.0126-4.277 0.0118-6.0595 1.8115l-40.493 40.057h-155.94z' fill='%230d0d0d' stroke='%23e5e5e5' stroke-width='3.0236'/%3e%3cg transform='matrix(.24259 0 0 .24259 -46.239 264.87)'%3e%3cpath d='m755.67 341.81c1.897-3.149 2.737-6.934 2.31-10.714-0.412-4.634-1.043-8.201-1.883-10.937-1.897-5.677-6.313-10.714-14.926-17.236-6.517-4.838-14.305-9.666-22.709-13.878-15.761-8.196-40.149-17.867-65.581-17.867h-3.562c-13.247 0-28.804-5.255-42.464-9.875-7.361-2.518-14.291-4.828-21.016-6.522-5.051-1.252-14.718-3.353-23.961-3.353h-0.223c-26.271 0-42.032 4.62-54.648 8.196-3.149 0.839-6.09 1.883-9.035 2.518-14.499 3.576-25.859 5.047-38.461 5.047-24.388 0-53.188-5.886-93.958-19.337-1.897-0.636-4.003-1.048-6.095-1.048-8.196 0-15.348 4.828-18.502 12.393-7.356 18.294-4.411 40.785 7.565 58.652 1.679 2.518 3.576 5.047 5.682 7.361-54.44 26.063-82.404 67.042-96.268 98.156-8.201 18.294-13.674 37.616-15.766 56.337-1.897 17.236-0.854 32.366 2.945 42.449 1.252 3.576 3.78 6.522 6.929 8.419-7.356 59.064 13.247 111.82 44.347 139.78 3.149 2.941 7.361 4.411 11.777 4.411 1.674 0 3.149-0.218 4.62-0.631 6.522 11.141 14.087 21.225 22.71 30.26 25.212 25.655 59.062 40.993 101.1 45.613h1.883c6.725 0 12.612-3.785 15.557-9.448 18.929 5.25 38.679 7.565 56.342 7.565 81.347 0 94.371-45.201 96.268-56.754-13.039 4.62-25.859 3.358-32.788 2.941-8.628-0.631-20.608-5.25-27.538-9.462-10.729-6.517-36.369-27.95-35.738-67.469 0.839-59.064 55.488-73.355 74.194-72.306 17.236 0.835 33.429 5.677 46.671 16.392 0.209 0.209 0.412 0.427 0.636 0.636l0.616 0.631c10.729 8.404 24.185 13.029 37.636 13.029 11.141 0 22.064-2.945 31.526-8.831 18.279-11.141 29.42-30.687 29.42-52.12 0-5.25-0.616-10.093-1.679-14.921 0-0.223-0.204-0.427-0.204-0.854-1.47-5.871-4.003-11.35-7.565-17.013-2.945-13.674-6.313-23.549-14.926-35.738-0.839-1.267-2.106-2.528-3.368-3.576-5.0806-3.0916-12.258-5.7485-18.96-3.4426l-2.5761 11.662c-6.1677-6.579-14.587-8.0929-23.795-7.8295l-7.1537 33.157c-14.144-3.2864-28.1-6.5728-43.807-9.8592-16.698-3.4939-1.1801-48.992 22.525-57.91 4.0045-1.5064 28.613-10.912 29.223-0.41172 0.5019 8.6357 0.0605 14.271-0.61066 19.186-1.6564 12.131 11.443 13.253 18.675 11.108 10.25-3.0396 18.63-14.207 18.341-9.4914-0.50301 8.2051-1.0308 14.256 14.886 9.9305 18.525-8.3771 26.467-23.001 29.194-32.244l0.631-0.427c0.839-1.048 6.095-8.201 8.831-13.878l0.427-0.839c0.616-1.252 1.043-2.31 1.47-3.358 3.562-9.035 6.095-18.706 7.347-28.581 0.428-6.114-0.411-12.209-2.517-17.668' fill='%23fafafa'/%3e%3cpath d='m732.01 338.65c-8.196-5.047-15.348-11.981-19.133-17.663-0.621-1.043 0.631-2.31 1.693-1.679 6.726 3.994 17.867 10.719 25.636 13.883 0.427 0.204 1.048-0.223 1.048-0.636-0.209-3.149-0.621-5.677-1.252-7.152-2.31-7.138-48.141-38.043-88.912-37.204-23.961 0.631-50.247-12.189-69.366-16.809-4.843-1.266-13.043-2.742-19.973-2.945-30.483 0-44.982 6.725-59.7 10.302-34.894 8.613-67.891 9.671-141.66-14.717-1.262-0.412-2.941 0.209-3.368 1.47-11.777 29.217 14.717 72.52 58.855 63.276 0.636-0.223 1.048 0.631 0.412 1.043-7.565 6.095-23.738 7.992-33.836 5.047-1.883-0.631-3.989-0.835-6.095-0.631-110.36 42.668-126.32 154.5-114.97 182.24 6.929-25.005 17.867-38.456 27.742-48.345-40.358 79.032-17.648 158.28 20.181 190.44-5.891-18.488-6.095-37.825-2.106-54.013 11.772 71.879 53.809 120.44 133.05 128.43-17.013-7.565-28.993-24.801-32.997-36.369 33.632 36.573 136.63 47.714 166.27 14.921-12.408-0.631-27.741-6.929-36.369-11.981-23.753-14.494-43.711-41.828-44.769-79.668-0.636-23.326 9.254-49.806 32.788-71.045-48.554 9.258-121.7-31.318-116.23-109.5 5.255 89.955 87.441 112.87 138.51 96.477 11.345-4.843 23.753-7.788 36.777-7.788 21.86 0 41.833 7.58 57.594 20.196 0.427 0.412 0.839 0.616 1.266 1.043 7.356 5.886 16.809 9.462 27.111 9.462 8.419 0 15.984-2.324 22.71-6.313 12.612-7.769 21.016-21.652 21.016-37.412 0-3.989-0.427-7.565-1.266-10.937v-0.412c-1.47-5.459-3.989-10.093-7.138-14.509-2.737-13.863-5.255-21.855-12.83-32.778-0.621-0.854-1.679-0.427-1.888 0.616-0.204 4.639-0.631 8.831-1.47 12.616-0.631 3.368-1.679 9.035-2.737 13.451-1.888 6.949 5.047 6.949 8.404 7.361-0.839 2.31-10.292 1.897-10.714 0.204v-0.204c0-0.839-0.209-2.315-0.412-4.197-1.063-10.302-4.416-22.501-13.883-30.478-0.835-0.839-2.31 0.204-2.31 1.883-1.267 12.82-4.416 27.125-8.196 35.103v0.427c-12.408-2.31-28.173-8.404-44.982-10.302-29.008-3.154-43.726-6.522-45.196-22.918 0-0.631 0.839-0.839 1.058-0.204 4.197 8.196 8.201 15.557 32.157 19.337 0.839 0.209 1.252-1.043 0.417-1.47-18.284-10.51-17.445-18.075-16.396-31.735 0-0.854 0.218-1.47 0.422-2.101 4.197-22.079 21.86-37.005 34.472-44.57 0.636-0.427 0.427-1.47-0.427-1.47-17.648 2.106-34.88 9.875-47.287 29.008 1.266-3.78 3.149-7.783 5.677-11.568 21.225-32.57 61.583-25.844 90.591-20.798 1.679 8.613 1.266 21.021-0.631 32.366-0.204 1.475 1.058 2.737 2.31 2.31 15.984-6.298 23.122-20.177 26.698-30.891 3.149 0.616 9.244 1.47 15.353 1.252 0.204 0 0.204 0.218 0 0.218-5.27 0.621-10.098 0.839-10.729 0.621-0.209 0-0.412 0.427-0.209 0.631 1.475 5.682 1.266 15.353 0 23.758-0.204 1.043 0.636 1.897 1.475 1.47 15.761-6.522 18.498-24.388 19.968-29.008 0.621-0.209 1.048-0.636 1.475-0.839 0 0 0.204 0 0.204 0.204 0-0.204 0.209-0.204 0.209-0.412 0.839-1.058 4.843-6.726 6.726-10.51 0 0 0-0.218 0.204-0.218 0-0.204 0.223-0.412 0.223-0.616 0.412-0.839 0.631-1.475 1.043-2.315 3.372-8.196 5.255-16.615 6.313-24.592 1.255-7.996-2.322-15.148-8.62-19.137m-175.31-32.157c-1.883-4.843-1.883-9.671 1.063-13.456 1.883-2.514-2.106-5.459-9.671-2.737 1.883-1.47 4.197-2.31 6.726-2.722 2.31-0.427 4.828-0.218 7.361 0.204 4.828 0.839 9.448 2.518 13.233 5.464 3.368 2.106 6.726 4.843 10.729 7.153-0.223 3.358-1.266 6.725-3.372 10.51-8.406-2.742-15.971-5.464-26.069-4.416m28.601 5.25c2.941-1.897 5.459-4.62 7.342-8.196 0.223 0 0.636 0.209 0.854 0.209 1.47 0.422 2.945 0.835 4.624 1.262 1.47 0.209 3.149 0.427 4.62 0.427 1.47 0 3.149-0.218 4.828-0.218-3.562 2.105-11.981 9.258-22.268 6.516'/%3e%3c/g%3e%3cg transform='matrix(.60808 0 0 .60808 503.05 23.541)'%3e%3cpath transform='matrix(1.6445 0 0 1.6445 -827.27 -40.364)' d='m536.86 21.771v2e-3c-10.533-0.06019-19.131 8.5329-19.131 19.008 0 4.9204 1.9197 9.3941 5.002 12.771l-9.9883 6.625v1.5215c0 3.0556 0.79305 5.7393 2.166 8.2793l0.80469 1.4863h9.1484c-8.6e-4 0.37688-0.0176 0.64492-0.0176 1.0566 0 0.10832 0.019 0.20693 0.0254 0.3125-0.26855 5.2008-1.6826 12.843-14.109 22.303l-4e-3 0.0039-4e-3 2e-3c-3.8905 2.9827-6.7605 7.1131-8.5312 11.914-0.0778 0.13795-0.11204 0.14562-0.20508 0.41406l-0.01 0.0234-6e-3 0.0234c-1.1285 3.4517-1.7832 7.3316-1.7832 11.463 0 2.2357 1.5259 4.3114 6.4277 6.1055 4.9019 1.794 13.59 3.2949 30.215 3.2949 16.625 0 25.315-1.5009 30.217-3.2949 4.9022-1.794 6.4277-3.8654 6.4277-6.1055 0-10.064-3.7823-18.67-10.537-23.84h-2e-3v-2e-3c-8.1296-6.2065-11.475-11.721-12.967-16.154-1.0123-3.0092-1.1353-5.3655-1.1699-7.5195h9.1191l0.80532-1.4863c1.3736-2.5411 2.1641-5.2251 2.1641-8.2793v-1.5273l-9.9961-6.5781c3.0747-3.3827 5.0098-7.8259 5.0098-12.752 0-7.9746-4.9206-14.849-11.918-17.705l-0.0195-0.0078-0.0215-0.0078c-0.0873-0.03402-0.11157 0.0047-0.19336-0.02148-2.1389-0.85066-4.4656-1.3237-6.8984-1.3262v-2e-3c-3e-3 -2.2e-5 -6e-3 2.1e-5 -0.01 0zm-1.2676 0.29883 0.60547 2.5645c-3e-3 1.1e-4 -7e-3 -1.12e-4 -0.01 0zm7.3066 0.87305 0.65235 0.12891c-0.31712-0.07547-0.5863-0.10985-0.8125-0.09375 0.12236-0.0092 3e-3 -0.03581 0.16015-0.03516z' color='%23000000' fill='%23f2f2f2' style='-inkscape-stroke:none'/%3e%3cpath class='st0' d='m95.7 119.8c-27.9-21.3-24.8-39.7-25.2-47.3h17c2-3.7 3-7.1 3-11.4l-19.3-12.7c6.7-4.9 11.1-12.7 11.1-21.6 0-11.2-6.9-20.8-16.7-24.8-3.1-1.2-25 70.5-25 70.5-0.1 1.7-0.1 3.8-0.1 6.4 0 7.1 17.5 6.1 16.6 12.3-1.4 9.4-1.7 16.6-9.8 39.2-5.5 15.3-42 0-44.6 7.5-1.7 5.2-2.7 11.1-2.7 17.4 0 0.7 1.5 10.8 55.6 10.8s55.6-10.1 55.6-10.8c0-15.4-5.7-28-15.5-35.5z'/%3e%3cpath class='st1' d='m54.6 129.4c3-13.7 5.7-28.3 7.3-37 2-10.9-14.5-12.9-21.3-13.9-0.3 9.3-2.9 24.4-25.1 41.3-6 4.6-10.4 11.1-13 18.9 6 2.9 14 4.7 26.3 4.7 7.9 0 22.5 1 25.8-14z'/%3e%3cpath class='st1' d='m66.2 72.5c2.6-6.8 2.3-11.4 2.3-11.4l-10.9-12.7c11.6-5 18.6-14.3 18.6-25.1 0-8.7-4.1-16.4-10.5-21.2-3.1-1.3-6.5-2-10.1-2-14.8-0.1-26.8 11.9-26.8 26.6 0 8.9 4.4 16.8 11.1 21.6l-19.3 12.8c0 4.3 1 7.7 3 11.4z'/%3e%3cpath class='st2' d='m54.1 5.4c15.4 2.4-7.1 20.3-14.2 19.5-6.8-0.8-0.3-21.7 14.2-19.5z'/%3e%3c/g%3e%3cpath d='m267.76 373.1q-1.64 0-3.02-0.52-1.36-0.54-2.38-1.5-1.02-0.98-1.58-2.3t-0.56-2.88 0.56-2.88 1.58-2.28q1.04-0.98 2.42-1.5 1.38-0.54 3.02-0.54 1.78 0 3.2 0.58 1.44 0.58 2.42 1.7l-1.64 1.6q-0.82-0.82-1.78-1.2-0.94-0.4-2.08-0.4-1.1 0-2.04 0.36t-1.62 1.02-1.06 1.56q-0.36 0.9-0.36 1.98 0 1.06 0.36 1.96 0.38 0.9 1.06 1.58 0.68 0.66 1.6 1.02t2.04 0.36q1.04 0 2-0.32 0.98-0.34 1.86-1.12l1.48 1.94q-1.1 0.88-2.56 1.34-1.44 0.44-2.92 0.44zm3.02-2.12v-5.24h2.46v5.58zm5.98 1.92v-14h2.14l6.12 10.22h-1.12l6.02-10.22h2.14l0.02 14h-2.46l-0.02-10.14h0.52l-5.12 8.54h-1.16l-5.2-8.54h0.6v10.14zm27.14-3.3-0.14-3.08 7.34-7.62h2.92l-6.1 6.48-1.44 1.58zm-2.32 3.3v-14h2.6v14zm9.76 0-5.36-6.38 1.72-1.9 6.68 8.28zm4.92 0v-14h5.76q1.86 0 3.18 0.6 1.34 0.6 2.06 1.72t0.72 2.66-0.72 2.66q-0.72 1.1-2.06 1.7-1.32 0.58-3.18 0.58h-4.32l1.16-1.18v5.26zm9.16 0-3.54-5.08h2.78l3.56 5.08zm-6.56-4.98-1.16-1.24h4.2q1.72 0 2.58-0.74 0.88-0.74 0.88-2.06 0-1.34-0.88-2.06-0.86-0.72-2.58-0.72h-4.2l1.16-1.28zm12.12 4.98v-14h2.6v14zm8.8-3.3-0.14-3.08 7.34-7.62h2.92l-6.1 6.48-1.44 1.58zm-2.32 3.3v-14h2.6v14zm9.76 0-5.36-6.38 1.72-1.9 6.68 8.28zm10.98 0.2q-1.64 0-3.02-0.54t-2.4-1.5q-1.02-0.98-1.58-2.28-0.56-1.32-0.56-2.88t0.56-2.86q0.56-1.32 1.58-2.28 1.02-0.98 2.4-1.52t3-0.54q1.64 0 3 0.54 1.38 0.54 2.4 1.52 1.02 0.96 1.58 2.28 0.56 1.3 0.56 2.86t-0.56 2.88-1.58 2.28-2.4 1.5q-1.36 0.54-2.98 0.54zm-0.02-2.28q1.06 0 1.96-0.36t1.56-1.02q0.66-0.68 1.02-1.56 0.38-0.9 0.38-1.98t-0.38-1.96q-0.36-0.9-1.02-1.56-0.66-0.68-1.56-1.04t-1.96-0.36-1.96 0.36q-0.88 0.36-1.56 1.04-0.66 0.66-1.04 1.56-0.36 0.88-0.36 1.96 0 1.06 0.36 1.96 0.38 0.9 1.04 1.58 0.66 0.66 1.56 1.02t1.96 0.36zm10.4 2.08v-14h5.76q1.86 0 3.18 0.6 1.34 0.6 2.06 1.72t0.72 2.66-0.72 2.66q-0.72 1.1-2.06 1.7-1.32 0.58-3.18 0.58h-4.32l1.16-1.18v5.26zm9.16 0-3.54-5.08h2.78l3.56 5.08zm-6.56-4.98-1.16-1.24h4.2q1.72 0 2.58-0.74 0.88-0.74 0.88-2.06 0-1.34-0.88-2.06-0.86-0.72-2.58-0.72h-4.2l1.16-1.28zm17.74 4.98v-14h2.14l6.12 10.22h-1.12l6.02-10.22h2.14l0.02 14h-2.46l-0.02-10.14h0.52l-5.12 8.54h-1.16l-5.2-8.54h0.6v10.14zm21.6-8.18h6.96v2.14h-6.96zm0.2 6h7.9v2.18h-10.5v-14h10.22v2.18h-7.62zm13.22-1.12-0.14-3.08 7.34-7.62h2.92l-6.1 6.48-1.44 1.58zm-2.32 3.3v-14h2.6v14zm9.76 0-5.36-6.38 1.72-1.9 6.68 8.28zm14.76-14h2.6v14h-2.6zm-7.24 14h-2.6v-14h2.6zm7.44-6h-7.66v-2.22h7.66zm6.26 6v-14h2.6v14zm9.32 0v-11.8h-4.64v-2.2h11.88v2.2h-4.64v11.8zm6.62 0 6.3-14h2.56l6.32 14h-2.72l-5.42-12.62h1.04l-5.4 12.62zm2.9-3.24 0.7-2.04h7.56l0.7 2.04zm14.16 3.24v-14h5.76q1.86 0 3.18 0.6 1.34 0.6 2.06 1.72t0.72 2.66-0.72 2.66q-0.72 1.1-2.06 1.7-1.32 0.58-3.18 0.58h-4.32l1.16-1.18v5.26zm9.16 0-3.54-5.08h2.78l3.56 5.08zm-6.56-4.98-1.16-1.24h4.2q1.72 0 2.58-0.74 0.88-0.74 0.88-2.06 0-1.34-0.88-2.06-0.86-0.72-2.58-0.72h-4.2l1.16-1.28zm12.12 4.98v-14h2.6v14zm4.5 0 6.3-14h2.56l6.32 14h-2.72l-5.42-12.62h1.04l-5.4 12.62zm2.9-3.24 0.7-2.04h7.56l0.7 2.04zm14.16 3.24v-14h2.14l8.78 10.78h-1.06v-10.78h2.58v14h-2.14l-8.78-10.78h1.06v10.78z' fill='%23f2f2f2' stroke-width='1.8898' aria-label='GM KRIKOR MEKHITARIAN'/%3e%3c/g%3e%3cstyle type='text/css'%3e .st0%7bfill:%23FFFFFF;%7d .st1%7bfill:%235D9948;%7d .st2%7bfill:%2381B64C;%7d .st3%7bfill:%23B2E068;%7d %3c/style%3e%3cstyle type='text/css'%3e .st0%7bfill:%235D9948;%7d .st1%7bfill:%2381B64C;%7d .st2%7bfill:%23B2E068;%7d %3c/style%3e%3c/svg%3e `;

      imagemDiv.style.backgroundImage = `url("${imgSvg}"), url("${imgURL}"), url("https://github.com/FSA1/addons/raw/main/images/GMKrikor/thumb2.png")`;
      imagemDiv.style.backgroundPosition = 'center, 49% 23%, 49% 23%';
      imagemDiv.style.backgroundSize = 'contain, 84%, 84%';
      imagemDiv.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat';


      var fecharBtn = document.createElement('div');
      fecharBtn.id = 'fecharBtn';
      fecharBtn.textContent = '';
      fecharBtn.onclick = function() {
        imagemDiv.remove();
      };

      imagemDiv.appendChild(fecharBtn);
      document.body.appendChild(imagemDiv);

      // Função para permitir arrastar o div
      imagemDiv.onmousedown = function(event) {
        var shiftX = event.clientX - imagemDiv.getBoundingClientRect().left;
        var shiftY = event.clientY - imagemDiv.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
          imagemDiv.style.left = pageX - shiftX + 'px';
          imagemDiv.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        imagemDiv.onmouseup = function() {
          document.removeEventListener('mousemove', onMouseMove);
          imagemDiv.onmouseup = null;
        };
      };

      imagemDiv.ondragstart = function() {
        return false;
      };

    }

    var camId;
    var imagemDiv = document.createElement('div');
    imagemDiv.id = 'imagemDiv';

    function iniciarIntervalo() {
      if(camId){
        clearInterval(camId)
      }
      camId = setInterval(() => {

    var newImageUrl = updateImageURL();
    mostrarImagem(newImageUrl);
    //console.log("imagem 👉 =====> "+newImageUrl);
      }, 10000);
    }
    var firstImg = 'https://github.com/FSA1/addons/raw/main/images/GMKrikor/fakecam1.gif';
    mostrarImagem(firstImg);
    iniciarIntervalo();
    //END fakecam==================================================================================

    //Saudações================================================
    function tocarAudioPorHorario() {
      var audio = new Audio();
      var horaAtual = new Date().getHours();

      if (horaAtual >= 5 && horaAtual < 12) {
        // Bom dia
        audio.src = getAudioFilesListAndSetInterval('', 'goodmorning', 0);
      } else if (horaAtual >= 12 && horaAtual < 18) {
        // Boa tarde
        audio.src = getAudioFilesListAndSetInterval('', 'goodevening', 0);
      } else {
        // Boa noite
        audio.src = getAudioFilesListAndSetInterval('', 'goodevening', 0);
      }
      if(connected){
        audio.play();
        console.log('Saudações! 🙋‍♂️')
      }
    }

    // Chame a função quando quiser tocar o áudio
    setTimeout(tocarAudioPorHorario, 30000);
    //FIM Saudações================================================
    //=========TIMEALERT===================================================================================================================

    // Função para tocar um som de alerta
    let alertSoundPlayed = false;
    function playTimeAlertSound() {
        if (!alertSoundPlayed) {
            var alertSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/correct.mp3');
            alertSound.volume = 0.4;
            alertSound.play();
            alertSoundPlayed = true;
        }
    }

    // Variável global para armazenar a referência do intervalo
    let intervaloDeVerificacao;
    // Função para verificar o tempo e emitir um alerta
    function checkTimeAndAlert() {
        var node = document.querySelector('.player-bottom .clock-time-monospace');
        if (node) {
            var timeText = node.textContent;
            var timeParts = timeText.split(':');
            var minutes = parseInt(timeParts[0], 10);
            var seconds = parseFloat(timeParts[1]);
            var totalSeconds = minutes * 60 + seconds;

            if (totalSeconds <= 10) {
                playTimeAlertSound();
                //getAudioFilesListAndSetInterval('(lance-|pindura)', 'movefast', 1000);
            }
            //console.log('Tempo: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds.toFixed(1));
        }
    }

    // Função para iniciar a verificação com base no tempo restante
    function iniciarVerificacao() {
        // Cancela o intervalo anterior, se houver
        if (intervaloDeVerificacao) {
            clearInterval(intervaloDeVerificacao);
        }

        checkTimeAndAlert(); // Verifica o tempo imediatamente

        // Define o intervalo de verificação com base no tempo restante
        var node = document.querySelector('.player-bottom .clock-time-monospace');
        if (node) {
            var tempoInicial = node.textContent;
            var partesDoTempo = tempoInicial.split(':');
            var minutos = parseInt(partesDoTempo[0], 10);
            var segundos = parseFloat(partesDoTempo[1]);
            var segundosTotais = minutos * 60 + segundos;

            // Ajusta o intervalo de verificação
            var intervalo = segundosTotais > 60 ? 1000 : 100; // Verifica a cada segundo se mais de 1 minuto restante, senão a cada 100ms

            intervaloDeVerificacao = setInterval(checkTimeAndAlert, intervalo);
        }
    }

    // Inicia a verificação
    iniciarVerificacao();

    //==========END TIMEALERT===================================================================================================================


    //Alerts Observer ======================================================================
    let listenAlertinterv = 300; // Inicializa o intervalo com 30 segundos
    var connected = true;
    const alertsContainer = document.getElementsByClassName('alerts-container');
    var alertsMutationConfig = { childList: true, subtree: true };

    // Função recursiva para verificar se o elemento 'alertsContainer' contém mensagens
    function alertsContainerObserver() {
        if (alertsContainer.length === 0) {
            window.setTimeout(alertsContainerObserver, listenAlertinterv);
            console.log('❕🔕 O nó de alertas não está disponível. Nova tentativa em ' + (listenAlertinterv / 1000) + 's.');
            return;
        }
        console.log('❕🔔 Monitoramento de desconexão iniciado.');
        Array.from(alertsContainer).forEach(x => {
            alertsObserver.observe(x, alertsMutationConfig);
        });
    }

    // Função de callback para observar as mutações nos alertas
    const callbackAlerts = function(mutationsList, alertsObserver) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('alerts-message')) {
                        // Extrai o texto do elemento
                        const alertText = node.querySelector('span').textContent;
                        console.log('Mensagem: ' + alertText);
                        // Lógica para detectar a palavra "desconectado" em vários idiomas
                        if (connected === true && isDisconnected(alertText)) {
                            console.log('🌐⛔ Desconectado!');
                            connected = false;
                            playTimeAlertSound();
                            clearInterval(audioInterval);
                        }
                    }
                }
            }
        }
    };

    // Função para verificar se o texto contém a palavra "desconectado" em diferentes idiomas
    function isDisconnected(text) {
        const disconnectedWords = ['desconectado', 'disconnected', 'déconnecté', 'scollegato', 'desconectado', 'getrennt', '断开连接', 'отключено'];
        const lowerCaseText = text.toLowerCase();
        return disconnectedWords.some(word => lowerCaseText.includes(word));
    }

    // Inicializa a observação dos alertas
    const alertsObserver = new MutationObserver(callbackAlerts);
    alertsContainerObserver();
    //END Alerts Observer ======================================================================


})();