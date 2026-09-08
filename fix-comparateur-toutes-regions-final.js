// fix-comparateur-toutes-regions-final.js
// GRAND CHANGEMENT CONSOLIDE : applique sur les 19 autres regions le
// meme comparateur de trajets complet et final construit sur Bamako
// aujourd'hui (fusion de 6 correctifs successifs en une seule
// transformation) - depart et destination recherchables librement
// (Mali + Afrique de l'Ouest), vraie liste comparative de toutes
// les compagnies, vrai prix utilise, date de retour bien visible.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-comparateur-toutes-regions-final.js

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

// ═══ BLOC HTML : ancien (compagnie d'abord) -> nouveau (comparateur) ═══
var ancienHTML = [
  '      <label class="m-label">🚌 Compagnie de transport</label>',
  '      <input type="text" id="recherche-compagnie" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagnies(this.value)" style="margin-bottom:8px">',
  '      <div id="grille-compagnies" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">',
  '        <button class="comp-btn" id="cp-sonef" onclick="setComp(\'SONEF\',\'cp-sonef\')"><span style="font-size:20px">🚌</span><span class="comp-name">SONEF</span><span class="comp-info">Bamako-Ségou-Mopti</span></button>',
  '        <button class="comp-btn" id="cp-rimbo" onclick="setComp(\'Rimbo Transport\',\'cp-rimbo\')"><span style="font-size:20px">🚌</span><span class="comp-name">Rimbo</span><span class="comp-info">Toutes destinations</span></button>',
  '        <button class="comp-btn" id="cp-bani" onclick="setComp(\'Bani Transport\',\'cp-bani\')"><span style="font-size:20px">🚌</span><span class="comp-name">Bani Transport</span><span class="comp-info">Nord Mali</span></button>',
  '        <button class="comp-btn" id="cp-bittar" onclick="setComp(\'Bittar Transport\',\'cp-bittar\')"><span style="font-size:20px">🚌</span><span class="comp-name">Bittar</span><span class="comp-info">Kayes-Dakar</span></button>',
  '        <button class="comp-btn" id="cp-diarra" onclick="setComp(\'Diarra Bus\',\'cp-diarra\')"><span style="font-size:20px">🚌</span><span class="comp-name">Diarra Bus</span><span class="comp-info">Sikasso-Bougouni</span></button>',
  '        <button class="comp-btn" id="cp-autre" onclick="setComp(\'Autre compagnie\',\'cp-autre\')"><span style="font-size:20px">🚌</span><span class="comp-name">Autre</span><span class="comp-info">Autre compagnie</span></button>',
  '      </div>',
  '      <div id="comp-choisie" style="display:none;text-align:center;font-size:12px;font-weight:700;color:#14a34a;margin-top:6px;padding:7px;background:#f0fdf4;border-radius:8px;border:1px solid #86efac">✅ Compagnie: <span id="comp-val"></span></div>',
  '      <div id="etape-2-apres-compagnie" style="display:none">',
  '      <label class="m-label">📍 Ville de départ</label>',
  '      <select id="m-depart" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>',
  '      <input type="text" id="m-depart-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" autocomplete="off" oninput="chercherVillage(this,\'sugg-depart\')" onfocus="chercherVillage(this,\'sugg-depart\')">',
  '      <div id="sugg-depart" style="display:none;background:white;border:1px solid var(--border);border-radius:10px;margin-top:4px;overflow:hidden;max-height:180px;overflow-y:auto"></div>',
  '      <label class="m-label">🏁 Ville d\'arrivée</label>',
  '      <select id="m-arrivee" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>',
  '      <input type="text" id="m-arrivee-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" autocomplete="off" oninput="chercherVillage(this,\'sugg-arrivee\')" onfocus="chercherVillage(this,\'sugg-arrivee\')">',
  '      <div id="sugg-arrivee" style="display:none;background:white;border:1px solid var(--border);border-radius:10px;margin-top:4px;overflow:hidden;max-height:180px;overflow-y:auto"></div>',
  '      <label class="m-label">📅 Date de voyage</label>',
  '      <input type="date" id="m-date" class="m-input" onchange="majModal()">',
  '      <div id="m-retour-box" style="display:none;margin-top:8px">',
  '        <label class="m-label" style="margin-top:0">🔄 Date de retour</label>',
  '        <input type="date" id="m-date-retour" class="m-input">',
  '      </div>'
].join('\n');

