// fix-connecter-region-bus.js
// Applique a UNE region (donnee en argument) les memes corrections que
// pour Bamako : initialisation Firebase, vraie sauvegarde des
// reservations, et vrais sieges occupes bases sur les vraies donnees.
//
// UTILISATION (dans PowerShell, depuis mali-nav) :
//   node fix-connecter-region-bus.js region-segou.html

const fs = require('fs');
const NOM_FICHIER = process.argv[2];

if (!NOM_FICHIER) {
  console.error('Precisez le nom du fichier. Exemple : node fix-connecter-region-bus.js region-segou.html');
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
const total = 7;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 0) Initialiser Firebase (comme pour Bamako)
tenter('Firebase initialise', function () {
  var ancre = '</script>\n</body>\n</html>';
  var ancre2 = '</script></body>\n</html>';
  var utiliseAncre2 = false;
  if (contenu.indexOf(ancre) === -1) {
    if (contenu.indexOf(ancre2) === -1) return false;
    utiliseAncre2 = true;
  }
  var ajout = [
    '</script>',
    '',
    '<script>',
    '(function(){',
    "  var s1 = document.createElement('script');",
    "  s1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';",
    '  s1.onload = function(){',
    "    var s2 = document.createElement('script');",
    "    s2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';",
    '    s2.onload = function(){',
    '      try{',
    "        var cfg = {apiKey:'AIzaSyDdM8PcwhNnfCjaLmqwV5gLgLe9UUsgnZU',databaseURL:'https://malitaxi-default-rtdb.firebaseio.com'};",
    '        if(!firebase.apps.length) firebase.initializeApp(cfg);',
    '        window.db = firebase.database();',
    '      }catch(e){}',
    '    };',
    '    document.head.appendChild(s2);',
    '  };',
    '  document.head.appendChild(s1);',
    '})();',
    '</script>',
    '</body>',
    '</html>'
  ].join('\n');
  contenu = contenu.replace(utiliseAncre2 ? ancre2 : ancre, ajout);
  return true;
});

// 1) Ajouter la fonction de sauvegarde, juste avant getMsg()
tenter('Fonction sauvegarderReservationBus ajoutee', function () {
  var ancre = 'function getMsg(){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var NOMS_VERS_ID = {',
    "  'SONEF':'sonef', 'Rimbo Transport':'rimbo', 'Bani Transport':'bani',",
    "  'Bittar Transport':'bittar', 'Diarra Bus':'diarra'",
    '};',
    'function sauvegarderReservationBus(dep,arr,date,nom,tel,prix,ref){',
    '  if(!window.db) return;',
    '  var compId = NOMS_VERS_ID[mComp] || null;',
    '  mSieges.forEach(function(s){',
    '    window.db.ref("reservations_bus").push({',
    '      reference: ref,',
    '      compagnie: mComp || "Non precisee",',
    '      compagnie_id: compId,',
    '      depart: dep,',
    '      arrivee: arr,',
    '      date: date,',
    '      heure: mHeure,',
    '      nom: nom,',
    '      tel: tel,',
    '      siege: s,',
    '      paiement: mPay,',
    '      prix: prix,',
    '      statut: "pending",',
    '      timestamp: Date.now()',
    '    }).catch(function(){});',
    '  });',
    '}',
    ''
  ].join('\n');
  contenu = contenu.replace(ancre, ajout + ancre);
  return true;
});

