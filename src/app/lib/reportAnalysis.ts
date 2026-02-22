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
];

function pickFromReport(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) found.push(term);
  }
  return found.length ? found : ["General health markers"];
}

/** Mock analysis: derives a plausible report from extracted text. Use real API (e.g. OpenAI) when VITE_OPENAI_API_KEY is set. */
export async function analyzeReportText(text: string): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (apiKey && text.length > 50) {
    try {
      return await analyzeWithOpenAI(text, apiKey);
    } catch (e) {
      console.warn("OpenAI analysis failed, using built-in analysis:", e);
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
  const summary = hasNumbers
    ? `Your report appears to include lab values and health metrics. We identified references to: ${termsFound.slice(0, 5).join(", ")}. The analysis below is a structured interpretation based on the extracted text. Always confirm with your doctor.`
    : "We've processed your document. Below is a structured overview. For precise interpretation of values and ranges, please share with your healthcare provider.";

  const findings = termsFound.slice(0, 6).map((label, i) => ({
    label,
    value: "See report",
    status: (["normal", "attention", "normal"] as const)[i % 3],
    note: "Value and range should be verified with your doctor.",
  }));

  const symptoms: string[] = [
    "Fatigue or low energy",
    "Headaches or lightheadedness",
    "Shortness of breath on exertion",
    "Unintentional weight changes",
  ];

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
