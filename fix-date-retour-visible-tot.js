// fix-date-retour-visible-tot.js
// CORRECTIF : la "Date de retour" (pour Aller-Retour) etait cachee a
// l'interieur du bloc qui ne s'affiche qu'apres avoir choisi un
// resultat du comparateur - donc elle n'apparaissait jamais au bon
// moment. On la sort pour qu'elle apparaisse des le clic sur
// "Aller-Retour", juste apres la date de voyage.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-date-retour-visible-tot.js

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
const total = 2;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Retirer le bloc m-retour-box de sa position actuelle (dans etape-2)
tenter('Bloc date retour retire de son ancienne position', function () {
  var ancien = [
    '      <div id="etape-2-apres-compagnie" style="display:none">',
    '      <div id="m-retour-box" style="display:none;margin-top:8px">',
    '        <label class="m-label" style="margin-top:0">🔄 Date de retour</label>',
    '        <input type="date" id="m-date-retour" class="m-input">',
    '      </div>'
  ].join('\n');
  var nouveau = '      <div id="etape-2-apres-compagnie" style="display:none">';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter le bloc juste apres le champ Date de voyage (visible tot)
tenter('Bloc date retour ajoute juste apres la date de voyage', function () {
  var ancien = '<input type="date" id="m-date" class="m-input" onchange="lancerRechercheComparateur()">';
  var nouveau = [
    '<input type="date" id="m-date" class="m-input" onchange="lancerRechercheComparateur()">',
    '      <div id="m-retour-box" style="display:none;margin-top:8px">',
    '        <label class="m-label" style="margin-top:0">🔄 Date de retour</label>',
    '        <input type="date" id="m-date-retour" class="m-input">',
    '      </div>'
  ].join('\n');
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
  console.log('SUCCES : date de retour apparait maintenant des le clic sur Aller-Retour.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
