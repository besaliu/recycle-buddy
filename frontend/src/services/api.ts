export interface AnalysisResult {
    success: boolean;
    response: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Sends an image to the backend for AI analysis.
 * 
 * @param file - The image file to analyze (from input[type="file"])
 * @param description - Optional text description to help the AI
 * @returns Promise resolving to the analysis result
 */
export async function analyzeImage(file: File, description?: string): Promise<AnalysisResult> {
    const formData = new FormData();

    // 1. Pass the file with the key 'image'
    formData.append('image', file);

    // 2. Pass the description (if any) with the key 'description'
    if (description) {
        formData.append('description', description);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/callLLM`, {
            method: 'POST',
            body: formData, // fetch automatically sets Content-Type to multipart/form-data
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
}
