// fix-bouton-bus-toutes-regions.js
// Ajoute le bouton "Reserver un bus" bien visible sur la carte, pour
// les 19 autres regions Mali Nav - cible juste apres leaflet-map,
// peu importe la structure exacte qui suit (differente de Bamako).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-bouton-bus-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "region-bandiagara-v2.html",
  "region-bougouni.html",
  "region-dioila-v2.html",
  "region-douentza.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-kidal.html",
  "region-kita.html",
  "region-koulikoro-v2.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-mopti.html",
  "region-nara.html",
  "region-nioro.html",
  "region-san.html",
  "region-segou.html",
  "region-sikasso-v2.html",
  "region-taoudenit.html",
  "region-tombouctou-v2.html"
];

var boutonBus = '<button onclick="document.querySelector(\'[onclick*=\\\'transport\\\']\').click()" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#14B53F,#0D8A2E);color:#fff;border:none;border-radius:30px;padding:14px 26px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(20,181,63,.5);display:flex;align-items:center;gap:8px;font-family:inherit;z-index:500">🚌 Réserver un bus</button>';

var ancien = '<div id="leaflet-map" style="width:100%;height:100%;min-height:400px;"></div>';
var nouveau = ancien + '\n      ' + boutonBus;

var reussis = 0;
var echecs = [];
var manquants = [];
var dejaFait = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  if (contenu.indexOf('Réserver un bus') !== -1) {
    dejaFait.push(nomFichier);
    return;
  }

  var idx = contenu.indexOf(ancien);
  if (idx === -1) {
    echecs.push(nomFichier);
    return;
  }
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier);
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers corriges.');
if (dejaFait.length > 0) {
  console.log('Deja fait avant : ' + dejaFait.join(', '));
}
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
