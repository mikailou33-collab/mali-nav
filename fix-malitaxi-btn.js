const fs = require('fs');
let h = fs.readFileSync('mali-nav-lite.html', 'utf8');

h = h.replace(
  '<button class="quick-btn" onclick="partager()"><span class="quick-ico">📤</span><span class="quick-lbl">Partager</span></button>',
  '<button class="quick-btn" onclick="window.open(\'https://mikailou33-collab.github.io/malitaxi-vip/malitaxi-lite-new.html\',\'_blank\')" style="background:linear-gradient(135deg,#F5A623,#e8920f);border-radius:12px"><span class="quick-ico">🚖</span><span class="quick-lbl" style="color:#fff;font-weight:900">MaliTaxi</span></button>'
);

fs.writeFileSync('mali-nav-lite.html', h, 'utf8');
console.log('OK');
console.log('MaliTaxi btn:', h.includes('malitaxi-lite-new'));