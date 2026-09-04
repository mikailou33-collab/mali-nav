// fix-badge-bus-3-regions-restantes.js
// Complete les 3 dernieres regions (Kayes, Koulikoro, Tombouctou) qui
// ont chacune une couleur d'accent differente pour .tab.active.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-badge-bus-3-regions-restantes.js

const fs = require('fs');

const FICHIERS_COULEURS = {
  "region-kayes-v2.html": ".tab.active{color:#1d4ed8;border-bottom-color:#1d4ed8}",
  "region-koulikoro-v2.html": ".tab.active{color:#7c3aed;border-bottom-color:#7c3aed}",
  "region-tombouctou-v2.html": ".tab.active{color:#d97706;border-bottom-color:#d97706}"
};

var styleAjoute = '.tab-bus{color:#fff!important;font-weight:900!important;background:#14B53F!important;border-radius:10px!important;margin:4px 3px!important;padding:8px 4px!important}.tab-bus.active{color:#fff!important;background:#0D8A2E!important;border-bottom-color:transparent!important}';

var chercherClasseTab = 'class="tab" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';
var remplacerClasseTab = 'class="tab tab-bus" onclick="switchTab(\'transport\',this)">🚌 Bus</button>';

var reussis = 0;
var echecs = [];
var manquants = [];

Object.keys(FICHIERS_COULEURS).forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var ancienStyle = FICHIERS_COULEURS[nomFichier];
  var idxStyle = contenu.indexOf(ancienStyle);
  var idxBouton = contenu.indexOf(chercherClasseTab);

  if (idxStyle === -1 || idxBouton === -1) {
    echecs.push(nomFichier);
    return;
  }

  contenu = contenu.replace(ancienStyle, ancienStyle + styleAjoute);
  contenu = contenu.replace(chercherClasseTab, remplacerClasseTab);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier);
  reussis++;
});

console.log('');
console.log(reussis + '/3 fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
