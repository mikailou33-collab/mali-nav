// fix-tombouctou-billetterie.js
// Applique multi-sieges + QR + nouvelle politique (sans frais affiches)
// aux DEUX modales de reservation presentes dans ce fichier.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-tombouctou-billetterie.js

const fs = require('fs');
const NOM_FICHIER = 'region-tombouctou-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let ok = 0;
const total = 7;

function remplacerToutesOccurrences(texte, ancien, nouveauFn) {
  var resultat = '';
  var reste = texte;
  var compte = 0;
  var idx;
  while ((idx = reste.indexOf(ancien)) !== -1) {
    resultat += reste.slice(0, idx) + nouveauFn(compte);
    reste = reste.slice(idx + ancien.length);
    compte++;
  }
  return { texte: resultat + reste, compte: compte };
}

function trouverToutesFonctions(texte, nomFonction) {
  var resultats = [];
  var pos = 0;
  while (true) {
    var debut = texte.indexOf('function ' + nomFonction + '(', pos);
    if (debut === -1) break;
    var ouvre = texte.indexOf('{', debut);
    if (ouvre === -1) break;
    var profondeur = 0;
    var fin = -1;
    for (var i = ouvre; i < texte.length; i++) {
      if (texte[i] === '{') profondeur++;
      else if (texte[i] === '}') {
        profondeur--;
        if (profondeur === 0) { fin = i + 1; break; }
      }
    }
    if (fin === -1) break;
    resultats.push({ debut: debut, fin: fin });
    pos = fin;
  }
  return resultats;
}

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Variables globales (2 occurrences attendues)
tenter('Variables globales (x2)', function () {
  var r = remplacerToutesOccurrences(
    contenu,
    "var mBillet='simple',mPass=1,mPay='',mHeure='',mSiege=0;",
    function () { return "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],dernierRef='';"; }
  );
  if (r.compte === 0) return false;
  contenu = r.texte;
  return true;
});

// 2) Reset (2 occurrences attendues)
tenter('Reset formulaire (x2)', function () {
  var r = remplacerToutesOccurrences(
    contenu,
    "mBillet='simple';mPass=1;mPay='';mHeure='';mSiege=0;mComp='';",
    function () { return "mBillet='simple';mPass=1;mPay='';mHeure='';mSieges=[];mComp='';"; }
  );
  if (r.compte === 0) return false;
  contenu = r.texte;
  return true;
});

// 3) Label (2 occurrences attendues)
tenter('Label plan de sieges (x2)', function () {
  var r = remplacerToutesOccurrences(
    contenu,
    '<label class="m-label">🪑 Choisir votre place</label>',
    function (i) { return '<label class="m-label" id="lbl-sieges' + (i > 0 ? '-' + i : '') + '">🪑 Choisir votre place</label>'; }
  );
  if (r.compte === 0) return false;
  contenu = r.texte;
  return true;
});

// 4) genererPlan (x2, extraction par comptage d'accolades, traite en ordre inverse)
tenter('Plan de sieges multiple (x2)', function () {
  var occs = trouverToutesFonctions(contenu, 'genererPlan');
  if (occs.length === 0) return false;
  occs.slice().reverse().forEach(function (occ, idxReverse) {
    var idxLbl = occs.length - 1 - idxReverse;
    var suffixeLbl = idxLbl > 0 ? '-' + idxLbl : '';
    var nouveauGenererPlan = [
      'function genererPlan(){',
      '  var grid=document.getElementById("plan-grid");if(!grid)return;',
      '  var lbl=document.getElementById("lbl-sieges' + suffixeLbl + '");',
      '  if(lbl)lbl.textContent="\uD83E\uDE91 Choisir "+mPass+" place"+(mPass>1?"s":"")+" ("+mSieges.length+"/"+mPass+")";',
      '  grid.innerHTML="";var occ=[];',
      '  for(var i=1;i<=44;i++){if(Math.random()<0.28&&mSieges.indexOf(i)===-1)occ.push(i);}',
      '  var col=0;',
      '  for(var s=1;s<=44;s++){',
      '    if(col===2){var sp=document.createElement("div");sp.style.background="transparent";grid.appendChild(sp);}',
      '    var isOcc=occ.indexOf(s)>=0;',
      '    var isSel=mSieges.indexOf(s)>=0;',
      '    var btn=document.createElement("button");btn.textContent=s;',
      '    if(isOcc){btn.style.cssText="padding:8px 4px;border:none;border-radius:7px;font-size:11px;font-weight:800;cursor:not-allowed;font-family:inherit;color:white;background:#ef4444;opacity:0.7";btn.disabled=true;}',
      '    else if(isSel){btn.style.cssText="padding:8px 4px;border:none;border-radius:7px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;color:#1a1f2e;background:#f5c400";}',
      '    else{btn.style.cssText="padding:8px 4px;border:none;border-radius:7px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;color:white;background:#16a34a";}',
      '    if(!isOcc){(function(num,b){b.onclick=function(){',
      '      var idx=mSieges.indexOf(num);',
      '      if(idx>=0){ mSieges.splice(idx,1); }',
      '      else{',
      '        if(mSieges.length>=mPass){ showToast("\u26A0\uFE0F Vous avez deja choisi "+mPass+" place(s). Augmentez le nombre de passagers pour en ajouter."); return; }',
      '        mSieges.push(num);',
      '      }',
      '      genererPlan();',
      '      var si=document.getElementById("siege-info");',
      '      if(si){',
      '        if(mSieges.length>0){ si.style.display="block"; si.textContent="\u2705 Place(s) N\u00B0"+mSieges.slice().sort(function(a,b){return a-b;}).join(", N\u00B0"); }',
      '        else{ si.style.display="none"; }',
      '      }',
      '      majModal();',
      '    };})(s,btn);}',
      '    grid.appendChild(btn);col=(col+1)%4;',
      '  }',
      '}'
    ].join('\n');
    contenu = contenu.slice(0, occ.debut) + nouveauGenererPlan + contenu.slice(occ.fin);
  });
  return true;
});

