import type { DeepPartial } from "./types";
import type { TranslationKeys } from "./en";

export const kn: DeepPartial<TranslationKeys> = {
  header: { tagline: "Health Intelligence", nav: { home: "Home", uploadReport: "Upload Report", features: "Features", howItWorks: "How It Works", voiceAnalyzer: "Voice Analyzer", contact: "Contact" }, login: "Login", signUp: "Sign Up" },
  footer: { tagline: "Transforming healthcare with AI medical report intelligence.", quickLinks: "Quick Links", services: "Services", contact: "Contact", copyright: "© 2026 MediSense. All rights reserved." },
  home: { hero: { badge: "AI Healthcare Intelligence", title: "Your Health,", titleHighlight: "Decoded", subtitle: "Transform complex medical reports into clear insights.", uploadReport: "Upload Report", learnMore: "Learn More" }, cta: { title: "Ready to understand your health better?", getStarted: "Get Started Free" } },
  login: { welcome: "Welcome Back", subtitle: "Sign in to access your health dashboard", signIn: "Sign In", signUpNow: "Sign Up Now" },
  signup: { title: "Create Account", subtitle: "Start your health journey with us", createAccount: "Create Account" },
  dashboard: { welcome: "Welcome back!", uploadNewReport: "Upload New Report", voiceAnalysis: "Voice Analysis", recentReports: "Recent Reports", upcomingAppointments: "Upcoming Appointments" },
  uploadReport: { title: "Upload New Report", subtitle: "Upload PDF, Word or image. We analyze with OCR and AI.", chooseFile: "Choose file", analysisComplete: "Analysis complete" },
  voiceAnalyzer: { title: "Voice Symptom Analyzer", subtitle: "Describe symptoms and get instant AI health insights" },
  contact: { title: "Contact", subtitle: "Questions? We are here to help." },
  features: { title: "Features" },
  howItWorks: { title: "How MediSense Works" },
};
