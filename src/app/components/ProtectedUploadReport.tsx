import { UploadReportPage } from "../pages/UploadReportPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function ProtectedUploadReport() {
  return (
    <ProtectedRoute>
      <UploadReportPage />
    </ProtectedRoute>
  );
}
