// fix-parcours-deux-etapes-compagnie.js
// Restructure le parcours en deux etapes : d'abord type de billet +
// compagnie seulement, puis le reste (destination, horaires propres
// a la compagnie, places, paiement) apparait une fois la compagnie
// choisie.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-parcours-deux-etapes-compagnie.js

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

// 1) Envelopper tout ce qui vient apres la grille de compagnies dans un bloc cache par defaut
tenter('Bloc etape 2 (masque par defaut) cree', function () {
  var ancien = '<div id="comp-choisie" style="display:none;text-align:center;font-size:12px;font-weight:700;color:#14a34a;margin-top:6px;padding:7px;background:#f0fdf4;border-radius:8px;border:1px solid #86efac">✅ Compagnie: <span id="comp-val"></span></div>';
  var nouveau = '<div id="comp-choisie" style="display:none;text-align:center;font-size:12px;font-weight:700;color:#14a34a;margin-top:6px;padding:7px;background:#f0fdf4;border-radius:8px;border:1px solid #86efac">✅ Compagnie: <span id="comp-val"></span></div>\n      <div id="etape-2-apres-compagnie" style="display:none">';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Fermer ce bloc juste avant le bouton "Confirmer ma commande" (qui reste toujours visible)
tenter('Fermeture du bloc etape 2 ajoutee', function () {
  var ancien = '      <button id="btn-confirmer-resa" onclick="validerReservation()"';
  var nouveau = '      </div>\n      <button id="btn-confirmer-resa" onclick="validerReservation()"';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Ajouter les horaires specifiques par compagnie + fonction de chargement
tenter('Donnees horaires par compagnie ajoutees', function () {
  var ancre = 'function setComp(nom,btnId){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var HORAIRES_PAR_COMPAGNIE = {',
    '  "SONEF": [["06h00",10],["12h00",6],["18h00",14]],',
    '  "Rimbo Transport": [["05h30",12],["09h00",8],["14h00",15],["17h30",6],["20h00",10]],',
    '  "Bani Transport": [["07h00",9],["15h00",11]],',
    '  "Bittar Transport": [["08h00",7],["16h00",13]],',
    '  "Diarra Bus": [["06h30",8],["11h30",5],["19h00",12]],',
    '  "Autre compagnie": [["08h00",10],["16h00",10]]',
    '};',
    'function afficherHorairesCompagnie(nomCompagnie){',
    '  var horaires = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
    '  var conteneur = document.querySelector("#etape-2-apres-compagnie [style*=\'grid-template-columns:1fr 1fr 1fr\']");',
    '  if(!conteneur) return;',
    '  conteneur.innerHTML = horaires.map(function(h, i){',
    '    return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
    '  }).join("");',
    '}',
    'function setComp(nom,btnId){'
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

// 4) Modifier setComp pour reveler l'etape 2 et charger les horaires de cette compagnie
tenter('setComp modifie pour reveler etape 2', function () {
  var ancien = [
    'function setComp(nom,btnId){',
    '  mComp=nom;',
    '  [\'cp-sonef\',\'cp-rimbo\',\'cp-bani\',\'cp-bittar\',\'cp-diarra\',\'cp-autre\'].forEach(function(x){var b=document.getElementById(x);if(b)b.className=\'comp-btn\';});',
    '  var sel=document.getElementById(btnId);if(sel)sel.className=\'comp-btn sel\';',
    '  var cd=document.getElementById(\'comp-choisie\');if(cd)cd.style.display=\'block\';',
    '  var cv=document.getElementById(\'comp-val\');if(cv)cv.textContent=nom;',
    '  majModal();',
    '}'
  ].join('\n');
  var nouveau = [
    'function setComp(nom,btnId){',
    '  mComp=nom;',
    '  [\'cp-sonef\',\'cp-rimbo\',\'cp-bani\',\'cp-bittar\',\'cp-diarra\',\'cp-autre\'].forEach(function(x){var b=document.getElementById(x);if(b)b.className=\'comp-btn\';});',
    '  var sel=document.getElementById(btnId);if(sel)sel.className=\'comp-btn sel\';',
    '  var cd=document.getElementById(\'comp-choisie\');if(cd)cd.style.display=\'block\';',
    '  var cv=document.getElementById(\'comp-val\');if(cv)cv.textContent=nom;',
    '  var etape2=document.getElementById(\'etape-2-apres-compagnie\');if(etape2)etape2.style.display=\'block\';',
    '  mHeure=\'\';',
    '  var mhc=document.getElementById(\'m-heure-choisie\');if(mhc)mhc.style.display=\'none\';',
    '  afficherHorairesCompagnie(nom);',
    '  majModal();',
    '}'
  ].join('\n');
  var idx = contenu.indexOf(ancien);
  if (idx === -1) return false;
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : parcours en deux etapes construit.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
