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

// Local fallback dictionary for core UI terms (offline support & rate limit bypass)
const LOCAL_DICTIONARY = {
  "Dashboard": {
    hi: "डैशबोर्ड",
    te: "డ్యాష్‌బోర్డ్",
    mr: "डॅशबोर्ड"
  },
  "Scan & Solve": {
    hi: "स्कैन और हल करें",
    te: "స్కాన్ & పరిష్కరించండి",
    mr: "स्कॅन आणि सोडवा"
  },
  "← Back": {
    hi: "← पीछे",
    te: "← వెనుకకు",
    mr: "← मागे"
  },
  "← Back to Home": {
    hi: "← होम पर वापस",
    te: "← హోమ్‌కి తిరిగి వెళ్ళు",
    mr: "← मुख्यपृष्ठावर परत"
  },
  "← Back to Dashboard": {
    hi: "← डैशबोर्ड पर वापस",
    te: "← డ్యాష్‌బోర్డ్‌కి తిరిగి వెళ్ళు",
    mr: "← डॅशबोर्डवर परत"
  },
  "← Back to Labs": {
    hi: "← लैब्स पर वापस",
    te: "← ల్యాబ్స్ కి తిరిగి వెళ్ళు",
    mr: "← लॅबवर परत"
  },
  "Video-Text Learning": {
    hi: "वीडियो-टेक्स्ट लर्निंग",
    te: "వీడియో-టెక్స్ట్ లెర్నింగ్",
    mr: "व्हिडिओ-टेक्स्ट लर्निंग"
  },
  "Gamified Learning": {
    hi: "गेमीफाइड लर्निंग",
    te: "గేమిఫైడ్ లెర్నిंग",
    mr: "गेमीफाइड लर्निंग"
  },
  "Start Learning": {
    hi: "सीखना शुरू करें",
    te: "నేర్చుకోవడం ప్రారంభించండి",
    mr: "शिकायला सुरुवात करा"
  },
  "Play Games": {
    hi: "खेलें",
    te: "ఆటలు ఆడండి",
    mr: "खेळ खेळा"
  }
};

// ── Track the last translated language to detect screen changes
let _lastTranslatedLang = null;
let _isTranslating = false;

// ─────────────────────────────────────────────────────────────
// Core API call — translate a single string
// ─────────────────────────────────────────────────────────────
async function _fetchTranslation(text, langCode) {
  if (!text || !text.trim() || langCode === 'en') return text;

  const trimmed = text.trim();
  if (LOCAL_DICTIONARY[trimmed] && LOCAL_DICTIONARY[trimmed][langCode]) {
    return LOCAL_DICTIONARY[trimmed][langCode];
  }

  const cacheKey = `${text}||${langCode}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  try {
    const token = localStorage.getItem('vq_token');
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        texts: [trimmed],
        targetLanguage: langCode
      })
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const translated = json?.translations?.[0] || text;
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
      
      // Check cache first
      const cacheKey = `${original}||${lang}`;
      if (_cache.has(cacheKey)) {
        el.textContent = _cache.get(cacheKey);
      } else if (LOCAL_DICTIONARY[original.trim()] && LOCAL_DICTIONARY[original.trim()][lang]) {
        el.textContent = LOCAL_DICTIONARY[original.trim()][lang];
      } else if (_isTranslatable(original)) {
        toTranslate.push({ el, text: original });
      }
    });

    if (toTranslate.length > 0) {
      const textsToTranslate = toTranslate.map(item => item.text.trim());
      const token = localStorage.getItem('vq_token');
      
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLanguage: lang
        })
      });

      if (res.ok) {
        const json = await res.json();
        const translations = json.translations || [];
        toTranslate.forEach((item, idx) => {
          const translated = translations[idx] || item.text;
          item.el.textContent = translated;
          // Store in cache
          const cacheKey = `${item.text}||${lang}`;
          _cache.set(cacheKey, translated);
        });
      } else {
        throw new Error('Translation API returned non-OK status');
      }
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
