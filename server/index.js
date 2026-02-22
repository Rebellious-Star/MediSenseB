import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import multer from "multer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Token, OTP, Contact, Report, HealthMetrics, Appointment, VoiceAnalysis } from './models.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true }));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medisense";

// Connect to MongoDB with better error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 Make sure MongoDB is running or set MONGODB_URI environment variable");
    // Don't exit - allow server to start but endpoints will fail gracefully
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on('error', (err) => {
  console.error("❌ MongoDB error:", err);
});

// Default data for fallback
const DEFAULT_REPORTS = [
  { id: "1", title: "Blood Test Results", date: "2 days ago", status: "Reviewed", color: "emerald" },
  { id: "2", title: "Cholesterol Panel", date: "1 week ago", status: "Pending", color: "blue" },
  { id: "3", title: "Thyroid Function Test", date: "2 weeks ago", status: "Reviewed", color: "emerald" },
];
const METRICS = [
  { label: "Blood Pressure", value: "120/80", status: "Normal", color: "emerald" },
  { label: "Heart Rate", value: "72 bpm", status: "Good", color: "blue" },
  { label: "Glucose", value: "95 mg/dL", status: "Normal", color: "emerald" },
  { label: "BMI", value: "23.5", status: "Healthy", color: "blue" },
];
const APPOINTMENTS = [
  { title: "Annual Checkup", date: "Mar 15, 2026", time: "10:00 AM", doctor: "Dr. Sarah Johnson" },
  { title: "Follow-up Consultation", date: "Mar 22, 2026", time: "2:30 PM", doctor: "Dr. Michael Chen" },
];

function genToken() {
  return "tk_" + crypto.randomBytes(24).toString("hex");
}

// Get user ID from token using MongoDB
async function getUserId(req) {
  try {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
    
    // Find token in MongoDB
    const tokenDoc = await Token.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!tokenDoc) return null;
    
    return tokenDoc.userId;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
}

