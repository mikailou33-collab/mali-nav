// fix-message-precis-champ-manquant.js
// Ameliore le message d'erreur pour dire precisement quel champ
// manque (compagnie, depart, arrivee, date, nom, paiement, horaire,
// ou places), au lieu d'un message generique.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-message-precis-champ-manquant.js

const fs = require('fs');

const FICHIERS = [
  "district-bamako-v2.html",
  "region-segou.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-sikasso-v2.html",
  "region-tombouctou-v2.html",
  "region-koulikoro-v2.html",
  "region-bandiagara-v2.html",
  "region-dioila-v2.html",
  "region-kidal.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-douentza.html",
  "region-mopti.html",
  "region-san.html",
  "region-bougouni.html",
  "region-nara.html",
  "region-nioro.html",
  "region-kita.html",
  "region-taoudenit.html"
];

var ancien = [
  '  if(!mComp || !dep || !arr || dep===arr || !dateOk || !nomOk || !mPay || !mHeure || mSieges.length!==mPass){',
  '    showToast("⚠️ Completez tous les champs et choisissez vos places !");',
  '    return;',
  '  }'
].join('\n');

var nouveau = [
  '  if(!mComp){ showToast("⚠️ Choisissez une compagnie de transport"); return; }',
  '  if(!dep || !arr){ showToast("⚠️ Choisissez votre ville de depart et d\'arrivee"); return; }',
  '  if(dep===arr){ showToast("⚠️ Le depart et l\'arrivee ne peuvent pas etre identiques"); return; }',
  '  if(!dateOk){ showToast("⚠️ Choisissez votre date de voyage"); return; }',
  '  if(!mHeure){ showToast("⚠️ Choisissez votre horaire de depart"); return; }',
  '  if(mSieges.length!==mPass){ showToast("⚠️ Choisissez votre/vos place(s) dans le bus"); return; }',
  '  if(!nomOk){ showToast("⚠️ Renseignez votre nom complet"); return; }',
  '  if(!mPay){ showToast("⚠️ Choisissez votre mode de paiement"); return; }'
].join('\n');

var reussis = 0;
var echecs = [];
var manquants = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var idx = contenu.indexOf(ancien);
  if (idx === -1) {
    echecs.push(nomFichier);
    return;
  }
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier);
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
