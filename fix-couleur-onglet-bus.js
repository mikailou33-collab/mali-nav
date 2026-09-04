// fix-couleur-onglet-bus.js
// Ajoute une couleur verte distincte a l'onglet "Bus", pour qu'il
// ressorte bien visuellement meme quand il n'est pas selectionne.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-couleur-onglet-bus.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let ok = 0;
const total = 2;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter le style CSS pour l'onglet bus
tenter('Style CSS ajoute', function () {
  var ancien = '.tab.active{color:var(--accent);border-bottom-color:var(--accent)}';
  var nouveau = ancien + '.tab-bus{color:#14B53F!important;font-weight:800!important}.tab-bus.active{color:#14B53F!important;border-bottom-color:#14B53F!important}';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Appliquer la classe au bouton Bus
tenter('Classe appliquee au bouton', function () {
  var ancien = '<button class="tab" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';
  var nouveau = '<button class="tab tab-bus" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : onglet Bus maintenant colore en vert.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
