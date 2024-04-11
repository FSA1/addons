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
    //=== Tocar audio referenciado aleatoreamente ==========
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
    // END Função para tocar um áudio de início personalizado

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
    //=== FIM de tocar audio referenciado aleatoreamente ==========

    //score monitoring==========/

    // Objeto para armazenar o último score e timestamp
    let lastScoreData = { score: null, timestamp: null };
    let lastScorePieceData = { score: null, timestamp: null };

    //==========score pieces==========
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
    //END score pieces ==========/


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
    //End score monitoring==========/

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

    //Saudações==========
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
    //FIM Saudações==========

    //=========TIMEALERT==========

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

    //==========END TIMEALERT==========


    //Alerts Observer ==========
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
    //END Alerts Observer ==========


})();