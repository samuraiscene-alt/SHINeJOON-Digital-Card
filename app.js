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
(async function loadSupabaseProfile() {
  const url = 'https://rvhqsgrlrumjwnukapny.supabase.co';
  const key = 'sb_publishable_0qcdqSbgpRgYqSSlIwPpVA_wckk7bKY';

  try {
    const response = await fetch(
      `${url}/rest/v1/profile?select=*&order=id.asc&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const rows = await response.json();
    if (!rows.length) throw new Error('No profile data');

    const p = rows[0];

    if (p.name) {
      document.querySelector('#displayName').textContent = p.name;
    }

    if (p.bio) {
      document.querySelector('#displayBio').textContent = p.bio;
    }

    if (p.about) {
      document.querySelector('#aboutText').textContent = p.about;
    }

    const quick = document.querySelectorAll('.quick');

    if (p.phone) {
      const phone = p.phone.replace(/[^0-9+]/g, '');
      quick[0].href = `tel:${phone}`;
      quick[1].href = `sms:${phone}`;
    }

    if (p.email) {
      quick[2].href = `mailto:${p.email}`;
    }

    if (p.instagram) {
      quick[3].href = p.instagram;
    }

    const map = document.querySelector('a[href*="google.com/maps/search"]');

    if (map && p.address) {
      map.href =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;

      const addressText = map.querySelector('small');
      if (addressText) addressText.textContent = p.address;
    }

    console.log('Supabase profile loaded', p);

  } catch (error) {
    console.error('Supabase connection failed:', error);
  }
})();
async function loadGalleryFromStorage() {
  const url = 'https://rvhqsgrlrumjwnukapny.supabase.co';
  const key = 'sb_publishable_0qcdqSbgpRgYqSSI1wPpVA_wckk7bKY';

  try {
    const response = await fetch(
      `${url}/storage/v1/object/list/gallery`,
      {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: '',
          limit: 100,
          offset: 0,
          sortBy: {
            column: 'created_at',
            order: 'desc'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gallery Storage load failed: ${response.status}`);
    }

    const files = await response.json();

    const images = files.filter(file =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    if (!images.length) return;

    const galleryImage = document.getElementById('galleryImage');
    if (!galleryImage) return;

    galleryImage.src =
      `${url}/storage/v1/object/public/gallery/${encodeURIComponent(images[0].name)}`;

  } catch (error) {
    console.error('Gallery Storage load failed:', error);
  }
}

loadGalleryFromStorage();
