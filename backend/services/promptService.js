import { SANTA_CRUZ_RECYCLING_INFO } from '../config/constants.js';

/**
 * Builds a prompt for the LLM with Santa Cruz recycling guidelines
 * @param {string|null} description - Optional user description of the image
 * @returns {string} - Complete prompt for the LLM
 */
export function buildRecyclingPrompt(description = null) {
  let prompt = `You are helping a user in Santa Cruz, California identify recyclable items. `;
  prompt += `Here are the Santa Cruz recycling guidelines:\n${SANTA_CRUZ_RECYCLING_INFO}\n\n`;

  if (description) {
    prompt += `The user has provided this description: "${description}". `;
  }

  prompt += `IMPORTANT: You must return the response in strict JSON format. Do not include markdown code blocks (like \`\`\`json). Just the raw JSON object.\n\n`;
  prompt += `Required JSON Structure:\n`;
  prompt += `{\n`;
  prompt += `  "classification": "recyclable" | "compostable" | "hazardous" | "garbage",\n`;
  prompt += `  "item_name": "string (e.g., 'Plastic Water Bottle')",\n`;
  prompt += `  "reasoning": "string (Explain why based on Santa Cruz guidelines)",\n`;
  prompt += `  "environmental_impact": {\n`;
  prompt += `    "co2_saved": "string (ESTIMATE a numerical value. Format: 'Number Unit' e.g. '0.5 lbs' or '2 kg'. NEVER return 'N/A'. ALWAYS estimate, even if rough.)",\n`;
  prompt += `    "recycling_rate": "string (ESTIMATE a percentage. Format: 'Number%' e.g. '75%'. NEVER return 'N/A'.)"\n`;
  prompt += `  },\n`;
  prompt += `  "miscellaneous": "string (Fun facts, upcycling ideas like 'Turn this into a planter', or other creative suggestions)"\n`;
  prompt += `}\n\n`;

  prompt += `Now analyze the image and populate this JSON structure.`;

  return prompt;
}
