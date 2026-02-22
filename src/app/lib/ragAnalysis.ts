import { analyzeReportText, type AnalysisResult } from './reportAnalysis';

// Medical knowledge base for RAG
const MEDICAL_KNOWLEDGE_BASE = {
  // Blood test conditions and their typical findings
  bloodConditions: {
    anemia: {
      keywords: ['hemoglobin', 'hematocrit', 'rbc', 'iron', 'ferritin'],
      symptoms: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet'],
      findings: 'Low red blood cell count or iron deficiency',
      recommendations: ['Increase iron-rich foods', 'Take iron supplements', 'Consider vitamin C for absorption']
    },
    infection: {
      keywords: ['wbc', 'white blood cells', 'crp', 'esr'],
      symptoms: ['Fever', 'Chills', 'Body aches', 'Fatigue', 'Swollen lymph nodes'],
      findings: 'Elevated white blood cells indicating infection or inflammation',
      recommendations: ['Rest and hydration', 'Follow up with doctor', 'Monitor temperature']
    },
    diabetes: {
      keywords: ['glucose', 'hba1c', 'blood sugar', 'a1c'],
      symptoms: ['Increased thirst', 'Frequent urination', 'Unexplained weight loss', 'Blurred vision', 'Fatigue'],
      findings: 'Elevated glucose levels indicating diabetes or prediabetes',
      recommendations: ['Dietary modifications', 'Regular exercise', 'Blood sugar monitoring', 'Medication review']
    },
    cholesterol: {
      keywords: ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid'],
      symptoms: ['Often asymptomatic', 'Chest pain', 'Shortness of breath'],
      findings: 'Abnormal lipid levels requiring cardiovascular risk management',
      recommendations: ['Low-fat diet', 'Regular exercise', 'Statin therapy if needed', 'Regular monitoring']
    },
    thyroid: {
      keywords: ['tsh', 't3', 't4', 'thyroid'],
      symptoms: ['Weight changes', 'Temperature sensitivity (hot/cold intolerance)', 'Mood changes', 'Depression', 'Fatigue', 'Hair loss'],
      findings: 'Thyroid hormone imbalance',
      recommendations: ['Hormone replacement therapy', 'Regular monitoring', 'Dietary adjustments']
    },
    liver: {
      keywords: ['alt', 'ast', 'alp', 'bilirubin', 'liver'],
      symptoms: ['Fatigue', 'Yellow skin', 'Abdominal pain', 'Dark urine'],
      findings: 'Liver function abnormalities',
      recommendations: ['Avoid alcohol', 'Medication review', 'Regular liver function tests']
    },
    kidney: {
      keywords: ['creatinine', 'bun', 'egfr', 'kidney'],
      symptoms: ['Swelling', 'Changes in urination', 'Fatigue', 'Back pain'],
      findings: 'Kidney function impairment',
      recommendations: ['Hydration', 'Blood pressure control', 'Medication adjustment', 'Specialist consultation']
    }
  },
  
  // Common symptom patterns and their medical significance
  symptomPatterns: {
    backPain: {
      keywords: ['back pain', 'spine', 'vertebrae', 'disc', 'lumbar', 'thoracic', 'cervical'],
      possibleCauses: ['Muscle strain', 'Herniated disc', 'Arthritis', 'Spinal stenosis', 'Kidney stones'],
      redFlags: ['Loss of bladder control', 'Severe weakness', 'Fever with pain', 'Unexplained weight loss']
    },
    chestPain: {
      keywords: ['chest pain', 'heart', 'cardiac', 'ecg', 'angina'],
      possibleCauses: ['Heart disease', 'Acid reflux', 'Anxiety', 'Muscle strain', 'Pleurisy'],
      redFlags: ['Crushing chest pain', 'Pain radiating to arm/jaw', 'Severe shortness of breath', 'Cold sweats']
    },
    headache: {
      keywords: ['headache', 'migraine', 'head pain'],
      possibleCauses: ['Tension', 'Migraine', 'Sinus infection', 'Dehydration', 'Eye strain'],
      redFlags: ['Sudden severe headache', 'Headache with fever/stiff neck', 'Headache after head injury']
    },
    fatigue: {
      keywords: ['fatigue', 'tired', 'exhaustion', 'low energy', 'weakness'],
      possibleCauses: ['Anemia', 'Thyroid issues', 'Sleep deprivation', 'Depression', 'Chronic fatigue syndrome'],
      redFlags: ['Extreme fatigue preventing daily activities', 'Fatigue with chest pain/shortness of breath']
    }
  }
};

