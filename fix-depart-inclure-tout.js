// fix-depart-inclure-tout.js
// Ajoute les pays d'Afrique de l'Ouest (VAO) a la recherche de
// "Ville de depart" du comparateur, en plus des villes du Mali (VM) -
// deja fait pour la destination, maintenant coherent pour les deux.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-depart-inclure-tout.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '  var villesConnues = VM.map(function(v){return v.n;});\n  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1; });';
var nouveau = '  var villesConnues = VM.map(function(v){return v.n;}).concat(VAO.map(function(v){return v.n;}));\n  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1; });';

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
console.log('SUCCES : recherche depart inclut maintenant aussi Afrique de l Ouest.');
