// fix-rafraichir-grille-apres-horaire.js
// Corrige le vrai bug restant : selHeure() mettait bien a jour le
// nombre de places, mais ne redessinait jamais la grille visible -
// il fallait attendre une autre action (comme changer le nombre de
// passagers) pour que ca se rafraichisse. On appelle genererPlan()
// directement.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-rafraichir-grille-apres-horaire.js

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
  'function selHeure(h,id,nbPlaces){',
  '  mHeure=h;',
  '  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;',
  '  mSieges=[];'
].join('\n');

var nouveau = [
  'function selHeure(h,id,nbPlaces){',
  '  mHeure=h;',
  '  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;',
  '  mSieges=[];',
  '  genererPlan();'
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
console.log('SUCCES : grille se rafraichit maintenant vraiment apres avoir choisi un horaire.');
