// fix-reserver-billet-partout-mali.js
// Retire le mot "bus" des deux boutons flottants restants (carte et
// bandeau bleu), remplace par "Reserver un billet partout au Mali",
// en gardant l'icone visuelle 🚌.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-reserver-billet-partout-mali.js

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

// 1) Bouton flottant sur la carte
tenter('Bouton flottant carte renomme', function () {
  var ancien = '>🚌 Réserver un bus</button>';
  var nouveau = '>🚌 Réserver un billet partout au Mali</button>';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Bouton dans le bandeau bleu
tenter('Bouton bandeau bleu renomme', function () {
  var ancien = '>🚌 Réserver bus</button>';
  var nouveau = '>🚌 Réserver billet</button>';
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
