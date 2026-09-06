// fix-nombre-sieges-variable-selon-horaire.js
// Corrige un vrai bug : la grille de sieges affichait toujours 44
// places fixes, peu importe l'horaire/compagnie choisi. Maintenant le
// nombre de sieges correspond aux vraies places de l'horaire choisi.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-nombre-sieges-variable-selon-horaire.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let ok = 0;
const total = 4;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter une variable globale pour le nombre total de places de l'horaire choisi
tenter('Variable placesHoraireChoisi ajoutee', function () {
  var ancien = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],mComp='',dernierRef='';";
  var nouveau = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],mComp='',dernierRef='',placesHoraireChoisi=44;";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Modifier selHeure pour retenir le nombre de places de l'horaire choisi
tenter('selHeure retient le nombre de places', function () {
  var ancien = [
    'function selHeure(h,id){',
    '  mHeure=h;'
  ].join('\n');
  var nouveau = [
    'function selHeure(h,id,nbPlaces){',
    '  mHeure=h;',
    '  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;',
    '  mSieges=[];'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Modifier genererPlan pour utiliser ce nombre variable au lieu de 44 fixe
tenter('genererPlan utilise le nombre variable', function () {
  var ancien = 'for(var s=1;s<=44;s++){';
  var nouveau = 'for(var s=1;s<=placesHoraireChoisi;s++){';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 4) afficherHorairesCompagnie transmet le nombre de places a selHeure
tenter('afficherHorairesCompagnie transmet le nombre de places', function () {
  var ancien = "return '<button class=\"m-hbtn\" id=\"h'+(i+1)+'\" onclick=\"selHeure(\\''+h[0]+'\\',\\'h'+(i+1)+'\\')\">'+h[0]+'<br><small>'+h[1]+' places</small></button>';";
  var nouveau = "return '<button class=\"m-hbtn\" id=\"h'+(i+1)+'\" onclick=\"selHeure(\\''+h[0]+'\\',\\'h'+(i+1)+'\\',\\''+h[1]+'\\')\">'+h[0]+'<br><small>'+h[1]+' places</small></button>';";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : nombre de sieges maintenant variable selon l horaire.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
