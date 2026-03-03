/**
 * OpenClaw Service
 * 
 * This service bridges StudyClaw to OpenClaw for AI capabilities.
 * NO OpenClaw branding is exposed to the student - it's all StudyClaw.
 * 
 * Uses WebSocket for communication with OpenClaw Gateway.
 */

import WebSocket from 'ws';

interface OpenClawRequest {
  message: string;
  systemPrompt: string;
  context?: Array<{ role: string; content: string }>;
}

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'ws://localhost:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

export async function callOpenClaw(request: OpenClawRequest): Promise<string> {
  const { message, systemPrompt, context = [] } = request;

  return new Promise((resolve) => {
    // Build messages array with context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: message },
    ];

    let ws: WebSocket;
    let resolved = false;
    let responseBuffer = '';

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    };

    // Set timeout
    const timeout = setTimeout(() => {
      cleanup();
      console.error('OpenClaw WebSocket timeout');
      resolve("I'm having trouble connecting right now. Please try again in a moment!");
    }, 30000);

    try {
      ws = new WebSocket(`${OPENCLAW_URL}/api/v1/chat/ws`, {
        headers: {
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        },
      });

      ws.on('open', () => {
        console.log('OpenClaw WebSocket connected');
        // Send the message
        const msg = {
          type: 'chat',
          messages,
          systemPrompt,
          model: 'minimax/MiniMax-M2.5',
        };
        ws.send(JSON.stringify(msg));
      });

      ws.on('message', (data: WebSocket.Data) => {
        responseBuffer += data.toString();
        
        // Try to parse as JSON
        try {
          const response = JSON.parse(responseBuffer);
          if (response.response || response.message) {
            clearTimeout(timeout);
            cleanup();
            resolve(response.response || response.message);
            return;
          }
          // Check for complete response in streaming
          if (response.done === true || response.final === true) {
            clearTimeout(timeout);
            cleanup();
            resolve(response.response || response.message || responseBuffer);
          }
        } catch (e) {
          // Not JSON yet, might be streaming
          if (responseBuffer.includes('"response"') || responseBuffer.includes('"message"')) {
            // Try to extract response
            const match = responseBuffer.match(/"response"\s*:\s*"([^"]*)"/);
            if (match) {
              clearTimeout(timeout);
              cleanup();
              resolve(match[1]);
            }
          }
        }
      });

      ws.on('error', (error) => {
        console.error('OpenClaw WebSocket error:', error.message);
        clearTimeout(timeout);
        cleanup();
        resolve("I'm having trouble connecting right now. Please try again in a moment!");
      });

      ws.on('close', () => {
        if (!resolved) {
          clearTimeout(timeout);
          // If we have partial data, try to use it
          if (responseBuffer) {
            try {
              const response = JSON.parse(responseBuffer);
              resolve(response.response || response.message || responseBuffer);
            } catch {
              resolve(responseBuffer || "I'm having trouble connecting right now. Please try again in a moment!");
            }
          } else {
            resolve("I'm having trouble connecting right now. Please try again in a moment!");
          }
        }
      });

    } catch (error) {
      console.error('OpenClaw connection failed:', error);
      clearTimeout(timeout);
      resolve("I'm having trouble connecting right now. Please try again in a moment!");
    }
  });
}

/**
 * Health check for OpenClaw connection
 */
export async function checkOpenClawHealth(): Promise<boolean> {
  return false; // WebSocket health check would need different implementation
}
