// fix-nettoyage-vieux-code-mort.js
// Retire tout le vieux code mort (jamais plus appele) laisse par
// l'ancien systeme "compagnie d'abord" : filtrerCompagnies(),
// HORAIRES_PAR_COMPAGNIE (donnees d'exemple), afficherHorairesCompagnie(),
// selHeureReelle(), et setComp() - tout confirme mort avant retrait.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-nettoyage-vieux-code-mort.js

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

// ═══ BLOC 1 : filtrerCompagnies + HORAIRES_PAR_COMPAGNIE + afficherHorairesCompagnie + selHeureReelle ═══
var marqueurDebutBloc1 = 'function filtrerCompagnies(recherche){';
var marqueurFinBloc1 = 'var COMPAGNIES_COMPARATEUR = [';

// ═══ BLOC 2 : setComp complet ═══
var marqueurDebutBloc2 = 'function setComp(nom,btnId){';
var marqueurFinBloc2Contenu = [
  '  afficherHorairesCompagnie(nom);',
  '  genererPlan();',
  '  majModal();',
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
  var etapesOk = 0;

  // Retirer bloc 1
  var idxDebut1 = contenu.indexOf(marqueurDebutBloc1);
  var idxFin1 = contenu.indexOf(marqueurFinBloc1, idxDebut1);
  if (idxDebut1 !== -1 && idxFin1 !== -1) {
    contenu = contenu.slice(0, idxDebut1) + contenu.slice(idxFin1);
    etapesOk++;
  }

  // Retirer bloc 2 (setComp entier, y compris sa signature)
  var idxDebut2 = contenu.indexOf(marqueurDebutBloc2);
  if (idxDebut2 !== -1) {
    var idxFinContenu2 = contenu.indexOf(marqueurFinBloc2Contenu, idxDebut2);
    if (idxFinContenu2 !== -1) {
      var idxApresFin2 = idxFinContenu2 + marqueurFinBloc2Contenu.length;
      contenu = contenu.slice(0, idxDebut2) + contenu.slice(idxApresFin2);
      etapesOk++;
    }
  }

  if (etapesOk === 0) {
    echecs.push(nomFichier + ' (aucun bloc trouve)');
    return;
  }

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier + ' (' + etapesOk + '/2 blocs retires)');
  reussis++;
});

console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers nettoyes.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION : ' + echecs.join(', '));
}
