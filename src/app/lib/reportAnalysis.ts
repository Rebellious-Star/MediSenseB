export interface AnalysisResult {
  summary: string;
  findings: {
    label: string;
    value: string;
    status: "normal" | "attention" | "critical";
    note?: string;
  }[];
  symptoms: string[];
  prevention: string[];
  futureSuggestions: string[];
  recommendations: string[];
  disclaimer: string;
}

const MEDICAL_TERMS = [
  "glucose", "HbA1c", "cholesterol", "LDL", "HDL", "triglycerides", "creatinine", "eGFR",
  "hemoglobin", "RBC", "WBC", "platelet", "TSH", "T3", "T4", "blood pressure", "BMI",
  "bilirubin", "ALT", "AST", "ALP", "urea", "BUN", "sodium", "potassium", "calcium",
  "vitamin D", "vitamin B12", "ferritin", "ESR", "CRP", "Hb", "RBC count", "platelets",
  // Additional medical terms for better detection
  "diagnosis", "treatment", "medication", "prescription", "symptoms", "examination",
  "laboratory", "lab test", "blood test", "urine test", "x-ray", "ct scan", "mri",
  "ultrasound", "ecg", "eeg", "pathology", "clinical", "patient", "medical history",
  "physical examination", "vital signs", "pulse", "temperature", "respiratory", "heart rate",
  "systolic", "diastolic", "fasting", "random", "specimen", "sample", "diagnosis",
  "prognosis", "therapy", "surgery", "operation", "procedure", "consultation",
  "follow-up", "checkup", "screening", "diagnostic", "prognosis", "mortality",
  "morbidity", "chronic", "acute", "infection", "inflammation", "disease",
  "condition", "disorder", "syndrome", "pathology", "abnormal", "normal",
  "range", "reference", "value", "result", "finding", "conclusion", "impression"
];

// Non-medical terms to reject
const NON_MEDICAL_INDICATORS = [
  "meeting", "agenda", "minutes", "presentation", "business", "financial", "budget",
  "marketing", "sales", "revenue", "profit", "invoice", "contract", "agreement",
  "legal", "court", "lawsuit", "insurance", "policy", "claim", "coverage",
  "recipe", "ingredients", "cooking", "baking", "restaurant", "menu", "food",
  "travel", "vacation", "hotel", "flight", "booking", "reservation", "itinerary",
  "education", "school", "university", "course", "exam", "grade", "student",
  "entertainment", "movie", "music", "game", "sport", "team", "player",
  "shopping", "product", "price", "discount", "sale", "order", "delivery",
  "weather", "forecast", "temperature", "rain", "snow", "wind", "climate"
];

function isValidMedicalReport(text: string): { isValid: boolean; reason: string } {
  const lowerText = text.toLowerCase();
  
  // Count medical terms found
  const medicalTermsFound = MEDICAL_TERMS.filter(term => 
    lowerText.includes(term.toLowerCase())
  ).length;
  
  // Count non-medical indicators
  const nonMedicalTermsFound = NON_MEDICAL_INDICATORS.filter(term => 
    lowerText.includes(term.toLowerCase())
  ).length;
  
  // Check for common medical report patterns
  const hasMedicalPatterns = 
    /\b\d+\.?\d*\s*(?:mg\/dl|mmol\/l|g\/dl|u\/l|ng\/ml|pg\/ml)\b/i.test(text) || // Lab values with units
    /\b(normal|abnormal|high|low|elevated|decreased|within range)\b/i.test(text) || // Medical status terms
    /\b(patient|subject|specimen|sample)\b/i.test(text) || // Medical context
    /\b(diagnosis|impression|conclusion|finding|result)\b/i.test(text); // Medical conclusions
  
  // Minimum requirements for medical report
  const minMedicalTerms = 3;
  const hasEnoughMedicalTerms = medicalTermsFound >= minMedicalTerms;
  const hasTooManyNonMedical = nonMedicalTermsFound >= 3;
  
  // Decision logic
  if (hasTooManyNonMedical && !hasEnoughMedicalTerms) {
    return {
      isValid: false,
      reason: "This document appears to be non-medical content (business, legal, or other non-healthcare related). Please upload a medical report or health document."
    };
  }
  
  if (!hasEnoughMedicalTerms && !hasMedicalPatterns) {
    return {
      isValid: false,
      reason: "This document doesn't contain sufficient medical terminology or health-related content to be analyzed as a medical report. Please upload a valid medical report, lab results, or health document."
    };
  }
  
  if (text.length < 50) {
    return {
      isValid: false,
      reason: "Document is too short to be a medical report. Please upload a complete medical report or health document."
    };
  }
  
  return {
    isValid: true,
    reason: "Valid medical report detected with sufficient medical terminology."
  };
}

function pickFromReport(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) found.push(term);
  }
  return found.length ? found : ["General health markers"];
}

import { enhancedAnalyzeReport } from './ragAnalysis';

/** Enhanced analysis: uses RAG for better, context-aware results when available, falls back to mock analysis */
export async function analyzeReportText(text: string): Promise<AnalysisResult> {
  // First validate if this is a medical report
  const validation = isValidMedicalReport(text);
  
  if (!validation.isValid) {
    throw new Error(validation.reason);
  }
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (apiKey && text.length > 50) {
    try {
      // Use RAG-enhanced analysis with OpenAI
      return await enhancedAnalyzeReport(text);
    } catch (e) {
      console.warn("RAG-enhanced analysis failed, using built-in analysis:", e);
    }
  }
  return mockAnalyze(text);
}

