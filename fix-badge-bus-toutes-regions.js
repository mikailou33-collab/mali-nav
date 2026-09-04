// fix-badge-bus-toutes-regions.js
// Applique le badge vert "Bus" sur les 19 autres regions Mali Nav
// d'un coup, comme deja fait pour Bamako.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-badge-bus-toutes-regions.js

const fs = require('fs');

const FICHIERS = [
  "region-bandiagara-v2.html",
  "region-bougouni.html",
  "region-dioila-v2.html",
  "region-douentza.html",
  "region-gao.html",
  "region-kayes-v2.html",
  "region-kidal.html",
  "region-kita.html",
  "region-koulikoro-v2.html",
  "region-koutiala.html",
  "region-menaka.html",
  "region-mopti.html",
  "region-nara.html",
  "region-nioro.html",
  "region-san.html",
  "region-segou.html",
  "region-sikasso-v2.html",
  "region-taoudenit.html",
  "region-tombouctou-v2.html"
];

var ancienStyle = '.tab.active{color:var(--accent);border-bottom-color:var(--accent)}';
var nouveauStyle = ancienStyle + '.tab-bus{color:#fff!important;font-weight:900!important;background:#14B53F!important;border-radius:10px!important;margin:4px 3px!important;padding:8px 4px!important}.tab-bus.active{color:#fff!important;background:#0D8A2E!important;border-bottom-color:transparent!important}';

var ancienBouton = '🚌 Bus</button>';
var chercherClasseTab = 'class="tab" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';
var remplacerClasseTab = 'class="tab tab-bus" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';

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

  var idxStyle = contenu.indexOf(ancienStyle);
  var idxBouton = contenu.indexOf(chercherClasseTab);

  if (idxStyle === -1 || idxBouton === -1) {
    echecs.push(nomFichier);
    return;
  }

  contenu = contenu.replace(ancienStyle, nouveauStyle);
  contenu = contenu.replace(chercherClasseTab, remplacerClasseTab);

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
