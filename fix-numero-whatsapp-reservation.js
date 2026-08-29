// fix-numero-whatsapp-reservation.js
// Corrige un vrai probleme d'usage : confirmerWA() (envoi de la
// reservation de billet) ouvrait WhatsApp SANS preciser de numero,
// obligeant le client a choisir lui-meme un contact au hasard. Ajoute
// le vrai numero officiel MaliTaxi.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-numero-whatsapp-reservation.js district-bamako-v2.html

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

var ancien = '  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");\n  fermerModal();showToast("✅ Reservation envoyee !");';
var nouveau = '  window.open("https://wa.me/22382826508?text="+encodeURIComponent(msg),"_blank");\n  fermerModal();showToast("✅ Reservation envoyee !");';

if (contenu.indexOf(ancien) === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.replace(ancien, nouveau);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : numero WhatsApp officiel ajoute pour ' + NOM_FICHIER);
