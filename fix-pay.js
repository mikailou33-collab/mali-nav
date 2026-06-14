const fs = require('fs');
let h = fs.readFileSync('mali-nav-lite.html', 'utf8');

h = h.replace(
  "['orange','wave','moov','cash'].forEach(function(x){document.getElementById('mp-'+x).className='m-pay-btn';});",
  "['orange','wave','moov'].forEach(function(x){var el=document.getElementById('mp-'+x);if(el)el.className='m-pay-btn';});"
);

fs.writeFileSync('mali-nav-lite.html', h, 'utf8');
console.log('OK');