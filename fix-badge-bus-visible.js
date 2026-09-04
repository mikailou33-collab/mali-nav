// fix-badge-bus-visible.js
// Transforme l'onglet "Bus" en un vrai badge avec fond vert, plus
// visible qu'un simple texte colore.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-badge-bus-visible.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '.tab-bus{color:#14B53F!important;font-weight:800!important}.tab-bus.active{color:#14B53F!important;border-bottom-color:#14B53F!important}';
var nouveau = '.tab-bus{color:#fff!important;font-weight:900!important;background:#14B53F!important;border-radius:10px!important;margin:4px 3px!important;padding:8px 4px!important}.tab-bus.active{color:#fff!important;background:#0D8A2E!important;border-bottom-color:transparent!important}';

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
console.log('SUCCES : onglet Bus transforme en vrai badge vert visible.');
