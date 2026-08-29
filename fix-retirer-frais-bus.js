// fix-retirer-frais-bus.js
// Retire vraiment les frais (150/250 FCFA) du calcul du prix, pas
// seulement de l'affichage. Avant ce correctif, "mr-frais" avait ete
// cache visuellement, mais le montant continuait d'etre ajoute au total
// facture au client dans les deux endroits (recap + message final).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-retirer-frais-bus.js

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

// 1) majModal() : le total affiche = prix seul, plus de frais ajoutes
tenter('Frais retires du recap (majModal)', function () {
  var ancien = [
    "    var prix=getPrix(dep,arr);var frais=getFrais(dep,arr);",
    "    document.getElementById('m-prix-lbl').textContent=(prix+frais).toLocaleString()+' FCFA';"
  ].join('\n');
  var nouveau = [
    "    var prix=getPrix(dep,arr);var frais=0;",
    "    document.getElementById('m-prix-lbl').textContent=(prix).toLocaleString()+' FCFA';"
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) getMsg() : le message final n'ajoute plus les frais non plus
tenter('Frais retires du message final (getMsg)', function () {
  var ancien = '  var prix=getPrix(dep,arr);var frais=getFrais(dep,arr);\n  var ref="MT-"';
  var nouveau = '  var prix=getPrix(dep,arr);var frais=0;\n  var ref="MT-"';
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
  console.log('SUCCES : fichier sauvegarde.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
