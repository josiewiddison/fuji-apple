import assets from './assets.js';
const headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const fail=(message,status)=>json({error:message},status);
function file(path){const encoded=assets[path];if(!encoded)return fail('Not found',404);const ext=path.split('.').pop();return new Response(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{headers:{'Content-Type':({html:'text/html; charset=utf-8',js:'text/javascript',css:'text/css',json:'application/json',png:'image/png'})[ext]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}})}
function validDoc(d){return d&&d.version===1&&typeof d.copy==='object'&&d.copy&&!Array.isArray(d.copy)&&Object.values(d.copy).every(v=>typeof v==='string')&&Array.isArray(d.sections)&&d.sections.length===5&&d.sections.every(s=>typeof s.title==='string'&&typeof s.visible==='boolean'&&Array.isArray(s.blocks)&&s.blocks.length<100&&s.blocks.every(b=>['heading','paragraph','link'].includes(b.type)&&typeof b.text==='string'&&(!b.url||/^(https:\/\/|\/media\/)/.test(b.url))))&&d.theme&&d.images&&d.layout&&d.animation;}
export default {async fetch(request,env){try{
 const url=new URL(request.url),p=url.pathname;
 const owner=!!env.OWNER_EMAIL&&!!request.headers.get('oai-authenticated-user-id')&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.OWNER_EMAIL.toLowerCase();
 const protectedRoute=p.startsWith('/api/admin/')||p==='/admin'||p==='/admin.html';
 if(protectedRoute&&!owner){if(p.startsWith('/api/'))return fail('Sign in with the site owner account to edit.',403);if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);return new Response('Only the site owner can edit this website.',{status:403});}
 if(p==='/api/site'){const saved=await env.BUCKET.get('site/live.json');return saved?new Response(saved.body,{headers}):file('/default.json');}
 if(p==='/api/admin/draft'&&request.method==='GET'){const saved=await env.BUCKET.get('site/draft.json');if(saved)return new Response(saved.body,{headers});const live=await env.BUCKET.get('site/live.json');return live?new Response(live.body,{headers}):file('/default.json');}
 if(p.startsWith('/api/admin/')&&request.method!=='GET'){
  if(request.headers.get('Origin')!==url.origin)return fail('Invalid request origin',403);
  if(p==='/api/admin/upload'&&request.method==='POST'){
   const type=request.headers.get('Content-Type');if(!['image/png','image/jpeg','image/webp'].includes(type))return fail('Choose a PNG, JPG or WebP image.',400);
   const bytes=await request.arrayBuffer();if(bytes.byteLength>8*1024*1024)return fail('Images must be under 8 MB.',413);
   const b=new Uint8Array(bytes);const valid=type==='image/png'?b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71:type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(!valid)return fail('This is not a supported image.',400);
   const key='media/'+crypto.randomUUID();await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});return json({url:'/'+key});
  }
  if((p==='/api/admin/draft'||p==='/api/admin/publish')&&request.method==='POST'){
   const body=await request.text();if(body.length>400000)return fail('Site content is too large.',413);let doc;try{doc=JSON.parse(body)}catch{return fail('Invalid document',400)}if(!validDoc(doc))return fail('Invalid website settings',400);
   doc.updatedAt=new Date().toISOString();const text=JSON.stringify(doc);
   await env.BUCKET.put('site/draft.json',text,{httpMetadata:{contentType:'application/json'}});
   if(p.endsWith('/publish')){await env.BUCKET.put('site/live.json',text,{httpMetadata:{contentType:'application/json'}})}return json({saved:true,published:p.endsWith('/publish'),updatedAt:doc.updatedAt});
  }
  return fail('Not found',404);
 }
 if(p.startsWith('/media/')){const object=await env.BUCKET.get(p.slice(1));if(!object)return fail('Image not found',404);return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=31536000,immutable'}})}
 if(!['GET','HEAD'].includes(request.method))return fail('Method not allowed',405);
 return file(p==='/admin'?'/admin.html':p==='/'?'/index.html':p);
 }catch(error){console.error('Fuji storage/request error',error);return fail('The website service is temporarily unavailable. Your unsaved changes are still in the editor.',503)}}};
