import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error - Vite resolves worker via ?url
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "text/plain", // .txt
  "text/rtf", // .rtf
  "application/rtf", // .rtf
  "text/csv", // .csv
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/png",
  "image/jpeg",
  "image/jpg",
];
const ACCEPTED_EXT = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".csv", ".xls", ".xlsx", ".png", ".jpg", ".jpeg"];
const MAX_SIZE_MB = 10;

export function isAcceptedFile(file: File): boolean {
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    ACCEPTED_EXT.some((e) => ext === e)
  );
}

export function validateFile(file: File): { ok: boolean; error?: string } {
  if (!isAcceptedFile(file)) {
    return { ok: false, error: "Please upload a PDF, Word document (.pdf, .doc, .docx), text file (.txt), spreadsheet (.csv, .xls, .xlsx), or image (.png, .jpg)." };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { ok: false, error: `File must be under ${MAX_SIZE_MB} MB.` };
  }
  return { ok: true };
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (ext === "pdf") {
    return extractTextFromPdf(file);
  }
  if (ext === "doc" || ext === "docx") {
    return extractTextFromWord(file);
  }
  if (ext === "txt") {
    return extractTextFromText(file);
  }
  if (ext === "rtf") {
    return extractTextFromRtf(file);
  }
  if (ext === "csv" || ext === "xls" || ext === "xlsx") {
    return extractTextFromSpreadsheet(file);
  }
  if (ext === "png" || ext === "jpg" || ext === "jpeg") {
    return extractTextFromImage(file);
  }
  throw new Error("Unsupported file type. Use PDF, Word (.doc, .docx), text (.txt), spreadsheet (.csv, .xls, .xlsx), or image (.png, .jpg).");
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(text);
  }
  return parts.join("\n\n").trim() || "(No text could be extracted from the PDF.)";
}

async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || "").trim() || "(No text could be extracted from document.)";
}

async function extractTextFromText(file: File): Promise<string> {
  return await file.text();
}

async function extractTextFromRtf(file: File): Promise<string> {
  // For RTF files, we'll extract text using a simple regex approach
  // In a production environment, you might want to use a proper RTF parser
  const text = await file.text();
  // Remove RTF formatting and extract plain text
  const plainText = text
    .replace(/\\[a-zA-Z]+\s*/g, '') // Remove RTF commands
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\\[^\s]+/g, '') // Remove remaining RTF codes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  return plainText || "(No text could be extracted from RTF file.)";
}

async function extractTextFromSpreadsheet(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const text = await file.text();
  
  if (ext === "csv") {
    // For CSV, convert to readable text format
    const lines = text.split('\n');
    const headers = lines[0]?.split(',') || [];
    const data = lines.slice(1).map(line => line.split(','));
    
    let result = `Spreadsheet Data:\n`;
    result += `Headers: ${headers.join(', ')}\n\n`;
    
    data.slice(0, 10).forEach((row, index) => {
      result += `Row ${index + 1}: ${row.join(', ')}\n`;
    });
    
    if (data.length > 10) {
      result += `... and ${data.length - 10} more rows`;
    }
    
    return result.trim() || "(No text could be extracted from spreadsheet.)";
  } else {
    // For Excel files, we'll need a proper Excel parser
    // For now, return a placeholder indicating Excel content was detected
    return "Excel spreadsheet detected. The file contains tabular data that requires specialized parsing. Please export as CSV for better text extraction.";
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return (text || "").trim() || "(No text could be extracted from the image.)";
  } finally {
    await worker.terminate();
  }
}
