import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_PROMPTS, BOT_NAMES, BOT_AVATARS, BOT_ANSWERS_SAMPLE } from './src/data/defaultPrompts.ts';
import {
  GameRoomState,
  Player,
  BattlePair,
  PromptItem,
  WsClientMessage,
  WsServerMessage,
  ReactionEvent
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = http.createServer(app);

// WebSocket Server attached to the same HTTP server
const wss = new WebSocketServer({ server });

// In-Memory Storage for Active Rooms
interface ExtendedRoom extends GameRoomState {
  clients: Map<string, WebSocket>; // playerId -> socket
  timerInterval?: NodeJS.Timeout;
}

const rooms = new Map<string, ExtendedRoom>();

// Memory bank for custom prompts
let customPrompts: PromptItem[] = [...DEFAULT_PROMPTS];

// Try reading original file from /public/assets/aistudio/mehlist_b03b2d30.txt on start
try {
  const filePath = path.join(__dirname, 'public/assets/aistudio/mehlist_b03b2d30.txt');
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      console.log(`Loaded ${parsed.length} base prompts from attachment`);
    }
  }
} catch (e) {
  console.warn('Notice: Could not parse local mehlist attachment file directly, using defaults', e);
}

// Generate unique 4-character room code (e.g. "MEH1", "BOOM", "LMAO")
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// Send typed message to client
function sendToSocket(ws: WebSocket, msg: WsServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

// Broadcast room state to all connected players in room
function broadcastRoom(room: ExtendedRoom, customMsg?: WsServerMessage) {
  const cleanState: GameRoomState = {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    settings: room.settings,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    players: room.players,
    timer: room.timer,
    maxTimer: room.maxTimer,
    battles: room.battles,
    currentBattleIndex: room.currentBattleIndex,
    reactions: room.reactions.slice(-10),
    lastWinnerId: room.lastWinnerId,
    streakPlayerId: room.streakPlayerId,
  };

  const stateMsg: WsServerMessage = customMsg || {
    type: 'ROOM_STATE',
    payload: cleanState,
  };

  const payloadStr = JSON.stringify(stateMsg);
  room.clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(payloadStr);
    }
  });
}

// Sound broadcast helper
function broadcastSound(room: ExtendedRoom, sound: 'tick' | 'start' | 'vote' | 'reveal' | 'fanfare' | 'whoosh') {
  const msg: WsServerMessage = { type: 'SOUND_EFFECT', payload: { sound } };
  const payloadStr = JSON.stringify(msg);
  room.clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(payloadStr);
    }
  });
}

// Helper to filter prompts by settings
function getEligiblePrompts(tags: string[], types: string[]): PromptItem[] {
  const pool = customPrompts.filter(
    (p) => tags.includes(p.tag) && types.includes(p.type)
  );
  return pool.length > 0 ? pool : customPrompts;
}

// Matchmaking: Assign head-to-head battles for the round
function prepareBattlesForRound(room: ExtendedRoom) {
  const eligible = getEligiblePrompts(room.settings.tags, room.settings.types);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);

  const players = room.players;
  const battles: BattlePair[] = [];

  if (players.length < 2) return;

  // Each player gets paired for a showdown
  if (players.length === 2) {
    // 2 players: 1 battle
    const prompt = shuffled[0] || customPrompts[0];
    battles.push({
      promptId: `${prompt.id}-r${room.currentRound}-0`,
      prompt,
      player1Id: players[0].id,
      player2Id: players[1].id,
      votes: {},
      resolved: false,
    });
  } else {
    // 3+ players: circular pairing so every player gets in at least 1 or 2 battles
    const numBattles = Math.min(players.length, shuffled.length);
    for (let i = 0; i < numBattles; i++) {
      const p1 = players[i];
      const p2 = players[(i + 1) % players.length];
      const prompt = shuffled[i % shuffled.length];

      battles.push({
        promptId: `${prompt.id}-r${room.currentRound}-${i}`,
        prompt,
        player1Id: p1.id,
        player2Id: p2.id,
        votes: {},
        resolved: false,
      });
    }
  }

  room.battles = battles;
  room.currentBattleIndex = 0;
}

