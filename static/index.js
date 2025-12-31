document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  // Tam sayfa menü için kapatma butonu oluştur
  const closeMenuButton = document.createElement("div");
  closeMenuButton.className = "close-menu-btn";
  closeMenuButton.innerHTML = "&times;";
  closeMenuButton.style.position = "absolute";
  closeMenuButton.style.top = "20px";
  closeMenuButton.style.right = "20px";
  closeMenuButton.style.fontSize = "30px";
  closeMenuButton.style.cursor = "pointer";
  closeMenuButton.style.zIndex = "200";
  closeMenuButton.style.display = "none";
  document.body.appendChild(closeMenuButton);

  // Kapatma butonuna tıklama olayı ekle
  closeMenuButton.addEventListener("click", function () {
    navLinks.classList.remove("active");
    closeMenuButton.style.display = "none";
  });

  // Hamburger menüsüne tıklama olayı
  if (hamburger) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      navLinks.classList.add("active");
      closeMenuButton.style.display = "block";
    });
  }

  // Sayfa dışına tıklanınca menüler kapanacak
  document.addEventListener("click", function (event) {
    if (
        navLinks.classList.contains("active") &&
        !navLinks.contains(event.target) &&
        event.target !== hamburger
    ) {
      navLinks.classList.remove("active");
      closeMenuButton.style.display = "none";
    }
  });

  // Rastgele hover rengi işlevi
  const categoryItems = document.querySelectorAll(".sidebar .content");

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  }

  categoryItems.forEach((item) => {
    const originalBackground = window.getComputedStyle(item).backgroundColor;
    const link = item.querySelector("a");
    const originalLinkColor = window.getComputedStyle(link).color;

    item.addEventListener("mouseenter", function () {
      const randomColor = getRandomColor();
      item.style.backgroundColor = randomColor;

      const hex = randomColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      if (r * 0.299 + g * 0.587 + b * 0.114 < 150) link.style.color = "#FFFFFF";
      else link.style.color = "#000000";
    });

    item.addEventListener("mouseleave", function () {
      item.style.backgroundColor = originalBackground;
      link.style.color = originalLinkColor;
    });
  });

  // =========================
  // DEVIL EYES (2D CLAMP FOLLOW)
  // =========================
  const devilWrap = document.querySelector(".devil-wrap");
  const devilImg = document.querySelector(".devil-img");
  const pupilL = document.querySelector(".pupil-l");
  const pupilR = document.querySelector(".pupil-r");

  function readCSSNumber(el, varName, fallback) {
    const v = getComputedStyle(el).getPropertyValue(varName).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // Göz merkezini (img üstünde yüzde) -> wrap içi pixel koordinata çevir
  function getEyeOnWrap(varNameX, varNameY) {
    const styles = getComputedStyle(devilWrap);
    const wrapRect = devilWrap.getBoundingClientRect();
    const imgRect = devilImg.getBoundingClientRect();

    const pctX = parseFloat(styles.getPropertyValue(varNameX)) / 100;
    const pctY = parseFloat(styles.getPropertyValue(varNameY)) / 100;

    const x = imgRect.left - wrapRect.left + pctX * imgRect.width -10;
    const y = imgRect.top - wrapRect.top + pctY * imgRect.height;
    return { x, y };
  }

  // Daire içinde clamp: pupil göz çukurundan çıkamaz
  function setPupilClamped(pupilEl, eyeCenter, target, eyeRadiusPx, followStrength) {
    const dx = target.x - eyeCenter.x;
    const dy = target.y - eyeCenter.y;

    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    // mesafeye göre oynaklık ama radius'u geçmesin
    const desired = Math.min(eyeRadiusPx, dist * followStrength);

    const x = eyeCenter.x + ux * desired;
    const y = eyeCenter.y + uy * desired;

    pupilEl.style.left = `${x}px`;
    pupilEl.style.top = `${y}px`;
  }

  if (devilWrap && devilImg && pupilL && pupilR) {
    let raf = null;
    let last = { x: 0, y: 0 };

    function update() {
      raf = null;

      const wrapRect = devilWrap.getBoundingClientRect();
      const imgRect = devilImg.getBoundingClientRect();

      // mouse'u wrap koordinatına çevir
      const target = {
        x: last.x - wrapRect.left,
        y: last.y - wrapRect.top,
      };

      const eyeL = getEyeOnWrap("--eyeLx", "--eyeLy");
      const eyeR = getEyeOnWrap("--eyeRx", "--eyeRy");

      // radius: img genişliğine göre (CSS yüzdesi)
      const rLPct = readCSSNumber(devilWrap, "--eyeLr", 1.15);
      const rRPct = readCSSNumber(devilWrap, "--eyeRr", 1.15);

      const eyeRadiusL = (rLPct / 100) * imgRect.width;
      const eyeRadiusR = (rRPct / 100) * imgRect.width;

      // takip gücü: 0.20-0.35 arası (çok oynak olursa düşür)
      const followStrength = 0.28;

      setPupilClamped(pupilL, eyeL, target, eyeRadiusL, followStrength);
      setPupilClamped(pupilR, eyeR, target, eyeRadiusR, followStrength);
    }

    function onMove(clientX, clientY) {
      last = { x: clientX, y: clientY };
      if (!raf) raf = requestAnimationFrame(update);
    }

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener(
        "touchmove",
        (e) => {
          const t = e.touches && e.touches[0];
          if (t) onMove(t.clientX, t.clientY);
        },
        { passive: true }
    );

    // Mouse sayfadan çıkınca gözleri merkeze döndür
    document.addEventListener("mouseleave", () => {
      const eyeL = getEyeOnWrap("--eyeLx", "--eyeLy");
      const eyeR = getEyeOnWrap("--eyeRx", "--eyeRy");
      pupilL.style.left = `${eyeL.x}px`;
      pupilL.style.top = `${eyeL.y}px`;
      pupilR.style.left = `${eyeR.x}px`;
      pupilR.style.top = `${eyeR.y}px`;
    });

    // İlk konum
    document.dispatchEvent(new Event("mouseleave"));
  }
  window.addEventListener("load", () => {
    const intro = document.getElementById("intro-overlay");
    if (!intro) return;

    // Keep the white loading screen for ~1–2 seconds, then fade out smoothly.
    const SHOW_MS = 1600;
    const FADE_MS = 520; // must match CSS @keyframes introFade duration

    setTimeout(() => {
      intro.classList.add("out");
      setTimeout(() => intro.remove(), FADE_MS + 60);
    }, SHOW_MS);
  });

});
