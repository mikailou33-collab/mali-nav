const fs=require('fs');
const regions=[
  {f:'region-gao.html',bbox:'-0.5,14.5,3.5,18.5'},
  {f:'region-kidal.html',bbox:'0.5,17.0,3.5,21.0'},
  {f:'region-taoudenit.html',bbox:'-5.0,20.0,1.0,25.0'},
  {f:'region-kayes.html',bbox:'-12.5,11.0,-7.5,15.5'},
  {f:'region-koulikoro.html',bbox:'-8.5,11.5,-5.0,15.0'},
  {f:'region-sikasso.html',bbox:'-7.5,10.0,-4.0,12.5'},
  {f:'region-segou.html',bbox:'-7.0,12.0,-3.5,15.0'},
  {f:'region-mopti.html',bbox:'-4.5,13.0,-1.0,16.0'},
  {f:'region-menaka.html',bbox:'1.5,14.0,4.5,17.5'},
  {f:'region-bougouni.html',bbox:'-8.0,10.0,-5.0,12.5'},
  {f:'region-koutiala.html',bbox:'-6.0,11.0,-4.0,13.0'},
  {f:'region-san.html',bbox:'-5.5,12.5,-3.5,14.5'},
  {f:'region-douentza.html',bbox:'-3.5,14.0,-1.0,16.5'},
  {f:'region-kita.html',bbox:'-11.0,12.0,-8.0,14.5'},
  {f:'region-nioro.html',bbox:'-10.0,13.5,-7.5,16.0'},
  {f:'region-yanfolila.html',bbox:'-8.5,10.0,-6.0,12.0'},
  {f:'region-kolokani.html',bbox:'-8.0,12.5,-6.0,14.5'},
  {f:'region-niono.html',bbox:'-6.5,13.5,-4.5,15.5'},
  {f:'district-bamako.html',bbox:'-8.1,12.5,-7.8,12.7'}
];
regions.forEach(r=>{
  if(fs.existsSync(r.f)){
    var c=fs.readFileSync(r.f,'utf8');
    var svgStart=c.indexOf('<svg width="100%"');
    if(svgStart>-1){
      var svgEnd=c.indexOf('</svg>',svgStart)+6;
      var iframe='<iframe src="https://www.openstreetmap.org/export/embed.html?bbox='+r.bbox+'&layer=mapnik" style="width:100%;height:100%;border:none;min-height:400px;" allowfullscreen loading="lazy"></iframe>';
      c=c.slice(0,svgStart)+iframe+c.slice(svgEnd);
      fs.writeFileSync(r.f,c);
      console.log('OK '+r.f);
    }else{
      console.log('SVG pas trouve: '+r.f);
    }
  }
});