// fix-bouton-separe-apres-bamako.js
// Remet la carte "District de Bamako" a sa forme compacte simple
// (sans bouton colle dedans), et ajoute un vrai bouton "Reserver bus"
// independant, juste apres, sur sa propre ligne.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-bouton-separe-apres-bamako.js

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

var nouveau = [
  '  <div class="bamako-card" onclick="ouvrirRegion(\'district-bamako-v2.html\')" style="display:flex;align-items:center;gap:12px">',
  '    <div class="bamako-deco"></div>',
  '    <div style="font-size:26px;flex-shrink:0">🏙️</div>',
  '    <div style="flex:1;min-width:0">',
  '      <div class="bamako-title" style="font-size:15px;margin-bottom:1px">District de Bamako</div>',
  '      <div class="bamako-sub" style="font-size:11px">Capitale du Mali • 6 Communes</div>',
  '    </div>',
  '  </div>',
  '  <button onclick="document.querySelector(\'.bamako-card\').click()" style="width:100%;background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126);color:#fff;border:none;border-radius:14px;padding:12px;margin-bottom:12px;font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(20,181,63,.4);text-shadow:0 1px 2px rgba(0,0,0,.4)">🚌 Réserver un bus</button>'
].join('\n');

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
console.log('SUCCES : bouton independant ajoute apres la carte Bamako.');
