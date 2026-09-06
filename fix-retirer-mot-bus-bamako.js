// fix-retirer-mot-bus-bamako.js
// Retire le mot ecrit "Bus" partout ou c'est juste une etiquette
// generique (garde l'icone visuelle 🚌), sans toucher aux vrais noms
// de compagnies (Diarra Bus) ni au code (sauvegarderReservationBus).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-mot-bus-bamako.js

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
const total = 3;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Onglet : Bus -> Billet
tenter('Onglet renomme', function () {
  var ancien = '<button class="tab tab-bus" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';
  var nouveau = '<button class="tab tab-bus" onclick="switchTab(\'transport\',this)">🚌 Billet</button>';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Titre de section
tenter('Titre de section renomme', function () {
  var ancien = '<div class="section-header">🎫 Réserver un Billet Bus</div>';
  var nouveau = '<div class="section-header">🚌 Réserver un Billet</div>';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Titre de la fenetre modale
tenter('Titre modale renomme', function () {
  var ancien = '<div class="modal-title">🎫 Réserver Bus — Bamako</div>';
  var nouveau = '<div class="modal-title">🚌 Réserver — Bamako</div>';
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
  console.log('SUCCES : fichier sauvegarde.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
