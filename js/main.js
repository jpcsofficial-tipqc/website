document.addEventListener('DOMContentLoaded', () => {

  // Dark mode toggle --------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const setIconFor = (isDark) => {
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    setIconFor(document.documentElement.getAttribute('data-theme') === 'dark');
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('jpcs-theme', next); } catch (e) {}
      themeToggle.classList.add('spin');
      window.setTimeout(() => setIconFor(next === 'dark'), 140);
      window.setTimeout(() => themeToggle.classList.remove('spin'), 420);
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

  // Scrollable galleries: arrow-key support --------------
  document.querySelectorAll('.gallery-track').forEach(track => {
    const step = () => Math.max(track.clientWidth * 0.8, 240);

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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // Grids: reveal children as a staggered cascade when the grid enters view
    const grids = Array.from(document.querySelectorAll('.grid')).filter(g => !g.closest('.gallery-track'));
    grids.forEach(grid => {
      const children = Array.from(grid.children);
      children.forEach((child, i) => {
        child.classList.add('reveal-child');
        child.style.setProperty('--stagger-i', i);
      });
    });

    const gridIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Array.from(entry.target.children).forEach(child => child.classList.add('is-visible'));
          gridIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    grids.forEach(grid => gridIO.observe(grid));

    // Standalone elements: simple fade-up, one at a time as each scrolls into view
    const revealSelectors = '.section-head, .org-spotlight, .cta-banner, .gallery-wrap, .award-chips, .video-feature';
    const revealEls = Array.from(document.querySelectorAll(revealSelectors))
      .filter(el => !el.closest('.gallery-track') && !el.closest('.grid'));
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

  // Hero entrance: plays once immediately on load, no scroll trigger needed
  if (!prefersReducedMotion) {
    const hero = document.querySelector('.hero');
    if (hero) requestAnimationFrame(() => hero.classList.add('hero-in'));
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