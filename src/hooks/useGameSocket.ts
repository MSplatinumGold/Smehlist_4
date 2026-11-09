import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameRoomState,
  WsClientMessage,
  WsServerMessage,
  ReactionEvent,
} from '../types/game.ts';
import { sounds } from '../utils/audio.ts';

export function useGameSocket() {
  const [roomState, setRoomState] = useState<GameRoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => sessionStorage.getItem('meh_player_id') || '');
  const [roomCode, setRoomCode] = useState<string>(() => sessionStorage.getItem('meh_room_code') || '');
  const [isHost, setIsHost] = useState<boolean>(() => sessionStorage.getItem('meh_is_host') === 'true');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<ReactionEvent[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WsClientMessage[]>([]);

  // Initialize and connect WebSocket
  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setErrorMsg(null);

      // 1. Flush any queued messages that were triggered before socket connected
      if (messageQueueRef.current.length > 0) {
        while (messageQueueRef.current.length > 0) {
          const queued = messageQueueRef.current.shift();
          if (queued) {
            ws.send(JSON.stringify(queued));
          }
        }
        return;
      }

      // 2. Otherwise re-join if we have stored session
      const storedCode = sessionStorage.getItem('meh_room_code');
      const storedId = sessionStorage.getItem('meh_player_id');
      const storedName = sessionStorage.getItem('meh_player_name');
      const storedAvatar = sessionStorage.getItem('meh_player_avatar');
      const storedIsHost = sessionStorage.getItem('meh_is_host') === 'true';

      if (storedCode && storedId) {
        ws.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            payload: {
              roomCode: storedCode,
              playerName: storedName || (storedIsHost ? 'Ведущий' : 'Игрок'),
              avatar: storedAvatar || (storedIsHost ? '👑' : '😎'),
              playerId: storedId,
              isHost: storedIsHost,
            },
          })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data);
        switch (msg.type) {
          case 'ROOM_STATE':
            setRoomState(msg.payload);
            break;

          case 'JOINED_SUCCESS':
            setPlayerId(msg.payload.playerId);
            setRoomCode(msg.payload.roomCode);
            setIsHost(msg.payload.isHost);
            sessionStorage.setItem('meh_player_id', msg.payload.playerId);
            sessionStorage.setItem('meh_room_code', msg.payload.roomCode);
            sessionStorage.setItem('meh_is_host', String(msg.payload.isHost));
            break;

          case 'ERROR':
            setErrorMsg(msg.payload.message);
            setTimeout(() => setErrorMsg(null), 5000);
            break;

          case 'REACTION_BROADCAST':
            setFloatingReactions((prev) => [...prev.slice(-15), msg.payload]);
            break;

          case 'SOUND_EFFECT':
            switch (msg.payload.sound) {
              case 'tick':
                sounds.playWarningTick();
                break;
              case 'start':
                sounds.playStart();
                break;
              case 'vote':
                sounds.playVote();
                break;
              case 'reveal':
                sounds.playFanfare();
                break;
              case 'fanfare':
                sounds.playFanfare();
                break;
              case 'whoosh':
                sounds.playWhoosh();
                break;
            }
            break;
        }
      } catch (err) {
        console.error('Socket message parse error', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.warn('Socket error', err);
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  // Clean old floating reactions
  useEffect(() => {
    if (floatingReactions.length === 0) return;
    const interval = setInterval(() => {
      setFloatingReactions((prev) => prev.filter((r) => Date.now() - parseInt(r.id.split('-')[1] || '0') < 4000));
    }, 1000);
    return () => clearInterval(interval);
  }, [floatingReactions]);

  // Outgoing dispatch helpers
  const sendMessage = useCallback((msg: WsClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    } else {
      // Queue message so it will send immediately upon connection
      messageQueueRef.current.push(msg);
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    }
  }, [connect]);

  const createRoom = useCallback(
    (hostName: string, avatar: string) => {
      // Clear any previous player or room session
      sessionStorage.removeItem('meh_room_code');
      sessionStorage.removeItem('meh_player_id');
      sessionStorage.setItem('meh_player_name', hostName);
      sessionStorage.setItem('meh_player_avatar', avatar);
      sessionStorage.setItem('meh_is_host', 'true');
      setIsHost(true);
      setRoomCode('');
      setPlayerId('');
      setRoomState(null);

      // Clean query params from URL so controller mode isn't triggered
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      sendMessage({
        type: 'CREATE_ROOM',
        payload: { hostName, avatar },
      });
    },
    [sendMessage]
  );

  const joinRoom = useCallback(
    (code: string, playerName: string, avatar: string) => {
      sessionStorage.setItem('meh_player_name', playerName);
      sessionStorage.setItem('meh_player_avatar', avatar);
      sessionStorage.setItem('meh_room_code', code);
      sendMessage({
        type: 'JOIN_ROOM',
        payload: { roomCode: code, playerName, avatar },
      });
    },
    [sendMessage]
  );

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem('meh_room_code');
    sessionStorage.removeItem('meh_player_id');
    sessionStorage.removeItem('meh_is_host');
    setRoomState(null);
    setRoomCode('');
    setPlayerId('');
    setIsHost(false);
  }, []);

  return {
    roomState,
    playerId,
    roomCode,
    isHost,
    isConnected,
    errorMsg,
    floatingReactions,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
