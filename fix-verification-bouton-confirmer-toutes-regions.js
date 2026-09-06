// fix-verification-bouton-confirmer-toutes-regions.js
// CORRECTIF CRITIQUE : le bouton vert "Confirmer ma commande" ne
// verifiait jamais si le formulaire etait rempli (nom, telephone,
// paiement, horaire, places choisies) avant de passer a l'etape
// suivante. Ajoute la vraie verification directement dans ce bouton.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-verification-bouton-confirmer-toutes-regions.js

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
  'function validerReservation(){',
  '  var btnConf = document.getElementById("btn-confirmer-resa");',
  '  var boutons = document.getElementById("boutons-envoi-resa");',
  '  if(btnConf) btnConf.style.display = "none";',
  '  if(boutons) boutons.style.display = "grid";',
  '  showToast("✅ Commande confirmee — choisissez comment recevoir votre billet");',
  '}'
].join('\n');

var nouveau = [
  'function validerReservation(){',
  '  var dep=(document.getElementById("m-depart")?document.getElementById("m-depart").value:"")||"";',
  '  var arr=(document.getElementById("m-arrivee")?document.getElementById("m-arrivee").value:"")||"";',
  '  dep=dep.split("|")[0];arr=arr.split("|")[0];',
  '  var nomOk=document.getElementById("m-nom")&&document.getElementById("m-nom").value.trim();',
  '  var dateOk=document.getElementById("m-date")&&document.getElementById("m-date").value;',
  '  if(!mComp || !dep || !arr || dep===arr || !dateOk || !nomOk || !mPay || !mHeure || mSieges.length!==mPass){',
  '    showToast("⚠️ Completez tous les champs et choisissez vos places !");',
  '    return;',
  '  }',
  '  var btnConf = document.getElementById("btn-confirmer-resa");',
  '  var boutons = document.getElementById("boutons-envoi-resa");',
  '  if(btnConf) btnConf.style.display = "none";',
  '  if(boutons) boutons.style.display = "grid";',
  '  showToast("✅ Commande confirmee — choisissez comment recevoir votre billet");',
  '}'
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
