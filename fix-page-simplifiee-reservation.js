// fix-page-simplifiee-reservation.js
// Ajoute une vraie page simplifiee, avec les couleurs du Mali, quand
// le client arrive depuis le bouton "Reserver un billet" de l'accueil
// - sans onglets ni carte, juste le bouton de reservation direct.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-page-simplifiee-reservation.js

const fs = require('fs');
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

// ═══ FICHIER 1 : index.html (accueil) ═══
tenter('Bouton accueil pointe vers la page simplifiee', function () {
  const NOM = 'index.html';
  if (!fs.existsSync(NOM)) return false;
  let brut = fs.readFileSync(NOM, 'utf8');
  let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var ancien = "onclick=\"document.querySelector('.bamako-card').click()\"";
  var nouveau = "onclick=\"window.location.href='district-bamako-v2.html?direct=1'\"";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM, contenu, 'utf8');
  return true;
});

// ═══ FICHIER 2 : district-bamako-v2.html ═══
tenter('Page simplifiee ajoutee dans district-bamako-v2', function () {
  const NOM = 'district-bamako-v2.html';
  if (!fs.existsSync(NOM)) return false;
  let brut = fs.readFileSync(NOM, 'utf8');
  let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  var ancien = "<body>\n<div class=\"topbar\">";
  var nouveau = [
    "<body>",
    "<div id=\"page-directe-reservation\" style=\"display:none;position:fixed;inset:0;background:linear-gradient(180deg,#14B53F,#FCD116 50%,#CE1126);z-index:600;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center\">",
    "  <button onclick=\"window.location.href='index.html'\" style=\"position:absolute;top:16px;left:16px;background:rgba(255,255,255,.25);border:none;border-radius:50%;width:40px;height:40px;color:#fff;font-size:18px;cursor:pointer\">←</button>",
    "  <div style=\"font-size:50px;margin-bottom:10px\">🚌</div>",
    "  <div style=\"font-size:22px;font-weight:900;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.4);margin-bottom:6px\">Réserver un Billet</div>",
    "  <div style=\"font-size:14px;color:rgba(255,255,255,.9);text-shadow:0 1px 3px rgba(0,0,0,.4);margin-bottom:28px\">Partout au Mali, depuis Bamako</div>",
    "  <button onclick=\"ouvrirReservation()\" style=\"background:#fff;color:#14532d;border:none;border-radius:16px;padding:18px 32px;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:inherit\">🎫 Choisir compagnie + destination</button>",
    "</div>",
    "<div class=\"topbar\">"
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);

  // Ajouter la logique JS pour afficher cette page si le parametre est present
  var ancreScript = 'function switchTab(name,el){';
  var idxAncre = contenu.indexOf(ancreScript);
  if (idxAncre === -1) return false;
  var ajoutJS = [
    "if(new URLSearchParams(window.location.search).get('direct')==='1'){",
    "  document.getElementById('page-directe-reservation').style.display='flex';",
    "  document.querySelector('.topbar').style.display='none';",
    "  document.querySelector('.tabs').style.display='none';",
    "}",
    ancreScript
  ].join('\n');
  contenu = contenu.replace(ancreScript, ajoutJS);

  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM, contenu, 'utf8');
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies.');
