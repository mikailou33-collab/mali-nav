// fix-connecter-horaires-toutes-regions.js
// Applique sur les 19 autres regions les deux vraies connexions
// construites sur Bamako aujourd'hui :
// 1) Vrais horaires charges depuis Firebase (au lieu des exemples)
// 2) Filtre par la vraie date choisie par le client
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-connecter-horaires-toutes-regions.js

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

var ancienFonctionComplete = [
  'function afficherHorairesCompagnie(nomCompagnie){',
  '  var horaires = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
  '  var conteneur = document.querySelector("#etape-2-apres-compagnie [style*=\'grid-template-columns:1fr 1fr 1fr\']");',
  '  if(!conteneur) return;',
  '  conteneur.innerHTML = horaires.map(function(h, i){',
  '    return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
  '  }).join("");',
  '}'
].join('\n');

var nouveauFonctionComplete = [
  'function afficherHorairesCompagnie(nomCompagnie){',
  '  var conteneur = document.querySelector("#etape-2-apres-compagnie [style*=\'grid-template-columns:1fr 1fr 1fr\']");',
  '  if(!conteneur) return;',
  '  var compId = NOMS_VERS_ID[nomCompagnie];',
  '  if(!window.db || !compId){',
  '    var horaires = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
  '    conteneur.innerHTML = horaires.map(function(h, i){',
  '      return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
  '    }).join("");',
  '    return;',
  '  }',
  '  conteneur.innerHTML = \'<div style="grid-column:1/-1;text-align:center;font-size:12px;color:#9ca3af;padding:10px">Chargement des horaires...</div>\';',
  '  window.db.ref("horaires_compagnies/"+compId).once("value").then(function(snap){',
  '    var data = snap.val() || {};',
  '    var codes = Object.keys(data);',
  '    if(codes.length === 0){',
  '      var horairesExemple = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
  '      conteneur.innerHTML = horairesExemple.map(function(h, i){',
  '        return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
  '      }).join("");',
  '      return;',
  '    }',
  '    var dateChoisieClient = document.getElementById("m-date") ? document.getElementById("m-date").value : "";',
  '    var codesFiltres = codes.filter(function(k){',
  '      var h = data[k];',
  '      return !h.date || !dateChoisieClient || h.date === dateChoisieClient;',
  '    });',
  '    if(codesFiltres.length === 0){',
  '      conteneur.innerHTML = \'<div style="grid-column:1/-1;text-align:center;font-size:12px;color:#dc2626;padding:10px">Aucun depart disponible pour cette date</div>\';',
  '      return;',
  '    }',
  '    window.horairesReelsCourants = {};',
  '    conteneur.innerHTML = codesFiltres.map(function(k, i){',
  '      var h = data[k];',
  '      window.horairesReelsCourants["h"+(i+1)] = h;',
  '      var texteDestination = h.destination ? (\' vers \'+h.destination) : \'\';',
  '      return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeureReelle(\\\'h\'+(i+1)+\'\\\')" style="text-align:center">\'+h.heure+\'<br><small style="font-size:9px">\'+(h.destination||"")+\'</small><br><small>\'+h.places+\' places\'+(h.prix?(\' · \'+h.prix+\'F\'):\'\')+\'</small></button>\';',
  '    }).join("");',
  '  }).catch(function(){',
  '    var horairesSecours = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
  '    conteneur.innerHTML = horairesSecours.map(function(h, i){',
  '      return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
  '    }).join("");',
  '  });',
  '}',
  'function selHeureReelle(id){',
  '  var h = window.horairesReelsCourants ? window.horairesReelsCourants[id] : null;',
  '  if(!h) return;',
  '  selHeure(h.heure, id, h.places);',
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

  var idx = contenu.indexOf(ancienFonctionComplete);
  if (idx === -1) {
    echecs.push(nomFichier);
    return;
  }
  contenu = contenu.slice(0, idx) + nouveauFonctionComplete + contenu.slice(idx + ancienFonctionComplete.length);

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
