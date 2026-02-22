import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  FileText,
  TrendingUp,
  Calendar,
  Upload,
  Mic,
  BarChart3,
  Heart,
  Brain,
  Clock,
  Pencil,
  Phone,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pill,
  Map,
  Navigation,
  Bell,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { getStoredUser } from "../api/auth";
import { getReports, uploadReport, analyzeReport, type ReportItem, type ReportAnalysisResult } from "../api/reports";
import {
  getHealthMetrics,
  getAppointments,
  getSavedHealthMetrics,
  saveHealthMetrics,
  getMatchingDoctors,
  addSavedAppointment,
  DEFAULT_METRICS,
  type HealthMetric,
  type Appointment,
  type Doctor,
  type Hospital,
  type Location,
  getCurrentLocation,
  getNearbyHospitals,
} from "../api/dashboard";

const METRICS_REF_ID = "dashboard-health-metrics";

export function DashboardPage() {
  const { t } = useTranslation();
  const user = getStoredUser();
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => getSavedHealthMetrics());
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzingReport, setAnalyzingReport] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{ reportTitle: string; result: ReportAnalysisResult } | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [scheduleAge, setScheduleAge] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [matchingDoctors, setMatchingDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [editingMetrics, setEditingMetrics] = useState<HealthMetric[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metricsSectionRef = useRef<HTMLDivElement>(null);
  
  // First Aid state
  const [firstAidExpanded, setFirstAidExpanded] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [userWeight, setUserWeight] = useState<string>("");
  const [userAge, setUserAge] = useState<string>("");
  const [showDosageForm, setShowDosageForm] = useState(false);
  
  // Location and hospital state
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // Health News state
  const [newsExpanded, setNewsExpanded] = useState(false);

  useEffect(() => {
    getReports().then(setRecentReports).catch(() => {});
    setHealthMetrics(getSavedHealthMetrics());
    getAppointments().then(setUpcomingAppointments).catch(() => {});
  }, []);

  const openMetricsModal = () => {
    setEditingMetrics(getSavedHealthMetrics().map((m) => ({ ...m })));
    setMetricsModalOpen(true);
  };

  const handleMetricsSave = async () => {
    const withStatus = editingMetrics.map((m) => {
      const val = (m.value || "").trim();
      const status = !val || val === "0" ? "Not set" : "Recorded";
      const color = val ? "emerald" : "blue";
      return { ...m, value: val || m.value, status, color };
    });
    await saveHealthMetrics(withStatus);
    setHealthMetrics(withStatus);
    setMetricsModalOpen(false);
  };

  const resetMetricsToZero = () => {
    setEditingMetrics(DEFAULT_METRICS.map((m) => ({ ...m })));
  };

  const openScheduleModal = () => {
    setScheduleLocation("");
    setScheduleAge("");
    setScheduleDate("");
    setMatchingDoctors([]);
    setSelectedDoctor(null);
    setSelectedSlot("");
    setScheduleModalOpen(true);
  };

  const searchDoctors = () => {
    const age = parseInt(scheduleAge, 10) || 0;
    const list = getMatchingDoctors(scheduleLocation, age);
    setMatchingDoctors(list);
    setSelectedDoctor(null);
    setSelectedSlot("");
  };

  const confirmAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    const date = scheduleDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    await addSavedAppointment({
      title: selectedDoctor.specialty + " – " + selectedDoctor.name,
      date,
      time: selectedSlot,
      doctor: selectedDoctor.name,
      contact: selectedDoctor.contactNo,
      venue: selectedDoctor.venue,
    });
    setUpcomingAppointments((prev) => [
      {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        title: selectedDoctor.specialty + " – " + selectedDoctor.name,
        date,
        time: selectedSlot,
        doctor: selectedDoctor.name,
        contact: selectedDoctor.contactNo,
        venue: selectedDoctor.venue,
      },
      ...prev,
    ]);
    setScheduleModalOpen(false);
  };

  const scrollToMetrics = () => {
    metricsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUploadClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [".pdf", ".ppt", ".pptx", ".txt", ".doc", ".docx"];
    const validImages = "image/jpeg,image/png,image/gif,image/webp";
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isImage = file.type.startsWith("image/");
    if (!validTypes.includes(ext) && !isImage) {
      setUploadError("Please upload a PDF, Word (.doc, .docx), PPT, PPTX, image, or TXT file.");
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setAnalysisError(null);
    setLastAnalysis(null);
    setUploading(true);
    try {
      const result = await uploadReport(file);
      const newReport: ReportItem = { id: result.id, title: result.title, date: "Just now", status: "Analyzing...", color: "blue" };
      setRecentReports((prev) => [newReport, ...prev]);
      setUploading(false);
      e.target.value = "";

      setAnalyzingReport(true);
      try {
        const analysis = await analyzeReport(file);
        setLastAnalysis({ reportTitle: result.title, result: analysis });
        setRecentReports((prev) =>
          prev.map((r) => (r.id === result.id ? { ...r, status: analysis.status || "Reviewed", color: "emerald" as const } : r))
        );
      } catch {
        setAnalysisError("Analysis failed. Your report was uploaded; you can try again later.");
        setRecentReports((prev) => prev.map((r) => (r.id === result.id ? { ...r, status: "Pending", color: "blue" as const } : r)));
      } finally {
        setAnalyzingReport(false);
      }
    } catch {
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // First Aid data and functions
  const firstAidData = {
    "Headache": {
      description: "Common headache that can be treated with over-the-counter medications",
      medicines: [
        { name: "Paracetamol (Acetaminophen)", dosage: "500mg tablet", frequency: "Every 4-6 hours as needed", maxDaily: "4 tablets (2g)" },
        { name: "Ibuprofen", dosage: "400mg tablet", frequency: "Every 6-8 hours with food", maxDaily: "3 tablets (1.2g)" },
        { name: "Aspirin", dosage: "325mg tablet", frequency: "Every 4-6 hours", maxDaily: "12 tablets (3.9g)" }
      ],
      homeRemedies: ["Apply cold compress to forehead", "Rest in quiet, dark room", "Stay hydrated", "Gentle neck massage"]
    },
    "Fever": {
      description: "Elevated body temperature that can be managed at home",
      medicines: [
        { name: "Paracetamol (Acetaminophen)", dosage: "500mg tablet", frequency: "Every 4-6 hours", maxDaily: "4 tablets (2g)" },
        { name: "Ibuprofen", dosage: "400mg tablet", frequency: "Every 6-8 hours with food", maxDaily: "3 tablets (1.2g)" }
      ],
      homeRemedies: ["Drink plenty of fluids", "Take lukewarm bath", "Rest", "Light clothing"]
    },
    "Cough": {
      description: "Common cough that can be relieved with medications and home remedies",
      medicines: [
        { name: "Dextromethorphan syrup", dosage: "10-20ml", frequency: "Every 6-8 hours", maxDaily: "4 doses" },
        { name: "Guaifenesin syrup", dosage: "200-400mg", frequency: "Every 4-6 hours", maxDaily: "2.4g" },
        { name: "Honey and lemon", dosage: "1-2 teaspoons", frequency: "As needed", maxDaily: "No limit" }
      ],
      homeRemedies: ["Stay hydrated with warm fluids", "Use humidifier", "Gargle with salt water", "Avoid irritants"]
    },
    "Cold/Flu": {
      description: "Viral infection causing respiratory symptoms",
      medicines: [
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 4-6 hours", maxDaily: "4 tablets" },
        { name: "Phenylephrine decongestant", dosage: "10mg", frequency: "Every 4 hours", maxDaily: "60mg" },
        { name: "Vitamin C", dosage: "500mg", frequency: "Twice daily", maxDaily: "2g" }
      ],
      homeRemedies: ["Rest and sleep", "Warm fluids", "Steam inhalation", "Nasal saline rinse"]
    },
    "Stomach Pain": {
      description: "General stomach discomfort that can often be managed at home",
      medicines: [
        { name: "Antacid tablets", dosage: "1-2 tablets", frequency: "As needed", maxDaily: "8 tablets" },
        { name: "Simethicone", dosage: "40-125mg", frequency: "After meals", maxDaily: "500mg" },
        { name: "Oral Rehydration Salts", dosage: "1 packet in 1L water", frequency: "As needed", maxDaily: "No limit" }
      ],
      homeRemedies: ["Eat small, frequent meals", "Avoid spicy foods", "Apply warm compress", "Gentle walking"]
    },
    "Nausea/Vomiting": {
      description: "Upset stomach with vomiting sensation",
      medicines: [
        { name: "Antiemetic tablets", dosage: "25mg", frequency: "Every 6-8 hours", maxDaily: "100mg" },
        { name: "Ginger capsules", dosage: "250mg", frequency: "Every 4 hours", maxDaily: "1g" },
        { name: "Vitamin B6", dosage: "25mg", frequency: "Every 6 hours", maxDaily: "100mg" }
      ],
      homeRemedies: ["Sip clear fluids", "Eat bland foods", "Rest", "Avoid strong odors"]
    },
    "Body Pain": {
      description: "General muscle and body aches",
      medicines: [
        { name: "Ibuprofen", dosage: "400mg", frequency: "Every 6-8 hours", maxDaily: "1.2g" },
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 4-6 hours", maxDaily: "2g" },
        { name: "Muscle relaxant ointment", dosage: "Apply to affected area", frequency: "3-4 times daily", maxDaily: "No limit" }
      ],
      homeRemedies: ["Warm bath", "Gentle stretching", "Rest", "Hot/cold compress"]
    },
    "Sore Throat": {
      description: "Throat irritation and pain",
      medicines: [
        { name: "Lozenges", dosage: "1 lozenge", frequency: "Every 2-3 hours", maxDaily: "No limit" },
        { name: "Throat spray", dosage: "2-3 sprays", frequency: "Every 3-4 hours", maxDaily: "No limit" },
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 4-6 hours", maxDaily: "2g" }
      ],
      homeRemedies: ["Salt water gargle", "Honey in warm water", "Steam inhalation", "Rest voice"]
    }
  };

  const commonSymptoms = Object.keys(firstAidData);

  const handleSymptomSelect = (symptom: string) => {
    setSelectedSymptom(symptom === selectedSymptom ? null : symptom);
    if (symptom && !selectedSymptom) {
      setShowDosageForm(true);
    }
  };

  const calculateDosage = (baseDosage: string, weight?: number, age?: number): string => {
    if (!weight && !age) return baseDosage;
    
    let dosageMultiplier = 1;
    
    // Weight-based calculation (for adults > 40kg)
    if (weight && weight > 40) {
      dosageMultiplier = weight / 70; // Standard adult weight
    }
    
    // Age-based adjustments
    if (age) {
      if (age < 12) {
        dosageMultiplier *= 0.5; // Children dose
      } else if (age < 18) {
        dosageMultiplier *= 0.75; // Adolescents dose
      } else if (age > 65) {
        dosageMultiplier *= 0.8; // Elderly dose
      }
    }
    
    // Extract base dosage number and apply multiplier
    const dosageMatch = baseDosage.match(/(\d+)/);
    if (dosageMatch) {
      const baseAmount = parseInt(dosageMatch[1]);
      const adjustedAmount = Math.round(baseAmount * dosageMultiplier);
      return baseDosage.replace(/\d+/, adjustedAmount.toString());
    }
    
    return baseDosage;
  };

  const getPersonalizedMedicines = () => {
    if (!selectedSymptom) return [];
    
    const weight = userWeight ? parseFloat(userWeight) : undefined;
    const age = userAge ? parseInt(userAge) : undefined;
    
    const symptomData = firstAidData[selectedSymptom as keyof typeof firstAidData];
    return symptomData.medicines.map(medicine => ({
      ...medicine,
      dosage: calculateDosage(medicine.dosage, weight, age),
      maxDaily: calculateDosage(medicine.maxDaily, weight, age)
    }));
  };

  // Location and hospital functions
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      const hospitals = await getNearbyHospitals(location);
      setNearbyHospitals(hospitals);
    } catch (error) {
      console.error("Failed to get location:", error);
      // Fallback to manual location entry
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    
    setLocationLoading(true);
    try {
      // Use mock coordinates for now to avoid API key issues
      const mockLocation: Location = {
        lat: 40.7128, // New York coordinates
        lng: -74.0060,
        address: manualLocation
      };
      
      setUserLocation(mockLocation);
      const hospitals = await getNearbyHospitals(mockLocation);
      setNearbyHospitals(hospitals);
    } catch (error) {
      console.error("Failed to set location:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const handleAppointmentReminder = async (appointment: Omit<Appointment, 'id' | 'userId'>) => {
    const fullAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      reminder: true,
      hospitalId: selectedHospital?.id
    };

    await addSavedAppointment(fullAppointment);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Schedule browser notification
    if ('serviceWorker' in navigator && selectedHospital) {
      const appointmentTime = new Date(`${appointment.date} ${appointment.time}`);
      const now = new Date();
      const timeUntilAppointment = appointmentTime.getTime() - now.getTime();
      
      if (timeUntilAppointment > 0) {
        setTimeout(() => {
          new Notification('Appointment Reminder', {
            body: `Your appointment at ${selectedHospital.name} is in 1 hour`,
            icon: '/favicon.ico',
            tag: `appointment-${fullAppointment.id}`
          });
        }, timeUntilAppointment - 3600000); // 1 hour before
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{t("dashboard.welcomeBack", { name: user?.name || "User" })}</h1>
          <p className="text-slate-600">{t("dashboard.healthSummary")}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-sky-400 p-4 rounded-xl">
                  <Upload className="size-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{t("dashboard.uploadNewReport")}</h3>
                  <p className="text-slate-600 text-sm">{t("dashboard.getInstantAnalysis")}</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,.txt" className="hidden" onChange={handleFileChange} />
                <Button onClick={handleUploadClick} disabled={uploading || analyzingReport} className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                  {uploading ? "Uploading..." : analyzingReport ? "Analyzing..." : t("dashboard.upload")}
                </Button>
              </div>
              {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
              {analysisError && <p className="text-sm text-amber-600 mt-2">{analysisError}</p>}
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-4 rounded-xl">
                  <Mic className="size-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{t("dashboard.voiceAnalysis")}</h3>
                  <p className="text-slate-600 text-sm">{t("dashboard.describeSymptoms")}</p>
                </div>
                <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white" asChild>
                  <Link to="/voice-analyzer">{t("dashboard.start")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* First Aid Section */}
        <Card className="mb-12 border-2 border-amber-100 hover:border-amber-300 transition-all shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setFirstAidExpanded(!firstAidExpanded)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-4 rounded-xl">
                  <AlertTriangle className="size-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">First Aid & Quick Remedies</h3>
                  <p className="text-slate-600 text-sm">Common symptoms and over-the-counter medicines for immediate relief</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  Emergency Help
                </span>
                {firstAidExpanded ? (
                  <ChevronUp className="size-5 text-amber-600" />
                ) : (
                  <ChevronDown className="size-5 text-amber-600" />
                )}
              </div>
            </div>

            {firstAidExpanded && (
              <div className="mt-6 space-y-6">
                {/* User Info for Personalized Dosage */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Personalize Your Dosage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700">Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        value={userWeight}
                        onChange={(e) => setUserWeight(e.target.value)}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">Age</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 35"
                        value={userAge}
                        onChange={(e) => setUserAge(e.target.value)}
                        className="border-blue-200"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Providing weight and age helps calculate personalized medicine dosages for better safety
                  </p>
                </div>

                {/* Symptom Selection */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Select your symptom:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {commonSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant={selectedSymptom === symptom ? "default" : "outline"}
                        className={`text-sm h-auto py-3 px-4 ${
                          selectedSymptom === symptom
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "border-amber-200 text-amber-700 hover:bg-amber-50"
                        }`}
                        onClick={() => handleSymptomSelect(symptom)}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Medicine Recommendations */}
                {selectedSymptom && firstAidData[selectedSymptom as keyof typeof firstAidData] && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-2 rounded-lg">
                        <Pill className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{selectedSymptom}</h4>
                        <p className="text-slate-600 text-sm mb-4">
                          {firstAidData[selectedSymptom as keyof typeof firstAidData].description}
                        </p>
                        {(userWeight || userAge) && (
                          <div className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700 inline-block">
                            🎯 Personalized dosage based on your profile
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medicines */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Pill className="size-4 text-amber-600" />
                        Recommended Medicines
                        {(userWeight || userAge) && (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                            Personalized
                          </span>
                        )}
                      </h5>
                      <div className="space-y-3">
                        {getPersonalizedMedicines().map((medicine, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-amber-100">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-semibold text-slate-800">{medicine.name}</h6>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  {medicine.dosage}
                                </span>
                                {(userWeight || userAge) && (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                                    Adjusted
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-600">⏰</span>
                                <span className="text-slate-600">{medicine.frequency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-red-600">⚠️</span>
                                <span className="text-slate-600">Max: {medicine.maxDaily}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home Remedies */}
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-green-600">🏠</span>
                        Home Remedies
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {firstAidData[selectedSymptom as keyof typeof firstAidData].homeRemedies.map((remedy, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-slate-600 bg-white rounded-lg p-3 border border-green-100">
                            <span className="text-green-600">•</span>
                            <span>{remedy}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Important:</strong> This is for temporary relief only. If symptoms persist or worsen, please consult a doctor immediately. 
                        These medicines should not be taken without proper medical advice if you have existing health conditions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF/Report Analysis Result */}
        {lastAnalysis && (
          <Card className="mb-12 border-2 border-emerald-200 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-xl">
                  <FileText className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Report analysis: {lastAnalysis.reportTitle}</h2>
                  <p className="text-sm text-emerald-600 font-medium">{lastAnalysis.result.status}</p>
                </div>
              </div>
              <p className="text-slate-700 mb-6">{lastAnalysis.result.summary}</p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Key findings</h3>
                  <ul className="space-y-2">
                    {lastAnalysis.result.keyFindings.map((finding, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                  {lastAnalysis.result.symptoms && lastAnalysis.result.symptoms.length > 0 && (
                    <>
                      <h3 className="font-bold text-slate-800 mb-3 mt-4">Possible symptoms</h3>
                      <ul className="space-y-2">
                        {lastAnalysis.result.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {lastAnalysis.result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  {lastAnalysis.result.prevention && lastAnalysis.result.prevention.length > 0 && (
                    <>
                      <h3 className="font-bold text-slate-800 mb-3 mt-4">Prevention tips</h3>
                      <ul className="space-y-2">
                        {lastAnalysis.result.prevention.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="text-emerald-600 mt-1">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
              {lastAnalysis.result.disclaimer && (
                <p className="text-sm text-slate-500 italic mb-4">{lastAnalysis.result.disclaimer}</p>
              )}
              <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={() => setLastAnalysis(null)}>
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Health Metrics - user can add/edit; default 0/empty */}
        <div id={METRICS_REF_ID} ref={metricsSectionRef} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{t("dashboard.yourHealthMetrics")}</h2>
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700" onClick={openMetricsModal}>
              <Pencil className="size-4 mr-2" />
              Edit metrics
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetrics.map((metric, index) => {
              const Icon = index === 0 ? Heart : index === 1 ? Activity : index === 2 ? TrendingUp : BarChart3;
              return (
                <Card key={index} className="border-2 border-slate-100 hover:border-emerald-200 transition-all shadow-md hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${metric.color === "emerald" ? "from-emerald-500 to-teal-400" : "from-blue-500 to-sky-400"} p-3 rounded-lg`}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${metric.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">{metric.label}</div>
                    <div className="text-2xl font-bold text-slate-800">{metric.value || "—"}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Edit Health Metrics Modal */}
        <Dialog open={metricsModalOpen} onOpenChange={setMetricsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add or edit your health metrics</DialogTitle>
              <DialogDescription>Enter your values. Leave blank or 0 if not set. These are stored only on your device.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editingMetrics.map((m, i) => (
                <div key={i} className="grid grid-cols-3 items-center gap-4">
                  <Label className="col-span-1 text-slate-700">{m.label}</Label>
                  <Input
                    className="col-span-2"
                    placeholder={m.label === "Blood Pressure" ? "e.g. 120/80" : m.label === "Heart Rate" ? "e.g. 72 bpm" : m.label === "Glucose" ? "e.g. 95 mg/dL" : "e.g. 23.5"}
                    value={m.value}
                    onChange={(e) => setEditingMetrics((prev) => prev.map((mm, j) => (j === i ? { ...mm, value: e.target.value } : mm)))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetMetricsToZero}>
                Reset to empty
              </Button>
              <Button onClick={handleMetricsSave} className="bg-emerald-600 hover:bg-emerald-700">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule New Appointment Modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule new appointment</DialogTitle>
              <DialogDescription>Enter your location and age so we can suggest doctors and consultation times near you.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Location Selection */}
              <div className="grid gap-2">
                <Label>Location Selection</Label>
                <div className="flex gap-2">
                  <Button
                    variant={useCurrentLocation ? "default" : "outline"}
                    onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                    className="flex items-center gap-2"
                    disabled={locationLoading}
                  >
                    <Navigation className="size-4" />
                    Use Current Location
                  </Button>
                  <span className="text-slate-500">or</span>
                  <Input
                    placeholder="Enter address manually"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleManualLocation}
                    disabled={locationLoading || !manualLocation.trim()}
                    variant="outline"
                  >
                    <MapPin className="size-4" />
                    Find Hospitals
                  </Button>
                </div>
              </div>

              {/* Hospital Selection */}
              {nearbyHospitals.length > 0 && (
                <div className="space-y-3">
                  <Label>Select Hospital for Appointment</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {nearbyHospitals.map((hospital) => (
                      <Card key={hospital.id} className={`cursor-pointer border-2 ${selectedHospital?.id === hospital.id ? "border-emerald-500" : "border-slate-200"}`} onClick={() => handleHospitalSelect(hospital)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-slate-800">{hospital.name}</h4>
                              <p className="text-sm text-slate-600">{hospital.address}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  {hospital.distance ? `${hospital.distance.toFixed(1)} km away` : "Location unknown"}
                                </span>
                                {hospital.emergency && (
                                  <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                                    🚨 Emergency
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600">
                                ⭐ {hospital.rating}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">
                            <div className="mb-1">Specialties: {hospital.specialties.join(", ")}</div>
                            <div>Phone: {hospital.phone}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Location and Age Fields */}
              <div className="grid gap-2">
                <Label>Your location (city or area)</Label>
                <Input placeholder="e.g. New York, Boston, Chicago" value={scheduleLocation} onChange={(e) => setScheduleLocation(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Your age</Label>
                <Input type="number" min="1" max="120" placeholder="e.g. 35" value={scheduleAge} onChange={(e) => setScheduleAge(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Preferred date (optional)</Label>
                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
              <Button onClick={searchDoctors} className="w-full bg-blue-600 hover:bg-blue-700">
                Find doctors
              </Button>
            </div>
            {matchingDoctors.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-slate-800">Select a doctor and time</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {matchingDoctors.map((doc) => (
                    <Card key={doc.id} className={`cursor-pointer border-2 ${selectedDoctor?.id === doc.id ? "border-emerald-500" : "border-slate-200"}`} onClick={() => { setSelectedDoctor(doc); setSelectedSlot(""); }}>
                      <CardContent className="p-4">
                        <div className="font-semibold text-slate-800">{doc.name}</div>
                        <div className="text-sm text-slate-600">{doc.specialty}</div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                          <Phone className="size-4" />
                          {doc.contactNo}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin className="size-4" />
                          {doc.venue}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{doc.consultationHours}</div>
                        {selectedDoctor?.id === doc.id && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {doc.suggestedSlots.map((slot) => (
                              <Button
                                key={slot}
                                size="sm"
                                variant={selectedSlot === slot ? "default" : "outline"}
                                className={selectedSlot === slot ? "bg-emerald-600" : ""}
                                onClick={(e) => { e.stopPropagation(); setSelectedSlot(slot); }}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
                  <Button onClick={confirmAppointment} disabled={!selectedDoctor || !selectedSlot} className="bg-emerald-600 hover:bg-emerald-700">
                    Confirm appointment
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Reports */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("dashboard.recentReports")}</h2>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <Card key={index} className="border border-slate-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-3 rounded-lg">
                          <FileText className="size-6 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{report.title}</h3>
                          <p className="text-sm text-slate-600">{report.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${report.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {report.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                View All Reports
              </Button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("dashboard.upcomingAppointments")}</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <Card key={index} className="border border-slate-200 hover:border-emerald-300 transition-all shadow-md hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-3 rounded-lg">
                        <Calendar className="size-6 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">{appointment.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Clock className="size-4" />
                          {appointment.date} at {appointment.time}
                        </div>
                        <p className="text-sm text-slate-600">{appointment.doctor}</p>
                        {appointment.contact && (
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                            <Phone className="size-3" /> {appointment.contact}
                          </p>
                        )}
                        {appointment.venue && (
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                            <MapPin className="size-3" /> {appointment.venue}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={openScheduleModal}>
                Schedule New Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-r from-blue-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-xl">
                <Brain className="size-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Health Insights</h3>
                <p className="text-slate-700 mb-4">
                  Add your blood pressure, heart rate, glucose, and BMI above to see a fuller picture. Your metrics are private and stored only on your device.
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white" onClick={() => { scrollToMetrics(); openMetricsModal(); }}>
                  View & edit detailed metrics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health News Popup */}
        <Dialog open={newsExpanded} onOpenChange={setNewsExpanded}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Newspaper className="size-6 text-blue-600" />
                Health News & Research
              </DialogTitle>
              <DialogDescription>
                Latest medical research, health breakthroughs, and wellness insights from trusted sources.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* News Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border border-blue-200 hover:border-blue-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <span className="text-2xl">🔬</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Medical Research</h4>
                        <p className="text-sm text-slate-600">Latest studies and clinical trials</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-1">AI-Powered Drug Discovery</h5>
                        <p className="text-sm text-blue-700">New machine learning models identify potential treatments 50% faster</p>
                        <p className="text-xs text-blue-600">2 hours ago</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <h5 className="font-semibold text-slate-800 mb-1">Breakthrough in Alzheimer's Treatment</h5>
                        <p className="text-sm text-slate-700">Novel antibody shows promise in early trials</p>
                        <p className="text-xs text-slate-500">5 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-emerald-200 hover:border-emerald-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <span className="text-2xl">💊</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Drug Safety Updates</h4>
                        <p className="text-sm text-slate-600">FDA approvals and safety alerts</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <h5 className="font-semibold text-emerald-800 mb-1">New Diabetes Medication Approved</h5>
                        <p className="text-sm text-emerald-700">Once-weekly injection shows improved results</p>
                        <p className="text-xs text-emerald-600">1 day ago</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-emerald-100">
                        <h5 className="font-semibold text-slate-800 mb-1">Heart Health Alert</h5>
                        <p className="text-sm text-slate-700">Study links Mediterranean diet to reduced risk</p>
                        <p className="text-xs text-slate-500">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-purple-200 hover:border-purple-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <span className="text-2xl">🧬</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Wellness & Prevention</h4>
                        <p className="text-sm text-slate-600">Mental health and lifestyle tips</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-semibold text-purple-800 mb-1">Mental Health Awareness</h5>
                        <p className="text-sm text-purple-700">New study reveals benefits of meditation on cognitive function</p>
                        <p className="text-xs text-purple-600">6 hours ago</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <h5 className="font-semibold text-slate-800 mb-1">Nutrition Breakthrough</h5>
                        <p className="text-sm text-slate-700">Plant-based proteins show similar muscle building to animal proteins</p>
                        <p className="text-xs text-slate-500">12 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Research Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-bold text-slate-800 mb-4">🔬 Key Research Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-blue-800">Personalized Medicine</h5>
                    <p className="text-sm text-blue-700">AI-driven treatment recommendations based on your health profile and genetic markers</p>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-purple-800">Preventive Care</h5>
                    <p className="text-sm text-purple-700">Early detection systems now identify 85% of potential health risks before symptoms appear</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewsExpanded(false)}>
                Close
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Health News Floating Button */}
        <div>
          <Button
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50"
            onClick={() => setNewsExpanded(true)}
          >
            <Newspaper className="size-6" />
          </Button>
        </div>

      </div>
    </div>
  );
}
