// fix-zindex-modal-reservation.js
// CORRECTIF CRITIQUE : la fenetre de reservation (modal-resa) avait
// un z-index de 500, plus bas que notre nouvelle page blanche
// (z-index 2000) - la fenetre s'ouvrait bien mais restait invisible,
// cachee derriere. On augmente son z-index pour qu'elle passe devant.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-zindex-modal-reservation.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:500;align-items:flex-end;justify-content:center}';
var nouveau = '.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:3000;align-items:flex-end;justify-content:center}';

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
console.log('SUCCES : modal de reservation passe maintenant bien devant.');
