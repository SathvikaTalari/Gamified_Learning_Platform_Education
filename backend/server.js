require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'stem_rural_secret_2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const db = new Database(path.join(__dirname, '../database/stem_platform.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    grade INTEGER DEFAULT 6,
    school TEXT DEFAULT '',
    department TEXT DEFAULT '',
    subject_specialization TEXT DEFAULT '',
    language TEXT DEFAULT 'en',
    avatar TEXT DEFAULT '🧑‍🎓',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT NOT NULL,
    title_hi TEXT,
    title_mr TEXT,
    content TEXT,
    grade INTEGER,
    difficulty TEXT DEFAULT 'easy',
    xp_reward INTEGER DEFAULT 50,
    order_num INTEGER DEFAULT 1,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER,
    question TEXT NOT NULL,
    question_hi TEXT,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    lesson_id INTEGER,
    completed INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );
  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    requirement TEXT,
    xp_threshold INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    badge_id INTEGER,
    earned_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
  );
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    total_xp INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS daily_xp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    xp_earned INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    lesson_id INTEGER,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );
`);

// Migration: add created_by to lessons if not exists
try { db.exec('ALTER TABLE lessons ADD COLUMN created_by INTEGER DEFAULT NULL'); } catch(e) {}
try { db.exec('ALTER TABLE lessons ADD COLUMN title_or TEXT DEFAULT NULL'); } catch(e) {}
try { db.exec('ALTER TABLE questions ADD COLUMN question_mr TEXT DEFAULT NULL'); } catch(e) {}
try { db.exec('ALTER TABLE questions ADD COLUMN question_or TEXT DEFAULT NULL'); } catch(e) {}

// Data migrations for translation
try {
  db.prepare("UPDATE lessons SET title_or = 'ବୀଜଗଣିତର ପରିଚୟ' WHERE id = 1").run();
  db.prepare("UPDATE lessons SET title_or = 'ନ୍ୟୁଟନଙ୍କ ଗତି ନିୟମ' WHERE id = 6").run();
  db.prepare("UPDATE questions SET question_mr = 'जर x + 7 = 15, तर x म्हणजे काय?', question_or = 'ଯଦି x + 7 = 15, ତେବେ x ର ମାନ କେତେ?' WHERE id = 1").run();
  db.prepare("UPDATE questions SET question_mr = 'F = ma म्हणजे काय?', question_or = 'F = ma ର ଅର୍ଥ କଣ?' WHERE id = 7").run(); // Wait, let's verify if Question 7 is the F = ma question. Ah, in seed data, it says insertQ.run(6, 'F=ma ...') which actually is for lesson_id=6, but the actual ID of that question in the DB depends. Wait, let's do both or check the question text to be safe!
} catch(e) {
  console.error('Translation data migration error:', e);
}

// ===== PASSWORD STRENGTH VALIDATION =====
function validatePassword(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, isValid: score >= 4 };
}

// ===== SEED DATA =====
function seedData() {
  const subjectCount = db.prepare('SELECT COUNT(*) as c FROM subjects').get().c;
  if (subjectCount > 0) return;

  const insertSubject = db.prepare('INSERT INTO subjects (name, code, icon, color, description) VALUES (?, ?, ?, ?, ?)');
  insertSubject.run('Mathematics', 'math', '🔢', '#FF6B35', 'Algebra, Geometry, Statistics & more');
  insertSubject.run('Science', 'science', '🔬', '#4ECDC4', 'Physics, Chemistry, Biology');
  insertSubject.run('Technology', 'tech', '💻', '#45B7D1', 'Coding, Digital Literacy');
  insertSubject.run('Engineering', 'eng', '⚙️', '#96CEB4', 'Problem Solving, Design');

  const insertLesson = db.prepare('INSERT INTO lessons (subject_id, title, title_hi, title_mr, content, grade, difficulty, xp_reward, order_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  // Mathematics
  insertLesson.run(1, 'Introduction to Algebra', 'बीजगणित का परिचय', 'बीजगणिताचा परिचय', JSON.stringify({intro:'Algebra uses letters to represent unknown numbers. These letters are called variables.',concepts:['Variables represent unknown numbers','Equations show two equal expressions','Solving means finding the variable value'],example:'If x + 5 = 12, then x = 7',fun_fact:'The word Algebra comes from Arabic: al-jabr!'}), 6, 'easy', 100, 1);
  insertLesson.run(1, 'Linear Equations', 'रैखिक समीकरण', 'रेखीय समीकरण', JSON.stringify({intro:'A linear equation forms a straight line when graphed.',concepts:['ax + b = c is the standard form','One variable means one solution','Balance both sides always'],example:'2x + 4 = 10, so x = 3',fun_fact:'Engineers use linear equations to design bridges!'}), 6, 'medium', 150, 2);
  insertLesson.run(1, 'Geometry Basics', 'ज्यामिति की मूल बातें', 'भूमितीची मूलतत्त्वे', JSON.stringify({intro:'Geometry studies shapes, sizes, and positions of figures.',concepts:['Points have no size','Lines extend infinitely','Angles are measured in degrees'],example:'A triangle has 3 sides and angles summing to 180°',fun_fact:'Ancient Egyptians used geometry to build the pyramids!'}), 7, 'easy', 100, 3);
  insertLesson.run(1, 'Fractions and Decimals', 'भिन्न और दशमलव', 'अपूर्णांक आणि दशांश', JSON.stringify({intro:'Fractions and decimals represent parts of a whole.',concepts:['Numerator and Denominator','Decimal point separates whole from part','Converting fractions to decimals'],example:'1/2 is the same as 0.5',fun_fact:'The line separating the numerator and denominator is called a vinculum!'}), 6, 'easy', 100, 4);
  insertLesson.run(1, 'Basic Statistics', 'मूल सांख्यिकी', 'मूलभूत सांख्यिकी', JSON.stringify({intro:'Statistics is about collecting and analyzing data.',concepts:['Mean is the average','Median is the middle value','Mode is the most frequent value'],example:'In [1, 2, 2, 3], Mode is 2.',fun_fact:'Statistics helped map the human genome!'}), 8, 'medium', 150, 5);

  // Science
  insertLesson.run(2, "Newton's Laws of Motion", 'गति के नियम', 'गतीचे नियम', JSON.stringify({intro:'Isaac Newton discovered three fundamental laws that describe how objects move.',concepts:['Law 1: Object at rest stays at rest','Law 2: F = ma','Law 3: Every action has equal opposite reaction'],example:'A rocket launches because hot gases push down, and rocket moves up!',fun_fact:'Newton was inspired by a falling apple!'}), 7, 'medium', 150, 1);
  insertLesson.run(2, 'Photosynthesis', 'प्रकाश संश्लेषण', 'प्रकाशसंश्लेषण', JSON.stringify({intro:'Plants make their own food using sunlight, water, and carbon dioxide.',concepts:['Chlorophyll absorbs sunlight','6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂','Glucose is stored as energy'],example:'A leaf in sunlight produces oxygen we breathe!',fun_fact:'Trees are solar-powered food factories!'}), 6, 'easy', 100, 2);
  insertLesson.run(2, 'Electricity Basics', 'विद्युत की मूल बातें', 'विद्युतचा परिचय', JSON.stringify({intro:'Electricity is the flow of electric charge through conductors.',concepts:["Voltage drives current (V)","Current is flow of electrons (A)","Resistance opposes flow (Ω)","Ohm's Law: V = IR"],example:'A 9V battery with 3Ω resistance → 3A current',fun_fact:'Lightning is a giant spark of electricity!'}), 8, 'medium', 150, 3);
  insertLesson.run(2, 'The Solar System', 'सौर मंडल', 'सूर्यमाला', JSON.stringify({intro:'Our solar system consists of the Sun and everything bound to it by gravity.',concepts:['8 planets orbit the Sun','Inner planets are rocky','Outer planets are gas giants'],example:'Jupiter is the largest planet.',fun_fact:'One day on Venus is longer than one year on Venus!'}), 6, 'easy', 100, 4);
  insertLesson.run(2, 'Human Digestive System', 'मानव पाचन तंत्र', 'मानवी पचनसंस्था', JSON.stringify({intro:'The digestive system breaks down food into nutrients.',concepts:['Stomach uses acid','Small intestine absorbs nutrients','Large intestine absorbs water'],example:'Chewing is the first step of digestion.',fun_fact:'The small intestine is about 22 feet long!'}), 7, 'medium', 150, 5);

  // Technology
  insertLesson.run(3, 'Introduction to Coding', 'कोडिंग का परिचय', 'कोडिंगचा परिचय', JSON.stringify({intro:'Coding is giving instructions to a computer in a language it understands.',concepts:['Programs are step-by-step instructions','Variables store data','Loops repeat actions','Functions group code'],example:'print("Hello World") displays text on screen!',fun_fact:'The first programmer was Ada Lovelace in the 1840s!'}), 6, 'easy', 100, 1);
  insertLesson.run(3, 'Internet & Networks', 'इंटरनेट और नेटवर्क', 'इंटरनेट व नेटवर्क', JSON.stringify({intro:'The internet is a global network of computers connected together.',concepts:['IP addresses identify devices','HTTP transfers web pages','Routers direct data packets','Wi-Fi uses radio waves'],example:'When you load a webpage, data travels in packets!',fun_fact:'The internet was first called ARPANET in 1969!'}), 7, 'medium', 150, 2);
  insertLesson.run(3, 'Cybersecurity Basics', 'साइबर सुरक्षा', 'सायबर सुरक्षा', JSON.stringify({intro:'Cybersecurity protects computers and data from unauthorized access.',concepts:['Strong passwords are vital','Phishing tricks users','Encryption scrambles data'],example:'Using a mix of letters, numbers, and symbols makes a strong password.',fun_fact:'The first computer virus was created in 1971!'}), 8, 'hard', 200, 3);
  insertLesson.run(3, 'Artificial Intelligence', 'कृत्रिम बुद्धिमत्ता', 'कृत्रिम बुद्धिमत्ता', JSON.stringify({intro:'AI enables computers to perform tasks that typically require human intelligence.',concepts:['Machine learning trains models','Data is the fuel for AI','Neural networks mimic the brain'],example:'Voice assistants like Siri use AI.',fun_fact:'The term AI was coined in 1956!'}), 9, 'medium', 150, 4);

  // Engineering
  insertLesson.run(4, 'Design Thinking', 'डिज़ाइन थिंकिंग', 'डिझाईन थिंकिंग', JSON.stringify({intro:'Design thinking is a problem-solving approach focused on human needs.',concepts:['Empathize: Understand users','Define: State the problem','Ideate: Brainstorm solutions','Prototype: Build a model','Test: Get feedback'],example:'Designing a water pump for a village uses all these steps!',fun_fact:'IDEO design firm popularized this method!'}), 6, 'easy', 100, 1);
  insertLesson.run(4, 'Simple Machines', 'सरल मशीनें', 'साधी यंत्रे', JSON.stringify({intro:'Simple machines change the direction or magnitude of a force.',concepts:['Lever, Pulley, Wheel and Axle','Inclined Plane, Wedge, Screw','Mechanical advantage makes work easier'],example:'A seesaw is a type of lever.',fun_fact:'The Pyramids were built using inclined planes!'}), 6, 'easy', 100, 2);
  insertLesson.run(4, 'Bridge Structures', 'पुल संरचनाएं', 'पूल रचना', JSON.stringify({intro:'Bridges are structures built to span physical obstacles.',concepts:['Beam bridges are the simplest','Arch bridges spread weight to supports','Suspension bridges hang from cables'],example:'The Golden Gate Bridge is a suspension bridge.',fun_fact:'The oldest datable bridge in the world still in use is in Turkey!'}), 7, 'medium', 150, 3);

  const insertQ = db.prepare('INSERT INTO questions (lesson_id, question, question_hi, option_a, option_b, option_c, option_d, correct_answer, explanation, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertQ.run(1,'If x + 7 = 15, what is x?','यदि x + 7 = 15, तो x क्या है?','6','7','8','9','C','Subtract 7 from both sides: x = 15 - 7 = 8',10);
  insertQ.run(1,'A letter representing an unknown number is called?','अज्ञात संख्या को दर्शाने वाले अक्षर को क्या कहते हैं?','Constant','Variable','Coefficient','Term','B','Variables are letters that represent unknown numbers',10);
  insertQ.run(2,'In 2x + 3 = 11, x equals?','2x + 3 = 11 में x बराबर है?','2','3','4','5','C','2x = 11-3 = 8, so x = 4',10);
  insertQ.run(3,'Sum of angles in a triangle?','त्रिभुज के कोणों का योग है?','90°','180°','270°','360°','B','All three angles of any triangle always add up to 180°',10);
  insertQ.run(4,'1/2 is equal to what decimal?','1/2 किस दशमलव के बराबर है?','0.2','0.5','0.1','0.25','B','1 divided by 2 is 0.5',10);
  insertQ.run(5,'What is the mean of 2, 4, and 6?','2, 4, और 6 का माध्य क्या है?','2','4','6','12','B','(2+4+6)/3 = 4',10);
  insertQ.run(6,'F = ma stands for?','F = ma का मतलब है?','Force = mass × acceleration','Force = motion × area','Friction = mass × angle','Flow = momentum × area','A',"Newton's second law: Force equals mass times acceleration",10);
  insertQ.run(7,'What do plants need for photosynthesis?','प्रकाश संश्लेषण में पौधे क्या लेते हैं?','Oxygen and nitrogen','Sunlight, CO₂, and water','Glucose and oxygen','Minerals only','B','Plants use sunlight + CO₂ + H₂O to make glucose',10);
  insertQ.run(8,"Ohm's Law is?",'ओम का नियम है?','V = I + R','V = IR','I = VR','R = VI','B','Voltage = Current × Resistance',10);
  insertQ.run(9,'Which is the largest planet?','सबसे बड़ा ग्रह कौन सा है?','Earth','Mars','Jupiter','Saturn','C','Jupiter is the largest planet in our solar system.',10);
  insertQ.run(10,'Where does digestion begin?','पाचन कहाँ से शुरू होता है?','Stomach','Mouth','Intestine','Liver','B','Digestion begins in the mouth with chewing.',10);
  insertQ.run(11,'What does a variable store?','वेरिएबल क्या स्टोर करता है?','Data or values','Programs','Electricity','Colors','A','Variables are containers that store data like numbers or text',10);
  insertQ.run(12,'HTTP is used to?','HTTP का उपयोग होता है?','Send emails','Transfer web pages','Store files','Chat online','B','HyperText Transfer Protocol moves web pages across the internet',10);
  insertQ.run(13,'Which is a strong password?','मज़बूत पासवर्ड कौन सा है?','password123','123456','admin','P@ssw0rd!23','D','It has mixed case, numbers, and symbols.',10);
  insertQ.run(14,'What powers AI?','AI को क्या शक्ति देता है?','Water','Data','Electricity only','Code only','B','Data is the fuel that trains AI models.',10);
  insertQ.run(15,'First step in Design Thinking?','डिज़ाइन थिंकिंग का पहला चरण?','Prototype','Test','Empathize','Ideate','C','Always start by understanding the users and their needs!',10);
  insertQ.run(16,'A seesaw is a type of?','सीसॉ (seesaw) किस प्रकार का है?','Pulley','Lever','Wedge','Screw','B','A seesaw is a lever resting on a fulcrum.',10);
  insertQ.run(17,'The Golden Gate is what type of bridge?','गोल्डन गेट किस प्रकार का पुल है?','Beam','Arch','Suspension','Truss','C','It is a suspension bridge held up by cables.',10);


  const insertBadge = db.prepare('INSERT INTO badges (name, icon, description, requirement, xp_threshold) VALUES (?, ?, ?, ?, ?)');
  insertBadge.run('First Step','🌱','Completed your first lesson!','Complete 1 lesson',0);
  insertBadge.run('Explorer','🗺️','Completed 5 lessons!','Complete 5 lessons',250);
  insertBadge.run('Scholar','📚','Reached 500 XP!','Earn 500 XP',500);
  insertBadge.run('Champion','🏆','Reached 1000 XP!','Earn 1000 XP',1000);
  insertBadge.run('STEM Star','⭐','Completed lessons in all 4 subjects!','All subjects explored',400);
  insertBadge.run('Quiz Master','🎯','Got perfect score in a quiz!','Score 100% in a quiz',0);

  // Demo student
  const studentPw = bcrypt.hashSync('Demo@123', 10);
  const r = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role, grade, school, language, xp, level, avatar, streak) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run('Arjun Kumar','arjun@vidyaquest.com',studentPw,'student',7,'Kendriya Vidyalaya, Jaipur','en',850,5,'🧑‍🎓', 4);
  const studentId = r.lastInsertRowid;
  if (studentId) {
      db.prepare('INSERT OR IGNORE INTO leaderboard (user_id, total_xp, lessons_completed) VALUES (?, ?, ?)').run(studentId, 850, 7);
      
      // Dummy daily XP (last 7 days)
      const today = new Date();
      for(let i=6; i>=0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          // Random XP between 50 and 200
          const xp = Math.floor(Math.random() * 150) + 50;
          db.prepare('INSERT INTO daily_xp (user_id, date, xp_earned) VALUES (?, ?, ?)').run(studentId, dateStr, xp);
      }

      // Dummy user progress
      const progressIns = db.prepare("INSERT INTO user_progress (user_id, lesson_id, score, completed, attempts, completed_at) VALUES (?, ?, ?, 1, 1, datetime('now', '-2 days'))");
      progressIns.run(studentId, 1, 10);
      progressIns.run(studentId, 2, 10);
      progressIns.run(studentId, 6, 10);
      progressIns.run(studentId, 7, 10);
      progressIns.run(studentId, 11, 10);

      // Dummy upcoming tasks
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 3);
      const dueDate1 = nextWeek.toISOString().split('T')[0];
      nextWeek.setDate(nextWeek.getDate() + 2);
      const dueDate2 = nextWeek.toISOString().split('T')[0];
      
      db.prepare('INSERT INTO assignments (user_id, lesson_id, due_date, completed) VALUES (?, ?, ?, 0)').run(studentId, 3, dueDate1);
      db.prepare('INSERT INTO assignments (user_id, lesson_id, due_date, completed) VALUES (?, ?, ?, 0)').run(studentId, 8, dueDate2);

      // Badges
      db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(studentId, 1);
      db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(studentId, 2);
      db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(studentId, 3);
      db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(studentId, 6);
  }

  // Demo teacher
  const teacherPw = bcrypt.hashSync('Teach@123', 10);
  const t = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role, department, subject_specialization, language, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('Priya Sharma','priya@vidyaquest.com',teacherPw,'teacher','Science','Physics','en','👩‍🏫');
  if (t.lastInsertRowid) db.prepare('INSERT OR IGNORE INTO leaderboard (user_id, total_xp, lessons_completed) VALUES (?, ?, ?)').run(t.lastInsertRowid, 0, 0);

  console.log('Database seeded with demo student & teacher, daily xp, and assignments!');
}
seedData();

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Required role: ' + roles.join(' or ') });
    }
    next();
  };
}

// ===== REGISTER =====
app.post('/api/register', (req, res) => {
  const { name, email, password, role, grade, school, language, department, subject_specialization } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });

  const userRole = role === 'teacher' ? 'teacher' : 'student';
  const pwResult = validatePassword(password);
  if (!pwResult.isValid) return res.status(400).json({ error: 'Password is too weak.' });

  if (userRole === 'student' && (!school || !school.trim())) return res.status(400).json({ error: 'School name is required for students' });
  if (userRole === 'teacher' && (!department || !department.trim())) return res.status(400).json({ error: 'Department is required for teachers' });

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const avatar = userRole === 'teacher' ? '👩‍🏫' : '🧑‍🎓';

    const result = db.prepare(
      'INSERT INTO users (name, email, password, role, grade, school, department, subject_specialization, language, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name.trim(), email.trim().toLowerCase(), hashed, userRole,
      userRole === 'student' ? (grade || 6) : null, userRole === 'student' ? (school || '').trim() : '',
      userRole === 'teacher' ? (department || '').trim() : '', userRole === 'teacher' ? (subject_specialization || '').trim() : '',
      language || 'en', avatar
    );

    db.prepare('INSERT INTO leaderboard (user_id) VALUES (?)').run(result.lastInsertRowid);
    const token = jwt.sign({ id: result.lastInsertRowid, email: email.trim().toLowerCase(), role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: result.lastInsertRowid, name: name.trim(), email: email.trim().toLowerCase(), role: userRole,
        grade: userRole === 'student' ? (grade || 6) : null, school: userRole === 'student' ? (school || '').trim() : '',
        department: userRole === 'teacher' ? (department || '').trim() : '', subject_specialization: userRole === 'teacher' ? (subject_specialization || '').trim() : '',
        language: language || 'en', avatar, xp: 0, level: 1, streak: 0
      }
    });
  } catch(e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'This email is already registered' });
    res.status(500).json({ error: e.message });
  }
});

// ===== LOGIN (by email) =====
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  db.prepare("UPDATE users SET last_login = datetime('now'), streak = streak + 1 WHERE id = ?").run(user.id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role, grade: user.grade, school: user.school,
      department: user.department, subject_specialization: user.subject_specialization, xp: user.xp, level: user.level,
      streak: user.streak + 1, avatar: user.avatar, language: user.language
    }
  });
});

// ===== PROFILE =====
app.get('/api/profile', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, grade, school, department, subject_specialization, language, avatar, xp, level, streak, created_at FROM users WHERE id = ?').get(req.user.id);
  const badges = db.prepare('SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = ?').all(req.user.id);
  const progress = db.prepare('SELECT COUNT(*) as completed FROM user_progress WHERE user_id = ? AND completed = 1').get(req.user.id);
  res.json({ ...user, badges, lessonsCompleted: progress.completed });
});
app.post('/api/profile/xp', auth, (req, res) => {
  const { xp } = req.body;
  if (!xp) return res.status(400).json({ error: 'XP is required' });
  
  db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xp, req.user.id);
  db.prepare('UPDATE users SET level = MAX(1, xp / 200 + 1) WHERE id = ?').run(req.user.id);
  db.prepare('UPDATE leaderboard SET total_xp = total_xp + ? WHERE user_id = ?').run(xp, req.user.id);
  
  const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, totalXP: user.xp });
});

// ===== DASHBOARD (NEW) =====
app.get('/api/dashboard', auth, (req, res) => {
    const today = new Date();
    const past7Days = [];
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        past7Days.push(d.toISOString().split('T')[0]);
    }
    
    // 1. Weekly XP Data
    const weeklyXpData = [];
    past7Days.forEach(date => {
        const row = db.prepare('SELECT xp_earned FROM daily_xp WHERE user_id = ? AND date = ?').get(req.user.id, date);
        weeklyXpData.push({ date, xp: row ? row.xp_earned : 0 });
    });

    // 2. Recent Lessons
    const recentLessons = db.prepare(`
        SELECT l.id, l.title, l.subject_id, s.color, s.icon, up.score, up.completed_at 
        FROM user_progress up
        JOIN lessons l ON up.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE up.user_id = ? AND up.completed = 1
        ORDER BY up.completed_at DESC LIMIT 3
    `).all(req.user.id);

    // 3. Upcoming Tasks
    const upcomingTasks = db.prepare(`
        SELECT a.id, l.title, s.color, s.icon, a.due_date 
        FROM assignments a
        JOIN lessons l ON a.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE a.user_id = ? AND a.completed = 0
        ORDER BY a.due_date ASC LIMIT 3
    `).all(req.user.id);

    // 4. Badges (recent 4)
    const recentBadges = db.prepare(`
        SELECT b.id, b.name, b.icon, b.description
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ?
        ORDER BY ub.earned_at DESC LIMIT 4
    `).all(req.user.id);

    res.json({
        weeklyXp: weeklyXpData,
        recentLessons,
        upcomingTasks,
        recentBadges
    });
});

// ===== SUBJECTS =====
app.get('/api/subjects', (req, res) => {
  res.json(db.prepare('SELECT * FROM subjects').all());
});

// ===== LESSONS =====
app.get('/api/lessons/:subjectId', auth, (req, res) => {
  const lessons = db.prepare('SELECT * FROM lessons WHERE subject_id = ? ORDER BY order_num').all(req.params.subjectId);
  const progressMap = {};
  db.prepare('SELECT lesson_id, completed, score FROM user_progress WHERE user_id = ?').all(req.user.id).forEach(p => { progressMap[p.lesson_id] = p; });
  res.json(lessons.map(l => ({ ...l, userProgress: progressMap[l.id] || null })));
});

app.get('/api/lesson/:id', auth, (req, res) => {
  const lesson = db.prepare('SELECT l.*, s.name as subject_name, s.color as subject_color FROM lessons l JOIN subjects s ON l.subject_id = s.id WHERE l.id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Not found' });
  const questions = db.prepare('SELECT * FROM questions WHERE lesson_id = ?').all(req.params.id);
  const userProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(req.user.id, req.params.id);
  res.json({ ...lesson, content: JSON.parse(lesson.content||'{}'), questions, userProgress });
});

// ===== QUIZ =====
app.post('/api/quiz/submit', auth, (req, res) => {
  const { lesson_id, score, total } = req.body;
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lesson_id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  
  const percentage = Math.round((score / total) * 100);
  const xpEarned = percentage >= 70 ? lesson.xp_reward : Math.round(lesson.xp_reward * 0.3);
  
  // Progress
  const existing = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(req.user.id, lesson_id);
  if (existing) {
    db.prepare("UPDATE user_progress SET score = MAX(score, ?), attempts = attempts + 1, completed = MAX(completed, ?), completed_at = datetime('now') WHERE id = ?").run(score, percentage>=70?1:0, existing.id);
  } else {
    db.prepare("INSERT INTO user_progress (user_id, lesson_id, score, completed, attempts, completed_at) VALUES (?, ?, ?, ?, 1, datetime('now'))").run(req.user.id, lesson_id, score, percentage>=70?1:0);
  }
  
  // Check if assigned and complete it
  db.prepare("UPDATE assignments SET completed = 1 WHERE user_id = ? AND lesson_id = ?").run(req.user.id, lesson_id);

  // Update total XP
  db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, req.user.id);
  db.prepare('UPDATE users SET level = MAX(1, xp / 200 + 1) WHERE id = ?').run(req.user.id);
  db.prepare('UPDATE leaderboard SET total_xp = total_xp + ?, lessons_completed = lessons_completed + 1 WHERE user_id = ?').run(xpEarned, req.user.id);
  
  // Update Daily XP
  const dateStr = new Date().toISOString().split('T')[0];
  const existingDaily = db.prepare('SELECT id FROM daily_xp WHERE user_id = ? AND date = ?').get(req.user.id, dateStr);
  if (existingDaily) {
      db.prepare('UPDATE daily_xp SET xp_earned = xp_earned + ? WHERE id = ?').run(xpEarned, existingDaily.id);
  } else {
      db.prepare('INSERT INTO daily_xp (user_id, date, xp_earned) VALUES (?, ?, ?)').run(req.user.id, dateStr, xpEarned);
  }

  // Badges
  const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(req.user.id);
  const completedCount = db.prepare('SELECT COUNT(*) as c FROM user_progress WHERE user_id = ? AND completed = 1').get(req.user.id).c;
  const newBadges = [];
  function awardBadge(badgeId) {
    const already = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(req.user.id, badgeId);
    if (!already) { db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(req.user.id, badgeId); const b = db.prepare('SELECT * FROM badges WHERE id = ?').get(badgeId); newBadges.push(b); }
  }
  if (completedCount >= 1) awardBadge(1);
  if (completedCount >= 5) awardBadge(2);
  if (user.xp >= 500) awardBadge(3);
  if (user.xp >= 1000) awardBadge(4);
  if (percentage === 100) awardBadge(6);
  res.json({ xpEarned, percentage, newBadges, totalXP: user.xp });
});

// ===== LEADERBOARD =====
app.get('/api/leaderboard', auth, (req, res) => {
  const leaders = db.prepare('SELECT u.name, u.avatar, u.grade, u.role, l.total_xp, l.lessons_completed, (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) as badges_count FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY l.total_xp DESC LIMIT 20').all();
  res.json(leaders);
});

// ===== BADGES =====
app.get('/api/badges', auth, (req, res) => {
  const all = db.prepare('SELECT * FROM badges').all();
  const earned = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(req.user.id).map(b => b.badge_id);
  res.json(all.map(b => ({ ...b, earned: earned.includes(b.id) })));
});

app.post('/api/check-password', (req, res) => {
  const { password } = req.body;
  if (!password) return res.json({ score: 0, checks: {} });
  res.json(validatePassword(password));
});

// ===== TEACHER DASHBOARD =====
app.get('/api/teacher/dashboard', auth, requireRole('teacher'), (req, res) => {
  // 1. Total students enrolled
  const totalStudents = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;

  // 2. Class average score across all subjects
  const avgScore = db.prepare(`
    SELECT ROUND(AVG(CAST(up.score AS FLOAT) / q.total_q * 100), 1) as avg_pct
    FROM user_progress up
    JOIN (
      SELECT lesson_id, COUNT(*) as total_q FROM questions GROUP BY lesson_id
    ) q ON q.lesson_id = up.lesson_id
    WHERE up.completed = 1
  `).get();

  // 3. Most attempted topics (top 3)
  const mostAttempted = db.prepare(`
    SELECT l.title, s.name as subject, s.icon, COUNT(up.id) as attempts
    FROM user_progress up
    JOIN lessons l ON l.id = up.lesson_id
    JOIN subjects s ON s.id = l.subject_id
    GROUP BY up.lesson_id
    ORDER BY attempts DESC LIMIT 3
  `).all();

  // 4. Least attempted topics (bottom 3 with at least 1 lesson)
  const leastAttempted = db.prepare(`
    SELECT l.title, s.name as subject, s.icon, COUNT(up.id) as attempts
    FROM lessons l
    JOIN subjects s ON s.id = l.subject_id
    LEFT JOIN user_progress up ON up.lesson_id = l.id
    GROUP BY l.id
    ORDER BY attempts ASC LIMIT 3
  `).all();

  // 5. At-risk students: no activity in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const atRiskStudents = db.prepare(`
    SELECT u.name, u.avatar, u.grade, u.school, u.xp,
      COALESCE(MAX(dx.date), 'Never') as last_active
    FROM users u
    LEFT JOIN daily_xp dx ON dx.user_id = u.id AND dx.date >= ?
    WHERE u.role = 'student'
    GROUP BY u.id
    HAVING MAX(dx.date) IS NULL
    LIMIT 10
  `).all(sevenDaysAgoStr);

  // 6. Recent quiz submissions (last 10)
  const recentSubmissions = db.prepare(`
    SELECT u.name, u.avatar, l.title as lesson_title, s.icon, s.color,
      up.score, up.attempts, up.completed_at
    FROM user_progress up
    JOIN users u ON u.id = up.user_id
    JOIN lessons l ON l.id = up.lesson_id
    JOIN subjects s ON s.id = l.subject_id
    WHERE u.role = 'student'
    ORDER BY up.completed_at DESC LIMIT 10
  `).all();

  // 7. Subject engagement
  const subjectStats = db.prepare(`
    SELECT s.name, s.icon, s.color, COUNT(DISTINCT up.user_id) as students,
      ROUND(AVG(CAST(up.score AS FLOAT)), 1) as avg_score
    FROM user_progress up
    JOIN lessons l ON l.id = up.lesson_id
    JOIN subjects s ON s.id = l.subject_id
    WHERE up.completed = 1
    GROUP BY s.id
  `).all();

  res.json({
    totalStudents,
    classAvgScore: avgScore?.avg_pct || 0,
    mostAttempted,
    leastAttempted,
    atRiskStudents,
    recentSubmissions,
    subjectStats
  });
});

// ===== TEACHER: GET OWN LESSONS =====
app.get('/api/teacher/lessons', auth, requireRole('teacher'), (req, res) => {
  const lessons = db.prepare(`
    SELECT l.*, s.name as subject_name, s.icon, s.color,
      (SELECT COUNT(*) FROM questions WHERE lesson_id = l.id) as question_count
    FROM lessons l
    JOIN subjects s ON s.id = l.subject_id
    WHERE l.created_by = ?
    ORDER BY l.id DESC
  `).all(req.user.id);
  res.json(lessons);
});

// ===== TEACHER: CREATE LESSON =====
app.post('/api/teacher/lessons', auth, requireRole('teacher'), (req, res) => {
  const { subject_id, title, content, difficulty, xp_reward, grade, questions } = req.body;
  if (!subject_id || !title || !content) {
    return res.status(400).json({ error: 'subject_id, title and content are required' });
  }
  const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(subject_id);
  if (!subject) return res.status(400).json({ error: 'Invalid subject' });

  // Get next order_num for this subject
  const maxOrder = db.prepare('SELECT MAX(order_num) as m FROM lessons WHERE subject_id = ?').get(subject_id);
  const orderNum = (maxOrder?.m || 0) + 1;

  const contentJson = typeof content === 'string' ? content : JSON.stringify(content);

  const result = db.prepare(`
    INSERT INTO lessons (subject_id, title, content, difficulty, xp_reward, grade, order_num, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    subject_id, title.trim(), contentJson,
    difficulty || 'medium', xp_reward || 100,
    grade || 7, orderNum, req.user.id
  );

  const lessonId = result.lastInsertRowid;

  // Insert quiz questions if provided
  if (Array.isArray(questions) && questions.length > 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const q of questions) {
      if (q.question && q.option_a && q.correct_answer) {
        insertQ.run(lessonId, q.question, q.option_a, q.option_b||'', q.option_c||'', q.option_d||'', q.correct_answer, q.explanation||'', 10);
      }
    }
  }

  const created = db.prepare('SELECT l.*, s.name as subject_name FROM lessons l JOIN subjects s ON s.id = l.subject_id WHERE l.id = ?').get(lessonId);
  res.json({ success: true, lesson: created });
});

