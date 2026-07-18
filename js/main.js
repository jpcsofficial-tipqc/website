document.addEventListener('DOMContentLoaded', () => {

  // Dark mode toggle --------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const applyIcon = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    applyIcon();
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('jpcs-theme', next); } catch (e) {}
      applyIcon();
    });
  }

  // Mobile nav toggle ---------------------------------------------------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scrollable galleries: arrow buttons + arrow-key support --------------
  document.querySelectorAll('.gallery-wrap').forEach(wrap => {
    const track = wrap.querySelector('.gallery-track');
    const leftBtn = wrap.querySelector('.gallery-arrow.left');
    const rightBtn = wrap.querySelector('.gallery-arrow.right');
    if (!track) return;

    const step = () => Math.max(track.clientWidth * 0.8, 240);

    if (leftBtn) leftBtn.addEventListener('click', () => {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (rightBtn) rightBtn.addEventListener('click', () => {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        track.scrollBy({ left: step(), behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
        e.preventDefault();
      }
    });
  });

  // Reveal-on-scroll ------------------------------------------------------
  const revealSelectors = '.cartridge, .section-head, .stat, .org-spotlight, .cta-banner, .gallery-wrap, .award-chips';
  const revealEls = Array.from(document.querySelectorAll(revealSelectors))
    .filter(el => !el.closest('.gallery-track')); // don't hide items inside a carousel

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  }

  // Lightbox for clickable images ------------------------------------------
  const lightboxImgs = document.querySelectorAll('img[data-lightbox]');
  if (lightboxImgs.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close image preview">&times;</button>
      <img class="lightbox-img" src="" alt="">
    `;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    let lastFocused = null;

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      lastFocused = document.activeElement;
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    lightboxImgs.forEach(img => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'View larger image: ' + (img.alt || ''));
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img.src, img.alt);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }
});
