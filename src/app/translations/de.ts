import type { DeepPartial } from "./types";
import type { TranslationKeys } from "./en";

export const de: DeepPartial<TranslationKeys> = {
  header: {
    tagline: "Gesundheitsintelligenz",
    nav: { home: "Start", uploadReport: "Bericht hochladen", features: "Funktionen", howItWorks: "So funktioniert's", voiceAnalyzer: "Sprachanalyse", contact: "Kontakt" },
    login: "Anmelden",
    signUp: "Registrieren",
  },
  footer: {
    tagline: "Gesundheitswesen mit KI-Berichtsanalyse und personalisierten Erklärungen transformieren.",
    quickLinks: "Schnelllinks",
    services: "Leistungen",
    contact: "Kontakt",
    aiReportAnalysis: "KI-Berichtsanalyse",
    personalizedExplanations: "Personalisierte Erklärungen",
    healthInsights: "Gesundheitseinblicke",
    medicalTerminologyTranslation: "Medizinische Terminologie",
    copyright: "© 2026 MediSense. Alle Rechte vorbehalten. | Datenschutz | AGB",
  },
  home: {
    hero: { badge: "KI-Gesundheitsintelligenz", title: "Ihre Gesundheit,", titleHighlight: "entschlüsselt", subtitle: "Komplexe Berichte in klare Einblicke verwandeln.", available: "Verfügbar", accurate: "Präzise", users: "Nutzer", uploadReport: "Bericht hochladen", learnMore: "Mehr erfahren" },
    stats: { availability: "Verfügbarkeit", reportsAnalyzed: "Analysierte Berichte", activeUsers: "Aktive Nutzer", accuracyRate: "Genauigkeit" },
    diseases: { title: "Alle wichtigen Gesundheitszustände", subtitle: "Experten-KI in über 16 Kategorien", coverage: "Umfassende Abdeckung", clickToLearn: "Mehr erfahren" },
    featureShowcase: { advantages: "Vorteile", title: "Warum MediSense", subtitle: "Technik und mitfühlende Versorgung" },
    ageCategories: { title: "Für jede Altersgruppe", subtitle: "Maßgeschneiderte Einblicke", badge: "Altersspezifische Versorgung" },
    features: { badge: "Kernfunktionen", title: "Funktionen für bessere Gesundheit", subtitle: "Technik und medizinische Expertise" },
    testimonials: { badge: "Erfahrungsberichte", title: "Von Tausenden vertraut", subtitle: "Was Nutzer sagen" },
    cta: { title: "Bereit, Ihre Gesundheit zu verstehen?", subtitle: "Tausende nehmen ihre Gesundheit in die Hand", getStarted: "Kostenlos starten", contactSales: "Verkauf kontaktieren" },
    quote: "Der größte Reichtum ist Gesundheit",
    quoteAuthor: "— Alte Weisheit",
  },
  login: { welcome: "Willkommen zurück", subtitle: "Anmelden für Ihr Gesundheits-Dashboard", email: "E-Mail", password: "Passwort", rememberMe: "Angemeldet bleiben", forgotPassword: "Passwort vergessen?", signIn: "Anmelden", orContinueWith: "Oder fortfahren mit", noAccount: "Noch kein Konto?", signUpNow: "Jetzt registrieren" },
  signup: { title: "Konto erstellen", subtitle: "Gesundheitsreise mit uns starten", fullName: "Name", email: "E-Mail", password: "Passwort", confirmPassword: "Passwort bestätigen", agreeTerms: "AGB und Datenschutz akzeptieren", createAccount: "Konto erstellen", haveAccount: "Bereits Konto?", signIn: "Anmelden" },
  dashboard: { welcome: "Willkommen zurück, John!", summary: "Ihre heutige Gesundheitsübersicht", uploadNewReport: "Neuen Bericht hochladen", getInstantAnalysis: "Sofort-KI-Analyse", upload: "Hochladen", voiceAnalysis: "Sprachanalyse", describeSymptoms: "Symptome beschreiben", start: "Starten", yourHealthMetrics: "Gesundheitsmetriken", recentReports: "Letzte Berichte", viewAllReports: "Alle anzeigen", upcomingAppointments: "Kommende Termine", scheduleNewAppointment: "Termin planen", aiHealthInsights: "KI-Gesundheitseinblicke", insightsText: "Ihre Gesundheit entwickelt sich positiv. Cholesterin verbessert. Ernährung und Bewegung beibehalten.", viewDetailedAnalysis: "Detaillierte Analyse", bloodPressure: "Blutdruck", heartRate: "Herzfrequenz", glucose: "Glukose", bmi: "BMI", normal: "Normal", good: "Gut", healthy: "Gesund", reviewed: "Überprüft", pending: "Ausstehend", bloodTestResults: "Blutuntersuchung", cholesterolPanel: "Cholesterin", thyroidTest: "Schilddrüse", twoDaysAgo: "Vor 2 Tagen", oneWeekAgo: "Vor 1 Woche", twoWeeksAgo: "Vor 2 Wochen", annualCheckup: "Vorsorge", followUp: "Nachsorge" },
  uploadReport: { title: "Bericht hochladen", subtitle: "PDF, Word oder Bild (PNG/JPG) hochladen. Wir analysieren mit OCR und KI.", dragDrop: "Bericht hierher ziehen oder klicken", fileTypes: "PDF, Word oder Bild — max 10 MB", chooseFile: "Datei wählen", reading: "Wird gelesen…", analyzing: "KI-Analyse…", somethingWrong: "Fehler", tryAnother: "Andere Datei", analysisComplete: "Fertig", uploadAnother: "Weiteren hochladen", summary: "Zusammenfassung", keyFindings: "Befunde", recommendations: "Empfehlungen", possibleSymptoms: "Symptome beobachten", preventionTips: "Prävention & Lebensstil", futureFollowUp: "Nachsorge", normal: "normal", attention: "Aufmerksamkeit", critical: "kritisch" },
  voiceAnalyzer: { badge: "KI-Sprachanalyse", title: "Sprach-Symptom-Analyzer", subtitle: "Symptome beschreiben, sofort Einblicke", readyToRecord: "Bereit", readyDesc: "Mikro klicken, Symptome beschreiben", recording: "Aufnahme...", recordingStop: "Klicken zum Stoppen", recordingComplete: "Fertig", analyzeResults: "Analysieren für Ergebnisse", analyze: "Analysieren", reset: "Zurücksetzen", detectedSymptoms: "Symptome", possibleConditions: "Mögliche Erkrankungen", recommendations: "Empfehlungen" },
  contact: { title: "Kontakt", subtitle: "Fragen? Wir helfen gern.", emailUs: "E-Mail", callUs: "Anrufen", visitUs: "Besuchen", businessHours: "Öffnungszeiten", faqTitle: "Häufige Fragen MediSense", sendMessage: "Senden", name: "Name", email: "E-Mail", subject: "Betreff", message: "Nachricht" },
  features: { title: "Funktionen", subtitle: "Alles für Ihre Gesundheit" },
  howItWorks: { title: "So funktioniert MediSense", cta: "MediSense ausprobieren?" },
  common: { learnMore: "Mehr", getStarted: "Starten" },
};
