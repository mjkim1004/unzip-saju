import http from 'node:http';import fs from 'node:fs';
const server=http.createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