async function analyzeWithOpenAI(text: string, apiKey: string): Promise<AnalysisResult> {
  const truncated = text.slice(0, 12000);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical report analyst. Given raw text from a medical/lab report, respond with a JSON object only (no markdown, no code block) with this exact structure:
{
  "summary": "2-4 sentence plain-language summary of the report and overall health indication",
  "findings": [{"label": "Finding name", "value": "value or range", "status": "normal" or "attention" or "critical", "note": "optional brief note"}],
  "symptoms": ["possible symptom 1", "possible symptom 2", ...],
  "prevention": ["preventive or lifestyle step 1", "step 2", ...],
  "futureSuggestions": ["follow-up or monitoring suggestion 1", "suggestion 2", ...],
  "recommendations": ["immediate or short-term recommendation 1", "recommendation 2", ...],
  "disclaimer": "Short disclaimer that this is not medical advice and the user should consult a doctor."
}
Status: use "normal" for within range, "attention" for borderline, "critical" for out of range or concerning. Do NOT add any fields beyond the ones specified above.`,
        },
        {
          role: "user",
          content: `Analyze this medical report text:\n\n${truncated}`,
        },
      ],
      max_tokens: 1500,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  const parsed = JSON.parse(content) as AnalysisResult;
  if (!parsed.summary || !Array.isArray(parsed.findings) || !Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid structure from OpenAI");
  }
  parsed.symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : [];
  parsed.prevention = Array.isArray(parsed.prevention) ? parsed.prevention : [];
  parsed.futureSuggestions = Array.isArray(parsed.futureSuggestions)
    ? parsed.futureSuggestions
    : [];
  parsed.disclaimer = parsed.disclaimer || "This is not medical advice. Please consult a healthcare provider.";
  return parsed;
}

function mockAnalyze(text: string): AnalysisResult {
  const termsFound = pickFromReport(text, MEDICAL_TERMS);
  const hasNumbers = /\d+\.?\d*/.test(text);
  const lowerText = text.toLowerCase();
  
  // Generate more specific analysis based on actual content
  let summary: string;
  let symptoms: string[] = [];
  const findings: { label: string; value: string; status: "normal" | "attention" | "critical"; note?: string }[] = [];
  
  // Check for specific conditions based on keywords
  if (lowerText.includes('back pain') || lowerText.includes('spine') || lowerText.includes('vertebrae')) {
    summary = "Your report appears to reference spinal or back-related health issues. We identified references to: " + termsFound.slice(0, 5).join(", ");
    symptoms = [
      "Back pain or discomfort",
      "Muscle stiffness or spasms", 
      "Limited range of motion",
      "Numbness or tingling in extremities"
    ];
  } else if (lowerText.includes('heart') || lowerText.includes('cardiac') || lowerText.includes('ecg')) {
    summary = "Your report appears to include cardiac-related markers and heart health indicators. We identified references to: " + termsFound.slice(0, 5).join(", ");
    symptoms = [
      "Chest pain or discomfort",
      "Irregular heartbeat or palpitations",
      "Shortness of breath",
      "Fatigue or weakness"
    ];
  } else if (lowerText.includes('blood') || lowerText.includes('glucose') || lowerText.includes('hba1c')) {
    summary = "Your report appears to include blood test results and metabolic markers. We identified references to: " + termsFound.slice(0, 5).join(", ");
    symptoms = [
      "Unusual thirst or hunger",
      "Frequent urination",
      "Fatigue or low energy",
      "Blurred vision"
    ];
  } else if (lowerText.includes('cholesterol') || lowerText.includes('lipid')) {
    summary = "Your report appears to include cholesterol and lipid panel results. We identified references to: " + termsFound.slice(0, 5).join(", ");
    symptoms = [
      "High cholesterol may cause fatty deposits in blood vessels",
      "Increased risk of heart disease",
      "Potential gallbladder issues",
      "Yellowish skin growths (xanthomas)"
    ];
  } else if (lowerText.includes('thyroid') || lowerText.includes('tsh') || lowerText.includes('t3')) {
    summary = "Your report appears to include thyroid function tests. We identified references to: " + termsFound.slice(0, 5).join(", ");
    symptoms = [
      "Unexplained weight changes",
      "Temperature sensitivity (hot/cold intolerance)",
      "Mood changes or depression",
      "Changes in menstrual patterns"
    ];
  } else {
    summary = hasNumbers
      ? `Your report appears to include lab values and health metrics. We identified references to: ${termsFound.slice(0, 5).join(", ")}. The analysis below is a structured interpretation based on extracted text. Always confirm with your doctor.`
      : "We've processed your document. Below is a structured overview. For precise interpretation of values and ranges, please share with your healthcare provider.";
    symptoms = [
      "Fatigue or low energy",
      "Headaches or lightheadedness", 
      "Shortness of breath on exertion",
      "Unintentional weight changes"
    ];
  }

  const prevention: string[] = [
    "Maintain a balanced diet rich in fruits, vegetables, whole grains, and lean protein.",
    "Limit added sugars, deep-fried foods, and highly processed snacks.",
    "Aim for at least 30 minutes of moderate physical activity most days of the week.",
    "Avoid smoking and limit alcohol intake as advised by your doctor.",
  ];

  const futureSuggestions: string[] = [
    "Repeat key tests at the interval recommended by your doctor to monitor trends over time.",
    "Share this report and any changes in symptoms with your healthcare provider.",
    "Keep a personal health log of lab results, medications, and major symptoms.",
  ];

  const recommendations = [
    "Discuss these results with your healthcare provider for personalized advice.",
    "Keep a copy of this report for your records and future visits.",
    "If any values were flagged, schedule a follow-up as recommended.",
  ];

  return {
    summary,
    findings,
    symptoms,
    prevention,
    futureSuggestions,
    recommendations,
    disclaimer: "This analysis is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions.",
  };
}
