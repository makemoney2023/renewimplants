/* ============================================
   RENEW IMPLANTS — Master Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Helper to close mobile nav ────────── */
  function closeMobileNav() {
    var toggle    = document.getElementById('nav-toggle');
    var mobileNav = document.getElementById('mobile-nav');
    if (!toggle || !mobileNav) return;
    mobileNav.classList.remove('is-active');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-nav-open');
  }

  /* ── Mobile Nav ────────────────────────── */
  var toggle    = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var navClose  = document.getElementById('nav-close');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-active');
      toggle.classList.toggle('is-active');
      toggle.setAttribute('aria-expanded', open);
      mobileNav.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
      document.body.classList.toggle('mobile-nav-open', open);
    });
    // Close button inside panel
    if (navClose) {
      navClose.addEventListener('click', closeMobileNav);
    }
    // Close on backdrop click
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) {
        closeMobileNav();
      }
    });
    // Sub-menu toggles
    mobileNav.querySelectorAll('.mobile-nav__parent').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = btn.nextElementSibling;
        var open = sub.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open);
      });
    });
  }


  /* ── FAQ Accordion ─────────────────────── */
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
  });


  /* ── Desktop Nav Dropdowns ─────────────── */
  document.querySelectorAll('.site-nav__dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close all other dropdowns first
      document.querySelectorAll('.site-nav__dropdown-toggle').forEach(function (other) {
        if (other !== btn) other.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', !expanded);
    });
  });
  // Close dropdowns when clicking outside
  document.addEventListener('click', function () {
    document.querySelectorAll('.site-nav__dropdown-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
  });


  /* ── Testimonials Slider ───────────────── */
  document.querySelectorAll('.testimonials-slider').forEach(function (slider) {
    var slides = slider.querySelectorAll('.testimonials-slider__slide');
    var dots   = slider.querySelectorAll('.testimonials-slider__dot');
    var prev   = slider.querySelector('.testimonials-slider__btn--prev');
    var next   = slider.querySelector('.testimonials-slider__btn--next');
    var current = 0;

    function show(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    }

    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-index'), 10));
      });
    });
  });


  /* ── Alert Dismiss ─────────────────────── */
  document.querySelectorAll('.alert__close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.alert').remove();
    });
  });


  /* ── Lightbox Gallery ──────────────────── */
  document.querySelectorAll('.lb-gallery').forEach(function (gallery) {
    var galleryId = gallery.id;
    var overlay   = document.getElementById(galleryId + '-overlay');
    if (!overlay) return;

    var images    = [];
    try { images = JSON.parse(gallery.getAttribute('data-images') || '[]'); } catch (e) { return; }

    var imgEl     = overlay.querySelector('.lb-overlay__img');
    var captionEl = overlay.querySelector('.lb-overlay__caption');
    var counterEl = overlay.querySelector('.lb-overlay__counter');
    var btnClose  = overlay.querySelector('.lb-overlay__close');
    var btnPrev   = overlay.querySelector('.lb-overlay__nav--prev');
    var btnNext   = overlay.querySelector('.lb-overlay__nav--next');
    var backdrop  = overlay.querySelector('.lb-overlay__backdrop');
    var current   = 0;
    var total     = images.length;

    function show(index) {
      current = ((index % total) + total) % total;
      var data = images[current];
      imgEl.setAttribute('src', data.src || '');
      imgEl.setAttribute('alt', data.alt || '');
      captionEl.textContent = data.caption || '';
      counterEl.textContent = (current + 1) + ' / ' + total;
    }
    function open(index) {
      show(index);
      overlay.classList.add('is-active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-no-scroll');
    }
    function close() {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-no-scroll');
    }

    gallery.addEventListener('click', function (e) {
      var item = e.target.closest('.lb-gallery__item');
      if (!item) return;
      var idx = parseInt(item.getAttribute('data-index'), 10);
      if (!isNaN(idx)) open(idx);
    });
    btnClose.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    var touchStartX = 0;
    overlay.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? show(current + 1) : show(current - 1);
    }, { passive: true });
  });


  /* ── Before / After Sliders ────────────── */
  document.querySelectorAll('.ba-compare').forEach(function (container) {
    var afterImg = container.querySelector('.ba-compare__img--after');
    var divider  = container.querySelector('.ba-compare__divider');
    var handle   = container.querySelector('.ba-compare__handle');
    if (!afterImg || !divider || !handle) return;
    var dragging = false;
    var start = parseFloat(container.getAttribute('data-ba-start')) || 50;
    setPos(start);

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      afterImg.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      divider.style.left = pct + '%';
      handle.style.left  = pct + '%';
    }
    function getPct(clientX) {
      var r = container.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }
    container.addEventListener('mousedown', function (e) { e.preventDefault(); dragging = true; setPos(getPct(e.clientX)); });
    window.addEventListener('mousemove', function (e) { if (dragging) setPos(getPct(e.clientX)); });
    window.addEventListener('mouseup', function () { dragging = false; });
    container.addEventListener('touchstart', function (e) { dragging = true; setPos(getPct(e.touches[0].clientX)); }, { passive: true });
    container.addEventListener('touchmove', function (e) { if (!dragging) return; e.preventDefault(); setPos(getPct(e.touches[0].clientX)); }, { passive: false });
    container.addEventListener('touchend', function () { dragging = false; });
  });


  /* ── Video Lightbox ────────────────────── */
  var vlOverlay = document.getElementById('video-lightbox');
  if (vlOverlay) {
    var vlWrap     = vlOverlay.querySelector('.video-lightbox__wrap');
    var vlClose    = vlOverlay.querySelector('.video-lightbox__close');
    var vlBackdrop = vlOverlay.querySelector('.video-lightbox__backdrop');

    function vlOpen(id) {
      vlWrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      vlOverlay.classList.add('is-active');
      vlOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('vl-no-scroll');
    }
    function vlCloseHandler() {
      vlOverlay.classList.remove('is-active');
      vlOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('vl-no-scroll');
      vlWrap.innerHTML = '';
    }

    document.addEventListener('click', function (e) {
      var thumb = e.target.closest('[data-youtube-id]');
      if (thumb) { e.preventDefault(); vlOpen(thumb.getAttribute('data-youtube-id')); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var t = e.target.closest('[data-youtube-id]');
        if (t) { e.preventDefault(); vlOpen(t.getAttribute('data-youtube-id')); }
      }
      if ((e.key === 'Escape') && vlOverlay.classList.contains('is-active')) vlCloseHandler();
    });
    vlClose.addEventListener('click', vlCloseHandler);
    vlBackdrop.addEventListener('click', vlCloseHandler);
  }

});



document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("scroll", function () {
        const header = document.querySelector("header");

        if (window.scrollY > 10) {
            header.classList.add("fixed");
        } else {
            header.classList.remove("fixed");
        }
    });
});