var nouveauHTML = [
  '      <select id="m-depart" style="display:none"></select>',
  '      <label class="m-label" style="margin-top:0">📍 Ville de départ</label>',
  '      <div style="position:relative">',
  '        <input type="text" id="recherche-depart-comparateur" class="m-input" placeholder="🔍 D\'où partez-vous ?" autocomplete="off" oninput="chercherDepartComparateur(this)" style="margin-bottom:4px">',
  '        <div id="sugg-depart-comparateur" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--border);border-radius:10px;max-height:200px;overflow-y:auto;z-index:60;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>',
  '      </div>',
  '      <input type="hidden" id="m-depart-autre">',
  '      <select id="m-arrivee" style="display:none"></select>',
  '      <input type="hidden" id="m-arrivee-autre">',
  '      <label class="m-label" style="margin-top:0">📅 Date de voyage</label>',
  '      <input type="date" id="m-date" class="m-input" onchange="lancerRechercheComparateur()">',
  '      <div id="m-retour-box" style="display:none;margin-top:8px">',
  '        <label class="m-label" style="margin-top:0">🔄 Date de retour</label>',
  '        <input type="date" id="m-date-retour" class="m-input">',
  '      </div>',
  '      <label class="m-label">🏁 Destination</label>',
  '      <div style="position:relative">',
  '        <input type="text" id="recherche-destination-comparateur" class="m-input" placeholder="🔍 Où voulez-vous aller ?" autocomplete="off" oninput="chercherDestinationComparateur(this)" style="margin-bottom:4px">',
  '        <div id="sugg-destination-comparateur" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--border);border-radius:10px;max-height:200px;overflow-y:auto;z-index:60;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>',
  '      </div>',
  '      <div id="resultats-comparateur" style="margin-top:10px"></div>',
  '      <div id="etape-2-apres-compagnie" style="display:none">'
].join('\n');

