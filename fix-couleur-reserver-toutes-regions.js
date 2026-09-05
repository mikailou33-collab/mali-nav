// fix-couleur-reserver-toutes-regions.js
// Colore le bouton "Reserver" avec le degrade vert-jaune-rouge sur
// les 19 autres regions, en utilisant une vraie classe CSS pour aussi
// forcer le texte en blanc (nom, sous-titre, fleche), peu importe le
// texte exact de chaque region.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-couleur-reserver-toutes-regions.js

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

var ancienDiv = '<div class="lieu-item" onclick="ouvrirReservation()">';
var nouveauDiv = '<div class="lieu-item lieu-item-reserve" onclick="ouvrirReservation()">';

var styleCSS = '.lieu-item-reserve{background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126)!important}.lieu-item-reserve .lieu-icon{background:rgba(255,255,255,.25)!important}.lieu-item-reserve .lieu-name{color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.4)!important}.lieu-item-reserve .lieu-sub{color:rgba(255,255,255,.85)!important}.lieu-item-reserve .lieu-dist{color:#fff!important}';

var reussis = 0;
var echecs = [];
var manquants = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var idxDiv = contenu.indexOf(ancienDiv);
  var idxStyleFin = contenu.indexOf('</style>');
  if (idxDiv === -1 || idxStyleFin === -1) {
    echecs.push(nomFichier);
    return;
  }

  contenu = contenu.replace(ancienDiv, nouveauDiv);
  contenu = contenu.slice(0, idxStyleFin) + styleCSS + contenu.slice(idxStyleFin);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier);
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
