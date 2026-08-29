// fix-lien-et-annulation-malinav.js
// Corrige deux choses : le lien vers Client VIP pointait vers une tres
// vieille version (final-12 au lieu de final-37), et l'annulation de
// billet n'etait jamais vraiment enregistree dans Firebase (juste un
// message WhatsApp manuel, le statut restait "en attente" pour
// toujours).
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-lien-et-annulation-malinav.js district-bamako-v2.html

const fs = require('fs');
const NOM_FICHIER = process.argv[2];

if (!NOM_FICHIER) {
  console.error('Precisez le nom du fichier.');
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

// 1) Corriger le lien vers Client VIP (vieille version -> version actuelle)
tenter('Lien Client VIP corrige', function () {
  var ancien = "window.open('https://mikailou33-collab.github.io/malitaxi-vip/malitaxi-vip-final-12.html','_blank');";
  var nouveau = "window.open('https://mikailou33-collab.github.io/malitaxi-vip/malitaxi-vip-final-37.html','_blank');";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Vraie annulation : insere la logique Firebase juste apres la
//    validation du code de reference (ligne commune a tous les formats)
tenter('Annulation vraiment enregistree dans Firebase', function () {
  var formats = [
    "  if(!ref||ref.trim().length<4){showToast('⚠️ Réf invalide !');return;}",
    "  if(!ref || ref.trim().length < 4){showToast('⚠️ Réf invalide !'); return;}"
  ];
  var ancienTrouve = null;
  for (var i = 0; i < formats.length; i++) {
    if (contenu.indexOf(formats[i]) !== -1) { ancienTrouve = formats[i]; break; }
  }
  if (!ancienTrouve) return false;

  var ajoutFirebase = [
    '',
    '  (function(){',
    '    var refMaj = ref.trim().toUpperCase();',
    '    if(window.db){',
    '      window.db.ref("reservations_bus").orderByChild("reference").equalTo(refMaj).once("value").then(function(snap){',
    '        var data = snap.val();',
    '        if(data){',
    '          Object.keys(data).forEach(function(key){',
    '            window.db.ref("reservations_bus/"+key).update({statut:"refused"}).catch(function(){});',
    '          });',
    '        }',
    '      }).catch(function(){});',
    '    }',
    '  })();'
  ].join('\n');

  contenu = contenu.replace(ancienTrouve, ancienTrouve + ajoutFirebase);
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