// 5) Validation + recap (x2)
tenter('Validation et recap sieges (x2)', function () {
  var r1 = remplacerToutesOccurrences(
    contenu,
    'var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSiege>0;',
    function () { return 'var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSieges.length===mPass&&mPass>0;'; }
  );
  if (r1.compte === 0) return false;
  contenu = r1.texte;

  var r2 = remplacerToutesOccurrences(
    contenu,
    "document.getElementById('mr-siege').textContent=mSiege?'N°'+mSiege:'À choisir';",
    function () { return 'document.getElementById("mr-siege").textContent=mSieges.length?("N\u00B0"+mSieges.slice().sort(function(a,b){return a-b;}).join(", N\u00B0")):"\u00C0 choisir";'; }
  );
  contenu = r2.texte;
  return true;
});

// 6) chgMPass (x2)
tenter('Ajustement passagers/sieges (x2)', function () {
  var r = remplacerToutesOccurrences(
    contenu,
    "function chgMPass(n){mPass=Math.max(1,Math.min(10,mPass+n));document.getElementById('m-nb-pass').textContent=mPass;majModal();}",
    function () { return 'function chgMPass(n){mPass=Math.max(1,Math.min(10,mPass+n));document.getElementById("m-nb-pass").textContent=mPass;if(mSieges.length>mPass){mSieges=mSieges.slice(0,mPass);}genererPlan();majModal();}'; }
  );
  if (r.compte === 0) return false;
  contenu = r.texte;
  return true;
});

