const fs = require('fs');
let h = fs.readFileSync('region-sikasso-v2.html', 'utf8');

// Supprimer divs orphelins Bougouni et Koutiala
h = h.replace(/\s*<div class="lieu-dist">Bougouni<\/div>\s*<\/div>\s*<\/div>/g, '');
h = h.replace(/\s*<div class="lieu-dist">Koutiala<\/div>\s*<\/div>\s*<\/div>/g, '');
h = h.replace(/\s*<div class="lieu-dist">Bougouni<\/div>\s*<\/div>/g, '');
h = h.replace(/\s*<div class="lieu-dist">Koutiala<\/div>\s*<\/div>/g, '');

fs.writeFileSync('region-sikasso-v2.html', h, 'utf8');
console.log('OK taille:', h.length);
console.log('Bougouni:', h.includes('Bougouni'));
console.log('Koutiala:', h.includes('Koutiala'));