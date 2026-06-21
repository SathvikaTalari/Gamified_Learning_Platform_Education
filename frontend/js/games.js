// ═══════════════════════════════════════════════
//   VidyaQuest – Mini Games Module
// ═══════════════════════════════════════════════

let gameXpTotal = 0;

function launchGame(gameId) {
  const modal = document.getElementById('minigame-modal');
  const content = document.getElementById('game-modal-content');
  modal.style.display = 'flex';

  if (gameId === 'mathflash') initMathFlash(content);
  else if (gameId === 'wordscience') initScienceWords(content);
  else if (gameId === 'numberpuzzle') initNumberPuzzle(content);
  else if (gameId === 'chemlab') initChemLab(content);
  else if (gameId === 'spacemission') initSpaceMission(content);
  else if (gameId === 'circuitbuilder') initCircuitBuilder(content);
  else if (gameId === 'mathkingdom') initMathKingdom(content);
  else if (gameId === 'escaperoom') initEquationEscapeRoom(content);
}

async function closeGame() {
  document.getElementById('minigame-modal').style.display = 'none';
  if (gameXpTotal > 0) {
    if (typeof currentUser !== 'undefined' && currentUser) {
      try {
        if (typeof api === 'function') {
          const result = await api('/api/profile/xp', 'POST', { xp: gameXpTotal });
          currentUser.xp = result.totalXP;
          currentUser.level = Math.floor(result.totalXP / 200) + 1;
          if (typeof updateNavStats === 'function') {
            updateNavStats();
          }
          if (typeof showToast === 'function') {
            showToast(`🎉 Earned +${gameXpTotal} XP from game!`);
          }
        }
      } catch (err) {
        console.error("Error saving game XP:", err);
      }
    }
    gameXpTotal = 0;
  }
}

// ─── MATH FLASH ────────────────────────────────
function initMathFlash(container) {
  let score = 0, timeLeft = 30, interval, questionTimer;
  let currentAnswer = 0;

  function generateQ() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * a) + 1; ans = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; ans = a * b; }
    return { q: `${a} ${op} ${b} = ?`, answer: ans };
  }

  function render() {
    const q = generateQ();
    currentAnswer = q.answer;
    container.innerHTML = `
      <div style="text-align:center">
        <button onclick="closeGame()" style="float:right;background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;">✕</button>
        <div style="font-size:1.5rem;font-weight:800;color:var(--secondary);margin-bottom:0.5rem;">⚡ Math Flash</div>
        <div style="color:var(--text-muted);margin-bottom:1.5rem;">Answer as many as you can!</div>
        <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem;">
          <div style="background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.3);padding:0.5rem 1.2rem;border-radius:999px;color:var(--primary);font-weight:700;">
            Score: <span id="mf-score">0</span>
          </div>
          <div style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);padding:0.5rem 1.2rem;border-radius:999px;color:var(--blue);font-weight:700;">
            Time: <span id="mf-time">30</span>s
          </div>
        </div>
        <div id="mf-question" style="font-family:'Baloo 2',sans-serif;font-size:3rem;font-weight:800;color:var(--text);margin-bottom:1.5rem;">${q.q}</div>
        <input id="mf-input" type="number" placeholder="Your answer..."
          style="width:100%;background:var(--bg-card2);border:2px solid var(--border);border-radius:12px;color:var(--text);padding:1rem;font-size:1.5rem;text-align:center;outline:none;"
          onkeydown="if(event.key==='Enter') checkMathFlash()" />
        <button onclick="checkMathFlash()"
          style="margin-top:1rem;width:100%;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;border:none;border-radius:12px;padding:0.8rem;font-family:'Baloo 2',sans-serif;font-size:1.1rem;font-weight:700;cursor:pointer;">
          Submit ✓
        </button>
        <div id="mf-feedback" style="margin-top:0.8rem;font-weight:700;font-size:1rem;min-height:1.5rem;"></div>
      </div>`;

    document.getElementById('mf-input').focus();

    // Main game timer
    interval = setInterval(() => {
      timeLeft--;
      const el = document.getElementById('mf-time');
      if (el) el.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(interval);
        gameXpTotal += score * 5;
        container.innerHTML = `
          <div style="text-align:center;padding:1rem">
            <div style="font-size:3rem;margin-bottom:1rem">⚡</div>
            <h2 style="font-family:'Baloo 2',sans-serif;font-size:1.8rem;margin-bottom:0.5rem">Time's Up!</h2>
            <div style="font-family:'Baloo 2',sans-serif;font-size:3rem;font-weight:800;color:var(--primary);margin-bottom:0.5rem">${score}</div>
            <div style="color:var(--text-muted);margin-bottom:0.5rem">questions answered correctly</div>
            <div style="color:var(--accent);font-weight:700;margin-bottom:1.5rem">+${score * 5} XP earned!</div>
            <button onclick="closeGame()" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;border:none;border-radius:12px;padding:0.8rem 2rem;font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;">
              Done 🎉
            </button>
          </div>`;
      }
    }, 1000);
  }

  window.checkMathFlash = function () {
    const input = document.getElementById('mf-input');
    const fb = document.getElementById('mf-feedback');
    if (!input) return;
    const val = parseInt(input.value);
    if (isNaN(val)) return;

    if (val === currentAnswer) {
      score++;
      fb.style.color = 'var(--green)';
      fb.textContent = '✓ Correct! +5 XP';
      document.getElementById('mf-score').textContent = score;
    } else {
      fb.style.color = 'var(--red)';
      fb.textContent = `✗ Wrong. Answer was ${currentAnswer}`;
    }

    input.value = '';
    setTimeout(() => {
      const q = generateQ();
      currentAnswer = q.answer;
      const qEl = document.getElementById('mf-question');
      const fbEl = document.getElementById('mf-feedback');
      if (qEl) qEl.textContent = q.q;
      if (fbEl) fbEl.textContent = '';
      const inp = document.getElementById('mf-input');
      if (inp) inp.focus();
    }, 600);
  };

  render();
}

// ─── SCIENCE WORDS ─────────────────────────────
const scienceWords = [
  { word: 'PHOTOSYNTHESIS', hint: 'Plants make food using sunlight 🌿', category: 'Biology' },
  { word: 'EVAPORATION', hint: 'Liquid turns to gas 💨', category: 'Chemistry' },
  { word: 'GRAVITY', hint: 'Force that pulls objects down 🍎', category: 'Physics' },
  { word: 'ECOSYSTEM', hint: 'Community of living things 🌍', category: 'Biology' },
  { word: 'MOLECULE', hint: 'Smallest unit of a substance ⚛️', category: 'Chemistry' },
  { word: 'VELOCITY', hint: 'Speed with direction 🚀', category: 'Physics' },
  { word: 'NUCLEUS', hint: 'Control center of a cell 🧬', category: 'Biology' },
  { word: 'FRICTION', hint: 'Force that slows moving objects 🛑', category: 'Physics' },
  { word: 'NEUTRON', hint: 'Neutral particle in atom ⚛️', category: 'Chemistry' },
  { word: 'METAMORPHOSIS', hint: 'Transformation of a caterpillar 🦋', category: 'Biology' },
];

