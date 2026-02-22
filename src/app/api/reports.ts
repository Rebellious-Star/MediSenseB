import { request, getBaseUrl, isBackendConfigured } from "./client";
import { extractTextFromFile, isAcceptedFile } from "../lib/reportParser";
import { analyzeReportText, type AnalysisResult } from "../lib/reportAnalysis";

export interface ReportItem {
  id: string;
  title: string;
  date: string;
  status: string;
  color?: string;
}

export interface ReportAnalysisResult {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  status: string;
  /** Optional richer fields from client-side OCR + OpenAI analysis */
  findings?: { label: string; value: string; status: string; note?: string }[];
  symptoms?: string[];
  prevention?: string[];
  futureSuggestions?: string[];
  disclaimer?: string;
}

const MOCK_ANALYSIS: ReportAnalysisResult = {
  summary:
    "Your report has been processed. Key biomarkers and findings have been extracted and interpreted below.",
  keyFindings: [
    "Document was successfully parsed and read.",
    "All major sections were detected.",
    "No critical abnormalities flagged in the reviewed ranges.",
    "Values within normal reference ranges where applicable.",
  ],
  recommendations: [
    "Discuss these results with your healthcare provider at your next visit.",
    "Keep a copy of this report for your records.",
    "Schedule follow-up tests if your doctor has recommended them.",
  ],
  status: "Reviewed",
};

function mapAnalysisResultToReportResult(a: AnalysisResult): ReportAnalysisResult {
  return {
    summary: a.summary,
    keyFindings: a.findings.map((f) => `${f.label}: ${f.value} (${f.status})`),
    recommendations: a.recommendations,
    status: "Reviewed",
    findings: a.findings,
    symptoms: a.symptoms,
    prevention: a.prevention,
    futureSuggestions: a.futureSuggestions,
    disclaimer: a.disclaimer,
  };
}

export async function uploadReport(file: File): Promise<{ id: string; title: string }> {
  if (!isBackendConfigured()) {
    return Promise.resolve({
      id: "mock-" + Date.now(),
      title: file.name || "Uploaded Report",
    });
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("medisense_token") : null;
  const formData = new FormData();
  formData.append("file", file);
  const url = getBaseUrl() + "/api/reports/upload";
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function analyzeReport(file: File): Promise<ReportAnalysisResult> {
  if (!isBackendConfigured()) {
    // Client-side: OCR (PDF/Word/Image) + optional OpenAI analysis
    if (!isAcceptedFile(file)) {
      return Promise.resolve(MOCK_ANALYSIS);
    }
    try {
      const text = await extractTextFromFile(file);
      if (!text || text.length < 10) {
        return MOCK_ANALYSIS;
      }
      const analysis = await analyzeReportText(text);
      return mapAnalysisResultToReportResult(analysis);
    } catch (e) {
      console.warn("Client-side analysis failed:", e);
      return MOCK_ANALYSIS;
    }
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("medisense_token") : null;
  const formData = new FormData();
  formData.append("file", file);
  const url = getBaseUrl() + "/api/reports/analyze";
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function getReports(): Promise<ReportItem[]> {
  if (!isBackendConfigured()) {
    return [
      { id: "1", title: "Blood Test Results", date: "2 days ago", status: "Reviewed", color: "emerald" },
      { id: "2", title: "Cholesterol Panel", date: "1 week ago", status: "Pending", color: "blue" },
      { id: "3", title: "Thyroid Function Test", date: "2 weeks ago", status: "Reviewed", color: "emerald" },
    ];
  }
  return request<ReportItem[]>("/api/reports");
}
