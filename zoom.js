const fs=require('fs');
var c=fs.readFileSync('region-tombouctou.html','utf8');
var newMap='<div class="map-wrap"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-4.5,16.0,2.5,25.0&layer=mapnik" style="width:100%;height:100%;border:none;" allowfullscreen loading="lazy"></iframe></div>';
var start=c.indexOf('<div class="map-wrap">');
var end=c.indexOf('</div>',start)+6;
c=c.slice(0,start)+newMap+c.slice(end);
fs.writeFileSync('region-tombouctou.html',c);
console.log('OK fait');