// fix-filtrer-horaires-par-date-client.js
// Filtre les vrais horaires affiches au client selon la vraie date
// qu'il a choisie : garde les horaires "tous les jours" (sans date
// precise) + ceux dont la date exacte correspond a la date choisie.
// Retire les horaires ponctuels d'une autre date.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-filtrer-horaires-par-date-client.js

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
  '    window.horairesReelsCourants = {};',
  '    conteneur.innerHTML = codes.map(function(k, i){',
  '      var h = data[k];',
  '      window.horairesReelsCourants["h"+(i+1)] = h;',
  '      var texteDestination = h.destination ? (\' vers \'+h.destination) : \'\';',
  '      return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeureReelle(\\\'h\'+(i+1)+\'\\\')" style="text-align:center">\'+h.heure+\'<br><small style="font-size:9px">\'+(h.destination||"")+\'</small><br><small>\'+h.places+\' places\'+(h.prix?(\' · \'+h.prix+\'F\'):\'\')+\'</small></button>\';'
].join('\n');

var nouveau = [
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
  '      return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeureReelle(\\\'h\'+(i+1)+\'\\\')" style="text-align:center">\'+h.heure+\'<br><small style="font-size:9px">\'+(h.destination||"")+\'</small><br><small>\'+h.places+\' places\'+(h.prix?(\' · \'+h.prix+\'F\'):\'\')+\'</small></button>\';'
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
console.log('SUCCES : horaires maintenant filtres par la vraie date choisie par le client.');
