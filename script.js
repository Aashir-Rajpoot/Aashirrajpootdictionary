/* =========================================================
   AASHIR RAJPOOT DICTIONARY — APP LOGIC
   ========================================================= */
(function () {
  'use strict';

  const KEYS = {
    theme: 'ar_dict_theme',
    favorites: 'ar_dict_favorites',
    history: 'ar_dict_history',
    searchCount: 'ar_dict_search_count'
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
  const themeToggle = $('#themeToggle');
  const navToggle = $('#navToggle');
  const mobileNav = $('#mobileNav');
  const searchForm = $('#searchForm');
  const searchInput = $('#searchInput');
  const resultArea = $('#resultArea');
  const categoryGrid = $('#categoryGrid');
  const favoritesList = $('#favoritesList');
  const historyList = $('#historyList');
  const clearHistoryBtn = $('#clearHistory');
  const toastEl = $('#toast');

  /* ---------------- THEME ---------------- */
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
    themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    storage.set(KEYS.theme, theme);
  }

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });

  /* ---------------- MOBILE NAV ---------------- */
  navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.querySelectorAll('.mobile-nav .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- TOAST ---------------- */
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------------- CURATED WORD DATA ---------------- */
  const OFFLINE_WORDS = {
    serendipity: { phonetic: '/ˌserənˈdɪpɪti/', pos: 'noun', meaning: 'The occurrence of events by chance in a happy or beneficial way.', example: 'A fortunate stroke of serendipity brought them together.', synonyms: ['chance', 'fortune', 'luck', 'fluke'], antonyms: ['misfortune'] },
    ephemeral: { phonetic: '/ɪˈfem(ə)rəl/', pos: 'adjective', meaning: 'Lasting for a very short time.', example: 'The beauty of cherry blossoms is ephemeral.', synonyms: ['fleeting', 'transient', 'momentary'], antonyms: ['permanent', 'lasting'] },
    resilience: { phonetic: '/rɪˈzɪliəns/', pos: 'noun', meaning: 'The capacity to recover quickly from difficulties; toughness.', example: 'The team showed great resilience after a difficult year.', synonyms: ['toughness', 'strength', 'adaptability'], antonyms: ['fragility', 'weakness'] },
    euphoria: { phonetic: '/juːˈfɔːriə/', pos: 'noun', meaning: 'A feeling or state of intense excitement and happiness.', example: 'She felt a wave of euphoria as she crossed the finish line.', synonyms: ['elation', 'joy', 'bliss'], antonyms: ['misery', 'despair'] },
    wanderlust: { phonetic: '/ˈwɒndəlʌst/', pos: 'noun', meaning: 'A strong desire to travel and explore the world.', example: 'His wanderlust led him to visit forty countries.', synonyms: ['restlessness', 'itchy feet'], antonyms: ['contentment'] },
    luminous: { phonetic: '/ˈluːmɪnəs/', pos: 'adjective', meaning: 'Giving off light; bright or shining, especially in the dark.', example: 'The luminous stars filled the night sky.', synonyms: ['radiant', 'glowing', 'bright'], antonyms: ['dark', 'dim'] },
    solitude: { phonetic: '/ˈsɒlɪtjuːd/', pos: 'noun', meaning: 'The state or situation of being alone.', example: 'She enjoyed the solitude of the mountain cabin.', synonyms: ['isolation', 'seclusion'], antonyms: ['company', 'crowd'] },
    tenacity: { phonetic: '/təˈnasɪti/', pos: 'noun', meaning: 'The quality of being determined; firmness of purpose.', example: 'His tenacity helped him finish the marathon despite the pain.', synonyms: ['persistence', 'determination'], antonyms: ['weakness', 'apathy'] },
    mellifluous: { phonetic: '/mɛˈlɪflʊəs/', pos: 'adjective', meaning: 'Sweet or musical; pleasant to hear.', example: 'Her mellifluous voice calmed the crowd.', synonyms: ['melodious', 'sweet-sounding'], antonyms: ['harsh', 'grating'] },
    equanimity: { phonetic: '/ˌɛkwəˈnɪmɪti/', pos: 'noun', meaning: 'Mental calmness and composure, especially in a difficult situation.', example: 'She faced the crisis with remarkable equanimity.', synonyms: ['composure', 'calm', 'poise'], antonyms: ['agitation', 'anxiety'] }
  };

  const WOTD_LIST = Object.keys(OFFLINE_WORDS);

  const CATEGORIES = [
    { name: 'Beautiful Words', color: 'var(--pink)', desc: 'Words that sound as lovely as they mean.', words: ['serendipity', 'luminous', 'ephemeral', 'mellifluous', 'aurora'], page: 'beautiful-words.html' },
    { name: 'Rare Words', color: 'var(--violet)', desc: 'Uncommon words worth collecting.', words: ['petrichor', 'sonder', 'limerence', 'apricity', 'vellichor'], page: 'rare-words.html' },
    { name: 'Powerful Words', color: 'var(--crimson)', desc: 'Words that command attention.', words: ['tenacity', 'resilience', 'fortitude', 'conviction', 'audacity'], page: 'powerful-words.html' },
    { name: 'Positive Words', color: 'var(--emerald)', desc: 'Words that lift the spirit.', words: ['euphoria', 'gratitude', 'flourish', 'radiant', 'harmony'], page: 'positive-words.html' },
    { name: 'Emotional Words', color: 'var(--coral)', desc: 'Words that name what we feel.', words: ['nostalgia', 'melancholy', 'yearning', 'solitude', 'wistful'], page: 'emotional-words.html' },
    { name: 'Academic Words', color: 'var(--royal-blue)', desc: 'Words for sharper writing.', words: ['ubiquitous', 'paradigm', 'empirical', 'discourse', 'synthesis'], page: 'academic-words.html' },
    { name: 'Nature Words', color: 'var(--teal)', desc: 'Words borrowed from the wild.', words: ['wanderlust', 'meadow', 'zephyr', 'horizon', 'ember'], page: 'nature-words.html' },
    { name: 'Advanced Words', color: 'var(--amber)', desc: 'Words that expand your vocabulary.', words: ['equanimity', 'perspicacious', 'ineffable', 'quintessential', 'ephemeral'], page: 'advanced-words.html' }
  ];

  /* ---------------- WORD OF THE DAY ---------------- */
  function getWordOfDay() {
    const now = new Date();
    const dayNum = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    return WOTD_LIST[dayNum % WOTD_LIST.length];
  }

  async function renderWordOfDay() {
    const word = getWordOfDay();
    const wordEl = $('#wotdWord');
    const phonEl = $('#wotdPhon');
    const posEl = $('#wotdPos');
    const meaningEl = $('#wotdMeaning');
    const exampleEl = $('#wotdExample');

    wordEl.textContent = word;
    meaningEl.textContent = 'Loading today\u2019s word\u2026';
    phonEl.textContent = '';
    posEl.textContent = '';
    exampleEl.textContent = '';

    let data = await fetchDefinition(word).catch(() => null);
    if (data && data.length) {
      const entry = data[0];
      const meaning = entry.meanings && entry.meanings[0];
      const def = meaning && meaning.definitions && meaning.definitions[0];
      phonEl.textContent = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text) || {}).text || '';
      posEl.textContent = meaning ? meaning.partOfSpeech : '';
      meaningEl.textContent = def ? def.definition : 'A wonderful word worth exploring.';
      exampleEl.textContent = def && def.example ? `"${def.example}"` : '';
    } else {
      const offline = OFFLINE_WORDS[word];
      phonEl.textContent = offline.phonetic;
      posEl.textContent = offline.pos;
      meaningEl.textContent = offline.meaning;
      exampleEl.textContent = `"${offline.example}"`;
    }

    $('#wotdSpeak').onclick = () => speakWord(word, $('#wotdSpeak'));
    $('#wotdExplore').onclick = () => runSearch(word);
  }

  /* ---------------- CATEGORIES ---------------- */
  function renderCategories() {
    categoryGrid.innerHTML = CATEGORIES.map((cat) => `
      <a class="category-card" href="${cat.page}" style="--cat-color:${cat.color}" aria-label="Explore ${cat.name}">
        <div class="category-dot"></div>
        <h3>${cat.name}</h3>
        <p>${cat.desc}</p>
        <div class="category-words">
          ${cat.words.map(w => `<button type="button" data-word="${w}">${w}</button>`).join('')}
        </div>
        <span class="category-cta">Explore collection <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </a>
    `).join('');

    categoryGrid.querySelectorAll('button[data-word]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        runSearch(btn.dataset.word);
        document.getElementById('dictionary').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------------- SPEECH SYNTHESIS ---------------- */
  function speakWord(word, btn) {
    if (!('speechSynthesis' in window)) {
      showToast('Speech is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.92;
    utterance.onstart = () => btn && btn.classList.add('speaking');
    utterance.onend = () => btn && btn.classList.remove('speaking');
    utterance.onerror = () => btn && btn.classList.remove('speaking');
    window.speechSynthesis.speak(utterance);
  }

  /* ---------------- API FETCH ---------------- */
  async function fetchDefinition(word) {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
    if (!res.ok) {
      if (res.status === 404) {
        const err = new Error('not-found');
        err.notFound = true;
        throw err;
      }
      throw new Error('api-error');
    }
    return res.json();
  }

  /* ---------------- STATE RENDERS ---------------- */
  function renderLoading(word) {
    resultArea.innerHTML = `
      <div class="state-card loading">
        <svg class="state-icon" viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="9" stroke-dasharray="42 20"/></svg>
        <h3>Searching the dictionary<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></h3>
        <p>Looking up "${escapeHtml(word)}" for you.</p>
      </div>
    `;
  }

  function renderNotFound(word) {
    resultArea.innerHTML = `
      <div class="state-card">
        <svg class="state-icon" viewBox="0 0 24 24" width="40" height="40"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg>
        <h3>Couldn't find that word.</h3>
        <p>Check the spelling or try another word.</p>
      </div>
    `;
  }

  function renderApiError(word) {
    resultArea.innerHTML = `
      <div class="state-card">
        <svg class="state-icon" viewBox="0 0 24 24" width="40" height="40"><path d="M12 3l9 16H3Z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none"/></svg>
        <h3>Dictionary service is temporarily unavailable.</h3>
        <p>Please try again in a moment. Your favorites, history and categories still work offline.</p>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- RESULT CARD ---------------- */
  function posClass(pos) {
    const map = { noun: 'pos-noun', verb: 'pos-verb', adjective: 'pos-adjective', adverb: 'pos-adverb' };
    return map[pos] || 'pos-other';
  }

  function renderResult(word, apiData) {
    const entry = apiData[0];
    const phonetic = entry.phonetic || ((entry.phonetics || []).find(p => p.text) || {}).text || '';
    const isFav = isFavorite(word);

    const meaningsHtml = (entry.meanings || []).map((meaning) => {
      const defsHtml = (meaning.definitions || []).slice(0, 4).map((d, i) => `
        <div class="def-item">
          <span class="def-num">${i + 1}</span>
          <div>
            <p class="def-text">${escapeHtml(d.definition)}</p>
            ${d.example ? `<p class="def-example">"${escapeHtml(d.example)}"</p>` : ''}
          </div>
        </div>
      `).join('');

      const synonyms = new Set();
      const antonyms = new Set();
      (meaning.synonyms || []).forEach(s => synonyms.add(s));
      (meaning.antonyms || []).forEach(a => antonyms.add(a));
      (meaning.definitions || []).forEach(d => {
        (d.synonyms || []).forEach(s => synonyms.add(s));
        (d.antonyms || []).forEach(a => antonyms.add(a));
      });

      return `
        <div class="meaning-block">
          <span class="pos-badge ${posClass(meaning.partOfSpeech)}">${escapeHtml(meaning.partOfSpeech || 'word')}</span>
          ${defsHtml}
          ${synonyms.size ? `
            <p class="word-section-title">Synonyms</p>
            <div class="tag-row">${[...synonyms].slice(0, 8).map(s => `<button type="button" class="tag" data-word="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}</div>
          ` : ''}
          ${antonyms.size ? `
            <p class="word-section-title">Antonyms</p>
            <div class="tag-row">${[...antonyms].slice(0, 8).map(a => `<button type="button" class="tag antonym-tag" data-word="${escapeHtml(a)}">${escapeHtml(a)}</button>`).join('')}</div>
          ` : ''}
        </div>
      `;
    }).join('');

    const origin = entry.origin ? `
      <p class="word-section-title">Origin</p>
      <p class="origin-block">${escapeHtml(entry.origin)}</p>
    ` : '';

    resultArea.innerHTML = `
      <article class="result-card">
        <div class="result-top">
          <div class="result-word-block">
            <h2 class="result-word">${escapeHtml(entry.word || word)}</h2>
          </div>
          <div class="result-actions">
            <button class="icon-btn" id="speakBtn" type="button" aria-label="Pronounce ${escapeHtml(word)}">
              <svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/></svg>
            </button>
            <button class="icon-btn ${isFav ? 'favorited' : ''}" id="favBtn" type="button" aria-pressed="${isFav}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              <svg viewBox="0 0 24 24" width="19" height="19"><path d="M12 21s-7.5-4.8-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.9.7 5 2.3C11.7 4.7 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C20.7 16.2 12 21 12 21Z"/></svg>
            </button>
          </div>
        </div>
        <div class="result-meta-row">
          ${phonetic ? `<span class="phonetic">${escapeHtml(phonetic)}</span>` : ''}
        </div>
        ${meaningsHtml}
        ${origin}
      </article>
    `;

    $('#speakBtn').addEventListener('click', () => speakWord(entry.word || word, $('#speakBtn')));
    $('#favBtn').addEventListener('click', () => toggleFavorite(word, entry));

    resultArea.querySelectorAll('.tag[data-word]').forEach((tag) => {
      tag.addEventListener('click', () => runSearch(tag.dataset.word));
    });
  }

  /* ---------------- SEARCH FLOW ---------------- */
  let searchToken = 0;
  async function runSearch(rawWord) {
    const word = (rawWord || '').trim();
    if (!word) return;

    searchInput.value = word;
    const myToken = ++searchToken;
    renderLoading(word);

    incrementSearchCount();
    addToHistory(word);

    try {
      const data = await fetchDefinition(word);
      if (myToken !== searchToken) return;
      renderResult(word, data);
    } catch (err) {
      if (myToken !== searchToken) return;
      if (err && err.notFound) {
        renderNotFound(word);
      } else if (OFFLINE_WORDS[word.toLowerCase()]) {
        renderResult(word, [offlineToApiShape(word.toLowerCase())]);
      } else {
        renderApiError(word);
      }
    }
    renderStats();
    window.scrollTo({ top: document.getElementById('dictionary').offsetTop - 90, behavior: 'smooth' });
  }

  function offlineToApiShape(word) {
    const o = OFFLINE_WORDS[word];
    return {
      word,
      phonetic: o.phonetic,
      meanings: [{
        partOfSpeech: o.pos,
        definitions: [{ definition: o.meaning, example: o.example }],
        synonyms: o.synonyms,
        antonyms: o.antonyms
      }]
    };
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch(searchInput.value);
  });

  document.querySelectorAll('.chip[data-word]').forEach((chip) => {
    chip.addEventListener('click', () => runSearch(chip.dataset.word));
  });

  /* ---------------- FAVORITES ---------------- */
  function getFavorites() {
    return storage.get(KEYS.favorites, []);
  }

  function isFavorite(word) {
    return getFavorites().some(f => f.word.toLowerCase() === word.toLowerCase());
  }

  function toggleFavorite(word, entry) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.word.toLowerCase() === word.toLowerCase());
    const favBtn = $('#favBtn');

    if (idx > -1) {
      favs.splice(idx, 1);
      showToast(`Removed "${word}" from favorites`);
    } else {
      const meaning = entry.meanings && entry.meanings[0];
      const def = meaning && meaning.definitions && meaning.definitions[0];
      favs.unshift({
        word: entry.word || word,
        pos: meaning ? meaning.partOfSpeech : '',
        def: def ? def.definition : ''
      });
      showToast(`Added "${word}" to favorites`);
      if (favBtn) favBtn.classList.add('heart-pop');
      setTimeout(() => favBtn && favBtn.classList.remove('heart-pop'), 400);
    }

    storage.set(KEYS.favorites, favs);
    if (favBtn) {
      const nowFav = idx === -1;
      favBtn.classList.toggle('favorited', nowFav);
      favBtn.setAttribute('aria-pressed', String(nowFav));
      favBtn.setAttribute('aria-label', nowFav ? 'Remove from favorites' : 'Add to favorites');
    }
    renderFavorites();
    renderStats();
  }

  function removeFavorite(word) {
    const favs = getFavorites().filter(f => f.word.toLowerCase() !== word.toLowerCase());
    storage.set(KEYS.favorites, favs);
    renderFavorites();
    renderStats();
    showToast(`Removed "${word}" from favorites`);
  }

  function renderFavorites() {
    const favs = getFavorites();
    if (!favs.length) {
      favoritesList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 21s-7.5-4.8-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.9.7 5 2.3C11.7 4.7 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C20.7 16.2 12 21 12 21Z"/></svg>
          <p>No favorites yet</p>
          <p>Search a word and tap the heart to save it here.</p>
        </div>
      `;
      return;
    }
    favoritesList.innerHTML = favs.map(f => `
      <div class="fav-card">
        <div class="fav-top">
          <span class="fav-word">${escapeHtml(f.word)}</span>
          <button class="fav-remove" type="button" data-word="${escapeHtml(f.word)}" aria-label="Remove ${escapeHtml(f.word)} from favorites">
            <svg viewBox="0 0 24 24" width="15" height="15"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
          </button>
        </div>
        ${f.pos ? `<span class="pos-badge ${posClass(f.pos)}" style="width:fit-content;">${escapeHtml(f.pos)}</span>` : ''}
        <p class="fav-def">${escapeHtml(f.def || 'No definition available.')}</p>
        <div class="fav-bottom">
          <button class="fav-open" type="button" data-word="${escapeHtml(f.word)}">Open →</button>
        </div>
      </div>
    `).join('');

    favoritesList.querySelectorAll('.fav-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFavorite(btn.dataset.word));
    });
    favoritesList.querySelectorAll('.fav-open').forEach(btn => {
      btn.addEventListener('click', () => runSearch(btn.dataset.word));
    });
  }

  /* ---------------- HISTORY ---------------- */
  function getHistory() {
    return storage.get(KEYS.history, []);
  }

  function addToHistory(word) {
    let hist = getHistory().filter(h => h.word.toLowerCase() !== word.toLowerCase());
    hist.unshift({ word, time: Date.now() });
    hist = hist.slice(0, 20);
    storage.set(KEYS.history, hist);
    renderHistory();
  }

  function removeHistoryItem(word, time) {
    const hist = getHistory().filter(h => !(h.word === word && h.time === time));
    storage.set(KEYS.history, hist);
    renderHistory();
    renderStats();
  }

  function clearHistory() {
    storage.set(KEYS.history, []);
    renderHistory();
    renderStats();
    showToast('History cleared');
  }

  clearHistoryBtn.addEventListener('click', clearHistory);

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `Today, ${timeStr}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  }

  function renderHistory() {
    const hist = getHistory();
    if (!hist.length) {
      historyList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
          <p>No searches yet</p>
          <p>Words you look up will appear here.</p>
        </div>
      `;
      return;
    }
    historyList.innerHTML = hist.map(h => `
      <div class="history-item">
        <div class="history-main">
          <span class="history-word">${escapeHtml(h.word)}</span>
          <span class="history-time">${formatTime(h.time)}</span>
        </div>
        <div class="history-actions">
          <button class="history-open" type="button" data-word="${escapeHtml(h.word)}">Open</button>
          <button class="history-remove" type="button" data-word="${escapeHtml(h.word)}" data-time="${h.time}" aria-label="Remove ${escapeHtml(h.word)} from history">
            <svg viewBox="0 0 24 24" width="14" height="14"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    historyList.querySelectorAll('.history-open').forEach(btn => {
      btn.addEventListener('click', () => runSearch(btn.dataset.word));
    });
    historyList.querySelectorAll('.history-remove').forEach(btn => {
      btn.addEventListener('click', () => removeHistoryItem(btn.dataset.word, Number(btn.dataset.time)));
    });
  }

  /* ---------------- STATS ---------------- */
  function incrementSearchCount() {
    const count = storage.get(KEYS.searchCount, 0) + 1;
    storage.set(KEYS.searchCount, count);
  }

  function animateNumber(el, target) {
    const start = Number(el.textContent.replace(/,/g, '')) || 0;
    if (start === target) return;
    const duration = 500;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * eased);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderStats() {
    animateNumber($('#statSearches'), storage.get(KEYS.searchCount, 0));
    animateNumber($('#statFavorites'), getFavorites().length);
    animateNumber($('#statHistory'), getHistory().length);
  }

  /* ---------------- SCROLLSPY ---------------- */
  function initScrollSpy() {
    const sections = ['top', 'dictionary', 'favorites', 'history', 'about']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    const links = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => l.classList.toggle('active-nav', l.dataset.nav === id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ---------------- INIT ---------------- */
  function init() {
    initTheme();
    renderCategories();
    renderFavorites();
    renderHistory();
    renderStats();
    renderWordOfDay();
    initScrollSpy();
  }

  document.addEventListener('DOMContentLoaded', init);
})();