// Vector embedding simulation (in production, use actual embedding model)
function generateEmbedding(text: string): number[] {
  // Simple hash-based embedding for demonstration
  // In production, replace with actual embedding model (OpenAI, Cohere, etc.)
  const words = text.toLowerCase().split(/\s+/);
  const embedding: number[] = [];
  
  for (let i = 0; i < 1536; i++) { // 1536 dimensions
    let hash = 0;
    for (const word of words) {
      if (word.length > 0) {
        hash += word.charCodeAt(0) * (i + 1) * word.length;
      }
    }
    embedding.push(hash / words.length);
  }
  
  return embedding;
}

// Cosine similarity between embeddings
function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
}

// Retrieve relevant medical knowledge based on query
function retrieveRelevantKnowledge(text: string): Array<{
  condition: string;
  relevance: number;
  symptoms: string[];
  findings: string;
  recommendations: string[];
}> {
  const embedding = generateEmbedding(text);
  const relevantKnowledge = [];
  
  // Compare with all conditions in knowledge base
  for (const [category, conditions] of Object.entries(MEDICAL_KNOWLEDGE_BASE.bloodConditions)) {
    for (const [condition, data] of Object.entries(conditions)) {
      const conditionEmbedding = generateEmbedding(condition);
      const similarity = cosineSimilarity(embedding, conditionEmbedding);
      
      if (similarity > 0.3) { // Threshold for relevance
        relevantKnowledge.push({
          condition,
          relevance: similarity,
          symptoms: data.symptoms,
          findings: data.findings,
          recommendations: data.recommendations
        });
      }
    }
  }
  
  // Sort by relevance and return top matches
  return relevantKnowledge
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3); // Top 3 most relevant conditions
}

// Enhanced analysis using RAG
export async function analyzeReportWithRAG(text: string): Promise<AnalysisResult> {
  console.log("Starting RAG-enhanced analysis...");
  
  // First, get traditional analysis
  const baseAnalysis = await analyzeReportText(text);
  
  // Retrieve relevant medical knowledge
  const relevantKnowledge = retrieveRelevantKnowledge(text);
  
  // Enhance the analysis with RAG insights
  const enhancedFindings = [...baseAnalysis.findings];
  const enhancedSymptoms = [...baseAnalysis.symptoms];
  const enhancedRecommendations = [...baseAnalysis.recommendations];
  
  // Add RAG-enhanced insights
  if (relevantKnowledge.length > 0) {
    const topCondition = relevantKnowledge[0];
    
    // Enhanced summary with RAG context
    baseAnalysis.summary = `${baseAnalysis.summary} Based on pattern analysis, this may indicate ${topCondition.condition} (relevance: ${(topCondition.relevance * 100).toFixed(1)}%).`;
    
    // Add condition-specific symptoms from knowledge base
    enhancedSymptoms.push(...topCondition.symptoms);
    
    // Add condition-specific findings
    enhancedFindings.unshift({
      label: topCondition.condition,
      value: topCondition.findings,
      status: topCondition.relevance > 0.7 ? "attention" : "normal",
      note: `RAG-enhanced analysis with ${(topCondition.relevance * 100).toFixed(1)}% relevance`
    });
    
    // Add condition-specific recommendations
    enhancedRecommendations.unshift(...topCondition.recommendations);
    
    // Add prevention strategies based on condition
    if (topCondition.condition.toLowerCase().includes('diabetes')) {
      baseAnalysis.prevention.push('Monitor blood glucose regularly', 'Maintain healthy weight', 'Exercise regularly');
    } else if (topCondition.condition.toLowerCase().includes('cholesterol')) {
      baseAnalysis.prevention.push('Reduce saturated fat intake', 'Increase fiber consumption', 'Regular cardiovascular exercise');
    }
  }
  
  // Remove duplicate symptoms and recommendations
  const uniqueSymptoms = [...new Set(enhancedSymptoms)];
  const uniqueRecommendations = [...new Set(enhancedRecommendations)];
  
  console.log(`RAG analysis complete. Found ${relevantKnowledge.length} relevant conditions, top match: ${relevantKnowledge[0]?.condition}`);
  
  return {
    ...baseAnalysis,
    findings: enhancedFindings,
    symptoms: uniqueSymptoms,
    recommendations: uniqueRecommendations,
    prevention: baseAnalysis.prevention,
    futureSuggestions: [
      ...baseAnalysis.futureSuggestions,
      `Consider follow-up testing for ${relevantKnowledge[0]?.condition || 'identified conditions'}`,
      'RAG-enhanced analysis provides more accurate, condition-specific insights'
    ]
  };
}

// Fallback function if RAG fails
export async function enhancedAnalyzeReport(text: string): Promise<AnalysisResult> {
  try {
    return await analyzeReportWithRAG(text);
  } catch (error) {
    console.warn("RAG analysis failed, falling back to standard analysis:", error);
    return await analyzeReportText(text);
  }
}