// 7) getMsg + confirmerWA + confirmerSMS (x2, SANS ligne frais, politique 90/50/0)
tenter('Billet MaliNav + QR + politique (x2, sans frais affiches)', function () {
  var occsGetMsg = trouverToutesFonctions(contenu, 'getMsg');
  var occsWA = trouverToutesFonctions(contenu, 'confirmerWA');
  var occsSMS = trouverToutesFonctions(contenu, 'confirmerSMS');
  if (occsGetMsg.length === 0 || occsWA.length === 0 || occsSMS.length === 0) return false;
  if (occsGetMsg.length !== occsWA.length || occsWA.length !== occsSMS.length) return false;

  function construireBloc() {
    return [
      'function getMsg(){',
      '  var dep=(document.getElementById("m-depart").value||"").split("|")[0];',
      '  var arr=(document.getElementById("m-arrivee").value||"").split("|")[0];',
      '  var date=document.getElementById("m-date").value;',
      '  var nom=document.getElementById("m-nom").value;var tel=document.getElementById("m-tel").value;',
      '  var prix=getPrix(dep,arr);var frais=getFrais(dep,arr);',
      '  var ref="MT-"+Math.random().toString(36).substr(2,6).toUpperCase();',
      '  dernierRef=ref;',
      '  var dr=document.getElementById("m-date-retour");',
      '  var ret=mBillet==="retour"&&dr&&dr.value?"\\n\uD83D\uDCC5 Retour: "+dr.value:"";',
      '  var placesTxt=mSieges.slice().sort(function(a,b){return a-b;}).map(function(s){return "N"+String.fromCharCode(176)+s;}).join(", ");',
      '  var compTxt=(typeof mComp!=="undefined"&&mComp)?mComp:"Non precisee";',
      '  return "\uD83C\uDFAB BILLET MALINAV\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDD16 Ref: "+ref+"\\n\uD83D\uDE8C "+compTxt+"\\n\uD83D\uDDFA "+dep+" \u2192 "+arr+"\\n\u23F0 Depart: "+mHeure+"\\n\uD83E\uDE91 Place(s) "+placesTxt+"\\n\uD83C\uDFAB "+(mBillet==="retour"?"Aller-Retour":"Aller Simple")+"\\n\uD83D\uDCC5 "+date+ret+"\\n\uD83D\uDC64 "+nom+(tel?" \u2022 "+tel:"")+" | \uD83D\uDC65 "+mPass+"p\\n\uD83D\uDCB3 "+mPay+"\\n\uD83D\uDCB0 Billet: "+prix.toLocaleString()+" FCFA\\n\uD83D\uDCB0 TOTAL: "+(prix+frais).toLocaleString()+" FCFA\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDCCB Politique d annulation:\\n\u2705 Plus de 24h avant = 90% rembourse\\n\u26A0\uFE0F Entre 24h et 3h avant = 50% rembourse\\n\u274C Moins de 3h / absence = 0% rembourse\\n\uD83D\uDCB3 Paiement en ligne OBLIGATOIRE\\n\\n\uD83C\uDDF2\uD83C\uDDF1 Bon voyage ! Malinav";',
      '}',
      'function afficherPanneauQR(ref,msg){',
      '  var ancien=document.getElementById("qr-panel");if(ancien)ancien.remove();',
      '  var url="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="+encodeURIComponent(ref);',
      '  var panel=document.createElement("div");',
      '  panel.id="qr-panel";',
      '  panel.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:950;display:flex;align-items:center;justify-content:center;padding:20px";',
      '  var qc=String.fromCharCode(34);',
      '  panel.innerHTML=',
      '    "<div style="+qc+"background:white;border-radius:18px;padding:22px;max-width:320px;width:100%;text-align:center"+qc+">"',
      '    +"<div style="+qc+"font-size:15px;font-weight:900;margin-bottom:12px"+qc+">\uD83C\uDFAB Votre billet</div>"',
      '    +"<img src="+qc+url+qc+" style="+qc+"width:180px;height:180px;margin:0 auto 12px"+qc+"/>"',
      '    +"<div style="+qc+"font-size:11px;color:#6b7280;font-weight:700;margin-bottom:16px"+qc+">Reference : "+ref+"</div>"',
      '    +"<button onclick="+qc+"document.getElementById(\'qr-panel\').remove()"+qc+" style="+qc+"width:100%;padding:12px;background:#1d4ed8;color:white;border:none;border-radius:12px;font-weight:800;font-family:inherit;cursor:pointer"+qc+">Fermer</button></div>";',
      '  document.body.appendChild(panel);',
      '}',
      'function confirmerWA(){',
      '  var dep=(document.getElementById("m-depart").value||"").split("|")[0];',
      '  var arr=(document.getElementById("m-arrivee").value||"").split("|")[0];',
      '  if(!dep||!arr||dep===arr||!document.getElementById("m-date").value||!document.getElementById("m-nom").value.trim()||!mPay||!mHeure||mSieges.length!==mPass){showToast("\u26A0\uFE0F Completez tous les champs et choisissez vos places !");return;}',
      '  var msg=getMsg();',
      '  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");',
      '  fermerModal();showToast("\u2705 Reservation envoyee !");',
      '  afficherPanneauQR(dernierRef,msg);',
      '}',
      'function confirmerSMS(){',
      '  var dep=(document.getElementById("m-depart").value||"").split("|")[0];',
      '  var arr=(document.getElementById("m-arrivee").value||"").split("|")[0];',
      '  if(!dep||!arr||dep===arr||!document.getElementById("m-date").value||!document.getElementById("m-nom").value.trim()||!mPay||!mHeure||mSieges.length!==mPass){showToast("\u26A0\uFE0F Completez tous les champs et choisissez vos places !");return;}',
      '  var msg=getMsg();',
      '  window.location.href="sms:?body="+encodeURIComponent(msg);',
      '  fermerModal();showToast("\u2705 Reservation envoyee !");',
      '  afficherPanneauQR(dernierRef,msg);',
      '}'
    ].join('\n');
  }

  var groupes = [];
  for (var g = 0; g < occsGetMsg.length; g++) {
    groupes.push({
      nom: 'getMsg', pos: occsGetMsg[g]
    }, {
      nom: 'confirmerWA', pos: occsWA[g]
    }, {
      nom: 'confirmerSMS', pos: occsSMS[g]
    });
  }
  // Trie toutes les positions par ordre decroissant de debut pour supprimer sans decaler les index
  groupes.sort(function (a, b) { return b.pos.debut - a.pos.debut; });

  // Pour chaque paquet de 3 (getMsg,WA,SMS) consecutif dans l'ordre d'origine,
  // on doit inserer UN SEUL bloc combine a la position la plus basse du paquet.
  // On reconstruit par groupe d'origine (0..n-1), traites du dernier groupe au premier.
  for (var idxGroupe = occsGetMsg.length - 1; idxGroupe >= 0; idxGroupe--) {
    var trio = [
      { nom: 'getMsg', pos: occsGetMsg[idxGroupe] },
      { nom: 'confirmerWA', pos: occsWA[idxGroupe] },
      { nom: 'confirmerSMS', pos: occsSMS[idxGroupe] }
    ].sort(function (a, b) { return b.pos.debut - a.pos.debut; });

    trio.forEach(function (p) {
      contenu = contenu.slice(0, p.pos.debut) + contenu.slice(p.pos.fin);
    });

    var posInsertion = Math.min(occsGetMsg[idxGroupe].debut, occsWA[idxGroupe].debut, occsSMS[idxGroupe].debut);
    contenu = contenu.slice(0, posInsertion) + construireBloc() + '\n' + contenu.slice(posInsertion);
  }

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
