import fs from 'node:fs';
import path from 'node:path';
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const assets={};for(const name of fs.readdirSync('public'))if(fs.statSync(path.join('public',name)).isFile())assets['/'+name]=fs.readFileSync(path.join('public',name)).toString('base64');
fs.writeFileSync('dist/server/assets.js','export default '+JSON.stringify(assets)+';');
fs.copyFileSync('src/worker.js','dist/server/index.js');fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built Fuji Studio with embedded website assets and online document storage.');
