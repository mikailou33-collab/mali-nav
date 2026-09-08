// fix-filtrer-par-vraie-ville-depart.js
// Filtre les horaires affiches au client selon la VRAIE ville de
// depart de la region ouverte (Bamako, Segou, Gao...) - avant, un
// horaire "Sikasso -> Bougouni" defini par une compagnie apparaissait
// a tort sur toutes les 20 regions, meme celles qui ne sont pas
// vraiment Sikasso.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-filtrer-par-vraie-ville-depart.js

const fs = require('fs');

// Chaque fichier correspond a une vraie ville de depart precise
const FICHIERS_VILLES = {
  "district-bamako-v2.html": "Bamako",
  "region-segou.html": "Ségou",
  "region-gao.html": "Gao",
  "region-kayes-v2.html": "Kayes",
  "region-sikasso-v2.html": "Sikasso",
  "region-tombouctou-v2.html": "Tombouctou",
  "region-koulikoro-v2.html": "Koulikoro",
  "region-bandiagara-v2.html": "Bandiagara",
  "region-dioila-v2.html": "Dioïla",
  "region-kidal.html": "Kidal",
  "region-koutiala.html": "Koutiala",
  "region-menaka.html": "Ménaka",
  "region-douentza.html": "Douentza",
  "region-mopti.html": "Mopti",
  "region-san.html": "San",
  "region-bougouni.html": "Bougouni",
  "region-nara.html": "Nara",
  "region-nioro.html": "Nioro",
  "region-kita.html": "Kita",
  "region-taoudenit.html": "Taoudénit"
};

var reussis = 0;
var echecs = [];
var manquants = [];

Object.keys(FICHIERS_VILLES).forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    manquants.push(nomFichier);
    return;
  }
  var villeDepart = FICHIERS_VILLES[nomFichier];
  var brut = fs.readFileSync(nomFichier, 'utf8');
  var avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  var contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var ancien = [
    '    var dateChoisieClient = document.getElementById("m-date") ? document.getElementById("m-date").value : "";',
    '    var codesFiltres = codes.filter(function(k){',
    '      var h = data[k];',
    '      return !h.date || !dateChoisieClient || h.date === dateChoisieClient;',
    '    });'
  ].join('\n');

  var nouveau = [
    '    var dateChoisieClient = document.getElementById("m-date") ? document.getElementById("m-date").value : "";',
    '    var codesFiltres = codes.filter(function(k){',
    '      var h = data[k];',
    '      var bonneDate = !h.date || !dateChoisieClient || h.date === dateChoisieClient;',
    '      var bonDepart = !h.depart || h.depart === "' + villeDepart + '";',
    '      return bonneDate && bonDepart;',
    '    });'
  ].join('\n');

  var idx = contenu.indexOf(ancien);
  if (idx === -1) {
    echecs.push(nomFichier);
    return;
  }
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  console.log('OK  - ' + nomFichier + ' (ville: ' + villeDepart + ')');
  reussis++;
});

console.log('');
console.log(reussis + '/' + Object.keys(FICHIERS_VILLES).length + ' fichiers corriges.');
if (manquants.length > 0) {
  console.log('Fichiers introuvables : ' + manquants.join(', '));
}
if (echecs.length > 0) {
  console.log('ATTENTION, texte non trouve dans : ' + echecs.join(', '));
}
