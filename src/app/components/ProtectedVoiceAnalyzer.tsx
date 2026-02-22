import { VoiceAnalyzerPage } from "../pages/VoiceAnalyzerPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function ProtectedVoiceAnalyzer() {
  return (
    <ProtectedRoute>
      <VoiceAnalyzerPage />
    </ProtectedRoute>
  );
}
