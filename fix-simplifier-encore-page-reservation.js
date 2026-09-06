// fix-simplifier-encore-page-reservation.js
// Simplifie encore la page : juste le bouton colore en haut, tout le
// reste blanc vierge en dessous (pour les futurs partenaires).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-simplifier-encore-page-reservation.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var debut = '<div id="page-directe-reservation" style="display:none;position:fixed;inset:0;background:linear-gradient(180deg,#14B53F,#FCD116 50%,#CE1126);z-index:600;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">';
var idxDebut = contenu.indexOf(debut);

if (idxDebut === -1) {
  console.error('ATTENTION : point de depart non trouve. Rien n a ete modifie.');
  process.exit(1);
}

var marqueurFin = '<div class="topbar">';
var idxFin = contenu.indexOf(marqueurFin, idxDebut);

if (idxFin === -1) {
  console.error('ATTENTION : point de fin non trouve. Rien n a ete modifie.');
  process.exit(1);
}

var nouveauBloc = [
  '<div id="page-directe-reservation" style="display:none;position:fixed;inset:0;background:#fff;z-index:600;flex-direction:column;align-items:center;padding:20px;text-align:center">',
  '  <button onclick="window.location.href=\'index.html\'" style="position:absolute;top:16px;left:16px;background:#f3f4f6;border:none;border-radius:50%;width:40px;height:40px;color:#333;font-size:18px;cursor:pointer">←</button>',
  '  <div style="height:50px"></div>',
  '  <button onclick="ouvrirReservation()" style="background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126);color:#fff;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);font-family:inherit;text-shadow:0 1px 2px rgba(0,0,0,.3)">🎫 Choisir compagnie + destination</button>',
  '</div>',
  ''
].join('\n');

contenu = contenu.slice(0, idxDebut) + nouveauBloc + contenu.slice(idxFin);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : page encore simplifiee, bouton colore en haut, reste blanc.');
