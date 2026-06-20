// ===== STATE =====
let currentUser = null;
let currentToken = null;
let currentSubjectId = null;
let currentLessonId = null;
let currentLanguage = 'en';
let selectedRole = 'student';
let quizState = { questions:[], current:0, score:0, answered:false };
let chartInstance = null;
let scanStream = null;
let scanCapturedImage = null;
let socket = null;
let battleRoomCode = null;
let battleState = { questionsCount: 0, currentQuestionIndex: 0, players: [], timer: 10, answered: false };

let currentSubjectCode = null;
let currentSubjectName = '';
let currentSubjectIcon = '';
let currentSubjectColor = '';
let currentSubjectDesc = '';

const API = '';

// ===== TRANSLATIONS =====
const T = {
  en: {
    home:'Home', learn:'Learn', rank:'Rank', badges:'Badges', me:'Me',
    chooseSubject:'Choose Subject', selectSubject:'Select a subject to start learning',
    level:'Level', dayStreak:'Day Streak', continueLearn:'Continue Learning',
    didYouKnow:"Did You Know?", startQuiz:'Start Quiz 🎯', nextQuestion:'Next Question →',
    seeResult:'See Results', tryAgain:'Try Again 🔄', backToLesson:'Back to Lesson',
    backToSubjects:'Back to Subjects', excellent:'Excellent! 🎉', great:'Great Work! 👏',
    goodJob:'Good Job! 💪', keepTrying:'Keep Trying! 📚',
    funFacts:[
      "Zero was invented in India! The concept of zero as a number was developed by Indian mathematician Brahmagupta in 628 AD.",
      "The first computer programmer was a woman! Ada Lovelace wrote the first algorithm in the 1840s.",
      "Honey never spoils — archaeologists found 3000-year-old honey in Egyptian tombs, still edible!",
      "The human brain has 86 billion neurons, each connecting to thousands of others — more connections than stars in the Milky Way!",
      "Plants can communicate with each other through underground fungal networks called the Wood Wide Web!",
      "Light travels 299,792 km per second — it takes only 8 minutes from the Sun to reach Earth!"
    ]
  },
  hi: {
    home:'होम', learn:'सीखें', rank:'रैंक', badges:'बैज', me:'मैं',
    chooseSubject:'विषय चुनें', selectSubject:'सीखने के लिए विषय चुनें',
    level:'स्तर', dayStreak:'दिन की लकीर', continueLearn:'सीखना जारी रखें',
    didYouKnow:'क्या आप जानते हैं?', startQuiz:'क्विज़ शुरू करें 🎯',
    nextQuestion:'अगला प्रश्न →', seeResult:'परिणाम देखें', tryAgain:'फिर कोशिश करें 🔄',
    backToLesson:'पाठ पर वापस', backToSubjects:'विषयों पर वापस',
    excellent:'शानदार! 🎉', great:'बेहतरीन काम! 👏', goodJob:'अच्छा काम! 💪', keepTrying:'कोशिश जारी रखो! 📚',
    funFacts:[
      "शून्य का आविष्कार भारत में हुआ था! भारतीय गणितज्ञ ब्रह्मगुप्त ने 628 ईस्वी में शून्य की अवधारणा विकसित की।",
      "पहली कंप्यूटर प्रोग्रामर एक महिला थीं! एडा लवलेस ने 1840 के दशक में पहला एल्गोरिदम लिखा।",
      "शहद कभी खराब नहीं होता — पुरातत्वविदों को मिस्र की कब्रों में 3000 साल पुराना शहद मिला, जो अभी भी खाने योग्य था!",
      "मानव मस्तिष्क में 86 अरब न्यूरॉन्स हैं, जो आकाशगंगा के तारों से भी अधिक जुड़े हुए हैं!",
      "पौधे भूमिगत फंगल नेटवर्क के माध्यम से एक दूसरे से संवाद कर सकते हैं!",
      "प्रकाश 2,99,792 किमी प्रति सेकंड की गति से चलता है — सूर्य से पृथ्वी तक आने में 8 मिनट लगते हैं!"
    ]
  },
  mr: {
    home:'होम', learn:'शिका', rank:'रँक', badges:'बॅज', me:'मी',
    chooseSubject:'विषय निवडा', selectSubject:'शिकण्यासाठी विषय निवडा',
    level:'स्तर', dayStreak:'दिवसांची मालिका', continueLearn:'शिकणे सुरू ठेवा',
    didYouKnow:'तुम्हाला माहित आहे का?', startQuiz:'क्विझ सुरू करा 🎯',
    nextQuestion:'पुढचा प्रश्न →', seeResult:'निकाल पहा', tryAgain:'पुन्हा प्रयत्न करा 🔄',
    backToLesson:'धड्याकडे परत', backToSubjects:'विषयांकडे परत',
    excellent:'उत्कृष्ट! 🎉', great:'छान काम! 👏', goodJob:'चांगले काम! 💪', keepTrying:'प्रयत्न करत राहा! 📚',
    funFacts:[
      "शून्याचा शोध भारतात लागला! ब्रह्मगुप्त या भारतीय गणितज्ञाने 628 AD मध्ये शून्याची संकल्पना विकसित केली.",
      "पहिली संगणक प्रोग्रामर एक महिला होती! एडा लव्हलेसने 1840 च्या दशकात पहिले अल्गोरिदम लिहिले.",
      "मध कधीच खराब होत नाही — इजिप्शियन थडग्यात 3000 वर्षे जुने मध सापडले, जे अजूनही खाण्यायोग्य होते!",
      "मानवी मेंदूमध्ये 86 अब्ज न्यूरॉन्स आहेत — आकाशगंगेतील ताऱ्यांपेक्षाही जास्त कनेक्शन्स!",
      "झाडे भूमिगत बुरशी नेटवर्कद्वारे एकमेकांशी संवाद साधू शकतात!",
      "प्रकाश 2,99,792 किमी/सेकंद वेगाने प्रवास करतो — सूर्यापासून पृथ्वीपर्यंत येण्यास 8 मिनिटे लागतात!"
    ]
  },
  or: {
    home:'ହୋମ୍', learn:'ଶିଖନ୍ତୁ', rank:'ର‍୍ୟାଙ୍କ', badges:'ବ୍ୟାଜ୍', me:'ମୁଁ',
    chooseSubject:'ବିଷୟ ଚୟନ କରନ୍ତୁ', selectSubject:'ଶିଖିବା ପାଇଁ ଏକ ବିଷୟ ଚୟନ କରନ୍ତୁ',
    level:'ସ୍ତର', dayStreak:'ଦିନର କ୍ରମ', continueLearn:'ଶିଖିବା ଜାରି ରଖନ୍ତୁ',
    didYouKnow:'ଆପଣ ଜାଣନ୍ତି କି?', startQuiz:'କ୍ଵିଜ୍ ଆରମ୍ଭ କରନ୍ତୁ 🎯',
    nextQuestion:'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ →', seeResult:'ଫଳାଫଳ ଦେଖନ୍ତୁ', tryAgain:'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ 🔄',
    backToLesson:'ପାଠକୁ ଫେରନ୍ତୁ', backToSubjects:'ବିଷୟକୁ ଫେରନ୍ତୁ',
    excellent:'ଉତ୍କୃଷ୍ଟ! 🎉', great:'ବହୁତ ବଢିଆ! 👏', goodJob:'ଭଲ କାମ! 💪', keepTrying:'ଚେଷ୍ଟା ଜାରି ରଖନ୍ତୁ! 📚',
    funFacts:[
      "ଭାରତରେ ଶୂନ୍ୟର ଆବିଷ୍କାର ହୋଇଥିଲା! ଖ୍ରୀଷ୍ଟାବ୍ଦ 628 ରେ ଭାରତୀୟ ଗଣିତଜ୍ଞ ବ୍ରହ୍ମଗୁପ୍ତଙ୍କ ଦ୍ଵାରା ଶୂନ୍ୟର ଅବଧାରଣା ବିକଶିତ ହୋଇଥିଲା।",
      "ପ୍ରଥମ କମ୍ପ୍ୟୁଟର ପ୍ରୋଗ୍ରାମର ଜଣେ ମହିଳା ଥିଲେ! ଆଡା ଲଭଲେସ୍ 1840 ଦଶକରେ ପ୍ରଥମ ଆଲଗୋରିଦମ ଲେଖିଥିଲେ।",
      "ମହୁ କେବେ ନଷ୍ଟ ହୁଏ ନାହିଁ - ପ୍ରତ୍ନତତ୍ତ୍ୱବିତ୍ ମାନେ ଇଜିପ୍ଟର କବରରେ 3000 ବର୍ଷର ପୁରୁଣା ମହୁ ପାଇଥିଲେ, ଯାହା ଏବେ ବି ଖାଇବା ଯୋଗ୍ୟ!",
      "ମାନବ ମସ୍ତିଷ୍କରେ 86 ବିଲିୟନ ନ୍ୟୁରନ ଅଛି - ଆକାଶଗଙ୍ଗାର ତାରାମାନଙ୍କ ଅପେକ୍ଷा ଅଧିକ ସଂଯୋଜିତ!",
      "ଉଦ୍ଭିଦମାନେ ମାଟି ତଳେ ଥିବା ଫଙ୍ଗଲ ନେଟୱାର୍କ ମାଧ୍ୟମରେ ପରସ୍ପର ସହ ଯୋଗାଯୋଗ କରିପାରିବେ!",
      "ଆଲୋକ ପ୍ରତି ସେକେଣ୍ଡରେ 2,99,792 କିଲୋମିଟର ବେଗରେ ଗତି କରିଥାଏ - ସୂର୍ଯ୍ୟରୁ ପୃଥିବୀ ପର୍ଯ୍ୟନ୍ତ ଆଲୋକ ଆସିବାକୁ ମାତ୍ର 8 ମିନିଟ୍ ସମୟ ଲାଗେ!"
    ]
  }
};

function t(key) { return (T[currentLanguage] || T.en)[key] || T.en[key] || key; }

// ===== API CALLS =====
async function api(endpoint, method='GET', body=null) {
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if (currentToken) opts.headers['Authorization'] = 'Bearer ' + currentToken;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(API + endpoint, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch(e) { throw e; }
}

// ===== PASSWORD STRENGTH =====
function checkPasswordStrength(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

function updatePasswordMeter() {
  const password = document.getElementById('reg-password').value;
  const section = document.getElementById('password-strength-section');

  if (!password) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  const { checks, score } = checkPasswordStrength(password);

  // Update meter fill
  const fill = document.getElementById('strength-meter-fill');
  const pct = (score / 5) * 100;
  fill.style.width = pct + '%';

  // Color & label
  const label = document.getElementById('strength-label');
  if (score <= 1) {
    fill.className = 'strength-meter-fill strength-weak';
    label.textContent = '🔴 Weak';
    label.className = 'strength-label strength-weak';
  } else if (score === 2) {
    fill.className = 'strength-meter-fill strength-fair';
    label.textContent = '🟠 Fair';
    label.className = 'strength-label strength-fair';
  } else if (score === 3) {
    fill.className = 'strength-meter-fill strength-good';
    label.textContent = '🟡 Good';
    label.className = 'strength-label strength-good';
  } else {
    fill.className = 'strength-meter-fill strength-strong';
    label.textContent = '🟢 Strong';
    label.className = 'strength-label strength-strong';
  }

  // Update checklist
  updateCheckItem('check-length', checks.minLength);
  updateCheckItem('check-upper', checks.hasUppercase);
  updateCheckItem('check-lower', checks.hasLowercase);
  updateCheckItem('check-number', checks.hasNumber);
  updateCheckItem('check-special', checks.hasSpecial);
}

function updateCheckItem(id, passed) {
  const el = document.getElementById(id);
  const icon = el.querySelector('.check-icon');
  if (passed) {
    el.classList.add('passed');
    el.classList.remove('failed');
    icon.textContent = '✓';
  } else {
    el.classList.remove('passed');
    el.classList.add('failed');
    icon.textContent = '✗';
  }
}

// ===== ROLE SELECTION =====
function selectRole(role) {
  selectedRole = role;
  const studentCard = document.getElementById('role-card-student');
  const teacherCard = document.getElementById('role-card-teacher');
  const studentFields = document.getElementById('student-fields');
  const teacherFields = document.getElementById('teacher-fields');

  if (role === 'student') {
    studentCard.classList.add('selected');
    teacherCard.classList.remove('selected');
    studentFields.classList.remove('hidden');
    teacherFields.classList.add('hidden');
  } else {
    teacherCard.classList.add('selected');
    studentCard.classList.remove('selected');
    teacherFields.classList.remove('hidden');
    studentFields.classList.add('hidden');
  }
}

// ===== AUTH =====
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('auth-error').classList.add('hidden');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { showAuthError('Please fill in all fields'); return; }
  try {
    const data = await api('/api/login', 'POST', { email, password });
    loginSuccess(data);
  } catch(e) { showAuthError(e.message); }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!name || !email || !password) {
    showAuthError('Please fill in all required fields');
    return;
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAuthError('Please enter a valid email address');
    return;
  }

  // Password strength check
  const { score } = checkPasswordStrength(password);
  if (score < 4) {
    showAuthError('Password is too weak. Please meet at least 4 of the 5 requirements.');
    return;
  }

  const body = { name, email, password, role: selectedRole };

  if (selectedRole === 'student') {
    const grade = parseInt(document.getElementById('reg-grade').value);
    const school = document.getElementById('reg-school').value.trim();
    const languageCheckboxes = document.querySelectorAll('.lang-checkbox:checked');
    if (languageCheckboxes.length > 3 || languageCheckboxes.length === 0) { showAuthError('Please select exactly 1 to 3 languages'); return; }
    const languages = Array.from(languageCheckboxes).map(cb => cb.value);
    if (!school) { showAuthError('Please enter your school name'); return; }
    if (!grade) { showAuthError('Please select your grade'); return; }
    body.grade = grade;
    body.school = school;
    body.languages = languages;
    body.language = languages[0];
  } else {
    const department = document.getElementById('reg-department').value;
    const subject_specialization = document.getElementById('reg-specialization').value;
    const languageCheckboxes = document.querySelectorAll('.teacher-lang-checkbox:checked');
    if (languageCheckboxes.length > 3 || languageCheckboxes.length === 0) { showAuthError('Please select exactly 1 to 3 languages'); return; }
    const languages = Array.from(languageCheckboxes).map(cb => cb.value);
    if (!department) { showAuthError('Please select your department'); return; }
    if (!subject_specialization) { showAuthError('Please select your subject specialization'); return; }
    body.department = department;
    body.subject_specialization = subject_specialization;
    body.languages = languages;
    body.language = languages[0];
  }

  try {
    const data = await api('/api/register', 'POST', body);
    loginSuccess(data);
  } catch(e) { showAuthError(e.message); }
}

function loginSuccess(data) {
  currentToken = data.token;
  currentUser = data.user;
  
  let prefs = ["en"];
  try { if (currentUser.preferred_languages) prefs = JSON.parse(currentUser.preferred_languages); } catch(e) {}
  currentUser.preferred_languages_array = prefs;
  currentLanguage = prefs[0] || currentUser.language || 'en';
  
  localStorage.setItem('vq_token', currentToken);
  
  const langSwitcher = document.getElementById('lang-switcher');
  if (langSwitcher) {
    const langNames = { 'en': 'EN', 'hi': 'हि', 'te': 'తె', 'mr': 'म', 'or': 'ଓଡ଼' };
    langSwitcher.innerHTML = prefs.map(l => `<option value="${l}">${langNames[l] || l}</option>`).join('');
    langSwitcher.value = currentLanguage;
  }
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('active');
  updateNavStats();
  // Role-aware redirect
  if (currentUser.role === 'teacher') {
    showScreen('teacher-home');
  } else {
    showScreen('home');
  }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  // Auto-hide after 5 seconds
  setTimeout(() => el.classList.add('hidden'), 5000);
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('vq_token');
  if (token) {
    currentToken = token;
    try {
      const profile = await api('/api/profile');
      currentUser = profile;
      currentLanguage = currentUser.language || 'en';
      document.getElementById('lang-switcher').value = currentLanguage;
      document.getElementById('auth-screen').classList.remove('active');
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('main-screen').classList.remove('hidden');
      document.getElementById('main-screen').classList.add('active');
      updateNavStats();
      if (currentUser.role === 'teacher') {
        showScreen('teacher-home');
      } else {
        showScreen('home');
      }
    } catch { localStorage.removeItem('vq_token'); currentToken = null; }
  }
});