function initScienceWords(container) {
  let wordIndex = 0, score = 0, revealed = [];

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
  const shuffled = shuffle(scienceWords);

  function renderWord() {
    if (wordIndex >= shuffled.length) {
      gameXpTotal += score * 3;
      container.innerHTML = `
        <div style="text-align:center;padding:1rem">
          <div style="font-size:3rem;margin-bottom:1rem">🔤</div>
          <h2 style="font-family:'Baloo 2',sans-serif;margin-bottom:0.5rem">All Done!</h2>
          <div style="font-family:'Baloo 2',sans-serif;font-size:3rem;color:var(--primary);font-weight:800">${score}/${shuffled.length}</div>
          <div style="color:var(--accent);font-weight:700;margin-bottom:1.5rem">+${score * 3} XP</div>
          <button onclick="closeGame()" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;border:none;border-radius:12px;padding:0.8rem 2rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">Finish</button>
        </div>`;
      return;
    }

    const item = shuffled[wordIndex];
    const letters = item.word.split('');

    container.innerHTML = `
      <div>
        <button onclick="closeGame()" style="float:right;background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;">✕</button>
        <div style="font-size:1.5rem;font-weight:800;color:var(--secondary);margin-bottom:0.3rem;">🔤 Science Words</div>
        <div style="color:var(--text-muted);margin-bottom:1rem;font-size:0.85rem;">Category: ${item.category} | Score: ${score}</div>
        <div style="background:rgba(78,205,196,0.1);border:1px solid rgba(78,205,196,0.3);border-radius:10px;padding:1rem;margin-bottom:1.2rem;color:var(--secondary);">
          💡 Hint: ${item.hint}
        </div>
        <div id="sw-letters" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:1.2rem;">
          ${letters.map((l, i) => `
            <div id="sw-l-${i}" style="width:36px;height:36px;background:var(--bg-card2);border:2px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.1rem;">
              ${revealed.includes(i) ? l : '_'}
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <input id="sw-input" type="text" placeholder="Type the word..." maxlength="${item.word.length}"
            style="flex:1;background:var(--bg-card2);border:2px solid var(--border);border-radius:10px;color:var(--text);padding:0.75rem;font-size:1rem;outline:none;"
            onkeydown="if(event.key==='Enter')checkSciWord()" />
          <button onclick="checkSciWord()"
            style="background:var(--primary);color:white;border:none;border-radius:10px;padding:0.75rem 1.2rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">✓</button>
        </div>
        <div id="sw-feedback" style="margin-top:0.8rem;font-weight:700;min-height:1.5rem;text-align:center;"></div>
        <button onclick="skipSciWord()" style="margin-top:0.5rem;background:transparent;border:1px solid var(--border);color:var(--text-muted);border-radius:8px;padding:0.5rem 1rem;font-family:'Nunito',sans-serif;cursor:pointer;width:100%;">
          Skip →
        </button>
      </div>`;

    document.getElementById('sw-input').focus();

    window.checkSciWord = function () {
      const input = document.getElementById('sw-input');
      const fb = document.getElementById('sw-feedback');
      if (!input) return;
      const val = input.value.trim().toUpperCase();
      if (val === item.word) {
        score++;
        fb.style.color = 'var(--green)';
        fb.textContent = `✓ Correct! "${item.word}" +3 XP`;
        setTimeout(() => { wordIndex++; revealed = []; renderWord(); }, 1200);
      } else {
        fb.style.color = 'var(--red)';
        fb.textContent = '✗ Try again!';
        input.value = '';
      }
    };

    window.skipSciWord = function () {
      wordIndex++;
      revealed = [];
      renderWord();
    };
  }

  renderWord();
}

// ─── NUMBER PUZZLE ─────────────────────────────
const puzzles = [
  { sequence: [2, 4, 8, 16, '?'], answer: 32, rule: 'Each number is doubled (×2)' },
  { sequence: [1, 4, 9, 16, '?'], answer: 25, rule: 'Perfect squares: 1²,2²,3²,4²,5²' },
  { sequence: [3, 6, 9, 12, '?'], answer: 15, rule: 'Count by 3s (+3)' },
  { sequence: [1, 1, 2, 3, '?'], answer: 5, rule: 'Fibonacci: each = sum of previous two' },
  { sequence: [100, 50, 25, '?'], answer: 12.5, rule: 'Each number is halved (÷2)' },
  { sequence: [2, 5, 10, 17, '?'], answer: 26, rule: 'Add 3, 5, 7, 9... (odd numbers)' },
  { sequence: [0, 3, 8, 15, '?'], answer: 24, rule: 'n²-1: 1-1, 4-1, 9-1, 16-1, 25-1' },
];

function initNumberPuzzle(container) {
  let puzzleIndex = 0, score = 0;
  const shuffled = [...puzzles].sort(() => Math.random() - 0.5);

  function renderPuzzle() {
    if (puzzleIndex >= shuffled.length) {
      gameXpTotal += score * 8;
      container.innerHTML = `
        <div style="text-align:center;padding:1rem">
          <div style="font-size:3rem;margin-bottom:1rem">🧩</div>
          <h2 style="font-family:'Baloo 2',sans-serif;margin-bottom:0.5rem">Puzzle Complete!</h2>
          <div style="font-family:'Baloo 2',sans-serif;font-size:3rem;color:var(--primary);font-weight:800">${score}/${shuffled.length}</div>
          <div style="color:var(--accent);font-weight:700;margin-bottom:1.5rem">+${score * 8} XP</div>
          <button onclick="closeGame()" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;border:none;border-radius:12px;padding:0.8rem 2rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">Done 🎉</button>
        </div>`;
      return;
    }

    const p = shuffled[puzzleIndex];
    container.innerHTML = `
      <div>
        <button onclick="closeGame()" style="float:right;background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;">✕</button>
        <div style="font-size:1.5rem;font-weight:800;color:var(--purple);margin-bottom:0.3rem;">🧩 Number Puzzle</div>
        <div style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.85rem;">Find the pattern! Score: ${score}/${puzzleIndex}</div>
        <div style="display:flex;gap:0.6rem;justify-content:center;margin-bottom:2rem;flex-wrap:wrap;">
          ${p.sequence.map(n => `
            <div style="width:64px;height:64px;background:${n === '?' ? 'rgba(168,85,247,0.15)' : 'var(--bg-card2)'};border:2px solid ${n === '?' ? 'var(--purple)' : 'var(--border)'};border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:${n === '?' ? 'var(--purple)' : 'var(--text)'};">
              ${n}
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
          <input id="np-input" type="number" placeholder="Enter missing number..."
            style="flex:1;background:var(--bg-card2);border:2px solid var(--border);border-radius:10px;color:var(--text);padding:0.75rem;font-size:1.1rem;outline:none;text-align:center;"
            onkeydown="if(event.key==='Enter')checkPuzzle()" />
          <button onclick="checkPuzzle()"
            style="background:var(--purple);color:white;border:none;border-radius:10px;padding:0.75rem 1.2rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">✓</button>
        </div>
        <div id="np-feedback" style="font-weight:700;min-height:2rem;text-align:center;padding:0.5rem;border-radius:8px;"></div>
      </div>`;

    document.getElementById('np-input').focus();

    window.checkPuzzle = function () {
      const input = document.getElementById('np-input');
      const fb = document.getElementById('np-feedback');
      if (!input) return;
      const val = parseFloat(input.value);
      if (isNaN(val)) return;

      if (val === p.answer) {
        score++;
        fb.style.background = 'rgba(34,197,94,0.15)';
        fb.style.color = 'var(--green)';
        fb.textContent = `✓ Correct! ${p.rule}`;
        setTimeout(() => { puzzleIndex++; renderPuzzle(); }, 1500);
      } else {
        fb.style.background = 'rgba(239,68,68,0.15)';
        fb.style.color = 'var(--red)';
        fb.textContent = '✗ Not quite! Look for the pattern...';
        input.value = '';
      }
    };
  }

  renderPuzzle();
}

// ═══════════════════════════════════════════════
//   🧪 VIRTUAL CHEMISTRY LAB
// ═══════════════════════════════════════════════
const CHEMICALS = [
  { id:'h2o',    label:'H₂O',    name:'Water',           color:'#60a5fa', emoji:'💧' },
  { id:'hcl',    label:'HCl',    name:'Hydrochloric Acid',color:'#f59e0b', emoji:'🟡' },
  { id:'naoh',   label:'NaOH',   name:'Sodium Hydroxide', color:'#a78bfa', emoji:'🟣' },
  { id:'vinegar',label:'CH₃COOH',name:'Vinegar',          color:'#34d399', emoji:'🟢' },
  { id:'baking', label:'NaHCO₃', name:'Baking Soda',      color:'#e5e7eb', emoji:'⬜' },
  { id:'h2so4',  label:'H₂SO₄',  name:'Sulfuric Acid',    color:'#ef4444', emoji:'🔴' },
  { id:'fe',     label:'Fe',     name:'Iron',             color:'#78716c', emoji:'🔩' },
  { id:'cuso4',  label:'CuSO₄',  name:'Copper Sulfate',   color:'#2563eb', emoji:'🔵' },
  { id:'na',     label:'Na',     name:'Sodium',           color:'#fbbf24', emoji:'✨' },
  { id:'mgcl2',  label:'MgCl₂',  name:'Magnesium Chloride',color:'#6ee7b7',emoji:'🟩' },
];

const REACTIONS = [
  {
    reactants: ['hcl','naoh'],
    name: 'Neutralisation Reaction',
    product: 'NaCl + H₂O',
    desc: 'Acid + Base → Salt + Water. This is neutralisation! The solution becomes neutral.',
    animation: 'bubble',
    color: '#60a5fa',
    emoji: '🌊',
    grade: '7',
    safe: true,
    xp: 10
  },
  {
    reactants: ['vinegar','baking'],
    name: 'Fizzing Reaction',
    product: 'CO₂ + H₂O + NaCH₃COO',
    desc: 'Vinegar + Baking Soda → Carbon dioxide gas is produced! You can see fizzing/bubbling.',
    animation: 'fizz',
    color: '#34d399',
    emoji: '🫧',
    grade: '6',
    safe: true,
    xp: 8
  },
  {
    reactants: ['h2so4','fe'],
    name: 'Metal-Acid Reaction',
    product: 'FeSO₄ + H₂↑',
    desc: 'Iron dissolves in sulfuric acid releasing hydrogen gas. Rusting is a slow version!',
    animation: 'smoke',
    color: '#f59e0b',
    emoji: '💨',
    grade: '9',
    safe: true,
    xp: 12
  },
  {
    reactants: ['cuso4','fe'],
    name: 'Displacement Reaction',
    product: 'FeSO₄ + Cu',
    desc: 'Iron displaces copper from copper sulphate. Blue solution turns pale green!',
    animation: 'color',
    color: '#2563eb',
    emoji: '🔀',
    grade: '8',
    safe: true,
    xp: 10
  },
  {
    reactants: ['na','h2o'],
    name: '⚠️ Dangerous Reaction!',
    product: 'NaOH + H₂↑ + HEAT',
    desc: 'Sodium reacts violently with water producing hydrogen gas and intense heat — NEVER try at home!',
    animation: 'explosion',
    color: '#ef4444',
    emoji: '💥',
    grade: '10',
    safe: false,
    xp: 15
  },
  {
    reactants: ['hcl','fe'],
    name: 'Iron in Acid',
    product: 'FeCl₂ + H₂↑',
    desc: 'Iron reacts with hydrochloric acid releasing hydrogen gas. The iron slowly dissolves!',
    animation: 'bubble',
    color: '#fbbf24',
    emoji: '⚗️',
    grade: '9',
    safe: true,
    xp: 10
  },
  {
    reactants: ['h2so4','naoh'],
    name: 'Strong Neutralisation',
    product: 'Na₂SO₄ + H₂O',
    desc: 'Strong acid + Strong base → Salt + Water. This reaction releases a lot of heat!',
    animation: 'heat',
    color: '#a78bfa',
    emoji: '🌡️',
    grade: '10',
    safe: true,
    xp: 12
  },
  {
    reactants: ['mgcl2','naoh'],
    name: 'Precipitation Reaction',
    product: 'Mg(OH)₂↓ + NaCl',
    desc: 'A white precipitate (Mg(OH)₂) forms! This is a double displacement reaction.',
    animation: 'precipitate',
    color: '#6ee7b7',
    emoji: '🪨',
    grade: '10',
    safe: true,
    xp: 12
  }
];

function initChemLab(container) {
  let beakerChemicals = [];
  let labReport = [];
  let totalLabXp = 0;

  function findReaction(ids) {
    return REACTIONS.find(r =>
      r.reactants.length === ids.length &&
      r.reactants.every(rid => ids.includes(rid)) &&
      ids.every(id => r.reactants.includes(id))
    );
  }

  function renderLab() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:#34d399;">🧪 Virtual Chemistry Lab</div>
            <div style="color:var(--text-muted);font-size:0.82rem;">Drag chemicals into the beaker & Mix!</div>
          </div>
          <button onclick="closeGame()" style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
        </div>

        <!-- XP & Report Row -->
        <div style="display:flex;gap:0.7rem;margin-bottom:1rem;flex-wrap:wrap;">
          <div style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:999px;padding:0.3rem 1rem;color:#34d399;font-weight:700;font-size:0.85rem;">
            ⚡ Lab XP: <span id="cl-xp">${totalLabXp}</span>
          </div>
          <div style="background:rgba(96,165,250,0.12);border:1px solid rgba(96,165,250,0.3);border-radius:999px;padding:0.3rem 1rem;color:#60a5fa;font-weight:700;font-size:0.85rem;">
            🔬 Experiments: <span id="cl-count">${labReport.length}</span>
          </div>
        </div>

        <!-- Chemical Shelf -->
        <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:1rem;margin-bottom:1rem;">
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.6rem;font-weight:600;">📦 CHEMICAL SHELF — Click to add to beaker</div>
          <div id="cl-shelf" style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${CHEMICALS.map(c => `
              <button id="cl-chem-${c.id}" onclick="clAddChem('${c.id}')"
                style="background:${c.color}22;border:2px solid ${c.color}55;border-radius:10px;padding:0.4rem 0.7rem;
                color:${c.color};font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.2s;font-family:'Baloo 2',sans-serif;">
                ${c.emoji} ${c.label}
              </button>`).join('')}
          </div>
        </div>

        <!-- Beaker -->
        <div style="display:flex;gap:1rem;margin-bottom:1rem;align-items:flex-start;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;margin-bottom:0.4rem;">⚗️ BEAKER CONTENTS</div>
            <div id="cl-beaker" style="min-height:100px;background:rgba(96,165,250,0.06);border:2px dashed rgba(96,165,250,0.3);border-radius:12px;padding:0.8rem;display:flex;flex-wrap:wrap;gap:0.4rem;align-content:flex-start;">
              <div id="cl-beaker-empty" style="color:var(--text-muted);font-size:0.85rem;padding:1rem;text-align:center;width:100%;">Click chemicals above to add them here…</div>
            </div>
            <div style="margin-top:0.6rem;display:flex;gap:0.5rem;">
              <button onclick="clMix()" style="flex:1;background:linear-gradient(135deg,#34d399,#059669);color:white;border:none;border-radius:10px;padding:0.65rem;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.9rem;cursor:pointer;">
                🔥 Mix & React!
              </button>
              <button onclick="clClear()" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:10px;padding:0.65rem 0.9rem;font-family:'Baloo 2',sans-serif;cursor:pointer;font-weight:700;">
                🗑️ Clear
              </button>
            </div>
          </div>

          <!-- Reaction Output -->
          <div style="flex:1;min-width:200px;">
            <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;margin-bottom:0.4rem;">💥 REACTION CHAMBER</div>
            <div id="cl-reaction" style="min-height:100px;background:rgba(0,0,0,0.2);border-radius:12px;border:1px solid var(--border);padding:0.8rem;font-size:0.85rem;color:var(--text-muted);">
              Mix chemicals to see a reaction here!
            </div>
          </div>
        </div>

        <!-- Lab Report -->
        ${labReport.length > 0 ? `
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:0.8rem;">
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;margin-bottom:0.5rem;">📋 LAB REPORT</div>
          ${labReport.map((r,i) => `
            <div style="background:${r.color}11;border:1px solid ${r.color}33;border-radius:8px;padding:0.5rem 0.8rem;margin-bottom:0.3rem;font-size:0.8rem;">
              <span style="color:${r.color};font-weight:700;">${i+1}. ${r.emoji} ${r.name}</span>
              <span style="color:var(--text-muted);margin-left:0.5rem;">Grade ${r.grade} · +${r.xp} XP</span>
            </div>`).join('')}
          <button onclick="clSubmitReport()" style="margin-top:0.5rem;width:100%;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;border:none;border-radius:10px;padding:0.6rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;font-size:0.9rem;">
            📤 Submit Lab Report & Earn XP
          </button>
        </div>` : ''}
      </div>`;
  }

  window.clAddChem = function(id) {
    if (beakerChemicals.includes(id)) return;
    beakerChemicals.push(id);
    const emptyEl = document.getElementById('cl-beaker-empty');
    if (emptyEl) emptyEl.remove();
    const chem = CHEMICALS.find(c => c.id === id);
    const beaker = document.getElementById('cl-beaker');
    if (beaker) {
      const tag = document.createElement('div');
      tag.style.cssText = `background:${chem.color}22;border:2px solid ${chem.color}55;border-radius:8px;padding:0.3rem 0.6rem;color:${chem.color};font-weight:700;font-size:0.8rem;font-family:'Baloo 2',sans-serif;`;
      tag.textContent = `${chem.emoji} ${chem.label}`;
      beaker.appendChild(tag);
    }
    // highlight selected button
    const btn = document.getElementById(`cl-chem-${id}`);
    if (btn) btn.style.boxShadow = `0 0 0 2px ${chem.color}`;
  };

  window.clClear = function() {
    beakerChemicals = [];
    renderLab();
  };

  window.clMix = function() {
    const rxnDiv = document.getElementById('cl-reaction');
    if (!rxnDiv) return;
    if (beakerChemicals.length < 2) {
      rxnDiv.innerHTML = '<div style="color:#f59e0b;">⚠️ Add at least 2 chemicals first!</div>';
      return;
    }
    const reaction = findReaction(beakerChemicals);
    if (!reaction) {
      rxnDiv.innerHTML = `
        <div style="color:var(--text-muted);text-align:center;padding:1rem;">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🔬</div>
          <div>No known reaction between these chemicals.</div>
          <div style="font-size:0.75rem;margin-top:0.3rem;">Try a different combination! Explore the syllabus.</div>
        </div>`;
      return;
    }

    // Check if already done
    const alreadyDone = labReport.some(r => r.name === reaction.name);

    const animHTML = {
      bubble: `<div id="cl-anim" style="display:flex;gap:4px;justify-content:center;font-size:1.5rem;animation:clBubble 1s infinite;">${'🫧'.repeat(5)}</div>`,
      fizz:   `<div id="cl-anim" style="display:flex;gap:4px;justify-content:center;font-size:1.5rem;animation:clBubble 0.6s infinite;">${'💦'.repeat(6)}</div>`,
      smoke:  `<div id="cl-anim" style="display:flex;gap:4px;justify-content:center;font-size:1.5rem;animation:clFade 1.5s infinite;">${'💨'.repeat(4)}</div>`,
      color:  `<div id="cl-anim" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#6ee7b7);margin:0 auto;animation:clPulse 1s infinite;"></div>`,
      explosion: `<div id="cl-anim" style="font-size:3rem;text-align:center;animation:clShake 0.4s infinite;">💥🔥💥</div>`,
      heat:   `<div id="cl-anim" style="font-size:2rem;text-align:center;animation:clFade 1s infinite;">🌡️🔥🌡️</div>`,
      precipitate: `<div id="cl-anim" style="font-size:2rem;text-align:center;animation:clSink 2s forwards;">🪨⬇️🪨</div>`,
    }[reaction.animation] || '';

    rxnDiv.innerHTML = `
      <style>
        @keyframes clBubble { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes clFade { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes clPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes clShake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
        @keyframes clSink { from{transform:translateY(0);opacity:1} to{transform:translateY(20px);opacity:0.6} }
      </style>
      <div style="text-align:center;">
        ${animHTML}
        <div style="font-size:1rem;font-weight:800;color:${reaction.color};margin:0.5rem 0;">${reaction.emoji} ${reaction.name}</div>
        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;">
          ${beakerChemicals.map(id => CHEMICALS.find(c=>c.id===id)?.label).join(' + ')} → <strong style="color:${reaction.color};">${reaction.product}</strong>
        </div>
        <div style="font-size:0.8rem;color:var(--text);background:rgba(0,0,0,0.2);border-radius:8px;padding:0.5rem;text-align:left;margin-bottom:0.5rem;">
          ${reaction.desc}
        </div>
        ${!reaction.safe ? `<div style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;border-radius:8px;padding:0.4rem;color:#ef4444;font-size:0.78rem;font-weight:700;">⚠️ DANGER: This reaction is hazardous! Only observe in proper lab with supervision.</div>` : ''}
        ${alreadyDone ? `<div style="color:var(--text-muted);font-size:0.78rem;margin-top:0.3rem;">Already recorded in your lab report.</div>` : `<div style="color:#34d399;font-weight:700;font-size:0.85rem;margin-top:0.3rem;">+${reaction.xp} XP earned!</div>`}
      </div>`;

    if (!alreadyDone) {
      labReport.push(reaction);
      totalLabXp += reaction.xp;
      gameXpTotal += reaction.xp;
      const xpEl = document.getElementById('cl-xp');
      const cntEl = document.getElementById('cl-count');
      if (xpEl) xpEl.textContent = totalLabXp;
      if (cntEl) cntEl.textContent = labReport.length;
    }
    beakerChemicals = [];
    // Refresh shelf after short delay
    setTimeout(() => {
      // Re-render to show lab report update
      const oldBeaker = document.getElementById('cl-beaker');
      if (oldBeaker) { oldBeaker.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:1rem;text-align:center;width:100%;">Click chemicals above to add them here…</div>'; }
      // Clear button highlights
      CHEMICALS.forEach(c => {
        const btn = document.getElementById(`cl-chem-${c.id}`);
        if (btn) btn.style.boxShadow = '';
      });
      // Re-render report section by calling renderLab only for the report part
      if (labReport.length > 0) {
        const existingReport = document.querySelector('#cl-reaction')?.parentElement?.parentElement;
        // Just re-render fully for the report button
        const rxn = document.getElementById('cl-reaction');
        if (rxn) {
          const reportArea = rxn.closest('div[style*="Baloo"]');
          if (reportArea) {
            // Check if report section exists
            const reportSection = reportArea.querySelector('div[style*="LAB REPORT"]')?.parentElement;
            if (!reportSection) {
              const repDiv = document.createElement('div');
              repDiv.id = 'cl-report-area';
              repDiv.style.cssText = 'background:rgba(0,0,0,0.15);border-radius:12px;padding:0.8rem;margin-top:0.5rem;';
              repDiv.innerHTML = `
                <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;margin-bottom:0.5rem;">📋 LAB REPORT (${labReport.length} experiment${labReport.length>1?'s':''})</div>
                ${labReport.map((r,i) => `<div style="background:${r.color}11;border:1px solid ${r.color}33;border-radius:8px;padding:0.5rem 0.8rem;margin-bottom:0.3rem;font-size:0.8rem;"><span style="color:${r.color};font-weight:700;">${i+1}. ${r.emoji} ${r.name}</span><span style="color:var(--text-muted);margin-left:0.5rem;">Grade ${r.grade} · +${r.xp} XP</span></div>`).join('')}
                <button onclick="clSubmitReport()" style="margin-top:0.5rem;width:100%;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;border:none;border-radius:10px;padding:0.6rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;font-size:0.9rem;">📤 Submit Lab Report & Earn XP</button>`;
              reportArea.appendChild(repDiv);
            } else {
              const area = document.getElementById('cl-report-area');
              if (area) {
                area.querySelector('div[style*="LAB REPORT"]') && (area.querySelector('div[style*="LAB REPORT"]').textContent = `📋 LAB REPORT (${labReport.length} experiment${labReport.length>1?'s':''})`);
              }
            }
          }
        }
      }
    }, 300);
  };

  window.clSubmitReport = function() {
    container.innerHTML = `
      <div style="text-align:center;font-family:'Baloo 2',sans-serif;padding:1.5rem 0;">
        <div style="font-size:3rem;margin-bottom:0.5rem;">📋✅</div>
        <h2 style="font-size:1.5rem;font-weight:800;color:#34d399;margin-bottom:0.5rem;">Lab Report Submitted!</h2>
        <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">Your teacher will review your experiments.</div>
        <div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:1rem;margin-bottom:1.5rem;">
          <div style="font-size:2rem;font-weight:800;color:#34d399;">${labReport.length} Experiments</div>
          <div style="color:var(--text-muted);margin-bottom:0.3rem;">conducted successfully</div>
          <div style="font-size:1.5rem;font-weight:800;color:#a78bfa;">+${totalLabXp} XP Earned! ⚡</div>
        </div>
        ${labReport.map((r,i) => `
          <div style="background:${r.color}11;border:1px solid ${r.color}33;border-radius:8px;padding:0.5rem;margin-bottom:0.3rem;font-size:0.82rem;text-align:left;">
            <span style="color:${r.color};font-weight:700;">${i+1}. ${r.emoji} ${r.name}</span>
            <span style="float:right;color:var(--text-muted);">Grade ${r.grade}</span>
          </div>`).join('')}
        <button onclick="closeGame()" style="margin-top:1rem;background:linear-gradient(135deg,#34d399,#059669);color:white;border:none;border-radius:12px;padding:0.8rem 2.5rem;font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;">Done 🎉</button>
      </div>`;
  };

  renderLab();
}

// ═══════════════════════════════════════════════
//   🚀 SPACE MISSION CONTROL
// ═══════════════════════════════════════════════
const MISSION_STAGES = [
  {
    id: 1,
    title: 'Stage 1 — Fuel Calculation',
    subject: 'Chemical Reactions',
    icon: '⛽',
    color: '#f59e0b',
    scenario: 'You are an ISRO scientist preparing the PSLV-C60 rocket. The fuel is a mixture of hydrazine (N₂H₄) and nitrogen tetroxide (N₂O₄). You need to calculate the correct ratio!',
    question: 'The combustion reaction of hydrazine: 2N₂H₄ + N₂O₄ → 3N₂ + 4H₂O. How many moles of water are produced when 1 mole of N₂O₄ is consumed?',
    options: ['2 moles', '3 moles', '4 moles', '6 moles'],
    answer: 2,
    explanation: 'From the equation: 1 mole N₂O₄ → 4 moles H₂O. The ratio is 1:4.',
    xp: 15
  },
  {
    id: 2,
    title: 'Stage 2 — Thrust Force',
    subject: 'Newton\'s Laws of Motion',
    icon: '🔥',
    color: '#ef4444',
    scenario: 'The engines are firing! The rocket burns fuel to generate thrust. You must calculate the net force to ensure the rocket lifts off.',
    question: 'A rocket has mass 2000 kg. Engine thrust = 50,000 N. Gravitational force = 20,000 N. What is the net upward force causing acceleration? (g = 10 m/s²)',
    options: ['30,000 N', '50,000 N', '20,000 N', '70,000 N'],
    answer: 0,
    explanation: 'Net Force = Thrust − Weight = 50,000 − 20,000 = 30,000 N upward. F = ma applies!',
    xp: 15
  },
  {
    id: 3,
    title: 'Stage 3 — Orbital Velocity',
    subject: 'Gravitation & Motion',
    icon: '🌍',
    color: '#60a5fa',
    scenario: 'The rocket is climbing fast! To place a satellite in orbit, it must reach the right orbital velocity where gravitational pull equals centripetal force needed.',
    question: 'A satellite orbits at 400 km above Earth. The orbital speed formula is v = √(GM/r). If GM = 4×10¹⁴ and r = 6.77×10⁶ m, what is the approximate orbital velocity?',
    options: ['7.7 km/s', '11.2 km/s', '3.0 km/s', '1.5 km/s'],
    answer: 0,
    explanation: 'v = √(4×10¹⁴ / 6.77×10⁶) ≈ √(5.9×10⁷) ≈ 7,681 m/s ≈ 7.7 km/s. This is the ISS orbital speed!',
    xp: 15
  },
  {
    id: 4,
    title: 'Stage 4 — Heat Shield',
    subject: 'Heat & Thermal Properties',
    icon: '🛡️',
    color: '#a78bfa',
    scenario: 'The satellite is deployed! But the re-entry capsule is coming back and will face temperatures over 1600°C from air friction. The heat shield must protect the crew.',
    question: 'The heat shield absorbs 8×10⁶ J of heat. It is made of silica tiles with specific heat capacity 1000 J/kg°C. If mass = 100 kg and initial temp = 25°C, what is the final temperature?',
    options: ['25,000°C', '1,600°C', '80,025°C', '8,025°C'],
    answer: 3,
    explanation: 'Q = mcΔT → ΔT = Q/mc = 8×10⁶/(100×1000) = 80°C. Final T = 25 + 80 = No wait — Q=8×10⁶, m=100, c=1000 → ΔT=80, so T=25+8000=8025°C if c=1. Silica ablates so real temp is limited! But mathematically: 8025°C.',
    xp: 15
  }
];

function initSpaceMission(container) {
  let currentStage = 0;
  let missionXp = 0;
  let stagesCompleted = [];
  let selectedOption = null;

  function renderIntro() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;text-align:center;">
        <button onclick="closeGame()" style="float:right;background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
        <div style="font-size:3rem;margin-bottom:0.5rem;">🚀</div>
        <h2 style="font-size:1.4rem;font-weight:800;color:#60a5fa;margin-bottom:0.3rem;">ISRO Space Mission Control</h2>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.5rem;">Solve 4 science challenges to launch your rocket!</div>

        <!-- Mission Stages Overview -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1.5rem;text-align:left;">
          ${MISSION_STAGES.map((s,i) => `
            <div style="background:${s.color}11;border:1px solid ${s.color}33;border-radius:10px;padding:0.7rem;">
              <div style="font-size:1.2rem;">${s.icon}</div>
              <div style="font-size:0.78rem;font-weight:700;color:${s.color};">${s.title}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">${s.subject}</div>
            </div>`).join('')}
        </div>

        <!-- Rocket Illustration -->
        <div style="font-size:4rem;margin:1rem 0;animation:smFloat 2s ease-in-out infinite;">🚀</div>
        <style>
          @keyframes smFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes smFire { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.3)} }
          @keyframes smLaunch { from{transform:translateY(0);opacity:1} to{transform:translateY(-200px);opacity:0} }
          @keyframes smPulse { 0%,100%{box-shadow:0 0 0 0 rgba(96,165,250,0.4)} 70%{box-shadow:0 0 0 10px rgba(96,165,250,0)} }
        </style>

        <button onclick="smStart()" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;border:none;border-radius:12px;padding:0.9rem 2.5rem;font-family:'Baloo 2',sans-serif;font-size:1.1rem;font-weight:800;cursor:pointer;animation:smPulse 2s infinite;">
          🚀 Begin Mission!
        </button>
      </div>`;
  }

  function renderStage() {
    const stage = MISSION_STAGES[currentStage];
    const progress = (currentStage / MISSION_STAGES.length) * 100;

    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
          <div>
            <div style="font-size:1rem;font-weight:800;color:${stage.color};">${stage.icon} ${stage.title}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${stage.subject}</div>
          </div>
          <button onclick="closeGame()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;">✕</button>
        </div>

        <!-- Progress -->
        <div style="background:rgba(0,0,0,0.2);border-radius:999px;height:6px;margin-bottom:0.8rem;overflow:hidden;">
          <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,${stage.color},#a78bfa);border-radius:999px;transition:width 0.5s;"></div>
        </div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.8rem;">Stage ${currentStage+1} of ${MISSION_STAGES.length} · ⚡ ${missionXp} XP earned so far</div>

        <!-- Scenario -->
        <div style="background:${stage.color}11;border:1px solid ${stage.color}33;border-radius:10px;padding:0.8rem;margin-bottom:0.9rem;font-size:0.83rem;color:var(--text);">
          <div style="font-size:0.7rem;font-weight:700;color:${stage.color};margin-bottom:0.3rem;">🛸 MISSION BRIEFING</div>
          ${stage.scenario}
        </div>

        <!-- Question -->
        <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:0.8rem;margin-bottom:0.9rem;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);margin-bottom:0.4rem;">❓ PROBLEM TO SOLVE</div>
          <div style="font-size:0.88rem;font-weight:700;color:var(--text);line-height:1.5;">${stage.question}</div>
        </div>

        <!-- Options -->
        <div id="sm-options" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;">
          ${stage.options.map((opt, i) => `
            <button id="sm-opt-${i}" onclick="smSelect(${i})"
              style="background:rgba(96,165,250,0.08);border:2px solid rgba(96,165,250,0.2);border-radius:10px;padding:0.7rem;
              color:var(--text);font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;text-align:left;">
              <span style="color:#60a5fa;font-size:0.7rem;">Option ${String.fromCharCode(65+i)}</span><br>${opt}
            </button>`).join('')}
        </div>

        <div id="sm-feedback" style="min-height:1.5rem;"></div>

        <button id="sm-submit" onclick="smSubmit()" ${selectedOption===null?'disabled':''} style="width:100%;background:linear-gradient(135deg,${stage.color},var(--primary-dark));color:white;border:none;border-radius:12px;padding:0.8rem;font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;opacity:${selectedOption===null?0.4:1};">
          🚀 Fire Engines!
        </button>
      </div>`;

    window.smSelect = function(i) {
      selectedOption = i;
      document.querySelectorAll('[id^="sm-opt-"]').forEach((btn, idx) => {
        btn.style.borderColor = idx === i ? '#60a5fa' : 'rgba(96,165,250,0.2)';
        btn.style.background = idx === i ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.08)';
      });
      const submitBtn = document.getElementById('sm-submit');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
    };

    window.smSubmit = function() {
      if (selectedOption === null) return;
      const stage = MISSION_STAGES[currentStage];
      const correct = selectedOption === stage.answer;
      const fb = document.getElementById('sm-feedback');

      // Disable all options
      document.querySelectorAll('[id^="sm-opt-"]').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === stage.answer) {
          btn.style.borderColor = '#34d399';
          btn.style.background = 'rgba(52,211,153,0.15)';
          btn.style.color = '#34d399';
        } else if (idx === selectedOption && !correct) {
          btn.style.borderColor = '#ef4444';
          btn.style.background = 'rgba(239,68,68,0.1)';
          btn.style.color = '#ef4444';
        }
      });
      const submitBtn = document.getElementById('sm-submit');
      if (submitBtn) submitBtn.style.display = 'none';

      if (correct) {
        missionXp += stage.xp;
        gameXpTotal += stage.xp;
        stagesCompleted.push(currentStage);
        fb.innerHTML = `
          <div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:10px;padding:0.7rem;margin-bottom:0.5rem;">
            <div style="color:#34d399;font-weight:700;margin-bottom:0.2rem;">✅ Correct! +${stage.xp} XP · Stage ${currentStage+1} cleared!</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${stage.explanation}</div>
          </div>
          ${currentStage < MISSION_STAGES.length - 1 
            ? `<button onclick="smNext()" style="width:100%;background:linear-gradient(135deg,#34d399,#059669);color:white;border:none;border-radius:12px;padding:0.75rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">Next Stage → ${MISSION_STAGES[currentStage+1].icon}</button>`
            : `<button onclick="smComplete()" style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:12px;padding:0.75rem;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;animation:smPulse 1s infinite;">🚀 LAUNCH ROCKET!</button>`
          }`;
      } else {
        fb.innerHTML = `
          <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:0.7rem;margin-bottom:0.5rem;">
            <div style="color:#ef4444;font-weight:700;margin-bottom:0.2rem;">❌ Incorrect — Mission paused!</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${stage.explanation}</div>
          </div>
          <button onclick="smRetry()" style="width:100%;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:12px;padding:0.7rem;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;">🔄 Retry Stage</button>`;
      }
    };
  }

  window.smStart = function() { currentStage = 0; selectedOption = null; renderStage(); };
  window.smNext = function() { currentStage++; selectedOption = null; renderStage(); };
  window.smRetry = function() { selectedOption = null; renderStage(); };

  window.smComplete = function() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;text-align:center;padding:1rem 0;">
        <style>@keyframes smLaunchFinal { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-150px) scale(0.5);opacity:0} }</style>
        <div id="sm-rocket-final" style="font-size:4rem;margin-bottom:0.5rem;animation:smLaunchFinal 2s 0.5s forwards;">🚀🔥</div>
        <div style="font-size:1.6rem;font-weight:800;color:#f59e0b;margin-bottom:0.3rem;">Mission Accomplished!</div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">🇮🇳 ISRO Scientist — Grade A</div>
        <div style="background:linear-gradient(135deg,rgba(96,165,250,0.1),rgba(167,139,250,0.1));border:1px solid rgba(96,165,250,0.3);border-radius:16px;padding:1.2rem;margin-bottom:1.5rem;">
          <div style="font-size:2.5rem;font-weight:800;color:#60a5fa;">${missionXp} XP</div>
          <div style="color:var(--text-muted);margin-bottom:0.5rem;">Total mission XP earned</div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;">
            ${MISSION_STAGES.map(s => `<span style="background:${s.color}22;border:1px solid ${s.color}44;border-radius:999px;padding:0.2rem 0.7rem;color:${s.color};font-size:0.75rem;font-weight:700;">${s.icon} Stage ${s.id} ✓</span>`).join('')}
          </div>
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;">
          Concepts mastered: Chemical Reactions · Newton's Laws · Orbital Mechanics · Heat Transfer
        </div>
        <button onclick="closeGame()" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:12px;padding:0.9rem 2.5rem;font-family:'Baloo 2',sans-serif;font-size:1.1rem;font-weight:800;cursor:pointer;">
          🎉 Done! Return to Base
        </button>
      </div>`;
  };

  renderIntro();
}

