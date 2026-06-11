const fs=require('fs');
var c=fs.readFileSync('region-kayes-v2.html','utf8');
var svgStart=c.indexOf('<svg class="map-svg"');
var svgEnd=c.indexOf('</svg>',svgStart)+6;
var iframe='<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-12.5,11.0,-7.5,15.5&layer=mapnik" style="width:100%;height:100%;border:none;min-height:400px;" allowfullscreen loading="lazy"></iframe>';
c=c.slice(0,svgStart)+iframe+c.slice(svgEnd);
fs.writeFileSync('region-kayes-v2.html',c);
console.log('OK');