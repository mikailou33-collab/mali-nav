// fix-billetterie-multisiege-qr.js
// Ajoute : selection de plusieurs sieges (autant que de passagers),
// generation d'un QR code sur le billet, et la nouvelle politique
// d'annulation (90% / 50% / 0%) avec frais de service non remboursables.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-billetterie-multisiege-qr.js

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
let total = 7;

function tenter(label, fn) {
  try {
    var res = fn();
    if (res) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Variable globale : mSiege -> mSieges (tableau) + dernierRef
tenter('Variables globales (mSieges + dernierRef)', function () {
  var old1 = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSiege=0,mComp='';";
  var new1 = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],mComp='',dernierRef='';";
  if (!contenu.includes(old1)) return false;
  contenu = contenu.replace(old1, new1);
  return true;
});

// 2) Reset dans ouvrirReservation()
tenter('Reset des sieges a l ouverture du formulaire', function () {
  var old2 = "mBillet='simple';mPass=1;mPay='';mHeure='';mSiege=0;mComp='';";
  var new2 = "mBillet='simple';mPass=1;mPay='';mHeure='';mSieges=[];mComp='';";
  if (!contenu.includes(old2)) return false;
  contenu = contenu.replace(old2, new2);
  return true;
});

// 3) Label du plan de sieges avec un id pour mise a jour dynamique
tenter('Ajout id sur le label de selection de siege', function () {
  var old3 = '<label class="m-label">🪑 Choisir votre place</label>';
  var new3 = '<label class="m-label" id="lbl-sieges">🪑 Choisir votre place</label>';
  if (!contenu.includes(old3)) return false;
  contenu = contenu.replace(old3, new3);
  return true;
});

// 4) genererPlan() : selection multiple jusqu'a mPass sieges
tenter('Plan de sieges : selection multiple', function () {
  var regex = /function genererPlan\(\)\{[\s\S]*?\n\}\n(?=function selHeure\(h,id\)\{)/;
  if (!regex.test(contenu)) return false;
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
    '}',
    ''
  ].join('\n');
  contenu = contenu.replace(regex, nouveauGenererPlan);
  return true;
});

// 5) majModal() : validation + affichage du recap
tenter('Validation et recap : plusieurs sieges requis', function () {
  var old5a = '  var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSiege>0;';
  var new5a = '  var ok=dep&&arr&&dep!==arr&&date&&nom&&mPay&&mHeure&&mSieges.length===mPass&&mPass>0;';
  var old5b = "      document.getElementById('mr-siege').textContent=mSiege?'N°'+mSiege:'À choisir';";
  var new5b = '      document.getElementById("mr-siege").textContent=mSieges.length?("N\u00B0"+mSieges.slice().sort(function(a,b){return a-b;}).join(", N\u00B0")):"\u00C0 choisir";';
  if (!contenu.includes(old5a) || !contenu.includes(old5b)) return false;
  contenu = contenu.replace(old5a, new5a);
  contenu = contenu.replace(old5b, new5b);
  return true;
});

// 6) chgMPass() : ajuste les sieges selectionnes si le nombre de passagers baisse
tenter('Ajustement automatique des sieges si passagers change', function () {
  var old6 = "function chgMPass(n){mPass=Math.max(1,Math.min(10,mPass+n));document.getElementById('m-nb-pass').textContent=mPass;majModal();}";
  var new6 = 'function chgMPass(n){mPass=Math.max(1,Math.min(10,mPass+n));document.getElementById("m-nb-pass").textContent=mPass;if(mSieges.length>mPass){mSieges=mSieges.slice(0,mPass);}genererPlan();majModal();}';
  if (!contenu.includes(old6)) return false;
  contenu = contenu.replace(old6, new6);
  return true;
});

// 7) getMsg() + confirmerWA() + confirmerSMS() : nouvelle politique + QR code
tenter('Nouvelle politique d annulation + QR code sur le billet', function () {
  var regex = /function getMsg\(\)\{[\s\S]*?\n\}\nfunction confirmerWA\(\)\{[\s\S]*?\n\}\nfunction confirmerSMS\(\)\{[\s\S]*?\n\}\n(?=function annulerReservation\(\))/;
  if (!regex.test(contenu)) return false;

  var q = String.fromCharCode(34);
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
    '  return "\uD83C\uDFAB BILLET MALITAXI\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDD16 Ref: "+ref+"\\n\uD83D\uDE8C "+(mComp||"Non precisee")+"\\n\uD83D\uDDFA "+dep+" \u2192 "+arr+"\\n\u23F0 Depart: "+mHeure+"\\n\uD83E\uDE91 Place(s) "+placesTxt+"\\n\uD83C\uDFAB "+(mBillet==="retour"?"Aller-Retour":"Aller Simple")+"\\n\uD83D\uDCC5 "+date+ret+"\\n\uD83D\uDC64 "+nom+(tel?" \u2022 "+tel:"")+" | \uD83D\uDC65 "+mPass+"p\\n\uD83D\uDCB3 "+mPay+"\\n\uD83D\uDCB0 Billet: "+prix.toLocaleString()+" FCFA\\n\uD83D\uDCB0 Frais service: "+frais+" FCFA (non remboursable)\\n\uD83D\uDCB0 TOTAL: "+(prix+frais).toLocaleString()+" FCFA\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\n\uD83D\uDCCB Politique d annulation:\\n\u2705 Plus de 24h avant = 90% rembourse\\n\u26A0\uFE0F Entre 24h et 3h avant = 50% rembourse\\n\u274C Moins de 3h / absence = 0% rembourse\\n\uD83D\uDCB3 Paiement en ligne OBLIGATOIRE\\n\\n\uD83C\uDDF2\uD83C\uDDF1 Bon voyage ! Malinav";',
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
    '}',
    ''
  ].join('\n');

  contenu = contenu.replace(regex, bloc);
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
  console.log('Prochaine etape : git add, commit, push.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde (pas toutes les etapes reussies).');
}
