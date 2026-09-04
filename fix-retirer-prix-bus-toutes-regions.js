// fix-retirer-prix-bus-toutes-regions.js
// Retire la section "Prix Bus depuis Bamako" (tarifs generiques
// inventes) sur toutes les regions, en attendant de vrais contrats
// avec les compagnies de bus (nom + coordonnees GPS reelles).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-prix-bus-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "region-bandiagara-v2.html",
  "region-bandiagara.html",
  "region-bougouni.html",
  "region-dioila-v2.html",
  "region-dioila.html",
  "region-douentza.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-kidal.html",
  "region-kita.html",
  "region-koulikoro-v2.html",
  "region-koulikoro.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-mopti.html",
  "region-nara.html",
  "region-nioro.html",
  "region-san.html",
  "region-segou.html",
  "region-sikasso-v2.html",
  "region-sikasso.html",
  "region-taoudenit.html",
  "region-tombouctou-v2.html",
  "region-tombouctou.html"
];

var marqueurDebut = '<div class="section-header">🚌 Prix Bus depuis Bamako</div>';
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
