// fix-derniere-politique-annulation.js
// Corrige les 2 derniers endroits qui affichaient encore l'ancienne
// politique d'annulation (20%/40%/no-show) : l'encadre d'info du
// formulaire, et le message envoye lors d'une annulation.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-derniere-politique-annulation.js

const fs = require('fs');

const FICHIERS = [
  'district-bamako-v2.html',
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
  'region-taoudenit.html',
  'region-tombouctou-v2.html'
];

function remplacerToutesOccurrences(texte, ancien, nouveau) {
  var resultat = '';
  var reste = texte;
  var compte = 0;
  var idx;
  while ((idx = reste.indexOf(ancien)) !== -1) {
    resultat += reste.slice(0, idx) + nouveau;
    reste = reste.slice(idx + ancien.length);
    compte++;
  }
  return { texte: resultat + reste, compte: compte };
}

// Les 3 lignes de l'encadre d'info
var pairesEncadre = [
  ['<div class="pol-r">✅ Avant 24h → 20% retenu / 80% remboursé</div>', '<div class="pol-r">✅ Plus de 24h avant → 90% remboursé</div>'],
  ['<div class="pol-r">⚠️ Après 24h → 40% retenu / 60% remboursé</div>', '<div class="pol-r">⚠️ Entre 24h et 3h avant → 50% remboursé</div>'],
  ['<div class="pol-r">❌ No-show → 0% + pénalité 10% prochaine résa</div>', '<div class="pol-r">❌ Moins de 3h avant / absence → 0% remboursé</div>']
];

// Le message d'annulation (fonction annulerReservation)
var ancienMsgAnnulation = "var msg='❌ ANNULATION MALITAXI\\n━━━━━━━━━━━━━━\\n🔖 Réf: '+ref.trim().toUpperCase()+'\\n📅 Le: '+new Date().toLocaleDateString('fr-FR')+'\\n━━━━━━━━━━━━━━\\n✅ Avant 24h = 80% remboursé\\n⚠️ Après 24h = 60% remboursé\\n🇲🇱 MaliTaxi — Service client';";
var nouveauMsgAnnulation = "var msg='❌ ANNULATION MALINAV\\n━━━━━━━━━━━━━━\\n🔖 Réf: '+ref.trim().toUpperCase()+'\\n📅 Le: '+new Date().toLocaleDateString('fr-FR')+'\\n━━━━━━━━━━━━━━\\n✅ Plus de 24h avant = 90% remboursé\\n⚠️ Entre 24h et 3h avant = 50% remboursé\\n❌ Moins de 3h avant = 0% remboursé\\n🇲🇱 MaliNav — Service client';";

// Variante utilisee dans plusieurs fichiers de region (construction par +=)
var ancienMsgAnnulationAlt = "msg += '━━━━━━━━━━━━━━\\n✅ Avant 24h = 80% remboursé\\n⚠️ Après 24h = 60% remboursé\\n🇲🇱 MaliTaxi — Service client';";
var nouveauMsgAnnulationAlt = "msg += '━━━━━━━━━━━━━━\\n✅ Plus de 24h avant = 90% remboursé\\n⚠️ Entre 24h et 3h avant = 50% remboursé\\n❌ Moins de 3h avant = 0% remboursé\\n🇲🇱 MaliNav — Service client';";

let reussis = [];
let echecs = [];

FICHIERS.forEach(function (nomFichier) {
  if (!fs.existsSync(nomFichier)) {
    echecs.push(nomFichier + ' (introuvable)');
    return;
  }
  let contenu = fs.readFileSync(nomFichier, 'utf8');
  let totalEncadre = 0;

  pairesEncadre.forEach(function (paire) {
    var r = remplacerToutesOccurrences(contenu, paire[0], paire[1]);
    contenu = r.texte;
    totalEncadre += r.compte;
  });

  var rMsg = remplacerToutesOccurrences(contenu, ancienMsgAnnulation, nouveauMsgAnnulation);
  contenu = rMsg.texte;
  var rMsgAlt = remplacerToutesOccurrences(contenu, ancienMsgAnnulationAlt, nouveauMsgAnnulationAlt);
  contenu = rMsgAlt.texte;
  var totalMsg = rMsg.compte + rMsgAlt.compte;

  // Si la fonction annulerReservation n'existe pas du tout (bug preexistant
  // dans plusieurs fichiers : le bouton existe mais pas la fonction),
  // on l'ajoute avec la bonne politique.
  var fonctionAjoutee = false;
  if (contenu.indexOf('function annulerReservation') === -1 && contenu.indexOf('onclick="annulerReservation()"') !== -1) {
    var nouvelleFonction = [
      'function annulerReservation(){',
      "  var ref=prompt('Numéro de réf (MT-XXXXXX):');",
      "  if(!ref||ref.trim().length<4){showToast('⚠️ Réf invalide !');return;}",
      "  var msg='❌ ANNULATION MALINAV\\n━━━━━━━━━━━━━━\\n🔖 Réf: '+ref.trim().toUpperCase()+'\\n📅 Le: '+new Date().toLocaleDateString('fr-FR')+'\\n━━━━━━━━━━━━━━\\n✅ Plus de 24h avant = 90% remboursé\\n⚠️ Entre 24h et 3h avant = 50% remboursé\\n❌ Moins de 3h avant = 0% remboursé\\n🇲🇱 MaliNav — Service client';",
      "  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');",
      '}'
    ].join('\n');

    var contenuNormalise = contenu.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
    var etaitCRLFLocal = contenuNormalise !== contenu;
    var ancreFin = '</script>\n</body>\n</html>';
    if (contenuNormalise.includes(ancreFin)) {
      contenuNormalise = contenuNormalise.replace(ancreFin, nouvelleFonction + '\n</script>\n</body>\n</html>');
      contenu = etaitCRLFLocal ? contenuNormalise.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10)) : contenuNormalise;
      fonctionAjoutee = true;
    }
  }

  if (totalEncadre === 0 && totalMsg === 0 && !fonctionAjoutee) {
    echecs.push(nomFichier + ' (rien trouve)');
    return;
  }

  fs.writeFileSync(nomFichier, contenu, 'utf8');
  reussis.push(nomFichier + ' (encadre x' + totalEncadre + ', message annulation x' + totalMsg + (fonctionAjoutee ? ', fonction ajoutee' : '') + ')');
});

console.log('');
console.log('REUSSIS (' + reussis.length + '/' + FICHIERS.length + ') :');
reussis.forEach(function (f) { console.log('  OK - ' + f); });
if (echecs.length > 0) {
  console.log('');
  console.log('ATTENTION (rien trouve, a verifier manuellement) :');
  echecs.forEach(function (f) { console.log('  ! - ' + f); });
}