// ===== NAVIGATION =====
function showScreen(name) {
  // Sync focus data if navigating away from a lesson or quiz
  const activeScreenEl = document.querySelector('.inner-screen.active');
  const prevScreen = activeScreenEl ? activeScreenEl.id.replace('screen-', '') : '';
  if (prevScreen === 'lesson' || prevScreen === 'quiz') {
    if (typeof SmartFocus !== 'undefined') {
      SmartFocus.syncFocusData();
    }
  }

  document.querySelectorAll('.inner-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById('screen-' + name);
  if (screen) screen.classList.add('active');
  // Match nav button in whichever nav is active
  const navBtn = document.querySelector('[data-screen="'+name+'"]');
  if (navBtn) navBtn.classList.add('active');
  if (name === 'home') loadHome();
  if (name === 'subjects') loadSubjects();
  if (name === 'leaderboard') loadLeaderboard();
  if (name === 'badges') loadBadges();
  if (name === 'profile') loadProfile();
  if (name === 'teacher-home') loadTeacherHome();
  if (name === 'create-lesson') loadCreateLessonForm();
  if (name === 'my-content') loadMyContent();
  if (name === 'groups') loadGroups();

  // Cleanup multiplayer battle connection if navigating away from it
  if (['home', 'subjects', 'leaderboard', 'badges', 'profile'].includes(name)) {
    if (socket) {
      socket.disconnect();
      socket = null;
      battleRoomCode = null;
    }
  }
}

function updateNavStats() {
  if (!currentUser) return;
  document.getElementById('nav-xp').textContent = currentUser.xp || 0;
  document.getElementById('nav-level').textContent = currentUser.level || 1;
  document.getElementById('nav-streak').textContent = currentUser.streak || 0;
  document.getElementById('nav-avatar').textContent = currentUser.avatar || '🧑‍🎓';

  const rolePill = document.getElementById('nav-role-pill');
  const studentNav = document.getElementById('student-nav');
  const teacherNav = document.getElementById('teacher-nav');

  if (currentUser.role === 'teacher') {
    rolePill.textContent = '👩‍🏫 Teacher';
    rolePill.className = 'stat-pill role-pill role-teacher';
    studentNav.classList.add('hidden');
    teacherNav.classList.remove('hidden');
    document.getElementById('ai-tutor-fab')?.classList.add('hidden');
  } else {
    rolePill.textContent = '🧑‍🎓 Student';
    rolePill.className = 'stat-pill role-pill role-student';
    studentNav.classList.remove('hidden');
    teacherNav.classList.add('hidden');
    document.getElementById('ai-tutor-fab')?.classList.remove('hidden');
  }
}


function switchLanguage(lang) {
  currentLanguage = lang;
  if (currentUser) currentUser.language = lang;
}

// ===== HOME & DASHBOARD =====
async function loadHome() {
  if (!currentUser) return;
  
  // Header
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning! 🌅' : hour < 17 ? 'Good Afternoon! ☀️' : 'Good Evening! 🌙';
  document.getElementById('home-greeting').textContent = greeting;
  document.getElementById('home-username').textContent = 'Welcome back, ' + currentUser.name.split(' ')[0] + '!';
  document.getElementById('home-streak').textContent = currentUser.streak || 0;
  
  // XP Bar
  document.getElementById('home-level').textContent = currentUser.level || 1;
  document.getElementById('home-xp').textContent = currentUser.xp || 0;
  const nextLevelXP = ((currentUser.level || 1)) * 200;
  const currentLevelXP = ((currentUser.level || 1) - 1) * 200;
  const progress = Math.min(100, ((currentUser.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  document.getElementById('home-xp-next').textContent = nextLevelXP;
  document.getElementById('xp-bar').style.width = Math.max(4, progress) + '%';

  // Random fun fact
  const facts = T[currentLanguage]?.funFacts || T.en.funFacts;
  document.getElementById('fun-fact-text').textContent = facts[Math.floor(Math.random() * facts.length)];

  try {
    // Fetch subjects for "Continue Learning"
    const subjects = await api('/api/subjects');
    const container = document.getElementById('home-subjects');
    container.innerHTML = subjects.map(s => `
      <div class="subject-home-card" onclick="openSubject(${s.id},'${s.name}','${s.icon}','${s.color}','${s.description}','${s.code}')">
        <div class="subject-home-icon">${s.icon}</div>
        <div class="subject-home-info">
          <div class="subject-home-name" style="color:${s.color}">${s.name}</div>
          <div class="subject-home-progress">Tap to explore</div>
          <div class="subject-home-bar"><div class="subject-home-bar-fill" style="background:${s.color};width:${Math.random()*60+20}%"></div></div>
        </div>
      </div>
    `).join('');

    // Fetch Dashboard Data (XP Chart, Tasks, Activity, Badges)
    const dashData = await api('/api/dashboard');
    
    renderXpChart(dashData.weeklyXp);
    renderRecentActivity(dashData.recentLessons);
    renderUpcomingTasks(dashData.upcomingTasks);
    renderBadgesShowcase(dashData.recentBadges);

  } catch(e) { console.error("Dashboard error:", e); }
}

function renderXpChart(weeklyXp) {
    const ctx = document.getElementById('weeklyXpChart').getContext('2d');
    
    // Sort chronological
    weeklyXp.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    const labels = weeklyXp.map(d => {
        const dateObj = new Date(d.date);
        return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = weeklyXp.map(d => d.xp);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'XP Earned',
                data: data,
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: '#FF6B35',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#A8B8D0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#A8B8D0' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A2840',
                    titleColor: '#FF6B35',
                    bodyColor: '#F0F4FF',
                    borderColor: '#2A3F5F',
                    borderWidth: 1
                }
            }
        }
    });
}

function renderRecentActivity(lessons) {
    const container = document.getElementById('dash-recent-activity');
    if (!lessons || lessons.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent activity yet. Start learning!</div>';
        return;
    }

    container.innerHTML = lessons.map(l => {
        const dateStr = new Date(l.completed_at).toLocaleDateString();
        return `
            <div class="dash-list-item" onclick="openLesson(${l.id})" style="border-left-color: ${l.color}">
                <div class="dash-list-icon">${l.icon}</div>
                <div class="dash-list-info">
                    <div class="dash-list-title">${l.title}</div>
                    <div class="dash-list-meta">Score: ${l.score} | ${dateStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderUpcomingTasks(tasks) {
    const container = document.getElementById('dash-upcoming-tasks');
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">No upcoming tasks assigned. You\'re all caught up!</div>';
        return;
    }

    container.innerHTML = tasks.map(t => {
        const dateStr = new Date(t.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'});
        return `
            <div class="dash-list-item" onclick="showScreen('subjects')" style="border-left-color: ${t.color}">
                <div class="dash-list-icon">${t.icon}</div>
                <div class="dash-list-info">
                    <div class="dash-list-title">${t.title}</div>
                    <div class="dash-list-meta task-due">📅 Due: ${dateStr}</div>
                </div>
                <button class="btn-sm">Start</button>
            </div>
        `;
    }).join('');
}

function renderBadgesShowcase(badges) {
    const container = document.getElementById('dash-badges');
    if (!badges || badges.length === 0) {
        container.innerHTML = '<div class="empty-state">Complete lessons to earn badges!</div>';
        return;
    }

    container.innerHTML = badges.map(b => `
        <div class="dash-badge-item" title="${b.name}\n${b.description}">
            <div class="dash-badge-icon">${b.icon}</div>
        </div>
    `).join('');
}

// ===== SUBJECTS =====
async function loadSubjects() {
  try {
    const subjects = await api('/api/subjects');
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = subjects.map(s => `
      <div class="subject-card" onclick="openSubject(${s.id},'${s.name}','${s.icon}','${s.color}','${s.description}','${s.code}')" style="border-color:${s.color}22;">
        <div class="subject-card-icon">${s.icon}</div>
        <div class="subject-card-name" style="color:${s.color}">${s.name}</div>
        <div class="subject-card-desc">${s.description}</div>
        <div class="subject-card-footer">
          <span class="subject-card-lessons" style="color:${s.color}">Explore →</span>
        </div>
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

async function openSubject(id, name, icon, color, desc, code) {
  currentSubjectId = id;
  currentSubjectCode = code;
  currentSubjectName = name;
  currentSubjectIcon = icon;
  currentSubjectColor = color;
  currentSubjectDesc = desc;
  
  // Set options screen header
  const header = document.getElementById('subject-options-header');
  if (header) {
    header.style.background = `${color}22`;
    header.style.borderLeft = `4px solid ${color}`;
    header.innerHTML = `
      <div class="lessons-header-icon">${icon}</div>
      <div>
        <div class="lessons-header-name" style="color:${color}">${name}</div>
        <div class="lessons-header-desc">${desc}</div>
      </div>
    `;
  }

  // Set card colors or borders based on subject color
  const lessonsCard = document.getElementById('mode-card-lessons');
  const gamesCard = document.getElementById('mode-card-games');
  if (lessonsCard) {
    lessonsCard.style.borderColor = `${color}44`;
  }
  if (gamesCard) {
    gamesCard.style.borderColor = `${color}44`;
  }
  
  showScreen('subject-options');
}

async function selectLearningMode(mode) {
  if (mode === 'lessons') {
    await loadSubjectLessons();
    showScreen('lessons');
  } else if (mode === 'games') {
    loadSubjectGames();
    showScreen('subject-games');
  }
}

async function loadSubjectLessons() {
  const id = currentSubjectId;
  const name = currentSubjectName;
  const icon = currentSubjectIcon;
  const color = currentSubjectColor;
  const desc = currentSubjectDesc;

  const header = document.getElementById('lessons-header');
  header.style.background = `${color}22`;
  header.style.borderLeft = `4px solid ${color}`;
  header.innerHTML = `<div class="lessons-header-icon">${icon}</div><div><div class="lessons-header-name" style="color:${color}">${name}</div><div class="lessons-header-desc">${desc}</div></div>`;
  try {
    const lessons = await api('/api/lessons/' + id);
    const list = document.getElementById('lessons-list');
    list.innerHTML = lessons.map((l, i) => {
      const done = l.userProgress?.completed;
      const diffClass = l.difficulty;
      const title = currentLanguage==='hi' && l.title_hi ? l.title_hi : currentLanguage==='mr' && l.title_mr ? l.title_mr : currentLanguage==='te' && l.title_te ? l.title_te : l.title;
      return `
        <div class="lesson-card ${done?'completed':''}" onclick="openLesson(${l.id})">
          <div class="lesson-card-num" style="${done?'':'color:'+color}">${done?'✓':(i+1)}</div>
          <div class="lesson-card-info">
            <div class="lesson-card-title">${title}</div>
            <div class="lesson-card-meta">
              <span class="lesson-badge ${diffClass}">${l.difficulty}</span>
              ${done?'<span class="lesson-badge completed">✓ Completed</span>':''}
              ${l.userProgress?.score?`<span class="lesson-badge">Score: ${l.userProgress.score}/${l.userProgress.score*10>0?l.userProgress.score:''}</span>`:''}
            </div>
          </div>
          <div class="lesson-card-xp">+${l.xp_reward} XP</div>
          ${done?'<div class="lesson-card-check">✅</div>':''}
        </div>
      `;
    }).join('');
  } catch(e) { console.error(e); }
}

const SubjectGames = {
  math: [
    { id: 'mathflash', title: 'Math Flash', icon: '⚡', desc: 'Solve arithmetic equations against the clock! / तेज़ गणित समाधान!', xp: '+5 XP per answer' },
    { id: 'numberpuzzle', title: 'Number Puzzle', icon: '🧩', desc: 'Find the patterns and solve number sequences. / संख्या पहेली!', xp: '+8 XP per puzzle' },
    { id: 'mathkingdom', title: 'Math Kingdom Builder', icon: '🏰', desc: 'Solve math to build your own visual kingdom! / गणित साम्राज्य निर्माता!', xp: '+5 XP per building block' },
    { id: 'escaperoom', title: 'Equation Escape Room', icon: '🔑', desc: 'Solve 5 equations under pressure to escape the room! / समीकरण एस्केप रूम!', xp: '+10 XP per escape' }
  ],
  science: [
    { id: 'wordscience', title: 'Science Words', icon: '🔤', desc: 'Solve scientific vocabulary scrambles with clues. / विज्ञान के शब्द!', xp: '+3 XP per word' },
    { id: 'chemlab', title: 'Virtual Chemistry Lab', icon: '🧪', desc: 'Mix chemicals and watch real reactions! Create experiments from Grade 6–12 syllabus. / रासायनिक प्रयोग करें!', xp: '+10 XP per experiment' },
    { id: 'spacemission', title: 'Space Mission Control', icon: '🚀', desc: 'Become an ISRO scientist! Solve physics & chemistry problems to launch a rocket. / रॉकेट लॉन्च करें!', xp: '+15 XP per stage' },
    { id: 'circuitbuilder', title: 'Circuit Builder', icon: '🔌', desc: 'Build circuits by unlocking electrical components and connecting them! / सर्किट बिल्डर!', xp: '+10 XP per correct circuit' }
  ],
  tech: [
    { id: 'wordscience', title: 'Science Words', icon: '🔤', desc: 'Identify tech and internet vocabulary. / तकनीकी शब्द!', xp: '+3 XP per word' },
    { id: 'numberpuzzle', title: 'Number Puzzle', icon: '🧩', desc: 'Reason through logical code patterns. / कोडिंग तर्क!', xp: '+8 XP per puzzle' }
  ],
  eng: [
    { id: 'numberpuzzle', title: 'Number Puzzle', icon: '🧩', desc: 'Solve engineering and design pattern sequences. / इंजीनियरिंग पहेली!', xp: '+8 XP per puzzle' },
    { id: 'mathflash', title: 'Math Flash', icon: '⚡', desc: 'Quick estimations and speed calculations. / गति गणना!', xp: '+5 XP per answer' }
  ]
};

function loadSubjectGames() {
  const code = currentSubjectCode || 'math';
  const color = currentSubjectColor || 'var(--primary)';
  const name = currentSubjectName || 'Subject';
  const icon = currentSubjectIcon || '🎮';
  
  // Set header
  const header = document.getElementById('subject-games-header');
  if (header) {
    header.style.background = `${color}22`;
    header.style.borderLeft = `4px solid ${color}`;
    header.innerHTML = `
      <div class="lessons-header-icon">${icon}</div>
      <div>
        <div class="lessons-header-name" style="color:${color}">${name} Games / खेल</div>
        <div class="lessons-header-desc">Play interactive mini-games to practice your STEM concepts!</div>
      </div>
    `;
  }
  
  // Render games list
  const grid = document.getElementById('subject-games-grid');
  if (grid) {
    const games = SubjectGames[code] || [];
    if (games.length > 0) {
      grid.innerHTML = games.map(g => `
        <div class="game-card" style="border-left-color:${color};">
          <span class="game-card-xp-badge">⚡ ${g.xp}</span>
          <div class="game-card-header">
            <span class="game-card-icon">${g.icon}</span>
            <span class="game-card-title">${g.title}</span>
          </div>
          <p class="game-card-desc">${g.desc}</p>
          <button class="btn-primary" onclick="launchGame('${g.id}')" style="width:100%; margin-top:auto; font-family:'Baloo 2', cursive; font-size:1rem; font-weight:700; background:linear-gradient(135deg, ${color}, var(--primary-dark)); border:none; padding:10px; border-radius:8px;">
            Play Game 🎮
          </button>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<div class="empty-state">No games available for this subject yet.</div>';
    }
  }
}

// ===== LESSON DETAIL =====
async function openLesson(id) {
  currentLessonId = id;
  showScreen('lesson');
  if (typeof SmartFocus !== 'undefined') {
    SmartFocus.startFocusSession(id);
  }
  try {
    let lesson;
    if (navigator.onLine) {
      try {
        lesson = await api('/api/lesson/' + id);
      } catch (err) {
        console.warn("Could not load lesson online, trying offline cache...", err);
        lesson = await getOfflineLesson(id);
      }
    } else {
      lesson = await getOfflineLesson(id);
    }

    if (!lesson) {
      document.getElementById('lesson-content').innerHTML = `
        <div class="content-card" style="text-align:center; padding:40px;">
          <div style="font-size:3rem; margin-bottom:15px;">📶</div>
          <h3>Offline / ऑफ़लाइन</h3>
          <p style="color:var(--text2); margin-bottom:20px;">This lesson is not available offline. Please connect to the internet to download it!</p>
          <button class="btn-primary" onclick="showScreen('home')">Go Home 🏠</button>
        </div>
      `;
      return;
    }

    const title = currentLanguage==='hi' && lesson.title_hi ? lesson.title_hi : currentLanguage==='mr' && lesson.title_mr ? lesson.title_mr : currentLanguage==='te' && lesson.title_te ? lesson.title_te : lesson.title;
    const c = lesson.content || {};
    const color = lesson.subject_color || 'var(--primary)';

    const vocab = vocabWords[lesson.title] || ['Science', 'Technology', 'Mathematics', 'Engineering'];
    const labelListen = { en: 'Listen', hi: 'सुनें', mr: 'ऐका', or: 'ଶୁଣନ୍ତୁ' }[currentLanguage] || 'Listen';
    const labelPractice = { en: 'Practice', hi: 'अभ्यास करें', mr: 'सराव करा', or: 'ଅଭ୍ୟาସ' }[currentLanguage] || 'Practice';
    const readBtnText = { en: '🔊 Read Aloud', hi: '🔊 पाठ सुनें', mr: '🔊 धडा वाचा', or: '🔊 ପାଠ ପଢନ୍ତୁ' }[currentLanguage] || '🔊 Read Aloud';

    const isDownloaded = await checkIfLessonDownloaded(id);
    const downloadBtnHtml = isDownloaded 
      ? `<button id="btn-download-lesson" class="btn-read-lesson" onclick="downloadLessonOffline(${id})" style="background: rgba(78, 205, 196, 0.12); color: var(--secondary); border: 1px solid rgba(78, 205, 196, 0.3); margin-right:10px;">Offline Ready ✅</button>`
      : `<button id="btn-download-lesson" class="btn-read-lesson" onclick="downloadLessonOffline(${id})" style="background: rgba(123, 104, 238, 0.12); color: var(--purple); border: 1px solid rgba(123, 104, 238, 0.3); margin-right:10px;">Download Offline 📥</button>`;

    document.getElementById('lesson-content').innerHTML = `
      <div class="lesson-header-controls" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:15px;">
        ${downloadBtnHtml}
        <button id="btn-read-lesson" class="btn-read-lesson" onclick="readLessonAloud()">${readBtnText}</button>
      </div>
      <div class="lesson-hero" style="background:${color}22;border:1px solid ${color}44;">
        <div class="lesson-hero-subject">${lesson.subject_name}</div>
        <div class="lesson-hero-title" style="color:${color}">${title}</div>
        <div class="lesson-hero-meta">
          <span class="lesson-hero-badge">Grade ${lesson.grade}</span>
          <span class="lesson-hero-badge">${lesson.difficulty}</span>
          <span class="lesson-hero-badge">⚡ ${lesson.xp_reward} XP</span>
          <span class="lesson-hero-badge">${lesson.questions?.length || 0} Questions</span>
        </div>
      </div>
      ${c.intro ? `
      <div class="content-card">
        <h3>📖 Introduction</h3>
        <p class="intro-text">${c.intro}</p>
      </div>` : ''}
      ${c.concepts?.length ? `
      <div class="content-card">
        <h3>💡 Key Concepts</h3>
        <ul class="concept-list">
          ${c.concepts.map(concept => `<li>${concept}</li>`).join('')}
        </ul>
      </div>` : ''}
      ${c.example ? `
      <div class="content-card">
        <h3>🔍 Example</h3>
        <div class="example-box">
          <div class="example-label">EXAMPLE</div>
          <div class="example-text">${c.example}</div>
        </div>
      </div>` : ''}
      ${c.fun_fact ? `
      <div class="content-card">
        <div class="funfact-box">
          <div class="funfact-label">⭐ FUN FACT</div>
          <div class="funfact-text">${c.fun_fact}</div>
        </div>
      </div>` : ''}

      <!-- Pronunciation Practice -->
      <div class="content-card vocab-card">
        <h3>🗣️ English Pronunciation Practice</h3>
        <p class="vocab-subtitle">Practice saying these English STEM words. Speak clearly!</p>
        <div class="vocab-list">
          ${vocab.map(word => {
            const safeWord = word.replace(/'/g, "\\'");
            const safeId = word.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return `
            <div class="vocab-item" id="vocab-${safeId}">
              <div class="vocab-word-info">
                <span class="vocab-word-text">${word}</span>
                <span class="vocab-status-icon"></span>
              </div>
              <div class="vocab-actions">
                <button class="vocab-listen-btn" onclick="speakVocabWord('${safeWord}')" title="Listen">${labelListen}</button>
                <button class="vocab-speak-btn" onclick="practicePronunciation('${safeWord}', '${safeId}')" id="btn-practice-${safeId}" title="Speak">🎤 ${labelPractice}</button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>

      ${lesson.questions?.length ? `
      <button class="start-quiz-btn" onclick="startQuiz(${lesson.id})">
        🎯 Start Quiz (${lesson.questions.length} questions)
      </button>` : ''}
    `;
  } catch(e) { console.error(e); }
}

function goBackFromLesson() {
  if (currentSubjectId) showScreen('lessons');
  else showScreen('subjects');
}

// ===== QUIZ =====
async function startQuiz(lessonId) {
  showScreen('quiz');
  if (typeof SmartFocus !== 'undefined') {
    SmartFocus.startFocusSession(lessonId);
  }
  try {
    let lesson;
    if (navigator.onLine) {
      try {
        lesson = await api('/api/lesson/' + lessonId);
      } catch (err) {
        console.warn("Could not fetch quiz online, loading offline cache...", err);
        lesson = await getOfflineLesson(lessonId);
      }
    } else {
      lesson = await getOfflineLesson(lessonId);
    }

    if (!lesson) {
      showToast("❌ Quiz not available offline / यह क्विज़ ऑफ़लाइन उपलब्ध नहीं है");
      showScreen('lesson');
      openLesson(lessonId);
      return;
    }

    quizState = { 
      lessonId: lesson.id, 
      questions: lesson.questions, 
      current: 0, 
      score: 0, 
      answered: false, 
      xpReward: lesson.xp_reward,
      isOffline: !navigator.onLine 
    };
    renderQuestion();
  } catch(e) { 
    console.error(e); 
    showToast("❌ Error starting quiz");
  }
}

function renderQuestion() {
  const { questions, current, score } = quizState;
  if (current >= questions.length) { renderResult(); return; }
  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  // Choose question text based on translation
  let qText = q.question;
  if (currentLanguage === 'hi' && q.question_hi) {
    qText = q.question_hi;
  } else if (currentLanguage === 'mr' && q.question_mr) {
    qText = q.question_mr;
  } else if (currentLanguage === 'te' && q.question_te) {
    qText = q.question_te;
  }

  const isFillBlank = q.option_b === '' || q.option_b === null || !['A', 'B', 'C', 'D'].includes(q.correct_answer);

  const labelBack = { en: '← Back', hi: '← पीछे', mr: '← मागे', or: '← ଫେରନ୍ତୁ' }[currentLanguage] || '← Back';
  const labelSpeak = { en: '🎤 Speak Answer', hi: '🎤 उत्तर बोलें', mr: '🎤 उत्तर बोला', or: '🎤 ଉତ୍ତର କୁହନ୍ତୁ' }[currentLanguage] || '🎤 Speak Answer';
  const labelSubmit = { en: 'Submit Answer', hi: 'उत्तर सबमिट करें', mr: 'उत्तर सबमिट करा', or: 'ଉତ୍ତର ସବମିଟ୍' }[currentLanguage] || 'Submit Answer';
  const labelNext = { en: 'Next Question →', hi: 'अगला प्रश्न →', mr: 'पुढचा प्रश्न →', or: 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ →' }[currentLanguage] || 'Next Question →';
  const labelResults = { en: 'See Results 🎯', hi: 'परिणाम देखें 🎯', mr: 'निकाल पहा 🎯', or: 'ଫଳାଫଳ ଦେଖନ୍ତୁ 🎯' }[currentLanguage] || 'See Results 🎯';

  let optionsHtml = '';
  if (!isFillBlank) {
    const options = [
      { letter:'A', text:q.option_a, key:'A' },
      { letter:'B', text:q.option_b, key:'B' },
      { letter:'C', text:q.option_c, key:'C' },
      { letter:'D', text:q.option_d, key:'D' },
    ];
    optionsHtml = `
      <div class="quiz-options" id="quiz-options">
        ${options.map(o => `
          <button class="quiz-option" onclick="selectAnswer('${o.key}','${q.correct_answer}','${q.explanation?.replace(/'/g,"\\'")|| ''}')" data-key="${o.key}">
            <span class="option-letter">${o.letter}</span>
            <span class="option-text">${o.text}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-mcq-voice-controls" style="text-align:center; margin-top:15px;">
        <button id="quiz-mcq-mic-btn" class="quiz-mcq-mic-btn" onclick="startMcqSpeechRecognition()">${labelSpeak}</button>
      </div>
    `;
  } else {
    optionsHtml = `
      <div class="quiz-blank-input-wrap" style="display:flex; gap:10px; margin:20px 0;">
        <input type="text" id="quiz-blank-input" class="quiz-blank-input" placeholder="Type or speak answer..." style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border); background:rgba(255,255,255,0.05); color:var(--text1); font-size:1rem;">
        <button id="quiz-mic-btn" class="quiz-mic-btn" onclick="startQuizSpeechRecognition()" style="padding:0 20px; border-radius:8px; border:none; background:var(--primary); color:white; font-weight:600; cursor:pointer;">🎤 Speak</button>
      </div>
      <button id="quiz-submit-btn" class="quiz-submit-btn" onclick="submitBlankAnswer('${q.correct_answer.replace(/'/g,"\\'")}')" style="width:100%; padding:14px; border-radius:8px; border:none; background:var(--secondary); color:white; font-weight:700; cursor:pointer; font-size:1rem; margin-top:10px;">${labelSubmit}</button>
    `;
  }

  document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-header">
      <button class="back-btn" onclick="goBackFromLesson()" style="margin:0">${labelBack}</button>
      <span class="quiz-progress-text">Question ${current+1} of ${questions.length}</span>
      <span style="color:var(--accent);font-weight:700">⚡ ${score*10} pts</span>
    </div>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
    
    <div class="quiz-question-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div class="quiz-q-num">Q${current+1}</div>
        <button id="btn-read-quiz" class="vocab-listen-btn" onclick="readQuizQuestionAloud()" title="Read Question Aloud">🔊 Listen</button>
      </div>
      <div class="quiz-q-text">${qText}</div>
    </div>
    
    ${optionsHtml}
    
    <div id="quiz-explanation" style="display:none" class="quiz-explanation">
      <div class="explanation-label">💡 EXPLANATION</div>
      <div id="quiz-exp-text" class="explanation-text"></div>
    </div>
    <div id="quiz-offline-hint" style="display:none" class="quiz-offline-hint"></div>
    <button id="quiz-next-btn" class="quiz-next-btn" style="display:none" onclick="nextQuestion()">
      ${current+1 < questions.length ? labelNext : labelResults}
    </button>
  `;
}

function selectAnswer(selected, correct, explanation) {
  if (quizState.answered) return;
  quizState.answered = true;
  const isCorrect = selected === correct;
  if (isCorrect) quizState.score++;
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.classList.add('disabled');
    const key = btn.dataset.key;
    if (key === correct) btn.classList.add('selected-correct');
    else if (key === selected && !isCorrect) btn.classList.add('selected-wrong');
  });
  if (explanation) {
    const expEl = document.getElementById('quiz-explanation');
    document.getElementById('quiz-exp-text').textContent = explanation;
    expEl.style.display = 'block';
  }
  if (!isCorrect) {
    displayOfflineHint();
  }
  document.getElementById('quiz-next-btn').style.display = 'block';
  if (isCorrect) showToast('✅ Correct! +10 points');
  else showToast('❌ Wrong! The correct answer is ' + correct);
}

function nextQuestion() {
  quizState.current++;
  quizState.answered = false;
  renderQuestion();
}

async function renderResult() {
  const { score, questions, lessonId, xpReward } = quizState;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  let emoji, title;
  if (percentage >= 90) { emoji='🏆'; title=t('excellent'); }
  else if (percentage >= 70) { emoji='🎉'; title=t('great'); }
  else if (percentage >= 50) { emoji='💪'; title=t('goodJob'); }
  else { emoji='📚'; title=t('keepTrying'); }

  const isOfflineMode = !navigator.onLine || quizState.isOffline;
  if (isOfflineMode) {
    try {
      await saveOfflineProgress(lessonId, score, total);
      const xpEarnedVal = percentage >= 70 ? xpReward : Math.round(xpReward * 0.3);
      document.getElementById('quiz-container').innerHTML = `
        <div class="quiz-result">
          <div class="result-emoji">${emoji}</div>
          <div class="result-title">${title} (Offline / ऑफ़लाइन)</div>
          <div class="result-score">${score} / ${total} correct (${percentage}%)</div>
          <div class="result-xp">+${xpEarnedVal} XP pending sync ⚡</div>
          <p style="color:var(--text3); font-size:0.8rem; margin:10px 0; line-height: 1.4;">Your score has been saved locally and will be synced when you go back online! / आपका स्कोर सुरक्षित कर लिया गया है।</p>
          <div class="result-actions">
            <button class="btn-primary" onclick="goBackFromLesson()">Back to Lesson 📖</button>
            <button class="btn-secondary" onclick="startQuiz(${lessonId})">Try Again 🔄</button>
            <button class="btn-secondary" onclick="showScreen('home')">Go Home 🏠</button>
          </div>
        </div>
      `;
    } catch(err) {
      console.error("Error saving offline progress:", err);
      document.getElementById('quiz-container').innerHTML = `<div class="quiz-result"><div class="result-emoji">${emoji}</div><div class="result-title">${title}</div><div class="result-score">${score} / ${total} correct</div><div class="result-actions"><button class="btn-primary" onclick="goBackFromLesson()">Back</button></div></div>`;
    }
    return;
  }

  try {
    const result = await api('/api/quiz/submit','POST',{ lesson_id:lessonId, score, total });
    if (currentUser) { currentUser.xp = result.totalXP; currentUser.level = Math.floor(result.totalXP/200)+1; updateNavStats(); }
    document.getElementById('quiz-container').innerHTML = `
      <div class="quiz-result">
        <div class="result-emoji">${emoji}</div>
        <div class="result-title">${title}</div>
        <div class="result-score">${score} / ${total} correct (${percentage}%)</div>
        <div class="result-xp">+${result.xpEarned} XP earned! ⚡</div>
        <div class="result-actions">
          <button class="btn-primary" onclick="goBackFromLesson()">Back to Lesson 📖</button>
          <button class="btn-secondary" onclick="startQuiz(${lessonId})">Try Again 🔄</button>
          <button class="btn-secondary" onclick="showScreen('subjects')">More Subjects 📚</button>
        </div>
      </div>
    `;
    if (result.newBadges?.length) {
      setTimeout(() => showBadgeModal(result.newBadges[0]), 800);
    }
  } catch(e) {
    document.getElementById('quiz-container').innerHTML = `<div class="quiz-result"><div class="result-emoji">${emoji}</div><div class="result-title">${title}</div><div class="result-score">${score} / ${total} correct</div><div class="result-actions"><button class="btn-primary" onclick="goBackFromLesson()">Back</button></div></div>`;
  }
}

// ===== LEADERBOARD =====
async function loadLeaderboard() {
  try {
    const leaders = await api('/api/leaderboard');
    const rankEmoji = ['🥇','🥈','🥉'];
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = leaders.map((l, i) => `
      <div class="leader-card ${i<3?'top-'+(i+1):''}">
        <div class="leader-rank">${rankEmoji[i] || (i+1)}</div>
        <div class="leader-avatar">${l.avatar || '🧑‍🎓'}</div>
        <div class="leader-info">
          <div class="leader-name">${l.name} ${l.role === 'teacher' ? '<span class="leader-role-tag teacher-tag">Teacher</span>' : ''}</div>
          <div class="leader-grade">${l.role === 'teacher' ? 'Teacher' : 'Grade ' + l.grade} · ${l.badges_count} 🎖️</div>
        </div>
        <div class="leader-stats">
          <div class="leader-xp">${l.total_xp} XP</div>
          <div class="leader-lessons">${l.lessons_completed} lessons</div>
        </div>
      </div>
    `).join('');
    if (!leaders.length) list.innerHTML = '<p style="text-align:center;color:var(--text3);padding:20px;">No leaders yet. Be the first! 🚀</p>';
  } catch(e) { console.error(e); }
}

// ===== BADGES =====
async function loadBadges() {
  try {
    const badges = await api('/api/badges');
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = badges.map(b => `
      <div class="badge-card ${b.earned?'earned':'locked'}">
        <span class="badge-icon">${b.icon}</span>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.description}</div>
        <div class="badge-req">${b.requirement}</div>
        ${b.earned ? '<span class="badge-earned-tag">✓ Earned</span>' : ''}
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

// ===== PROFILE =====
async function loadProfile() {
  try {
    const profile = await api('/api/profile');
    currentUser = { ...currentUser, ...profile };
    updateNavStats();
    const level = Math.floor((profile.xp || 0) / 200) + 1;
    const isTeacher = profile.role === 'teacher';
    const roleLabel = isTeacher ? '👩‍🏫 Teacher' : '🧑‍🎓 Student';
    const roleClass = isTeacher ? 'teacher' : 'student';

    document.getElementById('profile-content').innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar">${profile.avatar || '🧑‍🎓'}</div>
        <div class="profile-name">${profile.name}</div>
        <div class="profile-role-badge ${roleClass}">${roleLabel}</div>
        <div class="profile-email">${profile.email}</div>
        ${isTeacher
          ? `<div class="profile-grade">${profile.department} · ${profile.subject_specialization}</div>`
          : `<div class="profile-grade">Grade ${profile.grade} · ${profile.school || ''}</div>`
        }
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-val" style="color:var(--accent)">${profile.xp || 0}</div>
            <div class="profile-stat-label">Total XP</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-val" style="color:var(--secondary)">${profile.lessonsCompleted || 0}</div>
            <div class="profile-stat-label">Lessons</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-val" style="color:var(--purple)">${profile.badges?.length || 0}</div>
            <div class="profile-stat-label">Badges</div>
          </div>
        </div>
      </div>
      ${profile.badges?.length ? `
      <div class="profile-section">
        <h3>🎖️ Badges Earned</h3>
        <div class="profile-badges-mini">
          ${profile.badges.map(b => `<div class="badge-mini" title="${b.name}">${b.icon}</div>`).join('')}
        </div>
      </div>` : ''}
      ${profile.kingdom_data ? `
      <div class="profile-section" style="background:rgba(99,102,241,0.08);border:1.5px solid rgba(99,102,241,0.25);border-radius:16px;padding:1rem;">
        <h3 style="margin-top:0;color:#818cf8;display:flex;align-items:center;gap:6px;">🏰 My Math Kingdom</h3>
        <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;justify-content:center;">
          <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:4px;background:rgba(0,0,0,0.2);padding:6px;border-radius:8px;width:130px;min-height:70px;">
            ${(() => {
              let parsed = {};
              try { parsed = JSON.parse(profile.kingdom_data); } catch(e) {}
              const towers = parseInt(parsed.towers) || 0;
              const houses = parseInt(parsed.houses) || 0;
              const land = parseInt(parsed.land) || 0;
              
              const items = [];
              for(let i=0; i<towers; i++) items.push('🏰');
              for(let i=0; i<houses; i++) items.push('🏠');
              for(let i=0; i<Math.floor(land/5); i++) items.push('🌳');
              while(items.length < 15) items.push('⬜');
              return items.slice(0, 15).map(item => `<div style="font-size:0.9rem;text-align:center;">${item}</div>`).join('');
            })()}
          </div>
          <div style="font-size:0.8rem;color:var(--text2);flex:1;min-width:110px;">
            ${(() => {
              let parsed = {};
              try { parsed = JSON.parse(profile.kingdom_data); } catch(e) {}
              const towers = parseInt(parsed.towers) || 0;
              const houses = parseInt(parsed.houses) || 0;
              const land = parseInt(parsed.land) || 0;
              const gold = parseInt(parsed.gold) || 0;
              const size = (towers * 3) + (houses * 2) + land;
              return `
                <div>🏰 Towers: <strong>${towers}</strong></div>
                <div>🏠 Houses: <strong>${houses}</strong></div>
                <div>🌳 Land Size: <strong>${land}</strong></div>
                <div>🪙 Treasury: <strong>${gold} Gold</strong></div>
                <div style="margin-top:4px;font-size:0.85rem;color:#818cf8;font-weight:bold;">🏆 Kingdom Rating: ${size}</div>
              `;
            })()}
          </div>
        </div>
      </div>` : ''}
      <div class="profile-section">
        <h3>📊 Stats</h3>
        <div style="color:var(--text2);font-size:0.88rem;line-height:1.8;">
          <div>🔥 Login Streak: <strong>${profile.streak || 0} days</strong></div>
          <div>🏅 Current Level: <strong>Level ${level}</strong></div>
          <div>🎢 Role: <strong>${isTeacher ? 'Teacher' : 'Student'}</strong></div>
          ${isTeacher
            ? `<div>🏗️ Department: <strong>${profile.department}</strong></div>
               <div>🎯 Specialization: <strong>${profile.subject_specialization}</strong></div>`
            : `<div>🏢 School: <strong>${profile.school || 'Not set'}</strong></div>
               <div>📚 Grade: <strong>Grade ${profile.grade}</strong></div>
               <div>🔑 Escape Room: <strong>${profile.escape_room_time && profile.escape_room_time < 9999 ? profile.escape_room_time + 's (Best)' : 'No escape yet'}</strong></div>`
          }
          <div>🌐 Language: <strong>${{en:'English',hi:'हिंदी',mr:'मराठी',or:'ଓଡ଼ିଆ'}[profile.language]||'English'}</strong></div>
          <div>📅 Joined: <strong>${new Date(profile.created_at).toLocaleDateString()}</strong></div>
        </div>
      </div>
      ${!isTeacher ? `
      <div class="profile-section">
        <button class="btn-primary" style="width:100%;" onclick="showScreen('my-focus');loadMyFocusHistory();">
          🧠 View My Focus History
        </button>
      </div>` : ''}
      <button class="logout-btn" onclick="logout()">🚩 Logout</button>
    `;
  } catch(e) { console.error(e); }
}

// ===== STUDENT FOCUS HISTORY =====
async function loadMyFocusHistory() {
  const listEl = document.getElementById('mf-lessons-list');
  const fmtTime = (s) => {
    const m = Math.floor(s/60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };
  try {
    const data = await api('/api/focus/my-history');
    const { lessons, totals } = data;

    // Fill overall stats
    document.getElementById('mf-total-focus').textContent  = fmtTime(totals.total_focus);
    document.getElementById('mf-total-events').textContent = totals.total_events;
    document.getElementById('mf-best-streak').textContent  = fmtTime(totals.best_streak);
    document.getElementById('mf-total-xp').textContent     = `+${totals.total_xp} XP`;

    if (!lessons.length) {
      listEl.innerHTML = '<div class="empty-state">💭 No focus data yet. Start a lesson with Smart Focus enabled!</div>';
      return;
    }

    listEl.innerHTML = lessons.map(l => {
      const eff = l.efficiency;
      const effColor = eff >= 75 ? '#22c55e' : eff >= 50 ? '#f59e0b' : '#ef4444';
      const effLabel = eff >= 75 ? '🟢' : eff >= 50 ? '🟡' : '🔴';
      const focusMin = Math.round(l.focus_seconds / 60 * 10) / 10;
      const distMin  = Math.round(l.distracted_seconds / 60 * 10) / 10;
      const streakMin = Math.floor(l.longest_focus_streak / 60);
      const streakSec = l.longest_focus_streak % 60;
      const date = l.updated_at ? new Date(l.updated_at).toLocaleDateString() : '';

      return `
        <div class="mf-lesson-card" style="border-left-color:${l.subject_color}">
          <div class="mf-lesson-header">
            <span class="mf-lesson-icon">${l.subject_icon}</span>
            <div style="flex:1">
              <div class="mf-lesson-title">${l.lesson_title}</div>
              <div class="mf-lesson-subject" style="color:${l.subject_color}">${l.subject_name} · ${date}</div>
            </div>
            <span class="mf-eff-badge" style="color:${effColor};border-color:${effColor}22;background:${effColor}11">
              ${effLabel} ${eff}%
            </span>
          </div>
          <div class="mf-lesson-stats">
            <span>⏱️ Focus: ${focusMin}m</span>
            <span>👀 Distractions: ${l.distraction_events}</span>
            <span>🏆 Best Streak: ${streakMin}m ${streakSec}s</span>
            <span>⚡ +${l.focus_xp_awarded} XP</span>
          </div>
          <div class="mf-bar-track">
            <div class="mf-bar-focus" style="width:${eff}%;background:${effColor};"></div>
          </div>
        </div>`;
    }).join('');
  } catch(e) {
    console.error('loadMyFocusHistory error:', e);
    listEl.innerHTML = '<div class="empty-state">⚠️ Could not load focus history.</div>';
  }
}

// ===== BADGE MODAL =====
function showBadgeModal(badge) {
  document.getElementById('badge-modal-icon').textContent = badge.icon;
  document.getElementById('badge-modal-name').textContent = badge.name;
  document.getElementById('badge-modal-desc').textContent = badge.description;
  document.getElementById('badge-modal').classList.remove('hidden');
}
function closeBadgeModal() { document.getElementById('badge-modal').classList.add('hidden'); }

// ===== TOAST =====
function showToast(msg, duration=2000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), duration);
}

// ===== LOGOUT =====
function logout() {
  currentToken = null; currentUser = null;
  localStorage.removeItem('vq_token');
  document.getElementById('main-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('login-email').value='';
  document.getElementById('login-password').value='';
}

// ===================================================
// ============ TEACHER DASHBOARD FUNCTIONS ==========
// ===================================================

async function loadTeacherHome() {
  if (!currentUser || currentUser.role !== 'teacher') return;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  document.getElementById('teacher-greeting').textContent = `${greet}, ${currentUser.name.split(' ')[0]}! 👩‍🏫`;

  try {
    const [dash, myLessons] = await Promise.all([
      api('/api/teacher/dashboard'),
      api('/api/teacher/lessons')
    ]);

    // Stat Cards
    document.getElementById('t-total-students').textContent = dash.totalStudents;
    document.getElementById('t-avg-score').textContent = dash.classAvgScore ? dash.classAvgScore + '%' : 'N/A';
    document.getElementById('t-at-risk-count').textContent = dash.atRiskStudents.length;
    document.getElementById('t-my-lessons').textContent = myLessons.length;

    // Subject Engagement
    const subEl = document.getElementById('t-subject-stats');
    if (dash.subjectStats.length) {
      subEl.innerHTML = dash.subjectStats.map(s => `
        <div class="dash-list-item" style="border-left-color:${s.color}">
          <div class="dash-list-icon">${s.icon}</div>
          <div class="dash-list-info">
            <div class="dash-list-title">${s.name}</div>
            <div class="dash-list-meta">${s.students} student(s) active · Avg score: ${s.avg_score || 0}</div>
          </div>
          <div class="teacher-score-badge" style="background:${s.color}22;color:${s.color}">${s.students} 👤</div>
        </div>
      `).join('');
    } else {
      subEl.innerHTML = '<div class="empty-state">No subject activity yet.</div>';
    }

    // Most Attempted
    const mostEl = document.getElementById('t-most-attempted');
    if (dash.mostAttempted.length) {
      mostEl.innerHTML = dash.mostAttempted.map((t, i) => `
        <div class="dash-list-item">
          <div class="dash-list-icon">${['🥇','🥈','🥉'][i] || '📖'}</div>
          <div class="dash-list-info">
            <div class="dash-list-title">${t.title}</div>
            <div class="dash-list-meta">${t.icon} ${t.subject}</div>
          </div>
          <div class="attempt-badge hot">${t.attempts} attempts</div>
        </div>
      `).join('');
    } else {
      mostEl.innerHTML = '<div class="empty-state">No activity data yet.</div>';
    }

    // Least Attempted
    const leastEl = document.getElementById('t-least-attempted');
    if (dash.leastAttempted.length) {
      leastEl.innerHTML = dash.leastAttempted.map(t => `
        <div class="dash-list-item">
          <div class="dash-list-icon">💤</div>
          <div class="dash-list-info">
            <div class="dash-list-title">${t.title}</div>
            <div class="dash-list-meta">${t.icon} ${t.subject}</div>
          </div>
          <div class="attempt-badge cold">${t.attempts} attempts</div>
        </div>
      `).join('');
    } else {
      leastEl.innerHTML = '<div class="empty-state">All topics have been tried!</div>';
    }

    // At-Risk Students
    const riskEl = document.getElementById('t-at-risk');
    if (dash.atRiskStudents.length) {
      riskEl.innerHTML = dash.atRiskStudents.map(s => `
        <div class="dash-list-item at-risk-item">
          <div class="dash-list-icon">${s.avatar || '🧑‍🎓'}</div>
          <div class="dash-list-info">
            <div class="dash-list-title">${s.name}</div>
            <div class="dash-list-meta">Grade ${s.grade} · ${s.school || 'Unknown School'} · ${s.xp || 0} XP</div>
          </div>
          <div class="risk-tag">⚠️ Inactive</div>
        </div>
      `).join('');
    } else {
      riskEl.innerHTML = '<div class="empty-state" style="color:var(--secondary)">✅ All students are active!</div>';
    }

    // Recent Submissions
    const subFeedEl = document.getElementById('t-recent-submissions');
    if (dash.recentSubmissions.length) {
      subFeedEl.innerHTML = dash.recentSubmissions.map(s => {
        const timeAgo = s.completed_at ? new Date(s.completed_at).toLocaleDateString() : 'recently';
        return `
          <div class="dash-list-item" style="border-left-color:${s.color}">
            <div class="dash-list-icon">${s.avatar || '🧑‍🎓'}</div>
            <div class="dash-list-info">
              <div class="dash-list-title">${s.name}</div>
              <div class="dash-list-meta">${s.icon} ${s.lesson_title} · ${timeAgo}</div>
            </div>
            <div class="score-chip">${s.score} pts</div>
          </div>
        `;
      }).join('');
    } else {
      subFeedEl.innerHTML = '<div class="empty-state">No quiz submissions yet.</div>';
    }

    // Student Focus Metrics — Enhanced
    const focusEl = document.getElementById('t-focus-metrics');
    if (focusEl) {
      if (dash.studentFocusMetrics && dash.studentFocusMetrics.length) {
        focusEl.innerHTML = dash.studentFocusMetrics.map(s => {
          const focusMin        = Math.round(s.total_focus / 60);
          const distractedMin   = Math.round(s.total_distracted / 60);
          const efficiency      = s.efficiency;
          const bestStreakMin   = Math.floor(s.best_streak / 60);
          const bestStreakSec   = s.best_streak % 60;
          const isAtRisk        = efficiency < 50 || s.total_distraction_events >= 10;
          const effColor        = efficiency >= 75 ? '#22c55e' : efficiency >= 50 ? '#f59e0b' : '#ef4444';

          return `
            <div class="t-focus-item${isAtRisk ? ' t-focus-at-risk' : ''}">
              <div class="t-focus-header">
                <span class="t-focus-avatar">${s.avatar || '🧑‍🎓'}</span>
                <div style="flex:1">
                  <div class="t-focus-name">${s.name} ${isAtRisk ? '<span class="t-risk-flag">🚨 Attention Needed</span>' : ''}</div>
                  <div class="t-focus-sub">Grade ${s.grade || '6'} · ${s.school || 'Unknown School'}</div>
                </div>
                <span class="t-focus-score-meta" style="color:${effColor}">${efficiency}% Efficiency</span>
              </div>
              <div class="t-focus-bars-wrap">
                <div class="t-focus-bar-label">
                  <span>⏱️ Focus: ${focusMin}m</span>
                  <span>👀 Distractions: ${s.total_distraction_events}</span>
                  <span>🏆 Best Streak: ${bestStreakMin}m ${bestStreakSec}s</span>
                </div>
                <div class="sf-efficiency-track" title="Focus efficiency: ${efficiency}%">
                  <div class="sf-efficiency-fill" style="width: ${efficiency}%; background: ${effColor};"></div>
                </div>
              </div>
              <button class="t-view-detail-btn" onclick="showStudentFocusDetail(${s.id}, '${s.name}', '${s.avatar || '🧑‍🎓'}')"
                style="margin-top:0.5rem;width:100%;background:transparent;border:1px solid var(--border);color:var(--text-muted);border-radius:8px;padding:0.4rem;font-family:'Nunito',sans-serif;cursor:pointer;font-size:0.8rem;">
                📊 View Lesson Breakdown
              </button>
            </div>
          `;
        }).join('');
      } else {
        focusEl.innerHTML = '<div class="empty-state">No focus data recorded yet.</div>';
      }

      // Focus Risk Summary Banner
      if (dash.focusRiskStudents && dash.focusRiskStudents.length) {
        const riskBanner = document.createElement('div');
        riskBanner.className = 't-focus-risk-banner';
        riskBanner.innerHTML = `
          <span>🚨 <strong>${dash.focusRiskStudents.length} student${dash.focusRiskStudents.length > 1 ? 's' : ''}</strong> need attention: ${dash.focusRiskStudents.map(s => s.name.split(' ')[0]).join(', ')}</span>`;
        focusEl.insertAdjacentElement('beforebegin', riskBanner);
      }
    }

    // Load collaborative group challenges stats
    await loadTeacherChallenges();

  } catch(e) {
    console.error('Teacher dashboard error:', e);
    showToast('⚠️ Could not load dashboard data');
  }
}

// ===== TEACHER: Student Focus Detail Modal =====
async function showStudentFocusDetail(studentId, name, avatar) {
  const fmtTime = (s) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };
  // Create or reuse modal
  let modal = document.getElementById('t-student-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 't-student-detail-modal';
    modal.className = 'sf-modal';
    modal.style.zIndex = '2500';
    modal.innerHTML = `<div class="sf-modal-box t-detail-box" style="max-width:640px;width:95%;max-height:85vh;overflow-y:auto;"><div id="t-detail-content"></div></div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.getElementById('t-detail-content').innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">Loading...</div>';

  try {
    const data = await api(`/api/teacher/student/${studentId}/focus`);
    const { totals, lessons } = data;
    const eff = totals.total_focus + totals.total_distracted > 0
      ? Math.round(totals.total_focus / (totals.total_focus + totals.total_distracted) * 100)
      : 100;
    const effColor = eff >= 75 ? '#22c55e' : eff >= 50 ? '#f59e0b' : '#ef4444';

    document.getElementById('t-detail-content').innerHTML = `
      <div style="font-family:'Baloo 2',sans-serif;">
        <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem;">
          <span style="font-size:2rem;">${avatar}</span>
          <div style="flex:1">
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">${name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">Focus Analytics — All Sessions</div>
          </div>
          <button onclick="document.getElementById('t-student-detail-modal').style.display='none'"
            style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;">✕</button>
        </div>

        <!-- Overview Stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:1rem;">
          <div class="mf-stat-card" style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:800;color:#22c55e;">${fmtTime(totals.total_focus)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Total Focus</div>
          </div>
          <div class="mf-stat-card" style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:800;color:#ef4444;">${totals.total_events}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Distractions</div>
          </div>
          <div class="mf-stat-card" style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:800;color:#a855f7;">${fmtTime(totals.best_streak)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Best Streak</div>
          </div>
          <div class="mf-stat-card" style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:800;color:${effColor};">${eff}%</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Efficiency</div>
          </div>
        </div>

        <!-- Per-lesson table -->
        <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;">📚 PER-LESSON BREAKDOWN</div>
        ${lessons.length === 0 ? '<div class="empty-state">No lesson focus data yet.</div>' : `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
            <thead>
              <tr style="color:var(--text-muted);text-align:left;border-bottom:1px solid var(--border);">
                <th style="padding:0.4rem 0.6rem;">Lesson</th>
                <th style="padding:0.4rem;">Focus</th>
                <th style="padding:0.4rem;">👀</th>
                <th style="padding:0.4rem;">Streak</th>
                <th style="padding:0.4rem;">Eff%</th>
              </tr>
            </thead>
            <tbody>
              ${lessons.map(l => {
                const lEff = l.efficiency;
                const lColor = lEff >= 75 ? '#22c55e' : lEff >= 50 ? '#f59e0b' : '#ef4444';
                return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:0.4rem 0.6rem;">${l.subject_icon} ${l.lesson_title}</td>
                  <td style="padding:0.4rem;color:#22c55e;">${Math.round(l.focus_seconds/60)}m</td>
                  <td style="padding:0.4rem;color:#ef4444;">${l.distraction_events}</td>
                  <td style="padding:0.4rem;color:#a855f7;">${Math.floor(l.longest_focus_streak/60)}m ${l.longest_focus_streak%60}s</td>
                  <td style="padding:0.4rem;font-weight:700;color:${lColor};">${lEff}%</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`}
      </div>`;
  } catch(e) {
    document.getElementById('t-detail-content').innerHTML = '<div class="empty-state">⚠️ Could not load student focus data.</div>';
  }
}

// ===== CREATE LESSON FORM =====
let questionCount = 0;

async function loadCreateLessonForm() {
  // Load subjects into dropdown
  try {
    const subjects = await api('/api/subjects');
    const sel = document.getElementById('cl-subject');
    sel.innerHTML = '<option value="">Select subject...</option>' +
      subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('');
  } catch(e) { console.error(e); }

  // Reset form
  document.getElementById('cl-title').value = '';
  document.getElementById('cl-intro').value = '';
  document.getElementById('cl-concepts').value = '';
  document.getElementById('cl-example').value = '';
  document.getElementById('cl-funfact').value = '';
  document.getElementById('cl-xp').value = '100';
  document.getElementById('questions-container').innerHTML = '';
  document.getElementById('create-lesson-error').classList.add('hidden');
  questionCount = 0;

  // Add 2 default question slots
  addQuestionField();
  addQuestionField();
}

function addQuestionField() {
  questionCount++;
  const qNum = questionCount;
  const container = document.getElementById('questions-container');
  const div = document.createElement('div');
  div.className = 'question-block';
  div.id = `q-block-${qNum}`;
  div.innerHTML = `
    <div class="q-block-header">
      <span class="q-block-num">Q${qNum}</span>
      <button class="btn-remove-q" onclick="removeQuestion(${qNum})">✕ Remove</button>
    </div>
    <div class="form-group">
      <label class="form-label">Question Text *</label>
      <input type="text" id="q${qNum}-question" class="form-control" placeholder="e.g. What is 2 + 2?">
    </div>
    <div class="form-grid q-options-grid">
      <div class="form-group">
        <label class="form-label">Option A *</label>
        <input type="text" id="q${qNum}-a" class="form-control" placeholder="Option A">
      </div>
      <div class="form-group">
        <label class="form-label">Option B</label>
        <input type="text" id="q${qNum}-b" class="form-control" placeholder="Option B">
      </div>
      <div class="form-group">
        <label class="form-label">Option C</label>
        <input type="text" id="q${qNum}-c" class="form-control" placeholder="Option C">
      </div>
      <div class="form-group">
        <label class="form-label">Option D</label>
        <input type="text" id="q${qNum}-d" class="form-control" placeholder="Option D">
      </div>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Correct Answer *</label>
        <select id="q${qNum}-correct" class="form-control">
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Explanation</label>
        <input type="text" id="q${qNum}-exp" class="form-control" placeholder="Why is this the correct answer?">
      </div>
    </div>
  `;
  container.appendChild(div);
}

function removeQuestion(num) {
  const el = document.getElementById(`q-block-${num}`);
  if (el) el.remove();
}

async function handleCreateLesson() {
  const subject_id = document.getElementById('cl-subject').value;
  const title = document.getElementById('cl-title').value.trim();
  const intro = document.getElementById('cl-intro').value.trim();
  const conceptsRaw = document.getElementById('cl-concepts').value.trim();
  const example = document.getElementById('cl-example').value.trim();
  const fun_fact = document.getElementById('cl-funfact').value.trim();
  const difficulty = document.getElementById('cl-difficulty').value;
  const xp_reward = parseInt(document.getElementById('cl-xp').value) || 100;
  const grade = parseInt(document.getElementById('cl-grade').value) || 7;
  const errEl = document.getElementById('create-lesson-error');

  if (!subject_id) { showCreateError('Please select a subject.'); return; }
  if (!title) { showCreateError('Please enter a lesson title.'); return; }
  if (!intro) { showCreateError('Please write an introduction for the lesson.'); return; }

  const concepts = conceptsRaw ? conceptsRaw.split('\n').map(c => c.trim()).filter(Boolean) : [];

  const content = JSON.stringify({ intro, concepts, example, fun_fact });

  // Collect questions
  const questions = [];
  const qBlocks = document.querySelectorAll('.question-block');
  for (const block of qBlocks) {
    const id = block.id.replace('q-block-', '');
    const question = document.getElementById(`q${id}-question`)?.value.trim();
    const option_a = document.getElementById(`q${id}-a`)?.value.trim();
    const option_b = document.getElementById(`q${id}-b`)?.value.trim();
    const option_c = document.getElementById(`q${id}-c`)?.value.trim();
    const option_d = document.getElementById(`q${id}-d`)?.value.trim();
    const correct_answer = document.getElementById(`q${id}-correct`)?.value;
    const explanation = document.getElementById(`q${id}-exp`)?.value.trim();
    if (question && option_a) {
      questions.push({ question, option_a, option_b, option_c, option_d, correct_answer, explanation });
    }
  }

  const btn = document.querySelector('#screen-create-lesson .btn-primary');
  btn.textContent = '⏳ Publishing...';
  btn.disabled = true;

  try {
    await api('/api/teacher/lessons', 'POST', {
      subject_id: parseInt(subject_id), title, content, difficulty, xp_reward, grade, questions
    });
    btn.textContent = '🚀 Publish Lesson';
    btn.disabled = false;
    showToast('✅ Lesson published successfully!', 3000);
    showScreen('my-content');
  } catch(e) {
    btn.textContent = '🚀 Publish Lesson';
    btn.disabled = false;
    showCreateError(e.message);
  }
}

function showCreateError(msg) {
  const el = document.getElementById('create-lesson-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

// ===== MY CONTENT =====
async function loadMyContent() {
  const container = document.getElementById('my-content-list');
  container.innerHTML = '<div class="empty-state">Loading your lessons...</div>';
  try {
    const lessons = await api('/api/teacher/lessons');
    if (!lessons.length) {
      container.innerHTML = `
        <div class="empty-state" style="padding:40px 0">
          <div style="font-size:3rem;margin-bottom:12px">📭</div>
          <div style="color:var(--text2);margin-bottom:16px">You haven't created any lessons yet.</div>
          <button class="btn-primary" style="width:auto;padding:12px 24px" onclick="showScreen('create-lesson')">
            ✏️ Create Your First Lesson
          </button>
        </div>`;
      return;
    }
    container.innerHTML = lessons.map(l => `
      <div class="my-content-card">
        <div class="dash-list-icon">${l.icon}</div>
        <div class="dash-list-info">
          <div class="dash-list-title">${l.title}</div>
          <div class="dash-list-meta">
            ${l.subject_name} · Grade ${l.grade || '–'} · ${l.difficulty}
            · ⚡ ${l.xp_reward} XP · ❓ ${l.question_count} questions
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn-sm" style="background:rgba(123,104,238,0.15);color:var(--purple)"
            onclick="previewLesson(${l.id})">👁 Preview</button>
          <button class="btn-sm" style="background:rgba(255,80,80,0.1);color:#FF8080"
            onclick="deleteLesson(${l.id}, this)">🗑 Delete</button>
        </div>
      </div>
    `).join('');
  } catch(e) {
    container.innerHTML = '<div class="empty-state">Failed to load lessons. Please try again.</div>';
  }
}

function previewLesson(id) {
  // Switch to student-style lesson view
  openLesson(id);
}

async function deleteLesson(id, btn) {
  if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
  btn.textContent = '⏳';
  btn.disabled = true;
  try {
    await api(`/api/teacher/lessons/${id}`, 'DELETE');
    showToast('🗑 Lesson deleted.', 2500);
    loadMyContent();
  } catch(e) {
    showToast('❌ Failed to delete: ' + e.message);
    btn.textContent = '🗑 Delete';
    btn.disabled = false;
  }
}

// ===== AI SMART TUTOR CHAT =====
let isChatOpen = false;

function toggleChat() {
  const chatWindow = document.getElementById('ai-chat-window');
  const fab = document.getElementById('ai-tutor-fab');
  isChatOpen = !isChatOpen;
  
  if (isChatOpen) {
    chatWindow.classList.remove('hidden');
    fab.classList.add('hidden');
    setTimeout(() => document.getElementById('chat-input').focus(), 100);
  } else {
    chatWindow.classList.add('hidden');
    if (currentUser?.role === 'student') fab.classList.remove('hidden');
  }
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function appendChatMessage(text, sender) {
  const messagesDiv = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}-message`;
  
  // Very basic markdown handling for bold and newlines
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  msgDiv.innerHTML = formattedText;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTypingIndicator() {
  const messagesDiv = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message ai-message typing-indicator-msg';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) typingDiv.remove();
}

async function sendChatMessage() {
  const inputEl = document.getElementById('chat-input');
  const message = inputEl.value.trim();
  if (!message) return;

  // Append user message
  appendChatMessage(message, 'user');
  inputEl.value = '';
  inputEl.disabled = true;

  // Show typing
  showTypingIndicator();

  try {
    const res = await api('/api/chat', 'POST', { 
      message, 
      language: currentLanguage || 'en' 
    });
    removeTypingIndicator();
    appendChatMessage(res.reply, 'ai');
  } catch (error) {
    removeTypingIndicator();
    appendChatMessage('⚠️ ' + (error.message || 'Sorry, I am offline right now.'), 'error');
  } finally {
    inputEl.disabled = false;
    inputEl.focus();
  }
}

// ===== VOICE-BASED LEARNING UTILITIES =====

const langVoiceMap = {
  en: ['en-IN', 'en-US', 'en-GB'],
  hi: ['hi-IN', 'hi-GB'],
  mr: ['mr-IN'],
  te: ['te-IN', 'en-IN']
};

const vocabWords = {
  'Introduction to Algebra': ['Variable', 'Equation', 'Algebra', 'Constant'],
  'Linear Equations': ['Equation', 'Linear', 'Variable', 'Solution'],
  'Geometry Basics': ['Geometry', 'Angle', 'Triangle', 'Degree'],
  'Fractions and Decimals': ['Fraction', 'Decimal', 'Numerator', 'Denominator'],
  'Basic Statistics': ['Mean', 'Median', 'Mode', 'Statistics'],
  "Newton's Laws of Motion": ['Inertia', 'Acceleration', 'Gravity', 'Reaction', 'Force'],
  'Photosynthesis': ['Chlorophyll', 'Photosynthesis', 'Glucose', 'Oxygen'],
  'Electricity Basics': ['Voltage', 'Resistance', 'Electricity', 'Current'],
  'The Solar System': ['Orbit', 'Gravity', 'Planet', 'Jupiter'],
  'Human Digestive System': ['Digestion', 'Intestine', 'Nutrient', 'Stomach'],
  'Introduction to Coding': ['Algorithm', 'Function', 'Variable', 'Loop'],
  'Internet & Networks': ['Network', 'Router', 'Internet', 'Packet'],
  'Cybersecurity Basics': ['Encryption', 'Phishing', 'Password', 'Security'],
  'Artificial Intelligence': ['Intelligence', 'Machine', 'Neural', 'Model'],
  'Design Thinking': ['Prototype', 'Empathize', 'Ideate', 'Design'],
  'Simple Machines': ['Pulley', 'Lever', 'Wedge', 'Mechanical'],
  'Bridge Structures': ['Suspension', 'Arch', 'Tension', 'Structure']
};

let currentUtterance = null;
let isSpeaking = false;
let recognition = null;
let isListening = false;

function speakText(text, lang = currentLanguage) {
  stopSpeaking();
  
  if (!window.speechSynthesis) {
    showToast("⚠️ Web Speech API is not supported in this browser.");
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const targetLanguages = langVoiceMap[lang] || ['en-US'];
  
  let selectedVoice = null;
  for (const targetLang of targetLanguages) {
    selectedVoice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
    if (selectedVoice) break;
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    const langPrefix = lang.split('-')[0].toLowerCase();
    const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) utterance.voice = prefixMatch;
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  utterance.onstart = () => {
    isSpeaking = true;
    updateSpeechUIState(true);
  };
  
  utterance.onend = () => {
    isSpeaking = false;
    updateSpeechUIState(false);
  };
  
  utterance.onerror = () => {
    isSpeaking = false;
    updateSpeechUIState(false);
  };
  
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  updateSpeechUIState(false);
}

function updateSpeechUIState(speaking) {
  const readLessonBtn = document.getElementById('btn-read-lesson');
  if (readLessonBtn) {
    if (speaking) {
      readLessonBtn.innerHTML = `🛑 Stop Reading`;
      readLessonBtn.classList.add('btn-speech-active');
    } else {
      let readText = '🔊 Read Aloud';
      if (currentLanguage === 'hi') readText = '🔊 पाठ सुनें';
      else if (currentLanguage === 'mr') readText = '🔊 धडा वाचा';
      else if (currentLanguage === 'te') readText = '🔊 ପାଠ ପଢନ୍ତୁ';
      readLessonBtn.innerHTML = readText;
      readLessonBtn.classList.remove('btn-speech-active');
    }
  }
  
  const readQuizBtn = document.getElementById('btn-read-quiz');
  if (readQuizBtn) {
    if (speaking) {
      readQuizBtn.innerHTML = `🛑 Stop`;
      readQuizBtn.classList.add('btn-speech-active');
    } else {
      readQuizBtn.innerHTML = `🔊 Listen`;
      readQuizBtn.classList.remove('btn-speech-active');
    }
  }
}

function readLessonAloud() {
  if (isSpeaking) {
    stopSpeaking();
    return;
  }
  
  const lessonHeroTitle = document.querySelector('.lesson-hero-title')?.innerText || '';
  const introText = document.querySelector('.intro-text')?.innerText || '';
  const concepts = Array.from(document.querySelectorAll('.concept-list li')).map(li => li.innerText);
  const exampleText = document.querySelector('.example-text')?.innerText || '';
  const funfactText = document.querySelector('.funfact-text')?.innerText || '';
  
  let textToRead = "";
  
  if (currentLanguage === 'hi') {
    textToRead = `पाठ का शीर्षक: ${lessonHeroTitle}. `;
    if (introText) textToRead += `परिचय: ${introText}. `;
    if (concepts.length) textToRead += `मुख्य अवधारणाएं: ${concepts.join('. ')}. `;
    if (exampleText) textToRead += `उदाहरण: ${exampleText}. `;
    if (funfactText) textToRead += `रोचक तथ्य: ${funfactText}. `;
  } else if (currentLanguage === 'mr') {
    textToRead = `धड्याचे शीर्षक: ${lessonHeroTitle}. `;
    if (introText) textToRead += `परिचय: ${introText}. `;
    if (concepts.length) textToRead += `महत्त्वाच्या संकल्पना: ${concepts.join('. ')}. `;
    if (exampleText) textToRead += `उदाहरण: ${exampleText}. `;
    if (funfactText) textToRead += `मजेदार तथ्य: ${funfactText}. `;
  } else if (currentLanguage === 'te') {
    textToRead = `ପାଠର ଶୀର୍ଷକ: ${lessonHeroTitle}. `;
    if (introText) textToRead += `ଉପକ୍ରମ: ${introText}. `;
    if (concepts.length) textToRead += `ମୁଖ୍ୟ ବିଷୟବସ୍ତୁ: ${concepts.join('. ')}. `;
    if (exampleText) textToRead += `ଉଦାହରଣ: ${exampleText}. `;
    if (funfactText) textToRead += `ମଜାଦାର ତଥ୍ୟ: ${funfactText}. `;
  } else {
    textToRead = `Lesson Title: ${lessonHeroTitle}. `;
    if (introText) textToRead += `Introduction: ${introText}. `;
    if (concepts.length) textToRead += `Key Concepts: ${concepts.join('. ')}. `;
    if (exampleText) textToRead += `Example: ${exampleText}. `;
    if (funfactText) textToRead += `Fun Fact: ${funfactText}. `;
  }
  
  speakText(textToRead);
}

function readQuizQuestionAloud() {
  if (isSpeaking) {
    stopSpeaking();
    return;
  }

  const { questions, current } = quizState;
  const q = questions[current];
  
  let qText = q.question;
  if (currentLanguage === 'hi' && q.question_hi) {
    qText = q.question_hi;
  } else if (currentLanguage === 'mr' && q.question_mr) {
    qText = q.question_mr;
  } else if (currentLanguage === 'te' && q.question_te) {
    qText = q.question_te;
  }
  
  let textToRead = "";
  const isFillBlank = q.option_b === '' || q.option_b === null || !['A', 'B', 'C', 'D'].includes(q.correct_answer);

  if (isFillBlank) {
    if (currentLanguage === 'hi') {
      textToRead = `खाली स्थान भरें: ${qText}. अपना उत्तर टाइप करें या बोलें.`;
    } else if (currentLanguage === 'mr') {
      textToRead = `रिकामी जागा भरा: ${qText}. तुमचे उत्तर टाइप करा किंवा बोला.`;
    } else if (currentLanguage === 'te') {
      textToRead = `ଶୂନ୍ୟସ୍ଥାନ ପୂରଣ କରନ୍ତୁ: ${qText}. ଆପଣଙ୍କ ଉତ୍ତର ଟାଇପ୍ କରନ୍ତୁ କିମ୍ବା କୁହନ୍ତୁ.`;
    } else {
      textToRead = `Fill in the blank: ${qText}. Type or speak your answer.`;
    }
  } else {
    if (currentLanguage === 'hi') {
      textToRead = `प्रश्न: ${qText}. विकल्प ए: ${q.option_a}. विकल्प बी: ${q.option_b}. विकल्प सी: ${q.option_c}. विकल्प डी: ${q.option_d}.`;
    } else if (currentLanguage === 'mr') {
      textToRead = `प्रश्न: ${qText}. पर्याय ए: ${q.option_a}. पर्याय बी: ${q.option_b}. पर्याय सी: ${q.option_c}. पर्याय डी: ${q.option_d}.`;
    } else if (currentLanguage === 'te') {
      textToRead = `ପ୍ରଶ୍ନ: ${qText}. ବିକଳ୍ପ ଏ: ${q.option_a}. ବିକଳ୍ପ ବି: ${q.option_b}. ବିକଳ୍ପ ସି: ${q.option_c}. ବିକଳ୍ପ ଡି: ${q.option_d}.`;
    } else {
      textToRead = `Question: ${qText}. Option A: ${q.option_a}. Option B: ${q.option_b}. Option C: ${q.option_c}. Option D: ${q.option_d}.`;
    }
  }
  
  speakText(textToRead);
}

function startQuizSpeechRecognition() {
  const wasListening = isListening;
  stopSpeechRecognition();
  if (wasListening) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition is not supported in this browser.");
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'te' ? 'or-IN' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    isListening = true;
    const micBtn = document.getElementById('quiz-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🛑 Listening...';
      micBtn.classList.add('mic-active');
    }
  };
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const inputEl = document.getElementById('quiz-blank-input');
    if (inputEl) {
      inputEl.value = speechResult;
    }
  };
  
  recognition.onend = () => {
    isListening = false;
    const micBtn = document.getElementById('quiz-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🎤 Speak';
      micBtn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isListening = false;
    const micBtn = document.getElementById('quiz-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🎤 Speak';
      micBtn.classList.remove('mic-active');
    }
    if (event.error !== 'aborted') {
      showToast("⚠️ Could not hear clearly. Try again.");
    }
    recognition = null;
  };
  
  recognition.start();
}

function stopSpeechRecognition() {
  if (recognition) {
    try {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.abort();
    } catch(e) {
      console.warn("Speech recognition abort error:", e);
    }
    recognition = null;
  }
  isListening = false;
  
  document.querySelectorAll('.mic-active').forEach(btn => {
    btn.classList.remove('mic-active');
    if (btn.id === 'quiz-mic-btn') {
      btn.innerHTML = '🎤 Speak';
    } else if (btn.id === 'chat-mic-btn') {
      btn.innerHTML = '🎤';
    } else if (btn.id === 'quiz-mcq-mic-btn') {
      const labelSpeak = { en: '🎤 Speak Answer', hi: '🎤 उत्तर बोलें', mr: '🎤 उत्तर बोला', or: '🎤 ଉତ୍ତର କୁହନ୍ତୁ' }[currentLanguage] || '🎤 Speak Answer';
      btn.innerHTML = labelSpeak;
    } else if (btn.id.startsWith('btn-practice-')) {
      const labelPractice = { en: 'Practice', hi: 'अभ्यास करें', mr: 'सराव करा', or: 'ଅଭ୍ୟାସ' }[currentLanguage] || 'Practice';
      btn.innerHTML = `🎤 ${labelPractice}`;
    }
  });
}

function submitBlankAnswer(correct) {
  if (quizState.answered) return;
  quizState.answered = true;
  
  const inputEl = document.getElementById('quiz-blank-input');
  const userAns = inputEl.value.trim().toLowerCase();
  const correctAns = correct.trim().toLowerCase();
  
  const isCorrect = userAns === correctAns;
  if (isCorrect) quizState.score++;
  
  inputEl.disabled = true;
  document.getElementById('quiz-mic-btn').disabled = true;
  document.getElementById('quiz-submit-btn').style.display = 'none';
  
  if (isCorrect) {
    inputEl.classList.add('input-correct');
    showToast('✅ Correct! +10 points');
  } else {
    inputEl.classList.add('input-wrong');
    showToast(`❌ Wrong! Correct answer is: ${correct}`);
    displayOfflineHint();
  }
  
  const { questions, current } = quizState;
  const q = questions[current];
  if (q.explanation) {
    const expEl = document.getElementById('quiz-explanation');
    document.getElementById('quiz-exp-text').textContent = q.explanation;
    expEl.style.display = 'block';
  }
  
  document.getElementById('quiz-next-btn').style.display = 'block';
}

function startMcqSpeechRecognition() {
  const wasListening = isListening;
  stopSpeechRecognition();
  if (wasListening) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition is not supported in this browser.");
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'te' ? 'or-IN' : 'en-US';
  recognition.interimResults = false;
  
  recognition.onstart = () => {
    isListening = true;
    const micBtn = document.getElementById('quiz-mcq-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🛑 Listening...';
      micBtn.classList.add('mic-active');
    }
  };
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript.toLowerCase().trim();
    const optionMatches = {
      a: ['a', 'option a', 'ए', 'विकल्प ए', 'पर्याय ए', 'ଏ'],
      b: ['b', 'option b', 'बी', 'विकल्प बी', 'पर्याय बी', 'ବି'],
      c: ['c', 'option c', 'सी', 'विकल्प सी', 'पर्याय सी', 'ସି'],
      d: ['d', 'option d', 'डी', 'विकल्प डी', 'पर्याय डी', 'ଡି']
    };
    
    let matchedKey = null;
    for (const [key, aliases] of Object.entries(optionMatches)) {
      if (aliases.some(alias => speechResult.includes(alias))) {
        matchedKey = key.toUpperCase();
        break;
      }
    }
    
    if (!matchedKey) {
      const q = quizState.questions[quizState.current];
      const optA = q.option_a.toLowerCase();
      const optB = q.option_b.toLowerCase();
      const optC = q.option_c.toLowerCase();
      const optD = q.option_d.toLowerCase();
      
      if (speechResult.includes(optA)) matchedKey = 'A';
      else if (speechResult.includes(optB)) matchedKey = 'B';
      else if (speechResult.includes(optC)) matchedKey = 'C';
      else if (speechResult.includes(optD)) matchedKey = 'D';
    }
    
    if (matchedKey) {
      const q = quizState.questions[quizState.current];
      selectAnswer(matchedKey, q.correct_answer, q.explanation);
    } else {
      showToast(`Could not recognize option from: "${speechResult}"`);
    }
  };
  
  recognition.onend = () => {
    isListening = false;
    const micBtn = document.getElementById('quiz-mcq-mic-btn');
    if (micBtn) {
      const labelSpeak = { en: '🎤 Speak Answer', hi: '🎤 उत्तर बोलें', mr: '🎤 उत्तर बोला', or: '🎤 ଉତ୍ତର କୁହନ୍ତୁ' }[currentLanguage] || '🎤 Speak Answer';
      micBtn.innerHTML = labelSpeak;
      micBtn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.onerror = (event) => {
    console.error("MCQ speech recognition error:", event.error);
    isListening = false;
    const micBtn = document.getElementById('quiz-mcq-mic-btn');
    if (micBtn) {
      const labelSpeak = { en: '🎤 Speak Answer', hi: '🎤 उत्तर बोलें', mr: '🎤 उत्तर बोला', or: '🎤 ଉତ୍ତର କୁହନ୍ତୁ' }[currentLanguage] || '🎤 Speak Answer';
      micBtn.innerHTML = labelSpeak;
      micBtn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.start();
}

function startChatSpeechRecognition() {
  const wasListening = isListening;
  stopSpeechRecognition();
  if (wasListening) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition is not supported in this browser.");
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'te' ? 'or-IN' : 'en-US';
  recognition.interimResults = false;
  
  recognition.onstart = () => {
    isListening = true;
    const micBtn = document.getElementById('chat-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🛑';
      micBtn.classList.add('mic-active');
    }
  };
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    const inputEl = document.getElementById('chat-input');
    if (inputEl) {
      inputEl.value = speechResult;
    }
  };
  
  recognition.onend = () => {
    isListening = false;
    const micBtn = document.getElementById('chat-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🎤';
      micBtn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.onerror = (event) => {
    console.error("Chat speech recognition error:", event.error);
    isListening = false;
    const micBtn = document.getElementById('chat-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🎤';
      micBtn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.start();
}

function speakVocabWord(word) {
  speakText(word, 'en');
}

function practicePronunciation(word, safeId) {
  const wasListening = isListening;
  stopSpeechRecognition();
  if (wasListening) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition is not supported in this browser.");
    return;
  }
  
  if (!safeId) safeId = word.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const btn = document.getElementById(`btn-practice-${safeId}`);
  const itemEl = document.getElementById(`vocab-${safeId}`);
  const statusIcon = itemEl ? itemEl.querySelector('.vocab-status-icon') : null;
  
  if (!btn || !statusIcon) return;

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    isListening = true;
    btn.innerHTML = '🛑 Listening...';
    btn.classList.add('mic-active');
    statusIcon.innerHTML = '👂 Speak now...';
    statusIcon.className = 'vocab-status-icon';
  };
  
  recognition.onresult = (event) => {
    let finalSpoken = '';
    let interimSpoken = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalSpoken += event.results[i][0].transcript;
      } else {
        interimSpoken += event.results[i][0].transcript;
      }
    }
    
    if (interimSpoken && !finalSpoken) {
      statusIcon.innerHTML = `👂 Hearing: "${interimSpoken}"...`;
    }
    
    if (finalSpoken) {
      const spoken = finalSpoken.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      const target = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      
      if (spoken === target || spoken.includes(target) || target.includes(spoken)) {
        statusIcon.innerHTML = `✅ Excellent! (You said: "${spoken}")`;
        statusIcon.className = 'vocab-status-icon correct';
        showToast('🎉 Perfect Pronunciation! +5 XP');
        awardPronunciationXp();
      } else {
        statusIcon.innerHTML = `❌ Try again (You said: "${spoken}")`;
        statusIcon.className = 'vocab-status-icon wrong';
      }
    }
  };
  
  recognition.onend = () => {
    isListening = false;
    const labelPractice = { en: 'Practice', hi: 'अभ्यास करें', mr: 'सराव करा', or: 'ଅଭ୍ୟାସ' }[currentLanguage] || 'Practice';
    if (btn) {
      btn.innerHTML = `🎤 ${labelPractice}`;
      btn.classList.remove('mic-active');
    }
    recognition = null;
  };
  
  recognition.onerror = (event) => {
    console.error("Pronunciation practice recognition error:", event.error);
    isListening = false;
    const labelPractice = { en: 'Practice', hi: 'अभ्यास करें', mr: 'सराव करा', or: 'ଅଭ୍ୟାସ' }[currentLanguage] || 'Practice';
    if (btn) {
      btn.innerHTML = `🎤 ${labelPractice}`;
      btn.classList.remove('mic-active');
    }
    if (event.error !== 'aborted') {
      showToast("⚠️ Didn't catch that. Please try again.");
      if (statusIcon && statusIcon.innerHTML.includes('Speak now')) {
        statusIcon.innerHTML = `⚠️ Couldn't hear you`;
        statusIcon.className = 'vocab-status-icon wrong';
      }
    }
    recognition = null;
  };
  
  recognition.start();
}

async function awardPronunciationXp() {
  try {
    const result = await api('/api/profile/xp', 'POST', { xp: 5 });
    if (currentUser) {
      currentUser.xp = result.totalXP;
      currentUser.level = Math.floor(result.totalXP / 200) + 1;
      updateNavStats();
    }
  } catch (e) {
    console.error("Failed to update XP:", e);
  }
}

// ===== SCAN & SOLVE =====
function showScanSolve() {
  const overlay = document.getElementById('scan-solve-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  // Reset state
  resetScanUI();
}

function closeScanSolve() {
  stopScanCamera();
  const overlay = document.getElementById('scan-solve-overlay');
  if (overlay) overlay.classList.add('hidden');
  scanCapturedImage = null;
}

function resetScanUI() {
  scanCapturedImage = null;
  const video = document.getElementById('scan-video');
  const preview = document.getElementById('scan-preview');
  const placeholder = document.getElementById('scan-placeholder');
  const scanLine = document.getElementById('scan-line');
  const captureBtn = document.getElementById('btn-capture');
  const actions = document.getElementById('scan-actions');
  const solution = document.getElementById('scan-solution');
  const tips = document.getElementById('scan-tips');
  const solveBtn = document.getElementById('btn-solve');
  const solveBtnText = document.getElementById('btn-solve-text');

  if (video) video.classList.remove('hidden');
  if (preview) { preview.classList.add('hidden'); preview.src = ''; }
  if (placeholder) placeholder.classList.remove('hidden');
  if (scanLine) scanLine.classList.remove('active');
  if (captureBtn) captureBtn.disabled = true;
  if (actions) actions.style.display = 'none';
  if (solution) solution.style.display = 'none';
  if (tips) tips.style.display = 'flex';
  if (solveBtn) solveBtn.disabled = false;
  if (solveBtnText) solveBtnText.innerHTML = '🔍 Solve This!';
  
  const solutionBody = document.getElementById('solution-body');
  if (solutionBody) solutionBody.innerHTML = '';
}

async function startCamera() {
  stopScanCamera();
  resetScanUI();
  const video = document.getElementById('scan-video');
  const placeholder = document.getElementById('scan-placeholder');
  const captureBtn = document.getElementById('btn-capture');
  const scanLine = document.getElementById('scan-line');

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } }
    });
    video.srcObject = scanStream;
    video.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    if (captureBtn) captureBtn.disabled = false;
    if (scanLine) scanLine.classList.add('active');
  } catch (err) {
    console.error('Camera error:', err);
    showToast('⚠️ Camera not available. Use Gallery to upload an image.');
    if (placeholder) {
      placeholder.classList.remove('hidden');
      placeholder.innerHTML = '<div class="scan-ph-icon">📷</div><p>Camera not available<br><small>Use Gallery button instead</small></p>';
    }
  }
}

function stopScanCamera() {
  if (scanStream) {
    scanStream.getTracks().forEach(track => track.stop());
    scanStream = null;
  }
  const video = document.getElementById('scan-video');
  if (video) { video.srcObject = null; }
  const scanLine = document.getElementById('scan-line');
  if (scanLine) scanLine.classList.remove('active');
}

function capturePhoto() {
  const video = document.getElementById('scan-video');
  const canvas = document.getElementById('scan-canvas');
  const preview = document.getElementById('scan-preview');
  const placeholder = document.getElementById('scan-placeholder');
  const actions = document.getElementById('scan-actions');
  const tips = document.getElementById('scan-tips');

  if (!video || !canvas) return;

  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 960;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL('image/jpeg', 0.85);
  scanCapturedImage = dataURL;

  // Show preview
  if (preview) { preview.src = dataURL; preview.classList.remove('hidden'); }
  if (placeholder) placeholder.classList.add('hidden');
  if (tips) tips.style.display = 'none';
  if (actions) actions.style.display = 'flex';

  // Stop camera to save resources
  stopScanCamera();
}

function triggerImageUpload() {
  const input = document.getElementById('scan-file-input');
  if (input) input.click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataURL = e.target.result;
    scanCapturedImage = dataURL;

    const preview = document.getElementById('scan-preview');
    const placeholder = document.getElementById('scan-placeholder');
    const video = document.getElementById('scan-video');
    const actions = document.getElementById('scan-actions');
    const tips = document.getElementById('scan-tips');

    if (preview) { preview.src = dataURL; preview.classList.remove('hidden'); }
    if (placeholder) placeholder.classList.add('hidden');
    if (video) video.classList.add('hidden');
    if (tips) tips.style.display = 'none';
    if (actions) actions.style.display = 'flex';

    stopScanCamera();
  };
  reader.readAsDataURL(file);
  // Reset input so same file can be re-selected
  event.target.value = '';
}

function retakePhoto() {
  resetScanUI();
  startCamera();
}

function renderSTEMContent(text, element) {
  // 1. Extract math blocks to prevent markdown parser from interfering
  const mathBlocks = [];
  let placeholderCounter = 0;

  // Match display math: $$...$$ or \[...\]
  const displayRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
  let processedText = text.replace(displayRegex, (match) => {
    const placeholder = `___MATH_DISPLAY_PLACEHOLDER_${placeholderCounter}___`;
    mathBlocks.push({ placeholder, content: match, display: true });
    placeholderCounter++;
    return placeholder;
  });

  // Match inline math: $...$ or \(...\)
  const inlineRegex = /(\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;
  processedText = processedText.replace(inlineRegex, (match) => {
    const placeholder = `___MATH_INLINE_PLACEHOLDER_${placeholderCounter}___`;
    mathBlocks.push({ placeholder, content: match, display: false });
    placeholderCounter++;
    return placeholder;
  });

  // 2. Parse Markdown
  let html = '';
  if (typeof marked !== 'undefined' && marked.parse) {
    html = marked.parse(processedText);
  } else if (typeof marked === 'function') {
    html = marked(processedText);
  } else {
    // Basic fallback if marked is not available
    html = processedText.replace(/\n/g, '<br>');
  }

  // 3. Put math blocks back in the generated HTML
  mathBlocks.forEach(item => {
    html = html.replace(item.placeholder, item.content);
  });

  // 4. Set innerHTML
  element.innerHTML = html;

  // 5. Trigger KaTeX Auto-Render
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(element, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }
}

async function submitScanSolve() {
  if (!scanCapturedImage) {
    showToast('⚠️ Please capture or upload an image first.');
    return;
  }

  const solveBtn = document.getElementById('btn-solve');
  const solveBtnText = document.getElementById('btn-solve-text');
  const solutionDiv = document.getElementById('scan-solution');
  const solutionBody = document.getElementById('solution-body');
  const tips = document.getElementById('scan-tips');

  // Show loading state
  if (solveBtn) solveBtn.disabled = true;
  if (solveBtnText) solveBtnText.innerHTML = '<span class="solve-spinner"></span> Analysing...';
  if (solutionDiv) solutionDiv.style.display = 'none';

  try {
    const result = await api('/api/scan-solve', 'POST', {
      imageBase64: scanCapturedImage,
      language: currentLanguage
    });

    const solution = result.solution || 'Could not generate a solution. Please try again.';

    if (solutionBody) {
      renderSTEMContent(solution, solutionBody);
    }
    if (solutionDiv) solutionDiv.style.display = 'block';
    if (tips) tips.style.display = 'none';

    // Scroll to solution
    setTimeout(() => {
      if (solutionDiv) solutionDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    showToast('✅ Solution ready!');
  } catch (err) {
    console.error('Scan & Solve error:', err);
    const msg = err.message || 'Could not analyse the image. Please try a clearer photo.';
    showToast('⚠️ ' + msg);
    if (solutionBody) solutionBody.textContent = '⚠️ ' + msg;
    if (solutionDiv) solutionDiv.style.display = 'block';
  } finally {
    if (solveBtn) solveBtn.disabled = false;
    if (solveBtnText) solveBtnText.innerHTML = '🔍 Solve This!';
  }
}

function speakSolution() {
  const solutionBody = document.getElementById('solution-body');
  const btn = document.getElementById('btn-speak-solution');
  if (!solutionBody) return;
  const rawText = solutionBody.textContent.trim();
  if (!rawText) return;

  // Clean LaTeX notation for cleaner text-to-speech
  let cleanText = rawText
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '$1 over $2')
    .replace(/\\cdot/g, ' times ')
    .replace(/\\times/g, ' times ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\approx/g, ' approximately ')
    .replace(/\\sqrt\{(.*?)\}/g, ' square root of $1 ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\\theta/g, ' theta ')
    .replace(/\\Delta/g, ' delta ')
    .replace(/\\Sigma/g, ' sigma ')
    .replace(/\\infty/g, ' infinity ')
    .replace(/\\le/g, ' less than or equal to ')
    .replace(/\\ge/g, ' greater than or equal to ')
    .replace(/\\ne/g, ' not equal to ')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\/g, ' ')
    .replace(/[\n\r]+/g, ' ');

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = currentLanguage === 'hi' ? 'hi-IN'
    : currentLanguage === 'mr' ? 'mr-IN'
    : currentLanguage === 'te' ? 'or-IN'
    : 'en-US';
  utterance.rate = 0.9;
  utterance.onstart = () => { if (btn) btn.innerHTML = '🛑 Stop'; };
  utterance.onend = () => { if (btn) btn.innerHTML = '🔊 Read Aloud'; };
  utterance.onerror = () => { if (btn) btn.innerHTML = '🔊 Read Aloud'; };
  window.speechSynthesis.speak(utterance);
}

// ===== SOCKET.IO MULTIPLAYER BATTLE ARENA IMPLEMENTATION =====

function initSocket() {
  if (socket) return; // already initialized

  console.log("Initializing Socket.io client connection...");
  socket = io({
    auth: {
      token: currentToken
    }
  });

  socket.on('connect', () => {
    console.log('Connected to socket server successfully');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    showToast('❌ Socket connection error: ' + err.message);
  });

  socket.on('roomCreated', ({ roomCode, subjectCode, player }) => {
    battleRoomCode = roomCode;
    document.getElementById('waiting-room-code').textContent = roomCode;
    document.getElementById('lobby-p1-avatar').textContent = player.avatar;
    document.getElementById('lobby-p1-name').textContent = player.name + ' (You)';
    document.getElementById('lobby-p2-avatar').textContent = '❓';
    document.getElementById('lobby-p2-avatar').style.borderStyle = 'dashed';
    document.getElementById('lobby-p2-avatar').style.background = 'transparent';
    document.getElementById('lobby-p2-name').textContent = 'Waiting...';
    document.getElementById('battle-waiting-area').classList.remove('hidden');
  });

  socket.on('roomJoined', ({ roomCode, players }) => {
    battleRoomCode = roomCode;
    document.getElementById('waiting-room-code').textContent = roomCode;

    const p1 = players[0];
    const p2 = players[1];

    document.getElementById('lobby-p1-avatar').textContent = p1.avatar;
    document.getElementById('lobby-p1-name').textContent = p1.name + (p1.id === currentUser.id ? ' (You)' : '');

    document.getElementById('lobby-p2-avatar').textContent = p2.avatar;
    document.getElementById('lobby-p2-avatar').style.borderStyle = 'solid';
    document.getElementById('lobby-p2-avatar').style.background = 'var(--bg2)';
    document.getElementById('lobby-p2-name').textContent = p2.name + (p2.id === currentUser.id ? ' (You)' : '');

    document.getElementById('battle-waiting-area').classList.remove('hidden');
  });

  socket.on('roomError', ({ message }) => {
    showToast('❌ ' + message);
  });

  socket.on('battleStart', ({ players, questionsCount, subjectColor }) => {
    battleState.questionsCount = questionsCount;
    battleState.players = players;

    // Switch to battle arena screen
    showScreen('quiz-battle-arena');

    // Set scoreboard cards
    const p1 = players.find(p => p.id === currentUser.id);
    const p2 = players.find(p => p.id !== currentUser.id);

    document.getElementById('arena-p1-avatar').textContent = p1.avatar;
    document.getElementById('arena-p1-name').textContent = p1.name;
    document.getElementById('arena-p1-score').textContent = '0 pts';
    document.getElementById('arena-p1-status').textContent = 'Waiting';
    document.getElementById('arena-p1-status').className = 'player-status-badge';
    document.getElementById('arena-p1-card').classList.remove('answered');

    document.getElementById('arena-p2-avatar').textContent = p2.avatar;
    document.getElementById('arena-p2-name').textContent = p2.name;
    document.getElementById('arena-p2-score').textContent = '0 pts';
    document.getElementById('arena-p2-status').textContent = 'Waiting';
    document.getElementById('arena-p2-status').className = 'player-status-badge';
    document.getElementById('arena-p2-card').classList.remove('answered');

    // Show ready countdown overlay
    const overlay = document.getElementById('battle-start-overlay');
    overlay.classList.remove('hidden');
  });

  socket.on('countdownTick', (count) => {
    const numEl = document.getElementById('battle-countdown-num');
    if (numEl) {
      numEl.textContent = count > 0 ? count : 'GO! ⚔️';
    }
  });

  socket.on('nextQuestion', ({ questionIndex, question, players }) => {
    // Hide ready countdown overlay if visible
    document.getElementById('battle-start-overlay').classList.add('hidden');

    battleState.currentQuestionIndex = questionIndex;
    battleState.answered = false;

    // Hide explanation
    document.getElementById('arena-explanation').classList.add('hidden');

    // Reset scoreboards status
    players.forEach(p => {
      if (p.id === currentUser.id) {
        document.getElementById('arena-p1-score').textContent = `${p.score * 10} pts`;
        document.getElementById('arena-p1-status').textContent = 'Thinking...';
        document.getElementById('arena-p1-status').className = 'player-status-badge thinking';
        document.getElementById('arena-p1-card').classList.remove('answered');
      } else {
        document.getElementById('arena-p2-score').textContent = `${p.score * 10} pts`;
        document.getElementById('arena-p2-status').textContent = 'Thinking...';
        document.getElementById('arena-p2-status').className = 'player-status-badge thinking';
        document.getElementById('arena-p2-card').classList.remove('answered');
      }
    });

    // Render question
    document.getElementById('arena-q-num').textContent = `Question ${questionIndex + 1} of ${battleState.questionsCount}`;

    let qText = question.question;
    if (currentLanguage === 'hi' && question.question_hi) qText = question.question_hi;
    else if (currentLanguage === 'mr' && question.question_mr) qText = question.question_mr;
    else if (currentLanguage === 'te' && question.question_te) qText = question.question_te;

    document.getElementById('arena-q-text').textContent = qText;

    // Render options
    const options = [
      { key: 'A', text: question.option_a },
      { key: 'B', text: question.option_b },
      { key: 'C', text: question.option_c },
      { key: 'D', text: question.option_d }
    ];

    const optionsContainer = document.getElementById('arena-options');
    optionsContainer.innerHTML = options.map(o => `
      <button class="quiz-option" onclick="selectBattleAnswer('${o.key}')" data-key="${o.key}">
        <span class="option-letter">${o.key}</span>
        <span class="option-text">${o.text}</span>
      </button>
    `).join('');
  });

  socket.on('timerTick', (countdown) => {
    document.getElementById('arena-timer-val').textContent = countdown;
    const stroke = document.getElementById('battle-timer-stroke');
    if (stroke) {
      const pct = (countdown / 10) * 100;
      stroke.setAttribute('stroke-dasharray', `${pct}, 100`);

      if (countdown <= 3) {
        stroke.style.stroke = '#FF6B6B';
      } else {
        stroke.style.stroke = 'var(--secondary)';
      }
    }
  });

  socket.on('playerAnswered', ({ playerId, playersStatus }) => {
    const status = playersStatus.find(ps => ps.id === playerId);
    if (status && status.answered) {
      if (playerId === currentUser.id) {
        document.getElementById('arena-p1-status').textContent = 'Answered!';
        document.getElementById('arena-p1-status').className = 'player-status-badge submitted';
        document.getElementById('arena-p1-card').classList.add('answered');
      } else {
        document.getElementById('arena-p2-status').textContent = 'Answered!';
        document.getElementById('arena-p2-status').className = 'player-status-badge submitted';
        document.getElementById('arena-p2-card').classList.add('answered');
      }
    }
  });

  socket.on('questionResult', ({ correctAnswer, explanation, players }) => {
    // Show correct / incorrect highlights on options
    document.querySelectorAll('#arena-options .quiz-option').forEach(btn => {
      btn.classList.add('disabled');
      const key = btn.dataset.key;
      if (key === correctAnswer) {
        btn.classList.add('selected-correct');
      }
    });

    // Update scoreboard with results
    players.forEach(p => {
      const badgeId = p.id === currentUser.id ? 'arena-p1-status' : 'arena-p2-status';
      const badgeEl = document.getElementById(badgeId);
      const scoreId = p.id === currentUser.id ? 'arena-p1-score' : 'arena-p2-score';
      const scoreEl = document.getElementById(scoreId);

      scoreEl.textContent = `${p.score * 10} pts`;

      if (p.answered) {
        if (p.correct) {
          badgeEl.textContent = '✅ Correct!';
          badgeEl.className = 'player-status-badge correct';
        } else {
          badgeEl.textContent = '❌ Incorrect';
          badgeEl.className = 'player-status-badge wrong';
        }
      } else {
        badgeEl.textContent = '⏳ Timeout';
        badgeEl.className = 'player-status-badge timeout';
      }
    });

    // Display Explanation
    if (explanation) {
      document.getElementById('arena-exp-text').textContent = explanation;
      document.getElementById('arena-explanation').classList.remove('hidden');
    }
  });

  socket.on('battleFinished', ({ winnerId, loserId, p1, p2 }) => {
    showScreen('quiz-battle-results');

    const isWinner = winnerId === currentUser.id;
    const isDraw = winnerId === null;

    const emojiEl = document.getElementById('battle-result-emoji');
    const titleEl = document.getElementById('battle-result-title');
    const scoreEl = document.getElementById('battle-result-score');
    const xpEl = document.getElementById('battle-result-xp');
    const msgTitleEl = document.getElementById('battle-result-msg-title');
    const msgBodyEl = document.getElementById('battle-result-msg-body');

    const myPlayer = p1.id === currentUser.id ? p1 : p2;
    const opponentPlayer = p1.id === currentUser.id ? p2 : p1;

    scoreEl.textContent = `Your Score: ${myPlayer.score} vs Opponent: ${opponentPlayer.score}`;
    xpEl.textContent = `+${myPlayer.xpEarned} XP`;

    if (isWinner) {
      emojiEl.textContent = '🏆';
      titleEl.textContent = 'Victory! / जीत!';
      titleEl.style.color = 'var(--secondary)';
      msgTitleEl.textContent = 'Double XP Activated! ⚡';
      msgBodyEl.textContent = `Spectacular performance! You defeated ${opponentPlayer.name} and earned a massive 2x XP bonus!`;
    } else if (isDraw) {
      emojiEl.textContent = '🤝';
      titleEl.textContent = "It's a Draw! / मुकाबला बराबरी का!";
      titleEl.style.color = 'var(--accent)';
      msgTitleEl.textContent = 'Well played! 👏';
      msgBodyEl.textContent = `A perfectly matched contest! You and ${opponentPlayer.name} finished with equal scores. Keep practicing to take the lead next time!`;
    } else {
      emojiEl.textContent = '💔';
      titleEl.textContent = 'Defeat! / कोशिश जारी रखें!';
      titleEl.style.color = '#FF6B6B';
      msgTitleEl.textContent = 'Never Give Up! 🌱';
      msgBodyEl.textContent = `Don't worry, failure is just a stepping stone to success! Practice makes perfect. Challenge ${opponentPlayer.name} to a rematch and try again!`;
    }

    // Refresh XP stats locally after a short delay
    setTimeout(async () => {
      try {
        const profile = await api('/api/profile');
        currentUser = profile;
        updateNavStats();
      } catch (e) {
        console.error('Error refreshing profile after battle:', e);
      }
    }, 1000);
  });

  socket.on('rematchPrompt', ({ fromName }) => {
    showToast(`⚔️ ${fromName} requested a rematch!`);
  });

  socket.on('opponentDisconnected', ({ message }) => {
    showToast('⚠️ ' + message);
    setTimeout(() => {
      showScreen('home');
    }, 4000);
  });
}

function createBattleRoom() {
  initSocket();
  const subjectCode = document.getElementById('battle-subject').value;
  socket.emit('createRoom', { subjectCode });
  document.getElementById('battle-waiting-area').classList.remove('hidden');
}

function joinBattleRoom() {
  initSocket();
  const roomCode = document.getElementById('battle-room-code').value.trim();
  if (roomCode.length !== 6 || isNaN(roomCode)) {
    showToast('❌ Please enter a valid 6-digit room code');
    return;
  }
  socket.emit('joinRoom', { roomCode });
}

function selectBattleAnswer(answerKey) {
  if (battleState.answered) return;
  battleState.answered = true;

  document.querySelectorAll('#arena-options .quiz-option').forEach(btn => {
    btn.classList.add('disabled');
    if (btn.dataset.key === answerKey) {
      btn.style.borderColor = 'var(--primary)';
      btn.style.background = 'rgba(255, 107, 53, 0.1)';
    }
  });

  socket.emit('submitAnswer', { answer: answerKey });
}

function rematchBattle() {
  if (socket) {
    socket.emit('requestRematch');
    showToast('⏳ Rematch requested. Waiting for opponent...');
  }
}

// ===== OFFLINE AI ON-DEVICE INTELLIGENCE IMPLEMENTATION =====

let offlineDb = null;
function initOfflineDB() {
  return new Promise((resolve, reject) => {
    if (offlineDb) return resolve(offlineDb);
    
    console.log("Initializing IndexedDB 'VidyaQuestOfflineDB'...");
    const request = indexedDB.open('VidyaQuestOfflineDB', 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('questions')) {
        const qStore = db.createObjectStore('questions', { keyPath: 'id' });
        qStore.createIndex('lesson_id', 'lesson_id', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('hints')) {
        const hStore = db.createObjectStore('hints', { keyPath: 'id', autoIncrement: true });
        hStore.createIndex('lesson_id', 'lesson_id', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('offline_progress')) {
        db.createObjectStore('offline_progress', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (e) => {
      offlineDb = e.target.result;
      resolve(offlineDb);
    };
    
    request.onerror = (e) => {
      console.error('IndexedDB open error:', e.target.error);
      reject(e.target.error);
    };
  });
}

function saveOfflineLesson(lesson, questions, hints) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initOfflineDB();
      const transaction = db.transaction(['lessons', 'questions', 'hints'], 'readwrite');
      
      // Save lesson details
      const lessonStore = transaction.objectStore('lessons');
      lessonStore.put({
        id: lesson.id,
        subject_id: lesson.subject_id,
        subject_name: lesson.subject_name,
        subject_color: lesson.subject_color,
        title: lesson.title,
        title_hi: lesson.title_hi,
        title_mr: lesson.title_mr,
        title_te: lesson.title_te,
        content: lesson.content,
        grade: lesson.grade,
        difficulty: lesson.difficulty,
        xp_reward: lesson.xp_reward
      });
      
      // Save questions
      const questionStore = transaction.objectStore('questions');
      questions.forEach(q => {
        questionStore.put(q);
      });
      
      // Clean old hints for this lesson to prevent duplicates
      const hintStore = transaction.objectStore('hints');
      const index = hintStore.index('lesson_id');
      const request = index.openCursor(IDBKeyRange.only(lesson.id));
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          // Write new hints
          hints.forEach(h => {
            h.lesson_id = lesson.id;
            hintStore.add(h);
          });
        }
      };
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = (e) => {
        reject(e.target.error);
      };
    } catch(err) {
      reject(err);
    }
  });
}

function getOfflineLesson(lessonId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initOfflineDB();
      const transaction = db.transaction(['lessons', 'questions'], 'readonly');
      
      const lessonStore = transaction.objectStore('lessons');
      const questionStore = transaction.objectStore('questions');
      const index = questionStore.index('lesson_id');
      
      const lessonReq = lessonStore.get(lessonId);
      const questionsReq = index.getAll(lessonId);
      
      transaction.oncomplete = () => {
        const lesson = lessonReq.result;
        if (lesson) {
          lesson.questions = questionsReq.result || [];
          resolve(lesson);
        } else {
          resolve(null);
        }
      };
      
      transaction.onerror = (e) => {
        reject(e.target.error);
      };
    } catch(err) {
      reject(err);
    }
  });
}

function checkIfLessonDownloaded(lessonId) {
  return new Promise(async (resolve) => {
    try {
      const db = await initOfflineDB();
      const transaction = db.transaction(['lessons'], 'readonly');
      const store = transaction.objectStore('lessons');
      const req = store.get(lessonId);
      
      req.onsuccess = () => {
        resolve(!!req.result);
      };
      req.onerror = () => {
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}

async function downloadLessonOffline(lessonId) {
  const btn = document.getElementById('btn-download-lesson');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Downloading... ⏳';
  }
  
  try {
    // 1. Fetch lesson details & quiz questions
    const lesson = await api('/api/lesson/' + lessonId);
    
    // 2. Fetch 50 adaptive hints
    const hintData = await api('/api/offline/download-hints/' + lessonId);
    
    // 3. Save to Local IndexedDB Cache
    await saveOfflineLesson(lesson, lesson.questions, hintData.hints);
    
    showToast('✅ Downloaded successfully! Offline AI active.');
    if (btn) {
      btn.textContent = 'Offline Ready ✅';
      btn.style.background = 'rgba(78, 205, 196, 0.12)';
      btn.style.color = 'var(--secondary)';
      btn.style.borderColor = 'rgba(78, 205, 196, 0.3)';
    }
  } catch (err) {
    console.error('Download offline error:', err);
    showToast('❌ Download failed. Make sure you are online!');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Download Offline 📥';
    }
  }
}

function saveOfflineProgress(lessonId, score, total) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initOfflineDB();
      const transaction = db.transaction(['offline_progress'], 'readwrite');
      const store = transaction.objectStore('offline_progress');
      store.add({
        lessonId,
        score,
        total,
        timestamp: new Date().toISOString()
      });
      transaction.oncomplete = () => {
        resolve(true);
      };
      transaction.onerror = (e) => reject(e.target.error);
    } catch(err) {
      reject(err);
    }
  });
}

async function syncOfflineProgress() {
  if (!navigator.onLine) return;
  
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['offline_progress'], 'readonly');
    const store = transaction.objectStore('offline_progress');
    const getReq = store.getAll();
    
    getReq.onsuccess = async () => {
      const records = getReq.result;
      if (!records || records.length === 0) return;
      
      console.log(`Syncing ${records.length} offline quiz progress records...`);
      showToast(`🔄 Syncing ${records.length} offline quiz results...`);
      
      for (const record of records) {
        try {
          // Post quiz result to DB
          const result = await api('/api/quiz/submit', 'POST', {
            lesson_id: record.lessonId,
            score: record.score,
            total: record.total
          });
          
          if (currentUser) {
            currentUser.xp = result.totalXP;
            currentUser.level = Math.floor(result.totalXP / 200) + 1;
            updateNavStats();
          }
          
          // Re-download fresh AI hints tailored to the new performance scores!
          await api('/api/offline/download-hints/' + record.lessonId).then(async (hintData) => {
            const lesson = await getOfflineLesson(record.lessonId);
            if (lesson) {
              await saveOfflineLesson(lesson, lesson.questions, hintData.hints);
              console.log(`Refreshed on-device AI hints for lesson ${record.lessonId} post-sync`);
            }
          }).catch(err => console.error("Error refreshing hints after sync:", err));
          
        } catch(e) {
          console.error("Error syncing offline record:", e);
        }
      }
      
      // Clear offline progress queue
      const deleteTransaction = db.transaction(['offline_progress'], 'readwrite');
      const deleteStore = deleteTransaction.objectStore('offline_progress');
      deleteStore.clear();
      deleteTransaction.oncomplete = () => {
        showToast('✅ Offline progress synced and AI hints updated!');
      };
    };
  } catch (err) {
    console.error('Offline progress sync error:', err);
  }
}

