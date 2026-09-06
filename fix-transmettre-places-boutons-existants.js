// fix-transmettre-places-boutons-existants.js
// CORRECTIF CRITIQUE : les 5 boutons d'horaires deja presents dans le
// HTML (h1 a h5) appelaient selHeure() avec seulement 2 arguments,
// sans transmettre le nombre de places - du coup placesHoraireChoisi
// restait a 0, et TOUS les sieges apparaissaient occupes. On ajoute
// le vrai nombre de places (deja visible dans le texte du bouton) a
// chaque appel.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-transmettre-places-boutons-existants.js

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

// Chaque region peut avoir des horaires/places differents, donc on
// utilise une expression reguliere qui trouve chaque bouton h1-h5 et
// lit le nombre de places directement depuis son propre texte visible,
// pour ajouter ce meme nombre comme 3eme argument de selHeure().
var regexBouton = /onclick="selHeure\('([^']+)','(h[1-5])'\)">([^<]+)<br><small>(\d+) places<\/small>/g;

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

  var trouve = false;
  var nouveauContenu = contenu.replace(regexBouton, function(match, heure, id, texteHeure, nbPlaces){
    trouve = true;
    return 'onclick="selHeure(\'' + heure + '\',\'' + id + '\',\'' + nbPlaces + '\')">' + texteHeure + '<br><small>' + nbPlaces + ' places</small>';
  });

  if (!trouve) {
    echecs.push(nomFichier);
    return;
  }

  contenu = nouveauContenu;

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