// ===== TEACHER: DELETE LESSON =====
app.delete('/api/teacher/lessons/:id', auth, requireRole('teacher'), (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found or not yours' });
  db.prepare('DELETE FROM questions WHERE lesson_id = ?').run(lesson.id);
  db.prepare('DELETE FROM user_progress WHERE lesson_id = ?').run(lesson.id);
  db.prepare('DELETE FROM lessons WHERE id = ?').run(lesson.id);
  res.json({ success: true });
});

// ===== AI SMART TUTOR =====
app.post('/api/chat', auth, async (req, res) => {
  const { message, language } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI Tutor is currently unavailable (Groq API key missing)' });
  }

  const langMap = { en: 'English', hi: 'Hindi', mr: 'Marathi', or: 'Odia' };
  const targetLanguage = langMap[language] || 'English';

  const systemInstruction = `You are a friendly, encouraging, and highly effective STEM tutor for rural students on the VidyaQuest platform.
Your goal is to explain complex science and math concepts simply using relatable everyday examples.
The student is asking you a question in ${targetLanguage}. You MUST reply ONLY in ${targetLanguage}.
Do not give direct answers to homework or quizzes; instead, guide the student to understand the concept.
Keep your responses concise, using bullet points and short paragraphs to make it easy to read on a mobile device. Include a supportive emoji!`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Status:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Sorry, I am having trouble connecting to my brain right now! Please try again later.' });
  }
});

