// fix-annuler-numero-whatsapp.js
// Annule la correction precedente : le client doit pouvoir choisir
// librement son contact WhatsApp pour recevoir son billet (la
// reservation est deja sauvegardee dans Firebase de toute facon).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-annuler-numero-whatsapp.js district-bamako-v2.html

const fs = require('fs');
const NOM_FICHIER = process.argv[2];

if (!NOM_FICHIER) {
  console.error('Precisez le nom du fichier.');
  process.exit(1);
}
if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '  window.open("https://wa.me/22382826508?text="+encodeURIComponent(msg),"_blank");\n  fermerModal();showToast("✅ Reservation envoyee !");';
var nouveau = '  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");\n  fermerModal();showToast("✅ Reservation envoyee !");';

if (contenu.indexOf(ancien) === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.replace(ancien, nouveau);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : client peut de nouveau choisir son contact - ' + NOM_FICHIER);
