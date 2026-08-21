const $ = s => document.querySelector(s);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

document.querySelectorAll('.disabled').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    toast(`${el.dataset.label || '이 기능'} 링크를 관리자에서 추가하면 활성화됩니다.`);
  });
});

$('#shareBtn')?.addEventListener('click', async () => {
  const data = {
    title: '신이준 | SHINeJOON',
    text: '신이준 디지털 명함',
    url: location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(location.href);
      toast('명함 주소를 복사했습니다.');
    }
  } catch (e) {}
});


/* =========================
   LOCAL PROFILE
========================= */

const saved = JSON.parse(
  localStorage.getItem('shinejoonCard') || '{}'
);

if (saved.name) $('#displayName').textContent = saved.name;
if (saved.subname) $('#displaySubName').textContent = saved.subname;
if (saved.bio) $('#displayBio').textContent = saved.bio;
if (saved.about) $('#aboutText').textContent = saved.about;


/* =========================
   SUPABASE PROFILE
========================= */

(async function loadSupabaseProfile() {

  const url =
    'https://rvhqsgrlrumjwnukapny.supabase.co';

  const key =
    'sb_publishable_0qcdqSbgpRgYqSSlIwPpVA_wckk7bKY';

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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rows = await response.json();

    if (!rows.length) {
      throw new Error('No profile data');
    }

    const p = rows[0];

    if (p.name && $('#displayName')) {
      $('#displayName').textContent = p.name;
    }

    if (p.bio && $('#displayBio')) {
      $('#displayBio').textContent = p.bio;
    }

    if (p.about && $('#aboutText')) {
      $('#aboutText').textContent = p.about;
    }

    const quick = document.querySelectorAll('.quick');

    if (p.phone && quick.length >= 2) {

      const phone =
        p.phone.replace(/[^0-9+]/g, '');

      quick[0].href = `tel:${phone}`;
      quick[1].href = `sms:${phone}`;
    }

    if (p.email && quick[2]) {
      quick[2].href = `mailto:${p.email}`;
    }

    if (p.instagram && quick[3]) {
      quick[3].href = p.instagram;
    }

    const map =
      document.querySelector(
        'a[href*="google.com/maps/search"]'
      );

    if (map && p.address) {

      map.href =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;

      const addressText =
        map.querySelector('small');

      if (addressText) {
        addressText.textContent = p.address;
      }
    }

    console.log(
      'Supabase profile loaded',
      p
    );

  } catch (error) {

    console.error(
      'Supabase connection failed:',
      error
    );
  }

})();


/* =========================
   SUPABASE GALLERY
========================= */

async function loadGalleryFromStorage() {

  const url =
    'https://rvhqsgrlrumjwnukapny.supabase.co';

  const key =
    'sb_publishable_0qcdqSbgpRgYqSSlIwPpVA_wckk7bKY';

  const galleryImage =
    document.getElementById('galleryImage');

  const prevBtn =
    document.querySelector('.gallery-prev');

  const nextBtn =
    document.querySelector('.gallery-next');

  const dotsBox =
    document.querySelector('.gallery-dots');

  const galleryFrame =
    document.querySelector('.gallery-frame');

  if (!galleryImage) return;


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
      throw new Error(
        `Gallery Storage load failed: ${response.status}`
      );
    }


    const files =
      await response.json();


    const images =
      files.filter(file =>
        /\.(jpg|jpeg|png|webp|gif)$/i.test(
          file.name
        )
      );


    if (!images.length) {
      console.log(
        'No gallery images found'
      );
      return;
    }


    const imageUrls =
      images.map(file =>
        `${url}/storage/v1/object/public/gallery/${encodeURIComponent(file.name)}`
      );


    let currentIndex = 0;


    function renderDots() {

      if (!dotsBox) return;

      dotsBox.innerHTML = '';

      imageUrls.forEach((_, index) => {

        const dot =
          document.createElement('span');

        dot.className =
          index === currentIndex
            ? 'dot active'
            : 'dot';

        dot.addEventListener(
          'click',
          () => {
            showImage(index);
          }
        );

        dotsBox.appendChild(dot);
      });
    }


    function showImage(index) {

      if (!imageUrls.length) return;

      currentIndex =
        (index + imageUrls.length) %
        imageUrls.length;

      galleryImage.src =
        imageUrls[currentIndex];

      renderDots();
    }


    function showPrevious() {
      showImage(currentIndex - 1);
    }


    function showNext() {
      showImage(currentIndex + 1);
    }


    /* LEFT / RIGHT BUTTONS */

    if (prevBtn) {

      prevBtn.addEventListener(
        'click',
        event => {

          event.preventDefault();
          event.stopPropagation();

          showPrevious();
        }
      );
    }


    if (nextBtn) {

      nextBtn.addEventListener(
        'click',
        event => {

          event.preventDefault();
          event.stopPropagation();

          showNext();
        }
      );
    }


    /* =========================
       TOUCH SWIPE
       iPhone / Android
    ========================= */

    let touchStartX = 0;
    let touchStartY = 0;


    if (galleryFrame) {

      galleryFrame.addEventListener(
        'touchstart',
        event => {

          if (!event.touches.length) return;

          touchStartX =
            event.touches[0].clientX;

          touchStartY =
            event.touches[0].clientY;

        },
        { passive: true }
      );


      galleryFrame.addEventListener(
        'touchend',
        event => {

          if (!event.changedTouches.length) {
            return;
          }

          const touchEndX =
            event.changedTouches[0].clientX;

          const touchEndY =
            event.changedTouches[0].clientY;


          const diffX =
            touchEndX - touchStartX;

          const diffY =
            touchEndY - touchStartY;


          /*
           * 세로 스크롤보다
           * 가로 움직임이 큰 경우에만
           * 갤러리 스와이프로 처리
           */

          if (
            Math.abs(diffX) >
              Math.abs(diffY) &&
            Math.abs(diffX) > 35
          ) {

            if (diffX < 0) {
              showNext();
            } else {
              showPrevious();
            }
          }

        },
        { passive: true }
      );
    }


    /* =========================
       POINTER SWIPE
       Android / Desktop
    ========================= */

    let pointerStartX = null;


    if (
      galleryFrame &&
      window.PointerEvent
    ) {

      galleryFrame.addEventListener(
        'pointerdown',
        event => {

          pointerStartX =
            event.clientX;
        }
      );


      galleryFrame.addEventListener(
        'pointerup',
        event => {

          if (pointerStartX === null) {
            return;
          }

          const diff =
            event.clientX -
            pointerStartX;

          pointerStartX = null;


          if (Math.abs(diff) < 35) {
            return;
          }


          if (diff < 0) {
            showNext();
          } else {
            showPrevious();
          }
        }
      );
    }


    /*
     * 첫 번째 사진 표시
     */

    showImage(0);


    console.log(
      `Gallery loaded: ${imageUrls.length} images`
    );


  } catch (error) {

    console.error(
      'Gallery Storage load failed:',
      error
    );
  }
}


loadGalleryFromStorage();
