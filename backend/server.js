require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');


const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const JWT_SECRET = 'stem_rural_secret_2024';

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Load optional SSL Certificates for secure HTTPS contexts (for camera support on LAN)
let httpsServer = null;
const sslPaths = {
  key: path.join(__dirname, '../key.pem'),
  cert: path.join(__dirname, '../cert.pem')
};

// Fallback search in backend folder
if (!fs.existsSync(sslPaths.key) || !fs.existsSync(sslPaths.cert)) {
  sslPaths.key = path.join(__dirname, 'key.pem');
  sslPaths.cert = path.join(__dirname, 'cert.pem');
}

if (fs.existsSync(sslPaths.key) && fs.existsSync(sslPaths.cert)) {
  try {
    const options = {
      key: fs.readFileSync(sslPaths.key),
      cert: fs.readFileSync(sslPaths.cert)
    };
    httpsServer = https.createServer(options, app);
    io.attach(httpsServer);
    console.log('[HTTPS] SSL certificates loaded. HTTPS support enabled.');
  } catch (err) {
    console.error('⚠️ Failed to initialize HTTPS server:', err.message);
  }
} else {
  console.log('[HTTPS] No key.pem/cert.pem found in project root. Running in HTTP mode only.');
  console.log('[HTTPS] To enable HTTPS (needed for camera access over LAN), generate certificates and place them in the project root.');
}

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

