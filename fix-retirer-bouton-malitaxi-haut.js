// fix-retirer-bouton-malitaxi-haut.js
// Retire le bouton "MaliTaxi VIP" redondant en haut de la page
// d'accueil Mali Nav - garde seulement celui de la barre de
// navigation en bas.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-bouton-malitaxi-haut.js

const fs = require('fs');
const NOM_FICHIER = 'index.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = [
  '    <button class="malitaxi-btn" onclick="ouvrirMaliTaxi()">',
  '      <span class="malitaxi-btn-icon">🚖</span>',
  '      <div><div class="malitaxi-btn-text">MaliTaxi</div><div style="font-size:9px;color:#78350f;font-weight:600">VIP</div></div>',
  '    </button>'
].join('\n');

var idx = contenu.indexOf(ancien);

if (idx === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.slice(0, idx) + contenu.slice(idx + ancien.length);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : bouton MaliTaxi du haut retire, celui du bas reste.');
