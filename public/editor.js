window.fujiCopy = {};
window.copy = (key, fallback) => window.fujiCopy[key] ?? fallback;
const groups = [
 ['home','Opening & navigation',()=>[...document.querySelectorAll('header .brand,header .header-note,#skip,.intro .eyebrow,.intro h1,.slice-label,[data-phase],.credits')]],
 ...['origin','grown','journey','buy','care'].map((id,i)=>[id,['Origin & flavor','Growing regions','Sourcing & journey','Where to buy','Choosing & storing'][i],()=>[document.getElementById('content-'+id).content]])
];
const records = [];
for(const [group,title,getRoots] of groups){
 let index=0;
 for(const container of getRoots()){
  const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
  let node;
  while(node=walker.nextNode()){
   if(!node.textContent.trim() || /^[↗↑↓✕\d\s/]+$/.test(node.textContent))continue;
   records.push({group,key:`${group}.${index++}`,node,original:node.textContent,label:node.parentElement?.tagName==='H1'?'Main heading':node.parentElement?.tagName?.match(/^H[23]$/)?'Heading':'Text'});
  }
 }
}
const dynamic=[['instruction.whole','Scroll to peel it back.'],['instruction.peel','Keep scrolling. The story opens up.'],['instruction.sliced','Choose a slice to look inside.'],['status.0','A JAPANESE ORIGINAL'],['status.1','THERE’S MORE BENEATH THE SURFACE'],['status.2','FIVE SLICES. FIVE STORIES.']];
for(const [key,original] of dynamic)records.push({group:'home',key,original,label:'Animation caption'});
const ready=fetch('content.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Could not load saved wording');return r.json()}).then(data=>{
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid saved wording');
 window.fujiCopy=Object.fromEntries(Object.entries(data).filter(([k,v])=>typeof v==='string'));
 for(const r of records)if(r.node)r.node.textContent=copy(r.key,r.original);
 if(typeof paint==='function'){phase=-1;paint()}
}).catch(error=>{window.fujiLoadError=error.message;});
if(location.hostname==='127.0.0.1'){
 const button=document.createElement('button');button.className='edit-launch';button.textContent='✎ Edit wording';document.body.append(button);
 const editor=document.createElement('dialog');editor.id='word-editor';editor.setAttribute('aria-labelledby','editor-title');
 editor.innerHTML='<div class="dialog-top"><strong id="editor-title">EDIT YOUR SITE</strong><button type="button" id="editor-close" aria-label="Close editor">✕</button></div><div class="editor-body"><p>Change the text below. Save changes updates the website files on this computer.</p><label for="edit-section">Section</label><select id="edit-section"></select><div id="edit-fields"></div></div><div class="editor-footer"><span id="edit-status" role="status"></span><button type="button" id="edit-save">Save changes</button></div>';
 document.body.append(editor);
 const select=editor.querySelector('select'),fields=editor.querySelector('#edit-fields'),status=editor.querySelector('#edit-status'),save=editor.querySelector('#edit-save');
 let draft={},dirty=false;
 for(const [id,title] of groups){const option=document.createElement('option');option.value=id;option.textContent=title;select.append(option)}
 function renderFields(){fields.replaceChildren();for(const r of records.filter(r=>r.group===select.value)){
  const label=document.createElement('label');label.textContent=r.label;const input=document.createElement('textarea');input.value=draft[r.key]??r.original;input.rows=input.value.length>130?4:2;
  input.addEventListener('input',()=>{draft[r.key]=input.value;dirty=true;status.textContent='Unsaved changes';});label.append(input);fields.append(label);
 }}
 select.addEventListener('change',renderFields);
 button.addEventListener('click',async()=>{await ready;draft={...fujiCopy};dirty=false;renderFields();status.textContent=window.fujiLoadError||'';save.disabled=!!window.fujiLoadError;editor.showModal()});
 function closeEditor(){if(!dirty||confirm('Discard your unsaved wording changes?'))editor.close()}
 editor.querySelector('#editor-close').addEventListener('click',closeEditor);
 editor.addEventListener('cancel',e=>{e.preventDefault();closeEditor()});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
 save.addEventListener('click',async()=>{save.disabled=true;status.textContent='Saving…';try{
  const response=await fetch('/api/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
  if(!response.ok)throw Error('Could not save. Keep this window open and try again.');
  dirty=false;status.textContent='Saved';location.reload();
 }catch(error){status.textContent=error.message;save.disabled=false}});
}