// Start Prompt Answering Phase
function startAnsweringPhase(room: ExtendedRoom) {
  room.phase = 'PROMPTS';
  room.maxTimer = room.settings.timerSeconds;
  room.timer = room.settings.timerSeconds;
  prepareBattlesForRound(room);

  broadcastSound(room, 'start');
  broadcastRoom(room);

  // Auto-respond for bot players after 3-6 seconds
  simulateBotAnswers(room);

  // Start timer loop
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    room.timer -= 1;

    // Check if all players answered
    const allAnswered = checkAllAnswersSubmitted(room);
    if (room.timer <= 0 || allAnswered) {
      clearInterval(room.timerInterval!);
      // Auto-fill missing answers with placeholder
      autoFillMissingAnswers(room);
      startVotingPhase(room);
    } else {
      if (room.timer <= 5) {
        broadcastSound(room, 'tick');
      }
      broadcastRoom(room);
    }
  }, 1000);
}

// Check if all answers submitted
function checkAllAnswersSubmitted(room: ExtendedRoom): boolean {
  for (const b of room.battles) {
    if (!b.answer1 || !b.answer2) return false;
  }
  return true;
}

// Fallback for unanswered prompts when time is up
function autoFillMissingAnswers(room: ExtendedRoom) {
  room.battles.forEach((b) => {
    if (!b.answer1) {
      b.answer1 = {
        playerId: b.player1Id,
        promptId: b.promptId,
        text: '«Я не придумал ничего смешного... 😴»',
      };
    }
    if (!b.answer2) {
      b.answer2 = {
        playerId: b.player2Id,
        promptId: b.promptId,
        text: '«Мой ответ съела собака! 🐶»',
      };
    }
  });
}

// Simulate bot answers
function simulateBotAnswers(room: ExtendedRoom) {
  const bots = room.players.filter((p) => p.isBot);
  if (bots.length === 0) return;

  setTimeout(() => {
    room.battles.forEach((b) => {
      const isThrip = b.prompt.type === 'THRIP';
      if (bots.some((bot) => bot.id === b.player1Id) && !b.answer1) {
        const sample = BOT_ANSWERS_SAMPLE.default[Math.floor(Math.random() * BOT_ANSWERS_SAMPLE.default.length)];
        b.answer1 = {
          playerId: b.player1Id,
          promptId: b.promptId,
          text: isThrip ? BOT_ANSWERS_SAMPLE.thrip.join(', ') : sample,
          thripItems: isThrip ? ['Чай с мятой', 'Веник из кактуса', 'Караоке Король и Шут'] : undefined,
        };
      }
      if (bots.some((bot) => bot.id === b.player2Id) && !b.answer2) {
        const sample = BOT_ANSWERS_SAMPLE.default[Math.floor(Math.random() * BOT_ANSWERS_SAMPLE.default.length)];
        b.answer2 = {
          playerId: b.player2Id,
          promptId: b.promptId,
          text: isThrip ? '1. Паспорт 2. Ключи 3. Тапки' : sample,
          thripItems: isThrip ? ['Паспорт', 'Ключи', 'Тапки'] : undefined,
        };
      }
    });
    broadcastRoom(room);
  }, 3500);
}

// Start Voting Phase for Current Battle
function startVotingPhase(room: ExtendedRoom) {
  room.phase = 'VOTING';
  room.maxTimer = 25;
  room.timer = 25;

  broadcastSound(room, 'whoosh');
  broadcastRoom(room);

  // Simulate bot votes after 2-4 seconds
  simulateBotVotes(room);

  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    room.timer -= 1;

    const currentBattle = room.battles[room.currentBattleIndex];
    if (!currentBattle) {
      finishRound(room);
      return;
    }

    // Check if all non-competing players voted
    const eligibleVoters = room.players.filter(
      (p) => p.id !== currentBattle.player1Id && p.id !== currentBattle.player2Id
    );
    // If only 2 players exist, competing players can also vote or auto-resolve
    const allVoted = eligibleVoters.length > 0
      ? eligibleVoters.every((p) => currentBattle.votes[p.id])
      : Object.keys(currentBattle.votes).length >= 1;

    if (room.timer <= 0 || allVoted) {
      clearInterval(room.timerInterval!);
      revealBattleResults(room);
    } else {
      if (room.timer <= 5) broadcastSound(room, 'tick');
      broadcastRoom(room);
    }
  }, 1000);
}