async function displayOfflineHint() {
  try {
    const db = await initOfflineDB();
    const lessonId = quizState.lessonId;
    
    const transaction = db.transaction(['hints'], 'readonly');
    const store = transaction.objectStore('hints');
    const index = store.index('lesson_id');
    const request = index.getAll(lessonId);
    
    request.onsuccess = () => {
      const hints = request.result;
      if (hints && hints.length > 0) {
        const currentQ = quizState.questions[quizState.current];
        const qText = (currentQ.question || '').toLowerCase();
        
        // Find hint with matching tag in question text
        let matchedHint = null;
        for (const hint of hints) {
          const tag = (hint.tag || '').toLowerCase();
          if (tag && qText.includes(tag)) {
            matchedHint = hint;
            break;
          }
        }
        
        if (!matchedHint) {
          matchedHint = hints[Math.floor(Math.random() * hints.length)];
        }
        
        let hintText = matchedHint.hint_en;
        if (currentLanguage === 'hi' && matchedHint.hint_hi) hintText = matchedHint.hint_hi;
        else if (currentLanguage === 'mr' && matchedHint.hint_mr) hintText = matchedHint.hint_mr;
        else if (currentLanguage === 'te' && matchedHint.hint_te) hintText = matchedHint.hint_te;
        
        const hintEl = document.getElementById('quiz-offline-hint');
        if (hintEl) {
          hintEl.innerHTML = `
            <div class="hint-label">💡 On-Device AI Hint / ऑफ़लाइन एआई संकेत:</div>
            <div class="hint-text">${hintText}</div>
          `;
          hintEl.style.display = 'block';
        }
      }
    };
  } catch (err) {
    console.error("Error displaying offline hint:", err);
  }
}