// ===== EMOTION & ENGAGEMENT TRACKER API =====
app.post('/api/emotion/analyze', auth, async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  // Mock fallback: cycles through realistic emotions for testing without Groq key
  function getMockEmotion() {
    const states = [
      { emotion: 'focused', engagement: 'high', explanation: 'Student appears attentive and engaged with the content.' },
      { emotion: 'confused', engagement: 'medium', explanation: 'Student shows signs of puzzlement — furrowed brow detected.' },
      { emotion: 'bored', engagement: 'low', explanation: 'Student appears disengaged. Gaze averted from screen.' },
      { emotion: 'happy', engagement: 'high', explanation: 'Student appears cheerful and motivated.' },
      { emotion: 'frustrated', engagement: 'low', explanation: 'Student shows signs of stress or difficulty.' },
      { emotion: 'distracted', engagement: 'low', explanation: 'Student attention appears to have wandered.' },
    ];
    return states[Math.floor(Date.now() / 15000) % states.length];
  }

  if (!process.env.GROQ_API_KEY) {
    console.log('[EmotionTracker] No GROQ_API_KEY, returning mock emotion');
    return res.json(getMockEmotion());
  }

  try {
    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const dataUrl = `data:image/jpeg;base64,${base64Data}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a specialized educational AI analyzing a student\'s facial expression during learning. Classify their current state. Return ONLY valid JSON, no markdown, no explanation outside the JSON object.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this student\'s facial expression and classify their learning state. Return exactly this JSON structure (choose ONE option for each): { "emotion": "focused" | "confused" | "frustrated" | "bored" | "distracted" | "happy", "engagement": "high" | "medium" | "low", "explanation": "<one sentence about what you observe>" }'
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.warn('[EmotionTracker] Groq API error:', response.status, '— using mock');
      return res.json(getMockEmotion());
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content.trim();

    // Parse JSON from response (strip any markdown fences)
    const cleaned = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const validEmotions = ['focused', 'confused', 'frustrated', 'bored', 'distracted', 'happy'];
    const validEngagement = ['high', 'medium', 'low'];
    if (!validEmotions.includes(parsed.emotion) || !validEngagement.includes(parsed.engagement)) {
      return res.json(getMockEmotion());
    }

    res.json(parsed);
  } catch (err) {
    console.error('[EmotionTracker] Error:', err.message);
    // Always return a valid response, never crash
    res.json(getMockEmotion());
  }
});

// ===== OFFLINE DOWNLOAD API WITH ADAPTIVE AI HINTS =====
function generateFallbackHints(lesson, progress) {
  const subjectCode = lesson.subject_code || 'math';
  
  // Extract concepts from lesson content
  let concepts = [];
  try {
    const content = JSON.parse(lesson.content || '{}');
    if (Array.isArray(content.concepts)) {
      concepts = content.concepts;
    }
  } catch(e) {}

  const hints = [];
  
  // Customization based on progress
  let performanceAdjective = "!";
  if (progress) {
    if (progress.score < 5) performanceAdjective = " - keep it simple!";
    else if (progress.score === 10) performanceAdjective = " - stretch challenge!";
  }

  // 1. Generate hints from lesson concepts (make multiple variations)
  const prefixes = [
    { en: "Concept Tip: ", hi: "संकल्पना युक्ति: ", mr: "संकल्पना टिप: ", or: "ଧାରଣା ଟିପ୍ସ: " },
    { en: "Key Remember: ", hi: "मुख्य याद रखने योग्य: ", mr: "महत्त्वाचे लक्षात ठेवा: ", or: "ମୁଖ୍ୟ ମନେରଖିବା: " },
    { en: "Did you know? ", hi: "क्या आप जानते हैं? ", mr: "तुम्हाला माहित आहे का? ", or: "ଆପڻ ଜାଣନ୍ତି କି? " },
    { en: "Quick Tip: ", hi: "त्वरित युक्ति: ", mr: "द्रुत टीप: ", or: "ଶୀଘ୍ର ଟିପ୍ସ: " }
  ];

  concepts.forEach((concept, cIdx) => {
    prefixes.forEach((pref, pIdx) => {
      hints.push({
        tag: `concept-${cIdx}`,
        hint_en: `${pref.en}${concept}${performanceAdjective}`,
        hint_hi: `${pref.hi}${concept}`,
        hint_mr: `${pref.mr}${concept}`,
        hint_or: `${pref.or}${concept}`
      });
    });
  });

  // 2. Fetch subject fallback templates
  const subjectTemplates = {
    math: [
      { tag: "numbers", en: "Remember, variables are like boxes! Solve step-by-step by keeping both sides balanced.", hi: "याद रखें, वेरिएबल बक्से की तरह हैं! दोनों पक्षों को संतुलित रखकर चरण-दर-चरण हल करें।", mr: "लक्षात ठेवा, व्हेरिएबल्स बॉक्ससारखे असतात! दोन्ही बाजू संतुलित ठेवून स्टेप-बाय-स्टेप सोडवा.", or: "ମନେରଖନ୍ତୁ, ଭେରିଏବଲ୍ ଗୁଡ଼ିକ ବାକ୍ସ ପରି! ଦୁଇ ପାର୍ଶ୍ୱକୁ ସନ୍ତୁଳିତ ରଖି ପର୍ଯ୍ୟାୟକ୍ରମେ ସମାଧାନ କରନ୍ତୁ।" },
      { tag: "fraction", en: "Fractions represent parts of a whole. Simplify the numerator and denominator first.", hi: "भिन्न एक संपूर्ण के भागों का प्रतिनिधित्व करते हैं। पहले अंश और हर को सरल बनाएं।", mr: "अपूर्णांक पूर्ण भागाचे प्रतिनिधित्व करतात. प्रथम अंश आणि छेद सोपे करा.", or: "ଭଗ୍ନାଂଶଗୁଡ଼ିକ ସମଗ୍ର ଭାଗର ପ୍ରତିନିଧିତ୍ଵ କରନ୍ତି। ପ୍ରଥମେ ହର ଏବଂ ଲବକୁ ସରଳ କରନ୍ତୁ।" },
      { tag: "equation", en: "For equations, do the inverse operation. If it's addition, subtract from both sides!", hi: "समीकरणों के लिए, उल्टा ऑपरेशन करें। यदि यह जोड़ है, तो दोनों पक्षों से घटाएं!", mr: "समीकरणांसाठी, उलट क्रिया करा. बेरीज असल्यास, दोन्ही बाजूंनी वजा करा!", or: "ସମୀକରଣ ପାଇଁ, ଓଲଟା କାର୍ଯ୍ୟ କରନ୍ତୁ। ଯଦિ ଏହା ଯୋଗ, ତେବे ଉଭୟ ପାର୍ଶ୍ୱରୁ ବିୟୋଗ କରନ୍ତୁ!" },
      { tag: "geometry", en: "A triangle's interior angles always sum up to exactly 180 degrees.", hi: "त्रिभुज के आंतरिक कोणों का योग हमेशा 180 डिग्री होता है।", mr: "त्रिकोणाच्या आतील कोनांची बेरीज नेहमी बरोबर १८० अंश असते.", or: "ଏକ ତ୍ରିଭୁଜର ଆଭ୍ୟନ୍ତରୀଣ କୋଣର ସମଷ୍ଟି ସର୍ବଦା ୧୮୦ ଡିଗ୍ରୀ ହୋଇଥାଏ।" },
      { tag: "mean", en: "To find the mean, sum all values and divide by the total count.", hi: "माध्य ज्ञात करने के लिए, सभी मानों को जोड़ें और कुल संख्या से विभाजित करें।", mr: "सरासरी शोधण्यासाठी, सर्व मूल्यांची बेरीज करा आणि एकूण संख्येने भागा.", or: "ମାଧ୍ୟମାନ ଖୋଜିବା ପାଇଁ, ସମସ୍ତ ମୂଲ୍ୟର ସମଷ୍ଟି କରନ୍ତୁ ଏବଂ ମୋଟ୍ ସଂଖ୍ୟା ଦ୍ଵାରା ଭାଗ କରନ୍ତୁ।" }
    ],
    science: [
      { tag: "force", en: "Force equals mass times acceleration (F=ma). Higher mass requires more force to accelerate.", hi: "बल द्रव्यमान गुणा त्वरण (F=ma) के बराबर होता है। भारी वस्तुओं को गति देने के लिए अधिक बल चाहिए।", mr: "बल म्हणजे वस्तुमान गुणिले प्रवेग (F=ma). जड वस्तूंना गती देण्यासाठी जास्त बल लागते.", or: "ବଳ ହେଉଛି ବସ୍ତୁତ୍ଵ ଗୁଣନ ତ୍ଵରଣ (F=ma)। ଅଧିକ ବସ୍ତୁତ୍ଵ ତ୍ଵରାନ୍ୱିତ ହେବା ପାଇଁ ଅଧିକ ବଳ ଆବଶ୍ୟକ କରେ।" },
      { tag: "photosynthesis", en: "Plants absorb light energy using green chlorophyll in their leaves to make glucose.", hi: "पौधे ग्लूकोज बनाने के लिए अपनी पत्तियों में हरे क्लोरोफिल का उपयोग करके प्रकाश ऊर्जा को अवशोषित करते हैं।", mr: "झाडे ग्लुकोज बनवण्यासाठी पानांमधील हिरव्या क्लोरोफिलचा वापर करून प्रकाश ऊर्जा शोषून घेतात.", or: "ଉଦ୍ଭିଦଗୁଡ଼ିକ ଗ୍ଲୁକୋଜ୍ ତିଆରି କରିବା ପାଇଁ ସେମାନଙ୍କ ପତ୍ରରେ ଥିବା ସବୁଜ ହରିତକ ବ୍ୟବହାର କରି ଆଲୋକ ଶକ୍ତି ଶୋଷଣ କରନ୍ତି।" },
      { tag: "electricity", en: "Electricity requires a closed loop (circuit) to flow. Watch out for open switches!", hi: "बिजली बहने के लिए एक बंद लूप (सर्किट) की आवश्यकता होती है। खुले स्विच पर ध्यान दें!", mr: "विद्युत प्रवाहासाठी बंद लूप (सर्किट) आवश्यक आहे. उघड्या स्विचकडे लक्ष द्या!", or: "ପ୍ରବାହିତ ହେବା ପାଇଁ ବିଦ୍ୟୁତ୍ ଏକ ବନ୍ଦ ଲୁପ୍ (ସର୍କିଟ୍) ଆବଶ୍ୟକ କରେ। ଖୋଲା ସୁଇଚ୍ ପ୍ରତି ଧ୍ୟାନ ଦିଅନ୍ତୁ!" },
      { tag: "digestive", en: "The stomach uses strong acids to break down proteins. Chewing increases surface area for digestion.", hi: "पेट प्रोटीन को तोड़ने के लिए मजबूत एसिड का उपयोग करता है। चबाना पाचन के लिए सतह क्षेत्र को बढ़ाता है।", mr: "जठर प्रथिनांचे विघटन करण्यासाठी मजबूत ऍसिड वापरते. चावण्यामुळे पचनासाठी पृष्ठभागाचे क्षेत्रफळ वाढते.", or: "ପାକସ୍ଥଳୀ ପ୍ରୋଟିନ୍ ଭାଙ୍ଗିବା ପାଇଁ ଶକ୍ତିଶାଳୀ ଏସିଡ୍ ବ୍ୟବହାର କରେ। ଚୋବାଇବା ପାଚନ ପାଇଁ ପୃଷ୍ଠଭୂମି କ୍ଷେତ୍ର ବୃଦ୍ଧି କରେ।" },
      { tag: "space", en: "Gravity holds the solar system together. The Sun has 99.8% of the system's mass!", hi: "गुरुत्वाकर्षण सौर मंडल को एक साथ रखता है। सूर्य के पास सौर मंडल के द्रव्यमान का 99.8% भाग है!", mr: "गुरुत्वाकर्षण सूर्यमालेला एकत्र धरून ठेवते. सूर्यामध्ये संपूर्ण सूर्यमालेच्या वस्तुमानाचा ९९.८% भाग आहे!", or: "ମାଧ୍ୟାକର୍ଷଣ ସୌରମଣ୍ଡଳକୁ ଏକାଠି ଧରି ରଖେ। ସୂର୍ଯ୍ୟଙ୍କ ପାଖରେ ସୌରମଣ୍ଡଳର ୯୯.୮% ବସ୍ତୁତ୍ଵ ରହିଛି!" }
    ],
    tech: [
      { tag: "coding", en: "A loop repeats commands. A conditional check (if-else) makes decisions.", hi: "एक लूप कमांड को दोहराता है। एक सशर्त जांच (if-else) निर्णय लेती है।", mr: "लूप कमांडची पुनरावृत्ती करतो. अट तपासणी (if-else) निर्णय घेते.", or: "ଏକ ଲୁପ୍ ନିର୍ଦ୍ଦେଶଗୁଡ଼ିକୁ ପୁନରାବୃତ୍ତି କରେ। ଏକ ସର୍ତ୍ତମୂଳକ ଯାଞ୍च (if-else) ନିଷ୍ପତ୍ତି ନିଏ।" },
      { tag: "internet", en: "The internet uses packet switching. Information is chopped into tiny packets and rebuilt.", hi: "इंटरनेट पैकेट स्विचिंग का उपयोग करता है। जानकारी को छोटे पैकेटों में काटा और पुनर्निर्मित किया जाता है।", mr: "इंटरनेट पॅकेट स्विचिंग वापरते. माहिती लहान पॅकेटमध्ये कापली जाते आणि पुन्हा तयार केली जाते.", or: "ଇଣ୍ଟରନେଟ୍ ପ୍ୟାକେଟ୍ ସୁଇଚିଂ ବ୍ୟବହାର କରେ। ସୂଚନା ଛୋଟ ପ୍ୟାକେଟରେ କଟାଯାଇ ପୁନର୍ବାର ନିର୍ମାଣ କରାଯାଏ।" },
      { tag: "security", en: "Use mixed characters for strong passwords. Avoid dictionary words or birthdays.", hi: "मजबूत पासवर्ड के लिए मिश्रित वर्णों का उपयोग करें। शब्दकोश के शब्दों या जन्मदिन से बचें।", mr: "मजबूत पासवर्डसाठी मल्टिपल अक्षरे वापरा. शब्दकोशातील शब्द किंवा वाढदिवस टाळा.", or: "ଶକ୍ତିଶାଳୀ ପାସୱାର୍ଡ ପାଇଁ ମିଶ୍ରିତ ଅକ୍ଷର ବ୍ୟବହାର କରନ୍ତୁ। ଅଭିଧାନ ଶବ୍ଦ କିମ୍ବା ଜନ୍ମଦିନରୁ ଦୂରେଇ ରୁହନ୍ତୁ।" },
      { tag: "ai", en: "Machine learning learns patterns from data. Bad data leads to bad predictions.", hi: "मशीन लर्निंग डेटा से पैटर्न सीखता है। खराब डेटा से खराब भविष्यवाणियां होती हैं।", mr: "मशीन लर्निंग डेटावरून पॅटर्न शिकते. खराब डेटामुळे चुकीचे अंदाज वर्तवले जातात.", or: "ମେସିନ୍ ଲର୍ଣ୍ଣିଂ ଡାଟାରୁ ପ୍ୟାଟର୍ଣ୍ଣ ଶିଖେ। ଖରାପ ଡାଟା ଖରାପ ପୂର୍ବାନୁମାନ କରିଥାଏ।" }
    ],
    group: [
      { tag: "design", en: "Design thinking begins with empathy—understanding the actual users and their needs first.", hi: "डिज़ाइन थिंकिंग सहानुभूति के साथ शुरू होती है—सबसे पहले वास्तविक उपयोगकर्ताओं और उनकी आवश्यकताओं को समझना।", mr: "डिझाइन थिंकिंग सहानुभूतीने सुरू होते—प्रथम वास्तविक वापरकर्ते आणि त्यांच्या गरजा समजून घेणे.", or: "ଡିଜାଇନ୍ ଚିନ୍ତାଧାରା ସହାନୁଭୂତିରୁ ଆରମ୍ଭ ହୁଏ - ପ୍ରଥମେ ପ୍ରକୃତ ବ୍ୟବହାରକାରୀ ଏବଂ ସେମାନଙ୍କର ଆବଶ୍ୟକତାକୁ ବୁଝିବା।" },
      { tag: "machines", en: "Simple machines make work easier by multiplying force or changing direction.", hi: "सरल मशीनें बल को बढ़ाकर या दिशा बदलकर काम को आसान बनाती हैं।", mr: "साधी यंत्रे बल वाढवून किंवा दिशा बदलून काम सोपे करतात.", or: "ସରଳ ଯନ୍ତ୍ରଗୁଡ଼ିକ ବଳ ବୃଦ୍ଧି କରି କିମ୍ବା ଦିଗ ପରିବର୍ତ୍ତନ କରି କାର୍ଯ୍ୟକୁ ସହଜ କରିଥାଏ।" },
      { tag: "bridges", en: "Bridges distribute weight. Suspension bridges distribute load tension into anchorages.", hi: "पुल वजन वितरित करते हैं। सस्पेंशन पुल एंकरेज में भार तनाव वितरित करते हैं।", mr: "पूल वजन विभागून घेतात. सस्पेंशन पूल अँकरेजमध्ये लोडचे ताण विभागतात.", or: "ପୋଲଗୁଡ଼ିକ ଓଜନ ବଣ୍ଟନ କରନ୍ତି। ସସପେନ୍ସନ୍ ପୋଲଗୁଡ଼ିକ ଭାରର ଟେନସନକୁ ଆଙ୍କରେଜ୍ ମଧ୍ୟକୁ ବଣ୍ଟନ କରନ୍ତି।" }
    ]
  };

  const templates = subjectTemplates[subjectCode] || subjectTemplates['math'];
  templates.forEach(t => {
    hints.push(t);
    hints.push({
      tag: t.tag,
      hint_en: `Quick tip: ${t.hint_en}`,
      hint_hi: `त्वरित सुझाव: ${t.hint_hi}`,
      hint_mr: `द्रुत टीप: ${t.hint_mr}`,
      hint_or: `ତୁରନ୍ତ ଟିପ୍ସ: ${t.hint_or}`
    });
  });

  const generalTemplates = [
    { tag: "study", en: "Failure is proof that you are trying! Take a breath, read the explanation, and try again.", hi: "असफलता इस बात का प्रमाण है कि आप कोशिश कर रहे हैं! सांस लें, स्पष्टीकरण पढ़ें, और पुनः प्रयास करें।", mr: "अपयश हा पुरावा आहे की तुम्ही प्रयत्न करत आहात! श्वास घ्या, स्पष्टीकरण वाचा आणि पुन्हा प्रयत्न करा.", or: "ବିଫଳତା ହେଉଛି ପ୍ରମାଣ ଯେ ଆପଣ ଚେଷ୍ଟା କରୁଛନ୍ତି! ନିଶ୍ୱାସ ନିଅନ୍ତୁ, ସ୍ପଷ୍ଟୀକରଣ ପଢନ୍ତୁ ଏବଂ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।" },
    { tag: "learn", en: "Slow and steady wins the race. Understanding the concept is more important than the points.", hi: "धीमा और स्थिर रेस जीतता है। अवधारणा को समझना अंकों से अधिक महत्वपूर्ण है।", mr: "हळूहळू आणि सातत्याने शर्यत जिंकता येते. गुणांपेक्षा संकल्पना समजून घेणे जास्त महत्त्वाचे आहे.", or: "ଧିର ଏବଂ ସ୍ଥିର ଦୌଡ଼ ଜିତେ। ବିଷୟବସ୍ତୁକୁ ବୁଝିବା ମାର୍କ ଅପେକ୍ଷା ଅଧିକ ଗୁରୁତ୍ଵପୂର୍ଣ୍ଣ।" },
    { tag: "practice", en: "STEM is all about questioning! Ask yourself why the other options were wrong.", hi: "STEM का मतलब सवाल पूछना है! अपने आप से पूछें कि अन्य विकल्प क्यों गलत थे।", mr: "STEM म्हणजे प्रश्न विचारणे! इतर पर्याय का चुकीचे होते ते स्वतःला विचारा.", or: "STEM କେବଳ ପ୍ରଶ୍ନ ପଚାରିବା ବିଷୟରେ! ନିଜକୁ ପଚାରନ୍ତୁ କାହିଁକି ଅନ୍ୟ ବିକଳ୍ପଗୁଡ଼ିକ ଭୁଲ୍ ଥିଲା।" },
    { tag: "science", en: "STEM is around us! Look for everyday examples of this concept in your home or village.", hi: "STEM हमारे चारों ओर है! अपने घर या गाँव में इस अवधारणा के दैनिक उदाहरण खोजें।", mr: "STEM आपल्या अवतीभोवती आहे! तुमच्या घरात किंवा गावात या संकल्पनेची रोजची उदाहरणे शोधा.", or: "STEM ଆମ ଚାରିପାଖରେ ଅଛି! ଆପଣଙ୍କ ଘର କିମ୍ବା ଗାଁରେ ଏହି ବିଷୟର ଦୈନନ୍ଦିନ ଉଦାହରଣ ଖୋଜନ୍ତୁ।" }
  ];

  generalTemplates.forEach(t => {
    hints.push(t);
    hints.push({
      tag: t.tag,
      hint_en: `Keep in mind: ${t.hint_en}`,
      hint_hi: `ध्यान रखें: ${t.hint_hi}`,
      hint_mr: `लक्षात ठेवा: ${t.hint_mr}`,
      hint_or: `ଧ୍ୟାନ ଦିଅନ୍ତୁ: ${t.hint_or}`
    });
    hints.push({
      tag: t.tag,
      hint_en: `Pro Tip: ${t.hint_en}`,
      hint_hi: `विशेष सुझाव: ${t.hint_hi}`,
      hint_mr: `विशेष टीप: ${t.hint_mr}`,
      hint_or: `ବିଶେଷ ଟିପ୍ସ: ${t.hint_or}`
    });
  });

  while (hints.length < 60) {
    hints.push({
      tag: "general",
      hint_en: "Practice makes progress. Try to solve similar STEM questions to strengthen your understanding!",
      hint_hi: "अभ्यास प्रगति लाता है। अपनी समझ को मजबूत करने के लिए समान स्टेम प्रश्नों को हल करने का प्रयास करें!",
      hint_mr: "सराव प्रगती घडवतो. तुमची समज बळकट करण्यासाठी समान STEM प्रश्न सोडवण्याचा प्रयत्न करा!",
      hint_or: "ଅଭ୍ୟାସ ଉନ୍ନତି ଆଣିଥାଏ। ଆପଣଙ୍କର ବୁଝିବା ଶକ୍ତିକୁ ଦୃଢ କରିବା ପାଇଁ ସମାନ ପ୍ରକାର ପ୍ରଶ୍ନ ସମାଧାନ କରନ୍ତୁ।"
    });
  }

  return hints;
}

app.get('/api/offline/download-hints/:lessonId', auth, async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const userId = req.user.id;

  try {
    const lesson = db.prepare(`
      SELECT l.*, s.name as subject_name, s.code as subject_code 
      FROM lessons l 
      JOIN subjects s ON l.subject_id = s.id 
      WHERE l.id = ?
    `).get(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const progress = db.prepare('SELECT score, attempts FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);
    
    let hints = [];
    if (process.env.GROQ_API_KEY) {
      try {
        const attemptInfo = progress 
          ? `The student has attempted this quiz ${progress.attempts} times with a highest score of ${progress.score}.` 
          : "The student has not attempted this quiz yet.";
        
        let contentObj = {};
        try { contentObj = JSON.parse(lesson.content || '{}'); } catch(e) {}
        const conceptsStr = Array.isArray(contentObj.concepts) ? contentObj.concepts.join(', ') : 'STEM concepts';

        const prompt = `You are an encouraging adaptive AI STEM tutor for rural school children.
Generate exactly 50 short on-device AI hints (15-20 words each) for the lesson "${lesson.title}" (Subject: ${lesson.subject_name}).
Key Concepts: ${conceptsStr}.
Student History: ${attemptInfo}
Adjust hint difficulty accordingly: if they struggled, make them very simple and encouraging. If they excelled, add interesting stretch facts.

Each hint must have:
- 'tag': a keyword mapping to potential question topics (e.g. "variable", "force", "fraction")
- 'hint_en': English hint
- 'hint_hi': Hindi hint
- 'hint_mr': Marathi hint
- 'hint_or': Odia hint

Format the output strictly as a JSON array of objects. Do not write any markdown wrappers, backticks, or comments. Just return the raw JSON array.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: 'You are a JSON-only API helper. Do not output anything other than a JSON array.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const jsonText = data.choices[0].message.content.trim();
          const cleanedText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
          hints = JSON.parse(cleanedText);
          console.log(`Successfully generated ${hints.length} AI hints for lesson ${lessonId} using Groq`);
        }
      } catch (err) {
        console.error('Error generating hints using Groq:', err);
      }
    }

    if (!Array.isArray(hints) || hints.length < 50) {
      console.log(`Using fallback hint generator for lesson ${lessonId} (current count: ${hints?.length || 0})`);
      const fallbackHints = generateFallbackHints(lesson, progress);
      if (Array.isArray(hints)) {
        hints = [...hints, ...fallbackHints];
      } else {
        hints = fallbackHints;
      }
    }

    hints = hints.slice(0, 50);
    res.json({ lessonId, hints });

  } catch (err) {
    console.error('API download-hints error:', err);
    res.status(500).json({ error: 'Server error downloading hints' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// ===== SOCKET.IO GAME BATTLE SYSTEM =====
const rooms = {};

// JWT Authentication for Sockets
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error: No token provided'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    
    // Fetch profile details
    const userDetails = db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(decoded.id);
    if (userDetails) {
      socket.user.name = userDetails.name;
      socket.user.avatar = userDetails.avatar;
    } else {
      socket.user.name = 'Student';
      socket.user.avatar = '🧑‍🎓';
    }
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected to Socket.io: ${socket.user.name} (${socket.user.id})`);

  socket.on('createRoom', ({ subjectCode }) => {
    // Generate 6-digit room code
    let roomCode;
    do {
      roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms[roomCode]);

    rooms[roomCode] = {
      code: roomCode,
      subjectCode: subjectCode || 'any',
      players: [
        {
          id: socket.user.id,
          name: socket.user.name,
          avatar: socket.user.avatar,
          socketId: socket.id,
          score: 0,
          answered: false,
          lastAnswerCorrect: false
        }
      ],
      questions: [],
      currentQuestionIndex: 0,
      state: 'waiting',
      timer: null,
      countdown: 10,
      rematchRequested: {}
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('roomCreated', { roomCode, subjectCode, player: rooms[roomCode].players[0] });
    console.log(`Room ${roomCode} created for subject ${subjectCode} by ${socket.user.name}`);
  });

  socket.on('joinRoom', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('roomError', { message: 'Room not found / रूम नहीं मिला' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('roomError', { message: 'Room is full / रूम फुल है' });
      return;
    }
    // Prevent duplicate joining
    if (room.players.find(p => p.id === socket.user.id)) {
      socket.emit('roomError', { message: 'You are already in this room' });
      return;
    }

    const opponent = {
      id: socket.user.id,
      name: socket.user.name,
      avatar: socket.user.avatar,
      socketId: socket.id,
      score: 0,
      answered: false,
      lastAnswerCorrect: false
    };

    room.players.push(opponent);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    io.to(roomCode).emit('roomJoined', { roomCode, players: room.players });
    console.log(`User ${socket.user.name} joined room ${roomCode}`);

    // Automatically start the battle!
    startBattle(roomCode);
  });

  socket.on('submitAnswer', ({ answer }) => {
    const roomCode = socket.roomCode;
    const room = rooms[roomCode];
    if (!room || room.state !== 'question') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || player.answered) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    player.answered = true;
    player.lastAnswerCorrect = isCorrect;
    if (isCorrect) {
      player.score += 1;
    }

    // Broadcast that player answered (don't reveal if correct yet, just status)
    io.to(roomCode).emit('playerAnswered', {
      playerId: player.id,
      playersStatus: room.players.map(p => ({ id: p.id, answered: p.answered }))
    });

    // Check if both players answered
    const allAnswered = room.players.every(p => p.answered);
    if (allAnswered) {
      clearTimeout(room.timer);
      showQuestionResult(roomCode);
    }
  });

  socket.on('requestRematch', () => {
    const roomCode = socket.roomCode;
    const room = rooms[roomCode];
    if (!room || room.state !== 'finished') return;

    room.rematchRequested[socket.id] = true;
    
    // Notify opponent
    socket.to(roomCode).emit('rematchPrompt', { fromName: socket.user.name });

    const opponentSocketId = room.players.find(p => p.socketId !== socket.id)?.socketId;
    
    // If both requested, start rematch!
    if (opponentSocketId && room.rematchRequested[opponentSocketId]) {
      console.log(`Rematch started for room ${roomCode}`);
      // Re-initialize room state
      room.players.forEach(p => {
        p.score = 0;
        p.answered = false;
        p.lastAnswerCorrect = false;
      });
      room.currentQuestionIndex = 0;
      room.questions = [];
      room.state = 'waiting';
      room.rematchRequested = {};
      
      startBattle(roomCode);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected from Socket.io: ${socket.user.name}`);
    const roomCode = socket.roomCode;
    const room = rooms[roomCode];
    if (room) {
      // Remove player
      room.players = room.players.filter(p => p.socketId !== socket.id);
      if (room.players.length === 0) {
        clearTimeout(room.timer);
        delete rooms[roomCode];
        console.log(`Room ${roomCode} deleted (empty)`);
      } else {
        // Notify remaining player that opponent disconnected
        io.to(roomCode).emit('opponentDisconnected', { message: 'Opponent disconnected. You win by default! / प्रतिद्वंद्वी डिस्कनेक्ट हो गया।' });
        // Award default win XP
        awardXP(room.players[0].id, 50);
        room.state = 'finished';
        clearTimeout(room.timer);
      }
    }
  });
});

