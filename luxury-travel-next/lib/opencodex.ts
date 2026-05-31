import OpenAI from 'openai';

const defaultBaseURL = 'https://api.opencodex.co/v1';
const defaultModel = 'gpt-5.5';

let cachedClient: OpenAI | null = null;

function getApiKey() {
  return process.env.OPENCODEX_API_KEY || process.env.OPENAI_API_KEY || '';
}

export function getOpenCodexClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENCODEX_API_KEY or OPENAI_API_KEY is required');
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL: process.env.OPENCODEX_BASE_URL || defaultBaseURL
    });
  }

  return cachedClient;
}

export async function askOpenCodex(prompt: string) {
  const response = await getOpenCodexClient().chat.completions.create({
    model: process.env.OPENCODEX_MODEL || defaultModel,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.choices[0]?.message.content || '';
}
