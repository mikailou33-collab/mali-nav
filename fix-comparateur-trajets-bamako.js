// fix-comparateur-trajets-bamako.js
// GRAND CHANGEMENT : transforme le parcours "compagnie d'abord" en
// un vrai comparateur "trajet d'abord" - le client choisit sa
// destination et sa date, puis voit TOUTES les compagnies qui font
// ce trajet ce jour-la, avec leur horaire/places/prix, pour choisir
// la meilleure option - comme les vraies apps professionnelles
// (Citybus.ci, Sa Ticket, Hey Bus).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-comparateur-trajets-bamako.js

const fs = require('fs');
const NOM_FICHIER = 'district-bamako-v2.html';
const VILLE_DEPART_FIXE = 'Bamako';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let ok = 0;
const total = 3;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Remplacer toute la section "Compagnie + Ville depart/arrivee + Date"
//    par le nouveau bloc "Destination + Date + Recherche + Resultats"
tenter('Nouvelle structure comparateur inseree', function () {
  var ancien = [
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
    '      <input type="date" id="m-date" class="m-input" onchange="majModal()">'
  ].join('\n');

  var nouveau = [
    '      <select id="m-depart" style="display:none"><option value="' + VILLE_DEPART_FIXE + '|">' + VILLE_DEPART_FIXE + '</option></select>',
    '      <input type="hidden" id="m-depart-autre">',
    '      <select id="m-arrivee" style="display:none"></select>',
    '      <input type="hidden" id="m-arrivee-autre">',
    '      <label class="m-label" style="margin-top:0">📅 Date de voyage</label>',
    '      <input type="date" id="m-date" class="m-input" onchange="lancerRechercheComparateur()">',
    '      <label class="m-label">🏁 Destination</label>',
    '      <div style="position:relative">',
    '        <input type="text" id="recherche-destination-comparateur" class="m-input" placeholder="🔍 Où voulez-vous aller ?" autocomplete="off" oninput="chercherDestinationComparateur(this)" style="margin-bottom:4px">',
    '        <div id="sugg-destination-comparateur" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--border);border-radius:10px;max-height:200px;overflow-y:auto;z-index:60;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>',
    '      </div>',
    '      <div id="resultats-comparateur" style="margin-top:10px"></div>',
    '      <div id="etape-2-apres-compagnie" style="display:none">'
  ].join('\n');

  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter toutes les nouvelles fonctions JS du comparateur
tenter('Fonctions JS du comparateur ajoutees', function () {
  var ancre = 'function setComp(nom,btnId){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var COMPAGNIES_COMPARATEUR = [',
    '  {id:"sonef", nom:"SONEF"},',
    '  {id:"rimbo", nom:"Rimbo Transport"},',
    '  {id:"bani", nom:"Bani Transport"},',
    '  {id:"bittar", nom:"Bittar Transport"},',
    '  {id:"diarra", nom:"Diarra Bus"}',
    '];',
    'var destComparateurSuggTimer = null;',
    'function chercherDestinationComparateur(input){',
    '  clearTimeout(destComparateurSuggTimer);',
    '  var q = input.value.trim();',
    '  var liste = document.getElementById("sugg-destination-comparateur");',
    '  if(!liste) return;',
    '  if(q.length < 2){ liste.style.display = "none"; liste.innerHTML = ""; return; }',
    '  var villesConnues = VM.map(function(v){return v.n;}).concat(VAO.map(function(v){return v.n;}));',
    '  var villesTrouvees = villesConnues.filter(function(v){ return v.toLowerCase().indexOf(q.toLowerCase()) !== -1 && v !== "' + VILLE_DEPART_FIXE + '"; });',
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
    '  var destination = document.getElementById("recherche-destination-comparateur").value.trim();',
    '  var dateChoisie = document.getElementById("m-date").value;',
    '  var conteneur = document.getElementById("resultats-comparateur");',
    '  if(!destination || !dateChoisie){ conteneur.innerHTML = ""; return; }',
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
    '      var bonDepart = h.depart === "' + VILLE_DEPART_FIXE + '";',
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
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

// 3) Retirer la section "Horaire de depart" (choix manuel) puisque l'horaire
//    est deja fixe par le resultat choisi dans le comparateur
tenter('Section Horaire manuel retiree (deja fixe par le comparateur)', function () {
  var ancien = [
    '      <label class="m-label">⏰ Horaire de départ</label>',
    '      <div style="background:#f0fdf4;border-radius:12px;padding:10px 14px;border:1px solid #bbf7d0;margin-bottom:4px">',
    '        <div style="font-size:11px;color:#166534;font-weight:700;margin-bottom:8px">🏢 Horaires fixés par la compagnie</div>',
    '        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
  ].join('\n');
  var idxDebut = contenu.indexOf(ancien);
  if (idxDebut === -1) return false;
  var marqueurFin = '<div id="m-heure-choisie"';
  var idxFin = contenu.indexOf(marqueurFin, idxDebut);
  if (idxFin === -1) return false;
  var nouveauBloc = '      <div id="m-heure-choisie"';
  contenu = contenu.slice(0, idxDebut) + nouveauBloc + contenu.slice(idxFin + marqueurFin.length);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : comparateur de trajets construit sur Bamako.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
