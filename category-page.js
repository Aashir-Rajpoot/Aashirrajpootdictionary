/* =========================================================
   AASHIR RAJPOOT DICTIONARY — CATEGORY PAGE LOGIC
   Shared across beautiful-words.html, rare-words.html, etc.
   Expects a global CATEGORY_INFO object and WORDS array to be
   defined on the page (in a <script> before this file) via:
     window.CATEGORY_INFO = { name, slug, color, desc };
     window.WORDS = [ { word, phonetic, meaning, urdu, example }, ... ];
   ========================================================= */
(function () {
  'use strict';

  const KEYS = {
    theme: 'ar_dict_theme'
  };

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  const $ = (sel) => document.querySelector(sel);

  /* ---------------- THEME (shared with homepage) ---------------- */
  const themeToggle = $('#themeToggle');
  function initTheme() {
    const saved = storage.get(KEYS.theme, null);
    let theme = saved;
    if (!theme) {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(theme);
  }
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
    storage.set(KEYS.theme, theme);
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  /* ---------------- MOBILE NAV ---------------- */
  const navToggle = $('#navToggle');
  const mobileNav = $('#mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  /* ---------------- CATEGORY PAGE RENDER ---------------- */
  const info = window.CATEGORY_INFO || {};
  const words = window.WORDS || [];

  const wordGrid = $('#wordGrid');
  const wordCount = $('#wordCount');
  const searchInput = $('#catSearchInput');
  const searchClear = $('#catSearchClear');

  function wordCardHtml(w, idx) {
    return `
      <article class="word-card" style="--cat-color:${info.color}">
        <div class="word-card-head">
          <h3 class="word-card-word">${escapeHtml(w.word)}</h3>
          <span class="word-card-num">${String(idx + 1).padStart(2, '0')}</span>
        </div>
        ${w.phonetic ? `<span class="word-card-phon">${escapeHtml(w.phonetic)}</span>` : ''}
        <div class="word-card-label">Meaning</div>
        <p class="word-card-meaning">${escapeHtml(w.meaning)}</p>
        <div class="word-card-label">Roman Urdu</div>
        <p class="word-card-urdu">${escapeHtml(w.urdu)}</p>
        ${w.example ? `<div class="word-card-label">Example</div><p class="word-card-example">"${escapeHtml(w.example)}"</p>` : ''}
      </article>
    `;
  }

  function renderWords(filter) {
    const q = (filter || '').trim().toLowerCase();
    const filtered = !q ? words : words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      (w.meaning && w.meaning.toLowerCase().includes(q)) ||
      (w.urdu && w.urdu.toLowerCase().includes(q))
    );

    if (wordCount) {
      wordCount.textContent = q
        ? `${filtered.length} of ${words.length} words match "${filter}"`
        : `${words.length} words in this collection`;
    }

    if (!filtered.length) {
      wordGrid.innerHTML = `
        <div class="word-grid-empty">
          <svg viewBox="0 0 24 24" width="40" height="40"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>
          <p>No matching words</p>
          <p>Try a different search term.</p>
        </div>
      `;
      return;
    }

    wordGrid.innerHTML = filtered.map(wordCardHtml).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value;
      if (searchClear) searchClear.classList.toggle('show', !!val);
      renderWords(val);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('show');
      searchInput.focus();
      renderWords('');
    });
  }

  function init() {
    initTheme();
    if (wordGrid) renderWords('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
