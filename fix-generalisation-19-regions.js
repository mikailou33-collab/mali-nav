// fix-generalisation-19-regions.js
// Applique aux 18 regions (Tombouctou exclu, structure differente) :
// 1. Depart limite aux villes du Mali (pays voisins retires du depart)
// 2. Avertissement "trajet international" a l'arrivee
// 3. Option "Autre destination" + suggestions de villages (arrivee seulement)
// Respecte les listes de pays voisins DEJA PERSONNALISEES par region.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-generalisation-19-regions.js

const fs = require('fs');

const FICHIERS = [
  'region-bandiagara-v2.html',
  'region-bougouni.html',
  'region-dioila-v2.html',
  'region-douentza.html',
  'region-gao.html',
  'region-kayes-v2.html',
  'region-kidal.html',
  'region-kita.html',
  'region-koulikoro-v2.html',
  'region-koutiala.html',
  'region-menaka.html',
  'region-mopti.html',
  'region-nara.html',
  'region-nioro.html',
  'region-san.html',
  'region-segou.html',
  'region-sikasso-v2.html',
  'region-taoudenit.html'
];

function trouverFonction(contenu, nomFonction) {
  var debut = contenu.indexOf('function ' + nomFonction + '(');
  if (debut === -1) return null;
  var ouvre = contenu.indexOf('{', debut);
  if (ouvre === -1) return null;
  var profondeur = 0;
  for (var i = ouvre; i < contenu.length; i++) {
    if (contenu[i] === '{') profondeur++;
    else if (contenu[i] === '}') {
      profondeur--;
      if (profondeur === 0) return { debut: debut, fin: i + 1 };
    }
  }
  return null;
}

