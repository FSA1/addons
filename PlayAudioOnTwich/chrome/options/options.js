function save_options() {
  var misc = document.getElementById('misc').checked;
  var pringles = document.getElementById('pringles').checked;
  var laughs = document.getElementById('laughs').checked;
  var greetings = document.getElementById('greetings').checked;
  var lvolume = document.getElementById('lvolume').valueAsNumber;
  var gvolume = document.getElementById('gvolume').valueAsNumber;
  var mvolume = document.getElementById('mvolume').valueAsNumber;

  chrome.storage.local.set({
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
    rSound.volume = vol;
    rSound.play();
  }
}
var playLaughs = document.getElementById('laughs1'),
  playGreet = document.getElementById('greet1'),
  playMisc = document.getElementById('misc1')

document.getElementById('lvolume').addEventListener('click', function () {
  //laughs1.volume = lvolume.valueAsNumber;
  if (laughs1.paused === true) {
    playRandomSound([laughs1.src, kekw.src], lvolume.valueAsNumber)
    //laughs1.play();
  }
}, false);

document.getElementById('gvolume').addEventListener('click', function () {
  greet1.volume = gvolume.valueAsNumber;
  if (greet1.paused === true) {
    greet1.play();
  }
}, false);

document.getElementById('mvolume').addEventListener('click', function () {
  //misc1.volume = mvolume.valueAsNumber;
  if (misc1.paused === true) {
    playRandomSound([misc1.src, misc2.src], lvolume.valueAsNumber)
    //misc1.play();
  }
}, false);
