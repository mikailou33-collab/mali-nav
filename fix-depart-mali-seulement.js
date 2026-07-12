// fix-depart-mali-seulement.js
// Retire les pays voisins (Afrique Ouest) de la liste de DEPART, garde
// uniquement les villes du Mali. Les pays voisins restent disponibles
// pour l'ARRIVEE uniquement.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-depart-mali-seulement.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = "    var optAutreFinal=(id===\"m-arrivee\")?optAutre:\"\";\n    sel.innerHTML='<option value=\"\">-- Choisir --</option><optgroup label=\"🇲🇱 Mali\">'+optsM+optAutreFinal+'</optgroup><optgroup label=\"🌍 Afrique Ouest\">'+optsAO+'</optgroup>';";
var nouveau = "    var optAutreFinal=(id===\"m-arrivee\")?optAutre:\"\";\n    var optgroupAO=(id===\"m-arrivee\")?('<optgroup label=\"🌍 Afrique Ouest\">'+optsAO+'</optgroup>'):'';\n    sel.innerHTML='<option value=\"\">-- Choisir --</option><optgroup label=\"🇲🇱 Mali\">'+optsM+optAutreFinal+'</optgroup>'+optgroupAO;";

if (contenu.indexOf(ancien) === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.replace(ancien, nouveau);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : pays voisins retires du depart, gardes pour l arrivee uniquement.');
