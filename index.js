document.addEventListener('DOMContentLoaded', function() {
  const tickerWrapper = document.querySelector('.ticker-wrapper');
  const tickerContent = document.querySelector('.ticker-content');
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  // Tam sayfa menü için kapatma butonu oluştur
  const closeMenuButton = document.createElement('div');
  closeMenuButton.className = 'close-menu-btn';
  closeMenuButton.innerHTML = '&times;';
  closeMenuButton.style.position = 'absolute';
  closeMenuButton.style.top = '20px';
  closeMenuButton.style.right = '20px';
  closeMenuButton.style.fontSize = '30px';
  closeMenuButton.style.cursor = 'pointer';
  closeMenuButton.style.zIndex = '200';
  closeMenuButton.style.display = 'none';
  document.body.appendChild(closeMenuButton);
  
  // Kapatma butonuna tıklama olayı ekle
  closeMenuButton.addEventListener('click', function() {
    navLinks.classList.remove('active');
    closeMenuButton.style.display = 'none';
  });

  // Ticker içeriğini oluştur
  const news = [
      "Son Dakika: Yeni makaleler yayınlandı!",
      "Kategoride yeni içerikler eklendi",
      "Yenilikler hakkında daha fazla bilgi için iletişime geçin",
      "Zeki İnceoğlu'nun yeni kitabı yakında çıkıyor",
      "Özel içerikler için bültenimize abone olun",
      "Web sitemiz yenilendi! Yeni özellikler keşfedin"
  ];

  function createTickerContent() {
      tickerContent.innerHTML = '';
      const allNews = [...news, ...news];

      allNews.forEach((item, index) => {
          const newsSpan = document.createElement('span');
          newsSpan.className = 'news-item';
          newsSpan.textContent = item;
          tickerContent.appendChild(newsSpan);

          if (index < allNews.length - 1) {
              const separator = document.createElement('span');
              separator.className = 'news-separator';
              separator.innerHTML = ' &bull; ';
              tickerContent.appendChild(separator);
          }
      });
  }
  
  createTickerContent();

  // Hamburger menüsüne tıklama olayı
  if (hamburger) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation(); // Sayfa tıklamasının menüyü hemen kapatmasını önle
      
      // Sadece ana sayfa menüsünü aç, sidebar'ı açma
      navLinks.classList.add('active');
      closeMenuButton.style.display = 'block';
    });
  }

  // Sayfa dışına tıklanınca menüler kapanacak
  document.addEventListener('click', function(event) {
    // Menü açıksa ve tıklama menü dışına veya hamburger dışına yapıldıysa
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(event.target) && 
        event.target !== hamburger) {
      navLinks.classList.remove('active');
      closeMenuButton.style.display = 'none';
    }
  });

  // Ticker üzerine gelindiğinde animasyonu durdur
  if (tickerWrapper) {
    tickerWrapper.addEventListener('mouseenter', function() {
      tickerContent.style.color = 'rgb(234, 239, 44)'; // Sarı renk
      tickerContent.style.animationPlayState = 'paused';
    });

    tickerWrapper.addEventListener('mouseleave', function() {
      tickerContent.style.color = '#ffffff'; // Beyaz renk
      tickerContent.style.animationPlayState = 'running';
    });
  }

  // Rastgele hover rengi işlevi
  const categoryItems = document.querySelectorAll('.sidebar .content');
  
  // Rastgele renk oluştur
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  // Her bir kategoriye olay dinleyicileri ekle
  categoryItems.forEach(item => {
    // Orijinal arka plan rengini sakla
    const originalBackground = window.getComputedStyle(item).backgroundColor;
    const link = item.querySelector('a');
    const originalLinkColor = window.getComputedStyle(link).color;
    
    // Fare üzerine gelme olayı - rastgele renk
    item.addEventListener('mouseenter', function() {
      const randomColor = getRandomColor();
      item.style.backgroundColor = randomColor;
      
      // Arka plan parlaklığına göre metin siyah veya beyaz olsun
      const hex = randomColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Renk koyuysa metin beyaz olsun
      if ((r*0.299 + g*0.587 + b*0.114) < 150) {
        link.style.color = '#FFFFFF';
      } else {
        link.style.color = '#000000';
      }
    });
    
    // Fare ayrılma olayı - orijinal renkler
    item.addEventListener('mouseleave', function() {
      item.style.backgroundColor = originalBackground;
      link.style.color = originalLinkColor;
    });
  });

  // =========================
  // DEVIL EYES (FIXED + CLAMP)
  // =========================
  const devilWrap = document.querySelector('.devil-wrap');
  const devilImg  = document.querySelector('.devil-img');
  const pupilL = document.querySelector('.pupil-l');
  const pupilR = document.querySelector('.pupil-r');

  // CSS değişkenlerini okuma helper'ı
  function readCSSNumber(el, varName, fallback) {
    const v = getComputedStyle(el).getPropertyValue(varName).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // Göz merkezini (img üstünde yüzde) -> wrap içi pixel koordinata çevir
  function getEyeOnWrap(varNameX, varNameY) {
    const styles = getComputedStyle(devilWrap);
    const wrapRect = devilWrap.getBoundingClientRect();
    const imgRect  = devilImg.getBoundingClientRect();

    const pctX = parseFloat(styles.getPropertyValue(varNameX)) / 100;
    const pctY = parseFloat(styles.getPropertyValue(varNameY)) / 100;

    // image-relative point -> wrap-local
    const x = (imgRect.left - wrapRect.left) + pctX * imgRect.width;
    const y = (imgRect.top  - wrapRect.top ) + pctY * imgRect.height;
    return { x, y };
  }

  // Daire içinde clamp: pupil göz çukurundan çıkamaz
  function setPupilClamped(pupilEl, eyeCenter, target, eyeRadiusPx, followStrength) {
    const dx = target.x - eyeCenter.x;
    const dy = target.y - eyeCenter.y;

    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    // hedefe doğru giderken oynaklık: mesafeye göre büyür ama radius'u geçmez
    const desired = Math.min(eyeRadiusPx, dist * followStrength);

    const x = eyeCenter.x + ux * desired;
    const y = eyeCenter.y + uy * desired;

    pupilEl.style.left = `${x}px`;
    pupilEl.style.top  = `${y}px`;
  }

  if (devilWrap && devilImg && pupilL && pupilR) {
    let raf = null;
    let last = { x: 0, y: 0 };

    function update() {
      raf = null;

      const wrapRect = devilWrap.getBoundingClientRect();
      const imgRect  = devilImg.getBoundingClientRect();

      // mouse'u wrap koordinatına çevir
      const target = {
        x: last.x - wrapRect.left,
        y: last.y - wrapRect.top
      };

      // göz merkezleri (yüzdeyle)
      const eyeL = getEyeOnWrap('--eyeLx', '--eyeLy');
      const eyeR = getEyeOnWrap('--eyeRx', '--eyeRy');

      // radius'u otomatik ölçekle:
      // img genişliğine göre  (default ~ %3.2)
      const rLPct = readCSSNumber(devilWrap, '--eyeLr', 1.2); // yüzde
      const rRPct = readCSSNumber(devilWrap, '--eyeRr', 1.2); // yüzde

      const eyeRadiusL = (rLPct / 100) * imgRect.width;
      const eyeRadiusR = (rRPct / 100) * imgRect.width;

      // takip gücü (oynaklık): 0.18 iyi, taşarsa 0.15'e indir
      const followStrength = 0.28;

      setPupilClamped(pupilL, eyeL, target, eyeRadiusL, followStrength);
      setPupilClamped(pupilR, eyeR, target, eyeRadiusR, followStrength);
    }

    function onMove(clientX, clientY) {
      last = { x: clientX, y: clientY };
      if (!raf) raf = requestAnimationFrame(update);
    }

    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    }, { passive: true });

    // Mouse sayfadan çıkınca gözleri merkeze döndür
    document.addEventListener('mouseleave', () => {
      const eyeL = getEyeOnWrap('--eyeLx', '--eyeLy');
      const eyeR = getEyeOnWrap('--eyeRx', '--eyeRy');
      pupilL.style.left = `${eyeL.x}px`;
      pupilL.style.top  = `${eyeL.y}px`;
      pupilR.style.left = `${eyeR.x}px`;
      pupilR.style.top  = `${eyeR.y}px`;
    });

    // İlk konum
    document.dispatchEvent(new Event('mouseleave'));
  }

});
