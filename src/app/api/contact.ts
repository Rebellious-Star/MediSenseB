import { request, isBackendConfigured } from "./client";

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function submitContact(payload: ContactPayload): Promise<{ success: boolean; message?: string }> {
  if (!isBackendConfigured()) {
    return Promise.resolve({ success: true, message: "Message received. We'll get back to you within 24 hours." });
  }
  return request("/api/contact", {
    method: "POST",
    body: payload,
  });
}
