// fix-construire-bouton-reserver-kayes.js
// Construit le bouton "Reserver un Billet Bus" manquant pour Kayes,
// avec le meme modele que les autres regions, deja colore aux
// couleurs du Mali.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-construire-bouton-reserver-kayes.js

const fs = require('fs');
const NOM_FICHIER = 'region-kayes-v2.html';

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

// 1) Ajouter le vrai bouton dans le panel Transport (qui etait vide)
tenter('Bouton Reserver ajoute pour Kayes', function () {
  var ancien = [
    '  <!-- TRANSPORT -->',
    '  <div class="panel" id="panel-transport">',
    '    <div class="scroll-area">',
    '      <div style="height:10px"></div>',
    '    </div>'
  ].join('\n');
  var nouveau = [
    '  <!-- TRANSPORT -->',
    '  <div class="panel" id="panel-transport">',
    '    <div class="scroll-area">',
    '      <div class="section-header">🎫 Réserver un Billet Bus</div>',
    '      <div class="lieu-item lieu-item-reserve" onclick="ouvrirReservation()">',
    '        <div class="lieu-icon" style="background:rgba(255,255,255,.25)">🎫</div>',
    '        <div class="lieu-info"><div class="lieu-name">Réserver Bus — Kayes</div><div class="lieu-sub">Toutes destinations Mali + Sénégal</div></div>',
    '        <div class="lieu-dist" style="color:#fff">→</div>',
    '      </div>',
    '      <div style="height:10px"></div>',
    '    </div>'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter le style CSS necessaire (couleurs du Mali)
tenter('Style CSS ajoute', function () {
  var idxStyleFin = contenu.indexOf('</style>');
  if (idxStyleFin === -1) return false;
  var styleCSS = '.lieu-item-reserve{background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126)!important}.lieu-item-reserve .lieu-icon{background:rgba(255,255,255,.25)!important}.lieu-item-reserve .lieu-name{color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.4)!important}.lieu-item-reserve .lieu-sub{color:rgba(255,255,255,.85)!important}.lieu-item-reserve .lieu-dist{color:#fff!important}';
  contenu = contenu.slice(0, idxStyleFin) + styleCSS + contenu.slice(idxStyleFin);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : bouton Reserver construit pour Kayes.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
