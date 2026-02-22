import { request, isBackendConfigured } from "./client";
import { getReports, type ReportItem } from "./reports";
import { getStoredUser } from "./auth";

const STORAGE_METRICS = "medisense_health_metrics";
const STORAGE_APPOINTMENTS = "medisense_appointments";

export interface HealthMetric {
  label: string;
  value: string;
  status: string;
  icon?: string;
  color: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  contact?: string;
  venue?: string;
  hospitalId?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  reminder?: boolean;
  userId: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  phone: string;
  emergency: boolean;
  specialties: string[];
  rating: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  contactNo: string;
  venue: string;
  city: string;
  consultationHours: string;
  ageGroup: "all" | "pediatric" | "adult" | "senior";
  suggestedSlots: string[];
}

export const DEFAULT_METRICS: HealthMetric[] = [
  { label: "Blood Pressure", value: "", status: "Not set", color: "blue" },
  { label: "Heart Rate", value: "", status: "Not set", color: "blue" },
  { label: "Glucose", value: "", status: "Not set", color: "blue" },
  { label: "BMI", value: "", status: "Not set", color: "blue" },
];

export const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Sarah Johnson", specialty: "General Physician", contactNo: "+1 234-567-8901", venue: "MediCare Clinic, 123 Health Ave", city: "New York", consultationHours: "Mon–Fri 9:00 AM – 5:00 PM", ageGroup: "adult", suggestedSlots: ["9:00 AM", "10:30 AM", "2:00 PM", "4:00 PM"] },
  { id: "d2", name: "Dr. Michael Chen", specialty: "Cardiologist", contactNo: "+1 234-567-8902", venue: "Heart Care Center, 456 Cardiac Rd", city: "New York", consultationHours: "Mon, Wed, Fri 8:00 AM – 4:00 PM", ageGroup: "adult", suggestedSlots: ["8:00 AM", "11:00 AM", "3:00 PM"] },
  { id: "d3", name: "Dr. Priya Sharma", specialty: "Pediatrician", contactNo: "+1 234-567-8903", venue: "Kids Wellness, 789 Child St", city: "Boston", consultationHours: "Tue–Sat 10:00 AM – 6:00 PM", ageGroup: "pediatric", suggestedSlots: ["10:00 AM", "12:00 PM", "2:30 PM", "5:00 PM"] },
  { id: "d4", name: "Dr. James Wilson", specialty: "Senior Care Specialist", contactNo: "+1 234-567-8904", venue: "Elder Care Clinic, 321 Silver Lane", city: "Boston", consultationHours: "Mon–Fri 8:00 AM – 3:00 PM", ageGroup: "senior", suggestedSlots: ["8:30 AM", "11:00 AM", "1:00 PM"] },
  { id: "d5", name: "Dr. Emily Davis", specialty: "General Physician", contactNo: "+1 234-567-8905", venue: "City Health Hub, 100 Main St", city: "Chicago", consultationHours: "Mon–Sat 9:00 AM – 7:00 PM", ageGroup: "all", suggestedSlots: ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"] },
  { id: "d6", name: "Dr. Rajesh Kumar", specialty: "Endocrinologist", contactNo: "+1 234-567-8906", venue: "Diabetes & Thyroid Center, 555 Metro Ave", city: "Chicago", consultationHours: "Wed–Fri 10:00 AM – 4:00 PM", ageGroup: "adult", suggestedSlots: ["10:00 AM", "1:00 PM"] },
];

export function getSavedHealthMetrics(): HealthMetric[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_METRICS) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as HealthMetric[];
      if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
    }
  } catch {}
  return DEFAULT_METRICS.map((m) => ({ ...m }));
}

export async function saveHealthMetrics(metrics: HealthMetric[]): Promise<void> {
  if (!isBackendConfigured()) {
    // Fallback to localStorage
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_METRICS, JSON.stringify(metrics));
    return;
  }
  
  try {
    await request<void>("/api/dashboard/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics }),
    });
    // Also save locally as backup
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_METRICS, JSON.stringify(metrics));
    }
  } catch (error) {
    console.error("Failed to save metrics to backend, using local storage:", error);
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_METRICS, JSON.stringify(metrics));
    }
  }
}

