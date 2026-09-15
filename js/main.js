document.addEventListener('DOMContentLoaded', () => {

  // Dark mode toggle --------------------------------------------------
  const ICON_MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>';
  const ICON_SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2.5 12h3M18.5 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>';

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const setIconFor = (isDark) => {
      themeToggle.innerHTML = isDark ? ICON_SUN : ICON_MOON;
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

  // Mobile nav — slide-over drawer ---------------------------------------
  const navToggle = document.querySelector('.nav-toggle');
  const navDrawer = document.getElementById('mobile-drawer');
  const drawerScrim = document.getElementById('drawer-scrim');
  if (navToggle && navDrawer && drawerScrim) {
    const drawerClose = navDrawer.querySelector('.nav-drawer-close');
    let lastFocusedNav = null;

    function openDrawer() {
      lastFocusedNav = document.activeElement;
      drawerScrim.hidden = false;
      requestAnimationFrame(() => {
        drawerScrim.classList.add('open');
        navDrawer.classList.add('open');
      });
      navDrawer.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (drawerClose) drawerClose.focus();
    }
    function closeDrawer() {
      drawerScrim.classList.remove('open');
      navDrawer.classList.remove('open');
      navDrawer.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      window.setTimeout(() => { drawerScrim.hidden = true; }, 260);
      if (lastFocusedNav) lastFocusedNav.focus();
    }

    navToggle.addEventListener('click', () => {
      const isOpen = navDrawer.classList.contains('open');
      isOpen ? closeDrawer() : openDrawer();
    });
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    drawerScrim.addEventListener('click', closeDrawer);
    navDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) closeDrawer();
    });
    // Collapse the drawer automatically if the viewport grows into desktop nav
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 860 && navDrawer.classList.contains('open')) closeDrawer();
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

  // Event Details Modal ---------------------------------------------------
  const EVENTS_DATA = {
    slf2026: {
      title: 'SLF 2026 – Pixarverse',
      statusLabel: 'Completed',
      statusClass: 'completed',
      dateLabel: 'July 27, 2026 – August 20, 2026',
      description: [
        "The Junior Philippine Computer Society (JPCS) took part in Student Life Fair 2026, welcoming TIPians to a community centered on technology, innovation, and collaboration.",
        "Over the two-day event, students visited the JPCS booth to learn more about the organization, connect with fellow tech enthusiasts, and discover opportunities in computing. The fair also marked the opening of JPCS membership registration, inviting new and returning members to take part in upcoming events, competitions, and activities throughout the academic year."
      ],
      media: [
        { label: 'JPCS Poster', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FLORSOTIPQC%2Fposts%2Fpfbid02zw2ar6CbuKUTzPMSRD8bspsE3Sc94XjCqZ1uFyCWgjoGVz1Gevhot21YqHJQ1EPml&show_text=false&width=500" width="500" height="498" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' },
        { label: 'Reel', html: '<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2127831438075925%2F&show_text=false&width=267&t=0" width="267" height="476" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>' },
        { label: 'Day 1 Highlights', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fphoto.php%3Ffbid%3D1480009340839908%26set%3Da.470964338411085%26type%3D3&show_text=false&width=500" width="500" height="810" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' },
        { label: 'Day 2 Highlights', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fphoto.php%3Ffbid%3D1482718220569020%26set%3Da.470964338411085%26type%3D3&show_text=false&width=500" width="500" height="849" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' }
      ]
    },
    'iot-seminar': {
      title: 'IoT Seminar – Where Devices Connect: Exploring the World of IoT',
      statusLabel: 'Postponed – New Date Will Be Announced Soon',
      statusClass: 'postponed',
      dateLabel: 'Was: September 5, 2026',
      location: 'T.I.P. Quezon City',
      speaker: 'Engr. Zherish Galvin Mayordo',
      description: [
        "The Junior Philippine Computer Society (JPCS) was set to host \u201cWhere Devices Connect: Exploring the World of IoT,\u201d a seminar focused on the Internet of Things, smart systems, automation, and the growing convergence of Artificial Intelligence and IoT (AIoT).",
        "The seminar was scheduled for September 5, 2026, at T.I.P. Quezon City, featuring Engr. Zherish Galvin Mayordo as the guest speaker. However, due to the Habagat and the resulting class suspension, the event was postponed.",
        "A new date will be announced once rescheduled. JPCS looks forward to bringing students together for an engaging discussion on connected technologies and their role in shaping the future."
      ],
      media: [
        { label: 'Event Poster', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fjpcstipqcofficial%2Fposts%2Fpfbid037WpvZrPoKX8ctqZPRrWvXdcieVAoRYdkGCC6aqGxqkwvPr9nthEfvso4UCos2rcNl&show_text=false&width=500" width="500" height="497" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' },
        { label: 'Guest Speaker', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fjpcstipqcofficial%2Fposts%2Fpfbid02H7oJuSoTbiMfxEovLfRU1r22ZhYApGgppENk577d3ewwaVGxTD2ewQFfERdvcH7Kl&show_text=false&width=500" width="500" height="498" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' }
      ]
    },
    'cloudchain-summit': {
      title: 'CloudChain Summit: Blockchain & Web3 on AWS',
      statusLabel: 'Upcoming – Rescheduled to Sept 23, 2026',
      statusClass: 'upcoming',
      dateLabel: 'September 23, 2026 (originally Aug 28, 2026)',
      location: 'QCU University Auditorium',
      description: [
        "The Junior Philippine Computer Society \u2013 T.I.P. QC Chapter, in partnership with the AWS Student Builder Group \u2013 QCU, Bitskwela, and Coins.ph, is set to host CloudChain Summit: Blockchain & Web3 on AWS, an afternoon seminar exploring blockchain, Web3, digital assets, and cloud computing on AWS. The program aims to introduce participants to Web3 fundamentals, cloud infrastructure, career opportunities, and practical industry insights.",
        "Originally scheduled for August 28, 2026, the event was postponed due to the Habagat and the resulting cancellation of classes. It has been rescheduled to September 23, 2026.",
        "The summit looks forward to bringing students and technology enthusiasts together to explore emerging technologies and build a stronger foundation in Web3 and cloud computing."
      ],
      media: [
        { label: 'Event Poster', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fphoto.php%3Ffbid%3D122190960620842883%26set%3Da.122108057660842883%26type%3D3&show_text=false&width=500" width="500" height="504" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' },
        { label: 'Community Partner', html: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fphoto.php%3Ffbid%3D122191204376842883%26set%3Da.122108057660842883%26type%3D3&show_text=false&width=500" width="500" height="690" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' }
      ]
    }
  };

  const eventModal = document.getElementById('event-modal');
  if (eventModal) {
    const modalPanel = eventModal.querySelector('.modal-panel');
    const modalClose = eventModal.querySelector('.modal-close');
    const elTitle = document.getElementById('event-modal-title');
    const elStatus = document.getElementById('event-modal-status');
    const elDate = document.getElementById('event-modal-date');
    const elLocation = document.getElementById('event-modal-location');
    const elSpeaker = document.getElementById('event-modal-speaker');
    const elDesc = document.getElementById('event-modal-desc');
    const elMediaWrap = document.getElementById('event-modal-media-wrap');
    const elGallery = document.getElementById('event-modal-gallery');
    let lastFocusedEvent = null;

    function scaleFbEmbed(wrap) {
      const iframe = wrap.querySelector('iframe');
      if (!iframe) return;
      const nativeW = parseInt(iframe.getAttribute('width'), 10) || 500;
      const nativeH = parseInt(iframe.getAttribute('height'), 10) || 300;
      const boxW = wrap.clientWidth;
      const boxH = wrap.clientHeight;
      if (!boxW || !boxH) return;
      const scale = Math.min(boxW / nativeW, boxH / nativeH);
      iframe.style.width = nativeW + 'px';
      iframe.style.height = nativeH + 'px';
      iframe.style.transform = 'scale(' + scale + ')';
    }

    function rescaleOpenEmbeds() {
      if (!eventModal.classList.contains('open')) return;
      elGallery.querySelectorAll('.fb-embed').forEach(scaleFbEmbed);
    }
    window.addEventListener('resize', rescaleOpenEmbeds);

    function openEventModal(id) {
      const data = EVENTS_DATA[id];
      if (!data) return;

      elTitle.textContent = data.title;
      elStatus.textContent = data.statusLabel;
      elStatus.className = 'tag ' + data.statusClass;
      elDate.textContent = data.dateLabel;

      if (data.location) {
        elLocation.innerHTML = '<strong>Location:</strong> ' + data.location;
        elLocation.hidden = false;
      } else {
        elLocation.hidden = true;
      }
      if (data.speaker) {
        elSpeaker.innerHTML = '<strong>Guest Speaker:</strong> ' + data.speaker;
        elSpeaker.hidden = false;
      } else {
        elSpeaker.hidden = true;
      }

      elDesc.innerHTML = data.description.map((p) => '<p>' + p + '</p>').join('');

      elGallery.innerHTML = '';
      if (data.media && data.media.length) {
        data.media.forEach((item) => {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          const fbWrap = document.createElement('div');
          fbWrap.className = 'fb-embed';
          fbWrap.setAttribute('aria-label', item.label);
          fbWrap.innerHTML = item.html;
          galleryItem.appendChild(fbWrap);
          const caption = document.createElement('div');
          caption.className = 'gallery-caption';
          caption.textContent = item.label;
          galleryItem.appendChild(caption);
          elGallery.appendChild(galleryItem);
        });
        elMediaWrap.hidden = false;
      } else {
        elMediaWrap.hidden = true;
      }

      eventModal.classList.add('open');
      eventModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lastFocusedEvent = document.activeElement;
      modalClose.focus();

      // Iframes need a layout pass (and to load) before we can measure/scale them.
      requestAnimationFrame(() => {
        rescaleOpenEmbeds();
        elGallery.querySelectorAll('.fb-embed iframe').forEach((f) => {
          f.addEventListener('load', () => scaleFbEmbed(f.closest('.fb-embed')));
        });
      });
    }

    function closeEventModal() {
      eventModal.classList.remove('open');
      eventModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedEvent) lastFocusedEvent.focus();
    }

    document.querySelectorAll('[data-event-modal]').forEach((trigger) => {
      trigger.addEventListener('click', () => openEventModal(trigger.getAttribute('data-event-modal')));
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEventModal(trigger.getAttribute('data-event-modal'));
        }
      });
    });

    modalClose.addEventListener('click', closeEventModal);
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) closeEventModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && eventModal.classList.contains('open')) closeEventModal();
    });

    eventModal.querySelectorAll('.gallery-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.getAttribute('data-scroll'), 10) || 1;
        const step = Math.max(elGallery.clientWidth * 0.85, 240);
        elGallery.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }

  // JPCitizens splash screen -----------------------------------------------
  const SPLASH_SESSION_KEY = 'jpcs-splash-seen';

  let splashAlreadySeen = false;
  try { splashAlreadySeen = sessionStorage.getItem(SPLASH_SESSION_KEY) === '1'; } catch (e) {}

  if (!splashAlreadySeen) {
    const ICON_MAIL =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7.2l8 5.8 8-5.8"/></svg>';
    const ICON_MEGAPHONE =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M3 10.5v3a1.2 1.2 0 0 0 1.2 1.2h1.6l1.2 4.3h2l-1.2-4.3H9l9 3.8V5.7l-9 3.8H4.2A1.2 1.2 0 0 0 3 10.5z"/>' +
      '<path d="M17.5 9v6"/></svg>';
    const ICON_CLOSE =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"/></svg>';

    const splash = document.createElement('div');
    splash.className = 'modal-overlay';
    splash.id = 'jpcitizen-splash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML =
      '<div class="modal-panel jpc-panel" role="dialog" aria-modal="true" aria-labelledby="splash-title" aria-describedby="splash-desc">' +
        '<button class="modal-close jpc-close" type="button" aria-label="Close welcome message">' + ICON_CLOSE + '</button>' +
        '<div class="jpc-body">' +
          '<div class="jpc-hero">' +
            '<span class="jpc-badge" aria-hidden="true">' + ICON_MAIL + '</span>' +
            '<div class="jpc-heading">' +
              '<span class="jpc-eyebrow">Welcome, JPCitizen</span>' +
              '<h3 id="splash-title">Stay connected, JPCitizen!</h3>' +
            '</div>' +
          '</div>' +
          '<ul class="jpc-list" id="splash-desc">' +
            '<li class="jpc-item">' +
              '<span class="jpc-item-icon" aria-hidden="true">' + ICON_MAIL + '</span>' +
              '<div class="jpc-item-copy">' +
                '<span class="jpc-item-label">T.I.P. Email Inbox</span>' +
                '<p>Announcements, events, and free upskilling programs land here. Check it often.</p>' +
              '</div>' +
            '</li>' +
            '<li class="jpc-item jpc-item--alert">' +
              '<span class="jpc-item-icon" aria-hidden="true">' + ICON_MEGAPHONE + '</span>' +
              '<div class="jpc-item-copy">' +
                '<div class="jpc-item-head">' +
                  '<span class="jpc-item-label">Event update</span>' +
                  '<span class="tag postponed">Postponed</span>' +
                '</div>' +
                '<p><strong>IoT Seminar</strong> postponed due to Habagat class suspensions. New date coming soon.</p>' +
              '</div>' +
            '</li>' +
          '</ul>' +
          '<button type="button" class="btn btn-primary btn-block jpc-cta">Got it, thanks!</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(splash);

    const splashClose = splash.querySelector('.jpc-close');
    const splashCta = splash.querySelector('.jpc-cta');
    let lastFocusedSplash = null;

    function markSplashSeen() {
      try { sessionStorage.setItem(SPLASH_SESSION_KEY, '1'); } catch (e) {}
    }
    function closeSplash() {
      splash.classList.remove('open');
      splash.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      markSplashSeen();
      if (lastFocusedSplash) lastFocusedSplash.focus();
    }
    function openSplash() {
      splash.classList.add('open');
      splash.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lastFocusedSplash = document.activeElement;
      splashClose.focus();
    }

    splashClose.addEventListener('click', closeSplash);
    splashCta.addEventListener('click', closeSplash);
    splash.addEventListener('click', (e) => {
      if (e.target === splash) closeSplash();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && splash.classList.contains('open')) closeSplash();
    });

    window.setTimeout(openSplash, 500);
  }
});