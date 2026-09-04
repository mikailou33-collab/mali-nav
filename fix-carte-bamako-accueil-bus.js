// fix-carte-bamako-accueil-bus.js
// Reduit la taille de la carte "District de Bamako" sur l'accueil
// general de Mali Nav, et remplace le badge "MaliTaxi disponible" par
// un vrai bouton cliquable "Reserver bus".
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-carte-bamako-accueil-bus.js

const fs = require('fs');
const NOM_FICHIER = 'index.html';

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

// 1) Reduire le padding de la carte
tenter('Taille de la carte reduite', function () {
  var ancien = '.bamako-card{background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;position:relative;overflow:hidden;border:2px solid #3b82f6}';
  var nouveau = '.bamako-card{background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:16px;padding:11px 16px;margin-bottom:12px;cursor:pointer;position:relative;overflow:hidden;border:2px solid #3b82f6}';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Remplacer le badge par un vrai bouton Reserver bus
tenter('Badge remplace par bouton Reserver bus', function () {
  var ancien = [
    '  <div class="bamako-card" onclick="ouvrirRegion(\'district-bamako-v2.html\')">',
    '    <div class="bamako-deco"></div>',
    '    <div style="font-size:32px;margin-bottom:6px">🏙️</div>',
    '    <div class="bamako-title">District de Bamako</div>',
    '    <div class="bamako-sub">Capitale du Mali • 6 Communes • ~3 millions hab.</div>',
    '    <div class="bamako-badge">🚖 MaliTaxi disponible</div>',
    '    <div class="bamako-arrow">→</div>',
    '  </div>'
  ].join('\n');
  var nouveau = [
    '  <div class="bamako-card" onclick="ouvrirRegion(\'district-bamako-v2.html\')" style="display:flex;align-items:center;gap:12px">',
    '    <div class="bamako-deco"></div>',
    '    <div style="font-size:26px;flex-shrink:0">🏙️</div>',
    '    <div style="flex:1;min-width:0">',
    '      <div class="bamako-title" style="font-size:15px;margin-bottom:1px">District de Bamako</div>',
    '      <div class="bamako-sub" style="font-size:11px">Capitale du Mali • 6 Communes</div>',
    '    </div>',
    '    <button onclick="event.stopPropagation();ouvrirRegion(\'district-bamako-v2.html\')" style="background:linear-gradient(135deg,#14B53F,#0D8A2E);color:#fff;border:none;border-radius:18px;padding:7px 12px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;font-family:inherit;flex-shrink:0">🚌 Bus</button>',
    '  </div>'
  ].join('\n');
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
