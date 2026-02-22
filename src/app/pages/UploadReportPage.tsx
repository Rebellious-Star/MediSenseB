import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Shield,
  Activity,
  HeartPulse,
  CalendarClock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  extractTextFromFile,
  validateFile,
  isAcceptedFile,
} from "../lib/reportParser";
import { analyzeReportText, type AnalysisResult } from "../lib/reportAnalysis";
import { cn } from "../components/ui/utils";

type Step = "idle" | "uploading" | "analyzing" | "done" | "error";

export function UploadReportPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setStep("idle");
    setFile(null);
    setError(null);
    setResult(null);
  }, []);

  const handleFile = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setError(null);
    setFile(selectedFile);
    const validation = validateFile(selectedFile);
    if (!validation.ok) {
      setError(validation.error ?? "Invalid file");
      setStep("error");
      return;
    }
    setStep("uploading");
    try {
      const text = await extractTextFromFile(selectedFile);
      if (!text || text.length < 10) {
        setError("We couldn't extract enough text from this file. For images, ensure the photo is clear. For documents, ensure they contain readable text content.");
        setStep("error");
        return;
      }
      setStep("analyzing");
      const analysis = await analyzeReportText(text);
      setResult(analysis);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("error");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && isAcceptedFile(f)) handleFile(f);
      else if (f) setError("Please upload a PDF, Word document (.pdf, .doc, .docx), text file (.txt), spreadsheet (.csv, .xls, .xlsx), or image (.png, .jpg).");
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">{t("uploadReport.title")}</CardTitle>
            <p className="text-slate-600">{t("uploadReport.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "idle" && (
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                  dragOver ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-emerald-400"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => document.getElementById("upload-file-input")?.click()}
              >
                <Upload className="size-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-700 font-medium mb-2">{t("uploadReport.dragDrop")}</p>
                <p className="text-sm text-slate-500 mb-4">{t("uploadReport.fileTypes")}</p>
                <Button variant="outline" className="border-emerald-200 text-emerald-700" asChild>
                  <span>{t("uploadReport.chooseFile")}</span>
                </Button>
                <input
                  id="upload-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={onInputChange}
                />
              </div>
            )}

            {(step === "uploading" || step === "analyzing") && (
              <div className="flex flex-col items-center gap-4 py-4">
                <Loader2 className="size-12 animate-spin text-emerald-600" />
                <p className="text-slate-700 font-medium">
                  {step === "uploading" ? t("uploadReport.reading") : t("uploadReport.analyzing")}
                </p>
                <p className="text-sm text-slate-500">{file?.name}</p>
              </div>
            )}

            {step === "error" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <AlertCircle className="size-12 text-red-500" />
                <p className="text-slate-700 font-medium">{t("uploadReport.somethingWrong")} {error}</p>
                <Button variant="outline" onClick={reset} className="border-emerald-200 text-emerald-700">
                  {t("uploadReport.tryAnother")}
                </Button>
              </div>
            )}

            {step === "done" && result && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="size-10 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-800">{t("uploadReport.analysisComplete")}</h3>
                    <Button variant="outline" size="sm" onClick={reset} className="mt-2 border-emerald-200 text-emerald-700">
                      {t("uploadReport.uploadAnother")}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="size-5" />
                    {t("uploadReport.summary")}
                  </h3>
                  <p className="text-slate-700">{result.summary}</p>
                </div>

                {result.findings.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Activity className="size-5" />
                      {t("uploadReport.keyFindings")}
                    </h3>
                    <div className="space-y-2">
                      {result.findings.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-800">{f.label}</span>
                          <span className="text-slate-600">{f.value}</span>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            f.status === "normal" && "bg-emerald-100 text-emerald-700",
                            f.status === "attention" && "bg-amber-100 text-amber-700",
                            f.status === "critical" && "bg-red-100 text-red-700"
                          )}>
                            {f.status}
                          </span>
                          {f.note && <p className="text-sm text-slate-500 mt-1">{f.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.symptoms && result.symptoms.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <HeartPulse className="size-5" />
                      {t("uploadReport.possibleSymptoms")}
                    </h3>
                    <ul className="space-y-2">
                      {result.symptoms.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.prevention && result.prevention.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="size-5" />
                      {t("uploadReport.preventionTips")}
                    </h3>
                    <ul className="space-y-2">
                      {result.prevention.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-emerald-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.futureSuggestions && result.futureSuggestions.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <CalendarClock className="size-5" />
                      {t("uploadReport.futureFollowUp")}
                    </h3>
                    <ul className="space-y-2">
                      {result.futureSuggestions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Shield className="size-5" />
                      {t("uploadReport.recommendations")}
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.disclaimer && (
                  <p className="text-sm text-slate-500 italic border-t pt-4">{result.disclaimer}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
