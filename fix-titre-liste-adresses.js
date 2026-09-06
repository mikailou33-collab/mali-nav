// fix-titre-liste-adresses.js
// Ajoute un vrai titre au-dessus de la liste des compagnies sur la
// page blanche, pour bien clarifier que c'est pour voir leurs
// coordonnees/adresses, pas pour selectionner un voyage (different
// du bouton "Choisir compagnie + destination" au-dessus).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-titre-liste-adresses.js

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
  '  <div style="width:100%;max-width:380px;margin-top:24px">',
  '    <input type="text" id="recherche-compagnie-accueil" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagniesAccueil(this.value)" style="margin-bottom:10px">'
].join('\n');

var nouveau = [
  '  <div style="width:100%;max-width:380px;margin-top:24px">',
  '    <div style="font-size:13px;font-weight:800;color:#333;margin-bottom:10px">📍 Adresses et coordonnées des compagnies</div>',
  '    <input type="text" id="recherche-compagnie-accueil" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagniesAccueil(this.value)" style="margin-bottom:10px">'
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
console.log('SUCCES : titre clarificateur ajoute au-dessus de la liste.');
