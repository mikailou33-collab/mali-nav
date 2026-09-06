// fix-barre-recherche-compagnie.js
// Ajoute une barre de recherche pour filtrer les compagnies de bus
// en temps reel, utile quand il y aura beaucoup de vrais partenaires.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-barre-recherche-compagnie.js

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

// 1) Ajouter le champ de recherche + wrapper avec id sur la grille
tenter('Barre de recherche ajoutee', function () {
  var ancien = '      <label class="m-label">🚌 Compagnie de transport</label>\n      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  var nouveau = '      <label class="m-label">🚌 Compagnie de transport</label>\n      <input type="text" id="recherche-compagnie" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagnies(this.value)" style="margin-bottom:8px">\n      <div id="grille-compagnies" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter la fonction JS de filtrage
tenter('Fonction filtrerCompagnies ajoutee', function () {
  var ancre = 'function setComp(nom,btnId){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'function filtrerCompagnies(recherche){',
    '  var termeMinuscule = recherche.trim().toLowerCase();',
    '  var boutons = document.querySelectorAll(\'#grille-compagnies .comp-btn\');',
    '  boutons.forEach(function(btn){',
    '    var nomComp = btn.querySelector(\'.comp-name\').textContent.toLowerCase();',
    '    var infoComp = btn.querySelector(\'.comp-info\').textContent.toLowerCase();',
    '    var correspond = nomComp.indexOf(termeMinuscule) !== -1 || infoComp.indexOf(termeMinuscule) !== -1;',
    '    btn.style.display = correspond ? \'flex\' : \'none\';',
    '  });',
    '}',
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : barre de recherche ajoutee et fonctionnelle.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
