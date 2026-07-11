// fix-supprimer-frais-recu.js
// Supprime completement la ligne "Frais service" du texte du billet
// (elle reste comprise dans le TOTAL, juste plus affichee separement).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-supprimer-frais-recu.js

const fs = require('fs');

const FICHIERS = [
  'district-bamako-v2.html',
  'region-bandiagara-v2.html',
  'region-bougouni.html',
  'region-dioila-v2.html',
  'region-douentza.html',
  'region-gao.html',
  'region-kayes-v2.html',
  'region-kidal.html',
  'region-kita.html',
  'region-koulikoro-v2.html',
  'region-koutiala.html',
  'region-menaka.html',
  'region-mopti.html',
  'region-nara.html',
  'region-nioro.html',
  'region-san.html',
  'region-segou.html',
  'region-sikasso-v2.html',
  'region-taoudenit.html'
];

var ancienTexte = '\\u{1F4B0} Frais service: "+frais+" FCFA (non remboursable)\\n';
var ancienTexteAlt = String.fromCharCode(0xD83D, 0xDCB0) + ' Frais service: "+frais+" FCFA (non remboursable)\\n';

let reussis = [];
let echecs = [];

FICHIERS.forEach(function (nomFichier) {
  if (!fs.existsSync(nomFichier)) {
    echecs.push(nomFichier + ' (introuvable)');
    return;
  }
  let contenu = fs.readFileSync(nomFichier, 'utf8');

  // Cherche la portion exacte du texte a retirer (entre "Billet:" et "TOTAL:")
  var debutMarqueur = '"+prix.toLocaleString()+" FCFA\\n';
  var idxDebut = contenu.indexOf(debutMarqueur);
  if (idxDebut === -1) {
    echecs.push(nomFichier + ' (marqueur debut non trouve)');
    return;
  }
  var pointDepart = idxDebut + debutMarqueur.length;
  var finMarqueur = ' FCFA (non remboursable)\\n';
  var idxFin = contenu.indexOf(finMarqueur, pointDepart);
  if (idxFin === -1 || idxFin - pointDepart > 200) {
    echecs.push(nomFichier + ' (marqueur fin non trouve ou trop loin)');
    return;
  }
  var pointFin = idxFin + finMarqueur.length;

  var portionRetiree = contenu.slice(pointDepart, pointFin);
  if (portionRetiree.indexOf('Frais service') === -1) {
    echecs.push(nomFichier + ' (contenu inattendu, rien retire par securite)');
    return;
  }

  contenu = contenu.slice(0, pointDepart) + contenu.slice(pointFin);
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  reussis.push(nomFichier);
});

console.log('');
console.log('REUSSIS (' + reussis.length + '/' + FICHIERS.length + ') :');
reussis.forEach(function (f) { console.log('  OK - ' + f); });
if (echecs.length > 0) {
  console.log('');
  console.log('ECHECS :');
  echecs.forEach(function (f) { console.log('  X - ' + f); });
}
