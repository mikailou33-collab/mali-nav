// fix-carte-leaflet-longpress-v3.js
// Remplace l'iframe OpenStreetMap par une vraie carte Leaflet interactive,
// et ajoute la fonction d'appui long (Naviguer / Enregistrer / Partager).
// v3 : corrige un souci de retours a la ligne Windows (CRLF) qui empechait
// le script de trouver les bons emplacements dans le fichier.
//
// UTILISATION (dans CMD, depuis C:\Users\HP\Documents\mali-nav) :
//   node fix-carte-leaflet-longpress-v3.js

const fs = require('fs');

const NOM_FICHIER = 'district-bamako-v2.html';

if (!fs.existsSync(NOM_FICHIER)) {
  console.error('Fichier introuvable: ' + NOM_FICHIER);
  process.exit(1);
}

let brut = fs.readFileSync(NOM_FICHIER, 'utf8');
let avaitCRLF = brut.indexOf(String.fromCharCode(13, 10)) !== -1;
let contenu = brut.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
let etapesOk = 0;

// ETAPE 1 : Ajouter Leaflet (CSS + JS) dans le head
const ancienHead = '<head>\n<meta charset="UTF-8">';
const nouveauHead = '<head>\n<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>\n<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>\n<meta charset="UTF-8">';

if (contenu.includes(ancienHead)) {
  contenu = contenu.replace(ancienHead, nouveauHead);
  etapesOk++;
  console.log('Etape 1/3 OK : Leaflet ajoute dans le head');
} else {
  console.log('Etape 1/3 ECHEC : anchor non trouve (head)');
}

// ETAPE 2 : Remplacer l'iframe par une div pour Leaflet
const ancienIframe = '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-8.1,12.5,-7.8,12.7&layer=mapnik" style="width:100%;height:100%;border:none;min-height:400px;" allowfullscreen loading="lazy"></iframe>';
const nouvelleDiv = '<div id="leaflet-map" style="width:100%;height:100%;min-height:400px;"></div>';

if (contenu.includes(ancienIframe)) {
  contenu = contenu.replace(ancienIframe, nouvelleDiv);
  etapesOk++;
  console.log('Etape 2/3 OK : iframe remplace par la carte Leaflet');
} else {
  console.log('Etape 2/3 ECHEC : anchor non trouve (iframe)');
}

// ETAPE 3 : Ajouter le script Leaflet + appui long avant </body>
const ancienneFin = '</script>\n</body>\n</html>';

const nouveauScript = [
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
'  maliNavMap = L.map("leaflet-map", {zoomControl: true}).setView([12.65, -8.0], 13);',
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
'  var q = String.fromCharCode(34);',
'  menu.innerHTML =',
'    "<div style=" + q + "padding:9px 14px;font-size:11px;font-weight:800;color:#6b7280;border-bottom:1px solid #e4e7ec" + q + ">" + latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5) + "</div>"',
'    + "<div style=" + q + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer" + q + " onclick=" + q + "lpmNaviguer(" + latlng.lat + "," + latlng.lng + ")" + q + ">Naviguer</div>"',
'    + "<div style=" + q + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;border-top:1px solid #e4e7ec" + q + " onclick=" + q + "lpmEnregistrer(" + latlng.lat + "," + latlng.lng + ")" + q + ">Enregistrer</div>"',
'    + "<div style=" + q + "padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;border-top:1px solid #e4e7ec" + q + " onclick=" + q + "lpmPartager(" + latlng.lat + "," + latlng.lng + ")" + q + ">Partager</div>";',
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

if (contenu.includes(ancienneFin)) {
  contenu = contenu.replace(ancienneFin, nouveauScript);
  etapesOk++;
  console.log('Etape 3/3 OK : script carte + appui long ajoute');
} else {
  console.log('Etape 3/3 ECHEC : anchor non trouve (fin de fichier)');
}

if (etapesOk === 3) {
  if (avaitCRLF) {
    contenu = contenu.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10));
  }
  fs.writeFileSync(NOM_FICHIER, contenu, 'utf8');
  console.log('');
  console.log('SUCCES : 3/3 etapes reussies. Fichier sauvegarde.');
  console.log('Prochaine etape : git add, commit, push.');
} else {
  console.log('');
  console.log('ATTENTION : seulement ' + etapesOk + '/3 etapes reussies. Rien n a ete sauvegarde.');
}
