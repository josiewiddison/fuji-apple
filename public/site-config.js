const homeSelectors={brand:'header .brand',strap:'.header-note',eyebrow:'.intro .eyebrow',explore:'#skip',credits:'.credits'};
function applySite(doc){
 window.fujiCopy=doc.copy||{};
 for(const [key,selector] of Object.entries(homeSelectors)){const el=document.querySelector(selector);if(el&&typeof doc.home?.[key]==='string')el.textContent=doc.home[key]}
 const heading=document.querySelector('h1');heading.replaceChildren(document.createTextNode(doc.home.heading),document.createElement('br'));const em=document.createElement('em');em.textContent=doc.home.accentHeading;heading.append(em);
 const t=doc.theme,l=doc.layout;
 for(const [k,v] of Object.entries({bg:t.background,ink:t.text,lime:t.accent,muted:t.muted}))if(/^#[0-9a-f]{6}$/i.test(v))root.style.setProperty('--'+k,v);
 const fonts=['DM Sans','Arial','Georgia','Barlow Condensed','Impact'];
 if(fonts.includes(t.font))document.body.style.fontFamily=`"${t.font}",sans-serif`;
 if(fonts.includes(t.headingFont))document.documentElement.style.setProperty("--heading-font",t.headingFont);
 if(fonts.includes(t.headingFont))heading.style.fontFamily=`"${t.headingFont}",sans-serif`;
 document.body.style.fontSize=Math.max(14,Math.min(24,Number(l.textSize)||16))+'px';
 const stage=document.querySelector('.apple-stage');stage.style.width=`min(${Math.min(100,Math.max(35,l.appleSize))}svh,95vw)`;stage.style.height=stage.style.width;stage.style.left=Math.min(80,Math.max(20,l.appleX))+'%';stage.style.top=Math.min(75,Math.max(30,l.appleY))+'%';
 heading.style.fontSize=`clamp(28px,5vw,${Math.min(100,Math.max(28,l.headingSize))}px)`;
 dialog.style.width=`min(${Math.min(1000,Math.max(360,l.panelWidth))}px,92vw)`;dialog.style.borderRadius=Math.min(50,Math.max(0,t.radius))+'px';if(/^#[0-9a-f]{6}$/i.test(t.panel))dialog.style.background=t.panel;
 experience.style.height=Math.min(600,Math.max(180,doc.animation.scrollLength))+'svh';window.fujiAnimationEnabled=doc.animation.enabled;
 const safeImage=v=>typeof v==='string'&&/^\/(?:media\/[a-z0-9-]+|(?:fuji|peeled|sliced)\.png)$/.test(v);
 if(safeImage(doc.images.whole))document.querySelector('.whole').src=doc.images.whole;
 if(safeImage(doc.images.peeled))document.querySelector('.peeled').src=doc.images.peeled;
 if(safeImage(doc.images.sliced))document.querySelectorAll('.slice-art').forEach(el=>el.style.backgroundImage=`url("${doc.images.sliced}")`);
 doc.sections.forEach((section,i)=>{
  const target=document.getElementById('content-'+topics[i]);target.content.replaceChildren();
  for(const block of section.blocks){const el=document.createElement(block.type==='heading'?'h3':block.type==='link'?'a':'p');el.textContent=block.text;if(block.type==='link'){if(!/^https:\/\//.test(block.url||''))continue;el.href=block.url;el.target='_blank';el.rel='noopener';el.style.display='block';el.style.marginBottom='16px'}target.content.append(el)}
  const button=document.querySelector(`[data-topic="${topics[i]}"]`);button.hidden=!section.visible;const label=button.querySelector('.slice-label');label.replaceChildren();const small=document.createElement('small');small.textContent=`0${i+1}`;label.append(small,document.createTextNode(section.title));button.setAttribute('aria-label',section.title);names[i]=section.title.toUpperCase();
 });
 phase=-1;paint();
 if(dialog.open)showTopic(current);
}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;if(event.data?.type==='fuji-preview')applySite(event.data.document);if(event.data?.type==='fuji-phase')goToPhase(event.data.phase)});
if(parent===window)fetch('/api/site',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(applySite).catch(()=>{const notice=document.createElement('p');notice.textContent='Saved settings are temporarily unavailable. Please refresh shortly.';notice.className='no-script';document.body.append(notice)});
if(parent!==window)parent.postMessage({type:'fuji-ready'},location.origin);
