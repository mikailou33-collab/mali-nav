// fix-billetterie-toutes-regions.js
// Applique multi-sieges + QR code + nouvelle politique d'annulation
// aux fichiers de region (Tombouctou exclu : structure a 2 modales).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-billetterie-toutes-regions.js

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

// Trouve les indices [debut, fin) d'une fonction complete "function nom(...){ ... }"
// en comptant les accolades, peu importe ce qui suit dans le fichier.
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
      if (profondeur === 0) {
        return { debut: debut, fin: i + 1 };
      }
    }
  }
  return null;
}

function traiterFichier(nomFichier) {
  if (!fs.existsSync(nomFichier)) {
    return { nom: nomFichier, statut: 'INTROUVABLE', etapes: 0 };
  }

  let brut = fs.readFileSync(nomFichier, 'utf8');
  let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
  let etapesOk = 0;
  const totalEtapes = 7;

  // 1) Variable globale
  var regexVar = /var mBillet='simple',mPass=1,mPay='',mHeure='',mSiege=0(,mComp='')?;/;
  if (regexVar.test(contenu)) {
    contenu = contenu.replace(regexVar, function (m, g1) {
      return "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[]" + (g1 ? ",mComp=''" : '') + ",dernierRef='';";
    });
    etapesOk++;
  }

  // 2) Reset a l'ouverture
  var regexReset = /mBillet='simple';mPass=1;mPay='';mHeure='';mSiege=0;(mComp='';)?/;
  if (regexReset.test(contenu)) {
    contenu = contenu.replace(regexReset, function (m, g1) {
      return "mBillet='simple';mPass=1;mPay='';mHeure='';mSieges=[];" + (g1 ? "mComp='';" : '');
    });
    etapesOk++;
  }

  // 3) Label du plan de sieges
  var oldLabel = '<label class="m-label">🪑 Choisir votre place</label>';
  var newLabel = '<label class="m-label" id="lbl-sieges">🪑 Choisir votre place</label>';
  if (contenu.includes(oldLabel)) {
    contenu = contenu.replace(oldLabel, newLabel);
    etapesOk++;
  }

  // 4) genererPlan() : selection multiple (extraction par comptage d'accolades)
  var posPlan = trouverFonction(contenu, 'genererPlan');
  if (posPlan) {
    var nouveauGenererPlan = [
      'function genererPlan(){',
      '  var grid=document.getElementById("plan-grid");if(!grid)return;',
      '  var lbl=document.getElementById("lbl-sieges");',
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
    contenu = contenu.slice(0, posPlan.debut) + nouveauGenererPlan + contenu.slice(posPlan.fin);
    etapesOk++;
  }

  // 5) Validation + recap
  var oldOk = 'var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSiege>0;';
  var newOk = 'var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSieges.length===mPass&&mPass>0;';
  var regexRecap = /(if\(document\.getElementById\('mr-siege'\)\)\s*)?document\.getElementById\('mr-siege'\)\.textContent=mSiege\?'N°'\+mSiege:'À choisir';/;
  var etape5ok = false;
  if (contenu.includes(oldOk)) {
    contenu = contenu.replace(oldOk, newOk);
    if (regexRecap.test(contenu)) {
      contenu = contenu.replace(regexRecap, function (m, g1) {
        var ligne = 'document.getElementById("mr-siege").textContent=mSieges.length?("N\u00B0"+mSieges.slice().sort(function(a,b){return a-b;}).join(", N\u00B0")):"\u00C0 choisir";';
        return (g1 ? g1 : '') + ligne;
      });
      etape5ok = true;
    }
  }
  if (etape5ok) etapesOk++;

  // 6) chgMPass
  var regexChg = /function chgMPass\(n\)\{mPass=Math\.max\(1,Math\.min\(10,mPass\+n\)\);document\.getElementById\('m-nb-pass'\)\.textContent=mPass;majModal\(\);\}/;
  if (regexChg.test(contenu)) {
    contenu = contenu.replace(regexChg, 'function chgMPass(n){mPass=Math.max(1,Math.min(10,mPass+n));document.getElementById("m-nb-pass").textContent=mPass;if(mSieges.length>mPass){mSieges=mSieges.slice(0,mPass);}genererPlan();majModal();}');
    etapesOk++;
  }

  // 7) getMsg + confirmerWA + confirmerSMS + QR + politique (extraction individuelle)
  var posGetMsg = trouverFonction(contenu, 'getMsg');
  var posWA = trouverFonction(contenu, 'confirmerWA');
  var posSMS = trouverFonction(contenu, 'confirmerSMS');
  if (posGetMsg && posWA && posSMS) {
    var bloc = [
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
      '  return "\uD83C\uDFAB BILLET MALINAV\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDD16 Ref: "+ref+"\\n\uD83D\uDE8C "+compTxt+"\\n\uD83D\uDDFA "+dep+" \u2192 "+arr+"\\n\u23F0 Depart: "+mHeure+"\\n\uD83E\uDE91 Place(s) "+placesTxt+"\\n\uD83C\uDFAB "+(mBillet==="retour"?"Aller-Retour":"Aller Simple")+"\\n\uD83D\uDCC5 "+date+ret+"\\n\uD83D\uDC64 "+nom+(tel?" \u2022 "+tel:"")+" | \uD83D\uDC65 "+mPass+"p\\n\uD83D\uDCB3 "+mPay+"\\n\uD83D\uDCB0 Billet: "+prix.toLocaleString()+" FCFA\\n\uD83D\uDCB0 Frais service: "+frais+" FCFA (non remboursable)\\n\uD83D\uDCB0 TOTAL: "+(prix+frais).toLocaleString()+" FCFA\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDCCB Politique d annulation:\\n\u2705 Plus de 24h avant = 90% rembourse\\n\u26A0\uFE0F Entre 24h et 3h avant = 50% rembourse\\n\u274C Moins de 3h / absence = 0% rembourse\\n\uD83D\uDCB3 Paiement en ligne OBLIGATOIRE\\n\\n\uD83C\uDDF2\uD83C\uDDF1 Bon voyage ! Malinav";',
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
    // Supprime les 3 fonctions individuellement, dans l'ordre inverse de leur
    // position (pour ne pas decaler les index des autres pendant la suppression).
    var positions = [
      { nom: 'getMsg', pos: posGetMsg },
      { nom: 'confirmerWA', pos: posWA },
      { nom: 'confirmerSMS', pos: posSMS }
    ].sort(function (a, b) { return b.pos.debut - a.pos.debut; });

    positions.forEach(function (p) {
      contenu = contenu.slice(0, p.pos.debut) + contenu.slice(p.pos.fin);
    });

    // Insere le nouveau bloc combine a l'emplacement d'origine de getMsg
    // (le plus proche du debut parmi les 3, donc le premier apres suppression).
    var posInsertion = Math.min(posGetMsg.debut, posWA.debut, posSMS.debut);
    contenu = contenu.slice(0, posInsertion) + bloc + '\n' + contenu.slice(posInsertion);
    etapesOk++;
  }

  if (etapesOk === totalEtapes) {
    if (avaitCRLF) {
      contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
    }
    fs.writeFileSync(nomFichier, contenu, 'utf8');
    return { nom: nomFichier, statut: 'OK', etapes: etapesOk };
  } else {
    return { nom: nomFichier, statut: 'PARTIEL', etapes: etapesOk };
  }
}

let resultats = FICHIERS.map(traiterFichier);

console.log('');
console.log('=== RESULTATS ===');
resultats.forEach(function (r) {
  console.log('  ' + r.statut + ' (' + r.etapes + '/7) - ' + r.nom);
});
console.log('');
var reussis = resultats.filter(function (r) { return r.statut === 'OK'; }).length;
console.log(reussis + '/' + FICHIERS.length + ' fichiers completement corriges.');
console.log('Rappel : region-tombouctou-v2.html exclu (structure a 2 modales, a traiter separement).');
