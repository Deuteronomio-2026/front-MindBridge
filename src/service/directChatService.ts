const DIRECT_CHAT_THREADS_KEY = "mindbridge.direct-chat.threads";
const DIRECT_CHAT_SELF_ID_KEY = "mindbridge.direct-chat.self-id";
const DIRECT_CHAT_MESSAGES_KEY = "mindbridge.direct-chat.messages";

export type DirectChatRole = "PATIENT" | "PSYCHOLOGIST" | "UNKNOWN";

export type DirectChatThread = {
  roomId: string;
  participantIds: [string, string];
  peerId: string;
  peerName: string;
  peerRole: DirectChatRole;
  peerAvatar?: string;
  lastMessage?: string;
  updatedAt: string;
};

export type DirectChatPeer = {
  peerId: string;
  peerName: string;
  peerRole?: DirectChatRole;
  peerAvatar?: string;
};

export type DirectChatMessageRecord = {
  id: string;
  clientMessageId?: string;
  senderId: string;
  content: string;
  time: string;
  createdAt: string;
};

type DirectChatThreadStorage = Record<string, DirectChatThread>;
type DirectChatMessageStorage = Record<string, DirectChatMessageRecord[]>;

const normalizeId = (value: unknown): string => String(value ?? "").trim();

export const createOpaqueChatUserId = (): string => {
  if (typeof window === "undefined") {
    return "chat-user";
  }

  const storedId = window.localStorage.getItem(DIRECT_CHAT_SELF_ID_KEY);
  if (storedId) {
    return storedId;
  }

  const generatedId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `chat-user-${Math.random().toString(36).slice(2, 12)}`;

  window.localStorage.setItem(DIRECT_CHAT_SELF_ID_KEY, generatedId);
  return generatedId;
};

export const buildDirectChatRoomId = (selfId: string, peerId: string): string => {
  const participants = [normalizeId(selfId), normalizeId(peerId)].sort();
  return `direct:${participants.join("::")}`;
};

const readThreadStore = (): DirectChatThreadStorage => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(DIRECT_CHAT_THREADS_KEY) || "{}") as DirectChatThreadStorage;
  } catch {
    return {};
  }
};

const writeThreadStore = (store: DirectChatThreadStorage) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIRECT_CHAT_THREADS_KEY, JSON.stringify(store));
};

const readMessageStore = (): DirectChatMessageStorage => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(DIRECT_CHAT_MESSAGES_KEY) || "{}") as DirectChatMessageStorage;
  } catch {
    return {};
  }
};

const writeMessageStore = (store: DirectChatMessageStorage) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIRECT_CHAT_MESSAGES_KEY, JSON.stringify(store));
};

export const getDirectChatThreads = (currentUserId: string): DirectChatThread[] => {
  const normalizedCurrentUserId = normalizeId(currentUserId);
  return Object.values(readThreadStore())
    .filter((thread) => thread.participantIds.includes(normalizedCurrentUserId))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const upsertDirectChatThread = (thread: DirectChatThread): DirectChatThread => {
  const store = readThreadStore();
  store[thread.roomId] = thread;
  writeThreadStore(store);
  return thread;
};

export const getDirectChatMessages = (roomId: string): DirectChatMessageRecord[] => {
  const normalizedRoomId = normalizeId(roomId);
  if (!normalizedRoomId) {
    return [];
  }

  return [...(readMessageStore()[normalizedRoomId] || [])].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};

export const rememberDirectChatMessage = (roomId: string, message: DirectChatMessageRecord): DirectChatMessageRecord | null => {
  const normalizedRoomId = normalizeId(roomId);
  if (!normalizedRoomId || !message.id) {
    return null;
  }

  const store = readMessageStore();
  const nextMessages = [...(store[normalizedRoomId] || [])];
  const existingIndex = nextMessages.findIndex((entry) => entry.id === message.id || (message.clientMessageId && entry.clientMessageId === message.clientMessageId));

  if (existingIndex >= 0) {
    nextMessages[existingIndex] = { ...nextMessages[existingIndex], ...message };
  } else {
    nextMessages.push(message);
  }

  store[normalizedRoomId] = nextMessages.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  writeMessageStore(store);
  return message;
};

export const rememberDirectChatThread = (
  currentUserId: string,
  peer: DirectChatPeer,
  roomId?: string,
  lastMessage?: string
): DirectChatThread | null => {
  const normalizedCurrentUserId = normalizeId(currentUserId);
  const normalizedPeerId = normalizeId(peer.peerId);
  if (!normalizedCurrentUserId || !normalizedPeerId) {
    return null;
  }

  const threadRoomId = roomId || buildDirectChatRoomId(normalizedCurrentUserId, normalizedPeerId);
  const thread: DirectChatThread = {
    roomId: threadRoomId,
    participantIds: [normalizedCurrentUserId, normalizedPeerId],
    peerId: normalizedPeerId,
    peerName: peer.peerName,
    peerRole: peer.peerRole || "UNKNOWN",
    peerAvatar: peer.peerAvatar,
    lastMessage,
    updatedAt: new Date().toISOString(),
  };

  return upsertDirectChatThread(thread);
};
