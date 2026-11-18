(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Tema ----- */
  var themeBtn = document.getElementById('tema');
  function systemIsLight() {
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  }
  function currentTheme() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'light') return 'claro';
    if (attr === 'dark') return 'escuro';
    return systemIsLight() ? 'claro' : 'escuro';
  }
  function applyTheme(name) {
    root.setAttribute('data-theme', name === 'claro' ? 'light' : 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', name === 'claro' ? '#FAFAFA' : '#0E0E10');
    try { localStorage.setItem('tema', name); } catch (e) {}
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'claro' ? 'escuro' : 'claro');
    });
  }

  /* ----- Menu mobile ----- */
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('menu');
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  /* ----- Menu de currículo: fecha ao clicar fora ou com Esc ----- */
  var cv = document.querySelector('.cv-menu');
  document.addEventListener('click', function (e) {
    if (cv && cv.open && !cv.contains(e.target)) cv.open = false;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (cv && cv.open) { cv.open = false; cv.querySelector('summary').focus(); }
    setMenu(false);
  });

  /* ----- Abre o grupo de entregas ao navegar para #casos ----- */
  var grupo = document.getElementById('grupo-entregas');
  function openGroupFromHash() {
    if (grupo && location.hash === '#casos') grupo.open = true;
  }
  openGroupFromHash();
  window.addEventListener('hashchange', openGroupFromHash);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#casos"]');
    if (a && grupo) grupo.open = true;
  });

  /* ----- Fio de rastreio e seção ativa ----- */
  var main = document.querySelector('main');
  var fill = document.getElementById('trace-fill');
  var headings = Array.prototype.slice.call(document.querySelectorAll('.h2'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var probe = window.scrollY + vh * 0.55;
    var mainTop = main.getBoundingClientRect().top + window.scrollY;

    if (fill) {
      if (reduce) {
        fill.style.setProperty('--trace', '100%');
      } else {
        var h = Math.max(0, Math.min(main.offsetHeight, probe - mainTop));
        fill.style.setProperty('--trace', h + 'px');
      }
    }

    headings.forEach(function (h2) {
      var top = h2.getBoundingClientRect().top + window.scrollY;
      h2.classList.toggle('passed', reduce || probe >= top);
    });

    var activeIdx = -1;
    sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top + window.scrollY <= window.scrollY + vh * 0.4) activeIdx = i;
    });
    navLinks.forEach(function (a, i) {
      if (i === activeIdx) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  if (main) {
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (fill) {
      setTimeout(function () { fill.classList.remove('intro'); }, 1400);
    }
  }
})();
