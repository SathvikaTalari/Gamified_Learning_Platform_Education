// ═══════════════════════════════════════════════
//   VidyaQuest – Multilingual Translations
//   Languages: English, Hindi (हिंदी), Marathi (मराठी)
// ═══════════════════════════════════════════════

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome back',
    dashboard: 'Dashboard',
    subjects: 'Subjects',
    quizzes: 'Quizzes',
    progress: 'My Progress',
    leaderboard: 'Leaderboard',
    games: 'Mini Games',
    profile: 'Profile',
    logout: 'Logout',
    totalXp: 'Total XP',
    dayStreak: 'Day Streak',
    quizzesDone: 'Quizzes Done',
    currentLevel: 'Current Level',
    levelProgress: 'Level Progress',
    quickPlay: 'Quick Play',
    seeAll: 'See all →',
    yourBadges: 'Your Badges',
    recentActivity: 'Recent Activity',
    startQuest: 'Start Your Quest 🚀',
    learnThrough: 'Learn STEM Through',
    epicQuests: 'Epic Quests!',
    tagline: 'Gamified science, math & technology for students in grades 6–12.',
    continueJourney: 'Continue your learning quest',
  },
  hi: {
    welcome: 'वापस स्वागत है',
    dashboard: 'डैशबोर्ड',
    subjects: 'विषय',
    quizzes: 'प्रश्नोत्तरी',
    progress: 'मेरी प्रगति',
    leaderboard: 'लीडरबोर्ड',
    games: 'मिनी गेम्स',
    profile: 'प्रोफाइल',
    logout: 'लॉगआउट',
    totalXp: 'कुल XP',
    dayStreak: 'दिन की स्ट्रीक',
    quizzesDone: 'प्रश्नोत्तरी पूर्ण',
    currentLevel: 'वर्तमान स्तर',
    levelProgress: 'स्तर प्रगति',
    quickPlay: 'त्वरित खेल',
    seeAll: 'सभी देखें →',
    yourBadges: 'आपके बैज',
    recentActivity: 'हालिया गतिविधि',
    startQuest: 'अपनी यात्रा शुरू करें 🚀',
    learnThrough: 'STEM सीखें',
    epicQuests: 'महाकाव्य यात्राओं के माध्यम से!',
    tagline: 'कक्षा 6-12 के छात्रों के लिए गेमिफाइड विज्ञान, गणित और प्रौद्योगिकी।',
    continueJourney: 'अपनी सीखने की यात्रा जारी रखें',
  },
  mr: {
    welcome: 'परत स्वागत आहे',
    dashboard: 'डॅशबोर्ड',
    subjects: 'विषय',
    quizzes: 'प्रश्नमंजुषा',
    progress: 'माझी प्रगती',
    leaderboard: 'लीडरबोर्ड',
    games: 'मिनी गेम्स',
    profile: 'प्रोफाईल',
    logout: 'लॉगआउट',
    totalXp: 'एकूण XP',
    dayStreak: 'दिवस स्ट्रीक',
    quizzesDone: 'प्रश्नमंजुषा पूर्ण',
    currentLevel: 'सध्याचा स्तर',
    levelProgress: 'स्तर प्रगती',
    quickPlay: 'जलद खेळ',
    seeAll: 'सर्व पहा →',
    yourBadges: 'तुमचे बॅजेस',
    recentActivity: 'अलीकडील क्रियाकलाप',
    startQuest: 'तुमची सहल सुरू करा 🚀',
    learnThrough: 'STEM शिका',
    epicQuests: 'महाकाव्य सहलींद्वारे!',
    tagline: 'इयत्ता 6-12 च्या विद्यार्थ्यांसाठी गेमिफाइड विज्ञान, गणित आणि तंत्रज्ञान.',
    continueJourney: 'तुमचा शिक्षण प्रवास सुरू ठेवा',
  }
};

// Apply translations to visible elements
function applyTranslations(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Nav items
  const navMap = {
    dashboard: t.dashboard,
    subjects: t.subjects,
    quizzes: t.quizzes,
    progress: t.progress,
    leaderboard: t.leaderboard,
    games: t.games,
    profile: t.profile,
  };

  Object.entries(navMap).forEach(([tab, label]) => {
    const el = document.querySelector(`[data-tab="${tab}"]`);
    if (el) {
      const icons = { dashboard: '🏠', subjects: '📚', quizzes: '🎮', progress: '📊', leaderboard: '🏆', games: '🕹️', profile: '👤' };
      el.textContent = `${icons[tab]} ${label}`;
    }
  });

  // Stat labels
  const statLabels = document.querySelectorAll('.stat-label');
  const labelMap = [t.totalXp, t.dayStreak, t.quizzesDone, t.currentLevel];
  statLabels.forEach((el, i) => { if (labelMap[i]) el.textContent = labelMap[i]; });

  // Section headers
  const sectionHeaders = document.querySelectorAll('.section-header h2');
  if (sectionHeaders[0]) sectionHeaders[0].textContent = t.levelProgress;
  if (sectionHeaders[1]) sectionHeaders[1].textContent = t.quickPlay;
  if (sectionHeaders[2]) sectionHeaders[2].textContent = t.yourBadges;

  // Logout button
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) logoutBtn.textContent = `🚪 ${t.logout}`;

  console.log(`Language changed to: ${lang}`);
}
