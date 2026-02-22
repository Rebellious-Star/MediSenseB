import emailjs from "@emailjs/browser";

// Safe environment variable access
function getEnvVar(key: string): string | undefined {
  // @ts-ignore - Vite environment variables
  return import.meta.env[key];
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
}

// Initialize EmailJS (should be called once in your app initialization)
export function initEmailJS() {
  const serviceId = getEnvVar('VITE_EMAILJS_SERVICE_ID');
  const templateId = getEnvVar('VITE_EMAILJS_TEMPLATE_ID');
  const publicKey = getEnvVar('VITE_EMAILJS_PUBLIC_KEY');
  
  const isMockMode = !serviceId || !templateId || !publicKey || 
                    serviceId.includes('your_') || 
                    templateId.includes('your_') || 
                    publicKey.includes('your_') ||
                    serviceId.length < 15 ||
                    templateId.length < 15 ||
                    publicKey.length < 20 ||
                    serviceId.includes(' ') ||
                    templateId.includes(' ') ||
                    publicKey.includes(' ');
  
  if (!isMockMode) {
    emailjs.init(publicKey);
    console.log("✅ EmailJS initialized successfully");
  }
  // Removed mock mode logging to avoid duplicate messages
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Send OTP via EmailJS (with mock fallback)
export async function sendOTP(email: string): Promise<SendOTPResponse> {
  try {
    const serviceId = getEnvVar('VITE_EMAILJS_SERVICE_ID');
    const templateId = getEnvVar('VITE_EMAILJS_TEMPLATE_ID');
    const publicKey = getEnvVar('VITE_EMAILJS_PUBLIC_KEY');
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP for verification
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    
    // Check for mock mode - missing or placeholder values
    const isMockMode = !serviceId || !templateId || !publicKey || 
                      serviceId.includes('your_') || 
                      templateId.includes('your_') || 
                      publicKey.includes('your_') ||
                      serviceId.length < 15 ||
                      templateId.length < 15 ||
                      publicKey.length < 20 ||
                      serviceId.includes(' ') ||
                      templateId.includes(' ') ||
                      publicKey.includes(' ');
    
    // Mock OTP implementation - log to console and return success
    if (isMockMode) {
      console.log("🔔 MOCK OTP SYSTEM ACTIVE");
      console.log("================================");
      console.log(`📧 Email: ${email}`);
      console.log(`🔢 OTP Code: ${otp}`);
      console.log("⏰ Valid for 5 minutes");
      console.log("================================");
      console.log("📝 Use this OTP for testing (EmailJS not configured)");
      console.log(`🔍 Debug - ServiceID: "${serviceId}", TemplateID: "${templateId}", PublicKey: "${publicKey?.substring(0, 15)}..."`);
      console.log(`📏 Lengths - ServiceID: ${serviceId?.length}, TemplateID: ${templateId?.length}, PublicKey: ${publicKey?.length}`);
      
      // Also show alert in browser for easier testing
      if (typeof window !== 'undefined') {
        alert(`🔔 MOCK OTP\n\nEmail: ${email}\nOTP Code: ${otp}\n\nThis OTP is valid for 5 minutes.\n(Check console for details)`);
      }
      
      return {
        success: true,
        message: "OTP sent to your email (Mock mode - check console/alert)",
      };
    }
    
    // Real EmailJS implementation
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        otp_code: otp,
        from_name: "MediSense",
      },
      {
        publicKey,
      }
    );
    
    console.log("OTP sent successfully via EmailJS:", response);
    
    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send OTP",
    };
  }
}

// Verify OTP
export function verifyOTP(email: string, otp: string): VerifyOTPResponse {
  console.log("Verifying OTP for:", email, "OTP:", otp);
  const stored = otpStore.get(email.toLowerCase());
  console.log("Stored OTP data:", stored);
  
  if (!stored) {
    console.log("No OTP found for email:", email);
    return {
      success: false,
      message: "OTP not found or expired. Please request a new OTP.",
    };
  }

  if (Date.now() > stored.expiresAt) {
    console.log("OTP expired for email:", email);
    otpStore.delete(email.toLowerCase());
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  console.log("Comparing OTPs - Stored:", stored.otp, "Provided:", otp);
  if (stored.otp !== otp) {
    console.log("OTP mismatch for email:", email);
    return {
      success: false,
      message: "Invalid OTP. Please try again.",
    };
  }

  console.log("OTP verified successfully for email:", email);
  // OTP verified successfully, remove it
  otpStore.delete(email.toLowerCase());
  return {
    success: true,
  };
}

// Clear expired OTPs (call periodically)
export function clearExpiredOTPs() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}
