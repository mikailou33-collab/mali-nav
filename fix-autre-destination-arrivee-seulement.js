// fix-autre-destination-arrivee-seulement.js
// Retire l'option "Autre destination" de la liste de DEPART (necessite une
// vraie gare), la garde uniquement pour la liste d'ARRIVEE.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-autre-destination-arrivee-seulement.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = '    sel.innerHTML=\'<option value="">-- Choisir --</option><optgroup label="🇲🇱 Mali">\'+optsM+optAutre+\'</optgroup><optgroup label="🌍 Afrique Ouest">\'+optsAO+\'</optgroup>\';';
var nouveau = '    var optAutreFinal=(id==="m-arrivee")?optAutre:"";\n    sel.innerHTML=\'<option value="">-- Choisir --</option><optgroup label="🇲🇱 Mali">\'+optsM+optAutreFinal+\'</optgroup><optgroup label="🌍 Afrique Ouest">\'+optsAO+\'</optgroup>\';';

if (contenu.indexOf(ancien) === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.replace(ancien, nouveau);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : "Autre destination" disponible seulement pour l arrivee.');
