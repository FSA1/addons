/****************************************
 * This extension was inspired by the   *
 * extension "Twitch Chess move filter" *
 ****************************************/

//method to detect color scheme
let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
console.log('dark mode: ' + dark);
let colorScheme = 'light'
if (dark) {
    colorScheme = 'dark'
} else {
    colorScheme = 'light'
}



//Eng: set laughter volume (1=100% 0.5=50%) ( will not work with laudness equalization)
//pt_BR: volume de risadas, não funciona se voce ativar a equalização de intensidade nas configuralções de som do sistema.
var laughsVol = 0.4;
var greetVol = 1;
var miscVol = 1;
var OnOff=true;
//variables to play sound assigned after regex filter
var miscSound = new Audio('');
var greetSound = new Audio('');
var laughSound = new Audio('');
// Method for setting the RegEx used in filtering
function checkSettings() {
    chrome.storage.local.get({
        //categories
        OnOff:true,
        Laughs: true,
        Greetings: true,
        Miscellaneous: true,
        Pringles: true,
        //volume
        laughsVol: 0.4,
        greetVol: 1,
        miscVol: 1
    },
        function (items) {
            var regx1;
            var regx2;
            var regx3;
            var regx4;
            //if false regex will be unsigned and ignored
            if (items.Laughs) {
                regx1 = regexLaughs.source
            }
            if (items.Greetings) {
                regx2 = regexGreetings.source
            }
            if (items.Miscellaneous) {
                regx3 = regexMisc.source
            }
            if (items.Pringles) {
                regx4 = regexPringles.source
            }
            selectedRegEx = new RegExp(regx1 + "|" + regx2 + "|" + regx3 + "|" + regx4, 'gui');
            laughsVol = items.laughsVol;
            greetVol = items.greetVol;
            miscVol = items.miscVol;
            OnOff = items.OnOff;
            if (!items.OnOff) {
                selectedRegEx = null
            }
        });
}
// If the extension is enabled in the options menu then it will work. Maybe there is a better way to do it.
if (OnOff===true) {
// Get the Twitch chat HTML element
const chat = document.getElementsByClassName('chat-scrollable-area__message-container');

// Regular expression for the laughs
var regexLaughs = new RegExp(/\b((KEKW([ ]{0,1})){1,}|k{3,}|([khae ]){6,}|((ja)( ){0,1}){3,}|(s+[hua]{2,}){2,}|palmas|app?laus[eo]s|[A-z]{0,}(Clap( {0,})){1,})\b|\b(omega)?[l][ou]{1,}[l]{1,}\b[!]{0,}/g, 'gui')

// Regular expression for the greetings
var regexGreetings = new RegExp(/^(bo[ma] (dia|tarde|noite))!?|Salve.{0,2}/g, 'gui')

// Regular expression for the  GMKrikor channel
var regexPringles = new RegExp(/\b(Pringles|fot(o){0,1}(inh[oa]){0,1} de anime|n[aã]o ?magoar( as)? ?pessoas|jogar? [kc]aro[ -]?[kc]ann?|jogar? francesa|caraca ?g4|g4 ?grobiano|grobiano ?raiz|premove ?aloprado|(seis|[0-9]{1,})( ?k?| ?mil)? ?lances?|p[ei]ndura[A-z]{0,}|da ?mate ?logo|oh ?c'?mon|(eu ?)?to ?pior( ?j[aá])?|to ?melhor( ?j[aá])?|nota ?zero|[KG]ri[kg]or?[A-z]{0,}|roubei ?nessa ?(partida)?|(o ?cara ?)?t[aá] ?ro(u)?bando|claramente ?roubando|^(mds|mjc|msca)$)\b|\b(oh?)? ?cacilda\b!?|\bbamos\b!?|\bperdemo\b!?|\bSafado\b!?|lance!|(eu )?[voôu]{2,3} ?processar ?[oa]?|(a[ií])? ?é fl[oó]rida|\blondres\b!|\bsaudaç[õo]es ?noturnas?\b!?/g, 'gui')

// Regular expression for general terms and expressions
var regexMisc = new RegExp(/\b(MLADY|modCheck|(isso)? ?n[ao] russia [A-zÀ-ú ,.]{0,} cadeia|Raff?a?(el)? ?Pig|Raff?ael Leitão|senna|Ding( Liren)?|Magnus( Carlsen)?|(Hikaru )?Naka(mura)?|(Ian )?Nepo([A-z]{0,})|Raff?a?(el)? ?Chess|wh([a]){2,}t[?]{0,}|o? ?qu(e){3,}[?]{0,}|q{4,}|en[gja]{1,2}ine|stockfish|(stock){0,1}peixe|barri(lda|nha)|tilt[A-z]{0,}|tchau ?daminha|(final)( ){0,}triste|(sadness)( ){0,}and( ){0,}sorrow|cheating)\b|\ba?cab([o]){2,}([hu ]){0,}\b!?|[eéh ]{0,}\bt[eé]{1,}tr[a]{1,}\b!?|\bvergonh[A-z]{0,}\b!?/g, 'gui')

// Enable the mutation observer to observe the child elements of the Twitch chat, the chat messages
var mutationConfig = { childList: true };

//maybe there will be an alternate server.
const srvgithub = 'https://github.com/FSA1/addons/raw/main/PlayAudioOnTwich/';
const selectedServer = srvgithub;

//audio files. [IMPORTANT: urls are case sensitive eg: .MP3/.mp3]
const hahaha = selectedServer + 'audio/varios/SitcomLaughter.mp3';
const hahaha2 = selectedServer + 'audio/varios/hahaha-stand-up01.mp3';
const hahaha3 = selectedServer + 'audio/varios/hahaha-stand-up02.mp3';
const hahaha4 = selectedServer + 'audio/varios/hahaha-stand-up03.mp3';
const hahaha5 = selectedServer + 'audio/varios/hahaha-stand-up04.mp3';
const hahaha6 = selectedServer + 'audio/varios/hahaha-Thiago-Ventura.mp3';
const kekw = selectedServer + 'audio/varios/KEKWcut-40.mp3';
const aplausos = selectedServer + 'audio/varios/mixkit-audience-light-applause-354.mp3';
const sadnessandsorrow = selectedServer + 'audio/varios/sadnessandsorrow.mp3';
const senna = selectedServer + 'audio/varios/senna-short.mp3';
const tetra = selectedServer + 'audio/varios/tetra.mp3';
const batidasnaporta = selectedServer + 'audio/varios/batida-de-porta-troll.mp3';
const vergonhadaprofession = selectedServer + 'audio/varios/jacquin-voce-e-a-vergonha-da-profession.mp3';
const shutdownxp = selectedServer + 'audio/varios/shutdown-xp.mp3';

//RafPig
const tchaudaminha = selectedServer + 'audio/RafPig/tchaudaminha.MP3';

//GMKrikor channel
const bamos = selectedServer + 'audio/GMKrikor/bamos.MP3';
const damatelogo = selectedServer + 'audio/GMKrikor/damatelogo.MP3';
const florida = selectedServer + 'audio/GMKrikor/florida.MP3';
const londres = selectedServer + 'audio/GMKrikor/londres.MP3';
const ohcmon = selectedServer + 'audio/GMKrikor/ohcmon.MP3';
const topior = selectedServer + 'audio/GMKrikor/topior.MP3';
const topior2 = selectedServer + 'audio/GMKrikor/deixei-escapar-essa-vantagem.MP3';
const tomelhor = selectedServer + 'audio/GMKrikor/tomelhor.MP3';
const notazero = selectedServer + 'audio/GMKrikor/notazero.MP3';
const vouprocessarokrikor = selectedServer + 'audio/GMKrikor/vouprocessarokrikor.MP3';
const bomdia1 = selectedServer + 'audio/GMKrikor/krikor-bom-dia-pessoal01.MP3';
const bomdia2 = selectedServer + 'audio/GMKrikor/krikor-bom-dia-pessoal02.MP3';
const bomdia3 = selectedServer + 'audio/GMKrikor/krikor-bom-dia-pessoal03.MP3';
const cacilda1 = selectedServer + 'audio/GMKrikor/cacilda01.MP3';
const cacilda2 = selectedServer + 'audio/GMKrikor/cacilda02-deixa-eu-dar-o-mate.MP3';
const safado1 = selectedServer + 'audio/GMKrikor/safado-neh.MP3';
const safado2 = selectedServer + 'audio/GMKrikor/entao-esse-que-eh-o-safado.MP3';
const saudacoesnoturnas = selectedServer + 'audio/GMKrikor/saudacoesnoturnas.MP3';
const claramenteroubando = selectedServer + 'audio/GMKrikor/claramenteroubando.MP3';
const ocarataroubando = selectedServer + 'audio/GMKrikor/ocarataroubando.MP3';
const engine = selectedServer + 'audio/GMKrikor/Sempre-tem-um-engine-que-vai-estragar-sua-vida.MP3';
const roubeinessapartida = selectedServer + 'audio/GMKrikor/roubeinessapartida.MP3';
const pinduramds = selectedServer + 'audio/GMKrikor/pinduramds.MP3';
const pinduradesgraca = selectedServer + 'audio/GMKrikor/pindura-desgra%C3%A7a.MP3';
const pinduramaldito = selectedServer + 'audio/GMKrikor/pindura-maldito.MP3';
const andameufilho = selectedServer + 'audio/GMKrikor/andameufilho.MP3';
const queroquecefacalance = selectedServer + 'audio/GMKrikor/queroquecefacalance.MP3';
const acelerameufilho = selectedServer + 'audio/GMKrikor/acelerameufilho.MP3';
const jogamaisrapido = selectedServer + 'audio/GMKrikor/jogamaisrapido.MP3';
const seisklances = selectedServer + 'audio/GMKrikor/6klances.MP3';
const quepremovealoprado = selectedServer + 'audio/GMKrikor/quepremovealoprado.MP3';
const mjc = selectedServer + 'audio/GMKrikor/mjc.MP3';
const msca = selectedServer + 'audio/GMKrikor/msca.MP3';
const grobianoraiz = selectedServer + 'audio/GMKrikor/grobianoraiz.MP3';
const caracag4 = selectedServer + 'audio/GMKrikor/caracag4.MP3';
const naomagoarpessoas = selectedServer + 'audio/GMKrikor/naomagoarpessoas.MP3';

// Global variable to track the RegEx in use
var selectedRegEx;

// play random sounds
function playRandomSound(audioLinks, vol, type) {

    //This line will select a random sound to play out of your provided URLS
    //var soundFile = sounds[Math.floor(Math.random()*sounds.length)];

    //var rSound = new Audio(options[Math.floor(Math.random() * options.length)]);
    if (type === 'laughs' && laughSound.paused === true) {
            laughSound.src = audioLinks[Math.floor(Math.random() * audioLinks.length)];
            laughSound.volume = vol;
            laughSound.play();
    }
    if (type === 'greet' && greetSound.paused === true) {
            greetSound.src = audioLinks[Math.floor(Math.random() * audioLinks.length)];
            greetSound.volume = vol;
            greetSound.play();
    }
    if (type === 'misc' && miscSound.paused === true) {
            miscSound.src = audioLinks[Math.floor(Math.random() * audioLinks.length)];
            miscSound.volume = vol;
            miscSound.play();
    }
}
function randomLink(links) {
    const rLink = links[Math.floor(Math.random() * links.length)];
    return rLink;
}
//image to indicate the app get some word/expression
const audioSymbol = '<img style="display: block; user-select: none; margin: left;  width: 16px;" src="' + selectedServer + 'emotes/audio-on-small-'+colorScheme+'.gif"> '

//function for betterTTV images
function bttvEmo(codeBTTV, altText) {
    const bttHTML = '<img src="https://cdn.betterttv.net/emote/' + codeBTTV + '/1x" srcset="https://cdn.betterttv.net/emote/' + codeBTTV + '/2x 2x, https://cdn.betterttv.net/emote/' + codeBTTV + '/3x 4x" alt="' + altText + '" class="chat-line__message--emote bttv-emote-image">  &nbsp;';
    return bttHTML;
}
//function for native Twitch betterTTV images
function bttvEmoV2(codeBTTVv2, altText) {
    const bttv2HTML = '<span class="bttv-message-container">  <img alt="' + altText + '" class="chat-image chat-line__message--emote" src="https://static-cdn.jtvnw.net/emoticons/v2/' + codeBTTVv2 + '/default/' + colorScheme + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v2/' + codeBTTVv2 + '/default/' + colorScheme + '/1.0 1x,https://static-cdn.jtvnw.net/emoticons/v2/' + codeBTTVv2 + '/default/' + colorScheme + '/2.0 2x,https://static-cdn.jtvnw.net/emoticons/v2/' + codeBTTVv2 + '/default/' + colorScheme + '/3.0 4x"> </span> &nbsp;';
    return bttv2HTML;
}
//function for tenor images
function tenorEmo(widthPercent, tenorCodBarImgName) {
    const tenorEmoHTML = '<img style="display: block; user-select: none; margin: left;  width: ' + widthPercent + '" src="https://c.tenor.com/' + tenorCodBarImgName + '.gif">  &nbsp;';
    return tenorEmoHTML;
}
//function for images hosted by Me
function myEmote(widthPercent, imgNameAndExt) {
    const emoteHTML = '<img style="display: block; user-select: none; margin: left;  width: ' + widthPercent + '" src="' + selectedServer + 'emotes/' + imgNameAndExt + '">  &nbsp;';
    return emoteHTML;
}
//function for images from arbitrary urls
function anySiteEmo(widthPercent, fullURL) {
    const emoteHTML = '<img style="display: block; user-select: none; margin: left;  width: ' + widthPercent + '" src="' + fullURL + '">  &nbsp;';
    return emoteHTML;
}
//function for personalities images hosted by Me
function myPers(widthPercent, imgNameAndExt) {
    const persHTML = '<img style="display: block; user-select: none; margin: left;  width: ' + widthPercent + '" src="' + selectedServer + 'personalities/chess/' + imgNameAndExt + '">  &nbsp;';
    return persHTML;
}
// Recursive function to check if the Twitch chat contains messages
function addObserverIfDesiredNodeAvailable() {
    if (chat.length == 0) {
        window.setTimeout(addObserverIfDesiredNodeAvailable, 1000);
        return;
    }
    Array.from(chat).forEach(x => {
        observer.observe(x, mutationConfig)
    })
}
// Main function for replacing words and expressions with the funny-sound HTML element
const callback = function (mutationsList, observer) {
    Array.from(mutationsList).forEach(mutation => {
        checkSettings();
        if (mutation.type === 'childList') {
            if (mutation.target.getElementsByClassName('text-fragment').length != 0) {
                var newestMessage = mutation.target.getElementsByClassName('text-fragment')[mutation.target.getElementsByClassName('text-fragment').length - 1].innerHTML
                if (!newestMessage.includes('<a class="funny-sound">')) {
                    if (selectedRegEx != null) {
                        mutation.target.getElementsByClassName('text-fragment')[mutation.target.getElementsByClassName('text-fragment').length - 1].innerHTML = newestMessage.replace(selectedRegEx, function (message) {
                            return '<a class="funny-sound">'+audioSymbol+'</a>' + soundmsg(message);
                        })
                    }
                }
            }
        }
    })
};

const observer = new MutationObserver(callback);


// The sound and text message that will replace the term matched
const soundmsg = (message) => {
    //minúsculo usa emote alternativo, animado
    if (message.match(/(KEKW([ ]{0,1})){1,}/gu)) {
        playRandomSound([kekw], laughsVol, 'laughs')
        return bttvEmo('5e9c6c187e090362f8b0b9e8', 'KEKW')
    }//minúsculo usa emote alternativo, animado
    if (message.match(/(kekw([ ]{0,1})){1,}/gu)) {
        playRandomSound([kekw], laughsVol, 'laughs')
        return bttvEmo('62b2898c65092c1291b963e1', 'KEKW')
    }//kkkk, hahaha, hehehe, jajaja, LOL, lul (LUL maiúsculo não é capturado, infelizmente)
    if (message.match(/(k{3,}|([khae ]){6,}|((ja) ?){3,}|(s+[hua]{2,}){2,}|\b(omega)?[l][ou]{1,}[l]{1,}\b[!]{0,})/gui)) {
        playRandomSound([hahaha, hahaha2, hahaha3, hahaha4, hahaha5], laughsVol, 'laughs')
        return bttvEmoV2('425618', 'LUL')
    }//\bvergonh[A-z]{0,}\b!?
    if (message.match(/(\bvergonh[A-z]{0,}\b!?)/gui)) {
        playRandomSound([vergonhadaprofession], miscVol, 'misc')
        return randomLink([myEmote('30%', 'profession.png'), myEmote('30%', 'profession.gif'), myEmote('30%', 'profession2.gif')]) + message
    }
    //palmas PT e En
    if (message.match(/(palmas|[A-z]{0,}(Clap( {0,})){1,}|aplausos|applauses)/gui)) {
        playRandomSound([aplausos], laughsVol, 'laughs')
        return randomLink([myEmote('30%', 'clap.gif'), myEmote('30%', 'clap2.gif'), myEmote('30%', 'clap3.gif'), myEmote('30%', 'clap4.gif'), myEmote('30%', 'clap5.gif')]) + message
    }//Bom dia (imagem provisória)
    if (message.match(/\bbom dia\b!?/gui)) {
        playRandomSound([bomdia1, bomdia2, bomdia3], greetVol, 'greet')
        return tenorEmo('30%', 'jdBU6FP2oi8AAAAi/catala-bon-dia') + message
    }//Boa tarde
    if (message.match(/\bboa tarde\b!?/gui)) {
        //som em breve
        return tenorEmo('30%', 'mlmBfvRo0FsAAAAd/salve-rapaziada-ninjas-in-pyjamas') + message
    }//Boa noite, Krikor 'Saudações noturnas' (Krikor propôs que se saudasse como no emote MLADY)
    if (message.match(/\b(boa noite|saudaç[õo]es ?noturnas?)\b!?/gui)) {
        playRandomSound([saudacoesnoturnas], greetVol, 'greet')
        return randomLink([myEmote('30%', 'mlady.gif'), myEmote('30%', 'mlady2.gif'), myEmote('30%', 'mlady3.gif'), myEmote('30%', 'mlady4.gif')]) + message
    }//Salve!
    if (message.match(/Salve.{0,2}/gui)) {
        //som em breve
        return tenorEmo('30%', 'P-DA6xO99H0AAAAj/unis-flyers') + message
    }//fotinho de anime
    if (message.match(/fot(o){0,1}(inh[oa]){0,1} de anime/gui)) {
        playRandomSound([kekw], laughsVol, 'laughs')
        return bttvEmo('618664d51f8ff7628e6cad93', 'KEKW') + message
    }//MLADY, emote de cumprimento
    if (message.match(/mlady/gui)) {
        return randomLink([myEmote('30%', 'mlady.gif'), myEmote('30%', 'mlady2.gif'), myEmote('30%', 'mlady3.gif'), myEmote('30%', 'mlady4.gif')])
    }//whaaaat?, o queee?
    if (message.match(/wh([a]){2,}t[?]{0,}|o? ?qu(e){3,}[?]{0,}|q{4,}/gui)) {
        playRandomSound([msca], miscVol, 'misc')
        return tenorEmo('30%', 'PuHfGwOm4HYAAAAM/shocked-oh.gif') + message
    }//emote: stockfish, stockpeixe, engine, enjaine
    if (message.match(/(stockfish|(stock){0,1}peixe|en[gja]{1,2}ine)/gui)) {
        //sem audio por enquanto
        return bttvEmoV2('160402', 'SabaPing') + message
    }//siglas para "meu Deus do ceu", "meu Jesus/Santo Cristo amado", 
    if (message.match(/^(mds|mjc|msca)$/gui)) {
        playRandomSound([mjc, msca], miscVol, 'misc')
        return tenorEmo('30%', 'AbXV2FwLRNgAAAAd/goodstory-legendary') + message
    }//Safado!
    if (message.match(/\bSafado\b!?/gui)) {
        playRandomSound([safado1, safado2], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a>&nbsp ' + message
    }//Oh Cacilda!
    if (message.match(/\b(oh?)? ?cacilda\b!?/gui)) {
        playRandomSound([cacilda1, cacilda2], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a>&nbsp ' + message
    }//Tilt
    if (message.match(/tilt[A-z]{0,}/gui)) {
        playRandomSound([shutdownxp], laughsVol, 'laughs')
        return randomLink([myEmote('30%', 'tilted.gif'), myEmote('30%', 'tilted2.gif'), myEmote('30%', 'tilted3.gif'), myEmote('30%', 'tilted4.gif'), myEmote('30%', 'tilted5.gif'), myEmote('30%', 'tilted6.gif'), myEmote('30%', 'tilted7.gif'), myEmote('30%', 'tilted8.gif'), myEmote('30%', 'tilted9.gif'), myEmote('30%', 'tilted10.gif')]) + message
    }//barrilda
    if (message.match(/barri(lda|nha)/gui)) {
        return myEmote('30%', 'barrilda.gif') + message
    }//Rafael Leitão, RafPig, Raffa Pig
    if (message.match(/Raff?a?(el)? ?Pig|Raff?ael Leitão/gui)) {
        return myPers('30%', 'RafPig.png') + message
    }//Raffael Chess
    if (message.match(/Raff?a?(el)? ?Chess/gui)) {
        return myPers('30%', 'RaffaelChess.png') + message
    }//Ian Nepomniachi
    if (message.match(/((Ian )?Nepo([A-z]{0,}))/gui)) {
        return myPers('30%', 'nepomniachi.png') + message
    }//Magnus Carlsen
    if (message.match(/Magnus( Carlsen)?/gui)) {
        return randomLink([myPers('30%', 'Carlsen.png'), myPers('30%', 'Carlsen2.png'), myPers('30%', 'Carlsen3.png'), myPers('30%', 'Carlsen4.png')]) + message
    }//Hikaru Nakamura
    if (message.match(/(Hikaru )?Naka(mura)?/gui)) {
        return myPers('30%', 'Nakamura.png') + message
    }//Ding Liren
    if (message.match(/Ding( Liren)?/gui)) {
        return myPers('30%', 'ding.png') + message
    }//Acabou!, é tetra!
    if (message.match(/\ba?cab([o]){2,}([hu ]){0,}\b!?|[eéh ]{0,}\bt[eé]{1,}tr[a]{1,}\b!?/gui)) {
        playRandomSound([tetra], laughsVol, 'laughs')
        return randomLink([myEmote('30%', 'Acyr-comemorando.gif'), tenorEmo('30%', 'YAuoFbHA7SAAAAAd/tetra-futebol'), tenorEmo('32px', '1J-n2oBWMa8AAAAi/peepo-brazil'), tenorEmo('30%', '53mmUaqb1b0AAAAC/copa-torcedor'), anySiteEmo('30%', 'https://thumbs.gfycat.com/SolidEasygoingAlaskajingle-size_restricted.gif'), anySiteEmo('30%', 'https://pa1.narvii.com/7243/fe3792bdc48b91754f8678c7fc78f11502e804e9r1-480-270_hq.gif')]) + message
    }//Musica da vitória
    if (message.match(/senna/gui)) {
        playRandomSound([senna], miscVol, 'misc')
        return randomLink([myEmote('30%', 'Acyr-comemorando.gif'), tenorEmo('32px', '1J-n2oBWMa8AAAAi/peepo-brazil')])
    }//Alexandra Botez 'vamos!' em espanhol
    if (message.match(/\bbamos\b!/gui)) {
        playRandomSound([bamos], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Rafael Leite 'Dá mate logo...'
    if (message.match(/(da ?mate ?logo)/gui)) {
        playRandomSound([damatelogo], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'Aí é flórida!'
    if (message.match(/(a[ií])? ?é fl[oó]rida/gui)) {
        playRandomSound([florida], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'Boa tarde[...] menos pra você que joga londres
    if (message.match(/londres!/gui)) {
        playRandomSound([londres], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Nakamura Oh c'mon!
    if (message.match(/oh ?c'?mon/gui)) {
        playRandomSound([ohcmon], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'eu to pior já'
    if (message.match(/(eu ?)?to ?pior( ?j[aá])?/gui)) {
        playRandomSound([topior, topior2], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'Muito bom, nota zero'
    if (message.match(/nota ?zero/gui)) {
        playRandomSound([notazero], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//RafPig 'Eu vou processar o Krikor'
    if (message.match(/(eu )?[voôu]{2,3} ?processar ?[oa]?/gui)) {
        playRandomSound([vouprocessarokrikor], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor, Grikor, Grigor, Pringles
    if (message.match(/([KG]ri[kg]or?[A-z]{0,}|Pringles)/gui)) {
        return randomLink([myPers('30%', 'Krikor.png'), myPers('30%', 'Krikor2.png'), myPers('30%', 'Krikor3.png'), myPers('30%', 'Krikor4.png'), myEmote('30%', 'Krikor5.png')]) + message
    }//RafPig 'tchau daminha!'
    if (message.match(/tchau ?daminha/gui)) {
        playRandomSound([tchaudaminha], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//emote modCheck (para o caso do canal assistido não ter)
    if (message.match(/(modCheck)/gui)) {
        //não tem som planejado para este emote
        return bttvEmo('5d7eefb7c0652668c9e4d394', 'modCheck') + message
    }//Krikor 'Até que eu tô melhor..'
    if (message.match(/to ?melhor( ?j[aá])?/gui)) {
        playRandomSound([tomelhor], miscVol, 'misc')
        return bttvEmoV2('2116179', 'krikNotBad') + message
    }//Krikor 'Roubei nessa partida'
    if (message.match(/roubei ?nessa ?(partida)?/gui)) {
        playRandomSound([roubeinessapartida], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'O cara ta roubando', 'Claramente roubando', 'Cheating'
    if (message.match(/(o ?cara ?)?t[aá] ?ro(u)?bando|claramente ?roubando|cheating/gui)) {
        playRandomSound([ocarataroubando, claramenteroubando, engine], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Na rússia isso dá cadeia
    if (message.match(/(isso)? ?n[ao] russia [A-zÀ-ú ,.]{0,} cadeia/gui)) {
        playRandomSound([batidasnaporta], miscVol, 'misc')
        return myEmote('30%', 'narussia.gif') + message
    }//Krikor sobre defesa francesa e Caro-Kann 'Não magoar as pessoas', 'jogar francesa', 'jogar Caro-Kann'
    if (message.match(/n[aã]o ?magoar( as)? ?pessoas|jogar? [kc]aro[ -]?[kc]ann?|jogar? francesa/gui)) {
        playRandomSound([naomagoarpessoas], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'Caraca G4'
    if (message.match(/caraca ?g4/gui)) {
        caracag4.play();
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'G4 grobiano', 'Grobiano raiz'
    if (message.match(/grobiano ?raiz|g4 ?grobiano/gui)) {
        playRandomSound([grobianoraiz], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'Lance!'
    if (message.match(/lance!/gui)) {
        playRandomSound([jogamaisrapido, acelerameufilho, queroquecefacalance, andameufilho], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'premove aloprado'
    if (message.match(/premove ?aloprado/gui)) {
        playRandomSound([quepremovealoprado], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'seis mil lances'
    if (message.match(/(seis|[0-9]{1,})( ?k?| ?mil)? ?lances?/gui)) {
        playRandomSound([seisklances], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Krikor 'pindura meu Deus', 'pindura desgraça', 'pindura maldito'
    if (message.match(/p[ei]ndura[A-z]{0,}/gui)) {
        playRandomSound([pinduramds, pinduradesgraca, pinduramaldito], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }//Musica triste: 'Sadness and Sorrow', 'final triste', 'perdemo'
    if (message.match(/((sadness)( ){0,}and( ){0,}sorrow|(final)( ){0,}triste|perdemo!?)/gui)) {
        playRandomSound([sadnessandsorrow], miscVol, 'misc')
        return '<a class="funny-sound">'+audioSymbol+'</a> ' + message
    }

}
addObserverIfDesiredNodeAvailable();

}else{
    console.log('PlayAudioOnTwitch \nestá desativado')
}
//end (if items.OnOff === true) condition
