const $ = s => document.querySelector(s);
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
document.querySelectorAll('.disabled').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();toast(`${el.dataset.label||'이 기능'} 링크를 관리자에서 추가하면 활성화됩니다.`)}));
$('#shareBtn')?.addEventListener('click', async ()=>{
  const data={title:'신이준 | SHINeJOON',text:'신이준 디지털 명함',url:location.href};
  try{ if(navigator.share){await navigator.share(data)} else {await navigator.clipboard.writeText(location.href);toast('명함 주소를 복사했습니다.')} }catch(e){}
});
const saved = JSON.parse(localStorage.getItem('shinejoonCard')||'{}');
if(saved.name) $('#displayName').textContent=saved.name;
if(saved.subname) $('#displaySubName').textContent=saved.subname;
if(saved.bio) $('#displayBio').textContent=saved.bio;
if(saved.about) $('#aboutText').textContent=saved.about;
