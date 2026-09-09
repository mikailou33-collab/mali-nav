// fix-retirer-doublons-etape2.js
// CORRECTIF CRITIQUE : sur les 19 regions (pas Bamako), le vieux
// contenu (Ville de depart/arrivee, dates, horaire) est reste EN
// DOUBLE a l'interieur du bloc etape-2, avec des identifiants HTML
// dupliques (m-date, m-retour-box, m-heure-choisie) - casse la
// structure et cree un affichage visuel casse. On nettoie pour ne
// garder qu'une seule structure propre.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-doublons-etape2.js

const fs = require('fs');

const FICHIERS = [
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

var marqueurDebut = '<div id="etape-2-apres-compagnie" style="display:none">';
var marqueurFin = 'id="lbl-sieges"';

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

  var idxDebut = contenu.indexOf(marqueurDebut);
  if (idxDebut === -1) {
    echecs.push(nomFichier + ' (debut non trouve)');
    return;
  }
  var idxApresDebut = idxDebut + marqueurDebut.length;

  var idxFin = contenu.indexOf(marqueurFin, idxApresDebut);
  if (idxFin === -1) {
    echecs.push(nomFichier + ' (fin non trouve)');
    return;
  }

  // Reculer jusqu'au vrai debut de la balise <label ... id="lbl-sieges"
  var idxDebutLabel = contenu.lastIndexOf('<label', idxFin);
  if (idxDebutLabel === -1) {
    echecs.push(nomFichier + ' (label non trouve)');
    return;
  }

  var contenuPropre = '\n<div id="m-heure-choisie" style="display:none;text-align:center;font-size:12px;font-weight:700;color:#1d4ed8;margin-top:8px">✅ Départ: <span id="m-heure-val"></span></div>\n      </div>\n      ';

  contenu = contenu.slice(0, idxApresDebut) + contenuPropre + contenu.slice(idxDebutLabel);

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
  console.log('ATTENTION : ' + echecs.join(', '));
}
