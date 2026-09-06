// fix-reset-grille-changement-compagnie.js
// Corrige : quand on change de compagnie sans re-choisir un nouvel
// horaire, la grille gardait les anciens chiffres de la compagnie
// precedente. Maintenant, changer de compagnie reinitialise vraiment
// la grille (vide, en attente d'un nouvel horaire).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-reset-grille-changement-compagnie.js

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
  '  var etape2=document.getElementById(\'etape-2-apres-compagnie\');if(etape2)etape2.style.display=\'block\';',
  '  mHeure=\'\';',
  '  var mhc=document.getElementById(\'m-heure-choisie\');if(mhc)mhc.style.display=\'none\';',
  '  afficherHorairesCompagnie(nom);',
  '  majModal();'
].join('\n');

var nouveau = [
  '  var etape2=document.getElementById(\'etape-2-apres-compagnie\');if(etape2)etape2.style.display=\'block\';',
  '  mHeure=\'\';',
  '  mSieges=[];',
  '  placesHoraireChoisi=0;',
  '  var mhc=document.getElementById(\'m-heure-choisie\');if(mhc)mhc.style.display=\'none\';',
  '  var si2=document.getElementById(\'siege-info\');if(si2)si2.style.display=\'none\';',
  '  afficherHorairesCompagnie(nom);',
  '  genererPlan();',
  '  majModal();'
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
console.log('SUCCES : changer de compagnie reinitialise vraiment la grille.');
