// fix-augmenter-limite-client-65.js
// Augmente la valeur par defaut de 44 a 65 places cote client, sur
// les 20 regions - pour correspondre a de vrais autocars interurbains
// (49-60 places standard), coherent avec le correctif deja fait sur
// le tableau de bord.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-augmenter-limite-client-65.js

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

var reussis = 0;
var echecsPartiels = [];
var manquants = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
  var etapesOk = 0;

  // 1) Valeur par defaut de placesHoraireChoisi
  if (contenu.indexOf(",placesHoraireChoisi=44;") !== -1) {
    contenu = contenu.split(",placesHoraireChoisi=44;").join(",placesHoraireChoisi=65;");
    etapesOk++;
  }

  // 2) Boucle de generation de la grille
  if (contenu.indexOf("for(var s=1;s<=44;s++){") !== -1) {
    contenu = contenu.split("for(var s=1;s<=44;s++){").join("for(var s=1;s<=65;s++){");
    etapesOk++;
  }

  // 3) Valeur de secours dans selHeure
  if (contenu.indexOf("parseInt(nbPlaces,10)||44;") !== -1) {
    contenu = contenu.split("parseInt(nbPlaces,10)||44;").join("parseInt(nbPlaces,10)||65;");
    etapesOk++;
  }

  if (etapesOk === 0) {
    echecsPartiels.push(nomFichier + ' (aucune correspondance)');
    return;
  }

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier + ' (' + etapesOk + '/3 corrections)');
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecsPartiels.length > 0) {
  console.log('ATTENTION : ' + echecsPartiels.join(', '));
}
