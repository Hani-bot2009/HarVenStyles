/* ================================================================
   HarVenStyles — main.js
   ALL UPDATES CONSOLIDATED
   Sidebar · Topbar · Scroll Reveal · Smooth Scroll ·
   Footer Year · Scroll-Synced Hero Video
   ================================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Footer year ─────────────────────────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sidebar ─────────────────────────────────────────────────── */
  const sidebar   = $('#sidebar');
  const overlay   = $('#sidebarOverlay');
  const hamburger = $('#hamburger');
  const closeBtn  = $('#closeBtn');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-open');
    sidebar.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = $('a', sidebar);
    if (firstLink) setTimeout(() => firstLink.focus(), 550);
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
    sidebar.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (hamburger) hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);

  $$('.sidebar__link').forEach(link => link.addEventListener('click', closeSidebar));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) closeSidebar();
  });

  /* ── Topbar scroll state ─────────────────────────────────────── */
  const topbar = $('#topbar');

  function updateTopbar() {
    if (!topbar) return;
    topbar.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  /* ── Scroll Reveal (IntersectionObserver) ────────────────────── */
  const revealEls = $$('[data-scroll-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ── Smooth scroll for anchor links ─────────────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Scroll-synced hero video ────────────────────────────────── */
  //
  // Video currentTime is driven by scroll position through the hero section.
  // scroll progress 0%   → video time 0s
  // scroll progress 100% → video time = duration
  // A rAF lerp loop smooths out any scroll jank.
  //
  const video = $('video.hero__video');

  if (video) {
    video.pause();
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');

    let duration   = 0;
    let targetTime = 0;
    let smoothTime = 0;
    const LERP     = 0.08;  // raise toward 0.2 for snappier feel

    function tick() {
      if (duration) {
        smoothTime += (targetTime - smoothTime) * LERP;
        if (Math.abs(video.currentTime - smoothTime) > 0.005) {
          video.currentTime = smoothTime;
        }
      }
      requestAnimationFrame(tick);
    }

    function onScroll() {
      if (!duration) return;
      const hero     = video.closest('section') || video.parentElement;
      const heroTop  = hero.getBoundingClientRect().top + window.scrollY;
      const heroH    = hero.offsetHeight;
      const scrolled = window.scrollY - heroTop;
      targetTime     = Math.min(Math.max(scrolled / heroH, 0), 1) * duration;
    }

    function init() {
      duration = video.duration || 0;
      if (!duration) return;
      onScroll();
      requestAnimationFrame(tick);
    }

    if (video.readyState >= 1) {
      init();
    } else {
      video.addEventListener('loadedmetadata', init, { once: true });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

})();