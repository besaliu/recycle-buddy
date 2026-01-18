const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Debug logging
console.log('[API Debug] Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('[API Debug] API_BASE_URL:', API_BASE_URL);

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

export interface TopUser {
  username: string;
  totalItemsScannedByUser: number;
  individualTrees: number;
  UUID: string;
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
  const url = `${API_BASE_URL}/createUser`;
  console.log('[API Debug] createUser called');
  console.log('[API Debug] Request URL:', url);
  console.log('[API Debug] Request body:', { username });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    console.log('[API Debug] Response status:', response.status);
    console.log('[API Debug] Response ok:', response.ok);
    console.log('[API Debug] Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('[API Debug] Response data:', data);

    if (!response.ok) {
      console.error('[API Debug] Request failed:', data.message);
      throw new Error(data.message || 'Failed to create user');
    }

    return data;
  } catch (error) {
    console.error('[API Debug] createUser error:', error);
    console.error('[API Debug] Error type:', error instanceof TypeError ? 'Network/CORS error' : 'Other error');
    throw error;
  }
}

export async function getUser(userId: string): Promise<GetUserResponse> {
  const url = `${API_BASE_URL}/getUser/${userId}`;
  console.log('[API Debug] getUser called');
  console.log('[API Debug] Request URL:', url);

  try {
    const response = await fetch(url);

    console.log('[API Debug] Response status:', response.status);
    console.log('[API Debug] Response ok:', response.ok);

    const data = await response.json();
    console.log('[API Debug] Response data:', data);

    if (!response.ok) {
      console.error('[API Debug] getUser failed:', data.message);
      throw new Error(data.message || 'Failed to get user');
    }

    return data;
  } catch (error) {
    console.error('[API Debug] getUser error:', error);
    console.error('[API Debug] Error type:', error instanceof TypeError ? 'Network/CORS error' : 'Other error');
    throw error;
  }
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

// Stats API functions
export async function incrementGlobalCO2Saved(amount: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/incrementGlobalCO2Saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to increment CO2 saved');
  }
}

export async function incrementGlobalItemsScanned(amount: number = 1): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/incrementGlobalItemsScanned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to increment items scanned');
  }
}

export async function getGlobalItemsScanned(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getGlobalItemsScanned`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get global items scanned');
  }

  return data.globalItemsScanned;
}

export async function getGlobalUserCount(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getGlobalUserCount`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get global user count');
  }

  return data.globalUserCount;
}

export async function getIndividualTrees(userId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getIndividualTrees/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get individual trees');
  }

  return data.individualTrees;
}

export async function getGlobalCO2Saved(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getGlobalCO2Saved`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get global CO2 saved');
  }

  return data.globalCO2Saved;
}

export async function getGlobalTreeCount(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getGlobalTreeCount`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get global tree count');
  }

  return data.globalTreeCount;
}

export async function getTopUsers(): Promise<TopUser[]> {
  const response = await fetch(`${API_BASE_URL}/getTopUsers`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get top users');
  }

  return data.topUsers;
}

export async function incrementIndividualTrees(userId: string, amount: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/incrementIndividualTrees/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to increment individual trees');
  }
}

export async function getUserItemsScanned(userId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/getUserItemsScanned/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user items scanned');
  }

  return data.totalItemsScannedByUser;
}

export async function incrementUserItemsScanned(userId: string, amount: number = 1): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/incrementUserItemsScanned/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to increment user items scanned');
  }
}