// Bind online sync handler
window.addEventListener('online', syncOfflineProgress);
// Trigger init on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initOfflineDB().then(() => {
    // Try to sync any pending progress on startup
    if (navigator.onLine) {
      setTimeout(syncOfflineProgress, 2000);
    }
  }).catch(err => console.error("Could not initialize Offline IndexedDB:", err));
});


// ============================================================
// ===== SMART FOCUS MODE — Emotion & Engagement Tracker ======
// ============================================================

const SmartFocus = {
  // --- State ---
  active: false,
  stream: null,
  analysisInterval: null,
  currentEmotion: 'neutral',
  currentEngagement: 'medium',
  consecutiveLowEngagement: 0,
  consecutiveConfused: 0,
  quizDifficultyLevel: 'normal',   // 'easy' | 'normal' | 'hard'
  popupDismissed: false,
  lastAnalysisTime: 0,
  ANALYSIS_INTERVAL_MS: 20000,     // Analyse every 20 seconds
  LOW_ENGAGEMENT_THRESHOLD: 3,     // 3 consecutive low readings before intervention
  CONFUSED_THRESHOLD: 2,

  // --- Session Telemetry Tracker ---
  currentLessonId: null,
  sessionFocusSeconds: 0,
  sessionDistractedSeconds: 0,
  continuousFocusSeconds: 0,
  sessionTimerInterval: null,

  // --- Enhanced Focus Tracking ---
  distractionEvents: 0,            // Count of distinct distraction onset events
  longestFocusStreak: 0,           // Longest continuous focus run (seconds)
  currentFocusStreak: 0,           // Running current streak counter
  focusXpAwarded: 0,               // Total focus XP given this session
  wasDistracted: false,            // Previous tick distraction state (for edge detection)
  milestonesFired: new Set(),      // Which milestones (5,10,15 min) already fired

  // --- Offline Local Tracking State ---
  localInterval: null,
  cascadeLoaded: false,
  classifyRegion: null,
  faceCenterHistory: [],
  calibratedCenter: null,
  noFaceCounter: 0,
  turnCounter: 0,
  slouchCounter: 0,
  lastOnlineAnalysisTime: 0,       // Timestamp of last online API result
  lastTriggeredEmotion: null,      // Tracks last triggered logic emotion to prevent spam
  frustrationPopupActive: false,
  frustRecognition: null,
  frustIsListening: false,

  // Emoji map for emotion badge
  EMOTION_EMOJI: {
    focused: '🎯', happy: '😊', confused: '🤔',
    frustrated: '😤', bored: '😴', distracted: '👀', neutral: '😐'
  },

  // Intervention messages (cycling through to avoid repetition)
  INTERVENTIONS: {
    bored: [
      { icon: '🎮', title: 'Wake-up Challenge!', body: 'You look a little sleepy. Try this mental math: What is 17 × 8? Work it out in your head!' },
      { icon: '🌍', title: 'Cool Science Fact!', body: 'Did you know? A bolt of lightning is 5× hotter than the surface of the Sun! 🌩️ Think about why electricity is so powerful.' },
      { icon: '🤸', title: 'Stretch Break!', body: 'Roll your shoulders 3 times backward, then 3 times forward. Then take a deep breath. Ready to learn again? 💪' },
    ],
    distracted: [
      { icon: '🎯', title: 'Refocus Time!', body: 'Your attention has wandered — that\'s totally normal! Try closing other tabs and reading just ONE more section before a break.' },
      { icon: '🔍', title: 'Curiosity Challenge!', body: 'Think of ONE question about what you\'re studying right now. Got it? That curiosity is your superpower!' },
      { icon: '⏱️', title: 'Pomodoro Boost!', body: 'Set a 5-minute focus sprint — read deeply for just 5 minutes, then take a 1-minute break. You can do this!' },
    ],
    confused: [
      { icon: '💡', title: 'Need a Hint?', body: 'It\'s OK to be confused — that means you\'re learning something new! Try re-reading the last paragraph or check the Hint in your quiz.' },
      { icon: '🗺️', title: 'Let\'s Simplify!', body: 'Break the problem into smaller pieces. What is the first small thing you need to understand? Start there.' },
    ],
    frustrated: [
      { icon: '🌊', title: 'Take a Breath!', body: 'It looks like you\'re frustrated — that\'s a sign you care! Take 3 slow deep breaths, then try the problem from a different angle.' },
      { icon: '🏆', title: 'You\'ve Got This!', body: 'Every expert was once a beginner. The fact that this is hard means you\'re growing. Keep going — you\'re closer than you think!' },
    ],
  },

  _interventionIndex: { bored: 0, distracted: 0, confused: 0, frustrated: 0 },

  // --- Voice AI for Frustration ---
  triggerFrustrationAI() {
    if (this.frustrationPopupActive || this.popupDismissed) return;
    this.frustrationPopupActive = true;

    const popup = document.getElementById('sf-frustration-popup');
    if (!popup) return;

    popup.classList.remove('sf-hidden');

    const historyEl = document.getElementById('sf-frust-chat-history');
    if (historyEl) historyEl.innerHTML = '';

    const greetings = {
      en: "It looks like you are feeling a bit frustrated. Do you need any help? Just speak to tell me what's bothering you!",
      hi: "ऐसा लगता है कि आप थोड़े परेशान हैं। क्या आपको कोई मदद चाहिए? बस बोलकर मुझे बताएं कि आपको क्या समस्या है!",
      mr: "असे वाटते की आपण थोडे निराश आहात. आपल्याला काही मदत हवी आहे का? फक्त बोलून मला सांगा की काय अडचण आहे!",
      or: "ଲାଗୁଛି ଆପଣ ଟିକେ ବିରକ୍ତ ଅଛନ୍ତି | ଆପଣଙ୍କୁ କୌଣସି ସାହାଯ୍ୟ ଦରକାର କି? କେବଳ କହିକରି ମୋତେ ଜଣାନ୍ତୁ ଆପଣଙ୍କର ଅସୁବିଧା କଣ!"
    };

    const text = greetings[currentLanguage] || greetings.en;

    // Show AI bubble
    const aiBubble = document.createElement('div');
    aiBubble.className = 'sf-chat-bubble ai-bubble';
    aiBubble.id = 'sf-frust-ai-text';
    aiBubble.textContent = text;
    if (historyEl) historyEl.appendChild(aiBubble);

    const statusEl = document.getElementById('sf-frust-status-text');
    if (statusEl) statusEl.innerHTML = "🤖 <span>AI is speaking...</span>";
    
    const pulseEl = document.querySelector('.sf-frust-pulse');
    if (pulseEl) pulseEl.style.display = 'block';

    // Disable mic button during AI speech to prevent collision
    const micBtn = document.getElementById('sf-frust-mic-btn');
    if (micBtn) micBtn.disabled = true;

    this.speakTextWithCallback(text, currentLanguage, () => {
      if (micBtn) micBtn.disabled = false;
      if (statusEl) statusEl.innerHTML = "🎤 <span>Listening...</span>";
      // Delay speech recognition by 500ms to allow audio output stream to release/close
      setTimeout(() => this.startSpeechRecognition(), 500);
    });
  },

  closeFrustrationAI() {
    this.stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const popup = document.getElementById('sf-frustration-popup');
    if (popup) popup.classList.add('sf-hidden');

    this.frustrationPopupActive = false;
    this.popupDismissed = true;

    // 2 minutes cooldown before AI pops up again
    setTimeout(() => {
      this.popupDismissed = false;
    }, 120000);
  },

  speakTextWithCallback(text, lang, callback) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (!window.speechSynthesis) {
      if (callback) callback();
      return;
    }
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const targetLanguages = langVoiceMap[lang] || ['en-US'];

    let selectedVoice = null;
    for (const targetLang of targetLanguages) {
      selectedVoice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
      if (selectedVoice) break;
    }

    if (!selectedVoice) {
      const langPrefix = lang.split('-')[0].toLowerCase();
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (callback) callback();
    };

    utterance.onerror = () => {
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  },

  startSpeechRecognition() {
    // If already listening, treat clicking mic as a toggle to stop listening
    if (this.frustIsListening) {
      this.stopSpeechRecognition();
      const statusEl = document.getElementById('sf-frust-status-text');
      if (statusEl) statusEl.innerHTML = "😊 <span>Ready</span>";
      return;
    }

    this.stopSpeechRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("⚠️ Speech recognition is not supported in this browser.");
      return;
    }

    this.frustRecognition = new SpeechRecognition();
    this.frustRecognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'te' ? 'or-IN' : 'en-US';
    this.frustRecognition.interimResults = false;

    this.frustRecognition.onstart = () => {
      this.frustIsListening = true;
      const statusEl = document.getElementById('sf-frust-status-text');
      if (statusEl) statusEl.innerHTML = "🎤 <span>Listening...</span>";
      const waveEl = document.getElementById('sf-frust-wave');
      if (waveEl) waveEl.classList.remove('hidden');
      const micBtn = document.getElementById('sf-frust-mic-btn');
      if (micBtn) {
        micBtn.innerHTML = '🛑 Stop';
        micBtn.classList.add('active');
      }
    };

    this.frustRecognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      if (!speechResult) return;

      this.stopSpeechRecognition();

      // Append student query bubble
      const historyEl = document.getElementById('sf-frust-chat-history');
      if (historyEl) {
        const studentBubble = document.createElement('div');
        studentBubble.className = 'sf-chat-bubble student-bubble';
        studentBubble.textContent = speechResult;
        historyEl.appendChild(studentBubble);
        historyEl.scrollTop = historyEl.scrollHeight;
      }

      const statusEl = document.getElementById('sf-frust-status-text');
      if (statusEl) statusEl.innerHTML = "🧠 <span>Thinking...</span>";

      // Call API with active lesson content context if available
      let lessonTitle = '';
      let lessonContent = '';
      if (typeof currentLessonId !== 'undefined' && currentLessonId) {
        const activeLessonEl = document.getElementById('lesson-title-display') || document.querySelector('.lesson-card.active .lesson-title');
        if (activeLessonEl) lessonTitle = activeLessonEl.textContent.trim();
        const activeContentEl = document.getElementById('lesson-body-content');
        if (activeContentEl) lessonContent = activeContentEl.textContent.trim().substring(0, 500);
      }

      try {
        const res = await api('/api/chat', 'POST', {
          message: speechResult,
          language: currentLanguage,
          lessonTitle,
          lessonContent
        });

        if (res && res.reply) {
          if (historyEl) {
            const aiBubble = document.createElement('div');
            aiBubble.className = 'sf-chat-bubble ai-bubble';
            aiBubble.textContent = res.reply;
            historyEl.appendChild(aiBubble);
            historyEl.scrollTop = historyEl.scrollHeight;
          }

          if (statusEl) statusEl.innerHTML = "🤖 <span>AI speaking...</span>";
          
          const micBtn = document.getElementById('sf-frust-mic-btn');
          if (micBtn) micBtn.disabled = true;

          // Introduce a short delay before AI speaks the answer to make sure the microphone is fully released
          setTimeout(() => {
            this.speakTextWithCallback(res.reply, currentLanguage, () => {
              if (micBtn) micBtn.disabled = false;
              if (statusEl) statusEl.innerHTML = "😊 <span>Help active</span>";
            });
          }, 300);
        } else {
          throw new Error("No response");
        }
      } catch (err) {
        console.error("Assistant chat error:", err);
        if (statusEl) statusEl.innerHTML = "⚠️ <span>Error getting answer</span>";
      }
    };

    this.frustRecognition.onend = () => {
      this.frustIsListening = false;
      const waveEl = document.getElementById('sf-frust-wave');
      if (waveEl) waveEl.classList.add('hidden');
      const micBtn = document.getElementById('sf-frust-mic-btn');
      if (micBtn) {
        micBtn.innerHTML = '🎤 Tap to Talk';
        micBtn.classList.remove('active');
      }
      const statusEl = document.getElementById('sf-frust-status-text');
      if (statusEl && statusEl.textContent.includes("Listening")) {
        statusEl.innerHTML = "😊 <span>Help active</span>";
      }
    };

    this.frustRecognition.onerror = (event) => {
      console.error("Frustration mic error:", event.error);
      const statusEl = document.getElementById('sf-frust-status-text');
      if (statusEl) {
        if (event.error === 'not-allowed') {
          statusEl.innerHTML = "⚠️ <span>Mic blocked</span>";
          showToast("🎙️ Mic permission blocked. Please allow mic in settings.");
        } else if (event.error === 'no-speech') {
          statusEl.innerHTML = "⚠️ <span>No speech heard</span>";
        } else {
          statusEl.innerHTML = `⚠️ <span>Mic error: ${event.error}</span>`;
        }
      }
      this.stopSpeechRecognition();
    };

    this.frustRecognition.start();
  },

  stopSpeechRecognition() {
    if (this.frustRecognition) {
      try {
        this.frustRecognition.stop();
      } catch (e) {}
      this.frustRecognition = null;
    }
    this.frustIsListening = false;
    const waveEl = document.getElementById('sf-frust-wave');
    if (waveEl) waveEl.classList.add('hidden');
    const micBtn = document.getElementById('sf-frust-mic-btn');
    if (micBtn) {
      micBtn.innerHTML = '🎤 Tap to Talk';
      micBtn.classList.remove('active');
    }
  },

  toggleManualInput() {
    const inputRow = document.getElementById('sf-frust-input-row');
    if (inputRow) {
      inputRow.classList.toggle('hidden');
      if (!inputRow.classList.contains('hidden')) {
        const txtInp = document.getElementById('sf-frust-text-input');
        if (txtInp) txtInp.focus();
      }
    }
  },

  handleManualInputKey(event) {
    if (event.key === 'Enter') {
      this.submitManualInput();
    }
  },

  async submitManualInput() {
    const inputEl = document.getElementById('sf-frust-text-input');
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    const inputRow = document.getElementById('sf-frust-input-row');
    if (inputRow) inputRow.classList.add('hidden');

    this.stopSpeechRecognition();

    const historyEl = document.getElementById('sf-frust-chat-history');
    if (historyEl) {
      const studentBubble = document.createElement('div');
      studentBubble.className = 'sf-chat-bubble student-bubble';
      studentBubble.textContent = text;
      historyEl.appendChild(studentBubble);
      historyEl.scrollTop = historyEl.scrollHeight;
    }

    const statusEl = document.getElementById('sf-frust-status-text');
    if (statusEl) statusEl.innerHTML = "🧠 <span>Thinking...</span>";

    let lessonTitle = '';
    let lessonContent = '';
    if (typeof currentLessonId !== 'undefined' && currentLessonId) {
      const activeLessonEl = document.getElementById('lesson-title-display') || document.querySelector('.lesson-card.active .lesson-title');
      if (activeLessonEl) lessonTitle = activeLessonEl.textContent.trim();
      const activeContentEl = document.getElementById('lesson-body-content');
      if (activeContentEl) lessonContent = activeContentEl.textContent.trim().substring(0, 500);
    }

    try {
      const res = await api('/api/chat', 'POST', {
        message: text,
        language: currentLanguage,
        lessonTitle,
        lessonContent
      });

      if (res && res.reply) {
        if (historyEl) {
          const aiBubble = document.createElement('div');
          aiBubble.className = 'sf-chat-bubble ai-bubble';
          aiBubble.textContent = res.reply;
          historyEl.appendChild(aiBubble);
          historyEl.scrollTop = historyEl.scrollHeight;
        }

        if (statusEl) statusEl.innerHTML = "🤖 <span>AI speaking...</span>";

        const micBtn = document.getElementById('sf-frust-mic-btn');
        if (micBtn) micBtn.disabled = true;

        this.speakTextWithCallback(res.reply, currentLanguage, () => {
          if (micBtn) micBtn.disabled = false;
          if (statusEl) statusEl.innerHTML = "😊 <span>Help active</span>";
        });
      } else {
        throw new Error("No response");
      }
    } catch (err) {
      console.error("Assistant chat error:", err);
      if (statusEl) statusEl.innerHTML = "⚠️ <span>Error getting answer</span>";
    }
  },

  // --- Init: start camera stream ---
  async startCamera() {
    // 1. Secure context check
    if (window.isSecureContext === false || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[SmartFocus] Insecure Context or mediaDevices API missing.');
      this.showTroubleshootModal('INSECURE_CONTEXT');
      return false;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false,
      });
      const video = document.getElementById('focus-camera-feed');
      video.srcObject = this.stream;
      await video.play();
      return true;
    } catch (err) {
      console.error('[SmartFocus] Camera error:', err);
      this.showTroubleshootModal(err.name || 'GenericError');
      return false;
    }
  },

  // --- Stop camera stream ---
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    const video = document.getElementById('focus-camera-feed');
    if (video) video.srcObject = null;
  },

  // --- Capture a frame as base64 JPEG ---
  captureFrame() {
    const video = document.getElementById('focus-camera-feed');
    const canvas = document.getElementById('focus-camera-canvas');
    if (!video || !canvas || !video.videoWidth) return null;
    const ctx = canvas.getContext('2d');
    // Flip horizontally to match mirror display
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.7);
  },

  // --- Send frame to API and get emotion back ---
  async analyseFrame() {
    if (!this.active || !currentToken) return;
    if (!navigator.onLine) {
      this.setStatus('active', 'Focus AI (Offline) 🧠');
      return;
    }
    const now = Date.now();
    if (now - this.lastAnalysisTime < this.ANALYSIS_INTERVAL_MS) return;
    this.lastAnalysisTime = now;

    const imageBase64 = this.captureFrame();
    if (!imageBase64) return;

    this.setStatus('analysing', 'Analysing...');
    try {
      const response = await fetch('/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      this.onEmotionResult(data);
    } catch (err) {
      console.error('[SmartFocus] analyse error:', err.message);
      this.setStatus('idle', 'Reconnecting...');
    }
  },

  // --- Load local facefinder cascade model ---
  async loadCascade() {
    if (this.cascadeLoaded) return true;
    try {
      this.setStatus('warning', 'Loading Offline AI...');
      const response = await fetch('/js/facefinder');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const bytes = new Int8Array(buffer);
      this.classifyRegion = pico.unpack_cascade(bytes);
      this.cascadeLoaded = true;
      console.log('[SmartFocus] Local Pico.js facefinder cascade loaded.');
      return true;
    } catch (err) {
      console.error('[SmartFocus] Error loading facefinder cascade:', err);
      return false;
    }
  },

  // --- Run Local Offline-first Tracking tick (1Hz) ---
  runLocalTrackingTick() {
    const video = document.getElementById('focus-camera-feed');
    const canvas = document.getElementById('focus-camera-canvas');
    if (!video || !canvas || !video.videoWidth || !this.classifyRegion) return;

    const ctx = canvas.getContext('2d');
    // Mirror draw to match local video feedback
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const nrows = canvas.height;
    const ncols = canvas.width;

    // Convert RGBA to Grayscale
    const pixels = new Uint8Array(nrows * ncols);
    const rgba = imgData.data;
    for (let i = 0; i < nrows * ncols; ++i) {
      pixels[i] = (299 * rgba[4 * i] + 587 * rgba[4 * i + 1] + 114 * rgba[4 * i + 2]) / 1000;
    }

    const image = {
      pixels: pixels,
      nrows: nrows,
      ncols: ncols,
      ldim: ncols
    };

    const params = {
      shiftfactor: 0.1,
      minsize: 50,
      maxsize: 150,
      scalefactor: 1.1
    };

    let detections = pico.run_cascade(image, this.classifyRegion, params);
    detections = pico.cluster_detections(detections, 0.2);

    // q > 4.0 is face detection confidence threshold
    const face = detections.find(d => d[3] > 4.0);
    this.processLocalFaceDetection(face, canvas.width, canvas.height);
  },

  // --- Run offline geometry heuristics ---
  processLocalFaceDetection(face, width, height) {
    let currentEmotion = 'focused';
    let currentEngagement = 'high';
    let explanation = '🎯 Focused and centered';

    if (!face) {
      this.noFaceCounter++;
      this.slouchCounter = 0;
      this.turnCounter = 0;

      if (this.noFaceCounter >= 3) {
        currentEmotion = 'distracted';
        currentEngagement = 'low';
        explanation = '👀 Face missing (looking away)';
      } else {
        currentEmotion = this.currentEmotion;
        currentEngagement = this.currentEngagement;
        explanation = 'Searching for face...';
      }
    } else {
      this.noFaceCounter = 0;
      const [y, x, s, q] = face;

      // Keep running center point history
      this.faceCenterHistory.push({ x, y, s });
      if (this.faceCenterHistory.length > 8) {
        this.faceCenterHistory.shift();
      }

      let avgX = 0, avgY = 0, avgS = 0;
      this.faceCenterHistory.forEach(p => { avgX += p.x; avgY += p.y; avgS += p.s; });
      avgX /= this.faceCenterHistory.length;
      avgY /= this.faceCenterHistory.length;
      avgS /= this.faceCenterHistory.length;

      // First few ticks are used to calibrate baseline
      if (!this.calibratedCenter) {
        if (this.faceCenterHistory.length >= 4) {
          this.calibratedCenter = { x: avgX, y: avgY, s: avgS };
          console.log('[SmartFocus] Baseline calibrated:', this.calibratedCenter);
        }
        this.updateLocalUI('focused', 'high', '🧠 Calibrating Baseline...');
        return;
      }

      const xDiff = Math.abs(x - this.calibratedCenter.x);
      const yDiff = y - this.calibratedCenter.y;

      const xThreshold = width * 0.16; // 16% horizontal deviation
      const yThreshold = height * 0.18; // 18% vertical drop

      if (xDiff > xThreshold) {
        this.turnCounter++;
      } else {
        this.turnCounter = Math.max(0, this.turnCounter - 1);
      }

      if (yDiff > yThreshold) {
        this.slouchCounter++;
      } else {
        this.slouchCounter = Math.max(0, this.slouchCounter - 1);
      }

      if (this.turnCounter >= 3) {
        currentEmotion = 'distracted';
        currentEngagement = 'low';
        explanation = '👀 Gaze diverted (looking side)';
      } else if (this.slouchCounter >= 4) {
        currentEmotion = 'bored';
        currentEngagement = 'low';
        explanation = '😴 Slouching or drowsiness detected';
      } else {
        // Face is present and centered!
        // If we are online and have a fresh online AI result (less than 25s ago), preserve it!
        const timeSinceOnline = Date.now() - this.lastOnlineAnalysisTime;
        if (navigator.onLine && timeSinceOnline < 25000 && this.currentEmotion && this.currentEmotion !== 'distracted' && this.currentEmotion !== 'bored') {
          currentEmotion = this.currentEmotion;
          currentEngagement = this.currentEngagement;
          explanation = '🧠 Focus AI tracking active';
        } else {
          currentEmotion = 'focused';
          currentEngagement = 'high';
          explanation = '🎯 Attentive';
        }
      }
    }

    this.currentEmotion = currentEmotion;
    this.currentEngagement = currentEngagement;

    // Update distraction vignette overlay
    const overlay = document.getElementById('sf-distraction-overlay');
    if (overlay) {
      if (currentEmotion === 'distracted') {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    }

    // 1. Update UI dot and badge immediately for smooth, responsive feedback
    this.updateLocalUI(currentEmotion, currentEngagement, explanation);
    if (currentEmotion === 'distracted' || currentEmotion === 'bored') {
      if (this.lastTriggeredEmotion !== currentEmotion) {
        this.lastTriggeredEmotion = currentEmotion;
        console.log(`[SmartFocus] Stable physical event detected: ${currentEmotion}. Triggering adaptation.`);
        this.applyAdaptiveLogic(currentEmotion, currentEngagement);
      }
    } else {
      // Recovered/Stable centered state
      if (this.lastTriggeredEmotion) {
        console.log('[SmartFocus] Student returned to focus. Resetting trigger locks.');
        this.lastTriggeredEmotion = null;
        // Revert game engine difficulty to normal if they were in a bad state
        this.applyAdaptiveLogic(currentEmotion, currentEngagement);
      }
    }
  },

  // --- Real-time Local UI updates ---
  updateLocalUI(emotion, engagement, explanation) {
    const badge = document.getElementById('sf-emotion-badge');
    if (badge) {
      const emoji = this.EMOTION_EMOJI[emotion] || '😐';
      const label = navigator.onLine ? emotion : `${emotion} (Offline)`;
      badge.textContent = `${emoji} ${label.charAt(0).toUpperCase() + label.slice(1)}`;
      badge.className = `sf-emotion-badge ${emotion}`;
    }

    const dotClass = engagement === 'high' ? 'active' : engagement === 'medium' ? 'warning' : 'alert';
    const dot = document.getElementById('sf-status-dot');
    const statusText = document.getElementById('sf-status-text');
    if (dot) {
      dot.className = `sf-status-dot ${dotClass}`;
    }
    if (statusText) statusText.textContent = explanation;
  },


  // --- Handle analysis result ---
  onEmotionResult(data) {
    const { emotion, engagement, explanation } = data;
    this.currentEmotion = emotion;
    this.currentEngagement = engagement;
    if (navigator.onLine) {
      this.lastOnlineAnalysisTime = Date.now();
    }

    // Update badge
    const badge = document.getElementById('sf-emotion-badge');
    if (badge) {
      const emoji = this.EMOTION_EMOJI[emotion] || '😐';
      badge.textContent = `${emoji} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
      badge.className = `sf-emotion-badge ${emotion}`;
    }

    // Set status dot
    const dotClass = engagement === 'high' ? 'active' : engagement === 'medium' ? 'warning' : 'alert';
    this.setStatus(dotClass, explanation || emotion);

    // Adaptive logic
    this.applyAdaptiveLogic(emotion, engagement);
  },

  // --- Core adaptive logic ---
  applyAdaptiveLogic(emotion, engagement) {
    const lowEngaged = engagement === 'low';
    const highEngaged = engagement === 'high';

    if (lowEngaged) {
      this.consecutiveLowEngagement++;
    } else {
      this.consecutiveLowEngagement = Math.max(0, this.consecutiveLowEngagement - 1);
    }

    if (emotion === 'confused' || emotion === 'frustrated') {
      this.consecutiveConfused++;
    } else {
      this.consecutiveConfused = Math.max(0, this.consecutiveConfused - 1);
    }

    // Calm pulse overlay for frustrated/distracted
    if (emotion === 'frustrated' || emotion === 'distracted') {
      document.body.classList.add('sf-calm-pulse');
      setTimeout(() => document.body.classList.remove('sf-calm-pulse'), 6000);
    }

    // Difficulty adaptation
    if (this.consecutiveConfused >= this.CONFUSED_THRESHOLD && this.quizDifficultyLevel !== 'easy') {
      this.quizDifficultyLevel = 'easy';
      this.showAdaptiveBanner('easier', '🧩 Switching to easier questions — take your time!');
    } else if (highEngaged && emotion === 'focused' && this.quizDifficultyLevel !== 'hard') {
      this.quizDifficultyLevel = 'hard';
      this.showAdaptiveBanner('harder', '🚀 You\'re on fire! Levelling up the challenge!');
    } else if (highEngaged && this.quizDifficultyLevel === 'easy') {
      this.quizDifficultyLevel = 'normal';
      this.showAdaptiveBanner('focus', '✅ Back to standard difficulty — great recovery!');
    }

    // Engagement intervention popup (bored/distracted/frustrated/confused)
    if (emotion === 'frustrated') {
      this.triggerFrustrationAI();
    } else if (this.consecutiveLowEngagement >= this.LOW_ENGAGEMENT_THRESHOLD && !this.popupDismissed) {
      this.triggerIntervention(emotion);
      this.consecutiveLowEngagement = 0;
    } else if (this.consecutiveConfused >= this.CONFUSED_THRESHOLD && !this.popupDismissed) {
      this.triggerIntervention(emotion);
      this.consecutiveConfused = 0;
    }
  },

  // --- Show intervention popup ---
  triggerIntervention(emotion) {
    const category = ['bored','distracted','confused','frustrated'].includes(emotion) ? emotion : 'distracted';
    const messages = this.INTERVENTIONS[category];
    if (!messages) return;

    const idx = this._interventionIndex[category] % messages.length;
    this._interventionIndex[category]++;
    const msg = messages[idx];

    document.getElementById('sf-popup-icon').textContent = msg.icon;
    document.getElementById('sf-popup-title').textContent = msg.title;
    document.getElementById('sf-popup-body').textContent = msg.body;
    document.getElementById('sf-engagement-popup').classList.remove('sf-hidden');

    // Auto-dismiss after 15s
    setTimeout(() => this.dismissEngagementPopup(), 15000);
  },

  dismissEngagementPopup() {
    document.getElementById('sf-engagement-popup').classList.add('sf-hidden');
    this.popupDismissed = true;
    // Allow new popups after 2 minutes
    setTimeout(() => { this.popupDismissed = false; }, 120000);
  },

  // --- Show adaptive difficulty banner ---
  showAdaptiveBanner(type, message) {
    const quizContainer = document.getElementById('quiz-screen') || document.getElementById('screen-home');
    if (!quizContainer) return;

    const existing = document.getElementById('sf-adaptive-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'sf-adaptive-banner';
    banner.className = `sf-adaptive-banner ${type}`;
    banner.textContent = message;

    quizContainer.insertAdjacentElement('afterbegin', banner);
    setTimeout(() => banner.remove(), 5000);
  },

  // --- Update status indicator in widget ---
  setStatus(dotClass, text) {
    const dot = document.getElementById('sf-status-dot');
    const statusText = document.getElementById('sf-status-text');
    if (dot) {
      dot.className = `sf-status-dot ${dotClass === 'analysing' ? 'warning' : dotClass === 'idle' ? '' : dotClass}`;
    }
    if (statusText) statusText.textContent = text;
  },

  // --- Start continuous analysis loop ---
  startLoop() {
    this.analysisInterval = setInterval(() => this.analyseFrame(), this.ANALYSIS_INTERVAL_MS);
    this.localInterval = setInterval(() => this.runLocalTrackingTick(), 1000);
    // Run first analysis after a 5s warm-up
    setTimeout(() => this.analyseFrame(), 5000);
  },

  stopLoop() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    if (this.localInterval) {
      clearInterval(this.localInterval);
      this.localInterval = null;
    }
  },

  // --- Full start ---
  async start() {
    const loaded = await this.loadCascade();
    if (!loaded) {
      showToast('⚠️ Could not initialize offline tracker cascade model.', 4000);
    }
    const started = await this.startCamera();
    if (!started) return false;
    this.active = true;
    this.consecutiveLowEngagement = 0;
    this.consecutiveConfused = 0;
    this.quizDifficultyLevel = 'normal';
    this.popupDismissed = false;
    this.lastAnalysisTime = 0;

    // Reset local tracking values
    this.faceCenterHistory = [];
    this.calibratedCenter = null;
    this.noFaceCounter = 0;
    this.turnCounter = 0;
    this.slouchCounter = 0;
    this.localStatesBuffer = [];

    // Reset enhanced focus tracking
    this.distractionEvents = 0;
    this.longestFocusStreak = 0;
    this.currentFocusStreak = 0;
    this.focusXpAwarded = 0;
    this.wasDistracted = false;
    this.milestonesFired = new Set();

    document.getElementById('smart-focus-widget').classList.remove('sf-hidden');
    this.setStatus('active', 'Focus AI active 🧠');
    this.startLoop();

    // If we are currently in a lesson/quiz, start/resume the session timer
    const activeScreenEl = document.querySelector('.inner-screen.active');
    const activeScreen = activeScreenEl ? activeScreenEl.id.replace('screen-', '') : '';
    if ((activeScreen === 'lesson' || activeScreen === 'quiz') && this.currentLessonId) {
      this.startFocusSession(this.currentLessonId);
    }

    return true;
  },

  // --- Full stop ---
  stop() {
    // Show session summary before stopping
    this.showSessionSummary();
    this.active = false;
    this.stopLoop();
    this.stopCamera();
    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerInterval = null;
    }
    this.syncFocusData();
    const overlay = document.getElementById('sf-distraction-overlay');
    if (overlay) {
      overlay.classList.remove('active', 'sf-distraction-flash');
    }
    document.getElementById('smart-focus-widget').classList.add('sf-hidden');
    document.getElementById('sf-engagement-popup').classList.add('sf-hidden');
    const frustPopup = document.getElementById('sf-frustration-popup');
    if (frustPopup) frustPopup.classList.add('sf-hidden');
    this.stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    document.body.classList.remove('sf-calm-pulse');
    const badge = document.getElementById('sf-emotion-badge');
    if (badge) { badge.textContent = '😊 Ready'; badge.className = 'sf-emotion-badge'; }
  },

  startFocusSession(lessonId) {
    // If it's a different lesson, sync the previous lesson's data first
    if (this.currentLessonId && this.currentLessonId !== lessonId) {
      this.syncFocusData();
    }

    this.currentLessonId = lessonId;
    this.sessionFocusSeconds = 0;
    this.sessionDistractedSeconds = 0;
    this.continuousFocusSeconds = 0;
    this.distractionEvents = 0;
    this.longestFocusStreak = 0;
    this.currentFocusStreak = 0;
    this.focusXpAwarded = 0;
    this.wasDistracted = false;
    this.milestonesFired = new Set();

    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
    }

    // Always start the interval loop for the active lesson session
    this.sessionTimerInterval = setInterval(() => {
      if (this.active) {
        this.onSessionTimerTick();
      }
    }, 1000);

    // Init streak ring display
    const timerWrap = document.getElementById('sf-timer-text');
    if (timerWrap) {
      timerWrap.textContent = '⏱️ 00:00';
    }
    // Update distraction counter to 0
    this.updateDistractionCounter();
  },

  onSessionTimerTick() {
    if (!this.active || !this.currentLessonId) return;

    const isDistracted = (this.currentEmotion === 'distracted' || this.currentEmotion === 'bored');

    if (isDistracted) {
      this.sessionDistractedSeconds++;
      this.continuousFocusSeconds = 0;

      // Distraction ONSET: was focused before, now distracted
      if (!this.wasDistracted) {
        this.onDistractionOnset();
      }
      this.wasDistracted = true;
    } else {
      this.sessionFocusSeconds++;
      this.continuousFocusSeconds++;
      this.currentFocusStreak++;

      // Track longest streak
      if (this.currentFocusStreak > this.longestFocusStreak) {
        this.longestFocusStreak = this.currentFocusStreak;
      }

      this.wasDistracted = false;

      // Legacy 60-second XP spark
      if (this.continuousFocusSeconds >= 60) {
        this.continuousFocusSeconds = 0;
        this.awardFocusXP();
      }

      // Check focus milestones (5/10/15 min)
      this.checkFocusMilestones();
    }

    // Update visual streak ring
    this.updateStreakRing();
  },

  formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // --- Web Audio beep for distraction alert ---
  playDistractionBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch(e) { /* Audio not supported */ }
  },

  // --- Distraction event: fires once on onset ---
  onDistractionOnset() {
    this.distractionEvents++;
    this.currentFocusStreak = 0;

    // Flash overlay + sound
    const overlay = document.getElementById('sf-distraction-overlay');
    if (overlay) {
      overlay.classList.add('active', 'sf-distraction-flash');
      setTimeout(() => overlay.classList.remove('sf-distraction-flash'), 800);
    }
    this.playDistractionBeep();

    // Update distraction counter badge
    this.updateDistractionCounter();

    // Show toast
    if (typeof showToast === 'function') {
      showToast(`👀 Stay focused! Distraction #${this.distractionEvents} recorded.`, 3500);
    }
  },

  // --- Update distraction counter in widget ---
  updateDistractionCounter() {
    const el = document.getElementById('sf-distraction-count');
    if (el) {
      el.textContent = this.distractionEvents;
      el.parentElement.classList.toggle('sf-distract-warn', this.distractionEvents >= 5);
    }
  },

  // --- Focus streak ring color update ---
  updateStreakRing() {
    const ringEl = document.getElementById('sf-streak-ring-fill');
    const timerEl = document.getElementById('sf-timer-text');
    const streakSec = this.currentFocusStreak;
    const streakMin = streakSec / 60;

    let color, label;
    if (streakMin < 2)       { color = '#6b7280'; label = `⏱️ ${this.formatTime(this.sessionFocusSeconds)}`; }
    else if (streakMin < 5)  { color = '#f59e0b'; label = `🟡 ${this.formatTime(this.sessionFocusSeconds)}`; }
    else if (streakMin < 10) { color = '#22c55e'; label = `🟢 ${this.formatTime(this.sessionFocusSeconds)}`; }
    else                     { color = '#a855f7'; label = `💜 ${this.formatTime(this.sessionFocusSeconds)}`; }

    if (ringEl) {
      ringEl.style.stroke = color;
      // Progress around ring: max visual at 15 min
      const circumference = 2 * Math.PI * 18; // r=18
      const progress = Math.min(streakSec / 900, 1); // 900s = 15min
      ringEl.style.strokeDashoffset = circumference * (1 - progress);
    }
    if (timerEl) timerEl.textContent = label;
  },

  // --- Focus Milestone Reward ---
  async checkFocusMilestones() {
    const streakMin = Math.floor(this.currentFocusStreak / 60);
    const milestones = [
      { min: 5,  xp: 10, label: '🔥 5-Min Streak!',          badge: 'streak-5',  color: '#f59e0b' },
      { min: 10, xp: 20, label: '⚡ 10-Min Focus Warrior!',  badge: 'streak-10', color: '#22c55e' },
      { min: 15, xp: 30, label: '🧠 Deep Focus Champion!',   badge: 'streak-15', color: '#a855f7' },
    ];

    for (const m of milestones) {
      if (streakMin >= m.min && !this.milestonesFired.has(m.badge)) {
        this.milestonesFired.add(m.badge);
        this.focusXpAwarded += m.xp;
        gameXpTotal = (typeof gameXpTotal !== 'undefined' ? gameXpTotal : 0);
        // Award XP
        try {
          const result = await api('/api/profile/xp', 'POST', { xp: m.xp });
          if (currentUser) {
            currentUser.xp = result.totalXP;
            currentUser.level = Math.floor(result.totalXP / 200) + 1;
            if (typeof updateNavStats === 'function') updateNavStats();
          }
        } catch(e) { console.error('[SmartFocus] milestone XP error', e); }

        // Show animated milestone badge
        this.showMilestoneBadge(m.label, m.color, m.xp);
        break; // Only one milestone per tick
      }
    }
  },

  // --- Show animated milestone floating badge ---
  showMilestoneBadge(label, color, xp) {
    const el = document.createElement('div');
    el.className = 'sf-milestone-badge';
    el.style.borderColor = color;
    el.style.color = color;
    el.innerHTML = `<span style="font-size:1.2rem;">${label}</span><br><span style="font-size:0.85rem;font-weight:600;">+${xp} XP Focus Reward!</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
    if (typeof showToast === 'function') showToast(`${label} +${xp} XP!`, 3000);
  },

  // --- Session end summary modal ---
  showSessionSummary() {
    const fMin = Math.round(this.sessionFocusSeconds / 60 * 10) / 10;
    const dMin = Math.round(this.sessionDistractedSeconds / 60 * 10) / 10;
    const total = this.sessionFocusSeconds + this.sessionDistractedSeconds;
    const eff = total > 0 ? Math.round(this.sessionFocusSeconds / total * 100) : 100;
    const bestStreakMin = Math.floor(this.longestFocusStreak / 60);
    const bestStreakSec = this.longestFocusStreak % 60;
    const effColor = eff >= 75 ? '#22c55e' : eff >= 50 ? '#f59e0b' : '#ef4444';
    const effLabel = eff >= 75 ? '🟢 Great Focus!' : eff >= 50 ? '🟡 Fair Focus' : '🔴 Needs Improvement';

    // Only show if there was some tracked time
    if (total < 10) return;

    const modal = document.createElement('div');
    modal.id = 'sf-session-summary';
    modal.className = 'sf-session-summary-overlay';
    modal.innerHTML = `
      <div class="sf-session-summary-box">
        <div class="sf-summary-header">
          <span style="font-size:1.8rem;">📊</span>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Session Focus Report</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">How focused were you this lesson?</div>
          </div>
          <span style="margin-left:auto;font-size:0.9rem;font-weight:700;color:${effColor};">${effLabel}</span>
        </div>

        <div class="sf-summary-stats">
          <div class="sf-summary-stat">
            <div class="sf-stat-val" style="color:#22c55e;">⏱️ ${fMin}m</div>
            <div class="sf-stat-label">Focus Time</div>
          </div>
          <div class="sf-summary-stat">
            <div class="sf-stat-val" style="color:#ef4444;">👀 ${this.distractionEvents}</div>
            <div class="sf-stat-label">Distractions</div>
          </div>
          <div class="sf-summary-stat">
            <div class="sf-stat-val" style="color:#a855f7;">🏆 ${bestStreakMin}m ${bestStreakSec}s</div>
            <div class="sf-stat-label">Best Streak</div>
          </div>
          <div class="sf-summary-stat">
            <div class="sf-stat-val" style="color:#f59e0b;">⚡ ${this.focusXpAwarded} XP</div>
            <div class="sf-stat-label">Focus XP Earned</div>
          </div>
        </div>

        <div class="sf-summary-bar-wrap">
          <div class="sf-summary-bar-label">
            <span style="color:#22c55e;">Focus ${eff}%</span>
            <span style="color:#ef4444;">Distracted ${100-eff}%</span>
          </div>
          <div class="sf-summary-bar-track">
            <div class="sf-summary-bar-focus" style="width:${eff}%;background:${effColor};"></div>
          </div>
        </div>

        <div class="sf-summary-actions">
          <button class="sf-summary-btn-secondary" onclick="showScreen('my-focus');document.getElementById('sf-session-summary').remove();">
            📈 View My History
          </button>
          <button class="sf-summary-btn-primary" onclick="document.getElementById('sf-session-summary').remove();">
            Close ✕
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  },

  async awardFocusXP() {
    try {
      // Award +5 XP via the API
      const result = await api('/api/profile/xp', 'POST', { xp: 5 });
      if (currentUser) {
        currentUser.xp = result.totalXP;
        currentUser.level = Math.floor(result.totalXP / 200) + 1;
        updateNavStats();
      }
      
      // Update home screen XP bar if home is currently active
      if (document.getElementById('screen-home').classList.contains('active')) {
        loadHome();
      }

      // Show floaty XP notification
      this.showFloatyXP('+5 XP Focus Spark! ⚡');
      showToast('⚡ Focus Spark: +5 XP! Keep focusing!');
    } catch (err) {
      console.error('[SmartFocus] Error awarding focus XP:', err);
    }
  },

  showFloatyXP(text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'sf-xp-reward-float';
    floatEl.textContent = text;
    
    // Position it in the center of the viewport, or slightly randomized around the center
    const x = window.innerWidth / 2 - 100 + Math.random() * 50;
    const y = window.innerHeight / 2 - 50 + Math.random() * 50;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    
    document.body.appendChild(floatEl);
    
    // Automatically remove it after the animation completes (1.8s)
    setTimeout(() => {
      floatEl.remove();
    }, 1800);
  },

  async syncFocusData() {
    if (!this.currentLessonId) return;
    const fSec = this.sessionFocusSeconds;
    const dSec = this.sessionDistractedSeconds;
    if (fSec === 0 && dSec === 0) return;

    // Snapshot new fields before reset
    const dEvt    = this.distractionEvents;
    const lStreak = this.longestFocusStreak;
    const fXp     = this.focusXpAwarded;

    // Reset session stats immediately to avoid double-sync
    this.sessionFocusSeconds = 0;
    this.sessionDistractedSeconds = 0;
    this.distractionEvents = 0;
    this.focusXpAwarded = 0;

    try {
      await api('/api/focus/sync', 'POST', {
        lesson_id:            this.currentLessonId,
        focus_seconds:        fSec,
        distracted_seconds:   dSec,
        distraction_events:   dEvt,
        longest_focus_streak: lStreak,
        focus_xp_awarded:     fXp,
      });
      console.log(`[SmartFocus] Synced focus=${fSec}s distract=${dSec}s events=${dEvt} streak=${lStreak}s xp=${fXp}`);
    } catch (err) {
      console.error('[SmartFocus] Error syncing focus metrics:', err);
      // Restore values on sync failure
      this.sessionFocusSeconds    += fSec;
      this.sessionDistractedSeconds += dSec;
      this.distractionEvents      += dEvt;
      this.focusXpAwarded         += fXp;
    }
  },

  // --- Get current difficulty for quiz question filtering ---
  getDifficultyFilter() {
    return this.quizDifficultyLevel; // 'easy' | 'normal' | 'hard'
  },

  // --- Show Troubleshoot Modal with step-by-step guidance ---
  showTroubleshootModal(errorType) {
    const modal = document.getElementById('sf-troubleshoot-modal');
    if (!modal) return;
    
    const errCodeEl = document.getElementById('sf-error-code');
    const contentEl = document.getElementById('sf-troubleshoot-content');
    
    let errCode = 'UNKNOWN_ERROR';
    let contentHtml = '';
    
    const currentOrigin = window.location.origin;
    
    if (errorType === 'INSECURE_CONTEXT') {
      errCode = 'INSECURE_CONTEXT';
      contentHtml = `
        <div class="sf-alert-danger">
          <strong>⚠️ Insecure Connection:</strong> Browsers restrict camera usage to secure contexts (HTTPS or localhost). Since you are accessing via <code>${window.location.hostname}</code> on an unencrypted HTTP link, camera access is disabled by security rules.
        </div>
        <h3>How to fix this:</h3>
        <ul class="sf-troubleshoot-steps">
          <li data-step="1"><strong>Access locally:</strong> If you are on the same machine running the server, open <a href="http://localhost:3000" style="color:var(--secondary); text-decoration:underline;">http://localhost:3000</a> instead.</li>
          <li data-step="2"><strong>Enable Chrome bypass flag:</strong> If accessing from another device (like a phone or tablet in the classroom):
            <div style="margin: 8px 0 4px 0;">a. Open a new tab in Chrome/Edge and go to:</div>
            <div class="sf-code-block">
              <span style="user-select: all;">chrome://flags/#unsafely-treat-insecure-origin-as-secure</span>
              <button class="sf-copy-btn" onclick="SmartFocus.copyText('chrome://flags/#unsafely-treat-insecure-origin-as-secure')">Copy</button>
            </div>
            <div style="margin: 6px 0 4px 0;">b. Enable the flag, and paste this URL into the text box:</div>
            <div class="sf-code-block">
              <span style="user-select: all;">${currentOrigin}</span>
              <button class="sf-copy-btn" onclick="SmartFocus.copyText('${currentOrigin}')">Copy</button>
            </div>
            <div style="margin-top: 4px;">c. Click <strong>Relaunch</strong> at the bottom of Chrome.</div>
          </li>
          <li data-step="3"><strong>Enable HTTPS:</strong> You can place <code>key.pem</code> and <code>cert.pem</code> certificate files in the project root to enable secure HTTPS connections.</li>
        </ul>
      `;
    } else if (errorType === 'NotAllowedError') {
      errCode = 'PERMISSION_DENIED';
      contentHtml = `
        <div class="sf-alert-danger">
          <strong>⚠️ Permission Blocked:</strong> You previously blocked camera access for this site, or clicked "Block" on the prompt.
        </div>
        <h3>How to allow access:</h3>
        <ul class="sf-troubleshoot-steps">
          <li data-step="1"><strong>Click the settings/lock icon:</strong> Locate the lock or camera icon on the left side of your browser's address bar (next to the URL).</li>
          <li data-step="2"><strong>Enable Camera:</strong> Look for the <strong>Camera</strong> toggle/permission settings and switch it to <strong>Allow</strong>.</li>
          <li data-step="3"><strong>Refresh the page:</strong> Click the "Refresh & Retry" button below to reload and test the camera again.</li>
        </ul>
      `;
    } else if (errorType === 'NotFoundError' || errorType === 'DevicesNotFoundError') {
      errCode = 'HARDWARE_MISSING';
      contentHtml = `
        <div class="sf-alert-danger">
          <strong>⚠️ Webcam Not Found:</strong> The browser could not detect any camera hardware connected to your device.
        </div>
        <h3>Checklist:</h3>
        <ul class="sf-troubleshoot-steps">
          <li data-step="1"><strong>Plugs & Cables:</strong> If you use an external USB webcam, ensure it is securely plugged in.</li>
          <li data-step="2"><strong>Hardware Switch:</strong> Check if your laptop has a physical webcam slider cover or keyboard shortcut (like Fn + F6/F10) that disables the camera.</li>
          <li data-step="3"><strong>Driver Settings:</strong> Ensure your webcam is enabled in your OS Device Manager settings.</li>
        </ul>
      `;
    } else if (errorType === 'NotReadableError' || errorType === 'TrackStartError') {
      errCode = 'DEVICE_BUSY';
      contentHtml = `
        <div class="sf-alert-danger">
          <strong>⚠️ Camera Busy:</strong> Another application or browser tab is already using your camera.
        </div>
        <h3>Steps to resolve:</h3>
        <ul class="sf-troubleshoot-steps">
          <li data-step="1"><strong>Close Other Tabs:</strong> Make sure no other browser tabs (like Google Meet, Zoom, or school portals) are open.</li>
          <li data-step="2"><strong>Close Desktop Apps:</strong> Check if Teams, Skype, Discord, Zoom, or your camera app are running in the background.</li>
          <li data-step="3"><strong>Restart Device:</strong> If the camera remains locked, a quick device restart will release the hardware.</li>
        </ul>
      `;
    } else {
      errCode = errorType || 'GENERIC_ACCESS_ERROR';
      contentHtml = `
        <div class="sf-alert-danger">
          <strong>⚠️ Access Failed:</strong> Could not initialize camera. Reason: <code>${errorType || 'Unknown Device Error'}</code>
        </div>
        <h3>General Troubleshooting:</h3>
        <ul class="sf-troubleshoot-steps">
          <li data-step="1">Make sure you have an active camera and it isn't blocked by antivirus/privacy guard software.</li>
          <li data-step="2">Ensure you are using a modern browser like Google Chrome, Microsoft Edge, or Firefox.</li>
          <li data-step="3">Try reloading the page or testing in a private/incognito window.</li>
        </ul>
      `;
    }
    
    errCodeEl.textContent = `Error Code: ${errCode}`;
    contentEl.innerHTML = contentHtml;
    modal.classList.remove('sf-hidden');
  },

  // --- Copy utility for troubleshoot codes ---
  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text:', err);
      // Fallback copy using temporary element
      try {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('📋 Copied to clipboard!');
      } catch (e) {
        showToast('❌ Copy failed. Please select and copy manually.');
      }
    });
  },
};

