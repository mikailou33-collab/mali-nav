// fix-appliquer-gao-complet.js
// Applique sur Segou tout ce qu'on a construit sur Bamako : page
// simplifiee, parcours en deux etapes, horaires par compagnie,
// correction du nombre de sieges variable.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-appliquer-gao-complet.js

const fs = require('fs');
const NOM_FICHIER = 'region-kidal.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let ok = 0;
const total = 9;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter la page simplifiee juste apres <body>
tenter('Page simplifiee ajoutee', function () {
  var ancien = '<body>\n<div class="topbar">';
  var nouveau = [
    '<body>',
    '<div id="page-directe-reservation" style="display:none;position:fixed;inset:0;background:#fff;z-index:2000;flex-direction:column;align-items:center;padding:20px;text-align:center">',
    '  <button onclick="window.location.href=\'index.html\'" style="position:absolute;top:16px;left:16px;background:#f3f4f6;border:none;border-radius:50%;width:40px;height:40px;color:#333;font-size:18px;cursor:pointer">←</button>',
    '  <div style="height:50px"></div>',
    '  <button onclick="ouvrirReservation()" style="background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126);color:#fff;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);font-family:inherit;text-shadow:0 1px 2px rgba(0,0,0,.3)">🎫 Choisir compagnie + destination</button>',
    '  <div style="width:100%;max-width:380px;margin-top:24px">',
    '    <div style="font-size:13px;font-weight:800;color:#333;margin-bottom:10px">📍 Adresses et coordonnées des compagnies</div>',
    '    <input type="text" id="recherche-compagnie-accueil" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagniesAccueil(this.value)" style="margin-bottom:10px">',
    '    <div id="liste-compagnies-accueil" style="display:flex;flex-direction:column;gap:8px;text-align:left"></div>',
    '  </div>',
    '</div>',
    '<div class="topbar">'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter la logique JS de detection ?direct=1
tenter('Detection direct=1 ajoutee', function () {
  var ancre = 'function switchTab(name,el){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    "if(new URLSearchParams(window.location.search).get('direct')==='1'){",
    "  document.getElementById('page-directe-reservation').style.display='flex';",
    "  document.querySelector('.topbar').style.display='none';",
    "  document.querySelector('.tabs').style.display='none';",
    "  afficherCompagniesAccueil();",
    "}",
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

// 3) Envelopper l'etape 2 (masquee par defaut)
tenter('Bloc etape 2 cree', function () {
  var ancien = '<div id="comp-choisie" style="display:none;text-align:center;font-size:12px;font-weight:700;color:#1d4ed8;margin-bottom:4px;padding:7px;background:#eff6ff;border-radius:8px">✅ Compagnie: <span id="comp-val"></span></div>';
  var nouveau = ancien + '\n      <div id="etape-2-apres-compagnie" style="display:none">';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 4) Fermer le bloc avant le bouton confirmer
tenter('Fermeture etape 2 ajoutee', function () {
  var ancien = '      <button id="btn-confirmer-resa" onclick="validerReservation()"';
  var nouveau = '      </div>\n      <button id="btn-confirmer-resa" onclick="validerReservation()"';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 5) Ajouter les fonctions liste compagnies + horaires par compagnie
tenter('Fonctions liste + horaires ajoutees', function () {
  var ancre = 'function setComp(nom,btnId){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var COMPAGNIES_ACCUEIL = [',
    '  {nom:"SONEF", info:"Bamako-Ségou-Mopti", btnId:"cp-sonef"},',
    '  {nom:"Rimbo Transport", info:"Toutes destinations", btnId:"cp-rimbo"},',
    '  {nom:"Bani Transport", info:"Nord Mali", btnId:"cp-bani"},',
    '  {nom:"Bittar Transport", info:"Kayes-Dakar", btnId:"cp-bittar"},',
    '  {nom:"Diarra Bus", info:"Sikasso-Bougouni", btnId:"cp-diarra"},',
    '];',
    'function afficherCompagniesAccueil(){',
    '  var conteneur = document.getElementById("liste-compagnies-accueil");',
    '  if(!conteneur) return;',
    '  conteneur.innerHTML = COMPAGNIES_ACCUEIL.map(function(c){',
    '    return "<button onclick=\\"choisirCompagnieDepuisAccueil(\'"+c.nom+"\',\'"+c.btnId+"\')\\" style=\\"display:flex;align-items:center;gap:10px;padding:12px 14px;border:2px solid var(--border);border-radius:12px;background:#fff;cursor:pointer;font-family:inherit;text-align:left\\"><span style=\\"font-size:20px\\">🚌</span><span style=\\"flex:1\\"><div style=\\"font-weight:800;font-size:13px\\">"+c.nom+"</div><div style=\\"font-size:11px;color:var(--sub)\\">"+c.info+"</div></span></button>";',
    '  }).join("");',
    '}',
    'function filtrerCompagniesAccueil(recherche){',
    '  var termeMinuscule = recherche.trim().toLowerCase();',
    '  var conteneur = document.getElementById("liste-compagnies-accueil");',
    '  if(!conteneur) return;',
    '  var compagniesFiltrees = COMPAGNIES_ACCUEIL.filter(function(c){',
    '    return c.nom.toLowerCase().indexOf(termeMinuscule) !== -1 || c.info.toLowerCase().indexOf(termeMinuscule) !== -1;',
    '  });',
    '  conteneur.innerHTML = compagniesFiltrees.map(function(c){',
    '    return "<button onclick=\\"choisirCompagnieDepuisAccueil(\'"+c.nom+"\',\'"+c.btnId+"\')\\" style=\\"display:flex;align-items:center;gap:10px;padding:12px 14px;border:2px solid var(--border);border-radius:12px;background:#fff;cursor:pointer;font-family:inherit;text-align:left\\"><span style=\\"font-size:20px\\">🚌</span><span style=\\"flex:1\\"><div style=\\"font-weight:800;font-size:13px\\">"+c.nom+"</div><div style=\\"font-size:11px;color:var(--sub)\\">"+c.info+"</div></span></button>";',
    '  }).join("");',
    '}',
    'function choisirCompagnieDepuisAccueil(nom, btnId){',
    '  showToast("📍 Adresse et localisation de " + nom + " bientôt disponibles");',
    '}',
    'var HORAIRES_PAR_COMPAGNIE = {',
    '  "SONEF": [["06h00",10],["12h00",6],["18h00",14]],',
    '  "Rimbo Transport": [["05h30",12],["09h00",8],["14h00",15],["17h30",6],["20h00",10]],',
    '  "Bani Transport": [["07h00",9],["15h00",11]],',
    '  "Bittar Transport": [["08h00",7],["16h00",13]],',
    '  "Diarra Bus": [["06h30",8],["11h30",5],["19h00",12]],',
    '  "Autre compagnie": [["08h00",10],["16h00",10]]',
    '};',
    'function afficherHorairesCompagnie(nomCompagnie){',
    '  var horaires = HORAIRES_PAR_COMPAGNIE[nomCompagnie] || HORAIRES_PAR_COMPAGNIE["Autre compagnie"];',
    '  var conteneur = document.querySelector("#etape-2-apres-compagnie [style*=\'grid-template-columns:1fr 1fr 1fr\']");',
    '  if(!conteneur) return;',
    '  conteneur.innerHTML = horaires.map(function(h, i){',
    '    return \'<button class="m-hbtn" id="h\'+(i+1)+\'" onclick="selHeure(\\\'\'+h[0]+\'\\\',\\\'h\'+(i+1)+\'\\\',\\\'\'+h[1]+\'\\\')">\'+h[0]+\'<br><small>\'+h[1]+\' places</small></button>\';',
    '  }).join("");',
    '}',
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

// 6) Ajouter placesHoraireChoisi (variables sur deux lignes separees pour Segou)
tenter('Variable placesHoraireChoisi ajoutee', function () {
  var ancien = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],dernierRef='';";
  var nouveau = "var mBillet='simple',mPass=1,mPay='',mHeure='',mSieges=[],dernierRef='',placesHoraireChoisi=44;";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 7) Modifier setComp pour reveler etape2 + reset grille
tenter('setComp modifie', function () {
  var ancien = [
    'function setComp(nom,btnId){',
    '  mComp=nom;',
    '  [\'cp-sonef\',\'cp-rimbo\',\'cp-bani\',\'cp-bittar\',\'cp-diarra\',\'cp-autre\'].forEach(function(x){var b=document.getElementById(x);if(b)b.className=\'comp-btn\';});',
    '  var sel=document.getElementById(btnId);if(sel)sel.className=\'comp-btn sel\';',
    '  var cd=document.getElementById(\'comp-choisie\');if(cd)cd.style.display=\'block\';',
    '  var cv=document.getElementById(\'comp-val\');if(cv)cv.textContent=nom;',
    '  majModal();',
    '}'
  ].join('\n');
  var nouveau = [
    'function setComp(nom,btnId){',
    '  mComp=nom;',
    '  [\'cp-sonef\',\'cp-rimbo\',\'cp-bani\',\'cp-bittar\',\'cp-diarra\',\'cp-autre\'].forEach(function(x){var b=document.getElementById(x);if(b)b.className=\'comp-btn\';});',
    '  var sel=document.getElementById(btnId);if(sel)sel.className=\'comp-btn sel\';',
    '  var cd=document.getElementById(\'comp-choisie\');if(cd)cd.style.display=\'block\';',
    '  var cv=document.getElementById(\'comp-val\');if(cv)cv.textContent=nom;',
    '  var etape2=document.getElementById(\'etape-2-apres-compagnie\');if(etape2)etape2.style.display=\'block\';',
    '  mHeure=\'\';',
    '  mSieges=[];',
    '  placesHoraireChoisi=0;',
    '  var mhc=document.getElementById(\'m-heure-choisie\');if(mhc)mhc.style.display=\'none\';',
    '  var si2=document.getElementById(\'siege-info\');if(si2)si2.style.display=\'none\';',
    '  afficherHorairesCompagnie(nom);',
    '  genererPlan();',
    '  majModal();',
    '}'
  ].join('\n');
  var idx = contenu.indexOf(ancien);
  if (idx === -1) return false;
  contenu = contenu.slice(0, idx) + nouveau + contenu.slice(idx + ancien.length);
  return true;
});

// 8) Modifier selHeure pour utiliser le nombre de places + rafraichir la grille
tenter('selHeure modifie', function () {
  var ancien = [
    'function selHeure(h,id){',
    '  mHeure=h;'
  ].join('\n');
  var nouveau = [
    'function selHeure(h,id,nbPlaces){',
    '  mHeure=h;',
    '  if(nbPlaces) placesHoraireChoisi=parseInt(nbPlaces,10)||44;',
    '  mSieges=[];',
    '  genererPlan();'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 9) Modifier genererPlan pour utiliser le nombre variable
tenter('genererPlan modifie', function () {
  var ancien = 'for(var s=1;s<=44;s++){';
  var nouveau = 'for(var s=1;s<=placesHoraireChoisi;s++){';
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
  console.log('SUCCES : Kidal a maintenant le meme systeme que Bamako.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
