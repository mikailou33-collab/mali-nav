// fix-ajouter-espace-partenaires.js
// Ajoute un espace reserve sous le bouton de reservation, pret a
// accueillir plus tard les coordonnees des vraies compagnies de bus
// partenaires.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-ajouter-espace-partenaires.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '  <button onclick="ouvrirReservation()" style="background:#fff;color:#14532d;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:inherit">🎫 Choisir compagnie + destination</button>\n</div>';

var nouveau = '  <button onclick="ouvrirReservation()" style="background:#fff;color:#14532d;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:inherit">🎫 Choisir compagnie + destination</button>\n  <div id="espace-partenaires-bus" style="margin-top:28px;color:rgba(255,255,255,.85);font-size:12px;text-shadow:0 1px 2px rgba(0,0,0,.3)">🤝 Compagnies partenaires bientôt disponibles ici</div>\n</div>';

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
console.log('SUCCES : espace partenaires ajoute sous le bouton.');
