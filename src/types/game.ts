export type PromptTag = 'STANDARD' | '18+' | 'FAMILY';
export type PromptType = 'STANDARD' | 'THRIP';

export interface PromptItem {
  id: string;
  text: string;
  type: PromptType;
  tag: PromptTag;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  connected: boolean;
}

export interface PlayerAnswerSubmission {
  playerId: string;
  promptId: string;
  // For STANDARD: text; for THRIP: 3 items
  text: string;
  thripItems?: [string, string, string];
}

export interface BattlePair {
  promptId: string;
  prompt: PromptItem;
  player1Id: string;
  player2Id: string;
  answer1?: PlayerAnswerSubmission;
  answer2?: PlayerAnswerSubmission;
  votes: Record<string, string>; // voterPlayerId -> votedPlayerId ('player1Id' or 'player2Id')
  resolved: boolean;
  pointsAwarded?: {
    player1: number;
    player2: number;
  };
}

export type GamePhase =
  | 'LOBBY'
  | 'PROMPTS'
  | 'VOTING'
  | 'REVEAL'
  | 'ROUND_SUMMARY'
  | 'FINAL_PODIUM';

export interface GameSettings {
  tags: PromptTag[];
  types: PromptType[];
  timerSeconds: number;
  roundsCount: number;
}

export interface ReactionEvent {
  id: string;
  emoji: string;
  playerName: string;
  x: number; // 0-100 percentage for floating across screen
}

export interface GameRoomState {
  code: string;
  hostId: string;
  phase: GamePhase;
  settings: GameSettings;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  timer: number;
  maxTimer: number;
  battles: BattlePair[];
  currentBattleIndex: number;
  reactions: ReactionEvent[];
  lastWinnerId?: string;
  streakPlayerId?: string;
}

// Client <-> Server WebSocket Messages
export type WsClientMessage =
  | { type: 'CREATE_ROOM'; payload: { hostName: string; avatar: string } }
  | { type: 'JOIN_ROOM'; payload: { roomCode: string; playerName: string; avatar: string; playerId?: string; isHost?: boolean } }
  | { type: 'UPDATE_SETTINGS'; payload: { settings: Partial<GameSettings> } }
  | { type: 'TOGGLE_READY'; payload: { isReady?: boolean } }
  | { type: 'ADD_BOT'; payload?: { count?: number } }
  | { type: 'CLEAR_BOTS' }
  | { type: 'REMOVE_PLAYER'; payload: { playerId: string } }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_ANSWER'; payload: { promptId: string; text: string; thripItems?: [string, string, string] } }
  | { type: 'SUBMIT_VOTE'; payload: { battleIndex: number; votedPlayerId: string } }
  | { type: 'NEXT_BATTLE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART_GAME' }
  | { type: 'SEND_REACTION'; payload: { emoji: string } };

export type WsServerMessage =
  | { type: 'ROOM_STATE'; payload: GameRoomState }
  | { type: 'JOINED_SUCCESS'; payload: { playerId: string; roomCode: string; isHost: boolean } }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'REACTION_BROADCAST'; payload: ReactionEvent }
  | { type: 'SOUND_EFFECT'; payload: { sound: 'tick' | 'start' | 'vote' | 'reveal' | 'fanfare' | 'whoosh' } };
