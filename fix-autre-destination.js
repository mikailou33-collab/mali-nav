// fix-autre-destination.js
// Ajoute une option "Autre destination (preciser)" aux listes de depart et
// d'arrivee, avec un champ texte libre qui apparait quand elle est
// selectionnee. Le prix utilise une estimation par defaut (300km) tant
// qu'une vraie distance n'est pas encore renseignee pour ce village.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-autre-destination.js

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
const total = 4;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter les champs texte libres apres chaque select
tenter('Champs "Autre destination" ajoutes dans le formulaire', function () {
  var ancien = '<select id="m-depart" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>\n      <label class="m-label">🏁 Ville d\'arrivée</label>\n      <select id="m-arrivee" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>';
  var nouveau = '<select id="m-depart" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>\n      <input type="text" id="m-depart-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" oninput="majModal()">\n      <label class="m-label">🏁 Ville d\'arrivée</label>\n      <select id="m-arrivee" onchange="majModal()" class="m-select"><option value="">-- Choisir --</option></select>\n      <input type="text" id="m-arrivee-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" oninput="majModal()">';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter l'option "Autre" dans remplirSelects() + gestion affichage du champ texte
tenter('Option "Autre destination" ajoutee a la liste', function () {
  var ancien = "function remplirSelects(){\n  var optsM=VM.map(function(v){return '<option value=\"'+v.n+'|'+v.f+'|'+v.p+'\">'+v.f+' '+v.n+'</option>';}).join('');\n  var optsAO=VAO.map(function(v){return '<option value=\"'+v.n+'|'+v.f+'|'+v.p+'\">'+v.f+' '+v.n+' ('+v.p+')</option>';}).join('');\n  ['m-depart','m-arrivee'].forEach(function(id){\n    var sel=document.getElementById(id);if(!sel)return;\n    var old=sel.value;\n    sel.innerHTML='<option value=\"\">-- Choisir --</option><optgroup label=\"🇲🇱 Mali\">'+optsM+'</optgroup><optgroup label=\"🌍 Afrique Ouest\">'+optsAO+'</optgroup>';\n    if(old)sel.value=old;\n  });\n}";
  var nouveau = [
    'function remplirSelects(){',
    '  var optsM=VM.map(function(v){return \'<option value="\'+v.n+\'|\'+v.f+\'|\'+v.p+\'">\'+v.f+\' \'+v.n+\'</option>\';}).join(\'\');',
    '  var optsAO=VAO.map(function(v){return \'<option value="\'+v.n+\'|\'+v.f+\'|\'+v.p+\'">\'+v.f+\' \'+v.n+\' (\'+v.p+\')</option>\';}).join(\'\');',
    '  var optAutre=\'<option value="AUTRE|📍|Mali">📍 Autre destination (préciser)</option>\';',
    '  [\'m-depart\',\'m-arrivee\'].forEach(function(id){',
    '    var sel=document.getElementById(id);if(!sel)return;',
    '    var old=sel.value;',
    '    sel.innerHTML=\'<option value="">-- Choisir --</option><optgroup label="🇲🇱 Mali">\'+optsM+optAutre+\'</optgroup><optgroup label="🌍 Afrique Ouest">\'+optsAO+\'</optgroup>\';',
    '    if(old)sel.value=old;',
    '    sel.onchange=function(){',
    '      var champTexte=document.getElementById(id+"-autre");',
    '      if(champTexte) champTexte.style.display=(sel.value.indexOf("AUTRE")===0)?"block":"none";',
    '      majModal();',
    '    };',
    '  });',
    '}'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) majModal() : utiliser le texte libre si "Autre" est choisi
tenter('Lecture du village personnalise dans majModal', function () {
  var ancien = "  var dep=(document.getElementById('m-depart').value||'').split('|')[0];\n  var arr=(document.getElementById('m-arrivee').value||'').split('|')[0];";
  var nouveau = [
    "  var depBrut=(document.getElementById('m-depart').value||'').split('|')[0];",
    "  var arrBrut=(document.getElementById('m-arrivee').value||'').split('|')[0];",
    "  var depAutreEl=document.getElementById('m-depart-autre');",
    "  var arrAutreEl=document.getElementById('m-arrivee-autre');",
    "  var dep=(depBrut==='AUTRE')?(depAutreEl?depAutreEl.value.trim():''):depBrut;",
    "  var arr=(arrBrut==='AUTRE')?(arrAutreEl?arrAutreEl.value.trim():''):arrBrut;"
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 4) getMsg() : meme logique pour le texte du billet final
tenter('Village personnalise repris sur le billet final', function () {
  var ancien = "  var dep=(document.getElementById(\"m-depart\").value||\"\").split(\"|\")[0];\n  var arr=(document.getElementById(\"m-arrivee\").value||\"\").split(\"|\")[0];\n  var date=document.getElementById(\"m-date\").value;";
  var nouveau = [
    '  var depBrutMsg=(document.getElementById("m-depart").value||"").split("|")[0];',
    '  var arrBrutMsg=(document.getElementById("m-arrivee").value||"").split("|")[0];',
    '  var depAutreElMsg=document.getElementById("m-depart-autre");',
    '  var arrAutreElMsg=document.getElementById("m-arrivee-autre");',
    '  var dep=(depBrutMsg==="AUTRE")?(depAutreElMsg?depAutreElMsg.value.trim():""):depBrutMsg;',
    '  var arr=(arrBrutMsg==="AUTRE")?(arrAutreElMsg?arrAutreElMsg.value.trim():""):arrBrutMsg;',
    '  var date=document.getElementById("m-date").value;'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
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
