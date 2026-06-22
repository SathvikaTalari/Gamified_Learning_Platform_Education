// ═══════════════════════════════════════════════════════════════
//   VidyaQuest — Live Translation Engine
//   Uses MyMemory free API (no API key required)
//   Supports: English (en), Hindi (hi), Telugu (te), Marathi (mr)
// ═══════════════════════════════════════════════════════════════

const LANG_META = {
  en: { name: 'English',        native: 'English',      flag: '🇬🇧', dir: 'ltr' },
  hi: { name: 'Hindi',          native: 'हिंदी',         flag: '🇮🇳', dir: 'ltr' },
  te: { name: 'Telugu',         native: 'తెలుగు',        flag: '🇮🇳', dir: 'ltr' },
  mr: { name: 'Marathi',        native: 'मराठी',         flag: '🇮🇳', dir: 'ltr' },
};

const LANG_PAIRS = { hi: 'en|hi', te: 'en|te', mr: 'en|mr' };

// ── Translation cache keyed by "originalText||langCode"
const _cache = new Map();

// ── Track the last translated language to detect screen changes
let _lastTranslatedLang = null;
let _isTranslating = false;

// ─────────────────────────────────────────────────────────────
// Core API call — translate a single string
// ─────────────────────────────────────────────────────────────
async function _fetchTranslation(text, langCode) {
  if (!text || !text.trim() || langCode === 'en') return text;

  const cacheKey = `${text}||${langCode}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  const langpair = LANG_PAIRS[langCode];
  if (!langpair) return text;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const translated = json?.responseData?.translatedText || text;
    // MyMemory sometimes returns error strings — detect them
    if (translated.toLowerCase().includes('mymemory warning') || translated.toLowerCase().includes('quota')) {
      return text; // fallback to original
    }
    _cache.set(cacheKey, translated);
    return translated;
  } catch (e) {
    console.warn(`[TranslationEngine] Failed to translate "${text.slice(0,30)}..." → ${langCode}`, e.message);
    return text; // always fallback gracefully
  }
}

// ─────────────────────────────────────────────────────────────
// Utility — check if text is worth translating
// (Skip pure emoji/icons, numbers, single chars, HTML symbols)
// ─────────────────────────────────────────────────────────────
function _isTranslatable(text) {
  if (!text) return false;
  const stripped = text.trim();
  if (stripped.length < 2) return false;
  // Skip if it's only emoji, numbers, punctuation
  if (/^[\p{Emoji}\s\d\W]+$/u.test(stripped)) return false;
  // Skip if it looks like a code/variable/URL
  if (/^[A-Z_]+$/.test(stripped)) return false;
  // Must contain at least 2 letters
  if ((stripped.match(/[a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0900-\u097F]/g) || []).length < 2) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────
// Translate all elements marked with [data-i18n] on the page
// ─────────────────────────────────────────────────────────────
async function translatePage(lang) {
  if (lang === 'en') {
    _restoreOriginals();
    _lastTranslatedLang = 'en';
    return;
  }

  if (_isTranslating) return; // prevent concurrent calls
  _isTranslating = true;
  _showTranslatingIndicator();

  try {
    const elements = document.querySelectorAll('[data-i18n]');
    const toTranslate = [];

    elements.forEach(el => {
      // Store original text once
      if (!el.dataset.i18nOriginal) {
        el.dataset.i18nOriginal = el.textContent.trim();
      }
      const original = el.dataset.i18nOriginal;
      if (_isTranslatable(original)) {
        toTranslate.push({ el, text: original });
      }
    });

    // Batch translate in parallel (max 10 at a time to respect rate limits)
    const BATCH_SIZE = 10;
    for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
      const batch = toTranslate.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(item => _fetchTranslation(item.text, lang))
      );
      results.forEach((translated, idx) => {
        const { el } = batch[idx];
        el.textContent = translated;
      });
    }

    _lastTranslatedLang = lang;
  } catch (e) {
    console.error('[TranslationEngine] translatePage error:', e);
  } finally {
    _isTranslating = false;
    _hideTranslatingIndicator();
  }
}

// ─────────────────────────────────────────────────────────────
// Translate a single element's textContent (for dynamic content)
// ─────────────────────────────────────────────────────────────
async function translateElement(el, lang) {
  if (!el || lang === 'en') return;
  const text = el.dataset.i18nOriginal || el.textContent.trim();
  if (!_isTranslatable(text)) return;
  if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = text;
  el.dataset.i18n = 'true';
  const translated = await _fetchTranslation(text, lang);
  el.textContent = translated;
}

// ─────────────────────────────────────────────────────────────
// Translate a plain string and return the result
// (Useful for toast messages, alerts, dynamic text)
// ─────────────────────────────────────────────────────────────
async function translateString(text, lang) {
  if (lang === 'en' || !_isTranslatable(text)) return text;
  return await _fetchTranslation(text, lang);
}

// ─────────────────────────────────────────────────────────────
// Restore all elements to their original English text
// ─────────────────────────────────────────────────────────────
function _restoreOriginals() {
  document.querySelectorAll('[data-i18n][data-i18n-original]').forEach(el => {
    el.textContent = el.dataset.i18nOriginal;
  });
}

// ─────────────────────────────────────────────────────────────
// Loading indicator — shown while translation is in progress
// ─────────────────────────────────────────────────────────────
function _showTranslatingIndicator() {
  let indicator = document.getElementById('translating-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'translating-indicator';
    indicator.className = 'translating-indicator';
    indicator.innerHTML = `<span class="translating-dot"></span><span class="translating-dot"></span><span class="translating-dot"></span><span style="margin-left:6px;font-size:0.75rem;">Translating…</span>`;
    document.body.appendChild(indicator);
  }
  indicator.classList.add('visible');
}

function _hideTranslatingIndicator() {
  const indicator = document.getElementById('translating-indicator');
  if (indicator) indicator.classList.remove('visible');
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────
const TranslationEngine = {
  translatePage,
  translateElement,
  translateString,
  getLangMeta: (lang) => LANG_META[lang] || LANG_META.en,
  clearCache: () => _cache.clear(),
};

// ─────────────────────────────────────────────────────────────
// Legacy compatibility — applyTranslations(lang) from old system
// ─────────────────────────────────────────────────────────────
function applyTranslations(lang) {
  TranslationEngine.translatePage(lang);
}
