const fs = require('fs');
const path = require('path');

// Tous les fichiers région
const fichiers = [
  'region-segou.html','region-mopti.html','region-gao.html','region-kidal.html',
  'region-taoudenit.html','region-menaka.html','region-douentza.html',
  'region-nara.html','region-kita.html','region-nioro.html',
  'region-bougouni.html','region-koutiala.html','region-san.html',
  'region-kayes-v2.html','region-koulikoro-v2.html','region-sikasso-v2.html',
  'region-bandiagara-v2.html','region-dioila-v2.html','region-tombouctou-v2.html',
  'district-bamako-v2.html'
];

const ancien = '">❌ Annuler ma réservation</button>';
const nouveau = `"><input id="code-annul-reg" placeholder="Ex: BUS-ABC123" style="width:100%;padding:10px;border:2px solid #e4e7ec;border-radius:8px;font-family:inherit;font-size:13px;outline:none;margin-bottom:8px"/><button onclick="annulerBilletReg()" style="background:#dc2626;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;width:100%">❌ Annuler mon billet</button>`;

let total = 0;
fichiers.forEach(function(f){
  if(!fs.existsSync(f)){ console.log('MANQUE:', f); return; }
  let h = fs.readFileSync(f, 'utf8');
  if(h.includes('Annuler ma réservation')){
    h = h.replace(ancien, nouveau);
    // Ajouter fonction annulerBilletReg si pas là
    if(!h.includes('function annulerBilletReg')){
      const code = `\n<script>\nfunction annulerBilletReg(){\n  var c=document.getElementById('code-annul-reg');\n  if(!c||!c.value.trim()){alert('Entrez votre code de réservation');return;}\n  var msg=encodeURIComponent('❌ Annulation Mali Nav\\n\\nCode: '+c.value.trim()+'\\n\\nJe souhaite annuler ma réservation.\\nMerci de traiter selon la politique d\\'annulation.');\n  window.open('https://wa.me/+22396551630019?text='+msg,'_blank');\n}\n</script>`;
      h = h.replace('</body>', code + '\n</body>');
    }
    fs.writeFileSync(f, h, 'utf8');
    total++;
    console.log('✅', f);
  }
});
console.log('Total modifié:', total);
