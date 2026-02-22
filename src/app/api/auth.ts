import { request, isBackendConfigured } from "./client";
import { sendOTP, verifyOTP } from "./otp";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

const STORAGE_TOKEN = "medisense_token";
const STORAGE_USER = "medisense_user";

export function getStoredToken(): string | null {
  const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_TOKEN) : null;
  console.log("getStoredToken - Token:", token ? "[PRESENT]" : "[MISSING]");
  return token;
}

export function getStoredUser(): { id: string; name: string; email: string } | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_USER) : null;
    const user = raw ? JSON.parse(raw) : null;
    console.log("getStoredUser - User:", user ? "[PRESENT]" : "[MISSING]", user);
    return user;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
}

function setStoredAuth(token: string, user: { id: string; name: string; email: string }): void {
  console.log("setStoredAuth - Storing auth:", { token: token ? "[PRESENT]" : "[MISSING]", user });
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_TOKEN, token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  console.log("setStoredAuth - Auth stored successfully");
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

export async function sendLoginOTP(email: string): Promise<{ success: boolean; message: string }> {
  console.log("Attempting to send login OTP for:", email);
  
  if (!isBackendConfigured()) {
    console.log("Backend not configured, using mock OTP system");
    
    // Use local OTP sending
    const result = await sendOTP(email);
    return result;
  }
  
  try {
    console.log("Sending OTP to backend...");
    const result = await request<{ success: boolean; message: string }>("/api/auth/send-login-otp", {
      method: "POST",
      body: { email },
    });
    console.log("Backend response:", result);
    return result;
  } catch (error) {
    console.error("Backend OTP sending failed:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to connect to backend" };
  }
}

export async function verifyLoginOTP(email: string, otp: string, password: string): Promise<AuthResponse> {
  console.log("Verifying login OTP for:", email);
  
  if (!isBackendConfigured()) {
    console.log("Backend not configured, using mock OTP verification");
    
    // Use local OTP verification
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.success) {
      throw new Error(otpResult.message || "OTP verification failed");
    }
    
    // Mock user data for successful login
    const mockUser = {
      id: "mock-user-123",
      name: email.split('@')[0], // Use email prefix as name
      email: email
    };
    
    const mockToken = "mock-jwt-token-" + Date.now();
    
    // Store mock auth data
    setStoredAuth(mockToken, mockUser);
    
    // Verify it was stored correctly
    const storedUser = getStoredUser();
    console.log("After storage - Stored user check:", storedUser);
    
    console.log("Mock login successful for:", email);
    return {
      token: mockToken,
      user: mockUser
    };
  }
  
  try {
    console.log("Sending OTP verification to backend...");
    const data = await request<AuthResponse>("/api/auth/verify-otp-login", {
      method: "POST",
      body: { email, otp, password },
    });
    console.log("Backend verification response:", data);
    setStoredAuth(data.token, data.user);
    return data;
  } catch (error) {
    console.error("Backend OTP verification failed:", error);
    throw error;
  }
}

export async function sendSignupOTP(email: string): Promise<{ success: boolean; message: string }> {
  console.log("Attempting to send signup OTP for:", email);
  
  if (!isBackendConfigured()) {
    console.log("Backend not configured, using mock OTP system");
    
    // Use local OTP sending
    const result = await sendOTP(email);
    return result;
  }
  
  try {
    console.log("Sending OTP to backend...");
    const result = await request<{ success: boolean; message: string }>("/api/auth/send-signup-otp", {
      method: "POST",
      body: { email },
    });
    console.log("Backend response:", result);
    return result;
  } catch (error) {
    console.error("Backend OTP sending failed:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to connect to backend" };
  }
}

export async function verifySignupOTP(name: string, email: string, otp: string, password: string): Promise<AuthResponse> {
  console.log("Verifying signup OTP for:", email);
  
  if (!isBackendConfigured()) {
    console.log("Backend not configured, using mock OTP verification");
    
    // Use local OTP verification
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.success) {
      throw new Error(otpResult.message || "OTP verification failed");
    }
    
    // Mock user data for successful signup
    const mockUser = {
      id: "mock-user-" + Date.now(),
      name: name,
      email: email
    };
    
    const mockToken = "mock-jwt-token-" + Date.now();
    
    // Store mock auth data
    setStoredAuth(mockToken, mockUser);
    
    // Verify it was stored correctly
    const storedUser = getStoredUser();
    console.log("After storage - Stored user check:", storedUser);
    
    console.log("Mock signup successful for:", email);
    return {
      token: mockToken,
      user: mockUser
    };
  }
  
  try {
    console.log("Sending OTP verification to backend...");
    const data = await request<AuthResponse>("/api/auth/verify-otp-signup", {
      method: "POST",
      body: { name, email, otp, password },
    });
    console.log("Backend verification response:", data);
    setStoredAuth(data.token, data.user);
    return data;
  } catch (error) {
    console.error("Backend OTP verification failed:", error);
    throw error;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  console.log("Login attempt for:", email);
  
  if (!isBackendConfigured()) {
    console.log("Backend not configured, using mock login");
    
    // Mock login - accept any email/password
    const mockUser = {
      id: "mock-user-" + Date.now(),
      name: email.split('@')[0], // Use email prefix as name
      email: email
    };
    
    const mockToken = "mock-jwt-token-" + Date.now();
    
    // Store mock auth data
    setStoredAuth(mockToken, mockUser);
    
    // Verify it was stored correctly
    const storedUser = getStoredUser();
    console.log("After storage - Stored user check:", storedUser);
    
    console.log("Mock login successful for:", email);
    return {
      token: mockToken,
      user: mockUser
    };
  }
  
  try {
    console.log("Sending login to backend...");
    const data = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    console.log("Backend login response:", data);
    setStoredAuth(data.token, data.user);
    return data;
  } catch (error) {
    console.error("Backend login failed:", error);
    throw error;
  }
}

export async function signup(payload: SignUpPayload): Promise<AuthResponse> {
  if (!isBackendConfigured()) {
    return mockSignup(payload);
  }
  const data = await request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: payload,
  });
  setStoredAuth(data.token, data.user);
  return data;
}

export function logout(): void {
  clearAuth();
}

function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  const authData = {
    token: "mock-token-" + Date.now(),
    user: { id: "1", name: "User", email: payload.email },
  };
  setStoredAuth(authData.token, authData.user);
  return Promise.resolve(authData);
}

function mockSignup(payload: SignUpPayload): Promise<AuthResponse> {
  const authData = {
    token: "mock-token-" + Date.now(),
    user: { id: "1", name: payload.name, email: payload.email },
  };
  setStoredAuth(authData.token, authData.user);
  return Promise.resolve(authData);
}
