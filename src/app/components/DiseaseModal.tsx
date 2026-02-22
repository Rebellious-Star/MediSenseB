import { X, Activity, FileText, Brain, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface DiseaseModalProps {
  selectedDisease: {
    name: string;
    icon: any;
    gradient: string;
  } | null;
  onClose: () => void;
}

export function DiseaseModal({ selectedDisease, onClose }: DiseaseModalProps) {
  if (!selectedDisease) return null;

  const disease = selectedDisease;

  const diseaseInfo: Record<string, {
    description: string;
    commonTests: string[];
    symptoms: string[];
    aiInsights: string;
    prevention: string[];
  }> = {
    "Diabetes": {
      description: "Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). Our AI analyzes HbA1c, fasting glucose, and other markers to provide comprehensive insights.",
      commonTests: ["HbA1c Test", "Fasting Blood Sugar", "Oral Glucose Tolerance Test", "Random Blood Sugar"],
      symptoms: ["Increased thirst", "Frequent urination", "Extreme fatigue", "Blurred vision", "Slow healing wounds"],
      aiInsights: "Our AI can detect early patterns of insulin resistance and predict diabetes risk up to 5 years in advance based on multiple biomarkers.",
      prevention: ["Maintain healthy weight", "Regular physical activity", "Balanced diet low in sugar", "Regular health checkups"]
    },
    "Hypertension": {
      description: "High blood pressure is a common condition where the force of blood against artery walls is consistently too high, potentially leading to heart disease.",
      commonTests: ["Blood Pressure Monitoring", "ECG", "Lipid Profile", "Kidney Function Tests"],
      symptoms: ["Headaches", "Shortness of breath", "Nosebleeds", "Dizziness", "Chest pain"],
      aiInsights: "AI analysis can identify subtle blood pressure trends and correlate them with lifestyle factors to provide personalized management strategies.",
      prevention: ["Reduce sodium intake", "Exercise regularly", "Manage stress", "Limit alcohol consumption"]
    },
    "Cardiovascular Disease": {
      description: "Cardiovascular disease involves conditions affecting the heart and blood vessels, including coronary artery disease, heart attacks, and stroke.",
      commonTests: ["ECG", "Echocardiogram", "Cardiac Stress Test", "Coronary Angiography", "Blood Tests"],
      symptoms: ["Chest pain", "Shortness of breath", "Rapid heartbeat", "Fatigue", "Swelling in legs"],
      aiInsights: "Advanced AI algorithms analyze cardiac biomarkers, imaging data, and genetic factors to assess cardiovascular risk with 95% accuracy.",
      prevention: ["Heart-healthy diet", "Regular exercise", "Quit smoking", "Manage cholesterol and blood pressure"]
    },
    "Thyroid Disorders": {
      description: "Thyroid disorders affect the thyroid gland's hormone production, impacting metabolism, energy levels, and overall health.",
      commonTests: ["TSH Test", "Free T3 and T4", "Thyroid Antibodies", "Thyroid Ultrasound"],
      symptoms: ["Weight changes", "Fatigue", "Mood changes", "Hair loss", "Temperature sensitivity"],
      aiInsights: "Our AI interprets complex thyroid panel results and identifies patterns that might indicate autoimmune conditions or early dysfunction.",
      prevention: ["Adequate iodine intake", "Regular screening", "Stress management", "Balanced nutrition"]
    },
    "Respiratory Infections": {
      description: "Respiratory infections affect the airways and lungs, ranging from common colds to more serious conditions like pneumonia and bronchitis.",
      commonTests: ["Chest X-Ray", "Sputum Culture", "Blood Tests", "Pulmonary Function Tests"],
      symptoms: ["Cough", "Fever", "Difficulty breathing", "Chest congestion", "Wheezing"],
      aiInsights: "AI can differentiate between viral and bacterial infections by analyzing white blood cell patterns and inflammatory markers.",
      prevention: ["Vaccination", "Hand hygiene", "Avoid smoking", "Strengthen immune system"]
    },
    "Anemia": {
      description: "Anemia occurs when your blood lacks enough healthy red blood cells or hemoglobin, leading to reduced oxygen delivery to tissues.",
      commonTests: ["Complete Blood Count", "Iron Studies", "Vitamin B12 & Folate", "Reticulocyte Count"],
      symptoms: ["Fatigue", "Pale skin", "Shortness of breath", "Dizziness", "Cold hands and feet"],
      aiInsights: "Our AI identifies the specific type of anemia by analyzing red blood cell indices, helping determine the most effective treatment approach.",
      prevention: ["Iron-rich diet", "Vitamin supplementation", "Regular checkups", "Treat underlying conditions"]
    },
    "Kidney Disease": {
      description: "Chronic kidney disease involves gradual loss of kidney function, affecting the body's ability to filter waste and excess fluids.",
      commonTests: ["Creatinine Test", "eGFR", "Urinalysis", "Kidney Ultrasound"],
      symptoms: ["Fatigue", "Swelling in feet and ankles", "Changes in urination", "Nausea", "Loss of appetite"],
      aiInsights: "AI predicts kidney disease progression by analyzing creatinine trends, proteinuria levels, and other biomarkers over time.",
      prevention: ["Control blood pressure", "Manage diabetes", "Healthy diet", "Stay hydrated"]
    },
    "Liver Disease": {
      description: "Liver disease encompasses various conditions affecting liver function, from fatty liver to cirrhosis and hepatitis.",
      commonTests: ["Liver Function Tests", "Ultrasound", "FibroScan", "Viral Hepatitis Panel"],
      symptoms: ["Jaundice", "Abdominal pain", "Swelling", "Fatigue", "Dark urine"],
      aiInsights: "Advanced algorithms assess liver damage severity by correlating multiple biomarkers including ALT, AST, bilirubin, and albumin levels.",
      prevention: ["Limit alcohol", "Healthy weight", "Vaccination", "Avoid toxins"]
    },
    "Cancer Screening": {
      description: "Cancer screening involves tests to detect cancer early, when treatment is most effective, even before symptoms appear.",
      commonTests: ["Tumor Markers", "Imaging Studies", "Biopsy", "Genetic Testing"],
      symptoms: ["Unexplained weight loss", "Persistent fatigue", "Lumps", "Changes in bowel habits", "Persistent cough"],
      aiInsights: "AI enhances early cancer detection by identifying subtle patterns in biomarkers and imaging that may indicate malignancy.",
      prevention: ["Healthy lifestyle", "Regular screening", "Avoid tobacco", "Limit sun exposure"]
    },
    "Cholesterol": {
      description: "High cholesterol is a condition where there's too much cholesterol in the blood, increasing risk of heart disease and stroke.",
      commonTests: ["Lipid Panel", "LDL/HDL Test", "Triglycerides", "Apolipoprotein Test"],
      symptoms: ["Usually no symptoms", "Chest pain (advanced)", "Xanthomas (rare)", "Corneal arcus"],
      aiInsights: "Our AI calculates cardiovascular risk scores by analyzing cholesterol ratios, particle sizes, and genetic factors.",
      prevention: ["Heart-healthy diet", "Regular exercise", "Maintain healthy weight", "Avoid trans fats"]
    },
    "Vitamin Deficiency": {
      description: "Vitamin deficiencies occur when the body doesn't get or absorb enough vitamins, leading to various health problems.",
      commonTests: ["Vitamin D Test", "B12 & Folate", "Iron Studies", "Complete Metabolic Panel"],
      symptoms: ["Fatigue", "Weakness", "Bone pain", "Mood changes", "Hair loss"],
      aiInsights: "AI identifies deficiency patterns and suggests targeted supplementation based on dietary habits and absorption markers.",
      prevention: ["Balanced diet", "Sun exposure (Vitamin D)", "Supplementation if needed", "Address absorption issues"]
    },
    "Arthritis": {
      description: "Arthritis involves inflammation of joints, causing pain, stiffness, and reduced mobility, with various types affecting different age groups.",
      commonTests: ["X-Rays", "Rheumatoid Factor", "Anti-CCP", "Inflammatory Markers"],
      symptoms: ["Joint pain", "Stiffness", "Swelling", "Reduced range of motion", "Redness"],
      aiInsights: "AI differentiates between arthritis types by analyzing inflammatory markers, imaging patterns, and autoantibody profiles.",
      prevention: ["Maintain healthy weight", "Regular exercise", "Joint protection", "Anti-inflammatory diet"]
    },
    "Osteoporosis": {
      description: "Osteoporosis is a condition where bones become weak and brittle, increasing the risk of fractures even from minor falls.",
      commonTests: ["DEXA Scan", "Bone Turnover Markers", "Calcium & Vitamin D", "Thyroid Function"],
      symptoms: ["Back pain", "Loss of height", "Stooped posture", "Bone fractures", "Often asymptomatic"],
      aiInsights: "AI predicts fracture risk by analyzing bone density trends, fall risk factors, and hormonal patterns.",
      prevention: ["Calcium-rich diet", "Vitamin D", "Weight-bearing exercise", "Avoid smoking and excessive alcohol"]
    },
    "Mental Health": {
      description: "Mental health conditions affect mood, thinking, and behavior, including depression, anxiety, and other disorders requiring professional care.",
      commonTests: ["Psychological Assessment", "Neurological Exam", "Blood Tests (rule out physical causes)", "Brain Imaging"],
      symptoms: ["Persistent sadness", "Anxiety", "Changes in sleep", "Difficulty concentrating", "Social withdrawal"],
      aiInsights: "AI supports mental health assessment by analyzing behavioral patterns, speech markers, and physiological indicators.",
      prevention: ["Regular exercise", "Stress management", "Social connections", "Professional support when needed"]
    },
    "Allergies": {
      description: "Allergies occur when the immune system overreacts to harmless substances, causing symptoms from mild discomfort to severe reactions.",
      commonTests: ["Skin Prick Test", "IgE Blood Test", "Elimination Diet", "Patch Testing"],
      symptoms: ["Sneezing", "Itching", "Rashes", "Shortness of breath", "Digestive issues"],
      aiInsights: "AI identifies allergy triggers by correlating symptom patterns with environmental and dietary factors.",
      prevention: ["Avoid triggers", "Immunotherapy", "Keep environment clean", "Medications as prescribed"]
    },
    "Autoimmune Disorders": {
      description: "Autoimmune disorders occur when the immune system mistakenly attacks the body's own tissues, affecting various organs and systems.",
      commonTests: ["Autoantibody Panel", "Inflammatory Markers", "Complete Blood Count", "Organ-specific Tests"],
      symptoms: ["Fatigue", "Joint pain", "Skin changes", "Digestive issues", "Fever"],
      aiInsights: "Advanced AI correlates multiple autoantibodies and clinical symptoms to identify specific autoimmune conditions.",
      prevention: ["Healthy lifestyle", "Stress management", "Early detection", "Targeted treatment"]
    }
  };

  const info = diseaseInfo[disease.name] || {
    description: `${disease.name} is a medical condition that requires proper diagnosis and treatment. Our AI provides detailed analysis of relevant biomarkers and test results.`,
    commonTests: ["Blood Tests", "Imaging Studies", "Physical Examination", "Specialized Diagnostics"],
    symptoms: ["Various symptoms may present", "Consult healthcare provider", "Regular monitoring important"],
    aiInsights: "Our advanced AI analyzes your medical reports to provide personalized insights and recommendations for this condition.",
    prevention: ["Regular checkups", "Healthy lifestyle", "Follow medical advice", "Early detection"]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Formal Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 border-t-4 border-blue-600">
        {/* Formal Header */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-10 py-8 border-b-2 border-slate-600">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="size-6 text-white" />
          </button>

          <div className="flex items-center gap-6">
            <div className={`bg-gradient-to-br ${disease.gradient} p-5 rounded-lg shadow-lg`}>
              <disease.icon className="size-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-1">{disease.name}</h2>
              <p className="text-slate-300 text-lg">Comprehensive Medical Analysis</p>
            </div>
          </div>
        </div>

        {/* Formal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] bg-slate-50">
          <div className="p-10 space-y-8">
            {/* Overview Section */}
            <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-200">
                <FileText className="size-6 text-slate-700" />
                <h3 className="text-2xl font-bold text-slate-800">Overview</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                {info.description}
              </p>
            </div>

            {/* AI Insights Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 shadow-md border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-300">
                <Brain className="size-6 text-blue-700" />
                <h3 className="text-2xl font-bold text-slate-800">AI-Powered Medical Insights</h3>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="size-6 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-slate-700 leading-relaxed text-lg">{info.aiInsights}</p>
              </div>
            </div>

            {/* Two Column Professional Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Diagnostic Tests */}
              <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-200">
                  <Activity className="size-6 text-slate-700" />
                  <h3 className="text-xl font-bold text-slate-800">Diagnostic Tests</h3>
                </div>
                <div className="space-y-3">
                  {info.commonTests.map((test, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-md transition-colors">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700 font-medium">{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Symptoms */}
              <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-200">
                  <AlertCircle className="size-6 text-slate-700" />
                  <h3 className="text-xl font-bold text-slate-800">Clinical Symptoms</h3>
                </div>
                <div className="space-y-3">
                  {info.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-md transition-colors">
                      <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prevention & Management */}
            <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-200">
                <CheckCircle2 className="size-6 text-slate-700" />
                <h3 className="text-2xl font-bold text-slate-800">Prevention & Management Guidelines</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {info.prevention.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors">
                    <CheckCircle2 className="size-6 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1 py-6 text-lg shadow-lg">
                Upload Medical Report
                <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 flex-1 py-6 text-lg">
                Consult Specialist
              </Button>
            </div>

            {/* Professional Disclaimer */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong className="font-bold">Medical Disclaimer:</strong> This information is provided for educational purposes only and should not be considered as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical condition or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}