// fix-cacher-controles-carte.js
// Corrige le vrai bug : les boutons +/- de la carte (Leaflet) ont un
// z-index tres eleve par defaut, plus haut que notre page simplifiee,
// donc ils apparaissaient quand meme par-dessus. On augmente notre
// propre z-index pour bien passer devant.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-cacher-controles-carte.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '<div id="page-directe-reservation" style="display:none;position:fixed;inset:0;background:#fff;z-index:600;flex-direction:column;align-items:center;padding:20px;text-align:center">';
var nouveau = '<div id="page-directe-reservation" style="display:none;position:fixed;inset:0;background:#fff;z-index:2000;flex-direction:column;align-items:center;padding:20px;text-align:center">';

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
console.log('SUCCES : z-index corrige, controles carte ne devraient plus apparaitre.');
