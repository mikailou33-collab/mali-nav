const fs=require('fs');
var c=fs.readFileSync('region-tombouctou.html','utf8');
var svgStart=c.indexOf('<svg width="100%"');
var svgEnd=c.indexOf('</svg>',svgStart)+6;
var iframe='<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-4.5,16.0,2.5,25.0&layer=mapnik" style="width:100%;height:100%;border:none;min-height:400px;" allowfullscreen loading="lazy"></iframe>';
c=c.slice(0,svgStart)+iframe+c.slice(svgEnd);
fs.writeFileSync('region-tombouctou.html',c);
console.log('OK fait');