// fix-recherche-village-destination-comparateur.js
// Ajoute la vraie recherche de petits villages (via OpenStreetMap)
// UNIQUEMENT pour la destination du comparateur - le depart reste
// volontairement limite aux villes connues, pour des raisons de
// securite (l'entreprise ne gere pas les departs depuis de petits
// villages non securises).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-recherche-village-destination-comparateur.js

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
  'function chercherDestinationComparateur(input){',
  '  clearTimeout(destComparateurSuggTimer);',
  '  var q = input.value.trim();',
  '  var liste = document.getElementById("sugg-destination-comparateur");',
  '  if(!liste) return;',
  '  if(q.length < 2){ liste.style.display = "none"; liste.innerHTML = ""; return; }',
  '  var villesConnues = VM.map(function(v){return v.n;}).concat(VAO.map(function(v){return v.n;}));',
  '  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1; });',
  '  var htmlVilles = villesTrouvees.map(function(v){',
  '    return "<div onmousedown=\\"selectionnerDestinationComparateur(\'"+v+"\')\\" style=\\"padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;border-bottom:1px solid #f1f5f9;color:#2563eb\\">🏙️ "+v+"</div>";',
  '  }).join("");',
  '  liste.innerHTML = htmlVilles;',
  '  liste.style.display = htmlVilles ? "block" : "none";',
  '}'
].join('\n');

var nouveau = [
  'function chercherDestinationComparateur(input){',
  '  clearTimeout(destComparateurSuggTimer);',
  '  var q = input.value.trim();',
  '  var liste = document.getElementById("sugg-destination-comparateur");',
  '  if(!liste) return;',
  '  if(q.length < 2){ liste.style.display = "none"; liste.innerHTML = ""; return; }',
  '  var villesConnues = VM.map(function(v){return v.n;}).concat(VAO.map(function(v){return v.n;}));',
  '  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1; });',
  '  var htmlVilles = villesTrouvees.map(function(v){',
  '    return "<div onmousedown=\\"selectionnerDestinationComparateur(\'"+v+"\')\\" style=\\"padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;border-bottom:1px solid #f1f5f9;color:#2563eb\\">🏙️ "+v+"</div>";',
  '  }).join("");',
  '  liste.innerHTML = htmlVilles;',
  '  liste.style.display = htmlVilles ? "block" : "none";',
  '  if(q.length < 3) return;',
  '  destComparateurSuggTimer = setTimeout(function(){',
  '    fetch("https://nominatim.openstreetmap.org/search?format=json&countrycodes=ml&limit=6&q="+encodeURIComponent(q))',
  '      .then(function(r){ return r.json(); })',
  '      .then(function(data){',
  '        if(!data || !data.length) return;',
  '        var htmlVillages = data.map(function(v){',
  '          var nomCourt = v.display_name.split(",")[0];',
  '          return "<div onmousedown=\\"selectionnerDestinationComparateur(\'"+nomCourt.replace(/\'/g,"")+"\')\\" style=\\"padding:10px 12px;font-size:13px;font-weight:600;cursor:pointer;border-bottom:1px solid #f1f5f9\\">📍 "+nomCourt+"</div>";',
  '        }).join("");',
  '        liste.innerHTML = htmlVilles + htmlVillages;',
  '        liste.style.display = "block";',
  '      }).catch(function(){});',
  '  }, 400);',
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