// Location services
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Current Location"
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

// Geocoding function to convert address to coordinates using OpenStreetMap (free, no API key required)
export async function geocodeAddress(address: string): Promise<Location> {
  try {
    // Use OpenStreetMap Nominatim API (completely free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MediSense-Health-App/1.0' // Required by Nominatim policy
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Address not found');
    }
    
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name || address
    };
  } catch (error) {
    console.error('OpenStreetMap geocoding failed:', error);
    throw new Error('Unable to find location. Please check the address and try again.');
  }
}

export async function getNearbyHospitals(location: Location): Promise<Hospital[]> {
  try {
    // Use OpenStreetMap Overpass API to find real hospitals (completely free)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:10000, ${location.lat}, ${location.lng});
        way["amenity"="hospital"](around:10000, ${location.lat}, ${location.lng});
        relation["amenity"="hospital"](around:10000, ${location.lat}, ${location.lng});
      );
      out geom;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'MediSense-Health-App/1.0'
      },
      body: overpassQuery
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const hospitals: Hospital[] = data.elements
          .filter((element: any) => element.tags && element.tags.name)
          .map((element: any) => {
            const lat = element.lat || element.center?.lat;
            const lng = element.lon || element.center?.lon;
            
            if (!lat || !lng) return null;
            
            return {
              id: element.id || element.type + '-' + element.id,
              name: element.tags.name || 'Unknown Hospital',
              address: element.tags['addr:street'] || 
                      element.tags['addr:full'] || 
                      `${Math.abs(lat).toFixed(4)}°, ${Math.abs(lng).toFixed(4)}°`,
              lat: lat,
              lng: lng,
              phone: element.tags.phone || element.tags['contact:phone'] || 'Phone not available',
              emergency: element.tags.emergency === 'yes' || 
                       element.tags['emergency'] === 'yes' ||
                       element.tags.name?.toLowerCase().includes('emergency'),
              specialties: extractSpecialties(element.tags),
              rating: 0, // Overpass doesn't provide ratings
              distance: calculateDistance(location, { lat, lng })
            };
          })
          .filter((hospital: Hospital | null): hospital is Hospital => hospital !== null)
          .sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0));
        
        if (hospitals.length > 0) {
          console.log(`Found ${hospitals.length} real hospitals via OpenStreetMap`);
          return hospitals;
        }
      }
    }
  } catch (error) {
    console.error('OpenStreetMap Overpass API failed:', error);
  }
  
  // Fallback to dynamic mock hospital data
  console.log('Using fallback mock hospitals');
  return getMockHospitals(location);
}

// Helper function to extract hospital specialties from OpenStreetMap tags
function extractSpecialties(tags: any): string[] {
  const specialties: string[] = [];
  
  // Common healthcare specialty tags in OpenStreetMap
  const specialtyMap: Record<string, string> = {
    'emergency': 'Emergency Medicine',
    'cardiology': 'Cardiology',
    'neurology': 'Neurology',
    'orthopedics': 'Orthopedics',
    'pediatrics': 'Pediatrics',
    'maternity': 'Maternity',
    'oncology': 'Oncology',
    'radiology': 'Radiology',
    'surgery': 'Surgery',
    'trauma': 'Trauma Care',
    'urgent_care': 'Urgent Care'
  };
  
  // Check tags for specialties
  Object.keys(tags).forEach(key => {
    const lowerKey = key.toLowerCase();
    Object.keys(specialtyMap).forEach(specialty => {
      if (lowerKey.includes(specialty) || tags[key].toLowerCase().includes(specialty)) {
        const mappedSpecialty = specialtyMap[specialty];
        if (!specialties.includes(mappedSpecialty)) {
          specialties.push(mappedSpecialty);
        }
      }
    });
  });
  
  // Default specialties if none found
  if (specialties.length === 0) {
    specialties.push('General Medicine', 'Emergency Care');
  }
  
  return specialties;
}

