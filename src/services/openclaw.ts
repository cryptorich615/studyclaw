/**
 * OpenClaw Service
 * 
 * This service bridges StudyClaw to OpenClaw for AI capabilities.
 * NO OpenClaw branding is exposed to the student - it's all StudyClaw.
 */

interface OpenClawRequest {
  message: string;
  systemPrompt: string;
  context?: Array<{ role: string; content: string }>;
}

interface OpenClawResponse {
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:8080';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

export async function callOpenClaw(request: OpenClawRequest): Promise<string> {
  const { message, systemPrompt, context = [] } = request;

  try {
    // Build messages array with context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: message },
    ];

    // Call OpenClaw Gateway API
    const response = await fetch(`${OPENCLAW_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
      body: JSON.stringify({
        messages,
        model: 'minimax/MiniMax-M2.5', // Default model
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API error: ${response.status}`);
    }

    const data: OpenClawResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('OpenClaw call failed:', error);
    
    // Fallback response if OpenClaw is unavailable
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

/**
 * Health check for OpenClaw connection
 */
export async function checkOpenClawHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OPENCLAW_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