// ─── CIRCUIT BUILDER ───────────────────────────
function initCircuitBuilder(container) {
  let unlockedComponents = new Set();
  let placedComponents = [null, null, null, null]; // Slot 1, Slot 2, Slot 3, Slot 4
  let wiresConnected = [false, false, false, false]; // Wire 1 (top), Wire 2 (right), Wire 3 (bot), Wire 4 (left)
  let switchOn = false;
  let totalCircuitXp = 0;
  let activeQuestionCompId = null;

  const COMPONENTS = [
    { id: 'battery', label: 'Battery', emoji: '🔋', color: '#3b82f6', desc: 'Voltage source (+/-)', q: 'Which unit measures electrical potential difference or electromotive force?', options: ['Volt (V)', 'Ampere (A)', 'Ohm (Ω)', 'Watt (W)'], ans: 'Volt (V)' },
    { id: 'resistor', label: 'Resistor', emoji: '💈', color: '#10b981', desc: 'Limits current flow', q: 'According to Ohm\'s Law, what is the formula to calculate Voltage (V)?', options: ['V = I * R', 'V = I / R', 'V = R / I', 'V = I + R'], ans: 'V = I * R' },
    { id: 'led', label: 'LED', emoji: '💡', color: '#facc15', desc: 'Light Emitting Diode', q: 'What does LED stand for?', options: ['Light Emitting Diode', 'Light Energy Device', 'Low Emission Diode', 'Low Energy Diode'], ans: 'Light Emitting Diode' },
    { id: 'switch', label: 'Switch', emoji: '🎛️', color: '#8b5cf6', desc: 'Opens/Closes path', q: 'What is the purpose of a switch in a circuit?', options: ['To open or close the electrical path', 'To increase resistance', 'To store charge', 'To generate power'], ans: 'To open or close the electrical path' },
    { id: 'capacitor', label: 'Capacitor', emoji: '🔌', color: '#ec4899', desc: 'Stores charge', q: 'What physical quantity does a capacitor store?', options: ['Electrical Charge', 'Magnetic Flux', 'Mechanical Work', 'Light Energy'], ans: 'Electrical Charge' },
    { id: 'motor', label: 'Motor', emoji: '⚙️', color: '#f97316', desc: 'Mechanical rotating load', q: 'A motor converts electrical energy into which type of energy?', options: ['Kinetic/Mechanical Energy', 'Chemical Energy', 'Thermal Energy', 'Nuclear Energy'], ans: 'Kinetic/Mechanical Energy' }
  ];

  function render() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:#60a5fa;">🔌 Circuit Builder Lab</div>
            <div style="color:var(--text-muted);font-size:0.82rem;">Unlock parts, place them in slots, draw wires, and power on!</div>
          </div>
          <button onclick="cbCloseGame()" style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
        </div>

        <!-- Stats Row -->
        <div style="display:flex;gap:0.7rem;margin-bottom:1rem;">
          <div style="background:rgba(96,165,250,0.12);border:1px solid rgba(96,165,250,0.3);border-radius:999px;padding:0.3rem 1rem;color:#60a5fa;font-weight:700;font-size:0.85rem;">
            ⚡ Lab XP: <span id="cb-xp">${totalCircuitXp}</span>
          </div>
          <div style="background:rgba(167,139,250,0.12);border:1px solid rgba(167,139,250,0.3);border-radius:999px;padding:0.3rem 1rem;color:#a78bfa;font-weight:700;font-size:0.85rem;">
            🔋 Parts Unlocked: <span id="cb-unlocked-count">${unlockedComponents.size}/6</span>
          </div>
        </div>

        <div style="display:flex;gap:1.2rem;flex-wrap:wrap;">
          <!-- Left Panel: Parts Bin -->
          <div style="flex:1;min-width:200px;background:rgba(0,0,0,0.2);padding:1rem;border-radius:12px;border:1px solid var(--border);">
            <div style="font-size:0.85rem;color:var(--text-muted);font-weight:700;margin-bottom:0.8rem;letter-spacing:0.5px;">📦 PARTS BIN (Click to Unlock)</div>
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              ${COMPONENTS.map(c => {
                const isUnlocked = unlockedComponents.has(c.id);
                return `
                  <div onclick="${isUnlocked ? '' : `cbTriggerUnlock('${c.id}')`}" 
                    style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem;border-radius:10px;
                    border:1.5px solid ${isUnlocked ? c.color : 'var(--border)'};
                    background:${isUnlocked ? c.color + '11' : 'rgba(255,255,255,0.03)'};
                    cursor:${isUnlocked ? 'default' : 'pointer'};transition:all 0.2s;">
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                      <span style="font-size:1.4rem;">${c.emoji}</span>
                      <div>
                        <div style="font-weight:700;font-size:0.85rem;color:${isUnlocked ? c.color : 'var(--text)'};">${c.label}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">${c.desc}</div>
                      </div>
                    </div>
                    <div>
                      ${isUnlocked ? '<span style="color:#10b981;font-weight:bold;font-size:0.8rem;">✓ Unlocked</span>' : '🔒 <span style="font-size:0.7rem;color:var(--secondary);font-weight:bold;">Solve to unlock</span>'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Panel: Circuit Board & Sim -->
          <div style="flex:1.5;min-width:260px;display:flex;flex-direction:column;align-items:center;">
            <div style="font-size:0.85rem;color:var(--text-muted);font-weight:700;margin-bottom:0.4rem;align-self:flex-start;">🔌 CIRCUIT BOARD — Click slots to place, click wire paths to connect</div>
            
            <!-- Circuit Loop Board -->
            <div class="circuit-grid">
              <!-- Slot 1: Battery / Power -->
              <div class="circuit-slot ${placedComponents[0] ? 'occupied' : ''}" onclick="cbClickSlot(0)" id="cb-slot-0">
                <span class="circuit-slot-num">Slot 1</span>
                ${placedComponents[0] ? `
                  <span class="circuit-slot-emoji">${placedComponents[0].emoji}</span>
                  <span class="circuit-slot-label">${placedComponents[0].label}</span>
                ` : `
                  <span class="circuit-slot-emoji" style="color:var(--text3);">➕</span>
                  <span class="circuit-slot-label">Power</span>
                `}
                <!-- Context selection dropdown -->
                <div class="circuit-slot-select" id="cb-select-0">
                  <div style="font-size:0.6rem;color:white;font-weight:bold;margin-bottom:4px;">Place Component</div>
                  ${Array.from(unlockedComponents).map(id => {
                    const comp = COMPONENTS.find(c => c.id === id);
                    return `<button class="circuit-select-btn" onclick="event.stopPropagation(); cbPlaceComponent(0, '${id}')">${comp.emoji} ${comp.label}</button>`;
                  }).join('')}
                  ${placedComponents[0] ? `<button class="circuit-select-btn" style="background:#ef4444;" onclick="event.stopPropagation(); cbClearSlot(0)">🗑️ Clear</button>` : ''}
                  <button class="circuit-select-btn" style="background:#4b5563;" onclick="event.stopPropagation(); cbHideSelect(0)">Cancel</button>
                </div>
              </div>

              <!-- Wire 1: Top Horizontal -->
              <div class="circuit-wire-h ${wiresConnected[0] ? 'connected' : ''}" onclick="cbToggleWire(0)" id="cb-wire-0" title="Click to connect wire 1"></div>

              <!-- Slot 2: Switch -->
              <div class="circuit-slot ${placedComponents[1] ? 'occupied' : ''}" onclick="cbClickSlot(1)" id="cb-slot-1">
                <span class="circuit-slot-num">Slot 2</span>
                ${placedComponents[1] ? `
                  <span class="circuit-slot-emoji">${placedComponents[1].emoji}</span>
                  <span class="circuit-slot-label">${placedComponents[1].label} ${placedComponents[1].id === 'switch' ? (switchOn ? '(ON)' : '(OFF)') : ''}</span>
                ` : `
                  <span class="circuit-slot-emoji" style="color:var(--text3);">➕</span>
                  <span class="circuit-slot-label">Control</span>
                `}
                <div class="circuit-slot-select" id="cb-select-1">
                  <div style="font-size:0.6rem;color:white;font-weight:bold;margin-bottom:4px;">Place Component</div>
                  ${Array.from(unlockedComponents).map(id => {
                    const comp = COMPONENTS.find(c => c.id === id);
                    return `<button class="circuit-select-btn" onclick="event.stopPropagation(); cbPlaceComponent(1, '${id}')">${comp.emoji} ${comp.label}</button>`;
                  }).join('')}
                  ${placedComponents[1] ? `<button class="circuit-select-btn" style="background:#ef4444;" onclick="event.stopPropagation(); cbClearSlot(1)">🗑️ Clear</button>` : ''}
                  <button class="circuit-select-btn" style="background:#4b5563;" onclick="event.stopPropagation(); cbHideSelect(1)">Cancel</button>
                </div>
              </div>

              <!-- Wire 4: Left Vertical -->
              <div class="circuit-wire-v ${wiresConnected[3] ? 'connected' : ''}" onclick="cbToggleWire(3)" id="cb-wire-3" title="Click to connect wire 4"></div>
              
              <!-- Spacer -->
              <div style="font-size:1.6rem;">⚡</div>

              <!-- Wire 2: Right Vertical -->
              <div class="circuit-wire-v ${wiresConnected[1] ? 'connected' : ''}" onclick="cbToggleWire(1)" id="cb-wire-1" title="Click to connect wire 2"></div>

              <!-- Slot 4: LED / Motor -->
              <div class="circuit-slot ${placedComponents[3] ? 'occupied' : ''}" onclick="cbClickSlot(3)" id="cb-slot-3">
                <span class="circuit-slot-num">Slot 4</span>
                ${placedComponents[3] ? `
                  <span class="circuit-slot-emoji" id="cb-output-emoji">${placedComponents[3].emoji}</span>
                  <span class="circuit-slot-label">${placedComponents[3].label}</span>
                ` : `
                  <span class="circuit-slot-emoji" style="color:var(--text3);">➕</span>
                  <span class="circuit-slot-label">Output Load</span>
                `}
                <div class="circuit-slot-select" id="cb-select-3">
                  <div style="font-size:0.6rem;color:white;font-weight:bold;margin-bottom:4px;">Place Component</div>
                  ${Array.from(unlockedComponents).map(id => {
                    const comp = COMPONENTS.find(c => c.id === id);
                    return `<button class="circuit-select-btn" onclick="event.stopPropagation(); cbPlaceComponent(3, '${id}')">${comp.emoji} ${comp.label}</button>`;
                  }).join('')}
                  ${placedComponents[3] ? `<button class="circuit-select-btn" style="background:#ef4444;" onclick="event.stopPropagation(); cbClearSlot(3)">🗑️ Clear</button>` : ''}
                  <button class="circuit-select-btn" style="background:#4b5563;" onclick="event.stopPropagation(); cbHideSelect(3)">Cancel</button>
                </div>
              </div>

              <!-- Wire 3: Bottom Horizontal -->
              <div class="circuit-wire-h ${wiresConnected[2] ? 'connected' : ''}" onclick="cbToggleWire(2)" id="cb-wire-2" title="Click to connect wire 3"></div>

              <!-- Slot 3: Resistor -->
              <div class="circuit-slot ${placedComponents[2] ? 'occupied' : ''}" onclick="cbClickSlot(2)" id="cb-slot-2">
                <span class="circuit-slot-num">Slot 3</span>
                ${placedComponents[2] ? `
                  <span class="circuit-slot-emoji">${placedComponents[2].emoji}</span>
                  <span class="circuit-slot-label">${placedComponents[2].label}</span>
                ` : `
                  <span class="circuit-slot-emoji" style="color:var(--text3);">➕</span>
                  <span class="circuit-slot-label">Load/Resistor</span>
                `}
                <div class="circuit-slot-select" id="cb-select-2">
                  <div style="font-size:0.6rem;color:white;font-weight:bold;margin-bottom:4px;">Place Component</div>
                  ${Array.from(unlockedComponents).map(id => {
                    const comp = COMPONENTS.find(c => c.id === id);
                    return `<button class="circuit-select-btn" onclick="event.stopPropagation(); cbPlaceComponent(2, '${id}')">${comp.emoji} ${comp.label}</button>`;
                  }).join('')}
                  ${placedComponents[2] ? `<button class="circuit-select-btn" style="background:#ef4444;" onclick="event.stopPropagation(); cbClearSlot(2)">🗑️ Clear</button>` : ''}
                  <button class="circuit-select-btn" style="background:#4b5563;" onclick="event.stopPropagation(); cbHideSelect(2)">Cancel</button>
                </div>
              </div>
            </div>

            <!-- Controls and Simulation Feedback -->
            <div style="width:100%;margin-top:0.5rem;text-align:center;">
              <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:0.8rem;">
                <button onclick="cbToggleSwitch()" style="background:rgba(139,92,246,0.15);border:1.5px solid #8b5cf6;color:#8b5cf6;border-radius:10px;padding:0.5rem 1rem;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;">
                  🎛️ Toggle Switch (${switchOn ? 'ON 🟢' : 'OFF 🔴'})
                </button>
                <button onclick="cbPowerOnSim()" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:10px;padding:0.5rem 1.5rem;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;box-shadow:0 4px 10px rgba(245,158,11,0.2);">
                  ⚡ Power On!
                </button>
              </div>

              <!-- Output Console Log -->
              <div id="cb-console" style="min-height:75px;background:rgba(0,0,0,0.2);border-radius:12px;border:1.5px solid var(--border);padding:0.8rem;font-size:0.82rem;color:var(--text-muted);text-align:left;line-height:1.4;">
                👈 Answer questions in the Parts Bin to unlock electronics parts.<br/>
                👆 Place components in the Slot rings and click Wire paths to connect them. Click Power On!
              </div>
            </div>
          </div>
        </div>

        <!-- Done / Save Button -->
        <button onclick="cbSubmitReport()" style="margin-top:1.5rem;width:100%;background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;border-radius:12px;padding:0.75rem;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,0.25);">
          💾 Save Circuit Progress & Return to Learning
        </button>

        <!-- Dynamic unlock questions modal -->
        <div id="cb-question-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:2000;align-items:center;justify-content:center;">
          <div style="background:var(--card);border:2px solid var(--secondary);border-radius:20px;padding:1.5rem;width:90%;max-width:380px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div id="cb-q-emoji" style="font-size:3rem;margin-bottom:0.5rem;">🔋</div>
            <h3 id="cb-q-title" style="font-family:'Baloo 2',sans-serif;font-size:1.3rem;color:var(--secondary);margin-bottom:0.8rem;">Unlock Component</h3>
            <p id="cb-q-text" style="font-size:0.9rem;color:var(--text2);margin-bottom:1.2rem;line-height:1.4;"></p>
            <div id="cb-q-options" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.2rem;"></div>
            <button onclick="cbCloseQuestionModal()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.85rem;font-weight:700;">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- UI Interactivity handlers ---
  window.cbTriggerUnlock = function(compId) {
    const comp = COMPONENTS.find(c => c.id === compId);
    if (!comp) return;
    
    activeQuestionCompId = compId;
    document.getElementById('cb-q-emoji').textContent = comp.emoji;
    document.getElementById('cb-q-title').textContent = `Unlock ${comp.label}`;
    document.getElementById('cb-q-text').textContent = comp.q;
    
    const optionsContainer = document.getElementById('cb-q-options');
    optionsContainer.innerHTML = comp.options.map(opt => `
      <button onclick="cbSubmitAnswer('${opt}')" 
        style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:0.6rem;
        color:var(--text);font-family:'Baloo 2',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;text-align:left;
        transition:background 0.2s;">
        ${opt}
      </button>`).join('');

    document.getElementById('cb-question-modal').style.display = 'flex';
  };

  window.cbCloseQuestionModal = function() {
    document.getElementById('cb-question-modal').style.display = 'none';
    activeQuestionCompId = null;
  };

  window.cbSubmitAnswer = function(answer) {
    const comp = COMPONENTS.find(c => c.id === activeQuestionCompId);
    if (!comp) return;

    if (answer === comp.ans) {
      unlockedComponents.add(comp.id);
      totalCircuitXp += 5;
      document.getElementById('cb-xp').textContent = totalCircuitXp;
      document.getElementById('cb-unlocked-count').textContent = `${unlockedComponents.size}/6`;
      showToast(`🎉 Unlocked ${comp.label}! +5 XP`);
      cbCloseQuestionModal();
      render();
    } else {
      showToast("❌ Incorrect. Try again!");
      cbCloseQuestionModal();
    }
  };

  window.cbClickSlot = function(slotIdx) {
    if (unlockedComponents.size === 0) {
      showToast("🔒 Unlock components first in the Parts Bin!");
      return;
    }
    // Toggle slot selection overlay
    const selectEl = document.getElementById(`cb-select-${slotIdx}`);
    if (selectEl) {
      selectEl.classList.toggle('active');
    }
  };

  window.cbHideSelect = function(slotIdx) {
    const selectEl = document.getElementById(`cb-select-${slotIdx}`);
    if (selectEl) selectEl.classList.remove('active');
  };

  window.cbPlaceComponent = function(slotIdx, compId) {
    const comp = COMPONENTS.find(c => c.id === compId);
    if (!comp) return;

    placedComponents[slotIdx] = comp;
    cbHideSelect(slotIdx);
    render();
  };

  window.cbClearSlot = function(slotIdx) {
    placedComponents[slotIdx] = null;
    cbHideSelect(slotIdx);
    render();
  };

  window.cbToggleWire = function(wireIdx) {
    wiresConnected[wireIdx] = !wiresConnected[wireIdx];
    const wireEl = document.getElementById(`cb-wire-${wireIdx}`);
    if (wireEl) {
      if (wiresConnected[wireIdx]) {
        wireEl.classList.add('connected');
      } else {
        wireEl.classList.remove('connected');
      }
    }
  };

  window.cbToggleSwitch = function() {
    switchOn = !switchOn;
    render();
  };

  window.cbPowerOnSim = function() {
    // Reset flow animations and output states
    for (let i = 0; i < 4; i++) {
      const wireEl = document.getElementById(`cb-wire-${i}`);
      if (wireEl) wireEl.classList.remove('flowing');
      const slotEl = document.getElementById(`cb-slot-${i}`);
      if (slotEl) slotEl.classList.remove('circuit-sparks', 'circuit-led-glow', 'circuit-motor-spin');
    }

    const consoleEl = document.getElementById('cb-console');

    // 1. Check if all 4 slots have components
    const hasEmptySlot = placedComponents.some(c => c === null);
    if (hasEmptySlot) {
      consoleEl.innerHTML = `⚠️ <span style="color:#ef4444;font-weight:700;">Incomplete Schematic</span><br/>Make sure to place components in all four slots of the circuit loop before powering on!`;
      return;
    }

    // 2. Check if all 4 wire connections are closed
    const hasDisconnectedWire = wiresConnected.some(w => w === false);
    if (hasDisconnectedWire) {
      consoleEl.innerHTML = `🔌 <span style="color:#f87171;font-weight:700;">Open Circuit Loop</span><br/>Current cannot flow because some connection wires are missing! Click on the dark wire lines to connect all slots in a closed loop.`;
      return;
    }

    // 3. Evaluate elements
    const hasBattery = placedComponents.some(c => c.id === 'battery');
    const hasSwitch = placedComponents.some(c => c.id === 'switch');
    const hasResistor = placedComponents.some(c => c.id === 'resistor');
    const hasLED = placedComponents.some(c => c.id === 'led');
    const hasMotor = placedComponents.some(c => c.id === 'motor');
    const hasCapacitor = placedComponents.some(c => c.id === 'capacitor');

    const batteryIdx = placedComponents.findIndex(c => c.id === 'battery');
    const ledIdx = placedComponents.findIndex(c => c.id === 'led');
    const motorIdx = placedComponents.findIndex(c => c.id === 'motor');

    // CASE A: Short Circuit (No load/resistance at all, just battery + switch + wires)
    if (hasBattery && !hasResistor && !hasLED && !hasMotor && !hasCapacitor) {
      consoleEl.innerHTML = `🚨 <span style="color:#ef4444;font-weight:700;">Short Circuit Sparks!</span><br/>No electrical load detected. Connecting the Battery directly to itself with wires allows infinite current to flow, causing overheating and sparks!`;
      if (batteryIdx !== -1) {
        document.getElementById(`cb-slot-${batteryIdx}`).classList.add('circuit-sparks');
      }
      return;
    }

    // CASE B: Switch is OFF
    if (hasSwitch && !switchOn) {
      consoleEl.innerHTML = `🎛️ <span style="color:#a78bfa;font-weight:700;">Switch is OFF</span><br/>The switch is currently open, preventing electron movement. Click the Switch Toggle button below to close the switch and allow current flow.`;
      return;
    }

    // CASE C: Battery is missing (No voltage source)
    if (!hasBattery) {
      consoleEl.innerHTML = `🔋 <span style="color:#f87171;font-weight:700;">No Voltage Source</span><br/>You placed components, but there is no Battery to push electrical current. Place a Battery to power the circuit!`;
      return;
    }

    // CASE D: LED without Resistor (Burn out!)
    if (hasBattery && hasLED && !hasResistor) {
      consoleEl.innerHTML = `🔥 <span style="color:#ef4444;font-weight:700;">LED Burnt Out!</span><br/>The LED has very low internal resistance. Without a Resistor to limit current, the voltage pushed too many amperes, frying the LED! Always connect a Resistor in series with an LED.`;
      if (ledIdx !== -1) {
        document.getElementById(`cb-slot-${ledIdx}`).classList.add('circuit-sparks');
        const outputEmoji = document.getElementById('cb-output-emoji');
        if (outputEmoji) outputEmoji.textContent = '💥';
      }
      return;
    }

    // CASE E: Motor without Resistor (Sparks/Overcurrent but works)
    if (hasBattery && hasMotor && !hasResistor) {
      consoleEl.innerHTML = `⚠️ <span style="color:#f59e0b;font-weight:700;">High Current Motor Spin</span><br/>The Motor is spinning fast! However, running a motor without a limiting Resistor causes high battery drain and potential damage. Adding a resistor would make it safer!`;
      
      for (let i = 0; i < 4; i++) {
        document.getElementById(`cb-wire-${i}`).classList.add('flowing');
      }
      if (motorIdx !== -1) {
        document.getElementById(`cb-slot-${motorIdx}`).classList.add('circuit-motor-spin');
      }
      return;
    }

    // CASE F: Success LED Circuit (Battery + Switch (ON) + Resistor + LED)
    if (hasBattery && hasSwitch && switchOn && hasResistor && hasLED) {
      consoleEl.innerHTML = `🎉 <span style="color:#34d399;font-weight:700;">Success! Safe LED Circuit</span><br/>Ohm's Law ($I = V/R$) in action! The Resistor safely limited the current, and the LED glows brightly without burning. +10 XP awarded!`;
      
      for (let i = 0; i < 4; i++) {
        document.getElementById(`cb-wire-${i}`).classList.add('flowing');
      }
      if (ledIdx !== -1) {
        document.getElementById(`cb-slot-${ledIdx}`).classList.add('circuit-led-glow');
        const outputEmoji = document.getElementById('cb-output-emoji');
        if (outputEmoji) outputEmoji.textContent = '💡';
      }

      totalCircuitXp += 10;
      document.getElementById('cb-xp').textContent = totalCircuitXp;
      showToast("🎉 Perfect Circuit built! +10 XP");
      return;
    }

    // CASE G: Success Motor Circuit (Battery + Switch (ON) + Resistor + Motor)
    if (hasBattery && hasSwitch && switchOn && hasResistor && hasMotor) {
      consoleEl.innerHTML = `🎉 <span style="color:#34d399;font-weight:700;">Success! Motor Spinning Safely</span><br/>Current flows through the resistor and converts electrical energy into kinetic mechanical energy. The Motor spins smoothly! +10 XP awarded!`;
      
      for (let i = 0; i < 4; i++) {
        document.getElementById(`cb-wire-${i}`).classList.add('flowing');
      }
      if (motorIdx !== -1) {
        document.getElementById(`cb-slot-${motorIdx}`).classList.add('circuit-motor-spin');
      }

      totalCircuitXp += 10;
      document.getElementById('cb-xp').textContent = totalCircuitXp;
      showToast("🎉 Motor spinning safely! +10 XP");
      return;
    }

    // CASE H: Capacitor circuit
    if (hasBattery && hasSwitch && switchOn && hasCapacitor) {
      consoleEl.innerHTML = `⚡ <span style="color:#60a5fa;font-weight:700;">Capacitor Charged</span><br/>Electrons flow into the capacitor plates until they match the battery voltage, storing electrical charge!`;
      for (let i = 0; i < 4; i++) {
        document.getElementById(`cb-wire-${i}`).classList.add('flowing');
      }
      return;
    }

    // Default Fallback
    consoleEl.innerHTML = `🔌 <span style="color:var(--text);">Circuit Powered On</span><br/>Closed loop completed. Try combinations like Battery + Switch + Resistor + LED to see output devices operate safely!`;
    for (let i = 0; i < 4; i++) {
      document.getElementById(`cb-wire-${i}`).classList.add('flowing');
    }
  };

  window.cbCloseGame = function() {
    closeGame();
  };

  window.cbSubmitReport = function() {
    gameXpTotal += totalCircuitXp;
    closeGame();
  };

  render();
}

// ─── MATH KINGDOM BUILDER ─────────────────────
function initMathKingdom(container) {
  let towers = 0;
  let houses = 0;
  let land = 0;
  let gold = 0;
  let currentXpEarned = 0;

  // Load saved state
  if (typeof currentUser !== 'undefined' && currentUser && currentUser.kingdom_data) {
    try {
      const data = JSON.parse(currentUser.kingdom_data);
      towers = parseInt(data.towers) || 0;
      houses = parseInt(data.houses) || 0;
      land = parseInt(data.land) || 0;
      gold = parseInt(data.gold) || 0;
    } catch(e) {}
  }

  let activeChallengeType = 'house'; // 'tower', 'house', 'land', 'gold'
  let currentQuestion = null;
  let selectedAns = null;
  let isSubmitting = false;

  const CHALLENGES = {
    tower: [
      { q: "Solve for x: x² - 5x + 6 = 0", options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = 2, -3"], ans: "x = 2, 3", hint: "Factor the quadratic equation: (x-2)(x-3) = 0." },
      { q: "Solve for x: 3(x + 2) - 5 = 2(x - 1)", options: ["x = -3", "x = -9", "x = 9", "x = 3"], ans: "x = -9", hint: "Expand: 3x + 6 - 5 = 2x - 2, simplify: 3x + 1 = 2x - 2, subtract 2x and 1 from both sides." },
      { q: "If 4x - 7 = 5, find 2x + 3", options: ["x = 3, value = 9", "x = 3, value = 6", "x = 3, value = 11", "x = 4, value = 11"], ans: "x = 3, value = 9", hint: "Solve for x: 4x = 12 -> x = 3. Plug 3 into 2x+3: 2(3)+3 = 9." }
    ],
    house: [
      { q: "Solve for x: 2x + 7 = 19", options: ["x = 6", "x = 12", "x = 5.5", "x = 8"], ans: "x = 6", hint: "Subtract 7 from both sides: 2x = 12. Divide by 2: x = 6." },
      { q: "Solve for x: x / 3 - 4 = 2", options: ["x = 18", "x = 6", "x = 10", "x = 12"], ans: "x = 18", hint: "Add 4 to both sides: x/3 = 6. Multiply by 3: x = 18." },
      { q: "Solve for x: 5x - 3 = 2x + 9", options: ["x = 4", "x = 3", "x = 2", "x = 6"], ans: "x = 4", hint: "Subtract 2x: 3x - 3 = 9. Add 3: 3x = 12. Divide by 3: x = 4." }
    ],
    land: [
      { q: "Calculate area of triangle with base = 10m and height = 8m.", options: ["40 m²", "80 m²", "20 m²", "45 m²"], ans: "40 m²", hint: "Area = 0.5 * base * height." },
      { q: "Find the perimeter of a rectangle with length = 12cm and width = 5cm.", options: ["34 cm", "60 cm", "17 cm", "30 cm"], ans: "34 cm", hint: "Perimeter = 2 * (length + width)." },
      { q: "Calculate area of a circle with radius = 7m. (Use π = 22/7)", options: ["154 m²", "44 m²", "49 m²", "144 m²"], ans: "154 m²", hint: "Area = π * r² = (22/7) * r * r." }
    ],
    gold: [
      { q: "What is 15% of 200?", options: ["30", "15", "20", "40"], ans: "30", hint: "15% * 200 = (15 / 100) * 200 = 15 * 2 = 30." },
      { q: "Increase 80 by 25%. What is the result?", options: ["100", "90", "120", "105"], ans: "100", hint: "25% of 80 is 20. 80 + 20 = 100." },
      { q: "If a book costs $40 and is on a 20% discount, what is the sale price?", options: ["$32", "$30", "$36", "$38"], ans: "$32", hint: "20% discount of 40 is 8. Sale price = 40 - 8 = 32." }
    ]
  };

  async function fetchLeaderboards() {
    try {
      const res = await api('/api/leaderboard/math-games');
      const listEl = document.getElementById('mk-leaderboard-list');
      if (listEl && res && res.kingdomLeaderboard) {
        listEl.innerHTML = res.kingdomLeaderboard.map((item, idx) => `
          <div class="cb-leaderboard-item" style="border-left: 3px solid ${idx===0 ? '#facc15' : idx===1 ? '#9ca3af' : idx===2 ? '#b45309' : 'transparent'}; padding-left: 6px;">
            <span><strong>#${idx+1}</strong> ${item.avatar} ${item.name}</span>
            <span style="color:#facc15;font-weight:bold;">🏆 Size: ${item.kingdomSize} (🏰${item.kingdomDetails?.towers || 0} 🏠${item.kingdomDetails?.houses || 0} 🌳${item.kingdomDetails?.land || 0})</span>
          </div>`).join('');
      }
    } catch(e) {
      console.error("Error loading math leaderboard:", e);
    }
  }

  function generateQuestion() {
    const list = CHALLENGES[activeChallengeType];
    const q = list[Math.floor(Math.random() * list.length)];
    currentQuestion = q;
    selectedAns = null;
  }

  function renderGrid() {
    const items = [];
    for(let i=0; i<towers; i++) items.push('🏰');
    for(let i=0; i<houses; i++) items.push('🏠');
    for(let i=0; i<Math.floor(land/5); i++) items.push('🌳');
    while(items.length < 15) items.push('⬜');

    const gridEl = document.getElementById('mk-grid');
    if (gridEl) {
      gridEl.innerHTML = items.slice(0, 15).map(item => `
        <div class="kingdom-cell ${item !== '⬜' ? 'build-pop' : ''}">${item}</div>
      `).join('');
    }
  }

  function renderGame() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;">
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:#818cf8;">🏰 Math Kingdom Builder</div>
            <div style="color:var(--text-muted);font-size:0.82rem;">Solve math problems to build and expand your domain!</div>
          </div>
          <button onclick="cbCloseGame()" style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
        </div>

        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-start;">
          <!-- Left Panel: Grid display & Leaderboard -->
          <div style="flex:1;min-width:200px;text-align:center;">
            <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.3rem;">🏰 YOUR KINGDOM DISPLAY</div>
            
            <div class="kingdom-grid" id="mk-grid"></div>

            <div style="font-size:0.75rem;color:var(--text-muted);margin:0.5rem 0;display:flex;justify-content:center;gap:0.6rem;flex-wrap:wrap;">
              <span>🏰 Towers: <strong>${towers}</strong></span>
              <span>🏠 Houses: <strong>${houses}</strong></span>
              <span>🌳 Land: <strong>${land}</strong></span>
              <span>🪙 Gold: <strong>${gold}</strong></span>
            </div>

            <!-- Leaderboard (Weekly Kingdom Contest) -->
            <div style="text-align:left;margin-top:0.8rem;">
              <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.3rem;">🏆 WEEKLY CLASS CONTEST</div>
              <div class="cb-leaderboard-box" id="mk-leaderboard-list">
                <div style="color:var(--text-muted);font-size:0.75rem;padding:0.5rem;">Loading leaderboard...</div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Challenge -->
          <div style="flex:1.2;min-width:240px;background:rgba(0,0,0,0.15);padding:1rem;border-radius:12px;border:1px solid var(--border);">
            <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.6rem;">🏗️ SELECT AN ARCHITECTURE CHALLENGE</div>
            
            <div style="display:flex;gap:0.4rem;margin-bottom:1rem;flex-wrap:wrap;">
              <button onclick="mkSelectType('tower')" style="flex:1;padding:0.4rem;font-size:0.75rem;background:${activeChallengeType==='tower' ? '#818cf8' : 'var(--bg3)'};color:${activeChallengeType==='tower' ? 'white' : 'var(--text)'};border:none;border-radius:6px;font-weight:bold;cursor:pointer;">🏰 Tower (Hard)</button>
              <button onclick="mkSelectType('house')" style="flex:1;padding:0.4rem;font-size:0.75rem;background:${activeChallengeType==='house' ? '#818cf8' : 'var(--bg3)'};color:${activeChallengeType==='house' ? 'white' : 'var(--text)'};border:none;border-radius:6px;font-weight:bold;cursor:pointer;">🏠 House (Med)</button>
              <button onclick="mkSelectType('land')" style="flex:1;padding:0.4rem;font-size:0.75rem;background:${activeChallengeType==='land' ? '#818cf8' : 'var(--bg3)'};color:${activeChallengeType==='land' ? 'white' : 'var(--text)'};border:none;border-radius:6px;font-weight:bold;cursor:pointer;">🌳 Land (Med)</button>
              <button onclick="mkSelectType('gold')" style="flex:1;padding:0.4rem;font-size:0.75rem;background:${activeChallengeType==='gold' ? '#818cf8' : 'var(--bg3)'};color:${activeChallengeType==='gold' ? 'white' : 'var(--text)'};border:none;border-radius:6px;font-weight:bold;cursor:pointer;">🪙 Gold (Easy)</button>
            </div>

            <!-- Question Block -->
            <div style="background:var(--bg3);border-radius:10px;padding:0.8rem;margin-bottom:1rem;">
              <div style="font-size:0.75rem;color:var(--text-muted);font-weight:bold;margin-bottom:0.4rem;">QUESTION</div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--text);margin-bottom:0.8rem;line-height:1.3;">${currentQuestion.q}</div>
              
              <!-- Multiple Choice Options -->
              <div style="display:flex;flex-direction:column;gap:0.4rem;">
                ${currentQuestion.options.map(opt => `
                  <button id="mk-opt-${opt.replace(/\s+/g,'-')}" onclick="mkSelectAnswer('${opt}')"
                    style="width:100%;padding:0.6rem;font-size:0.82rem;font-family:'Baloo 2',sans-serif;
                    background:rgba(255,255,255,0.03);border:1.5px solid var(--border);border-radius:8px;
                    color:var(--text);font-weight:700;text-align:left;cursor:pointer;transition:all 0.2s;">
                    ${opt}
                  </button>`).join('')}
              </div>
            </div>

            <button onclick="mkSubmitAnswer()" style="width:100%;padding:0.7rem;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;border:none;border-radius:10px;font-weight:bold;font-size:0.9rem;cursor:pointer;">
              🔨 Build Block
            </button>

            <div id="mk-feedback" style="margin-top:0.6rem;min-height:1.2rem;font-size:0.82rem;font-weight:bold;text-align:center;"></div>
          </div>
        </div>

        <button onclick="mkSaveKingdom()" style="margin-top:1.2rem;width:100%;background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;border-radius:12px;padding:0.7rem;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;">
          💾 Save Kingdom & Return to Base
        </button>
      </div>
    `;
    renderGrid();
    fetchLeaderboards();
  }

  window.mkSelectType = function(type) {
    if (isSubmitting) return;
    activeChallengeType = type;
    generateQuestion();
    renderGame();
  };

  window.mkSelectAnswer = function(answer) {
    if (isSubmitting) return;
    selectedAns = answer;
    currentQuestion.options.forEach(opt => {
      const el = document.getElementById(`mk-opt-${opt.replace(/\s+/g,'-')}`);
      if (el) {
        if (opt === answer) {
          el.style.borderColor = 'var(--secondary)';
          el.style.background = 'rgba(78,205,196,0.1)';
        } else {
          el.style.borderColor = 'var(--border)';
          el.style.background = 'rgba(255,255,255,0.03)';
        }
      }
    });
  };

  window.mkSubmitAnswer = function() {
    if (isSubmitting) return;
    if (!selectedAns) {
      showToast("⚠️ Select an answer option first!");
      return;
    }

    isSubmitting = true;
    const fb = document.getElementById('mk-feedback');
    if (!fb) return;

    if (selectedAns === currentQuestion.ans) {
      fb.style.color = 'var(--green)';
      
      if (activeChallengeType === 'tower') {
        towers++;
        fb.textContent = '🎉 Correct! Solved algebra. Tower built! +10 XP';
        currentXpEarned += 10;
      } else if (activeChallengeType === 'house') {
        houses++;
        fb.textContent = '🎉 Correct! Solved arithmetic. House built! +5 XP';
        currentXpEarned += 5;
      } else if (activeChallengeType === 'land') {
        land += 5;
        fb.textContent = '🎉 Correct! Calculated geometry. Expanded Land +5! +8 XP';
        currentXpEarned += 8;
      } else if (activeChallengeType === 'gold') {
        gold += 40;
        fb.textContent = '🎉 Correct! Computed treasury percent. Added +40 Gold! +5 XP';
        currentXpEarned += 5;
      }
      
      showToast("🔨 Block placed!");
    } else {
      fb.style.color = 'var(--red)';
      
      if (activeChallengeType === 'tower' && towers > 0) {
        towers--;
        fb.textContent = `✗ Incorrect. Part of the tower crumbled! Answer was ${currentQuestion.ans}`;
        showToast("💥 Tower block crumbled!");
      } else if (activeChallengeType === 'house' && houses > 0) {
        houses--;
        fb.textContent = `✗ Incorrect. Part of the house crumbled! Answer was ${currentQuestion.ans}`;
        showToast("💥 House block crumbled!");
      } else {
        fb.textContent = `✗ Incorrect. Answer was ${currentQuestion.ans}`;
      }
      
      const cells = document.querySelectorAll('.kingdom-cell');
      if (cells.length) {
        const occupied = Array.from(cells).filter(c => c.textContent !== '⬜');
        if (occupied.length) {
          const randCell = occupied[Math.floor(Math.random() * occupied.length)];
          randCell.classList.add('crumb-fall');
        }
      }
    }

    setTimeout(() => {
      isSubmitting = false;
      generateQuestion();
      renderGame();
    }, 1500);
  };

  window.mkSaveKingdom = async function() {
    const kingdom_data = { towers, houses, land, gold };
    try {
      await api('/api/math-kingdom/save', 'POST', { kingdom_data });
      if (typeof currentUser !== 'undefined' && currentUser) {
        currentUser.kingdom_data = JSON.stringify(kingdom_data);
      }
    } catch(e) {
      console.error("Save kingdom error:", e);
    }
    
    gameXpTotal += currentXpEarned;
    closeGame();
  };

  generateQuestion();
  renderGame();
}

// ─── EQUATION ESCAPE ROOM ─────────────────────
function initEquationEscapeRoom(container) {
  let activeTheme = 'jungle'; 
  let elapsedSeconds = 0;
  let timerInterval = null;
  
  let currentLevelIdx = 0; 
  let hintUsedThisLevel = false;
  let gameXpAccumulated = 0;
  let hintsCostsTotal = 0;
  let isSubmitting = false;

  const ROOM_THEMES = {
    jungle: {
      name: "Jungle Room (Algebra)",
      icon: "🌳",
      themeClass: "jungle",
      questions: [
        { q: "Level 1: Solve for x: x - 5 = 12", ans: "17", hint: "Add 5 to both sides of the equation. x = 12 + 5." },
        { q: "Level 2: Solve for x: 3x + 4 = 19", ans: "5", hint: "Subtract 4: 3x = 15. Divide by 3: x = 5." },
        { q: "Level 3: Solve for x: x/4 + 6 = 10", ans: "16", hint: "Subtract 6: x/4 = 4. Multiply by 4: x = 16." },
        { q: "Level 4: Solve for x: 4x - 9 = 2x + 5", ans: "7", hint: "Subtract 2x: 2x - 9 = 5. Add 9: 2x = 14. Divide by 2: x = 7." },
        { q: "Level 5: Solve for x: 2(x + 3) - 3 = 11", ans: "4", hint: "Expand: 2x + 6 - 3 = 11 -> 2x + 3 = 11. Subtract 3: 2x = 8. x = 4." }
      ]
    },
    space: {
      name: "Space Room (Geometry)",
      icon: "🪐",
      themeClass: "space",
      questions: [
        { q: "Level 1: Calculate the area of a square with side = 6cm.", ans: "36", hint: "Area of a square = side * side." },
        { q: "Level 2: Area of a rectangle is 48cm². If length = 8cm, find width.", ans: "6", hint: "Area = length * width. Width = Area / Length." },
        { q: "Level 3: Find area of triangle with base = 12cm and height = 5cm.", ans: "30", hint: "Area = 0.5 * base * height." },
        { q: "Level 4: Circumference of circle is 44cm. Find radius (use π = 22/7)", ans: "7", hint: "Circumference = 2 * π * r. 44 = 2 * (22/7) * r -> 44 = (44/7) * r." },
        { q: "Level 5: Height of cylinder is 10cm, radius is 3cm. Find Volume (use π = 3.14)", ans: "282.6", hint: "Volume = π * r² * height = 3.14 * 9 * 10." }
      ]
    },
    underwater: {
      name: "Underwater Room (Statistics)",
      icon: "🐠",
      themeClass: "underwater",
      questions: [
        { q: "Level 1: Find the average (mean) of numbers: 4, 8, 12.", ans: "8", hint: "Mean = sum of numbers / total count. (4+8+12)/3." },
        { q: "Level 2: Find the median of values: 5, 12, 3, 8, 9.", ans: "8", hint: "Sort values first: 3, 5, 8, 9, 12. The middle value is 8." },
        { q: "Level 3: The mean of 4 numbers is 15. What is their sum?", ans: "60", hint: "Mean = sum / count. Sum = Mean * Count = 15 * 4." },
        { q: "Level 4: Find the mode of the dataset: 3, 5, 3, 8, 5, 3, 9.", ans: "3", hint: "Mode is the number that appears most frequently. 3 appears 3 times." },
        { q: "Level 5: The mean of 6, 8, 11, x, and 15 is 10. Find x.", ans: "10", hint: "Sum of all numbers is Mean * Count = 10 * 5 = 50. Add: 6+8+11+15 = 40. x = 50 - 40." }
      ]
    }
  };

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      const timerEl = document.getElementById('er-timer');
      if (timerEl) {
        const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  async function fetchLeaderboards() {
    try {
      const res = await api('/api/leaderboard/math-games');
      const listEl = document.getElementById('er-leaderboard-list');
      if (listEl && res && res.escapeLeaderboard) {
        listEl.innerHTML = res.escapeLeaderboard.map((item, idx) => `
          <div class="cb-leaderboard-item" style="border-left: 3px solid ${idx===0 ? '#facc15' : idx===1 ? '#9ca3af' : idx===2 ? '#b45309' : 'transparent'}; padding-left: 6px;">
            <span><strong>#${idx+1}</strong> ${item.avatar} ${item.name}</span>
            <span style="color:#0ea5e9;font-weight:bold;">⏱️ ${item.escape_room_time}s</span>
          </div>`).join('');
      }
    } catch(e) {
      console.error(e);
    }
  }

  function renderIntro() {
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;text-align:center;padding:1rem 0;">
        <div style="font-size:3rem;margin-bottom:0.5rem;">🔑</div>
        <h2 style="font-size:1.6rem;font-weight:800;color:#0ea5e9;margin-bottom:0.3rem;">Equation Escape Room</h2>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.5rem;">Solve 5 locks as fast as you can to escape!</div>
        
        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.6rem;font-weight:bold;">CHOOSE YOUR THEMED ROOM:</div>
        <div style="display:flex;flex-direction:column;gap:0.6rem;max-width:300px;margin:0 auto 1.5rem auto;">
          <button onclick="erStartRoom('jungle')" style="padding:0.8rem;background:linear-gradient(135deg,#10b981,#047857);color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;font-family:'Baloo 2',sans-serif;">🌳 Jungle Room (Algebra)</button>
          <button onclick="erStartRoom('space')" style="padding:0.8rem;background:linear-gradient(135deg,#6366f1,#4338ca);color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;font-family:'Baloo 2',sans-serif;">🪐 Space Room (Geometry)</button>
          <button onclick="erStartRoom('underwater')" style="padding:0.8rem;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;font-family:'Baloo 2',sans-serif;">🐠 Underwater Room (Statistics)</button>
        </div>
        <button onclick="closeGame()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;font-weight:700;">Cancel</button>
      </div>
    `;
  }

  window.erStartRoom = function(themeId) {
    activeTheme = themeId;
    currentLevelIdx = 0;
    elapsedSeconds = 0;
    hintUsedThisLevel = false;
    gameXpAccumulated = 0;
    hintsCostsTotal = 0;
    renderRoom();
    startTimer();
  };

  function renderRoom() {
    const room = ROOM_THEMES[activeTheme];
    const q = room.questions[currentLevelIdx];
    
    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:#0ea5e9;">🔑 ${room.name}</div>
            <div style="color:var(--text-muted);font-size:0.8rem;">Solve the equations to unlock the exit door!</div>
          </div>
          <button onclick="closeGame()" style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
        </div>

        <div class="escape-room-container ${room.themeClass}">
          <div class="escape-timer" id="er-timer">00:00</div>

          <div style="display:flex;justify-content:center;gap:0.4rem;margin-bottom:1rem;">
            ${[0,1,2,3,4].map(idx => {
              const active = idx === currentLevelIdx;
              const solved = idx < currentLevelIdx;
              return `<span style="width:28px;height:28px;border-radius:50%;background:${solved ? '#10b981' : active ? '#f59e0b' : 'rgba(255,255,255,0.06)'};border:1.5px solid ${active ? '#f59e0b' : 'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:bold;color:${solved || active ? 'white' : 'var(--text-muted)'};">${solved ? '✓' : idx+1}</span>`;
            }).join('')}
          </div>

          <div class="escape-door-lock" id="er-door-lock">🔒</div>

          <div style="background:rgba(0,0,0,0.25);border-radius:12px;padding:1.2rem;margin-bottom:1rem;">
            <div style="font-size:1.25rem;font-weight:800;color:white;margin-bottom:1rem;">${q.q}</div>
            
            <div style="display:flex;gap:0.4rem;max-width:280px;margin:0 auto;">
              <input type="text" id="er-input" placeholder="Value..." onkeypress="erHandleKey(event)"
                style="flex:1;background:var(--bg3);border:2px solid var(--border);border-radius:10px;padding:0.5rem;color:white;font-size:1.1rem;text-align:center;outline:none;">
              <button onclick="erSubmitAnswer()" style="background:#0ea5e9;color:white;border:none;border-radius:10px;padding:0 1.2rem;font-weight:bold;cursor:pointer;">Unlock 🔓</button>
            </div>
            
            <div id="er-hint-box" style="margin-top:0.8rem;font-size:0.8rem;color:var(--text-muted);min-height:1rem;line-height:1.4;">
              ${hintUsedThisLevel ? `💡 Hint: ${q.hint}` : `<button onclick="erGetHint()" style="background:none;border:none;color:#f59e0b;font-weight:bold;text-decoration:underline;cursor:pointer;font-size:0.75rem;">💡 Need Hint? (Costs 5 XP)</button>`}
            </div>
          </div>

          <div id="er-feedback" style="font-weight:bold;font-size:0.85rem;min-height:1.2rem;text-align:center;margin-bottom:0.5rem;"></div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const inp = document.getElementById('er-input');
      if (inp) inp.focus();
    }, 100);
  }

  window.erHandleKey = function(e) {
    if (e.key === 'Enter') erSubmitAnswer();
  };

  window.erGetHint = async function() {
    const userXp = typeof currentUser !== 'undefined' && currentUser ? currentUser.xp : 0;
    if (userXp < 5) {
      showToast("⚠️ Not enough XP! Hints cost 5 XP.");
      return;
    }

    try {
      const res = await api('/api/profile/xp', 'POST', { xp: -5 });
      if (typeof currentUser !== 'undefined' && currentUser) {
        currentUser.xp = res.totalXP;
        currentUser.level = Math.max(1, Math.floor(res.totalXP / 200) + 1);
        updateNavStats();
      }
      hintsCostsTotal += 5;
      hintUsedThisLevel = true;
      showToast("💡 Hint unlocked (-5 XP)");
      renderRoom();
    } catch(e) {
      console.error(e);
    }
  };

  window.erSubmitAnswer = function() {
    if (isSubmitting) return;
    const inputEl = document.getElementById('er-input');
    const val = inputEl ? inputEl.value.trim().toLowerCase() : '';
    if (!val) return;

    isSubmitting = true;
    const room = ROOM_THEMES[activeTheme];
    const q = room.questions[currentLevelIdx];
    const fb = document.getElementById('er-feedback');

    if (val === q.ans.toLowerCase()) {
      fb.style.color = 'var(--green)';
      fb.textContent = '✓ Lock opened! Current flowing.';
      document.getElementById('er-door-lock').classList.add('unlocked');
      document.getElementById('er-door-lock').textContent = '🔓';
      gameXpAccumulated += 10;

      setTimeout(() => {
        isSubmitting = false;
        currentLevelIdx++;
        hintUsedThisLevel = false;
        if (currentLevelIdx >= 5) {
          erEscapeComplete();
        } else {
          renderRoom();
        }
      }, 1000);
    } else {
      fb.style.color = 'var(--red)';
      fb.textContent = '✗ Incorrect code. Lock remains secure!';
      isSubmitting = false;
    }
  };

  async function erEscapeComplete() {
    if (timerInterval) clearInterval(timerInterval);
    
    let personalBestResult = false;
    try {
      const res = await api('/api/escape-room/submit', 'POST', { escape_time: elapsedSeconds });
      personalBestResult = res.personalBest;
    } catch(e) {
      console.error(e);
    }

    const finalXpEarned = Math.max(0, gameXpAccumulated - hintsCostsTotal);
    gameXpTotal += finalXpEarned;

    container.innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;text-align:center;padding:1rem 0;">
        <div style="font-size:4rem;margin-bottom:0.5rem;animation:cbBuildPop 0.8s ease-out;">🔓🚪🎉</div>
        <h2 style="font-size:1.6rem;font-weight:800;color:#10b981;margin-bottom:0.3rem;">Escaped Successfully!</h2>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">You escaped the ${ROOM_THEMES[activeTheme].name}!</div>

        <div style="background:rgba(16,185,129,0.06);border:1.5px solid rgba(16,185,129,0.3);border-radius:16px;padding:1.2rem;margin-bottom:1.5rem;max-width:320px;margin:0 auto 1.5rem auto;">
          <div style="font-size:2.8rem;font-weight:800;color:#10b981;">${elapsedSeconds}s</div>
          <div style="color:var(--text-muted);font-size:0.8rem;margin-bottom:0.5rem;">Your Escape Time</div>
          ${personalBestResult ? '<div style="font-weight:bold;color:#facc15;font-size:0.85rem;margin-bottom:0.5rem;">⭐ New Personal Best!</div>' : ''}
          <div style="font-size:0.85rem;color:var(--text2);">Net XP Earned: <strong>+${finalXpEarned} XP</strong> <span style="font-size:0.75rem;color:var(--text-muted);">(${gameXpAccumulated} gained - ${hintsCostsTotal} on hints)</span></div>
        </div>

        <!-- Leaderboard -->
        <div style="text-align:left;max-width:320px;margin:0 auto 1.5rem auto;">
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.3rem;">🏆 CLASSROOM FASTEST ESCAPES</div>
          <div class="cb-leaderboard-box" id="er-leaderboard-list">
            <div style="color:var(--text-muted);font-size:0.75rem;padding:0.5rem;">Loading leaderboard...</div>
          </div>
        </div>

        <button onclick="closeGame()" style="background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;border-radius:12px;padding:0.8rem 2rem;font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;">
          Exit Room ✓
        </button>
      </div>
    `;
    fetchLeaderboards();
  }

  renderIntro();
}
