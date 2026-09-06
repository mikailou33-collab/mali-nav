// fix-clic-compagnie-adresse.js
// Change le clic sur une compagnie : au lieu d'ouvrir directement la
// reservation, affiche un message indiquant que l'adresse sera
// bientot disponible (en attendant les vrais contrats).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-clic-compagnie-adresse.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = [
  'function choisirCompagnieDepuisAccueil(nom, btnId){',
  '  ouvrirReservation();',
  '  setTimeout(function(){ setComp(nom, btnId); }, 300);',
  '}'
].join('\n');

var nouveau = [
  'function choisirCompagnieDepuisAccueil(nom, btnId){',
  '  showToast("📍 Adresse et localisation de " + nom + " bientôt disponibles");',
  '}'
].join('\n');

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
console.log('SUCCES : clic sur compagnie affiche maintenant un message adresse.');
