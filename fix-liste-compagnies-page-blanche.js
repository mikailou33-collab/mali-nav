// fix-liste-compagnies-page-blanche.js
// Ajoute la liste des compagnies actuelles avec recherche sur la
// page blanche simplifiee, sous le bouton colore. Un clic ouvre
// directement la reservation avec la compagnie preselectionnee.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-liste-compagnies-page-blanche.js

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
const total = 2;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter la barre de recherche + liste des compagnies sur la page blanche
tenter('Liste compagnies ajoutee sur page blanche', function () {
  var ancien = '  <button onclick="ouvrirReservation()" style="background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126);color:#fff;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);font-family:inherit;text-shadow:0 1px 2px rgba(0,0,0,.3)">🎫 Choisir compagnie + destination</button>\n</div>';
  var nouveau = [
    '  <button onclick="ouvrirReservation()" style="background:linear-gradient(135deg,#14B53F,#FCD116,#CE1126);color:#fff;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);font-family:inherit;text-shadow:0 1px 2px rgba(0,0,0,.3)">🎫 Choisir compagnie + destination</button>',
    '  <div style="width:100%;max-width:380px;margin-top:24px">',
    '    <input type="text" id="recherche-compagnie-accueil" class="m-input" placeholder="🔍 Rechercher une compagnie..." oninput="filtrerCompagniesAccueil(this.value)" style="margin-bottom:10px">',
    '    <div id="liste-compagnies-accueil" style="display:flex;flex-direction:column;gap:8px;text-align:left"></div>',
    '  </div>',
    '</div>'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter les fonctions JS (donnees, affichage, filtrage, clic)
tenter('Fonctions JS ajoutees', function () {
  var ancre = 'function filtrerCompagnies(recherche){';
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
    '  ouvrirReservation();',
    '  setTimeout(function(){ setComp(nom, btnId); }, 300);',
    '}',
    'function filtrerCompagnies(recherche){'
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);

  // Appeler l'affichage au chargement (dans le bloc qui detecte ?direct=1)
  var ancreAppel = "document.querySelector('.tabs').style.display='none';";
  if (contenu.indexOf(ancreAppel) === -1) return false;
  contenu = contenu.replace(ancreAppel, ancreAppel + "\n  afficherCompagniesAccueil();");
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : liste compagnies avec recherche ajoutee.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
