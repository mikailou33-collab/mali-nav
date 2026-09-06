// fix-retirer-mot-bus-toutes-regions.js
// Retire le mot ecrit "Bus" sur les 19 autres regions (garde l'icone
// 🚌), sans toucher aux vrais noms de compagnies ni au code.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-mot-bus-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "region-bandiagara-v2.html",
  "region-bougouni.html",
  "region-dioila-v2.html",
  "region-douentza.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-kidal.html",
  "region-kita.html",
  "region-koulikoro-v2.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-mopti.html",
  "region-nara.html",
  "region-nioro.html",
  "region-san.html",
  "region-segou.html",
  "region-sikasso-v2.html",
  "region-taoudenit.html",
  "region-tombouctou-v2.html"
];

var reussis = 0;
var echecsPartiels = [];
var manquants = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
  var etapesOk = 0;

  // 1) Onglet
  if (contenu.indexOf('>🚌 Bus</button>') !== -1) {
    contenu = contenu.split('>🚌 Bus</button>').join('>🚌 Billet</button>');
    etapesOk++;
  }

  // 2) Bouton flottant sur la carte
  if (contenu.indexOf('>🚌 Réserver un bus</button>') !== -1) {
    contenu = contenu.split('>🚌 Réserver un bus</button>').join('>🚌 Réserver un billet partout au Mali</button>');
    etapesOk++;
  }

  // 3) Titre de section
  if (contenu.indexOf('<div class="section-header">🎫 Réserver un Billet Bus</div>') !== -1) {
    contenu = contenu.split('<div class="section-header">🎫 Réserver un Billet Bus</div>').join('<div class="section-header">🚌 Réserver un Billet</div>');
    etapesOk++;
  }

  // 4) Titre modale (prefixe avec emoji, garde le nom de ville qui suit)
  if (contenu.indexOf('🎫 Réserver Bus — ') !== -1) {
    contenu = contenu.split('🎫 Réserver Bus — ').join('🚌 Réserver — ');
    etapesOk++;
  }

  // 5) Nom dans le bouton lieu-item (sans emoji, garde le nom de ville qui suit)
  if (contenu.indexOf('<div class="lieu-name">Réserver Bus — ') !== -1) {
    contenu = contenu.split('<div class="lieu-name">Réserver Bus — ').join('<div class="lieu-name">Réserver — ');
    etapesOk++;
  }

  if (etapesOk === 0) {
    echecsPartiels.push(nomFichier + ' (aucune correspondance)');
    return;
  }

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier + ' (' + etapesOk + '/4 textes trouves)');
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecsPartiels.length > 0) {
  console.log('ATTENTION : ' + echecsPartiels.join(', '));
}
