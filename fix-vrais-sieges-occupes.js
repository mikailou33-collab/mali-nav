// fix-vrais-sieges-occupes.js
// Corrige un vrai bug de fond : les sieges "occupes" affiches au client
// etaient generes AU HASARD (Math.random()), sans aucun lien avec les
// vraies reservations. Deux clients pouvaient donc choisir le meme
// siege sans le savoir. Remplace ca par une vraie verification Firebase,
// qui prend aussi en compte les sieges vendus physiquement au guichet.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-vrais-sieges-occupes.js

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

// 1) Variable globale + fonction de chargement des vrais sieges occupes
tenter('Fonction chargerSiegesOccupes ajoutee', function () {
  var ancre = 'function genererPlan(){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var siegesOccupesReel = [];',
    'function chargerSiegesOccupes(){',
    '  return new Promise(function(resolve){',
    '    if(!window.db){ resolve(); return; }',
    '    window.db.ref("reservations_bus").once("value").then(function(snap){',
    '      var data = snap.val() || {};',
    '      var occ = [];',
    '      Object.keys(data).forEach(function(key){',
    '        var r = data[key];',
    '        if(r.statut !== "refused" && r.siege){ occ.push(r.siege); }',
    '      });',
    '      siegesOccupesReel = occ;',
    '      resolve();',
    '    }).catch(function(){ resolve(); });',
    '  });',
    '}',
    ''
  ].join('\n');
  contenu = contenu.replace(ancre, ajout + ancre);
  return true;
});

// 2) genererPlan() utilise les vrais sieges occupes, pas le hasard
tenter('Occupation aleatoire remplacee par les vraies donnees', function () {
  var ancien = '  grid.innerHTML="";var occ=[];\n  for(var i=1;i<=44;i++){if(Math.random()<0.28&&mSieges.indexOf(i)===-1)occ.push(i);}';
  var nouveau = '  grid.innerHTML="";var occ=siegesOccupesReel.filter(function(i){return mSieges.indexOf(i)===-1;});';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) ouvrirReservation() devient async et charge les vraies donnees avant
tenter('ouvrirReservation() rendue asynchrone', function () {
  var ancien = 'function ouvrirReservation(){';
  var nouveau = 'async function ouvrirReservation(){';
  var idx = contenu.indexOf(ancien);
  if (idx === -1) return false;
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);
  return true;
});

// 4) Attendre le chargement avant d'appeler genererPlan()
tenter('Chargement attendu avant affichage du plan', function () {
  var ancien = "  remplirSelects();genererPlan();majModal();";
  var nouveau = "  remplirSelects();\n  await chargerSiegesOccupes();\n  genererPlan();majModal();";
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
