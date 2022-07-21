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