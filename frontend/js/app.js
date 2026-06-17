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
    const language = document.getElementById('reg-language').value;
    if (!school) { showAuthError('Please enter your school name'); return; }
    if (!grade) { showAuthError('Please select your grade'); return; }
    body.grade = grade;
    body.school = school;
    body.language = language;
  } else {
    const department = document.getElementById('reg-department').value;
    const subject_specialization = document.getElementById('reg-specialization').value;
    const language = document.getElementById('reg-teacher-language').value;
    if (!department) { showAuthError('Please select your department'); return; }
    if (!subject_specialization) { showAuthError('Please select your subject specialization'); return; }
    body.department = department;
    body.subject_specialization = subject_specialization;
    body.language = language;
  }

  try {
    const data = await api('/api/register', 'POST', body);
    loginSuccess(data);
  } catch(e) { showAuthError(e.message); }
}

function loginSuccess(data) {
  currentToken = data.token;
  currentUser = data.user;
  currentLanguage = currentUser.language || 'en';
  localStorage.setItem('vq_token', currentToken);
  document.getElementById('lang-switcher').value = currentLanguage;
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
      <div class="subject-home-card" onclick="openSubject(${s.id},'${s.name}','${s.icon}','${s.color}','${s.description}')">
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
      <div class="subject-card" onclick="openSubject(${s.id},'${s.name}','${s.icon}','${s.color}','${s.description}')" style="border-color:${s.color}22;">
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

async function openSubject(id, name, icon, color, desc) {
  currentSubjectId = id;
  showScreen('lessons');
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
      const title = currentLanguage==='hi' && l.title_hi ? l.title_hi : currentLanguage==='mr' && l.title_mr ? l.title_mr : currentLanguage==='or' && l.title_or ? l.title_or : l.title;
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

// ===== LESSON DETAIL =====
async function openLesson(id) {
  currentLessonId = id;
  showScreen('lesson');
  try {
    const lesson = await api('/api/lesson/' + id);
    const title = currentLanguage==='hi' && lesson.title_hi ? lesson.title_hi : currentLanguage==='mr' && lesson.title_mr ? lesson.title_mr : currentLanguage==='or' && lesson.title_or ? lesson.title_or : lesson.title;
    const c = lesson.content || {};
    const color = lesson.subject_color || 'var(--primary)';

    const vocab = vocabWords[lesson.title] || ['Science', 'Technology', 'Mathematics', 'Engineering'];
    const labelListen = { en: 'Listen', hi: 'सुनें', mr: 'ऐका', or: 'ଶୁଣନ୍ତୁ' }[currentLanguage] || 'Listen';
    const labelPractice = { en: 'Practice', hi: 'अभ्यास करें', mr: 'सराव करा', or: 'ଅଭ୍ୟାସ' }[currentLanguage] || 'Practice';
    const readBtnText = { en: '🔊 Read Aloud', hi: '🔊 पाठ सुनें', mr: '🔊 धडा वाचा', or: '🔊 ପାଠ ପଢନ୍ତୁ' }[currentLanguage] || '🔊 Read Aloud';

    document.getElementById('lesson-content').innerHTML = `
      <div class="lesson-header-controls" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:15px;">
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
  try {
    const lesson = await api('/api/lesson/' + lessonId);
    quizState = { lessonId: lesson.id, questions: lesson.questions, current: 0, score: 0, answered: false, xpReward: lesson.xp_reward };
    renderQuestion();
  } catch(e) { console.error(e); }
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
  } else if (currentLanguage === 'or' && q.question_or) {
    qText = q.question_or;
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
      <div class="profile-section">
        <h3>📊 Stats</h3>
        <div style="color:var(--text2);font-size:0.88rem;line-height:1.8;">
          <div>🔥 Login Streak: <strong>${profile.streak || 0} days</strong></div>
          <div>🏅 Current Level: <strong>Level ${level}</strong></div>
          <div>🎭 Role: <strong>${isTeacher ? 'Teacher' : 'Student'}</strong></div>
          ${isTeacher
            ? `<div>🏛️ Department: <strong>${profile.department}</strong></div>
               <div>🎯 Specialization: <strong>${profile.subject_specialization}</strong></div>`
            : `<div>🏫 School: <strong>${profile.school || 'Not set'}</strong></div>
               <div>📚 Grade: <strong>Grade ${profile.grade}</strong></div>`
          }
          <div>🌐 Language: <strong>${{en:'English',hi:'हिंदी',mr:'मराठी',or:'ଓଡ଼ିଆ'}[profile.language]||'English'}</strong></div>
          <div>📅 Joined: <strong>${new Date(profile.created_at).toLocaleDateString()}</strong></div>
        </div>
      </div>
      <button class="logout-btn" onclick="logout()">🚪 Logout</button>
    `;
  } catch(e) { console.error(e); }
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

  } catch(e) {
    console.error('Teacher dashboard error:', e);
    showToast('⚠️ Could not load dashboard data');
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
  or: ['or-IN', 'hi-IN']
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
      else if (currentLanguage === 'or') readText = '🔊 ପାଠ ପଢନ୍ତୁ';
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
  } else if (currentLanguage === 'or') {
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
  } else if (currentLanguage === 'or' && q.question_or) {
    qText = q.question_or;
  }
  
  let textToRead = "";
  const isFillBlank = q.option_b === '' || q.option_b === null || !['A', 'B', 'C', 'D'].includes(q.correct_answer);

  if (isFillBlank) {
    if (currentLanguage === 'hi') {
      textToRead = `खाली स्थान भरें: ${qText}. अपना उत्तर टाइप करें या बोलें.`;
    } else if (currentLanguage === 'mr') {
      textToRead = `रिकामी जागा भरा: ${qText}. तुमचे उत्तर टाइप करा किंवा बोला.`;
    } else if (currentLanguage === 'or') {
      textToRead = `ଶୂନ୍ୟସ୍ଥାନ ପୂରଣ କରନ୍ତୁ: ${qText}. ଆପଣଙ୍କ ଉତ୍ତର ଟାଇପ୍ କରନ୍ତୁ କିମ୍ବା କୁହନ୍ତୁ.`;
    } else {
      textToRead = `Fill in the blank: ${qText}. Type or speak your answer.`;
    }
  } else {
    if (currentLanguage === 'hi') {
      textToRead = `प्रश्न: ${qText}. विकल्प ए: ${q.option_a}. विकल्प बी: ${q.option_b}. विकल्प सी: ${q.option_c}. विकल्प डी: ${q.option_d}.`;
    } else if (currentLanguage === 'mr') {
      textToRead = `प्रश्न: ${qText}. पर्याय ए: ${q.option_a}. पर्याय बी: ${q.option_b}. पर्याय सी: ${q.option_c}. पर्याय डी: ${q.option_d}.`;
    } else if (currentLanguage === 'or') {
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
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'or' ? 'or-IN' : 'en-US';
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
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'or' ? 'or-IN' : 'en-US';
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
  recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'or' ? 'or-IN' : 'en-US';
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

    if (solutionBody) solutionBody.textContent = solution;
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
  const text = solutionBody.textContent.trim();
  if (!text) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage === 'hi' ? 'hi-IN'
    : currentLanguage === 'mr' ? 'mr-IN'
    : currentLanguage === 'or' ? 'or-IN'
    : 'en-US';
  utterance.rate = 0.9;
  utterance.onstart = () => { if (btn) btn.innerHTML = '🛑 Stop'; };
  utterance.onend = () => { if (btn) btn.innerHTML = '🔊 Read Aloud'; };
  utterance.onerror = () => { if (btn) btn.innerHTML = '🔊 Read Aloud'; };
  window.speechSynthesis.speak(utterance);
}
