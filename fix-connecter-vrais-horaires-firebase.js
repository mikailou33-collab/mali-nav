// fix-connecter-vrais-horaires-firebase.js
// CORRECTIF MAJEUR : remplace les horaires fictifs (HORAIRES_PAR_COMPAGNIE)
// par un vrai chargement depuis Firebase (horaires_compagnies/{id}),
// ceux que la compagnie a vraiment definis dans son tableau de bord -
// avec leur vraie destination et leur vrai prix.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-connecter-vrais-horaires-firebase.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

var ancien = [
  'function afficherHorairesCompagnie(nomCompagnie){',
  '  var horaires = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
  '  var conteneur = document.querySelector("#etape-2-apres-compagnie [style*=\'grid-template-columns:1fr 1fr 1fr\']");',
  '  if(!conteneur) return;',
  '  conteneur.innerHTML = horaires.map(function(h, i){',
  '    return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
  '  }).join("");',
  '}'
].join('\n');

var nouveau = [
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
  '    window.horairesReelsCourants = {};',
  '    conteneur.innerHTML = codes.map(function(k, i){',
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

var idx = contenu.indexOf(ancien);

if (idx === -1) {
  console.error('ATTENTION : texte exact non trouve. Rien n a ete modifie.');
  process.exit(1);
}

contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : vrais horaires de la compagnie maintenant charges depuis Firebase.');
