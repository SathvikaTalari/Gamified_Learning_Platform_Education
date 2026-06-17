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
}

function closeGame() {
  document.getElementById('minigame-modal').style.display = 'none';
  if (gameXpTotal > 0) {
    if (currentUser) {
      currentUser.xp = (currentUser.xp || 0) + gameXpTotal;
      currentUser.level = Math.floor(currentUser.xp / 100) + 1;
      localStorage.setItem('vq_user', JSON.stringify(currentUser));
      updateUserUI();
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
