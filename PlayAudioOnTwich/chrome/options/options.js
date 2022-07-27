function save_options() {
  var onoff = document.getElementById('onoff').checked;
  var misc = document.getElementById('misc').checked;
  var pringles = document.getElementById('pringles').checked;
  var laughs = document.getElementById('laughs').checked;
  var greetings = document.getElementById('greetings').checked;
  var lvolume = document.getElementById('lvolume').valueAsNumber;
  var gvolume = document.getElementById('gvolume').valueAsNumber;
  var mvolume = document.getElementById('mvolume').valueAsNumber;

  chrome.storage.local.set({
    //extension on/off
    OnOff:onoff,
    //audio types
    Miscellaneous: misc,
    Pringles: pringles,
    Laughs: laughs,
    Greetings: greetings,
    //volume level
    laughsVol: lvolume,
    greetVol: gvolume,
    miscVol: mvolume
  }, function () {
  });
}

function restore_options() {
  // Default values
  chrome.storage.local.get({
    //extension on/off
    OnOff: true,
    //audio types
    Miscellaneous: true,
    Pringles: true,
    Laughs: true,
    Greetings: true,
    //volume level
    laughsVol: 0.4,
    greetVol: 1.0,
    miscVol: 1.0,
    retroActive: false
  }, function (items) {
    document.getElementById('onoff').checked = items.OnOff;
    document.getElementById('misc').checked = items.Miscellaneous;
    document.getElementById('pringles').checked = items.Pringles;
    document.getElementById('laughs').checked = items.Laughs;
    document.getElementById('greetings').checked = items.Greetings;
    document.getElementById('lvolume').valueAsNumber = items.laughsVol;
    document.getElementById('gvolume').valueAsNumber = items.greetVol;
    document.getElementById('mvolume').valueAsNumber = items.miscVol;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('onoff').addEventListener('change', save_options);
document.getElementById('misc').addEventListener('change', save_options);
document.getElementById('pringles').addEventListener('change', save_options);
document.getElementById('laughs').addEventListener('change', save_options);
document.getElementById('greetings').addEventListener('change', save_options);
document.getElementById('lvolume').addEventListener('change', save_options);
document.getElementById('gvolume').addEventListener('change', save_options);
document.getElementById('mvolume').addEventListener('change', save_options);

//preview audio
var rSound = new Audio('');
var laughs1 = new Audio('audio_samples/laughs.mp3');
var kekw = new Audio('audio_samples/kekw.mp3');
var greet1 = new Audio('audio_samples/bom-dia.mp3');
var misc1 = new Audio('audio_samples/senna.mp3');
var misc2 = new Audio('audio_samples/profession.mp3');

function playRandomSound(links, vol) {
  //This line will select a random sound to play out of your provided URLS
  rSound.src = links[Math.floor(Math.random() * links.length)];

  if (rSound.paused === true) {
    const baseURL = 'chrome-extension://alnbggbcekhiaclchgpmiehhjlgfkknf/options/audio_samples/'
    rSound.volume = vol;

    if (rSound.src === baseURL+'profession.mp3') {
      document.getElementById('miscImg').src = "https://github.com/FSA1/addons/raw/main/PlayAudioOnTwich/emotes/profession.png";
    }
    if (rSound.src === baseURL+'senna.mp3') {
      document.getElementById('miscImg').src = "https://github.com/FSA1/addons/raw/main/PlayAudioOnTwich/emotes/peepo-brazil.gif";
    }
    if(rSound.volume<=0.3){
      document.getElementById('laughsImg').src = "https://cdn.betterttv.net/emote/5f8969df40eb9502e2223310/1x";
      document.getElementById('laughsImg').srcset = "https://cdn.betterttv.net/emote/5f8969df40eb9502e2223310/2x 2x, https://cdn.betterttv.net/emote/5f8969df40eb9502e2223310/3x 4x";
    }else{
      document.getElementById('laughsImg').src = "https://cdn.betterttv.net/emote/62b2898c65092c1291b963e1/1x";
      document.getElementById('laughsImg').srcset = "https://cdn.betterttv.net/emote/62b2898c65092c1291b963e1/2x 2x, https://cdn.betterttv.net/emote/62b2898c65092c1291b963e1/3x 4x";
    }
    rSound.play();
  }
}
var playLaughs = document.getElementById('laughs1'),
  playGreet = document.getElementById('greet1'),
  playMisc = document.getElementById('misc1')

document.getElementById('lvolume').addEventListener('click', function () {
  if (laughs1.paused === true) {
    document.getElementById('llab').innerHTML = 'Volume de Risadas: '+ lvolume.valueAsNumber;
    playRandomSound([laughs1.src, kekw.src], lvolume.valueAsNumber)
  }
}, false);

document.getElementById('gvolume').addEventListener('click', function () {
  greet1.volume = gvolume.valueAsNumber;
  if (greet1.paused === true) {
    document.getElementById('glab').innerHTML = 'Volume de Saudações: '+ gvolume.valueAsNumber;
    greet1.play();
  }
}, false);

document.getElementById('mvolume').addEventListener('click', function () {
  if (misc1.paused === true) {
    document.getElementById('mlab').innerHTML = 'Volume de Diversos: '+ mvolume.valueAsNumber;
    playRandomSound([misc1.src, misc2.src], mvolume.valueAsNumber)
  }
}, false);

document.getElementById('onoff').addEventListener('click', function () {
    var status = ''
    if(onoff.checked==true){
      status='Ativada'
    }else{      
      status='Desativada'
    }
    document.getElementById('onn').innerHTML = 'Extensão '+ status;
}, false);