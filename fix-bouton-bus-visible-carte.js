// fix-bouton-bus-visible-carte.js
// Ajoute un gros bouton flottant "Reserver un bus" bien visible
// directement sur l'ecran de la carte (premier ecran a l'ouverture),
// pour que les clients trouvent facilement la reservation de bus
// sans devoir chercher dans les onglets.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-bouton-bus-visible-carte.js

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
  '  <div class="panel active" id="panel-carte">',
  '    <div class="map-wrap">',
  '      <div id="leaflet-map" style="width:100%;height:100%;min-height:400px;"></div>',
  '      <div style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);border-radius:10px;padding:6px 10px;font-size:9px;font-weight:800;color:#444">🏙️ Capitale du Mali</div>',
  '    </div>',
  '  </div>'
].join('\n');

var nouveau = [
  '  <div class="panel active" id="panel-carte">',
  '    <div class="map-wrap">',
  '      <div id="leaflet-map" style="width:100%;height:100%;min-height:400px;"></div>',
  '      <div style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);border-radius:10px;padding:6px 10px;font-size:9px;font-weight:800;color:#444">🏙️ Capitale du Mali</div>',
  '      <button onclick="document.querySelector(\'[onclick*=\\\'transport\\\']\').click()" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#14B53F,#0D8A2E);color:#fff;border:none;border-radius:30px;padding:14px 26px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(20,181,63,.5);display:flex;align-items:center;gap:8px;font-family:inherit;z-index:500">🚌 Réserver un bus</button>',
  '    </div>',
  '  </div>'
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
console.log('SUCCES : bouton Reserver un bus ajoute directement sur la carte.');
