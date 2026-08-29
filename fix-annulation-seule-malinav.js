// fix-annulation-seule-malinav.js
// Corrige UNIQUEMENT l'annulation (pour les regions dont le lien
// Client VIP etait deja correct, format different) : Kayes, Dioila,
// Nara, Bandiagara.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-annulation-seule-malinav.js region-kayes-v2.html

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

var formats = [
  "  if(!ref||ref.trim().length<4){showToast('⚠️ Réf invalide !');return;}",
  "  if(!ref || ref.trim().length < 4){showToast('⚠️ Réf invalide !'); return;}"
];
var ancienTrouve = null;
for (var i = 0; i < formats.length; i++) {
  if (contenu.indexOf(formats[i]) !== -1) { ancienTrouve = formats[i]; break; }
}

if (!ancienTrouve) {
  console.error('ATTENTION : aucun format connu trouve. Rien n a ete modifie.');
  process.exit(1);
}

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

if (avaitCRLF) {
  contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
}
fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
console.log('SUCCES : annulation corrigee pour ' + NOM_FICHIER);