// ===== GLOBAL HANDLER: Toggle from UI =====
function onSmartFocusToggle(enabled) {
  if (enabled) {
    // Show consent modal first (remove sf-hidden)
    document.getElementById('smart-focus-modal').classList.remove('sf-hidden');
  } else {
    SmartFocus.stop();
    showToast('Smart Focus Mode turned off.');
  }
}

function confirmSmartFocus() {
  document.getElementById('smart-focus-modal').classList.add('sf-hidden');
  SmartFocus.start().then(ok => {
    if (ok) {
      showToast('🧠 Smart Focus Mode ON — AI is now adapting to you!', 3000);
    } else {
      // Revert toggle
      const toggle = document.getElementById('smart-focus-toggle');
      if (toggle) toggle.checked = false;
    }
  });
}

function cancelSmartFocus() {
  document.getElementById('smart-focus-modal').classList.add('sf-hidden');
  const toggle = document.getElementById('smart-focus-toggle');
  if (toggle) toggle.checked = false;
}

function toggleSmartFocusWidget() {
  const widget = document.getElementById('smart-focus-widget');
  const btn = widget.querySelector('.sf-minimize-btn');
  if (widget.classList.toggle('minimised')) {
    btn.textContent = '⟩';
  } else {
    btn.textContent = '⟨';
  }
}