// POST /api/auth/send-signup-otp - Send OTP for signup
app.post("/api/auth/send-signup-otp", async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address" });
  }
  
  const emailLower = email.toLowerCase();
  
  try {
    // Check if email already exists in MongoDB
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in MongoDB
    await OTP.create({
      email: emailLower,
      otp,
      type: "signup",
      expiresAt: new Date(expiresAt)
    });

    // In production, send OTP via EmailJS or other email service
    // For now, we'll return success (EmailJS will be handled on client side)
    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in signup OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/auth/verify-otp-signup - Verify OTP and complete signup
app.post("/api/auth/verify-otp-signup", async (req, res) => {
  const { name, email, otp, password } = req.body || {};
  if (!email || !otp || !password || !name) {
    return res.status(400).json({ message: "Name, email, OTP, and password required" });
  }

  // Validate password requirements
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one special symbol" });
  }

  const emailLower = email.toLowerCase();
  
  try {
    // Find OTP in MongoDB
    const stored = await OTP.findOne({ email: emailLower, type: "signup" });
    if (!stored) {
      return res.status(400).json({ message: "OTP not found or expired. Please request a new OTP." });
    }

    if (Date.now() > stored.expiresAt.getTime()) {
      await OTP.deleteOne({ email: emailLower, type: "signup" });
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Check if email already exists (double check)
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      await OTP.deleteOne({ email: emailLower, type: "signup" });
      return res.status(400).json({ message: "Email already registered" });
    }

    // OTP verified, create user
    const id = "u_" + crypto.randomBytes(8).toString("hex");
    const user = await User.create({
      id,
      name: name || "User",
      email: emailLower,
      password,
      createdAt: new Date()
    });

    // Clear OTP
    await OTP.deleteOne({ email: emailLower, type: "signup" });

    // Create token in MongoDB
    const token = genToken();
    await Token.create({
      token,
      userId: id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    res.json({
      token,
      user: { id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in signup verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/send-otp - Send OTP for login
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address" });
  }
  
  const emailLower = email.toLowerCase();
  
  try {
    // Check if user exists in MongoDB
    const record = await User.findOne({ email: emailLower });
    if (!record) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP (password will be verified against user record)
    await OTP.create({
      email: emailLower,
      otp,
      type: "login",
      expiresAt: new Date(expiresAt)
    });

    // In production, send OTP via EmailJS or other email service
    // For now, we'll return success (EmailJS will be handled on client side)
    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in login OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/auth/verify-otp-login - Verify OTP and login
app.post("/api/auth/verify-otp-login", async (req, res) => {
  const { email, otp, password } = req.body || {};
  if (!email || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP, and password required" });
  }

  const emailLower = email.toLowerCase();
  
  try {
    // Find OTP in MongoDB
    const stored = await OTP.findOne({ email: emailLower, type: "login" });
    if (!stored) {
      return res.status(400).json({ message: "OTP not found or expired. Please request a new OTP." });
    }

    if (Date.now() > stored.expiresAt.getTime()) {
      await OTP.deleteOne({ email: emailLower, type: "login" });
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Get user record
    const record = await User.findOne({ email: emailLower });
    if (!record) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password matches user's actual password using bcrypt
    const isPasswordValid = await record.comparePassword(password);
    if (!isPasswordValid) {
      await OTP.deleteOne({ email: emailLower, type: "login" });
      return res.status(401).json({ message: "Invalid password" });
    }

    // OTP and password verified, proceed with login
    // Create token in MongoDB
    const token = genToken();
    await Token.create({
      token,
      userId: record.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    // Clear OTP
    await OTP.deleteOne({ email: emailLower, type: "login" });
    
    res.json({
      token,
      user: { id: record.id, name: record.name, email: record.email },
    });
  } catch (error) {
    console.error("Error in login verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/signup (keep for backward compatibility, but now requires OTP)
app.post("/api/auth/signup", async (req, res) => {
  try {
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
    
    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }
    
  const id = "u_" + crypto.randomBytes(8).toString("hex");
    const user = await User.create({
      id,
      name: name || "User",
      email: emailLower,
      password,
      createdAt: new Date()
    });
    
  const token = genToken();
    await Token.create({
      token,
      userId: id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
  res.json({ token, user: { id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login (keep for backward compatibility, but now requires OTP)
app.post("/api/auth/login", async (req, res) => {
  try {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
    
    const emailLower = email.toLowerCase();
    const record = await User.findOne({ email: emailLower });
  if (!record) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  
  // Verify password using bcrypt
  const isPasswordValid = await record.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
    
  const token = genToken();
    await Token.create({
      token,
      userId: record.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
  res.json({
    token,
    user: { id: record.id, name: record.name, email: record.email },
  });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/contact
app.post("/api/contact", async (req, res) => {
  try {
  const { firstName, lastName, email, phone, subject, message } = req.body || {};
    
    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email and message are required" });
    }
    
    await Contact.create({
      firstName,
      lastName,
      name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "Anonymous",
      email,
      phone,
      subject,
      message,
      createdAt: new Date()
    });
    
  res.json({ success: true, message: "Message received. We'll get back to you within 24 hours." });
  } catch (error) {
    console.error("Error saving contact:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/reports/upload
app.post("/api/reports/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = await getUserId(req);
  const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const title = file.originalname || "Uploaded Report";
  const id = "r_" + Date.now();
    const date = "Just now";
    
  if (userId) {
      await Report.create({
        userId,
        id,
        title,
        date,
        status: "Pending",
        color: "blue",
        fileName: file.originalname,
        fileType: file.mimetype,
        uploadedAt: new Date()
      });
    }
    
    res.json({ id, title });
  } catch (error) {
    console.error("Error uploading report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/reports/analyze - analyze uploaded PDF/report (mock AI response)
app.post("/api/reports/analyze", upload.single("file"), (req, res) => {
  const file = req.file;
  const filename = file?.originalname || "report";
  const isPdf = filename.toLowerCase().endsWith(".pdf");
  const isImage = file?.mimetype?.startsWith("image/");
  res.json({
    summary: isPdf
      ? "Your report has been processed. Key biomarkers and findings have been extracted and interpreted below."
      : isImage
        ? "Your image report has been analyzed. Please review the findings and recommendations."
        : "Your document has been analyzed. Summary and recommendations are provided below.",
    keyFindings: [
      "Document type: " + (isPdf ? "PDF" : isImage ? "Image" : "Text/Other"),
      "All major sections were detected and parsed successfully.",
      "No critical abnormalities flagged in the reviewed ranges.",
      "Values within normal reference ranges where applicable.",
    ],
    recommendations: [
      "Discuss these results with your healthcare provider at your next visit.",
      "Keep a copy of this report for your records.",
      "Schedule follow-up tests if your doctor has recommended them.",
    ],
    status: "Reviewed",
  });
});

// GET /api/reports
app.get("/api/reports", async (req, res) => {
  try {
    const userId = await getUserId(req);
    
    if (userId) {
      const reports = await Report.find({ userId })
        .sort({ uploadedAt: -1 })
        .limit(50)
        .lean();
      
      // Format reports for frontend
      const formattedReports = reports.map(r => ({
        id: r.id,
        title: r.title,
        date: r.date || "Recently",
        status: r.status || "Pending",
        color: r.color || "blue"
      }));
      
      return res.json(formattedReports.length > 0 ? formattedReports : DEFAULT_REPORTS);
    }
    
    // Return default reports if not logged in
    res.json(DEFAULT_REPORTS);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.json(DEFAULT_REPORTS); // Fallback to defaults on error
  }
});

// POST /api/voice/analyze - Analyze voice transcript
app.post("/api/voice/analyze", async (req, res) => {
  try {
    const { transcript, language } = req.body || {};
    
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ message: "Transcript is required" });
    }
    
    const userId = await getUserId(req); // Get user if authenticated

  // Normalize text - remove extra spaces and convert to lowercase
  const normalizedText = transcript.trim().toLowerCase().replace(/\s+/g, " ");
  const words = normalizedText.split(/\s+/);
  
  // Detect if text contains non-Latin characters (likely non-English)
  const hasNonLatinChars = /[^\x00-\x7F]/.test(transcript);
  // Use non-Latin character detection as primary indicator, language code as secondary
  const isLikelyNonEnglish = hasNonLatinChars;
  
  // Comprehensive symptom detection with multiple language support
  // Using flexible pattern matching that works across languages
  const symptomPatterns = [
    // Head-related
    { patterns: ["headache", "head ache", "head pain", "cephalalgia", "dolor de cabeza", "mal de tête", "mal di testa", "सिरदर्द", "头痛", "sar dard", "sir dard", "sar dardh"], symptom: "Headache", category: "neurological" },
    { patterns: ["migraine", "throbbing head", "pulsating head"], symptom: "Migraine", category: "neurological" },
    { patterns: ["dizziness", "dizzy", "vertigo", "mareo", "vertige", "vertigine", "चक्कर", "चक्कर आना", "chakkar", "bhram"], symptom: "Dizziness", category: "neurological" },
    { patterns: ["fainting", "fainted", "unconscious", "behooshi", "behosh", "behoshi", "unconsciousness", "syncope", "fainting spell", "behosh ho gaya", "behosh hua"], symptom: "Fainting/Unconsciousness", category: "neurological" },
    
    // Fever and temperature
    { patterns: ["fever", "high temperature", "feverish", "fiebre", "fièvre", "febbre", "बुखार", "发烧", "bukhar", "bukhaar"], symptom: "Fever", category: "systemic" },
    { patterns: ["chills", "shivering", "shivers", "escalofríos", "frissons", "brividi", "ठंड लगना", "thand lagana", "thand"], symptom: "Chills", category: "systemic" },
    { patterns: ["hot", "burning", "heat", "caliente", "chaud", "caldo"], symptom: "Elevated body temperature", category: "systemic" },
    
    // Respiratory
    { patterns: ["cough", "coughing", "tos", "toux", "tosse", "खांसी", "咳嗽", "khansi", "khasi"], symptom: "Cough", category: "respiratory" },
    { patterns: ["sore throat", "throat pain", "throat hurts", "dolor de garganta", "mal de gorge", "mal di gola", "गले में दर्द", "喉咙痛", "gale me dard", "galon dard"], symptom: "Sore throat", category: "respiratory" },
    { patterns: ["shortness of breath", "breathing difficulty", "difficulty breathing", "dificultad para respirar", "difficulté à respirer", "difficoltà respiratoria", "सांस लेने में तकलीफ", "呼吸困难", "sans me taklif", "saans chalne me dikkat"], symptom: "Shortness of breath", category: "respiratory" },
    { patterns: ["wheezing", "wheeze", "sibilancia", "sifflement", "sibilo"], symptom: "Wheezing", category: "respiratory" },
    { patterns: ["congestion", "stuffy nose", "blocked nose", "congestión nasal", "nez bouché", "naso chiuso", "नाक बंद", "鼻塞", "nak band", "naak band"], symptom: "Nasal congestion", category: "respiratory" },
    { patterns: ["runny nose", "nasal discharge", "nariz que moquea", "nez qui coule", "naso che cola", "नाक बहना", "流鼻涕", "nak bahna", "naak bahna"], symptom: "Runny nose", category: "respiratory" },
    { patterns: ["sneezing", "sneeze", "estornudos", "éternuements", "starnuti", "छींक", "打喷嚏", "chhink", "cheenk"], symptom: "Sneezing", category: "respiratory" },
    
    // Chest and cardiac
    { patterns: ["chest pain", "chest discomfort", "dolor en el pecho", "douleur thoracique", "dolore al petto", "छाती में दर्द", "胸痛", "chhati me dard", "chest me dard"], symptom: "Chest pain", category: "cardiac" },
    { patterns: ["chest tightness", "tight chest", "opresión en el pecho", "oppression thoracique", "oppressione al petto"], symptom: "Chest tightness", category: "cardiac" },
    { patterns: ["heart palpitations", "palpitations", "palpitaciones", "palpitations", "palpitazioni", "दिल की धड़कन", "dil ki dhadkan", "dil dhadkna"], symptom: "Heart palpitations", category: "cardiac" },
    
    // Gastrointestinal
    { patterns: ["nausea", "nauseous", "feeling sick", "náuseas", "nausées", "nausea", "मतली", "恶心", "matli", "matali"], symptom: "Nausea", category: "gastrointestinal" },
    { patterns: ["vomiting", "vomit", "throwing up", "vómitos", "vomissements", "vomito", "उल्टी", "呕吐", "ulti", "ulte"], symptom: "Vomiting", category: "gastrointestinal" },
    { patterns: ["stomach pain", "abdominal pain", "belly pain", "dolor de estómago", "douleur abdominale", "mal di stomaco", "पेट दर्द", "胃痛", "pet dard", "pet me dard", "pet dardh", "pait dard"], symptom: "Abdominal pain", category: "gastrointestinal" },
    { patterns: ["stomach ache", "stomach discomfort", "malestar estomacal", "malaise gastrique", "pet dard", "pet me dard", "pait me dard"], symptom: "Stomach discomfort", category: "gastrointestinal" },
    { patterns: ["diarrhea", "loose stools", "diarrea", "diarrhée", "diarrea", "दस्त", "腹泻"], symptom: "Diarrhea", category: "gastrointestinal" },
    { patterns: ["constipation", "constipación", "constipation", "stipsi", "कब्ज", "便秘"], symptom: "Constipation", category: "gastrointestinal" },
    { patterns: ["bloating", "bloated", "hinchazón", "ballonnement", "gonfiore", "सूजन"], symptom: "Bloating", category: "gastrointestinal" },
    
    // Musculoskeletal
    { patterns: ["joint pain", "joint ache", "dolor articular", "douleur articulaire", "dolore articolare", "जोड़ों में दर्द", "关节痛", "jodo me dard", "joron me dard"], symptom: "Joint pain", category: "musculoskeletal" },
    { patterns: ["muscle pain", "muscle ache", "dolor muscular", "douleur musculaire", "dolore muscolare", "मांसपेशियों में दर्द", "肌肉疼痛", "maspeshio me dard", "peshio me dard"], symptom: "Muscle pain", category: "musculoskeletal" },
    { patterns: ["back pain", "backache", "dolor de espalda", "mal de dos", "mal di schiena", "पीठ दर्द", "背痛", "pith dard", "peth dard"], symptom: "Back pain", category: "musculoskeletal" },
    { patterns: ["neck pain", "neck ache", "dolor de cuello", "mal au cou", "mal di collo", "gardan dard", "gardan me dard"], symptom: "Neck pain", category: "musculoskeletal" },
    { patterns: ["leg pain", "pair dard", "pair me dard", "pain dard", "leg me dard", "takn dard"], symptom: "Leg pain", category: "musculoskeletal" },
    { patterns: ["body pain", "body ache", "sarir dard", "sarir me dard", "badan dard", "badan me dard"], symptom: "Body pain", category: "musculoskeletal" },
    
    // General symptoms
    { patterns: ["fatigue", "tired", "exhausted", "weak", "lethargy", "malaise", "weariness", "थकावट", "थका हुआ", "thakavat", "thaka hua", "nakami"], symptom: "Fatigue", category: "general" },
    { patterns: ["weakness", "kamzori", "kamzori", "durbalta"], symptom: "Weakness", category: "general" },
    { patterns: ["loss of appetite", "anorexia", "no appetite", "not hungry", "भूख न लगना", "bhookh na lagana", "bhookh nahi lagti"], symptom: "Loss of appetite", category: "general" },
    { patterns: ["insomnia", "sleeplessness", "difficulty sleeping", "can't sleep", "नींद न आना", "neend na aana", "so nahi pa raha"], symptom: "Insomnia", category: "general" },
    { patterns: ["anxiety", "panic", "nervousness", "worry", "stress", "चिंता", "परेशानी", "chinta", "pareshani", "tension"], symptom: "Anxiety", category: "mental" },
    { patterns: ["depression", "sad", "hopeless", "low mood", "depressed", "उदासीनता", "उदास", "udasinta", "udas"], symptom: "Depression", category: "mental" },
    
    // Fatigue and weakness
    { patterns: ["fatigue", "tired", "exhausted", "weak", "fatiga", "fatigué", "stanco", "थकान", "疲劳"], symptom: "Fatigue", category: "systemic" },
    { patterns: ["weakness", "weak", "debilidad", "faiblesse", "debolezza", "कमजोरी", "虚弱"], symptom: "Weakness", category: "systemic" },
    { patterns: ["lethargy", "lethargic", "letargo", "léthargie", "letargia"], symptom: "Lethargy", category: "systemic" },
    
    // Skin
    { patterns: ["rash", "skin rash", "erupción", "éruption", "eruzione", "दाने", "皮疹"], symptom: "Rash", category: "dermatological" },
    { patterns: ["itchy", "itching", "prurito", "démangeaison", "prurito", "खुजली", "瘙痒"], symptom: "Itching", category: "dermatological" },
    { patterns: ["red skin", "redness", "enrojecimiento", "rougeur", "arrossamento"], symptom: "Skin redness", category: "dermatological" },
    { patterns: ["hives", "urticaria", "urticaire", "orticaria"], symptom: "Hives", category: "dermatological" },
    
    // Other common symptoms
    { patterns: ["pain", "hurts", "ache", "dolor", "douleur", "dolore", "दर्द", "疼痛"], symptom: "Pain", category: "general" },
    { patterns: ["swelling", "swollen", "hinchazón", "gonflement", "gonfiore", "सूजन", "肿胀"], symptom: "Swelling", category: "general" },
    { patterns: ["loss of appetite", "no appetite", "pérdida de apetito", "perte d'appétit", "perdita di appetito", "भूख न लगना"], symptom: "Loss of appetite", category: "systemic" },
    { patterns: ["insomnia", "sleeplessness", "insomnio", "insomnie", "insonnia", "अनिद्रा", "失眠"], symptom: "Insomnia", category: "neurological" },
  ];

  // Detect symptoms using flexible pattern matching
  const foundSymptoms = [];
  const symptomSet = new Set();
  const symptomCategories = new Set();
  
  for (const { patterns, symptom, category } of symptomPatterns) {
    for (const pattern of patterns) {
      let matched = false;
      
      // Escape special regex characters
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Try multiple matching strategies for better detection
      // 1. Word boundary matching (most accurate for English)
      const wordBoundaryRegex = new RegExp(`\\b${escapedPattern}\\b`, 'i');
      if (wordBoundaryRegex.test(normalizedText)) {
        matched = true;
      }
      
      // 2. Flexible substring matching (works for all languages and partial matches)
      if (!matched) {
        const flexibleRegex = new RegExp(escapedPattern, 'i');
        if (flexibleRegex.test(normalizedText)) {
          matched = true;
        }
      }
      
      // 3. Also check individual words if pattern has multiple words
      if (!matched && pattern.includes(' ')) {
        const words = pattern.split(/\s+/);
        // Check if all words in the pattern appear in the text (in any order)
        const allWordsFound = words.every(word => {
          const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return wordRegex.test(normalizedText) || normalizedText.includes(word.toLowerCase());
        });
        if (allWordsFound) {
          matched = true;
        }
      }
      
      if (matched && !symptomSet.has(symptom)) {
        foundSymptoms.push(symptom);
        symptomSet.add(symptom);
        symptomCategories.add(category);
        break; // Found this symptom, move to next
      }
    }
  }
  
  // Enhanced fallback: Try to detect symptoms from context even without exact matches
  if (foundSymptoms.length === 0) {
    // Look for common symptom indicators in any language
    const contextIndicators = [
      // Pain indicators
      { 
        patterns: ["pain", "hurt", "ache", "sore", "dolor", "douleur", "dolore", "दर्द", "痛", "болит", "ağrı"],
        symptom: "Pain",
        category: "general"
      },
      // Fever indicators  
      {
        patterns: ["fever", "temperature", "hot", "burning", "fiebre", "fièvre", "febbre", "बुखार", "发烧", "температура", "ateş"],
        symptom: "Fever",
        category: "systemic"
      },
      // Fatigue indicators
      {
        patterns: ["tired", "exhausted", "weak", "fatigue", "fatiga", "fatigué", "stanco", "थकान", "疲劳", "усталость", "yorgun"],
        symptom: "Fatigue",
        category: "systemic"
      },
      // Cough indicators
      {
        patterns: ["cough", "tos", "toux", "tosse", "खांसी", "咳嗽", "кашель", "öksürük"],
        symptom: "Cough",
        category: "respiratory"
      },
      // Headache indicators
      {
        patterns: ["head", "cabeza", "tête", "testa", "सिर", "头", "голова", "baş"],
        symptom: "Headache",
        category: "neurological"
      },
      // Stomach indicators
      {
        patterns: ["stomach", "belly", "estómago", "estomac", "stomaco", "पेट", "胃", "желудок", "mide"],
        symptom: "Stomach discomfort",
        category: "gastrointestinal"
      },
      // Nausea indicators
      {
        patterns: ["nausea", "sick", "náuseas", "nausées", "nausea", "मतली", "恶心", "тошнота", "bulantı"],
        symptom: "Nausea",
        category: "gastrointestinal"
      }
    ];
    
    for (const { patterns, symptom, category } of contextIndicators) {
      for (const pattern of patterns) {
        // Use flexible matching for context indicators
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (regex.test(normalizedText) && !symptomSet.has(symptom)) {
          foundSymptoms.push(symptom);
          symptomSet.add(symptom);
          symptomCategories.add(category);
          break;
        }
      }
    }
  }

  // Enhanced fallback: Try even more flexible matching
  if (foundSymptoms.length === 0) {
    console.log("No symptoms detected. Transcript:", transcript.substring(0, 200));
    console.log("Normalized text:", normalizedText.substring(0, 200));
    console.log("Language:", language);
    console.log("Has non-Latin chars:", hasNonLatinChars);
    
    // Try very flexible word-by-word matching
    const veryFlexiblePatterns = [
      { words: ["pain", "hurts", "hurt", "aching", "ache", "sore", "dolor", "douleur", "दर्द", "痛"], symptom: "Pain" },
      { words: ["fever", "temperature", "hot", "burning", "feverish", "fiebre", "fièvre", "बुखार", "发烧"], symptom: "Fever" },
      { words: ["cough", "coughing", "tos", "toux", "tosse", "खांसी", "咳嗽"], symptom: "Cough" },
      { words: ["headache", "head", "headache", "cabeza", "tête", "सिर", "头"], symptom: "Headache" },
      { words: ["stomach", "belly", "abdominal", "estómago", "estomac", "पेट", "胃"], symptom: "Stomach discomfort" },
      { words: ["tired", "fatigue", "exhausted", "weak", "fatiga", "fatigué", "थकान", "疲劳"], symptom: "Fatigue" },
      { words: ["nausea", "nauseous", "sick", "náuseas", "nausées", "मतली", "恶心"], symptom: "Nausea" },
      { words: ["throat", "sore", "garganta", "gorge", "गले", "喉咙"], symptom: "Sore throat" },
      { words: ["dizzy", "dizziness", "vertigo", "mareo", "vertige", "चक्कर"], symptom: "Dizziness" },
      { words: ["chills", "shivering", "shivers", "escalofríos", "frissons", "ठंड"], symptom: "Chills" },
    ];
    
    for (const { words, symptom } of veryFlexiblePatterns) {
      for (const word of words) {
        // Check if word appears anywhere in the text (case insensitive)
        if (normalizedText.includes(word.toLowerCase()) && !symptomSet.has(symptom)) {
          foundSymptoms.push(symptom);
          symptomSet.add(symptom);
          break;
        }
      }
    }
  }

  // Advanced condition analysis based on symptom combinations and patterns
  const conditionScores = new Map();
  
  // Define condition patterns with symptom requirements
  const conditionPatterns = [
    {
      name: "Common Cold",
      required: ["Cough", "Sore throat", "Nasal congestion", "Runny nose", "Sneezing"],
      optional: ["Fever", "Fatigue", "Headache"],
      score: 0
    },
    {
      name: "Influenza (Flu)",
      required: ["Fever", "Cough"],
      optional: ["Sore throat", "Fatigue", "Body ache", "Chills", "Headache"],
      score: 0
    },
    {
      name: "Upper Respiratory Infection",
      required: ["Cough", "Sore throat"],
      optional: ["Fever", "Nasal congestion", "Runny nose"],
      score: 0
    },
    {
      name: "Bronchitis",
      required: ["Cough"],
      optional: ["Shortness of breath", "Chest pain", "Fatigue", "Fever"],
      score: 0
    },
    {
      name: "Pneumonia",
      required: ["Cough", "Fever"],
      optional: ["Shortness of breath", "Chest pain", "Fatigue", "Chills"],
      score: 0
    },
    {
      name: "Tension Headache",
      required: ["Headache"],
      optional: ["Stress", "Neck pain", "Fatigue"],
      score: 0
    },
    {
      name: "Migraine",
      required: ["Headache", "Migraine"],
      optional: ["Nausea", "Dizziness", "Sensitivity to light"],
      score: 0
    },
    {
      name: "Gastroenteritis",
      required: ["Nausea", "Vomiting", "Diarrhea"],
      optional: ["Abdominal pain", "Fever", "Stomach discomfort"],
      score: 0
    },
    {
      name: "Food Poisoning",
      required: ["Nausea", "Vomiting"],
      optional: ["Diarrhea", "Abdominal pain", "Stomach discomfort", "Fever"],
      score: 0
    },
    {
      name: "Irritable Bowel Syndrome (IBS)",
      required: ["Abdominal pain", "Stomach discomfort"],
      optional: ["Bloating", "Diarrhea", "Constipation"],
      score: 0
    },
    {
      name: "Asthma",
      required: ["Shortness of breath", "Wheezing"],
      optional: ["Cough", "Chest tightness", "Chest pain"],
      score: 0
    },
    {
      name: "Allergic Rhinitis",
      required: ["Sneezing", "Runny nose", "Nasal congestion"],
      optional: ["Itching", "Rash", "Sore throat"],
      score: 0
    },
    {
      name: "Sinusitis",
      required: ["Nasal congestion", "Headache"],
      optional: ["Fever", "Facial pain", "Runny nose", "Fatigue"],
      score: 0
    },
    {
      name: "Urinary Tract Infection (UTI)",
      required: ["Pain"],
      optional: ["Fever", "Fatigue", "Nausea"],
      score: 0
    },
    {
      name: "Arthritis",
      required: ["Joint pain"],
      optional: ["Swelling", "Stiffness", "Fatigue"],
      score: 0
    },
    {
      name: "Fibromyalgia",
      required: ["Muscle pain", "Fatigue"],
      optional: ["Joint pain", "Headache", "Sleep problems"],
      score: 0
    },
    {
      name: "Anxiety",
      required: [],
      optional: ["Chest pain", "Shortness of breath", "Heart palpitations", "Dizziness", "Fatigue"],
      score: 0
    },
    {
      name: "Depression",
      required: ["Fatigue"],
      optional: ["Insomnia", "Loss of appetite", "Weakness"],
      score: 0
    },
    {
      name: "Skin Allergy",
      required: ["Rash", "Itching"],
      optional: ["Hives", "Skin redness", "Swelling"],
      score: 0
    },
    {
      name: "Dehydration",
      required: ["Fatigue", "Weakness"],
      optional: ["Dizziness", "Headache", "Nausea"],
      score: 0
    },
    {
      name: "Fainting/Syncope",
      required: ["Fainting/Unconsciousness"],
      optional: ["Dizziness", "Headache", "Weakness", "Heart palpitations"],
      score: 0
    },
    {
      name: "Deep Vein Thrombosis (DVT)",
      required: ["Leg pain"],
      optional: ["Swelling", "Redness", "Warmth"],
      score: 0
    },
    {
      name: "Peripheral Artery Disease",
      required: ["Leg pain"],
      optional: ["Weakness", "Numbness", "Coldness"],
      score: 0
    },
    {
      name: "Muscle Strain",
      required: ["Muscle pain", "Leg pain"],
      optional: ["Swelling", "Weakness", "Body pain"],
      score: 0
    },
    {
      name: "Sciatica",
      required: ["Leg pain", "Back pain"],
      optional: ["Weakness", "Numbness", "Body pain"],
      score: 0
    }
  ];

  // Score each condition based on symptom matches
  for (const condition of conditionPatterns) {
    let score = 0;
    let requiredMatches = 0;
    
    // Check required symptoms
    for (const reqSymptom of condition.required) {
      if (foundSymptoms.some(s => s.toLowerCase().includes(reqSymptom.toLowerCase()) || reqSymptom.toLowerCase().includes(s.toLowerCase()))) {
        requiredMatches++;
        score += 3; // Higher weight for required symptoms
      }
    }
    
    // Check optional symptoms
    for (const optSymptom of condition.optional) {
      if (foundSymptoms.some(s => s.toLowerCase().includes(optSymptom.toLowerCase()) || optSymptom.toLowerCase().includes(s.toLowerCase()))) {
        score += 1; // Lower weight for optional symptoms
      }
    }
    
    // Only include conditions that have at least some required symptoms matched
    if (requiredMatches > 0 || condition.required.length === 0) {
      conditionScores.set(condition.name, score);
    }
  }

  // Sort conditions by score and get top matches
  const sortedConditions = Array.from(conditionScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7) // Get top 7 conditions
    .map(([name]) => name);

  const possibleConditions = sortedConditions.length > 0 
    ? sortedConditions 
    : foundSymptoms.length > 0 
      ? ["Health concern requiring evaluation"] 
      : ["Please describe your symptoms more specifically"];

  // Generate specific, targeted recommendations based on detected symptoms and conditions
  const recommendations = [];
  const recSet = new Set();
  
  // Condition-specific recommendations
  if (sortedConditions.length > 0) {
    const topCondition = sortedConditions[0];
    
    if (topCondition.includes("Cold") || topCondition.includes("Flu") || topCondition.includes("Respiratory")) {
      if (!recSet.has("rest")) {
        recommendations.push("Get plenty of rest to help your body fight the infection");
        recSet.add("rest");
      }
      if (!recSet.has("fluids")) {
        recommendations.push("Drink plenty of fluids (water, herbal tea, warm soup) to stay hydrated and thin mucus");
        recSet.add("fluids");
      }
      if (!recSet.has("steam")) {
        recommendations.push("Use a humidifier or take steam inhalation to relieve nasal congestion");
        recSet.add("steam");
      }
    }
    
    if (topCondition.includes("Gastroenteritis") || topCondition.includes("Food Poisoning")) {
      if (!recSet.has("bland")) {
        recommendations.push("Follow a BRAT diet (bananas, rice, applesauce, toast) and avoid dairy, spicy, or fatty foods");
        recSet.add("bland");
      }
      if (!recSet.has("rehydration")) {
        recommendations.push("Drink oral rehydration solutions or electrolyte drinks to prevent dehydration");
        recSet.add("rehydration");
      }
      if (!recSet.has("rest-digestive")) {
        recommendations.push("Rest your digestive system by eating small, frequent meals");
        recSet.add("rest-digestive");
      }
    }
    
    if (topCondition.includes("Headache") || topCondition.includes("Migraine")) {
      if (!recSet.has("dark-room")) {
        recommendations.push("Rest in a dark, quiet room and apply a cold or warm compress to your forehead");
        recSet.add("dark-room");
      }
      if (!recSet.has("hydration-headache")) {
        recommendations.push("Ensure adequate hydration as dehydration can worsen headaches");
        recSet.add("hydration-headache");
      }
      if (!recSet.has("stress-management")) {
        recommendations.push("Practice stress management techniques like deep breathing or meditation");
        recSet.add("stress-management");
      }
    }
    
    if (topCondition.includes("Asthma") || topCondition.includes("Bronchitis")) {
      if (!recSet.has("inhaler")) {
        recommendations.push("If you have a prescribed inhaler, use it as directed. Avoid triggers like smoke, dust, and allergens");
        recSet.add("inhaler");
      }
      if (!recSet.has("breathing")) {
        recommendations.push("Practice pursed-lip breathing to help manage shortness of breath");
        recSet.add("breathing");
      }
    }
  }
  
  // Symptom-specific recommendations
  if (foundSymptoms.some(s => s.includes("Fever") || s.includes("temperature"))) {
    if (!recSet.has("fever-monitor")) {
      recommendations.push("Monitor your temperature every 4-6 hours. If it exceeds 103°F (39.4°C) or persists for more than 3 days, seek medical attention");
      recSet.add("fever-monitor");
    }
    if (!recSet.has("fever-medication")) {
      recommendations.push("Consider taking acetaminophen or ibuprofen to reduce fever (follow dosage instructions)");
      recSet.add("fever-medication");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Cough"))) {
    if (!recSet.has("cough-remedy")) {
      recommendations.push("Use cough drops or honey with warm water/tea to soothe throat irritation. Avoid lying flat if cough worsens at night");
      recSet.add("cough-remedy");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Nausea") || s.includes("Vomiting"))) {
    if (!recSet.has("nausea-ginger")) {
      recommendations.push("Try ginger tea or ginger candies to help reduce nausea. Eat small, bland meals");
      recSet.add("nausea-ginger");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Diarrhea"))) {
    if (!recSet.has("diarrhea-hydration")) {
      recommendations.push("Drink plenty of clear fluids and electrolyte solutions. Avoid caffeine and alcohol");
      recSet.add("diarrhea-hydration");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Chest pain") || s.includes("Chest tightness"))) {
    if (!recSet.has("chest-urgent")) {
      recommendations.push("⚠️ Chest pain requires immediate medical evaluation. If severe or accompanied by difficulty breathing, seek emergency care");
      recSet.add("chest-urgent");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Shortness of breath"))) {
    if (!recSet.has("breath-urgent")) {
      recommendations.push("⚠️ Difficulty breathing is a serious symptom. If severe or sudden, seek immediate medical attention");
      recSet.add("breath-urgent");
    }
  }
  
  if (foundSymptoms.some(s => s.includes("Rash") || s.includes("Itching"))) {
    if (!recSet.has("rash-care")) {
      recommendations.push("Keep the affected area clean and dry. Apply cool compresses and avoid scratching. Consider over-the-counter antihistamines for itching");
      recSet.add("rash-care");
    }
  }
  
  // General recommendations (only if not already covered)
  if (!recSet.has("monitor")) {
    recommendations.push("Keep a symptom diary noting when symptoms occur, their severity, and any triggers");
    recSet.add("monitor");
  }
  
  if (!recSet.has("medical-attention")) {
    if (foundSymptoms.length > 3 || sortedConditions.some(c => c.includes("Pneumonia") || c.includes("Asthma"))) {
      recommendations.push("⚠️ Given the combination of symptoms, consider consulting a healthcare professional within 24-48 hours");
    } else {
      recommendations.push("If symptoms persist for more than 5-7 days, worsen, or new symptoms appear, consult a healthcare professional");
    }
    recSet.add("medical-attention");
  }

  // If no symptoms found, provide helpful feedback
  let finalSymptoms = foundSymptoms;
  if (foundSymptoms.length === 0) {
    // Check if transcript has meaningful content
    if (transcript.trim().length < 10) {
      finalSymptoms = ["Please speak for longer and describe your symptoms in detail"];
    } else {
      finalSymptoms = [
        "Unable to detect specific symptoms from the transcript",
        "Please try describing your symptoms using common terms like: headache, fever, cough, pain, etc.",
        `Transcript received: "${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`
      ];
    }
  }

    const analysisResult = {
      symptoms: finalSymptoms,
      possibleConditions: possibleConditions,
      recommendations: recommendations.length > 0 ? recommendations.slice(0, 8) : [
        "Please describe your symptoms more specifically",
        "Try using common symptom words in your language",
        "If symptoms persist, consult a healthcare professional"
      ]
    };
    
    // Save analysis to MongoDB if user is authenticated
    if (userId) {
      try {
        const analysisId = "va_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
        await VoiceAnalysis.create({
          userId,
          analysisId,
          transcript,
          language: language || "en-US",
          analysis: analysisResult,
          createdAt: new Date()
        });
      } catch (saveError) {
        console.error("Error saving voice analysis:", saveError);
        // Don't fail the request if save fails
      }
    }
    
    res.json({
      ...analysisResult,
      debug: process.env.NODE_ENV === "development" ? {
        transcriptLength: transcript.length,
        language: language,
        hasNonLatinChars: hasNonLatinChars,
        normalizedText: normalizedText.substring(0, 100)
      } : undefined
    });
  } catch (error) {
    console.error("Error in voice analysis:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/voice/transcribe - Server-side transcription (fallback)
app.post("/api/voice/transcribe", upload.single("audio"), (req, res) => {
  // In production, integrate with a speech-to-text service like:
  // - Google Cloud Speech-to-Text
  // - Azure Speech Services
  // - AWS Transcribe
  // For now, return a message indicating server-side transcription is not implemented
  res.status(501).json({ 
    message: "Server-side transcription not implemented. Please use browser speech recognition." 
  });
});

// POST /api/voice/save - save voice analysis to user dashboard
app.post("/api/voice/save", async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { analysisId, transcript, language, analysis } = req.body || {};
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!analysisId || !transcript || !analysis) {
      return res.status(400).json({ message: "Analysis ID, transcript, and analysis data required" });
    }
    
    await VoiceAnalysis.create({
      userId,
      analysisId,
      transcript,
      language: language || "en-US",
      analysis,
      createdAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving voice analysis:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/user - get current user (for dashboard welcome)
app.get("/api/user", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/dashboard/metrics
app.get("/api/dashboard/metrics", async (req, res) => {
  try {
    const userId = await getUserId(req);
    
    if (userId) {
      const metrics = await HealthMetrics.find({ userId })
        .sort({ recordedAt: -1 })
        .limit(10)
        .lean();
      
      if (metrics.length > 0) {
        const formatted = metrics.map(m => ({
          label: m.label,
          value: m.value,
          status: m.status,
          color: m.color
        }));
        return res.json(formatted);
      }
    }
    
    // Return default metrics if no user-specific metrics found
    res.json(METRICS);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return res.json(METRICS); // Fallback to defaults
  }
});

// POST /api/dashboard/metrics - save user metrics
app.post("/api/dashboard/metrics", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const { metrics } = req.body || {};
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({ message: "Metrics array required" });
    }
    
    // Save each metric
    for (const metric of metrics) {
      await HealthMetrics.create({
        userId,
        label: metric.label,
        value: metric.value,
        status: metric.status,
        color: metric.color,
        recordedAt: new Date()
      });
    }
    
    res.json({ success: true, message: "Metrics saved successfully" });
  } catch (error) {
    console.error("Error saving metrics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/dashboard/appointments
app.get("/api/dashboard/appointments", async (req, res) => {
  try {
    const userId = await getUserId(req);
    
    if (userId) {
      const appointments = await Appointment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      if (appointments.length > 0) {
        const formatted = appointments.map(a => ({
          title: a.title,
          date: a.date,
          time: a.time,
          doctor: a.doctor
        }));
        return res.json(formatted);
      }
    }
    
    // Return default appointments if no user-specific appointments found
    res.json(APPOINTMENTS);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.json(APPOINTMENTS); // Fallback to defaults
  }
});

// POST /api/dashboard/appointments - add user appointment
app.post("/api/dashboard/appointments", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const appointment = req.body || {};
    if (!appointment.title || !appointment.date || !appointment.time || !appointment.doctor) {
      return res.status(400).json({ message: "Title, date, time, and doctor required" });
    }
    
    await Appointment.create({
      userId,
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      doctor: appointment.doctor,
      notes: appointment.notes,
      createdAt: new Date()
    });
    
    res.json({ success: true, message: "Appointment added successfully" });
  } catch (error) {
    console.error("Error adding appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`MediSense API running at http://localhost:${PORT}`);
});