// Bot voting simulation
function simulateBotVotes(room: ExtendedRoom) {
  const currentBattle = room.battles[room.currentBattleIndex];
  if (!currentBattle) return;

  const bots = room.players.filter((p) => p.isBot);
  setTimeout(() => {
    bots.forEach((bot) => {
      // Bot doesn't vote for itself
      if (bot.id === currentBattle.player1Id || bot.id === currentBattle.player2Id) return;
      const target = Math.random() > 0.5 ? currentBattle.player1Id : currentBattle.player2Id;
      currentBattle.votes[bot.id] = target;
    });
    broadcastRoom(room);
  }, 2500);
}

// Reveal current battle winner and award points
function revealBattleResults(room: ExtendedRoom) {
  room.phase = 'REVEAL';
  const battle = room.battles[room.currentBattleIndex];

  if (battle) {
    battle.resolved = true;
    let votes1 = 0;
    let votes2 = 0;

    Object.values(battle.votes).forEach((votedId) => {
      if (votedId === battle.player1Id) votes1++;
      if (votedId === battle.player2Id) votes2++;
    });

    // Score math: 100 pts per vote, bonus 250 for landslide/clean sweep
    const totalVotes = votes1 + votes2;
    let p1Points = votes1 * 100;
    let p2Points = votes2 * 100;

    if (totalVotes > 1) {
      if (votes1 === totalVotes) p1Points += 250; // MEH-SWEEP!
      if (votes2 === totalVotes) p2Points += 250;
    } else if (totalVotes === 0) {
      // Tie breaker / friendly points
      p1Points = 50;
      p2Points = 50;
    }

    battle.pointsAwarded = { player1: p1Points, player2: p2Points };

    // Update player scores
    const p1 = room.players.find((p) => p.id === battle.player1Id);
    const p2 = room.players.find((p) => p.id === battle.player2Id);
    if (p1) p1.score += p1Points;
    if (p2) p2.score += p2Points;

    room.lastWinnerId = votes1 > votes2 ? battle.player1Id : votes2 > votes1 ? battle.player2Id : undefined;
  }

  broadcastSound(room, 'reveal');
  broadcastRoom(room);
}

// Transition to next battle or finish round
function advanceToNextBattle(room: ExtendedRoom) {
  if (room.currentBattleIndex + 1 < room.battles.length) {
    room.currentBattleIndex += 1;
    startVotingPhase(room);
  } else {
    finishRound(room);
  }
}

// Finish round and show summary
function finishRound(room: ExtendedRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);

  if (room.currentRound >= room.totalRounds) {
    // Game Over! Podium
    room.phase = 'FINAL_PODIUM';
    broadcastSound(room, 'fanfare');
    broadcastRoom(room);
  } else {
    // Next Round Summary
    room.phase = 'ROUND_SUMMARY';
    broadcastSound(room, 'fanfare');
    broadcastRoom(room);
  }
}

