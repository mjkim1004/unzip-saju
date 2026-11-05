import fs from 'node:fs';
const script=name=>fs.readFileSync(name,'utf8').replaceAll('</script','<\\/script');
const html=fs.readFileSync('src/template.html','utf8').replace('/*STYLE*/',()=>fs.readFileSync('src/style.css','utf8')).replace('/*CALENDAR*/',()=>fs.readFileSync('src/calendar.json','utf8')).replace('/*ENGINE*/',()=>script('src/engine.js')).replace('/*APP*/',()=>script('src/app.js'));
fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/index.html',html);console.log(`Built standalone index.html (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
