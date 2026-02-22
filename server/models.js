import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const saltRounds = 10;

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost factor of 10
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Token Schema (for session management)
const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }, // 7 days
  createdAt: { type: Date, default: Date.now }
});

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  type: { type: String, required: true, enum: ['signup', 'login'] },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  id: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  color: { type: String, default: 'blue' },
  fileName: { type: String },
  fileType: { type: String },
  analysis: { type: mongoose.Schema.Types.Mixed },
  uploadedAt: { type: Date, default: Date.now }
});

// Health Metrics Schema
const metricsSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  label: { type: String, required: true },
  value: { type: String, required: true },
  status: { type: String },
  color: { type: String },
  recordedAt: { type: Date, default: Date.now }
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  doctor: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Voice Analysis Schema
const voiceAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  transcript: { type: String, required: true },
  language: { type: String },
  analysis: { type: mongoose.Schema.Types.Mixed, required: true },
  audioFileName: { type: String },
  analysisId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
tokenSchema.index({ token: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

const User = mongoose.model('User', userSchema);
const Token = mongoose.model('Token', tokenSchema);
const OTP = mongoose.model('OTP', otpSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Report = mongoose.model('Report', reportSchema);
const HealthMetrics = mongoose.model('HealthMetrics', metricsSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const VoiceAnalysis = mongoose.model('VoiceAnalysis', voiceAnalysisSchema);

export {
  User,
  Token,
  OTP,
  Contact,
  Report,
  HealthMetrics,
  Appointment,
  VoiceAnalysis
};