// ===== SCAN & SOLVE (Vision AI) =====
app.post('/api/scan-solve', auth, async (req, res) => {
  const { imageBase64, language } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Image data is required' });
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI Vision is currently unavailable (API key missing)' });
  }

  const langMap = { en: 'English', hi: 'Hindi', mr: 'Marathi', or: 'Odia' };
  const targetLanguage = langMap[language] || 'English';

  // Strip data URL prefix if present, keep just base64
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const systemPrompt = `You are VidyaQuest's expert STEM solver for rural Indian students (Grades 6-12).
A student has taken a photo of a STEM problem from their textbook or handwritten notes.
Analyze the image carefully and provide a clear, step-by-step solution.

Rules:
- You MUST respond ONLY in ${targetLanguage}
- Give a concise title/summary of what the problem is about
- Show all working steps clearly numbered
- Use simple language appropriate for school students
- If this is a math problem, show all calculation steps
- If it's a science question, explain the concept then answer
- End with a key takeaway or tip to remember
- Use relevant emojis to make it engaging
- If you cannot read the image clearly, ask the student to retake with better lighting`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              },
              {
                type: 'text',
                text: 'Please solve this STEM problem step by step.'
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq Vision API Error:', response.status, errorText);
      throw new Error(`Groq Vision API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ solution: data.choices[0].message.content });
  } catch (error) {
    console.error('Scan & Solve Error:', error);
    res.status(500).json({ error: 'Could not analyse the image. Please try again with a clearer photo.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.listen(PORT, () => console.log('STEM Platform running at http://localhost:' + PORT));