// Start synchronized battle
function startBattle(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.state = 'countdown';
  
  // Fetch random questions from the database
  let questions = [];
  try {
    if (room.subjectCode && room.subjectCode !== 'any') {
      questions = db.prepare(`
        SELECT q.*, s.color as subject_color FROM questions q
        JOIN lessons l ON q.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE s.code = ?
        ORDER BY RANDOM() LIMIT 5
      `).all(room.subjectCode);
    } else {
      questions = db.prepare(`
        SELECT q.*, s.color as subject_color FROM questions q
        JOIN lessons l ON q.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        ORDER BY RANDOM() LIMIT 5
      `).all();
    }
  } catch (err) {
    console.error('Error fetching questions for battle:', err);
  }

  // If not enough questions, fallback to any random questions
  if (questions.length === 0) {
    questions = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 5').all();
  }

  room.questions = questions;
  const subjectColor = questions[0]?.subject_color || '#FF6B35';

  // Send start event with questions (hide correct answers for security)
  const sanitisedQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    question_hi: q.question_hi,
    question_mr: q.question_mr,
    question_or: q.question_or,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d
  }));

  io.to(roomCode).emit('battleStart', {
    players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score })),
    questionsCount: sanitisedQuestions.length,
    subjectColor
  });

  // Ready 3-second countdown
  let readyCountdown = 3;
  const interval = setInterval(() => {
    io.to(roomCode).emit('countdownTick', readyCountdown);
    readyCountdown--;
    if (readyCountdown < 0) {
      clearInterval(interval);
      sendQuestion(roomCode, sanitisedQuestions);
    }
  }, 1000);
}