// ═══ BLOC JS : nouvelles fonctions completes du comparateur ═══
var ancreJS = 'function setComp(nom,btnId){';
var ajoutJS = [
  'var COMPAGNIES_COMPARATEUR = [',
  '  {id:"sonef", nom:"SONEF"},',
  '  {id:"rimbo", nom:"Rimbo Transport"},',
  '  {id:"bani", nom:"Bani Transport"},',
  '  {id:"bittar", nom:"Bittar Transport"},',
  '  {id:"diarra", nom:"Diarra Bus"}',
  '];',
  'var departComparateurSuggTimer = null;',
  'function chercherDepartComparateur(input){',
  '  clearTimeout(departComparateurSuggTimer);',
  '  var q = input.value.trim();',
  '  var liste = document.getElementById("sugg-depart-comparateur");',
  '  if(!liste) return;',
  '  if(q.length < 2){ liste.style.display = "none"; liste.innerHTML = ""; return; }',
  '  var villesConnues = VM.map(function(v){return v.n;}).concat(VAO.map(function(v){return v.n;}));',
  '  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1; });',
  '  var htmlVilles = villesTrouvees.map(function(v){',
  '    return "<div onmousedown=\\"selectionnerDepartComparateur(\'"+v+"\')\\" style=\\"padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;border-bottom:1px solid #f1f5f9;color:#2563eb\\">🏙️ "+v+"</div>";',
  '  }).join("");',
  '  liste.innerHTML = htmlVilles;',
  '  liste.style.display = htmlVilles ? "block" : "none";',
  '}',
  'function selectionnerDepartComparateur(nom){',
  '  document.getElementById("recherche-depart-comparateur").value = nom;',
  '  document.getElementById("sugg-depart-comparateur").style.display = "none";',
  '  document.getElementById("m-depart").innerHTML = \'<option value="\'+nom+\'|" selected>\'+nom+\'</option>\';',
  '  lancerRechercheComparateur();',
  '}',
  'var destComparateurSuggTimer = null;',
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
  '}',
  'function selectionnerDestinationComparateur(nom){',
  '  document.getElementById("recherche-destination-comparateur").value = nom;',
  '  document.getElementById("sugg-destination-comparateur").style.display = "none";',
  '  document.getElementById("m-arrivee").innerHTML = \'<option value="\'+nom+\'|" selected>\'+nom+\'</option>\';',
  '  lancerRechercheComparateur();',
  '}',
  'function lancerRechercheComparateur(){',
  '  var depart = document.getElementById("recherche-depart-comparateur") ? document.getElementById("recherche-depart-comparateur").value.trim() : "";',
  '  var destination = document.getElementById("recherche-destination-comparateur").value.trim();',
  '  var dateChoisie = document.getElementById("m-date").value;',
  '  var conteneur = document.getElementById("resultats-comparateur");',
  '  if(!depart || !destination || !dateChoisie){ conteneur.innerHTML = ""; return; }',
  '  if(!window.db){ conteneur.innerHTML = \'<div style="text-align:center;color:#9ca3af;font-size:12px;padding:10px">Connexion indisponible</div>\'; return; }',
  '  conteneur.innerHTML = \'<div style="text-align:center;color:#9ca3af;font-size:12px;padding:10px">🔎 Recherche des departs...</div>\';',
  '  var promesses = COMPAGNIES_COMPARATEUR.map(function(c){',
  '    return window.db.ref("horaires_compagnies/"+c.id).once("value").then(function(snap){',
  '      var data = snap.val() || {};',
  '      return Object.keys(data).map(function(k){',
  '        var h = data[k];',
  '        h._compagnieNom = c.nom;',
  '        h._compagnieId = c.id;',
  '        return h;',
  '      });',
  '    }).catch(function(){ return []; });',
  '  });',
  '  Promise.all(promesses).then(function(listes){',
  '    var tous = [].concat.apply([], listes);',
  '    var correspondants = tous.filter(function(h){',
  '      var bonDepart = h.depart === depart;',
  '      var bonneDestination = h.destination === destination;',
  '      var bonneDate = !h.date || h.date === dateChoisie;',
  '      return bonDepart && bonneDestination && bonneDate;',
  '    });',
  '    if(correspondants.length === 0){',
  '      conteneur.innerHTML = \'<div style="text-align:center;color:#dc2626;font-size:12px;padding:14px;background:#fef2f2;border-radius:10px">😕 Aucun depart trouve pour ce trajet a cette date</div>\';',
  '      return;',
  '    }',
  '    correspondants.sort(function(a,b){ return (a.heure||"").localeCompare(b.heure||""); });',
  '    window.resultatsComparateurCourants = correspondants;',
  '    conteneur.innerHTML = \'<div style="font-size:12px;font-weight:800;color:#374151;margin-bottom:8px">\'+correspondants.length+\' option(s) trouvee(s) :</div>\'',
  '      + correspondants.map(function(h, i){',
  '        return \'<button onclick="choisirResultatComparateur(\'+i+\')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:2px solid #e4e7ec;border-radius:12px;background:#fff;cursor:pointer;font-family:inherit;margin-bottom:8px;text-align:left"><div><div style="font-weight:800;font-size:13px">🚌 \'+h._compagnieNom+\'</div><div style="font-size:12px;color:#6b7280;margin-top:2px">\'+h.heure+\' · \'+h.places+\' places</div></div><div style="font-weight:900;color:#16a34a;font-size:14px">\'+(h.prix?h.prix.toLocaleString()+\' F\':\'-\')+\'</div></button>\';',
  '      }).join("");',
  '  });',
  '}',
  'function choisirResultatComparateur(index){',
  '  var h = window.resultatsComparateurCourants ? window.resultatsComparateurCourants[index] : null;',
  '  if(!h) return;',
  '  mComp = h._compagnieNom;',
  '  var cd=document.getElementById(\'comp-choisie\');if(cd)cd.style.display=\'none\';',
  '  var etape2=document.getElementById(\'etape-2-apres-compagnie\');if(etape2)etape2.style.display=\'block\';',
  '  mSieges=[];',
  '  placesHoraireChoisi=parseInt(h.places,10)||65;',
  '  window.prixHoraireChoisi = h.prix || null;',
  '  chargerSiegesOccupes().then(genererPlan);',
  '  mHeure = h.heure;',
  '  var mhc=document.getElementById(\'m-heure-choisie\');if(mhc)mhc.style.display=\'block\';',
  '  var mhv=document.getElementById(\'m-heure-val\');if(mhv)mhv.textContent=h.heure;',
  '  majModal();',
  '}',
  ancreJS
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

  // Methode robuste : chercher un vrai debut fiable et une vraie fin fiable,
  // peu importe les variations entre les deux (couleurs, presence recherche, etc.)
  var marqueurDebut = '<label class="m-label">🚌 Compagnie de transport</label>';
  var marqueurFinOuverture = '<div id="etape-2-apres-compagnie" style="display:none">';
  var idxDebut = contenu.indexOf(marqueurDebut);
  var idxFinOuverture = contenu.indexOf(marqueurFinOuverture, idxDebut);

  if (idxDebut === -1 || idxFinOuverture === -1) {
    echecs.push(nomFichier);
    return;
  }

  var idxFin = idxFinOuverture + marqueurFinOuverture.length;
  contenu = contenu.slice(0, idxDebut) + nouveauHTML + contenu.slice(idxFin);

  var idxJS = contenu.indexOf(ancreJS);
  if (idxJS === -1) {
    echecs.push(nomFichier + ' (JS non trouve)');
    return;
  }
  contenu = contenu.replace(ancreJS, ajoutJS);

  // Retirer aussi la section "Horaire de depart" manuel (deja fixe par le comparateur)
  var idxHoraireDebut = contenu.indexOf('<label class="m-label">⏰ Horaire de départ</label>');
  if (idxHoraireDebut !== -1) {
    var marqueurFinHoraire = '<div id="m-heure-choisie"';
    var idxHoraireFin = contenu.indexOf(marqueurFinHoraire, idxHoraireDebut);
    if (idxHoraireFin !== -1) {
      contenu = contenu.slice(0, idxHoraireDebut) + marqueurFinHoraire + contenu.slice(idxHoraireFin + marqueurFinHoraire.length);
    }
  }

  // Utiliser le vrai prix compagnie dans getPrix si disponible
  var ancienGetPrix1 = "function getPrix(d,a){var dist=DIST[a]||DIST[d]||300;var base=Math.round(dist*13/10)*10*mPass;return base*(mBillet==='retour'?2:1);}";
  var nouveauGetPrix = "function getPrix(d,a){if(window.prixHoraireChoisi){return window.prixHoraireChoisi*mPass*(mBillet==='retour'?2:1);}var dist=DIST[a]||DIST[d]||300;var base=Math.round(dist*13/10)*10*mPass;return base*(mBillet==='retour'?2:1);}";
  if (contenu.indexOf(ancienGetPrix1) !== -1) {
    contenu = contenu.replace(ancienGetPrix1, nouveauGetPrix);
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
