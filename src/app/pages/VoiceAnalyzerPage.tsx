import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mic, MicOff, PlayCircle, FileText, Brain } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { analyzeVoice, saveVoiceToDashboard, type VoiceAnalysisResult } from "../api/voice";

export function VoiceAnalyzerPage() {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setRecordError(null);
    setAnalysisError(null);
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setAnalysisResult(null);

      // Start speech recognition for real-time transcription
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Set language based on selection
        if (selectedLanguage === "auto") {
          // For auto mode, try to detect the best language
          // Start with browser's preferred language or English
          const browserLang = navigator.language || "en-US";
          const supportedLangs = ["en-US", "hi-IN", "es-ES", "fr-FR", "zh-CN", "ar-SA"];
          
          // Check if browser language is supported
          if (supportedLangs.includes(browserLang)) {
            recognition.lang = browserLang;
          } else {
            // Default to English for auto-detection
            recognition.lang = "en-US";
          }
          console.log("Auto mode - using language:", recognition.lang);
        } else {
          recognition.lang = selectedLanguage;
          console.log("Manual language selected:", selectedLanguage);
        }

        let fullTranscript = "";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;
            
            if (result.isFinal) {
              fullTranscript += transcript + " ";
              console.log(`Final transcript: "${transcript}" (Confidence: ${confidence})`);
              
              // Real-time language detection for auto mode
              if (selectedLanguage === "auto") {
                // Check if transcript contains Hindi characters
                if (/[\u0900-\u097F]/.test(transcript)) {
                  console.log("🔍 Hindi detected in transcript");
                  // Could switch to Hindi if needed, but continue with current for now
                }
                // Check if transcript contains romanized Hindi words
                const romanizedHindiWords = ["dard", "bukhar", "khansi", "thak", "pet", "sar", "pair", "behosh", "chakkar", "ulti", "matli"];
                const words = transcript.toLowerCase().split(/\s+/);
                const hasRomanizedHindi = words.some(word => romanizedHindiWords.some(hindiWord => word.includes(hindiWord)));
                if (hasRomanizedHindi) {
                  console.log("🔍 Romanized Hindi detected in transcript");
                }
              }
            } else {
              interimTranscript += transcript;
            }
          }
          setTranscript(fullTranscript + interimTranscript);
          
          // Log for debugging
          console.log(`Current language: ${recognition.lang} | Full transcript: "${fullTranscript}"`);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "no-speech") {
            setRecordError("No speech detected. Please try speaking clearly.");
          } else if (event.error === "not-allowed") {
            setRecordError("Microphone access denied. Please allow microphone access.");
          } else {
            setRecordError(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // Restart recognition if still recording
          if (isRecording) {
            try {
              recognition.start();
            } catch (err) {
              console.error("Failed to restart recognition:", err);
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.error("Microphone access failed", err);
      setRecordError("Microphone access denied or unavailable. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setHasRecording(true);
    }
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleAnalyze = async () => {
    if (!audioBlob && !transcript) {
      setAnalysisError("No recording or transcript available. Please record again.");
      return;
    }
    setAnalysisError(null);
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Use the user's selected language for analysis
      const analysisLanguage = selectedLanguage === "auto" ? "en-US" : selectedLanguage;
      console.log("Analyzing with language:", analysisLanguage, "Selected:", selectedLanguage, "Transcript:", transcript);
      const result = await analyzeVoice(audioBlob || new Blob(), analysisLanguage, transcript);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed", err);
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed. Please check your connection and try again, or record again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToDashboard = async () => {
    if (!analysisResult) {
      setAnalysisError("No analysis result to save. Please analyze your voice first.");
      return;
    }
    setSavingToDashboard(true);
    setAnalysisError(null);
    try {
      // Generate a unique ID for this analysis
      const analysisId = `voice-${Date.now()}`;
      await saveVoiceToDashboard(analysisId);
      // Show success message (you could add a toast notification here)
      console.log("Voice analysis saved to dashboard");
    } catch (err) {
      console.error("Failed to save to dashboard:", err);
      setAnalysisError("Failed to save to dashboard. Please try again.");
    } finally {
      setSavingToDashboard(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
            {t("voice.aiVoiceAnalysis")}
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">{t("voice.voiceSymptomAnalyzer")}</h1>
          <p className="text-xl text-slate-600">{t("voice.voiceSymptomDesc")}</p>
        </div>

        {/* Recording Interface */}
        <Card className="border-2 border-emerald-100 shadow-2xl mb-12">
          <CardContent className="p-12">
            <div className="flex flex-col items-center">
              {/* Language Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("voice.selectLanguage") || "Select Language"}
                </label>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRecording}
                  >
                    <option value="auto">Auto-detect (English first)</option>
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                    <option value="es-ES">Español</option>
                    <option value="fr-FR">Français</option>
                    <option value="zh-CN">中文 (Chinese)</option>
                    <option value="ar-SA">العربية (Arabic)</option>
                  </select>
              </div>

              {/* Microphone Button */}
              <button
                onClick={toggleRecording}
                className={`relative mb-8 transition-all duration-300 ${
                  isRecording ? 'animate-pulse' : ''
                }`}
              >
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all ${
                  isRecording 
                    ? 'bg-red-300 opacity-75 scale-125' 
                    : 'bg-gradient-to-r from-blue-300 to-emerald-300 opacity-50'
                }`}></div>
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600'
                } shadow-2xl hover:scale-110`}>
                  {isRecording ? (
                    <MicOff className="size-16 text-white" />
                  ) : (
                    <Mic className="size-16 text-white" />
                  )}
                </div>
              </button>

              {recordError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {recordError}
                </div>
              )}
              {/* Status Text */}
              <div className="text-center mb-8">
                {isRecording ? (
                  <>
                    <p className="text-2xl font-bold text-red-600 mb-2">{t("voice.recording")}</p>
                    <p className="text-slate-600">{t("voice.clickToStop")}</p>
                    {transcript && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
                        <p className="text-sm text-slate-700 font-medium mb-1">
                          Transcription ({recognitionRef.current?.lang || selectedLanguage || 'auto'}):
                        </p>
                        <p className="text-slate-600 text-sm">{transcript}</p>
                      </div>
                    )}
                  </>
                ) : hasRecording ? (
                  <>
                    <p className="text-2xl font-bold text-emerald-600 mb-2">{t("voice.recordingComplete")}</p>
                    <p className="text-slate-600">{t("voice.clickAnalyze")}</p>
                    {transcript && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 max-w-2xl mx-auto">
                        <p className="text-sm text-slate-700 font-medium mb-1">
                          Recorded ({recognitionRef.current?.lang || selectedLanguage || 'auto'}):
                        </p>
                        <p className="text-slate-600 text-sm">{transcript}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-800 mb-2">{t("voice.readyToRecord")}</p>
                    <p className="text-slate-600">{t("voice.clickAndDescribe")}</p>
                  </>
                )}
              </div>

              {/* Wave Animation */}
              {isRecording && (
                <div className="flex items-center gap-2 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-blue-600 to-emerald-600 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {hasRecording && !isRecording && (
                  <>
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() => { setHasRecording(false); setAudioBlob(null); setAnalysisResult(null); setTranscript(""); }}
                    >
                      <PlayCircle className="size-5 mr-2" />
                      {t("voice.playRecording")}
                    </Button>
                    <Button
                      disabled={analyzing}
                      onClick={handleAnalyze}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
                    >
                      <Brain className="size-5 mr-2" />
                      {analyzing ? "..." : t("voice.analyzeSymptoms")}
                    </Button>
                  </>
                )}
              </div>
              {analysisError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {analysisError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results from API */}
        {analysisResult && (
          <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-br from-white to-sky-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-xl">
                  <FileText className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">{t("voice.analysisResults")}</h2>
                  <p className="text-slate-600">{t("voice.aiGeneratedInsights")}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{t("voice.detectedSymptoms")}</h3>
                  <div className="flex flex-wrap gap-3">
                    {analysisResult.symptoms.map((symptom, index) => (
                      <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">{symptom}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{t("voice.possibleConditions")}</h3>
                  <div className="space-y-3">
                    {analysisResult.possibleConditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                        <span className="text-slate-700 font-medium">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{t("voice.aiRecommendations")}</h3>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-100">
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">{index + 1}</div>
                        <span className="text-slate-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <p className="text-sm text-amber-800"><strong>Important:</strong> {t("voice.disclaimer")}</p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
                    onClick={handleSaveToDashboard}
                    disabled={savingToDashboard}
                  >
                    {savingToDashboard ? "Saving..." : t("voice.saveToDashboard")}
                  </Button>
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">{t("voice.shareWithDoctor")}</Button>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => { setAnalysisResult(null); setHasRecording(false); setAudioBlob(null); setTranscript(""); }}>{t("voice.newAnalysis")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { step: 1, title: "Record", desc: "Click the microphone and describe your symptoms naturally" },
            { step: 2, title: "Process", desc: "Our AI analyzes your voice and extracts key health information" },
            { step: 3, title: "Insights", desc: "Receive personalized health insights and recommendations" }
          ].map((item, index) => (
            <Card key={index} className="border border-emerald-100 hover:border-emerald-300 transition-all shadow-md">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
