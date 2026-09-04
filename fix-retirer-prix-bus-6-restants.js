// fix-retirer-prix-bus-6-restants.js
// Corrige les 6 derniers fichiers qui utilisent un titre legerement
// different ("Bus depuis Bamako" au lieu de "Prix Bus depuis Bamako").
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-prix-bus-6-restants.js

const fs = require('fs');

const FICHIERS = [
  "region-kayes-v2.html",
  "region-kidal.html",
  "region-koulikoro-v2.html",
  "region-koulikoro.html",
  "region-menaka.html",
  "region-taoudenit.html"
];

var marqueurDebut = '<div class="section-header">🚌 Bus depuis Bamako</div>';
var marqueurFin = '<div style="height:10px"></div>';

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

  var idxDebut = contenu.indexOf(marqueurDebut);
  if (idxDebut === -1) {
    echecs.push(nomFichier);
    return;
  }
  var idxFin = contenu.indexOf(marqueurFin, idxDebut);
  if (idxFin === -1) {
    echecs.push(nomFichier);
    return;
  }

  contenu = contenu.slice(0, idxDebut) + contenu.slice(idxFin);

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
