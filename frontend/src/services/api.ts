const API_BASE_URL = 'http://localhost:3000/api';

export interface LLMResponse {
  success: boolean;
  response: {
    classification: string;
    bin: string;
    item_name: string;
    reasoning: string;
    environmental_impact: {
      co2_saved: string;
      recycling_rate: string;
    };
    miscellaneous: string;
  };
}

export interface User {
  username: string;
  UUID: string;
  People: number;
  totalItemsScannedByUser: number;
  totalCO2SavedByUser: number;
  individualTrees: number;
  createdAt?: any;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  userId: string;
  UUID: string;
  user: User;
}

export interface GetUserResponse {
  success: boolean;
  userId: string;
  user: User;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Cookie utilities
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days: number = 365 * 100) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getUserIdFromCookie(): string | null {
  return getCookie('userId');
}

export function setUserIdCookie(userId: string): void {
  setCookie('userId', userId);
}

// User API functions
export async function createUser(username: string): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE_URL}/createUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create user');
  }

  return data;
}

export async function getUser(userId: string): Promise<GetUserResponse> {
  const response = await fetch(`${API_BASE_URL}/getUser/${userId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user');
  }

  return data;
}

export async function analyzeImage(imageFile: File, description?: string): Promise<LLMResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  if (description && description.trim()) {
    formData.append('description', description.trim());
  }

  const response = await fetch(`${API_BASE_URL}/callLLM`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze image');
  }

  return response.json();
}
