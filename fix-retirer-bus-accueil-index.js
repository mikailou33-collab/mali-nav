// fix-retirer-bus-accueil-index.js
// Retire le mot "bus" du bouton independant sous la carte Bamako, sur
// l'accueil general de Mali Nav (index.html).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-bus-accueil-index.js

const fs = require('fs');
const NOM_FICHIER = 'index.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '🚌 Réserver un bus</button>';
var nouveau = '🚌 Réserver un billet partout au Mali</button>';

var idx = contenu.indexOf(ancien);

if (idx === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : bouton accueil corrige.');
