// fix-couleur-bouton-reserver-depart.js
// Colore le bouton "Reserver - Depart Bamako" avec le meme degrade
// vert-jaune-rouge que le bouton "Bus" sur MaliTaxi VIP.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-couleur-bouton-reserver-depart.js

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
  '      <div class="lieu-item" onclick="ouvrirReservation()">',
  '        <div class="lieu-icon" style="background:#eff6ff">🎫</div>',
  '        <div class="lieu-info"><div class="lieu-name">Réserver — Départ Bamako</div><div class="lieu-sub">Choisir compagnie + destination</div></div>',
  '        <div class="lieu-dist" style="color:var(--accent)">→</div>',
  '      </div>'
].join('\n');

var nouveau = [
  '      <div class="lieu-item" onclick="ouvrirReservation()" style="background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126)">',
  '        <div class="lieu-icon" style="background:rgba(255,255,255,.25)">🎫</div>',
  '        <div class="lieu-info"><div class="lieu-name" style="color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4)">Réserver — Départ Bamako</div><div class="lieu-sub" style="color:rgba(255,255,255,.85)">Choisir compagnie + destination</div></div>',
  '        <div class="lieu-dist" style="color:#fff">→</div>',
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
console.log('SUCCES : bouton Reserver Depart colore comme Bus.');
