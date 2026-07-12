// fix-nouveaux-pays-voisins.js
// Ajoute 5 pays voisins avec de vraies lignes de bus confirmees (Niger,
// Togo, Benin, Ghana, Gambie), et une note d'avertissement pour les
// destinations internationales (disponibilite selon la compagnie).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-nouveaux-pays-voisins.js

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
const total = 3;

function tenter(label, fn) {
  try {
    if (fn()) { ok++; console.log('OK  - ' + label); }
    else { console.log('RATE- ' + label); }
  } catch (e) {
    console.log('RATE- ' + label + ' (' + e.message + ')');
  }
}

// 1) Ajouter les 5 nouveaux pays dans VAO
tenter('5 nouveaux pays ajoutes a la liste', function () {
  var ancien = "var VAO=[\n  {n:'Dakar',f:'🇸🇳',p:'Sénégal'},{n:'Abidjan',f:'🇨🇮',p:\"Côte d'Ivoire\"},\n  {n:'Ouagadougou',f:'🇧🇫',p:'Burkina Faso'},{n:'Conakry',f:'🇬🇳',p:'Guinée'},\n];";
  var nouveau = "var VAO=[\n  {n:'Dakar',f:'🇸🇳',p:'Sénégal'},{n:'Abidjan',f:'🇨🇮',p:\"Côte d'Ivoire\"},\n  {n:'Ouagadougou',f:'🇧🇫',p:'Burkina Faso'},{n:'Conakry',f:'🇬🇳',p:'Guinée'},\n  {n:'Niamey',f:'🇳🇪',p:'Niger'},{n:'Lomé',f:'🇹🇬',p:'Togo'},\n  {n:'Cotonou',f:'🇧🇯',p:'Bénin'},{n:'Kumasi',f:'🇬🇭',p:'Ghana'},\n  {n:'Banjul',f:'🇬🇲',p:'Gambie'},\n];";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 2) Ajouter leurs distances dans DIST (pour le calcul du prix estimatif)
tenter('Distances ajoutees pour le calcul du prix', function () {
  var ancien = "var DIST={Ségou:240,Mopti:620,Sikasso:370,Kayes:600,Tombouctou:1000,Gao:1200,Koulikoro:60,Bougouni:160,Koutiala:480,San:430,Nioro:443,Kita:190,Nara:379,Douentza:800,Bandiagara:680,Kidal:1500,Dakar:1300,Abidjan:1000,Ouagadougou:900,Conakry:800};";
  var nouveau = "var DIST={Ségou:240,Mopti:620,Sikasso:370,Kayes:600,Tombouctou:1000,Gao:1200,Koulikoro:60,Bougouni:160,Koutiala:480,San:430,Nioro:443,Kita:190,Nara:379,Douentza:800,Bandiagara:680,Kidal:1500,Dakar:1300,Abidjan:1000,Ouagadougou:900,Conakry:800,Niamey:1350,Lomé:1600,Cotonou:1700,Kumasi:1100,Banjul:1200};";
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);
  return true;
});

// 3) Ajouter une note d'avertissement quand une destination internationale est choisie
tenter('Note avertissement destinations internationales ajoutee', function () {
  var ancien = "  } else {document.getElementById('m-recap').style.display='none';document.getElementById('m-prix-lbl').textContent='';}";
  var nouveau = [
    "    var noteInter=document.getElementById(\"note-international\");",
    "    var estInternational=VAO.some(function(v){return v.n===arr;})||VAO.some(function(v){return v.n===dep;});",
    "    if(noteInter) noteInter.style.display=estInternational?\"block\":\"none\";",
    "  } else {document.getElementById('m-recap').style.display='none';document.getElementById('m-prix-lbl').textContent='';}"
  ].join('\n');
  if (contenu.indexOf(ancien) === -1) return false;
  contenu = contenu.replace(ancien, nouveau);

  // Ajoute la div de la note dans le HTML, juste avant le recap
  var ancienHtml = '<div class="m-recap" id="m-recap"';
  var nouveauHtml = '<div id="note-international" style="display:none;background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#92400e">⚠️ Trajet international — disponibilité selon la compagnie. Confirmez par téléphone avant de valider.</div>\n      <div class="m-recap" id="m-recap"';
  if (contenu.indexOf(ancienHtml) === -1) return false;
  contenu = contenu.replace(ancienHtml, nouveauHtml);

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
} else {
  console.log('ATTENTION : rien n a ete sauvegarde.');
}