function traiterFichier(nomFichier) {
  if (!fs.existsSync(nomFichier)) return { nom: nomFichier, statut: 'INTROUVABLE', etapes: 0 };

  let brut = fs.readFileSync(nomFichier, 'utf8');
  let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
  let etapesOk = 0;
  const total = 4;

  // ETAPE 1 : select HTML + champs "Autre" + divs suggestions
  var regexSelDep = /<select id="m-depart" onchange="majModal\(\)" class="m-select">[\s\S]*?<\/select>/;
  var regexSelArr = /<select id="m-arrivee" onchange="majModal\(\)" class="m-select">[\s\S]*?<\/select>/;
  var matchDep = contenu.match(regexSelDep);
  var matchArr = contenu.match(regexSelArr);
  if (matchDep && matchArr && contenu.indexOf('m-depart-autre') === -1) {
    var ajoutDep = matchDep[0] + '\n      <input type="text" id="m-depart-autre" class="m-input" placeholder="Nom du village" style="display:none;margin-top:6px" oninput="majModal()">';
    var ajoutArr = matchArr[0] + '\n      <input type="text" id="m-arrivee-autre" class="m-input" placeholder="Nom du village (sur la route goudronnée)" style="display:none;margin-top:6px" autocomplete="off" oninput="chercherVillage(this,\'sugg-arrivee\')" onfocus="chercherVillage(this,\'sugg-arrivee\')">\n      <div id="sugg-arrivee" style="display:none;background:white;border:1px solid var(--border);border-radius:10px;margin-top:4px;overflow:hidden;max-height:180px;overflow-y:auto"></div>';
    contenu = contenu.replace(regexSelDep, ajoutDep);
    contenu = contenu.replace(regexSelArr, ajoutArr);
    etapesOk++;
  } else if (contenu.indexOf('m-depart-autre') !== -1) {
    etapesOk++; // deja fait
  }

  // ETAPE 2 : remplirSelects() reecrit (Mali seul au depart, Autre+AO seulement a l'arrivee)
  var posRS = trouverFonction(contenu, 'remplirSelects');
  if (posRS) {
    var nouveauRS = [
      'function remplirSelects(){',
      '  var optsM=VM.map(function(v){return "<option value="+String.fromCharCode(34)+v.n+"|"+v.f+"|"+v.p+String.fromCharCode(34)+">"+v.f+" "+v.n+"</option>";}).join("");',
      '  var optsAO=VAO.map(function(v){return "<option value="+String.fromCharCode(34)+v.n+"|"+v.f+"|"+v.p+String.fromCharCode(34)+">"+v.f+" "+v.n+" ("+v.p+")</option>";}).join("");',
      '  var optAutre="<option value="+String.fromCharCode(34)+"AUTRE|📍|Mali"+String.fromCharCode(34)+">📍 Autre destination (préciser)</option>";',
      '  ["m-depart","m-arrivee"].forEach(function(id){',
      '    var sel=document.getElementById(id);if(!sel)return;',
      '    var old=sel.value;',
      '    var optAutreFinal=(id==="m-arrivee")?optAutre:"";',
      '    var optgroupAO=(id==="m-arrivee")?("<optgroup label="+String.fromCharCode(34)+"🌍 Afrique Ouest"+String.fromCharCode(34)+">"+optsAO+"</optgroup>"):"";',
      '    sel.innerHTML="<option value="+String.fromCharCode(34)+String.fromCharCode(34)+">-- Choisir --</option><optgroup label="+String.fromCharCode(34)+"🇲🇱 Mali"+String.fromCharCode(34)+">"+optsM+optAutreFinal+"</optgroup>"+optgroupAO;',
      '    if(old)sel.value=old;',
      '    sel.onchange=function(){',
      '      var champTexte=document.getElementById(id+"-autre");',
      '      if(champTexte) champTexte.style.display=(sel.value.indexOf("AUTRE")===0)?"block":"none";',
      '      var idSugg=(id==="m-depart")?"sugg-depart":"sugg-arrivee";',
      '      var champSugg=document.getElementById(idSugg);',
      '      if(champSugg && sel.value.indexOf("AUTRE")!==0) champSugg.style.display="none";',
      '      majModal();',
      '    };',
      '  });',
      '}'
    ].join('\n');
    contenu = contenu.slice(0, posRS.debut) + nouveauRS + contenu.slice(posRS.fin);
    etapesOk++;
  }

  // ETAPE 3 : note d'avertissement international dans le HTML + logique dans majModal()
  if (contenu.indexOf('note-international') === -1) {
    var ancienHtml = '<div class="m-recap" id="m-recap"';
    if (contenu.indexOf(ancienHtml) !== -1) {
      var nouveauHtml = '<div id="note-international" style="display:none;background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#92400e">⚠️ Trajet international — disponibilité selon la compagnie. Confirmez par téléphone avant de valider.</div>\n      <div class="m-recap" id="m-recap"';
      contenu = contenu.replace(ancienHtml, nouveauHtml);
    }
  }
  var posMM = trouverFonction(contenu, 'majModal');
  if (posMM && contenu.indexOf('estInternational') === -1) {
    var texteMM = contenu.slice(posMM.debut, posMM.fin);
    var ancreElse = /\}\s*else\s*\{\s*document\.getElementById\('m-recap'\)\.style\.display='none';\s*document\.getElementById\('m-prix-lbl'\)\.textContent='';\s*\}/;
    if (ancreElse.test(texteMM)) {
      var nouvelleFin = [
        '  var noteInter=document.getElementById("note-international");',
        '  var estInternational=(typeof VAO!=="undefined")&&(VAO.some(function(v){return v.n===arr;})||VAO.some(function(v){return v.n===dep;}));',
        '  if(noteInter) noteInter.style.display=estInternational?"block":"none";',
        "} else {document.getElementById('m-recap').style.display='none';document.getElementById('m-prix-lbl').textContent='';}"
      ].join('\n');
      texteMM = texteMM.replace(ancreElse, nouvelleFin);
      contenu = contenu.slice(0, posMM.debut) + texteMM + contenu.slice(posMM.fin);
      etapesOk++;
    }
  } else if (posMM && contenu.indexOf('estInternational') !== -1) {
    etapesOk++; // deja fait
  }

  // ETAPE 4 : fonctions de suggestion de villages (ajoutees une seule fois, avant </body></html>)
  if (contenu.indexOf('function chercherVillage') === -1) {
    var ancreFin = '</script>\n</body>\n</html>';
    if (contenu.indexOf(ancreFin) !== -1) {
      var scriptSugg = [
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
      contenu = contenu.replace(ancreFin, scriptSugg);
      etapesOk++;
    }
  } else {
    etapesOk++; // deja fait
  }

  // ETAPE 5 : lecture du village personnalise dans majModal (dep/arr)
  var posMM2 = trouverFonction(contenu, 'majModal');
  var deja = contenu.indexOf('depBrut') !== -1;
  if (posMM2 && !deja) {
    var texteMM2 = contenu.slice(posMM2.debut, posMM2.fin);
    var ancienDA = /var dep=\(document\.getElementById\('m-depart'\)\.value\|\|''\)\.split\('\|'\)\[0\];\s*\n\s*var arr=\(document\.getElementById\('m-arrivee'\)\.value\|\|''\)\.split\('\|'\)\[0\];/;
    if (ancienDA.test(texteMM2)) {
      var nouveauDA = [
        "var depBrut=(document.getElementById('m-depart').value||'').split('|')[0];",
        "var arrBrut=(document.getElementById('m-arrivee').value||'').split('|')[0];",
        "var depAutreEl=document.getElementById('m-depart-autre');",
        "var arrAutreEl=document.getElementById('m-arrivee-autre');",
        "var dep=(depBrut==='AUTRE')?(depAutreEl?depAutreEl.value.trim():''):depBrut;",
        "var arr=(arrBrut==='AUTRE')?(arrAutreEl?arrAutreEl.value.trim():''):arrBrut;"
      ].join('\n  ');
      texteMM2 = texteMM2.replace(ancienDA, nouveauDA);
      contenu = contenu.slice(0, posMM2.debut) + texteMM2 + contenu.slice(posMM2.fin);
    }
  }

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(nomFichier, contenu, 'utf8');
  return { nom: nomFichier, statut: (etapesOk >= 3 ? 'OK' : 'PARTIEL'), etapes: etapesOk };
}

let resultats = FICHIERS.map(traiterFichier);
console.log('');
resultats.forEach(function (r) {
  console.log('  ' + r.statut + ' (' + r.etapes + '/4) - ' + r.nom);
});
var reussis = resultats.filter(function (r) { return r.statut === 'OK'; }).length;
console.log('');
console.log(reussis + '/' + FICHIERS.length + ' fichiers traites avec succes.');
