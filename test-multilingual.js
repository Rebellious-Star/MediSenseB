// Test multilingual symptom detection
import { extractSymptoms } from './src/app/api/voice.ts';

// Test cases for different languages
const testCases = [
  { text: "I have headache and fever", lang: "en", expected: ["Headache", "Fever"] },
  { text: "tengo dolor de cabeza y fiebre", lang: "es", expected: ["Headache", "Fever"] },
  { text: "j'ai mal à la tête et de la fièvre", lang: "fr", expected: ["Headache", "Fever"] },
  { text: "मुझे सिर दर्द और बुखार है", lang: "hi", expected: ["Headache", "Fever"] },
  { text: "我头痛和发烧", lang: "zh", expected: ["Headache", "Fever"] },
  { text: "لدي صداع وحمى", lang: "ar", expected: ["Headache", "Fever"] },
];

console.log("Testing multilingual symptom detection...");
testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.text} (${test.lang})`);
  const symptoms = extractSymptoms(test.text, test.lang);
  console.log("Expected:", test.expected);
  console.log("Got:", symptoms);
  console.log("Match:", JSON.stringify(symptoms.sort()) === JSON.stringify(test.expected.sort()) ? "✅" : "❌");
});
