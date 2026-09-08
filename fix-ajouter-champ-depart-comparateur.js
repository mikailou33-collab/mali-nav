// fix-ajouter-champ-depart-comparateur.js
// Ajoute un vrai champ de recherche "Ville de depart" au comparateur,
// puisque la page "Reserver un billet partout au Mali" n'est pas
// liee a une seule ville - contrairement aux pages region
// individuelles ou le depart est logiquement fixe.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-ajouter-champ-depart-comparateur.js

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
const total = 3;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Remplacer le select m-depart fixe par un vrai champ de recherche visible
tenter('Champ recherche depart ajoute', function () {
  var ancien = '<select id="m-depart" style="display:none"><option value="Bamako|">Bamako</option></select>';
  var nouveau = [
    '<select id="m-depart" style="display:none"></select>',
    '      <label class="m-label" style="margin-top:0">📍 Ville de départ</label>',
    '      <div style="position:relative">',
    '        <input type="text" id="recherche-depart-comparateur" class="m-input" placeholder="🔍 D\'où partez-vous ?" autocomplete="off" oninput="chercherDepartComparateur(this)" style="margin-bottom:4px">',
    '        <div id="sugg-depart-comparateur" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--border);border-radius:10px;max-height:200px;overflow-y:auto;z-index:60;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>',
    '      </div>'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter la fonction de recherche du depart (reutilise VM/VAO comme la destination)
tenter('Fonction chercherDepartComparateur ajoutee', function () {
  var ancre = 'function chercherDestinationComparateur(input){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var departComparateurSuggTimer = null;',
    'function chercherDepartComparateur(input){',
    '  clearTimeout(departComparateurSuggTimer);',
    '  var q = input.value.trim();',
    '  var liste = document.getElementById("sugg-depart-comparateur");',
    '  if(!liste) return;',
    '  if(q.length < 2){ liste.style.display = "none"; liste.innerHTML = ""; return; }',
    '  var villesConnues = VM.map(function(v){return v.n;});',
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
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

// 3) Modifier lancerRechercheComparateur pour utiliser le vrai depart choisi (au lieu de "Bamako" fixe)
tenter('Recherche comparateur utilise le vrai depart choisi', function () {
  var ancien = [
    '  var destination = document.getElementById("recherche-destination-comparateur").value.trim();',
    '  var dateChoisie = document.getElementById("m-date").value;',
    '  var conteneur = document.getElementById("resultats-comparateur");',
    '  if(!destination || !dateChoisie){ conteneur.innerHTML = ""; return; }'
  ].join('\n');
  var nouveau = [
    '  var depart = document.getElementById("recherche-depart-comparateur") ? document.getElementById("recherche-depart-comparateur").value.trim() : "Bamako";',
    '  var destination = document.getElementById("recherche-destination-comparateur").value.trim();',
    '  var dateChoisie = document.getElementById("m-date").value;',
    '  var conteneur = document.getElementById("resultats-comparateur");',
    '  if(!depart || !destination || !dateChoisie){ conteneur.innerHTML = ""; return; }'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);

  var ancienFiltre = '      var bonDepart = h.depart === "Bamako";';
  var nouveauFiltre = '      var bonDepart = h.depart === depart;';
  if (contenu.indexOf(ancienFiltre) === -1) return false;
  contenu = contenu.replace(ancienFiltre, nouveauFiltre);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : champ Ville de depart modifiable ajoute au comparateur.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