function dismissEngagementPopup() {
  SmartFocus.dismissEngagementPopup();
}

// ===== STUDY GROUPS & COLLABORATIVE CHALLENGES FRONTEND LOGIC =====
let activeGroupId = null;
let currentWeakestLink = null;
let selectedWLOptionKey = null;

async function loadGroups() {
  if (!currentUser) return;
  
  try {
    const res = await api('/api/groups/my-group');
    if (res.inGroup) {
      activeGroupId = res.group.id;
      document.getElementById('group-non-member-view').classList.add('hidden');
      document.getElementById('group-member-view').classList.remove('hidden');
      
      document.getElementById('my-group-name').textContent = res.group.name;
      document.getElementById('my-challenge-desc').textContent = `Challenge: ${res.group.challengeName} (Target: Complete ${res.group.targetLessons} lessons by ${res.group.deadline})`;
      document.getElementById('my-group-badge-icon').textContent = res.group.badgeIcon;
      document.getElementById('my-group-badge-name').textContent = res.group.badgeName;
      
      // Update progress bar
      document.getElementById('group-progress-text').textContent = `${res.totalProgress} / ${res.group.targetLessons} Lessons Completed`;
      const pct = Math.min(100, (res.totalProgress / res.group.targetLessons) * 100);
      document.getElementById('group-progress-fill').style.width = pct + '%';
      
      // Render members
      renderMembersList(res.members);
      
      // Render leaderboard
      renderGroupLeaderboard(res.leaderboard);
      
      // Render chat
      renderChatMessages(res.messages);
      
      // Render weakest link
      if (res.weakestLink) {
        document.getElementById('weakest-link-card').classList.remove('hidden');
        document.getElementById('weakest-link-text').textContent = `🚨 ${res.weakestLink.studentName} is struggling with "${res.weakestLink.lessonTitle}" in ${res.weakestLink.subjectName}! Help them by answering a bonus question!`;
        currentWeakestLink = res.weakestLink;
      } else {
        document.getElementById('weakest-link-card').classList.add('hidden');
        currentWeakestLink = null;
      }
      
      // Init socket connection
      initGroupSocket(res.group.id);
    } else {
      activeGroupId = null;
      document.getElementById('group-member-view').classList.add('hidden');
      document.getElementById('group-non-member-view').classList.remove('hidden');
      
      // Fetch active challenges
      const challenges = await api('/api/challenges/active');
      renderChallengesPicker(challenges);
    }
  } catch (err) {
    console.error('Error loading study groups page:', err);
    showToast('⚠️ Could not load study groups data');
  }
}

