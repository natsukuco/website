/* Natsuku — "The Director's Cut"
   Page cuts (shutters + chapter card), running timecode, scroll reveals, the home
   reel, film strips, the lightbox, the film player and the WhatsApp enquiry slate.
   No dependencies. */
(() => {
  'use strict';

  /* ---- settings you may want to change ---------------------------------- */
  const CONFIG = {
    whatsapp: '6592475310',   // enquiry number: country code + number, digits only
    instagram: 'natsuku.co'
  };
  /* ROUTES maps each page file to the chapter card shown during a cut. */
  const ROUTES = /*ROUTES*/{"index.html": ["Prologue", "Natsuku"], "stories.html": ["Chapter I", "Stories"], "film.html": ["Chapter II", "Film"], "approach.html": ["Chapter III", "Approach"], "investment.html": ["Chapter IV", "Investment"], "enquire.html": ["Chapter V", "Enquire"], "404.html": ["Outtake", "Scene missing"], "story-rizqi-shuraifah.html": ["Chapter I · Reel 01", "Rizqi & Shuraifah"], "story-khair-syakirah.html": ["Chapter I · Reel 02", "Khair & Syakirah"], "story-haris-erlynna.html": ["Chapter I · Reel 03", "Haris & Erlynna"], "story-razalee-amirah.html": ["Chapter I · Reel 04", "Razalee & Amirah"]};

  /* ---- helpers ----------------------------------------------------------- */
  const D = document, H = D.documentElement, W = window;
  const RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = { in: 'cubic-bezier(.7,0,.84,0)', out: 'cubic-bezier(.16,1,.3,1)', io: 'cubic-bezier(.65,0,.35,1)' };
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k) { try { return W.sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { W.sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };
  const play = (el, frames, opts) => {
    const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
    return a.finished.then(() => { try { a.commitStyles(); } catch (e) { /* element hidden */ } a.cancel(); }).catch(() => {});
  };
  const pageOf = href => {
    let u; try { u = new URL(href, location.href); } catch (e) { return 'index.html'; }
    let p = decodeURIComponent(u.pathname.split('/').pop() || '');
    if (!p) return 'index.html';
    if (!p.includes('.')) p += '.html';
    return p;
  };
  const groupOf = name => (name.indexOf('story-') === 0 ? 'stories.html' : name);

  /* ---- chrome ------------------------------------------------------------ */
  const shutters = $$('.shutter');
  const card = $('.card'), cardK = $('.card__k'), cardT = $('.card__t');
  const setCardText = (k, t) => { if (cardK) cardK.textContent = k; if (cardT) cardT.textContent = t; };
  const setShut = v => shutters.forEach(s => { s.getAnimations().forEach(a => a.cancel()); s.style.transform = 'scaleY(' + v + ')'; });

  function syncChrome(name) {
    const group = groupOf(name);
    $$('[data-nav]').forEach(a => {
      if (pageOf(a.href) === group) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const r = ROUTES[name] || ['', ''];
    $$('[data-now-k]').forEach(el => { el.textContent = r[0].split(' · ')[0]; });
    $$('[data-now-title]').forEach(el => { el.textContent = r[1]; });
  }

  /* running timecode, 25 fps, carried across every cut */
  const tcEls = $$('.tc');
  const pad = n => String(n).padStart(2, '0');
  if (RM) tcEls.forEach(el => { el.textContent = 'TC 00:00:00:00'; });
  else {
    const t0 = performance.now(); let last = -1;
    const tick = now => {
      if (!D.hidden) {
        const f = Math.floor((now - t0) / 40);
        if (f !== last) {
          last = f;
          const s = Math.floor(f / 25);
          const txt = 'TC ' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(f % 25);
          tcEls.forEach(el => { el.textContent = txt; });
        }
      }
      W.requestAnimationFrame(tick);
    };
    W.requestAnimationFrame(tick);
  }

  /* chapter select (phones) */
  const menu = $('.menu');
  const menuBtns = $$('[data-menu]');
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    menuBtns.forEach(b => { b.setAttribute('aria-expanded', 'true'); const l = $('[data-menu-label]', b); if (l) l.textContent = 'Close'; });
    D.body.style.overflow = 'hidden';
    const first = $('a', menu); if (first) first.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    menuBtns.forEach(b => { b.setAttribute('aria-expanded', 'false'); const l = $('[data-menu-label]', b); if (l) l.textContent = 'Chapters'; });
    D.body.style.overflow = '';
  }
  menuBtns.forEach(b => b.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu())));
  D.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---- the cut ----------------------------------------------------------- */
  async function closeShutters() {
    await Promise.all(shutters.map(s => play(s, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 460, easing: EASE.in })));
    await play(card, [{ opacity: 0, transform: 'scale(1.03)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 340, easing: EASE.out });
  }
  async function openShutters() {
    play(card, [{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease' });
    await sleep(110);
    await Promise.all(shutters.map(s => play(s, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 780, easing: EASE.out })));
  }
  const heroReady = () => {
    const img = $('#scene .reel__frame.is-on img') || $('#scene .opener img') || $('#scene .finale img');
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth) return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    return new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  };

  /* ---- scroll reveals -----------------------------------------------------
     Each element plays a short shot as it scrolls into view:
       words  titles come into focus word by word      wipe  labels wipe on
       rule   hairlines draw across                      brush 懐く writes itself
       up     text and cards rise into place             slide film-strip frames advance
       draw   the footer logo draws itself, like the opening ident
       media  photos open from a letterbox and expose (class "rv" in the HTML)
     Elements entering together are staggered in reading order. The scroll-linked
     camera moves (parallax, the opening frame drifting off, frames opening) are
     plain CSS: see "camera moves" in site.css. */
  const MOTION = !RM && 'IntersectionObserver' in W;
  if (MOTION) H.classList.add('rv-on');
  const REVEALS = [
    ['up', '.screen, .panel, .crew > div, .principles > div, .prices > a, .step, .rate, .extras > div, .synopsis dl > div, .contactline, .slate, .callsheet, .ticks > li, .credits__roll > div, .endcredits dl'],
    ['slide', '.frame-card'],
    ['words', '.h-hero, .h1, .h2, .bigline, .scene__title'],
    ['brush', '.kanji'],
    ['wipe', '.label'],
    ['rule', '.slate-line .rule, .scene__head .rule'],
    ['up', '.lead, .body, p.h3, .small, .gloss, .meta-row, .row-links, .reel__ctas, .reel-row__no, .strip-nav, .link, .btn, .play-link, .slate-line .aside, .credits__word, .credits__tag, .credits__links, .credits__fine']
  ];
  function splitWords(el) {
    let n = 0;
    const walk = node => Array.from(node.childNodes).forEach(ch => {
      if (ch.nodeType === 3) {
        if (!ch.textContent.trim()) return;
        const frag = D.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(D.createTextNode(part)); return; }
          const w = D.createElement('span');
          w.className = 'w'; w.textContent = part; w.style.setProperty('--wi', n++);
          frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && !/^(br|wbr|svg|img)$/i.test(ch.tagName)) walk(ch);
    });
    walk(el);
  }
  function prepReveals(scope) {
    if (!MOTION) return;
    REVEALS.forEach(([type, sel]) => $$(sel, scope).forEach(el => {
      if (el.hasAttribute('data-rv') || el.closest('.media')) return;
      const outer = el.parentElement && el.parentElement.closest('[data-rv]');
      if (outer && scope.contains(outer)) return;
      if (type === 'words') splitWords(el);
      el.setAttribute('data-rv', type);
    }));
    // the footer logo is drawn from the same line art as the opening ident
    const mark = $('.credits__mark', scope), ident = $('.card__ident');
    if (mark && ident) {
      mark.setAttribute('viewBox', ident.getAttribute('viewBox'));
      mark.replaceChildren(...$$('path', ident).map(p => { const c = p.cloneNode(true); c.removeAttribute('style'); return c; }));
      $$('path', mark).forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2));
      mark.setAttribute('data-rv', 'draw');
    }
  }
  let io = null;
  function startReveals(scope) {
    if (io) io.disconnect();
    if (!MOTION) { $$('.rv', scope).forEach(e => e.classList.add('is-in')); return; }
    const row = r => Math.round(r.top / 12);
    io = new IntersectionObserver(entries => {
      entries.filter(en => en.isIntersecting)
        .sort((a, b) => (row(a.boundingClientRect) - row(b.boundingClientRect)) || (a.boundingClientRect.left - b.boundingClientRect.left))
        .forEach((en, n) => {
          const el = en.target, delay = Math.min(n, 7) * 90;
          io.unobserve(el);
          el.style.setProperty('--rd', delay + 'ms');
          el.classList.add('is-in');
          // hand transitions back to the element (hover effects) once it has landed
          if (el.dataset.rv === 'up' || el.dataset.rv === 'slide') setTimeout(() => el.classList.add('rv-done'), 1500 + delay);
        });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-rv], .rv', scope).forEach(e => io.observe(e));
  }

  /* ---- page life-cycle --------------------------------------------------- */
  let cleanups = [];
  let onStart = [];
  function initPage() {
    const scene = $('#scene');
    if (!scene) return;
    H.classList.toggle('pg-home', scene.dataset.page === 'home');
    prepReveals(scene);
    initStrips(scene);
    initLightbox(scene);
    const p = scene.dataset.page;
    if (p === 'home') initHome(scene);
    if (p === 'enquire') initEnquire(scene);
  }
  function startPage() {
    const scene = $('#scene');
    startReveals(scene);
    onStart.forEach(f => f()); onStart = [];
  }
  function teardown() {
    cleanups.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
    cleanups = []; onStart = [];
    if (io) { io.disconnect(); io = null; }
  }

  /* ---- router ------------------------------------------------------------ */
  const cache = new Map();
  const fetchDoc = href => {
    const key = href.split('#')[0];
    if (!cache.has(key)) {
      const p = fetch(key, { credentials: 'same-origin' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(t => new DOMParser().parseFromString(t, 'text/html'));
      p.catch(() => cache.delete(key));
      cache.set(key, p);
    }
    return cache.get(key);
  };
  const isPageLink = a => {
    if (!a || !a.getAttribute) return false;
    const raw = a.getAttribute('href') || '';
    if (!raw || /^(#|mailto:|tel:|sms:|javascript:)/i.test(raw)) return false;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return false;
    let u; try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin) return false;
    const last = u.pathname.split('/').pop();
    return last === '' || /\.html?$/i.test(last) || last.indexOf('.') === -1;
  };

  let busy = false;
  let pendingHash = '';
  async function go(href, opts) {
    const o = opts || {};
    const push = o.push !== false;
    if (busy) return;
    busy = true; H.classList.add('is-busy');
    const name = pageOf(href);
    const r = ROUTES[name];
    if (r) setCardText(r[0], r[1]);
    syncChrome(name);
    closeMenu(); lightbox.close(true); player.close();
    pendingHash = (new URL(href, location.href)).hash.slice(1);
    const docP = fetchDoc(href);
    try {
      if (push) { try { history.replaceState({ scroll: W.scrollY }, ''); } catch (e) { /* framed */ } }
      if (RM) await play($('#scene'), [{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
      else await closeShutters();
      const doc = await docP;
      const next = doc.getElementById('scene');
      if (!next) throw new Error('missing scene');
      teardown();
      const imported = D.importNode(next, true);
      $('#scene').replaceWith(imported);
      D.title = doc.title;
      const md = doc.querySelector('meta[name="description"]'), cd = D.querySelector('meta[name="description"]');
      if (md && cd) cd.setAttribute('content', md.getAttribute('content'));
      if (push) { try { history.pushState({ scroll: 0 }, '', href); } catch (e) { /* framed preview: keep URL */ } }
      W.scrollTo(0, o.scroll || 0);
      if (pendingHash && push) { const tgt = D.getElementById(pendingHash); if (tgt) tgt.scrollIntoView(); }
      syncChrome(name);
      initPage();
      if (RM) {
        imported.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      } else {
        await Promise.race([heroReady(), sleep(1500)]);
        await sleep(150);
        await openShutters();
      }
      startPage();
      const h1 = $('h1', imported);
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    } catch (err) {
      location.href = href;
    } finally {
      busy = false; H.classList.remove('is-busy');
    }
  }

  D.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest ? e.target.closest('a') : null;
    if (!isPageLink(a)) return;
    const u = new URL(a.href, location.href);
    if (u.pathname === location.pathname && pageOf(u.href) === pageOf(location.href)) {
      e.preventDefault();
      closeMenu();
      const t = u.hash ? D.getElementById(u.hash.slice(1)) : null;
      if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      else W.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
      return;
    }
    e.preventDefault();
    go(u.href);
  });
  const prefetch = e => {
    const a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (isPageLink(a)) fetchDoc(a.href).catch(() => {});
  };
  D.addEventListener('pointerover', prefetch, { passive: true });
  D.addEventListener('touchstart', prefetch, { passive: true });
  D.addEventListener('focusin', prefetch);
  W.addEventListener('popstate', e => go(location.href, { push: false, scroll: (e.state && e.state.scroll) || 0 }));

  /* ---- film strips ------------------------------------------------------- */
  function initStrips(scope) {
    $$('.strip', scope).forEach(strip => {
      let down = false, moved = false, sx = 0, sl = 0;
      const onDown = e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; };
      const onMove = e => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-dragging'); }
        if (moved) strip.scrollLeft = sl - dx;
      };
      const onUp = () => { if (!down) return; down = false; W.requestAnimationFrame(() => strip.classList.remove('is-dragging')); };
      strip.addEventListener('pointerdown', onDown);
      W.addEventListener('pointermove', onMove);
      W.addEventListener('pointerup', onUp);
      strip.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      strip.addEventListener('dragstart', e => e.preventDefault());
      cleanups.push(() => { W.removeEventListener('pointermove', onMove); W.removeEventListener('pointerup', onUp); });
      if (strip.id) {
        $$('[data-strip="' + strip.id + '"]', scope).forEach(b => b.addEventListener('click', () => {
          const c = $('.frame-card', strip);
          const step = c ? c.getBoundingClientRect().width + 20 : strip.clientWidth * 0.8;
          strip.scrollBy({ left: (b.dataset.dir === 'prev' ? -1 : 1) * step, behavior: RM ? 'auto' : 'smooth' });
        }));
      }
    });
  }

  /* ---- lightbox ---------------------------------------------------------- */
  const lightbox = (() => {
    const root = $('.lb');
    if (!root) return { open() {}, close() {} };
    const img = $('.lb__stage img', root), cap = $('.lb__cap', root), count = $('.lb__count', root), closeBtn = $('.lb__close', root);
    let items = [], i = 0, lastFocus = null, swiped = false, sx = null;
    const best = el => {
      const im = $('img', el);
      const set = (im.getAttribute('srcset') || '').split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
      return { src: set.length ? set[set.length - 1] : (im.currentSrc || im.src), alt: im.alt || '', cap: el.dataset.cap || '' };
    };
    const show = n => {
      i = (n + items.length) % items.length;
      const it = items[i];
      img.src = it.src; img.alt = it.alt;
      cap.textContent = it.cap ? it.cap + ' · ' + it.alt : it.alt;
      count.textContent = pad(i + 1) + ' / ' + pad(items.length);
    };
    const open = (list, n) => {
      items = list; lastFocus = D.activeElement; show(n);
      root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
      D.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    };
    const close = silent => {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true');
      D.body.style.overflow = '';
      if (!silent && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    closeBtn.addEventListener('click', () => close());
    $('.lb__nav--prev', root).addEventListener('click', e => { e.stopPropagation(); show(i - 1); });
    $('.lb__nav--next', root).addEventListener('click', e => { e.stopPropagation(); show(i + 1); });
    root.addEventListener('click', e => {
      if (swiped) { swiped = false; return; }
      if (e.target.classList.contains('lb__stage')) close();
    });
    D.addEventListener('keydown', e => {
      if (!root.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(i + 1);
      else if (e.key === 'ArrowLeft') show(i - 1);
      else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
    });
    root.addEventListener('pointerdown', e => { sx = e.clientX; });
    root.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) { swiped = true; show(i + (dx < 0 ? 1 : -1)); }
    });
    return { open, close, best };
  })();
  /* ---- film player (Google Drive preview, embedded) ---------------------- */
  const player = (() => {
    const root = $('.player');
    if (!root) return { open() {}, close() {} };
    const frame = $('.player__frame', root), title = $('.player__t', root), kicker = $('.player__k', root);
    const ext = $('.player__ext', root), closeBtn = $('.player__close', root);
    let lastFocus = null;
    const open = o => {
      lastFocus = D.activeElement;
      const ifr = D.createElement('iframe');
      ifr.src = 'https://drive.google.com/file/d/' + o.id + '/preview';
      ifr.title = o.title || 'Film';
      ifr.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
      ifr.setAttribute('allowfullscreen', '');
      frame.replaceChildren(ifr);
      title.textContent = o.title || '';
      kicker.textContent = o.kicker || 'Now playing';
      ext.setAttribute('href', 'https://drive.google.com/file/d/' + o.id + '/view');
      root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
      H.classList.add('player-open'); D.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    };
    const close = () => {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true');
      H.classList.remove('player-open'); D.body.style.overflow = '';
      frame.replaceChildren();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    closeBtn.addEventListener('click', close);
    root.addEventListener('click', e => { if (e.target === root || e.target.classList.contains('player__stage')) close(); });
    D.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    D.addEventListener('click', e => {
      const a = e.target.closest ? e.target.closest('[data-film]') : null;
      if (!a || H.dataset.embed === 'off' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open({ id: a.dataset.film, title: a.dataset.filmTitle, kicker: a.dataset.filmKicker });
    });
    return { open, close };
  })();
  function initLightbox(scope) {
    $$('[data-gallery]', scope).forEach(g => {
      const els = $$('[data-lb]', g);
      els.forEach((el, n) => {
        const im = $('img', el);
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'View larger: ' + (im && im.alt ? im.alt : 'photo'));
        const openIt = () => lightbox.open(els.map(lightbox.best), n);
        el.addEventListener('click', openIt);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); } });
      });
    });
  }

  /* ---- home: the reel ---------------------------------------------------- */
  function initHome(scene) {
    const reel = $('.reel', scene);
    const frames = $$('.reel__frame', scene);
    if (!reel || frames.length < 2) return;
    const title = $('[data-scene-title]', scene), no = $('[data-scene-no]', scene), link = $('[data-scene-link]', scene);
    const ph = $('.playhead');
    const DUR = 6200;
    let idx = 0, timer = null, visible = true;
    const runPlayhead = () => {
      if (!ph || RM) return;
      ph.getAnimations().forEach(a => a.cancel());
      ph.classList.add('is-on');
      ph.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DUR, easing: 'linear', fill: 'forwards' });
    };
    const setScene = n => {
      frames[idx].classList.remove('is-on');
      idx = n;
      const f = frames[idx];
      f.classList.add('is-on');
      if (title) title.textContent = f.dataset.title;
      if (no) no.textContent = f.dataset.no;
      if (link) link.setAttribute('href', f.dataset.href);
      runPlayhead();
    };
    const loop = () => {
      timer = setTimeout(() => {
        if (!D.hidden && visible) setScene((idx + 1) % frames.length);
        loop();
      }, DUR);
    };
    const vis = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.25 });
    vis.observe(reel);
    onStart.push(() => { if (!RM) { runPlayhead(); loop(); } });
    cleanups.push(() => {
      clearTimeout(timer); vis.disconnect();
      if (ph) { ph.getAnimations().forEach(a => a.cancel()); ph.classList.remove('is-on'); }
    });
  }

  /* ---- enquire: the slate ------------------------------------------------ */
  const fmtDate = iso => {
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  function initEnquire(scene) {
    const form = $('#slate', scene);
    if (!form) return;
    const sheet = $('.callsheet', scene), pre = $('pre', sheet), wa = $('[data-wa]', scene);
    const err = $('.form-error', form), copyBtn = $('[data-copy]', scene), copied = $('[data-copied]', scene);
    const tbd = $('#f-date-tbd', form), date = $('#f-date', form), pkg = $('#f-package', form);
    tbd.addEventListener('change', () => { date.disabled = tbd.checked; if (tbd.checked) date.value = ''; });
    const hrs = $('#f-hours', form);
    // choosing a package ticks its coverage and fills in its hours, unless the client set the hours themselves
    const syncPackage = () => {
      const op = pkg && pkg.selectedOptions[0];
      if (!op || !op.dataset.cov) return;
      const radio = $$('input[name="coverage"]', form).find(r => r.value === op.dataset.cov);
      if (radio) radio.checked = true;
      if (hrs && op.dataset.hrs && (!hrs.value || hrs.dataset.auto)) { hrs.value = op.dataset.hrs + ' hours'; hrs.dataset.auto = '1'; }
    };
    if (pkg) pkg.addEventListener('change', syncPackage);
    if (hrs) hrs.addEventListener('change', () => { delete hrs.dataset.auto; });
    const hash = pendingHash || location.hash.slice(1);
    if (hash && pkg) {
      const opt = $$('option', pkg).find(op => op.dataset.slug === hash);
      if (opt) { pkg.value = opt.value; syncPackage(); }
    }
    pendingHash = '';
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = id => { const el = $('#' + id, form); return el ? el.value.trim() : ''; };
      const names = v('f-names');
      if (!names) { err.textContent = 'Add your names so we know who we’re talking to.'; $('#f-names', form).focus(); return; }
      if (!tbd.checked && !date.value) { err.textContent = 'Pick your wedding date, or tick “Date not fixed yet”.'; date.focus(); return; }
      err.textContent = '';
      const events = $$('input[name="events"]:checked', form).map(i => i.value);
      if (v('f-other')) events.push(v('f-other'));
      const covEl = $('input[name="coverage"]:checked', form);
      const hours = v('f-hours');
      let coverage = covEl ? covEl.value : '';
      if (hours) coverage = coverage ? coverage + ', about ' + hours : 'About ' + hours;
      const fields = [
        ['Names', names],
        ['Date', tbd.checked ? 'Not fixed yet' : fmtDate(date.value)],
        ['Events', events.join(', ')],
        ['Venue', v('f-venue')],
        ['Coverage', coverage],
        ['Package in mind', v('f-package')],
        ['Found you via', v('f-source')],
        ['Notes', v('f-notes')]
      ].filter(f => f[1]);
      const msg = ['Hi Natsuku! We’d like to check a date.', '']
        .concat(fields.map(f => '*' + f[0] + ':* ' + f[1]))
        .concat(['', '(Sent from the Natsuku website)'])
        .join('\n');
      pre.textContent = msg;
      const url = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
      wa.setAttribute('href', url);
      sheet.hidden = false;
      const a = D.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      D.body.appendChild(a); a.click(); a.remove();
      sheet.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    });
    if (copyBtn) copyBtn.addEventListener('click', () => {
      const text = pre.textContent;
      const fallback = () => {
        const range = D.createRange(); range.selectNodeContents(pre);
        const sel = W.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        copied.textContent = 'Selected. Copy it with your keyboard or long-press.';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => { copied.textContent = 'Copied.'; }, fallback);
      } else fallback();
    });
  }

  /* ---- first frame ------------------------------------------------------- */
  async function ident() {
    const svg = $('.card__ident');
    if (!svg) return sleep(600);
    H.classList.add('ident');
    setCardText('Natsuku presents', 'Prologue');
    const paths = $$('path', svg);
    paths.forEach(p => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.style.fillOpacity = 0;
    });
    paths.forEach((p, n) => {
      p.animate([{ strokeDashoffset: p.style.strokeDashoffset }, { strokeDashoffset: 0 }], { duration: n ? 520 : 1300, delay: n ? 780 : 0, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
      p.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 420, delay: 1180 + n * 120, easing: 'ease-out', fill: 'forwards' });
    });
    [cardK, cardT].forEach((el, n) => el && el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 380 + n * 240, easing: EASE.out, fill: 'both' }));
    let skip;
    const skipped = new Promise(r => { skip = r; });
    const onSkip = () => skip();
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => W.addEventListener(ev, onSkip, { once: true, passive: true }));
    await Promise.race([sleep(2300), skipped]);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => W.removeEventListener(ev, onSkip));
  }

  async function boot() {
    const name = pageOf(location.href);
    syncChrome(name);
    initPage();
    if (RM || !H.classList.contains('intro')) {
      H.classList.remove('intro'); setShut(0); if (card) card.style.opacity = 0;
      startPage();
      return;
    }
    busy = true; H.classList.add('is-busy');
    setShut(1); card.style.opacity = 1;
    H.classList.remove('intro');
    const firstVisit = !store.get('nk-seen');
    store.set('nk-seen', '1');
    if (firstVisit && name === 'index.html') await ident();
    else await sleep(520);
    await Promise.race([heroReady(), sleep(1400)]);
    await openShutters();
    H.classList.remove('ident');
    [cardK, cardT].forEach(el => el && el.getAnimations().forEach(a => a.cancel()));
    busy = false; H.classList.remove('is-busy');
    startPage();
  }

  try { history.replaceState({ scroll: W.scrollY }, ''); } catch (e) { /* framed */ }
  boot();
})();
