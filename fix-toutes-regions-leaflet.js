// fix-toutes-regions-leaflet.js
// Applique la carte Leaflet interactive + l'appui long a tous les fichiers
// de region qui n'ont qu'UNE SEULE carte (iframe OpenStreetMap).
// Les fichiers avec plusieurs cartes sont signales a la fin pour
// traitement manuel separe (pour ne rien casser).
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-toutes-regions-leaflet.js

const fs = require('fs');

const FICHIERS = [
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

const q = String.fromCharCode(34);

function construireScript(lat, lng){
  return [
'</script>',
'',
'<script>',
'// CARTE LEAFLET + APPUI LONG',
'var maliNavMap = null;',
'var longPressTimer = null;',
'var longPressMenu = null;',
'',
'function initLeafletMap(){',
'  if(typeof L === "undefined"){ setTimeout(initLeafletMap, 300); return; }',
'  var el = document.getElementById("leaflet-map");',
'  if(!el) return;',
'  maliNavMap = L.map("leaflet-map", {zoomControl: true}).setView([' + lat + ', ' + lng + '], 9);',
'  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {',
'    maxZoom: 19,',
'    subdomains: "abcd",',
'    attribution: "OpenStreetMap CARTO"',
'  }).addTo(maliNavMap);',
'',
'  maliNavMap.on("mousedown", function(e){ startLongPress(e.latlng, e.originalEvent); });',
'  maliNavMap.on("mouseup", cancelLongPress);',
'  maliNavMap.on("drag", cancelLongPress);',
'',
'  maliNavMap.on("contextmenu", function(e){',
'    L.DomEvent.preventDefault(e.originalEvent);',
'    showLongPressMenu(e.latlng, e.originalEvent);',
'  });',
'}',
'',
'function startLongPress(latlng, originalEvent){',
'  cancelLongPress();',
'  longPressTimer = setTimeout(function(){',
'    showLongPressMenu(latlng, originalEvent);',
'  }, 550);',
'}',
'function cancelLongPress(){',
'  if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }',
'}',
'',
'function showLongPressMenu(latlng, originalEvent){',
'  closeLongPressMenu();',
'  var x = (originalEvent && originalEvent.clientX) ? originalEvent.clientX : window.innerWidth/2;',
'  var y = (originalEvent && originalEvent.clientY) ? originalEvent.clientY : window.innerHeight/2;',
'',
'  var menu = document.createElement("div");',
'  menu.id = "long-press-menu";',
'  menu.style.cssText = "position:fixed;z-index:900;left:"+Math.min(x,window.innerWidth-190)+"px;top:"+Math.min(y,window.innerHeight-170)+"px;background:white;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.35);overflow:hidden;min-width:170px;font-family:inherit";',
'  var qq = String.fromCharCode(34);',
'  menu.innerHTML =',
'    "<div style=" + qq + "padding:9px 14px;font-size:11px;font-weight:800;color:#6b7280;border-bottom:1px solid #e4e7ec" + qq + ">" + latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5) + "</div>"',
'    + "<div style=" + qq + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer" + qq + " onclick=" + qq + "lpmNaviguer(" + latlng.lat + "," + latlng.lng + ")" + qq + ">Naviguer</div>"',
'    + "<div style=" + qq + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;border-top:1px solid #e4e7ec" + qq + " onclick=" + qq + "lpmEnregistrer(" + latlng.lat + "," + latlng.lng + ")" + qq + ">Enregistrer</div>"',
'    + "<div style=" + qq + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;border-top:1px solid #e4e7ec" + qq + " onclick=" + qq + "lpmPartager(" + latlng.lat + "," + latlng.lng + ")" + qq + ">Partager</div>";',
'  document.body.appendChild(menu);',
'  longPressMenu = menu;',
'',
'  setTimeout(function(){',
'    document.addEventListener("click", closeLongPressMenuOnce);',
'  }, 50);',
'}',
'function closeLongPressMenuOnce(ev){',
'  if(longPressMenu && !longPressMenu.contains(ev.target)){',
'    closeLongPressMenu();',
'  }',
'}',
'function closeLongPressMenu(){',
'  if(longPressMenu){ longPressMenu.remove(); longPressMenu = null; }',
'  document.removeEventListener("click", closeLongPressMenuOnce);',
'}',
'',
'function lpmNaviguer(lat,lng){',
'  window.open("https://maps.google.com/maps?daddr="+lat+","+lng+"&dirflg=d","_blank");',
'  closeLongPressMenu();',
'}',
'function lpmEnregistrer(lat,lng){',
'  try{',
'    var favoris = JSON.parse(localStorage.getItem("maliNavFavoris") || "[]");',
'    favoris.push({lat: lat, lng: lng, date: new Date().toISOString()});',
'    localStorage.setItem("maliNavFavoris", JSON.stringify(favoris));',
'    showToast("Position enregistree !");',
'  }catch(e){',
'    showToast("Erreur : impossible d enregistrer");',
'  }',
'  closeLongPressMenu();',
'}',
'function lpmPartager(lat,lng){',
'  var msg = "Position sur Mali Nav\\nhttps://maps.google.com/?q="+lat+","+lng;',
'  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");',
'  closeLongPressMenu();',
'}',
'',
'setTimeout(initLeafletMap, 300);',
'</script>',
'</body>',
'</html>'
  ].join('\n');
}

const ancienHead = '<head>\n<meta charset="UTF-8">';
const nouveauHead = '<head>\n<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>\n<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>\n<meta charset="UTF-8">';
const ancienneFin = '</script>\n</body>\n</html>';

let reussis = [];
let echecs = [];
let aTraiterManuellement = [];

FICHIERS.forEach(function(nomFichier){
  if (!fs.existsSync(nomFichier)) {
    echecs.push(nomFichier + ' (fichier introuvable)');
    return;
  }

  let brut = fs.readFileSync(nomFichier, 'utf8');
  let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
  let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

  // Compter les iframes OpenStreetMap
  let matches = contenu.match(/<iframe src="https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=([^"]+)"[^>]*><\/iframe>/g);

  if (!matches || matches.length !== 1) {
    aTraiterManuellement.push(nomFichier + ' (' + (matches ? matches.length : 0) + ' carte(s) trouvee(s))');
    return;
  }

  // Extraire le bbox pour centrer la carte correctement
  let bboxMatch = contenu.match(/bbox=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)/);
  let lat = 17.0, lng = -3.0; // Mali par defaut si extraction echoue
  if (bboxMatch) {
    let minLon = parseFloat(bboxMatch[1]);
    let minLat = parseFloat(bboxMatch[2]);
    let maxLon = parseFloat(bboxMatch[3]);
    let maxLat = parseFloat(bboxMatch[4]);
    lng = (minLon + maxLon) / 2;
    lat = (minLat + maxLat) / 2;
  }

  let etapesOk = 0;

  if (contenu.includes(ancienHead)) {
    contenu = contenu.replace(ancienHead, nouveauHead);
    etapesOk++;
  }

  let nouvelleDiv = '<div id="leaflet-map" style="width:100%;height:100%;min-height:400px;"></div>';
  contenu = contenu.replace(matches[0], nouvelleDiv);
  etapesOk++;

  if (contenu.includes(ancienneFin)) {
    contenu = contenu.replace(ancienneFin, construireScript(lat, lng));
    etapesOk++;
  }

  if (etapesOk === 3) {
    if (avaitCRLF) {
      contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
    }
    fs.writeFileSync(nomFichier, contenu, 'utf8');
    reussis.push(nomFichier);
  } else {
    echecs.push(nomFichier + ' (seulement ' + etapesOk + '/3 etapes)');
  }
});

console.log('');
console.log('=== RESULTATS ===');
console.log('');
console.log('REUSSIS (' + reussis.length + ') :');
reussis.forEach(function(f){ console.log('  OK - ' + f); });
console.log('');
if (echecs.length > 0) {
  console.log('ECHECS (' + echecs.length + ') :');
  echecs.forEach(function(f){ console.log('  X - ' + f); });
  console.log('');
}
if (aTraiterManuellement.length > 0) {
  console.log('A TRAITER MANUELLEMENT (' + aTraiterManuellement.length + ') :');
  aTraiterManuellement.forEach(function(f){ console.log('  ! - ' + f); });
  console.log('');
}
console.log('Prochaine etape si des fichiers ont reussi : git add -A, commit, push.');