function renderMembersList(members) {
  const container = document.getElementById('group-members-list');
  if (!container) return;
  
  if (!members || members.length === 0) {
    container.innerHTML = '<div class="empty-state">No members in this group yet.</div>';
    return;
  }
  
  container.innerHTML = members.map(m => `
    <div class="group-member-item">
      <div class="gmi-left">
        <div class="gmi-avatar">${m.avatar || '🧑‍🎓'}</div>
        <div>
          <div class="gmi-name">${m.name} ${m.id === currentUser.id ? ' (You)' : ''}</div>
          <div class="gmi-meta">Level ${m.level || 1} · ${m.xp || 0} XP</div>
        </div>
      </div>
      <div class="gmi-right">
        <div class="gmi-score">${m.lessonsCompleted || 0}</div>
        <div class="gmi-score-label">lessons completed</div>
      </div>
    </div>
  `).join('');
}

function renderGroupLeaderboard(leaderboard) {
  const container = document.getElementById('group-leaderboard-list');
  if (!container) return;
  
  if (!leaderboard || leaderboard.length === 0) {
    container.innerHTML = '<div class="empty-state">No leaderboard data yet.</div>';
    return;
  }
  
  container.innerHTML = leaderboard.map((g, idx) => `
    <div class="group-member-item" style="${g.isMyGroup ? 'border-color:var(--purple); background:rgba(123, 104, 238, 0.05);' : ''}">
      <div class="gmi-left">
        <div style="font-weight:bold; font-size:1.1rem; color:var(--text3); width:24px;">#${idx + 1}</div>
        <div>
          <div class="gmi-name" style="${g.isMyGroup ? 'color:var(--purple);' : ''}">${g.name} ${g.isMyGroup ? ' (Our Group)' : ''}</div>
        </div>
      </div>
      <div class="gmi-right">
        <div class="gmi-score">${g.progress || 0}</div>
        <div class="gmi-score-label">completed lessons</div>
      </div>
    </div>
  `).join('');
}