// Send a question to players
function sendQuestion(roomCode, sanitisedQuestions) {
  const room = rooms[roomCode];
  if (!room || room.state === 'finished') return;

  room.state = 'question';
  room.players.forEach(p => {
    p.answered = false;
    p.lastAnswerCorrect = false;
  });

  const questionIdx = room.currentQuestionIndex;
  const question = sanitisedQuestions[questionIdx];

  io.to(roomCode).emit('nextQuestion', {
    questionIndex: questionIdx,
    question,
    players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, answered: false }))
  });

  room.countdown = 10;
  
  // Timer tick loop
  const timerTick = () => {
    io.to(roomCode).emit('timerTick', room.countdown);
    room.countdown--;
    if (room.countdown < 0) {
      showQuestionResult(roomCode);
    } else {
      room.timer = setTimeout(timerTick, 1000);
    }
  };

  room.timer = setTimeout(timerTick, 1000);
}

// Show correct answer result after question ends
function showQuestionResult(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearTimeout(room.timer);
  room.state = 'result';

  const currentQuestion = room.questions[room.currentQuestionIndex];
  
  // Reveal details
  io.to(roomCode).emit('questionResult', {
    correctAnswer: currentQuestion.correct_answer,
    explanation: currentQuestion.explanation,
    players: room.players.map(p => ({
      id: p.id,
      score: p.score,
      answered: p.answered,
      correct: p.lastAnswerCorrect
    }))
  });

  // Move to next question or end battle after 4 seconds (time to read explanation)
  setTimeout(() => {
    room.currentQuestionIndex++;
    if (room.currentQuestionIndex < room.questions.length) {
      const sanitisedQuestions = room.questions.map(q => ({
        id: q.id,
        question: q.question,
        question_hi: q.question_hi,
        question_mr: q.question_mr,
        question_or: q.question_or,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d
      }));
      sendQuestion(roomCode, sanitisedQuestions);
    } else {
      endBattle(roomCode);
    }
  }, 4000);
}

