// fix-langues-info-mali.js
// Remplace la ligne unique "Langue: Français + Bambara" par deux lignes
// distinctes : langues nationales du Mali, et langue de travail (francais).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-langues-info-mali.js

const fs = require('fs');
const NOM_FICHIER = 'index.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let contenu = fs.readFileSync(NOM_FICHIER, 'utf8');

var ancien = '<div style="display:flex;justify-content:space-between;padding:7px 10px;background:#1e293b;border-radius:8px"><span style="color:#94a3b8;font-size:12px">🗣️ Langue</span><span style="color:white;font-size:12px;font-weight:800">Français + Bambara</span></div>';

var nouveau = '<div style="display:flex;justify-content:space-between;padding:7px 10px;background:#1e293b;border-radius:8px;margin-bottom:6px"><span style="color:#94a3b8;font-size:12px">🗣️ Langues nationales</span><span style="color:white;font-size:12px;font-weight:800;text-align:right;max-width:180px">Bambara, Peul, Soninké, Songhaï, Tamasheq...</span></div><div style="display:flex;justify-content:space-between;padding:7px 10px;background:#1e293b;border-radius:8px"><span style="color:#94a3b8;font-size:12px">📋 Langue de travail</span><span style="color:white;font-size:12px;font-weight:800">Français</span></div>';

if (contenu.indexOf(ancien) === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.replace(ancien, nouveau);
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : langues nationales + langue de travail affichees separement.');
