// fix-getprix-utilise-vrai-prix.js
// Modifie getPrix() pour utiliser le VRAI prix choisi via le
// comparateur (window.prixHoraireChoisi) au lieu de toujours calculer
// un prix automatique par distance - la compagnie a deja fixe son
// vrai prix, on doit le respecter.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-getprix-utilise-vrai-prix.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = "function getPrix(d,a){var dist=DIST[a]||DIST[d]||300;var base=Math.round(dist*13/10)*10*mPass;return base*(mBillet==='retour'?2:1);}";
var nouveau = "function getPrix(d,a){if(window.prixHoraireChoisi){return window.prixHoraireChoisi*mPass*(mBillet==='retour'?2:1);}var dist=DIST[a]||DIST[d]||300;var base=Math.round(dist*13/10)*10*mPass;return base*(mBillet==='retour'?2:1);}";

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
console.log('SUCCES : getPrix utilise maintenant le vrai prix de la compagnie quand disponible.');
