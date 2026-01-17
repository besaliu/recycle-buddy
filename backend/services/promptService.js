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
  
  prompt += `IMPORTANT INSTRUCTIONS FOR YOUR RESPONSE:\n`;
  prompt += `1. ALWAYS start your response by clearly describing the item(s) you see in the image. This helps the user verify that you correctly identified what they photographed.\n`;
  prompt += `2. After describing the item, use this exact response structure:\n`;
  prompt += `   "Your [item name] is/isn't recyclable based on [specific section/category from the Santa Cruz recycling guidelines above]."\n`;
  prompt += `3. Always reference the specific category or section from the Santa Cruz guidelines (e.g., "RECYCLABLE (BLUE BIN) - PAPER", "GARBAGE (BLACK BIN) - PLASTIC", etc.).\n`;
  prompt += `4. If the item is recyclable, specify which bin it goes in (blue bin, green bin, or special disposal).\n`;
  prompt += `5. If the item is not recyclable, explain why based on the guidelines and suggest the appropriate disposal method.\n`;
  prompt += `6. ALWAYS end your response with an encouraging, positive message that makes the user feel good about recycling. Include specific environmental benefits such as:\n`;
  prompt += `   - Carbon emissions saved (e.g., "Recycling this item saved approximately X pounds of CO2 emissions")\n`;
  prompt += `   - Trees saved (for paper/cardboard items)\n`;
  prompt += `   - Plastic waste reduced (for plastic items)\n`;
  prompt += `   - Energy saved (e.g., "This saves enough energy to power X homes")\n`;
  prompt += `   - Water saved (for items like aluminum cans)\n`;
  prompt += `   Use phrases like "Great job!", "Congratulations!", "Thank you for recycling!", "Every item counts!", etc.\n`;
  prompt += `   Make it feel personal and celebrate their contribution to the environment.\n\n`;
  
  prompt += `Example ending:\n`;
  prompt += `"Great job recycling! By recycling this newspaper, you've saved approximately 4.6 pounds of CO2 emissions, saved about 7,000 gallons of water, and prevented the need to cut down trees. Every item you recycle makes a difference - thank you for helping protect our planet!"\n\n`;
  
  prompt += `Now analyze the image and provide your response following all these instructions.`;

  return prompt;
}