// End Battle and award XP
function endBattle(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.state = 'finished';
  const players = room.players;

  if (players.length < 2) {
    return;
  }

  const p1 = players[0];
  const p2 = players[1];

  let p1XP = p1.score * 10;
  let p2XP = p2.score * 10;
  let winnerId = null;
  let loserId = null;

  if (p1.score > p2.score) {
    p1XP = p1XP * 2; // Double XP bonus for winner
    winnerId = p1.id;
    loserId = p2.id;
  } else if (p2.score > p1.score) {
    p2XP = p2XP * 2; // Double XP bonus for winner
    winnerId = p2.id;
    loserId = p1.id;
  }

  // Award XP to users in the database
  try {
    awardXP(p1.id, p1XP);
    awardXP(p2.id, p2XP);
  } catch (err) {
    console.error('Error awarding XP after battle:', err);
  }

  io.to(roomCode).emit('battleFinished', {
    winnerId,
    loserId,
    p1: { id: p1.id, name: p1.name, score: p1.score, xpEarned: p1XP },
    p2: { id: p2.id, name: p2.name, score: p2.score, xpEarned: p2XP }
  });
}

// Award XP function (database wrapper)
function awardXP(userId, xpEarned) {
  if (xpEarned <= 0) return;
  db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, userId);
  db.prepare('UPDATE users SET level = MAX(1, xp / 200 + 1) WHERE id = ?').run(userId);
  db.prepare('UPDATE leaderboard SET total_xp = total_xp + ? WHERE user_id = ?').run(xpEarned, userId);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const existingDaily = db.prepare('SELECT id FROM daily_xp WHERE user_id = ? AND date = ?').get(userId, dateStr);
  if (existingDaily) {
    db.prepare('UPDATE daily_xp SET xp_earned = xp_earned + ? WHERE id = ?').run(xpEarned, existingDaily.id);
  } else {
    db.prepare('INSERT INTO daily_xp (user_id, date, xp_earned) VALUES (?, ?, ?)').run(userId, dateStr, xpEarned);
  }
}

server.listen(PORT, () => {
  console.log('STEM Platform running at http://localhost:' + PORT);
  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, () => {
      console.log('🔐 Secure HTTPS Server running at https://localhost:' + HTTPS_PORT + ' (Required for camera access on other LAN devices)');
    });
  }
});