// WebSocket connection routing
wss.on('connection', (ws: WebSocket) => {
  let boundPlayerId: string | null = null;
  let boundRoomCode: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg: WsClientMessage = JSON.parse(data.toString());

      switch (msg.type) {
        case 'CREATE_ROOM': {
          const code = generateRoomCode();
          const hostPlayer: Player = {
            id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: msg.payload.hostName.trim() || 'Ведущий',
            avatar: msg.payload.avatar || '👑',
            score: 0,
            isHost: true,
            isReady: true,
            connected: true,
          };

          const newRoom: ExtendedRoom = {
            code,
            hostId: hostPlayer.id,
            phase: 'LOBBY',
            settings: {
              tags: ['STANDARD', '18+', 'FAMILY'],
              types: ['STANDARD', 'THRIP'],
              timerSeconds: 60,
              roundsCount: 3,
            },
            currentRound: 1,
            totalRounds: 3,
            players: [hostPlayer],
            timer: 60,
            maxTimer: 60,
            battles: [],
            currentBattleIndex: 0,
            reactions: [],
            clients: new Map([[hostPlayer.id, ws]]),
          };

          rooms.set(code, newRoom);
          boundPlayerId = hostPlayer.id;
          boundRoomCode = code;

          sendToSocket(ws, {
            type: 'JOINED_SUCCESS',
            payload: { playerId: hostPlayer.id, roomCode: code, isHost: true },
          });
          broadcastRoom(newRoom);
          break;
        }

        case 'JOIN_ROOM': {
          const code = msg.payload.roomCode.toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            sendToSocket(ws, { type: 'ERROR', payload: { message: `Комната "${code}" не найдена!` } });
            return;
          }

          // Check if reconnecting existing player
          let player: Player | undefined;
          if (msg.payload.playerId) {
            player = room.players.find((p) => p.id === msg.payload.playerId);
          }

          if (player) {
            player.connected = true;
          } else {
            const newPlayerId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            player = {
              id: newPlayerId,
              name: msg.payload.playerName.trim() || `Игрок ${room.players.length + 1}`,
              avatar: msg.payload.avatar || '😎',
              score: 0,
              isHost: false,
              isReady: true,
              connected: true,
            };
            room.players.push(player);
          }

          room.clients.set(player.id, ws);
          boundPlayerId = player.id;
          boundRoomCode = code;

          sendToSocket(ws, {
            type: 'JOINED_SUCCESS',
            payload: { playerId: player.id, roomCode: code, isHost: player.isHost },
          });
          broadcastRoom(room);
          break;
        }

        case 'UPDATE_SETTINGS': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room) return;
          room.settings = { ...room.settings, ...msg.payload.settings };
          room.totalRounds = room.settings.roundsCount;
          broadcastRoom(room);
          break;
        }

        case 'ADD_BOT': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'LOBBY') return;

          const count = msg.payload?.count || 1;
          for (let i = 0; i < count; i++) {
            const unusedNames = BOT_NAMES.filter((n) => !room.players.some((p) => p.name === n));
            const botName = unusedNames[0] || `Бот ${room.players.length + 1}`;
            const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

            room.players.push({
              id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: botName,
              avatar: botAvatar,
              score: 0,
              isHost: false,
              isReady: true,
              isBot: true,
              connected: true,
            });
          }
          broadcastRoom(room);
          break;
        }

        case 'REMOVE_PLAYER': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'LOBBY') return;
          room.players = room.players.filter((p) => p.id !== msg.payload.playerId);
          room.clients.delete(msg.payload.playerId);
          broadcastRoom(room);
          break;
        }

        case 'START_GAME': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room) return;
          if (room.players.length < 2) {
            sendToSocket(ws, {
              type: 'ERROR',
              payload: { message: 'Для игры нужно минимум 2 игрока! Добавьте бота или позовите друга.' },
            });
            return;
          }

          room.currentRound = 1;
          room.players.forEach((p) => (p.score = 0));
          startAnsweringPhase(room);
          break;
        }

        case 'SUBMIT_ANSWER': {
          if (!boundRoomCode || !boundPlayerId) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'PROMPTS') return;

          // Find battle containing this player & prompt
          const battle = room.battles.find(
            (b) =>
              b.promptId === msg.payload.promptId &&
              (b.player1Id === boundPlayerId || b.player2Id === boundPlayerId)
          );

          if (battle) {
            const submission = {
              playerId: boundPlayerId,
              promptId: msg.payload.promptId,
              text: msg.payload.text.trim() || '...',
              thripItems: msg.payload.thripItems,
            };

            if (battle.player1Id === boundPlayerId) battle.answer1 = submission;
            if (battle.player2Id === boundPlayerId) battle.answer2 = submission;

            broadcastSound(room, 'vote');
            broadcastRoom(room);
          }
          break;
        }

        case 'SUBMIT_VOTE': {
          if (!boundRoomCode || !boundPlayerId) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'VOTING') return;

          const battle = room.battles[msg.payload.battleIndex];
          if (battle) {
            // Cannot vote for yourself
            if (boundPlayerId === battle.player1Id || boundPlayerId === battle.player2Id) {
              sendToSocket(ws, { type: 'ERROR', payload: { message: 'Нельзя голосовать за свой ответ!' } });
              return;
            }

            battle.votes[boundPlayerId] = msg.payload.votedPlayerId;
            broadcastSound(room, 'vote');
            broadcastRoom(room);
          }
          break;
        }

        case 'NEXT_BATTLE': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'REVEAL') return;
          advanceToNextBattle(room);
          break;
        }

        case 'NEXT_ROUND': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room || room.phase !== 'ROUND_SUMMARY') return;

          room.currentRound += 1;
          startAnsweringPhase(room);
          break;
        }

        case 'RESTART_GAME': {
          if (!boundRoomCode) return;
          const room = rooms.get(boundRoomCode);
          if (!room) return;

          if (room.timerInterval) clearInterval(room.timerInterval);
          room.phase = 'LOBBY';
          room.currentRound = 1;
          room.battles = [];
          room.currentBattleIndex = 0;
          room.players.forEach((p) => (p.score = 0));
          broadcastRoom(room);
          break;
        }

        case 'SEND_REACTION': {
          if (!boundRoomCode || !boundPlayerId) return;
          const room = rooms.get(boundRoomCode);
          if (!room) return;

          const sender = room.players.find((p) => p.id === boundPlayerId);
          const reaction: ReactionEvent = {
            id: `rx-${Date.now()}-${Math.random()}`,
            emoji: msg.payload.emoji,
            playerName: sender?.name || 'Игрок',
            x: Math.floor(Math.random() * 80) + 10,
          };

          room.reactions.push(reaction);
          const reactionMsg: WsServerMessage = { type: 'REACTION_BROADCAST', payload: reaction };
          const payloadStr = JSON.stringify(reactionMsg);
          room.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) c.send(payloadStr);
          });
          break;
        }
      }
    } catch (err) {
      console.error('WS Message Error:', err);
    }
  });

  ws.on('close', () => {
    if (boundRoomCode && boundPlayerId) {
      const room = rooms.get(boundRoomCode);
      if (room) {
        const p = room.players.find((player) => player.id === boundPlayerId);
        if (p) p.connected = false;
        room.clients.delete(boundPlayerId);
        broadcastRoom(room);
      }
    }
  });
});

