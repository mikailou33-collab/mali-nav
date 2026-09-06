// fix-affichage-plein-bus-toutes-regions.js
// Corrige l'affichage des sieges : au lieu de limiter le nombre de
// boutons affiches selon les places disponibles, on affiche toujours
// le bus complet (44 places), en marquant automatiquement "occupe"
// les sieges au-dela du nombre reellement disponible pour cet
// horaire - comme un vrai plan de bus physique.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-affichage-plein-bus-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "district-bamako-v2.html",
  "region-segou.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-sikasso-v2.html",
  "region-tombouctou-v2.html",
  "region-koulikoro-v2.html",
  "region-bandiagara-v2.html",
  "region-dioila-v2.html",
  "region-kidal.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-douentza.html",
  "region-mopti.html",
  "region-san.html",
  "region-bougouni.html",
  "region-nara.html",
  "region-nioro.html",
  "region-kita.html",
  "region-taoudenit.html"
];

var ancienBoucle = 'for(var s=1;s<=placesHoraireChoisi;s++){';
var nouvelleBoucle = 'for(var s=1;s<=44;s++){';

var ancienOcc = 'var isOcc=occ.indexOf(s)>=0;';
var nouvelOcc = 'var isOcc=occ.indexOf(s)>=0 || s>placesHoraireChoisi;';

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

  var idxBoucle = contenu.indexOf(ancienBoucle);
  var idxOcc = contenu.indexOf(ancienOcc);

  if (idxBoucle === -1 || idxOcc === -1) {
    echecs.push(nomFichier);
    return;
  }

  contenu = contenu.split(ancienBoucle).join(nouvelleBoucle);
  contenu = contenu.split(ancienOcc).join(nouvelOcc);

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
