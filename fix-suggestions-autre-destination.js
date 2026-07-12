// fix-suggestions-autre-destination.js
// Ajoute des suggestions de villages maliens (via OpenStreetMap) pendant
// que le client tape dans le champ "Autre destination".
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-suggestions-autre-destination.js

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

// 1) Remplacer oninput="majModal()" par notre nouvelle fonction de suggestions
//    + ajouter une div pour afficher les suggestions sous chaque champ
tenter('Champs de suggestion ajoutes au formulaire', function () {
  var ancien = '<input type="text" id="m-depart-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" oninput="majModal()">\n      <label class="m-label">🏁 Ville d\'arrivée</label>\n      <select id="m-arrivee" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>\n      <input type="text" id="m-arrivee-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" oninput="majModal()">';
  var nouveau = [
    '<input type="text" id="m-depart-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" autocomplete="off" oninput="chercherVillage(this,\'sugg-depart\')" onfocus="chercherVillage(this,\'sugg-depart\')">',
    '      <div id="sugg-depart" style="display:none;background:white;border:1px solid var(--border);border-radius:10px;margin-top:4px;overflow:hidden;max-height:180px;overflow-y:auto"></div>',
    '      <label class="m-label">🏁 Ville d\'arrivée</label>',
    '      <select id="m-arrivee" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>',
    '      <input type="text" id="m-arrivee-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" autocomplete="off" oninput="chercherVillage(this,\'sugg-arrivee\')" onfocus="chercherVillage(this,\'sugg-arrivee\')">',
    '      <div id="sugg-arrivee" style="display:none;background:white;border:1px solid var(--border);border-radius:10px;margin-top:4px;overflow:hidden;max-height:180px;overflow-y:auto"></div>'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Afficher/masquer ces divs avec le champ, dans remplirSelects()
tenter('Affichage/masquage des suggestions synchronise avec le champ', function () {
  var ancien = '      var champTexte=document.getElementById(id+"-autre");\n      if(champTexte) champTexte.style.display=(sel.value.indexOf("AUTRE")===0)?"block":"none";\n      majModal();';
  var nouveau = [
    '      var champTexte=document.getElementById(id+"-autre");',
    '      if(champTexte) champTexte.style.display=(sel.value.indexOf("AUTRE")===0)?"block":"none";',
    '      var idSugg=(id==="m-depart")?"sugg-depart":"sugg-arrivee";',
    '      var champSugg=document.getElementById(idSugg);',
    '      if(champSugg && sel.value.indexOf("AUTRE")!==0) champSugg.style.display="none";',
    '      majModal();'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Fonction de recherche de villages (Nominatim/OpenStreetMap, limite au Mali)
tenter('Fonction de recherche de villages ajoutee', function () {
  var ancre = '</script>\n</body>\n</html>';
  if (contenu.indexOf(ancre) === -1) return false;

  var nouveauScript = [
    '</script>',
    '',
    '<script>',
    'var villageSuggTimer=null;',
    'function chercherVillage(input,idListe){',
    '  clearTimeout(villageSuggTimer);',
    '  var q=input.value.trim();',
    '  var liste=document.getElementById(idListe);',
    '  if(!liste) return;',
    '  if(q.length<3){ liste.style.display="none"; liste.innerHTML=""; return; }',
    '  villageSuggTimer=setTimeout(function(){',
    '    fetch("https://nominatim.openstreetmap.org/search?format=json&countrycodes=ml&limit=6&q="+encodeURIComponent(q))',
    '      .then(function(r){ return r.json(); })',
    '      .then(function(data){',
    '        if(!data || !data.length){ liste.innerHTML="<div style=\'padding:10px;font-size:12px;color:#9ca3af\'>Aucun village trouvé — tape le nom complet</div>"; liste.style.display="block"; return; }',
    '        var qq=String.fromCharCode(34);',
    '        liste.innerHTML=data.map(function(v){',
    '          var nomCourt=v.display_name.split(",")[0];',
    '          var nomSur=v.display_name.replace(/"/g,"");',
    '          return "<div style="+qq+"padding:10px 12px;font-size:13px;font-weight:600;cursor:pointer;border-bottom:1px solid #f1f5f9"+qq+" onmousedown="+qq+"selectionnerVillage("+qq+idListe+qq+","+qq+nomSur+qq+")"+qq+">📍 "+nomCourt+"</div>";',
    '        }).join("");',
    '        liste.style.display="block";',
    '      })',
    '      .catch(function(){ liste.style.display="none"; });',
    '  },400);',
    '}',
    'function selectionnerVillage(idListe,nomVillage){',
    '  var idChamp=(idListe==="sugg-depart")?"m-depart-autre":"m-arrivee-autre";',
    '  var champ=document.getElementById(idChamp);',
    '  if(champ) champ.value=nomVillage.split(",")[0];',
    '  var liste=document.getElementById(idListe);',
    '  if(liste){ liste.style.display="none"; liste.innerHTML=""; }',
    '  majModal();',
    '}',
    'document.addEventListener("click",function(e){',
    '  if(e.target.id!=="m-depart-autre") { var s1=document.getElementById("sugg-depart"); if(s1) s1.style.display="none"; }',
    '  if(e.target.id!=="m-arrivee-autre") { var s2=document.getElementById("sugg-arrivee"); if(s2) s2.style.display="none"; }',
    '});',
    '</script>',
    '</body>',
    '</html>'
  ].join('\n');

  contenu = contenu.replace(ancre, nouveauScript);
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