// 2) Appeler cette sauvegarde dans confirmerWA()
tenter('Sauvegarde appelee dans confirmerWA', function () {
  var ancien = [
    '  var msg=getMsg();',
    '  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");',
    '  fermerModal();showToast("✅ Reservation envoyee !");',
    '  afficherPanneauQR(dernierRef,msg);',
    '}',
    'function confirmerSMS(){'
  ].join('\n');
  var nouveau = [
    '  var msg=getMsg();',
    '  sauvegarderReservationBus(dep,arr,document.getElementById("m-date").value,document.getElementById("m-nom").value,document.getElementById("m-tel").value,getPrix(dep,arr),dernierRef);',
    '  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");',
    '  fermerModal();showToast("✅ Reservation envoyee !");',
    '  afficherPanneauQR(dernierRef,msg);',
    '}',
    'function confirmerSMS(){'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Appeler cette sauvegarde aussi dans confirmerSMS()
tenter('Sauvegarde appelee dans confirmerSMS', function () {
  var ancien = [
    '  var msg=getMsg();',
    '  window.location.href="sms:?body="+encodeURIComponent(msg);',
    '  fermerModal();showToast("✅ Reservation envoyee !");',
    '  afficherPanneauQR(dernierRef,msg);',
    '}'
  ].join('\n');
  var nouveau = [
    '  var msg=getMsg();',
    '  sauvegarderReservationBus(dep,arr,document.getElementById("m-date").value,document.getElementById("m-nom").value,document.getElementById("m-tel").value,getPrix(dep,arr),dernierRef);',
    '  window.location.href="sms:?body="+encodeURIComponent(msg);',
    '  fermerModal();showToast("✅ Reservation envoyee !");',
    '  afficherPanneauQR(dernierRef,msg);',
    '}'
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 4) Fonction chargerSiegesOccupes (vrais sieges, pas le hasard)
tenter('Fonction chargerSiegesOccupes ajoutee', function () {
  var ancre = 'function genererPlan(){';
  if (contenu.indexOf(ancre) === -1) return false;
  var ajout = [
    'var siegesOccupesReel = [];',
    'function chargerSiegesOccupes(){',
    '  return new Promise(function(resolve){',
    '    if(!window.db){ resolve(); return; }',
    '    window.db.ref("reservations_bus").once("value").then(function(snap){',
    '      var data = snap.val() || {};',
    '      var occ = [];',
    '      Object.keys(data).forEach(function(key){',
    '        var r = data[key];',
    '        if(r.statut !== "refused" && r.siege){ occ.push(r.siege); }',
    '      });',
    '      siegesOccupesReel = occ;',
    '      resolve();',
    '    }).catch(function(){ resolve(); });',
    '  });',
    '}',
    ''
  ].join('\n');
  contenu = contenu.replace(ancre, ajout + ancre);
  return true;
});

// 5) genererPlan() utilise les vrais sieges occupes, pas le hasard
tenter('Occupation aleatoire remplacee par les vraies donnees', function () {
  var ancien = '  grid.innerHTML="";var occ=[];\n  for(var i=1;i<=44;i++){if(Math.random()<0.28&&mSieges.indexOf(i)===-1)occ.push(i);}';
  var nouveau = '  grid.innerHTML="";var occ=siegesOccupesReel.filter(function(i){return mSieges.indexOf(i)===-1;});';
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 6) ouvrirReservation() async + attend le chargement avant d'afficher
tenter('ouvrirReservation() corrigee', function () {
  var ancien1 = 'function ouvrirReservation(){';
  if (contenu.indexOf(ancien1) === -1) return false;

  var formats = [
    { ancien: '  remplirSelects();genererPlan();majModal();', nouveau: '  remplirSelects();\n  await chargerSiegesOccupes();\n  genererPlan();majModal();' },
    { ancien: '  remplirSelects();\n  genererPlan();\n  majModal();', nouveau: '  remplirSelects();\n  await chargerSiegesOccupes();\n  genererPlan();\n  majModal();' }
  ];

  var formatTrouve = null;
  for (var i = 0; i < formats.length; i++) {
    if (contenu.indexOf(formats[i].ancien) !== -1) { formatTrouve = formats[i]; break; }
  }
  if (!formatTrouve) return false;

  var idx = contenu.indexOf(ancien1);
  contenu = contenu.slice(0, idx) + 'async function ouvrirReservation(){' + contenu.slice(idx + ancien1.length);
  contenu = contenu.replace(formatTrouve.ancien, formatTrouve.nouveau);
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
  console.log('ATTENTION : rien n a ete sauvegarde pour ce fichier.');
}
