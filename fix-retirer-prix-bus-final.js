// fix-retirer-prix-bus-final.js
// Corrige les 2 tout derniers fichiers, chacun avec son propre titre
// unique de section a retirer.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-prix-bus-final.js

const fs = require('fs');

const FICHIERS_TITRES = {
  "region-menaka.html": '<div class="section-header">🚗 Trajets (piste)</div>',
  "region-taoudenit.html": '<div class="section-header">🚗 Trajets estimés (piste 4x4)</div>'
};

var marqueurFin = '<div style="height:10px"></div>';

var reussis = 0;
var echecs = [];
var manquants = [];

Object.keys(FICHIERS_TITRES).forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var marqueurDebut = FICHIERS_TITRES[nomFichier];
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
console.log(reussis + '/2 fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
