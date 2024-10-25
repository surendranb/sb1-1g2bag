export const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview'
  }
};

export function validateConfig() {
  const missingVars: string[] = [];
  
  if (!config.openai.apiKey) {
    missingVars.push('VITE_OPENAI_API_KEY');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}