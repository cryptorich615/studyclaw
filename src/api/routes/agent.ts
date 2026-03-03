import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/client.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { callOpenClaw } from '../../services/openclaw.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const agentRouter = Router();

// Validation
const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  preset: z.enum(['CHILL_VIC', 'SGT_STRICT', 'CUSTOM']).optional(),
  personality: z.record(z.any()).optional(),
  studyFocus: z.array(z.string()).optional(),
});

// GET /api/v1/agent - Get current user's agent
agentRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user!.id },
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/agent - Update agent configuration
agentRouter.put('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateAgentSchema.parse(req.body);

    // If changing preset, update system prompt based on preset
    let systemPrompt = undefined;
    if (data.preset === 'CHILL_VIC') {
      systemPrompt = readFileSync(join(__dirname, '../../agents/chill-vic/SOUL.md'), 'utf-8');
    } else if (data.preset === 'SGT_STRICT') {
      systemPrompt = readFileSync(join(__dirname, '../../agents/sgt-strict/SOUL.md'), 'utf-8');
    }

    const agent = await prisma.agent.update({
      where: { userId: req.user!.id },
      data: {
        ...data,
        ...(systemPrompt && { systemPrompt }),
      },
    });

    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/agent/chat - Chat with agent
agentRouter.post('/chat', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      throw createError('Message is required', 400);
    }

    // Get user's agent
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user!.id },
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    // Get education tools
    const tools = readFileSync(join(__dirname, '../../agents/base/EDUCATION_TOOLS.md'), 'utf-8');

    // Build prompt with agent personality and tools
    const systemPrompt = agent.systemPrompt 
      ? `${agent.systemPrompt}\n\n--- EDUCATION TOOLS ---\n${tools}`
      : `You are ${agent.name}, a helpful study assistant.\n\n--- EDUCATION TOOLS ---\n${tools}`;

    // Call OpenClaw (the actual AI)
    const response = await callOpenClaw({
      message,
      systemPrompt,
      context: agent.memory as any[],
    });

    // Update memory
    const newMemory = [
      ...((agent.memory as any[]) || []),
      { role: 'user', content: message },
      { role: 'assistant', content: response },
    ].slice(-20); // Keep last 20 messages

    await prisma.agent.update({
      where: { userId: req.user!.id },
      data: { memory: newMemory as any },
    });

    res.json({ success: true, data: { response } });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/agent/presets - Get available presets
agentRouter.get('/presets', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'CHILL_VIC',
        name: 'Chill Vic',
        description: 'Cool substitute. Chill vibes, lets you be real, super helpful.',
        preview: 'Dude, lets figure this out together.',
      },
      {
        id: 'SGT_STRICT',
        name: 'Sgt. Strict',
        description: 'No-nonsense. High expectations, gets things done.',
        preview: 'Quiet. We have work to do.',
      },
    ],
  });
});
