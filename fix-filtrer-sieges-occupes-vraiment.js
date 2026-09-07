// fix-filtrer-sieges-occupes-vraiment.js
// CORRECTIF CRITIQUE : chargerSiegesOccupes() prenait TOUTES les
// reservations de TOUTE la base, peu importe la compagnie, la date,
// ou l'horaire - avec 17+ reservations existantes (differentes
// compagnies/dates), presque tous les sieges apparaissaient occupes
// pour n'importe quel nouveau client. On filtre maintenant vraiment
// par compagnie + date + horaire precis.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-filtrer-sieges-occupes-vraiment.js

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
  '}'
].join('\n');

var nouveau = [
  'function chargerSiegesOccupes(){',
  '  return new Promise(function(resolve){',
  '    if(!window.db){ resolve(); return; }',
  '    window.db.ref("reservations_bus").once("value").then(function(snap){',
  '      var data = snap.val() || {};',
  '      var occ = [];',
  '      var dateChoisie = document.getElementById("m-date") ? document.getElementById("m-date").value : "";',
  '      Object.keys(data).forEach(function(key){',
  '        var r = data[key];',
  '        if(r.statut === "refused" || !r.siege) return;',
  '        var memeCompagnie = !r.compagnie || !mComp || r.compagnie === mComp;',
  '        var memeDate = !r.date || !dateChoisie || r.date === dateChoisie;',
  '        var memeHeure = !r.heure || !mHeure || r.heure === mHeure;',
  '        if(memeCompagnie && memeDate && memeHeure){ occ.push(r.siege); }',
  '      });',
  '      siegesOccupesReel = occ;',
  '      resolve();',
  '    }).catch(function(){ resolve(); });',
  '  });',
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

  // Recharger aussi apres le choix de l'horaire, pas juste redessiner avec de vieilles donnees
  var idxSelHeure = contenu.indexOf("function selHeure(h,id,nbPlaces){\n  mHeure=h;\n  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;\n  mSieges=[];\n  genererPlan();");
  if (idxSelHeure !== -1) {
    var texteOriginalSelHeure = "function selHeure(h,id,nbPlaces){\n  mHeure=h;\n  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;\n  mSieges=[];\n  genererPlan();";
    var texteNouveauSelHeure = "function selHeure(h,id,nbPlaces){\n  mHeure=h;\n  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;\n  mSieges=[];\n  chargerSiegesOccupes().then(genererPlan);";
    contenu = contenu.slice(0, idxSelHeure) + texteNouveauSelHeure + contenu.slice(idxSelHeure + texteOriginalSelHeure.length);
  }

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