// REST Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', activeRooms: rooms.size, promptsCount: customPrompts.length });
});

app.get('/api/prompts', (_req: Request, res: Response) => {
  res.json(customPrompts);
});

app.post('/api/prompts', (req: Request, res: Response) => {
  const { text, type, tag } = req.body;
  if (!text || !type || !tag) {
    return res.status(400).json({ error: 'Missing text, type, or tag' });
  }
  const newPrompt: PromptItem = {
    id: `custom-${Date.now()}`,
    text: text.trim(),
    type: type === 'THRIP' ? 'THRIP' : 'STANDARD',
    tag: tag === '18+' ? '18+' : tag === 'FAMILY' ? 'FAMILY' : 'STANDARD',
  };
  customPrompts.unshift(newPrompt);
  res.json({ success: true, prompt: newPrompt });
});

// AI Prompt Generation using Gemini SDK (@google/genai)
app.post('/api/prompts/generate', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured in environment' });
    }

    const { tag = 'STANDARD', count = 3 } = req.body;
    const ai = new GoogleGenAI();

    const promptText = `
Ты опытный автор юмористических вопросов для пати-игры в стиле Quiplash / Jackbox на русском языке.
Придумай ${count} смешных, провокационных и остроумных вопросов для игры.
Категория: ${tag} (${tag === '18+' ? 'для взрослых, дерзкий юмор, отношения, свидания' : tag === 'FAMILY' ? 'семейный добрый юмор без пошлостей' : 'стандартный черный/ироничный юмор'}).
Формат ответа строго валидный JSON массив объектов с полями:
- text: string (сам вопрос или начало панчлайна, на который игроки должны придумать смешной ответ)
- type: "STANDARD" или "THRIP" (если в вопросе просят 3 вещи, например "3 признака...", то тип THRIP, иначе STANDARD)
- tag: "${tag}"

Примеры:
[
  { "text": "Худшая фраза перед наркозом", "type": "STANDARD", "tag": "${tag}" },
  { "text": "3 причины сбежать со свидания через окно", "type": "THRIP", "tag": "${tag}" }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '[]';
    const items = JSON.parse(responseText);

    const generatedPrompts: PromptItem[] = items.map((item: { text: string; type?: string; tag?: string }, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      text: item.text,
      type: item.type === 'THRIP' ? 'THRIP' : 'STANDARD',
      tag: (item.tag as 'STANDARD' | '18+' | 'FAMILY') || tag,
    }));

    // Add to pool
    customPrompts.unshift(...generatedPrompts);
    res.json({ success: true, prompts: generatedPrompts });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate prompts via Gemini' });
  }
});

// Vite Integration (Dev vs Prod)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // __dirname в production уже указывает на папку dist
    const clientDistPath = fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : path.join(__dirname, 'dist');

    app.use(express.static(clientDistPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else { else {
    // In dev, use Vite's connect instance
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`MEHLIST game server running on http://0.0.0.0:${port}`);
  });
}

startServer();
