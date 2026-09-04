// fix-retirer-gares-tarifs-inventes.js
// Retire les sections "Gares Routieres" (Gare Sogoniko) et "Tarifs
// indicatifs" (Bamako-Segou/Mopti/Sikasso/Kayes) - infos generiques
// inventees, en attendant de vrais contrats avec les compagnies.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-gares-tarifs-inventes.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var debut = '      <div class="section-header">🚌 Gares Routières</div>';
var idxDebut = contenu.indexOf(debut);

if (idxDebut === -1) {
  console.error('ATTENTION : point de depart non trouve. Rien n a ete modifie.');
  process.exit(1);
}

var marqueurFin = '      <div style="height:10px"></div>';
var idxFin = contenu.indexOf(marqueurFin, idxDebut);

if (idxFin === -1) {
  console.error('ATTENTION : point de fin non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.slice(0, idxDebut) + contenu.slice(idxFin);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : sections gares et tarifs inventes retirees.');
