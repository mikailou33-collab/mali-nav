const fs=require('fs');
var html=fs.readFileSync('index.html','utf8');
var splash=`<div id="splash" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0A1628;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity 1s">
<div style="font-size:80px;margin-bottom:10px">🗺️</div>
<div style="font-size:36px;font-weight:900;color:#F5A623;letter-spacing:2px">Mali<span style="color:white">Nav</span></div>
<div style="width:60px;height:4px;background:linear-gradient(to right,#14B53A,#F5A623,#CE1126);border-radius:2px;margin:12px 0"></div>
<div style="font-size:14px;color:rgba(255,255,255,0.7);text-align:center;padding:0 40px">Tout le Mali dans votre main</div>
<div style="margin-top:30px;width:40px;height:40px;border:3px solid #F5A623;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>
</div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script>setTimeout(function(){var s=document.getElementById('splash');s.style.opacity='0';setTimeout(function(){s.style.display='none'},1000)},2500);</script>`;
html=html.replace('<body>','<body>'+splash);
fs.writeFileSync('index.html',html);
console.log('OK fait');