function renderChallengesPicker(challenges) {
  const container = document.getElementById('active-challenges-list');
  if (!container) return;
  
  if (!challenges || challenges.length === 0) {
    container.innerHTML = '<div class="empty-state">No active challenges. Ask your teacher to publish one!</div>';
    return;
  }
  
  container.innerHTML = challenges.map(c => {
    const deadlineStr = new Date(c.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Subgroups HTML
    let subgroupsHtml = '';
    if (c.groups && c.groups.length > 0) {
      subgroupsHtml = `
        <div class="cpc-subgroups">
          <div class="cpc-subgroups-title">Existing Study Groups:</div>
          ${c.groups.map(g => `
            <div class="subgroup-join-row">
              <span>👥 <strong>${g.name}</strong> (${g.member_count}/${c.team_size} members)</span>
              ${g.member_count < c.team_size 
                ? `<button class="btn-primary" onclick="joinStudyGroup(${g.id})">Join Group</button>` 
                : '<span style="color:var(--text3); font-size:0.8rem;">Full / फुल</span>'}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    return `
      <div class="challenge-picker-card">
        <div class="cpc-header">
          <div>
            <h4 class="cpc-title">${c.name}</h4>
            <div class="cpc-meta">By ${c.creator_name} · Deadline: ${deadlineStr} · Team size: ${c.team_size} max</div>
          </div>
          <div class="cpc-badge-pill">${c.badge_icon} ${c.badge_name}</div>
        </div>
        
        <p style="font-size:0.85rem; color:var(--text2); line-height:1.4;">Goal: Collective target of <strong>${c.target_lessons} lessons completed</strong> during the challenge window.</p>
        
        ${subgroupsHtml}
        
        <div class="cpc-actions">
          <div style="flex:1; display:flex; gap:8px;">
            <input type="text" id="new-group-name-${c.id}" placeholder="Create new study group..." style="flex:1; background:var(--bg3); border:1px solid var(--border); color:var(--text); padding:8px 12px; border-radius:8px; font-size:0.85rem; outline:none;">
            <button class="btn-primary" onclick="createStudyGroup(${c.id})" style="margin:0; padding:8px 16px; font-size:0.85rem; border-radius:8px;">Create Group</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function createStudyGroup(challengeId) {
  const input = document.getElementById(`new-group-name-${challengeId}`);
  const name = input?.value?.trim();
  if (!name) {
    showToast('⚠️ Please enter a study group name');
    return;
  }
  
  try {
    const res = await api('/api/groups/create', 'POST', { challenge_id: challengeId, name });
    if (res.success) {
      showToast('🎉 Study Group created successfully!');
      loadGroups();
    }
  } catch (err) {
    showToast(err.error || '❌ Could not create study group');
  }
}

async function joinStudyGroup(groupId) {
  try {
    const res = await api('/api/groups/join', 'POST', { group_id: groupId });
    if (res.success) {
      showToast('🎉 Joined study group successfully!');
      loadGroups();
    }
  } catch (err) {
    showToast(err.error || '❌ Could not join study group');
  }
}

async function leaveCurrentGroup() {
  if (!activeGroupId) return;
  if (!confirm('Are you sure you want to leave this study group? Your progress contribution will remain but you will no longer share the reward or chat.')) return;
  
  try {
    const res = await api('/api/groups/leave', 'POST', { group_id: activeGroupId });
    if (res.success) {
      showToast('🚪 Left study group');
      loadGroups();
    }
  } catch (err) {
    showToast(err.error || '❌ Could not leave study group');
  }
}

// Socket mini chat functions
function initGroupSocket(groupId) {
  if (typeof io === 'undefined') return;
  if (!socket) {
    socket = io({
      auth: { token: currentToken }
    });
  }
  socket.emit('joinGroupRoom', { groupId });
  
  // Real-time chat events
  socket.off('groupMessage');
  socket.on('groupMessage', (msg) => {
    const chatContainer = document.getElementById('group-chat-messages');
    if (chatContainer) {
      appendChatMessage(msg);
    }
  });

  // Real-time progress update events
  socket.off('progressUpdated');
  socket.on('progressUpdated', () => {
    silentReloadGroupProgress();
  });
}

function renderChatMessages(messages) {
  const container = document.getElementById('group-chat-messages');
  if (!container) return;
  
  container.innerHTML = '';
  if (!messages || messages.length === 0) {
    container.innerHTML = '<div class="empty-state" style="color:var(--text3); font-size:0.8rem;">No messages yet. Send a note to your team!</div>';
    return;
  }
  
  messages.forEach(m => appendChatMessage(m));
}

function appendChatMessage(msg) {
  const container = document.getElementById('group-chat-messages');
  if (!container) return;

  const empty = container.querySelector('.empty-state');
  if (empty) empty.remove();

  const isMe = msg.user_id === currentUser.id;
  const isSystem = msg.sender_name === 'System' || (msg.message.startsWith('💡 System'));

  const div = document.createElement('div');
  if (isSystem) {
    div.className = 'chat-message system';
    div.innerHTML = `<div class="chat-text" style="background:transparent; border:none; padding:0; color:var(--accent); font-weight:500;">${msg.message}</div>`;
  } else {
    div.className = `chat-message ${isMe ? 'me' : ''}`;
    div.innerHTML = `
      <div class="chat-avatar">${msg.sender_avatar || '🧑‍🎓'}</div>
      <div class="chat-bubble-wrap">
        <div class="chat-meta">${msg.sender_name} · ${formatChatTime(msg.created_at)}</div>
        <div class="chat-text">${escapeHtml(msg.message)}</div>
      </div>
    `;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatChatTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendGroupChatMessage() {
  const input = document.getElementById('group-chat-input');
  const message = input?.value?.trim();
  if (!message || !activeGroupId) return;
  
  if (socket) {
    socket.emit('sendGroupMessage', { groupId: activeGroupId, message });
    input.value = '';
  } else {
    try {
      await api('/api/groups/chat', 'POST', { group_id: activeGroupId, message });
      input.value = '';
      loadGroups();
    } catch (err) {
      showToast('❌ Message send failed');
    }
  }
}

function handleGroupChatKey(event) {
  if (event.key === 'Enter') {
    sendGroupChatMessage();
  }
}

async function silentReloadGroupProgress() {
  if (!activeGroupId) return;
  try {
    const res = await api('/api/groups/my-group');
    if (!res.inGroup) return;
    
    document.getElementById('group-progress-text').textContent = `${res.totalProgress} / ${res.group.targetLessons} Lessons Completed`;
    const pct = Math.min(100, (res.totalProgress / res.group.targetLessons) * 100);
    document.getElementById('group-progress-fill').style.width = pct + '%';
    
    renderMembersList(res.members);
    renderGroupLeaderboard(res.leaderboard);
    
    if (res.weakestLink) {
      document.getElementById('weakest-link-card').classList.remove('hidden');
      document.getElementById('weakest-link-text').textContent = `🚨 ${res.weakestLink.studentName} is struggling with "${res.weakestLink.lessonTitle}" in ${res.weakestLink.subjectName}! Help them by answering a bonus question!`;
      currentWeakestLink = res.weakestLink;
    } else {
      document.getElementById('weakest-link-card').classList.add('hidden');
      currentWeakestLink = null;
    }
  } catch (err) {
    console.error('Silent progress reload failed:', err);
  }
}

// Teacher group challenges logic
function openCreateChallengeModal() {
  document.getElementById('create-challenge-modal').classList.remove('sf-hidden');
  
  const today = new Date();
  const nextFriday = new Date();
  nextFriday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7 || 7);
  document.getElementById('cc-deadline').value = nextFriday.toISOString().split('T')[0];
  
  document.getElementById('cc-name').value = '';
  document.getElementById('cc-target').value = '20';
  document.getElementById('cc-size').value = '4';
  document.getElementById('cc-badge-name').value = '';
  document.getElementById('create-challenge-error').classList.add('hidden');
}

function closeCreateChallengeModal() {
  document.getElementById('create-challenge-modal').classList.add('sf-hidden');
}

async function handleCreateChallenge() {
  const name = document.getElementById('cc-name').value.trim();
  const target = document.getElementById('cc-target').value;
  const size = document.getElementById('cc-size').value;
  const deadline = document.getElementById('cc-deadline').value;
  const badgeName = document.getElementById('cc-badge-name').value.trim();
  const badgeIcon = document.getElementById('cc-badge-icon').value;
  
  const errEl = document.getElementById('create-challenge-error');
  errEl.classList.add('hidden');
  
  if (!name || !target || !size || !deadline || !badgeName) {
    errEl.textContent = 'Please fill out all fields.';
    errEl.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await api('/api/challenges/create', 'POST', {
      name,
      target_lessons: parseInt(target),
      deadline,
      badge_name: badgeName,
      badge_icon: badgeIcon,
      team_size: parseInt(size)
    });
    
    if (res.success) {
      showToast('🎉 Challenge published successfully!');
      closeCreateChallengeModal();
      loadTeacherHome();
    }
  } catch (err) {
    errEl.textContent = err.error || 'Failed to create challenge.';
    errEl.classList.remove('hidden');
  }
}

async function loadTeacherChallenges() {
  const container = document.getElementById('t-challenges-list');
  if (!container) return;
  
  try {
    const stats = await api('/api/teacher/challenges-stats');
    if (!stats || stats.length === 0) {
      container.innerHTML = '<div class="empty-state">No challenges published yet. Click above to start one!</div>';
      return;
    }
    
    container.innerHTML = stats.map(c => {
      const deadlineStr = new Date(c.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      let groupsHtml = '<div class="empty-state" style="padding:6px; font-size:0.8rem;">No student groups formed yet.</div>';
      if (c.groups && c.groups.length > 0) {
        groupsHtml = c.groups.map(g => {
          const pct = Math.min(100, Math.round((g.progress / c.target_lessons) * 100));
          return `
            <div style="background:var(--bg3); padding:10px; border-radius:8px; margin-bottom:8px; font-size:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong>${g.name}</strong>
                <span style="color:var(--secondary); font-weight:bold;">${g.progress} / ${c.target_lessons} lessons (${pct}%)</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text3); margin-bottom:6px;">Members: ${g.memberNames || 'None'}</div>
              <div class="xp-bar-track" style="height:6px; background:var(--bg2);"><div class="xp-bar-fill" style="width:${pct}%; height:100%; background:var(--secondary);"></div></div>
            </div>
          `;
        }).join('');
      }
      
      return `
        <div style="border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <div>
              <strong style="font-size:0.95rem; color:var(--text);">${c.name}</strong>
              <div style="font-size:0.75rem; color:var(--text3);">Target: ${c.target_lessons} lessons · Deadline: ${deadlineStr} · Teams of ${c.team_size}</div>
            </div>
            <span style="font-size:0.75rem; background:rgba(255,107,53,0.1); color:var(--primary); padding:3px 8px; border-radius:12px; font-weight:bold;">Badge: ${c.badge_icon} ${c.badge_name}</span>
          </div>
          <div style="margin-top:8px; padding-left:10px;">
            ${groupsHtml}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading teacher challenges stats:', err);
    container.innerHTML = '<div class="empty-state">Could not load challenges stats.</div>';
  }
}

// Weakest Link Assistance Dialog
function openWeakestLinkModal() {
  if (!currentWeakestLink) return;
  
  selectedWLOptionKey = null;
  document.getElementById('wl-result-block').classList.add('hidden');
  document.getElementById('btn-wl-submit').classList.remove('hidden');
  document.getElementById('btn-wl-close').classList.add('hidden');
  
  const q = currentWeakestLink.question;
  document.getElementById('wl-struggling-student').textContent = currentWeakestLink.studentName;
  document.getElementById('wl-struggling-lesson').textContent = currentWeakestLink.lessonTitle;
  document.getElementById('wl-question-text').textContent = q.question;
  
  const optionsHtml = ['a', 'b', 'c', 'd'].map(opt => {
    const text = q[`option_${opt}`];
    if (!text) return '';
    const key = opt.toUpperCase();
    return `
      <button class="quiz-option-btn" id="wl-opt-${key}" onclick="selectWLOption('${key}')" style="width:100%; text-align:left; background:var(--bg2); border:1px solid var(--border); color:var(--text); padding:12px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:0.9rem; transition:all 0.2s;">
        <strong style="color:var(--primary); margin-right:6px;">${key}.</strong> ${escapeHtml(text)}
      </button>
    `;
  }).join('');
  
  document.getElementById('wl-options-list').innerHTML = optionsHtml;
  document.getElementById('weakest-link-modal').classList.remove('sf-hidden');
}

function closeWeakestLinkModal() {
  document.getElementById('weakest-link-modal').classList.add('sf-hidden');
}

function selectWLOption(key) {
  selectedWLOptionKey = key;
  ['A', 'B', 'C', 'D'].forEach(k => {
    const el = document.getElementById('wl-opt-' + k);
    if (el) {
      el.style.borderColor = 'var(--border)';
      el.style.background = 'var(--bg2)';
    }
  });
  const activeEl = document.getElementById('wl-opt-' + key);
  if (activeEl) {
    activeEl.style.borderColor = 'var(--primary)';
    activeEl.style.background = 'rgba(255, 107, 53, 0.08)';
  }
}

async function submitWeakestLinkAnswer() {
  if (!selectedWLOptionKey) {
    showToast('⚠️ Please select an answer first');
    return;
  }
  
  try {
    const res = await api('/api/groups/weakest-link/submit', 'POST', {
      group_id: activeGroupId,
      lesson_id: currentWeakestLink.lessonId,
      question_id: currentWeakestLink.question.id,
      answer: selectedWLOptionKey,
      student_name: currentWeakestLink.studentName
    });

    const resultBlock = document.getElementById('wl-result-block');
    const header = document.getElementById('wl-feedback-header');
    const expText = document.getElementById('wl-explanation-text');
    
    resultBlock.classList.remove('hidden');
    expText.textContent = res.explanation || 'No explanation provided.';

    ['A', 'B', 'C', 'D'].forEach(k => {
      const el = document.getElementById('wl-opt-' + k);
      if (el) {
        el.disabled = true;
        if (k === res.correctAnswer) {
          el.style.borderColor = 'var(--secondary)';
          el.style.background = 'rgba(78, 205, 196, 0.15)';
        } else if (k === selectedWLOptionKey) {
          el.style.borderColor = '#FF5050';
          el.style.background = 'rgba(255, 80, 80, 0.15)';
        }
      }
    });

    if (res.correct) {
      header.textContent = '🎉 Correct Answer! +15 XP';
      header.style.color = 'var(--secondary)';
      showToast('🎉 Awesome! You helped your teammate and earned +15 XP!');
      if (currentUser) {
        currentUser.xp += 15;
        updateNavStats();
      }
    } else {
      header.textContent = '❌ Incorrect Answer';
      header.style.color = '#FF8080';
      showToast('❌ That was incorrect, but thank you for trying!');
    }

    document.getElementById('btn-wl-submit').classList.add('hidden');
    document.getElementById('btn-wl-close').classList.remove('hidden');

    silentReloadGroupProgress();
  } catch(e) {
    console.error('Error submitting assist answer:', e);
    showToast('❌ Submission failed');
  }
}
