// fix-bandeau-bamako-bouton-bus.js
// Reduit la hauteur du bandeau bleu "Bamako - Capitale du Mali" (dans
// l'onglet Lieux) et ajoute un bouton "Reserver un bus" avec une
// couleur differente, directement dans ce bandeau.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-bandeau-bamako-bouton-bus.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = [
  '      <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:14px 16px;color:white">',
  '        <div style="font-size:16px;font-weight:900;margin-bottom:4px">🏙️ Bamako — Capitale du Mali</div>',
  '        <div style="font-size:12px;color:rgba(255,255,255,0.8)">~3 millions hab. • 6 communes • Fleuve Niger</div>',
  '      </div>'
].join('\n');

var nouveau = [
  '      <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:9px 16px;color:white;display:flex;align-items:center;justify-content:space-between;gap:10px">',
  '        <div>',
  '          <div style="font-size:14px;font-weight:900;margin-bottom:2px">🏙️ Bamako — Capitale du Mali</div>',
  '          <div style="font-size:11px;color:rgba(255,255,255,0.8)">~3 millions hab. • 6 communes • Fleuve Niger</div>',
  '        </div>',
  '        <button onclick="document.querySelector(\'[onclick*=\\\'transport\\\']\').click()" style="background:linear-gradient(135deg,#14B53F,#0D8A2E);color:#fff;border:none;border-radius:20px;padding:8px 14px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;font-family:inherit;box-shadow:0 3px 10px rgba(20,181,63,.4);flex-shrink:0">🚌 Réserver bus</button>',
  '      </div>'
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
console.log('SUCCES : bandeau reduit avec bouton reserver bus ajoute.');
