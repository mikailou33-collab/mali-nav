// fix-confirmer-avant-envoi-malinav.js
// Ajoute un vrai bouton "Confirmer ma commande" AVANT le choix
// WhatsApp/SMS, pour que le client valide clairement sa reservation
// avant d'envoyer quoi que ce soit.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-confirmer-avant-envoi-malinav.js district-bamako-v2.html

const fs = require('fs');
const NOM_FICHIER = process.argv[2];

if (!NOM_FICHIER) {
  console.error('Precisez le nom du fichier. Exemple : node fix-confirmer-avant-envoi-malinav.js district-bamako-v2.html');
  process.exit(1);
}
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

// 1) Ajouter le bouton de confirmation + cacher les boutons WA/SMS par defaut
tenter('Bouton de confirmation ajoute dans le HTML', function () {
  var formats = [
    {
      ancien: [
        '      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">',
        '        <button id="btn-wa" class="btn-confirm off" onclick="confirmerWA()">📱 WhatsApp</button>',
        '        <button id="btn-sms" class="btn-confirm off" onclick="confirmerSMS()">💬 SMS</button>',
        '      </div>'
      ].join('\n'),
      nouveau: [
        '      <button id="btn-confirmer-resa" onclick="validerReservation()" style="width:100%;padding:14px;margin-top:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit">✅ Confirmer ma commande</button>',
        '      <div id="boutons-envoi-resa" style="display:none;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">',
        '        <button id="btn-wa" class="btn-confirm off" onclick="confirmerWA()">📱 WhatsApp</button>',
        '        <button id="btn-sms" class="btn-confirm off" onclick="confirmerSMS()">💬 SMS</button>',
        '      </div>'
      ].join('\n')
    },
    {
      ancien: [
        '      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">',
        '        <button id="btn-wa" class="btn-confirm off" onclick="confirmerWA()">📱 WhatsApp</button>',
        '        <button id="btn-sms" class="btn-confirm off" onclick="confirmerSMS()">💬 SMS</button>'
      ].join('\n'),
      nouveau: [
        '      <button id="btn-confirmer-resa" onclick="validerReservation()" style="width:100%;padding:14px;margin-top:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit">✅ Confirmer ma commande</button>',
        '      <div id="boutons-envoi-resa" style="display:none;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">',
        '        <button id="btn-wa" class="btn-confirm off" onclick="confirmerWA()">📱 WhatsApp</button>',
        '        <button id="btn-sms" class="btn-confirm off" onclick="confirmerSMS()">💬 SMS</button>',
        '      </div>'
      ].join('\n')
    }
  ];
  for (var i = 0; i < formats.length; i++) {
    if (contenu.indexOf(formats[i].ancien) !== -1) {
      contenu = contenu.replace(formats[i].ancien, formats[i].nouveau);
      return true;
    }
  }
  return false;
});

// 2) Ajouter la fonction validerReservation() qui bascule l'affichage
tenter('Fonction validerReservation ajoutee', function () {
  var ancre = 'function confirmerWA(){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'function validerReservation(){',
    '  var btnConf = document.getElementById("btn-confirmer-resa");',
    '  var boutons = document.getElementById("boutons-envoi-resa");',
    '  if(btnConf) btnConf.style.display = "none";',
    '  if(boutons) boutons.style.display = "grid";',
    '  showToast("✅ Commande confirmee — choisissez comment recevoir votre billet");',
    '}',
    ancre
  ].join('\n');
  contenu = contenu.replace(ancre, ajout);
  return true;
});

console.log('');
console.log(ok + '/' + total + ' etapes reussies pour ' + NOM_FICHIER);

if (ok === total) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('SUCCES : fichier sauvegarde.');
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