function getMockHospitals(location: Location): Hospital[] {
  // Create mock hospitals based on user's actual location
  const mockHospitals: Hospital[] = [
    {
      id: "h1",
      name: "City General Hospital",
      address: `Near ${location.address}`,
      lat: location.lat + 0.01,
      lng: location.lng + 0.01,
      phone: "+1 555-0123",
      emergency: true,
      specialties: ["Emergency", "General Medicine", "Surgery"],
      rating: 4.2
    },
    {
      id: "h2",
      name: "MediCare Center",
      address: `Near ${location.address}`,
      lat: location.lat - 0.01,
      lng: location.lng - 0.01,
      phone: "+1 555-0456",
      emergency: false,
      specialties: ["Cardiology", "Neurology", "Orthopedics"],
      rating: 4.5
    },
    {
      id: "h3",
      name: "Emergency Medical Center",
      address: `Near ${location.address}`,
      lat: location.lat + 0.02,
      lng: location.lng - 0.01,
      phone: "+1 555-0789",
      emergency: true,
      specialties: ["Emergency", "Trauma", "Urgent Care"],
      rating: 4.0
    },
    {
      id: "h4",
      name: "Regional Medical Center",
      address: `Near ${location.address}`,
      lat: location.lat - 0.02,
      lng: location.lng + 0.01,
      phone: "+1 555-0987",
      emergency: true,
      specialties: ["Emergency", "Pediatrics", "Maternity"],
      rating: 4.3
    }
  ];

  // Calculate distances and sort
  return mockHospitals.map((hospital: Hospital) => ({
    ...hospital,
    distance: calculateDistance(location, { lat: hospital.lat, lng: hospital.lng })
  })).sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0));
}

function calculateDistance(loc1: Location, loc2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export function getSavedAppointments(): Appointment[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_APPOINTMENTS) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Appointment[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export async function addSavedAppointment(appointment: Omit<Appointment, 'id' | 'userId'>): Promise<void> {
  const user = getStoredUser();
  const fullAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
    userId: user?.id || 'anonymous'
  };

  if (!isBackendConfigured()) {
    // Fallback to localStorage
    const list = getSavedAppointments();
    list.unshift(fullAppointment);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(list));
    return;
  }
  
  try {
    await request<void>("/api/dashboard/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullAppointment),
    });
    // Also save locally as backup
    const list = getSavedAppointments();
    list.unshift(fullAppointment);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(list));
    }
  } catch (error) {
    console.error("Failed to save appointment to backend, using local storage:", error);
    // Fallback to localStorage
    const list = getSavedAppointments();
    list.unshift(fullAppointment);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(list));
    }
  }
}

export function getMatchingDoctors(location: string, age: number): Doctor[] {
  const loc = location.trim().toLowerCase();
  const isPediatric = age > 0 && age < 18;
  const isSenior = age >= 60;
  return DOCTORS.filter((d) => {
    const matchLocation = !loc || d.city.toLowerCase().includes(loc) || d.venue.toLowerCase().includes(loc);
    const matchAge =
      d.ageGroup === "all" ||
      (d.ageGroup === "pediatric" && isPediatric) ||
      (d.ageGroup === "adult" && age >= 18 && age < 60) ||
      (d.ageGroup === "senior" && isSenior);
    return matchLocation && matchAge;
  });
}

export async function getHealthMetrics(): Promise<HealthMetric[]> {
  const saved = getSavedHealthMetrics();
  const allEmpty = saved.every((m) => !m.value || m.value === "0");
  if (!allEmpty) return saved;
  if (!isBackendConfigured()) return saved;
  try {
    const api = await request<HealthMetric[]>("/api/dashboard/metrics");
    return api.length >= 4 ? api : saved;
  } catch {
    return saved;
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  const saved = getSavedAppointments();
  if (!isBackendConfigured()) return saved;
  try {
    const api = await request<Appointment[]>("/api/dashboard/appointments");
    return [...saved, ...api];
  } catch {
    return saved;
  }
}

export { getReports };
export type { ReportItem };
