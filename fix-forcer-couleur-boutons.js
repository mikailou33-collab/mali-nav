// fix-forcer-couleur-boutons.js
// Force la couleur des boutons WhatsApp/SMS via style inline en plus de la
// classe CSS, pour eliminer tout risque de conflit d'affichage.
// Fonctionne sur tous les fichiers, meme ceux avec plusieurs occurrences
// (comme Tombouctou qui a 2 modales).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-forcer-couleur-boutons.js

const fs = require('fs');

const FICHIERS = [
  'district-bamako-v2.html',
  'region-bandiagara-v2.html',
  'region-bougouni.html',
  'region-dioila-v2.html',
  'region-douentza.html',
  'region-gao.html',
  'region-kayes-v2.html',
  'region-kidal.html',
  'region-kita.html',
  'region-koulikoro-v2.html',
  'region-koutiala.html',
  'region-menaka.html',
  'region-mopti.html',
  'region-nara.html',
  'region-nioro.html',
  'region-san.html',
  'region-segou.html',
  'region-sikasso-v2.html',
  'region-taoudenit.html',
  'region-tombouctou-v2.html'
];

var ancienWA = "document.getElementById('btn-wa').className=ok?'btn-confirm on':'btn-confirm off';";
var ancienSMS = "document.getElementById('btn-sms').className=ok?'btn-confirm on':'btn-confirm off';";

var nouveauWA = [
  'document.getElementById("btn-wa").className=ok?"btn-confirm on":"btn-confirm off";',
  'document.getElementById("btn-wa").style.background=ok?"linear-gradient(135deg,#14a34a,#16a34a)":"#f3f4f6";',
  'document.getElementById("btn-wa").style.color=ok?"white":"#9ca3af";'
].join('\n  ');

var nouveauSMS = [
  'document.getElementById("btn-sms").className=ok?"btn-confirm on":"btn-confirm off";',
  'document.getElementById("btn-sms").style.background=ok?"linear-gradient(135deg,#14a34a,#16a34a)":"#f3f4f6";',
  'document.getElementById("btn-sms").style.color=ok?"white":"#9ca3af";'
].join('\n  ');

function remplacerToutesOccurrences(texte, ancien, nouveau) {
  var resultat = '';
  var reste = texte;
  var compte = 0;
  var idx;
  while ((idx = reste.indexOf(ancien)) !== -1) {
    resultat += reste.slice(0, idx) + nouveau;
    reste = reste.slice(idx + ancien.length);
    compte++;
  }
  return { texte: resultat + reste, compte: compte };
}

let reussis = [];
let echecs = [];

FICHIERS.forEach(function (nomFichier) {
  if (!fs.existsSync(nomFichier)) {
    echecs.push(nomFichier + ' (introuvable)');
    return;
  }
  let contenu = fs.readFileSync(nomFichier, 'utf8');

  var r1 = remplacerToutesOccurrences(contenu, ancienWA, nouveauWA);
  var r2 = remplacerToutesOccurrences(r1.texte, ancienSMS, nouveauSMS);

  if (r1.compte === 0 || r2.compte === 0) {
    echecs.push(nomFichier + ' (anchors non trouves : WA=' + r1.compte + ' SMS=' + r2.compte + ')');
    return;
  }

  fs.writeFileSync(nomFichier, r2.texte, 'utf8');
  reussis.push(nomFichier + ' (WA x' + r1.compte + ', SMS x' + r2.compte + ')');
});

console.log('');
console.log('REUSSIS (' + reussis.length + '/' + FICHIERS.length + ') :');
reussis.forEach(function (f) { console.log('  OK - ' + f); });
if (echecs.length > 0) {
  console.log('');
  console.log('ECHECS :');
  echecs.forEach(function (f) { console.log('  X - ' + f); });
}
