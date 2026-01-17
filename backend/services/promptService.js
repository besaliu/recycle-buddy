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
  
  prompt += `Please analyze the image and identify what items can be recycled according to Santa Cruz recycling guidelines. `;
  prompt += `For each item, specify whether it goes in the blue recycling bin, needs special disposal, or should be composted. `;
  prompt += `Provide specific guidance based on Santa Cruz's recycling rules. `;
  prompt += `If an item cannot be recycled, suggest the appropriate disposal method for Santa Cruz.`;

  return prompt;
}
