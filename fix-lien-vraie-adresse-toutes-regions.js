// fix-lien-vraie-adresse-toutes-regions.js
// Corrige TOUS les fichiers Mali Nav d'un coup : remplace l'ancienne
// adresse figee (GitHub Pages, jamais mise a jour) par la vraie
// adresse live (malitaxi.web.app).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-lien-vraie-adresse-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "district-bamako-v2.html",
  "index.html",
  "region-bougouni.html",
  "region-douentza.html",
  "region-gao.html",
  "region-kidal.html",
  "region-kita.html",
  "region-koulikoro-v2.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-mopti.html",
  "region-nioro.html",
  "region-san.html",
  "region-segou.html",
  "region-sikasso-v2.html",
  "region-taoudenit.html",
  "region-tombouctou-v2.html"
];

var ancien = 'https://mikailou33-collab.github.io/malitaxi-vip/malitaxi-vip-final-37.html';
var nouveau = 'https://malitaxi.web.app';

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

  if (contenu.indexOf(ancien) === -1) {
    echecs.push(nomFichier);
    return;
  }
  // Remplace TOUTES les occurrences dans ce fichier (au cas ou plusieurs boutons)
  contenu = contenu.split(ancien).join(nouveau);

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
