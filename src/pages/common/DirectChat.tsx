import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCheck, Circle, MessageCircle, Send, UserRound, Users } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { useUser } from "../../hooks/useUser";
import { useRealUser } from "../../hooks/useRealUser";
import { userService } from "../../service/userService";
import {
  buildDirectChatRoomId,
  createOpaqueChatUserId,
  getDirectChatMessages,
  getDirectChatThreads,
  rememberDirectChatMessage,
  rememberDirectChatThread,
  type DirectChatPeer,
  type DirectChatRole,
  type DirectChatThread,
} from "../../service/directChatService";

type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  time: string;
  pending?: boolean;
  clientMessageId?: string;
};

type ChatRouteState = {
  peerName?: string;
  peerAvatar?: string;
  peerRole?: DirectChatRole;
};

type ChatPayload = {
  messageId?: string;
  clientMessageId?: string | null;
  senderId: string;
  content: string;
  timestamp?: string;
};

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const DIRECT_CHAT_MESSAGES_KEY = "mindbridge.direct-chat.messages";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://gateway-service.orangebay-0b927206.eastus.azurecontainerapps.io/api";
const GATEWAY_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const CHAT_BACKEND_URL = isLocalhost
  ? ""
  : import.meta.env.VITE_VIDEOCHAT_BACKEND_URL || GATEWAY_BASE_URL;

const formatTimeLabel = (date = new Date()) =>
  `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Ahora";
  }

  return date.toLocaleString("es-MX", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (label: string) =>
  label
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

const roleLabel = (role: DirectChatRole) => {
  if (role === "PATIENT") return "Paciente";
  if (role === "PSYCHOLOGIST") return "Psicólogo";
  return "Usuario";
};

const mergeMessages = (previous: ChatMessage[], nextMessage: ChatMessage) => {
  const existingIndex = previous.findIndex((message) =>
    (nextMessage.clientMessageId && message.clientMessageId === nextMessage.clientMessageId) ||
    message.id === nextMessage.id
  );

  if (existingIndex >= 0) {
    const merged = [...previous];
    merged[existingIndex] = { ...merged[existingIndex], ...nextMessage, pending: false };
    return merged;
  }

  return [...previous, { ...nextMessage, pending: false }];
};

const mergePendingMessage = (previous: ChatMessage[], clientMessageId: string) =>
  previous.map((message) =>
    message.clientMessageId === clientMessageId ? { ...message, pending: false } : message
  );

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />;
  }

  return <span className="text-sm font-bold">{getInitials(name)}</span>;
}

export default function DirectChat() {
  const navigate = useNavigate();
  const { peerId } = useParams();
  const location = useLocation();
  const routeState = (location.state as ChatRouteState | null) ?? {};
  const fallbackUser = useUser();
  const { profile, loading, error, role } = useRealUser();

  const inferredRole = location.pathname.startsWith("/panel-psicologo") ? "PSYCHOLOGIST" : "PATIENT";
  const currentRole = (role === "PSYCHOLOGIST" || role === "PATIENT" ? role : inferredRole) as DirectChatRole;
  const currentUserId = profile?.id || "";
  const currentDisplayName = profile
    ? `${profile.name} ${profile.lastName || ""}`.trim()
    : fallbackUser.profile.name || "Usuario";
  const currentPeerRole = currentRole === "PATIENT" ? "PSYCHOLOGIST" : "PATIENT";

  const [threads, setThreads] = useState<DirectChatThread[]>([]);
  const [peer, setPeer] = useState<DirectChatPeer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showThreadsMobile, setShowThreadsMobile] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Listo para conversar");
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const activeThread = useMemo(() => {
    if (!peerId) {
      return null;
    }

    return threads.find((thread) => thread.peerId === peerId) || null;
  }, [peerId, threads]);
  const selectedPeer = useMemo<DirectChatPeer | null>(() => {
    if (peer) {
      return peer;
    }

    if (!activeThread) {
      return null;
    }

    return {
      peerId: activeThread.peerId,
      peerName: activeThread.peerName,
      peerRole: activeThread.peerRole,
      peerAvatar: activeThread.peerAvatar,
    };
  }, [activeThread, peer]);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const selfFallbackId = useMemo(() => createOpaqueChatUserId(), []);

  const resolvedSelfId = currentUserId || selfFallbackId;
  const activeRoomId = useMemo(() => {
    if (!peerId || !resolvedSelfId) {
      return "";
    }

    return buildDirectChatRoomId(resolvedSelfId, peerId);
  }, [peerId, resolvedSelfId]);

  useEffect(() => {
    if (!resolvedSelfId) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThreads(getDirectChatThreads(resolvedSelfId));

    const handleStorage = () => {
      setThreads(getDirectChatThreads(resolvedSelfId));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [resolvedSelfId]);

  useEffect(() => {
    if (!activeRoomId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      return;
    }

    setMessages(
      getDirectChatMessages(activeRoomId).map((message) => ({
        id: message.id,
        clientMessageId: message.clientMessageId,
        senderId: message.senderId,
        content: message.content,
        time: message.time,
      }))
    );

    const handleStorage = (event: StorageEvent) => {
      if (event.key === DIRECT_CHAT_MESSAGES_KEY || event.key === null) {
        setMessages(
          getDirectChatMessages(activeRoomId).map((message) => ({
            id: message.id,
            clientMessageId: message.clientMessageId,
            senderId: message.senderId,
            content: message.content,
            time: message.time,
          }))
        );
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [activeRoomId]);

  useEffect(() => {
    if (!peerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPeer(null);
      setMessages([]);
      setStatus("Selecciona una conversación para empezar.");
      return;
    }

    let ignore = false;

    const loadPeer = async () => {
      const fromState = routeState.peerName
        ? {
            peerId,
            peerName: routeState.peerName,
            peerRole: routeState.peerRole || currentPeerRole,
            peerAvatar: routeState.peerAvatar,
          }
        : null;

      const cachedThread = threads.find((thread) => thread.peerId === peerId) || null;

      const cachedPeer = cachedThread
        ? {
            peerId: cachedThread.peerId,
            peerName: cachedThread.peerName,
            peerRole: cachedThread.peerRole,
            peerAvatar: cachedThread.peerAvatar,
          }
        : null;

      const initialPeer = fromState || cachedPeer;

      if (initialPeer) {
        if (!ignore) {
          setPeer(initialPeer);
        }
        rememberDirectChatThread(resolvedSelfId, initialPeer, activeRoomId, cachedThread?.lastMessage);
      }

      if (!currentUserId) {
        if (!initialPeer) {
          const fallbackPeer: DirectChatPeer = {
            peerId,
            peerName: `Usuario ${peerId.slice(0, 8)}`,
            peerRole: currentPeerRole,
          };
          if (!ignore) {
            setPeer(fallbackPeer);
          }
          rememberDirectChatThread(resolvedSelfId, fallbackPeer, activeRoomId);
        }
        return;
      }

      if (fromState || cachedPeer) {
        return;
      }

      try {
        if (currentRole === "PATIENT") {
          const psychologist = await userService.getPsychologistById(peerId);
          if (ignore) return;

          const nextPeer: DirectChatPeer = {
            peerId,
            peerName: `${psychologist.name} ${psychologist.lastName}`.trim(),
            peerRole: "PSYCHOLOGIST",
          };
          setPeer(nextPeer);
          rememberDirectChatThread(resolvedSelfId, nextPeer, activeRoomId);
          return;
        }

        const patient = await userService.getPatientById(peerId);
        if (ignore) return;

        const nextPeer: DirectChatPeer = {
          peerId,
          peerName: `${patient.name} ${patient.lastName}`.trim(),
          peerRole: "PATIENT",
        };
        setPeer(nextPeer);
        rememberDirectChatThread(resolvedSelfId, nextPeer, activeRoomId);
      } catch {
        if (!ignore) {
          const fallbackPeer: DirectChatPeer = {
            peerId,
            peerName: `Usuario ${peerId.slice(0, 8)}`,
            peerRole: currentPeerRole,
          };
          setPeer(fallbackPeer);
          rememberDirectChatThread(resolvedSelfId, fallbackPeer, activeRoomId);
        }
      }
    };

    void loadPeer();

    return () => {
      ignore = true;
    };
  }, [activeRoomId, currentPeerRole, currentRole, currentUserId, peerId, resolvedSelfId, routeState.peerAvatar, routeState.peerName, routeState.peerRole, threads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeRoomId || !resolvedSelfId || !selectedPeer) {
      return;
    }

    if (!CHAT_BACKEND_URL) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnectionState("connected");
      setStatus(`${roleLabel(currentPeerRole)} disponible para mensajes.`);
      return;
    }

    setConnectionState("connecting");
    setStatus("Conectando al chat privado...");

    const socket = io(CHAT_BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const loadHistory = async () => {
      try {
        const response = await fetch(`${CHAT_BACKEND_URL}/api/chat/${encodeURIComponent(activeRoomId)}/messages?limit=100`);
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as Array<{
          messageId?: string;
          clientMessageId?: string | null;
          senderId: string;
          content: string;
          timestamp?: string;
        }>;

        if (!Array.isArray(payload)) {
          return;
        }

        setMessages(
          payload.map((item, index) => ({
            id: item.messageId || `${index}-${Date.now()}`,
            clientMessageId: item.clientMessageId || undefined,
            senderId: item.senderId,
            content: item.content,
            time: item.timestamp ? formatTimeLabel(new Date(item.timestamp)) : formatTimeLabel(),
          }))
        );
      } catch {
        // If history is unavailable the live socket still keeps the chat functional.
      }
    };

    const handleConnect = () => {
      socket.emit("chat:join-room", {
        roomId: activeRoomId,
        userId: resolvedSelfId,
        role: currentRole,
      });

      setConnectionState("connected");
      setStatus(`${roleLabel(currentPeerRole)} disponible para mensajes.`);
    };

    socket.on("connect", handleConnect);
    socket.on("chat:error", (payload: { message?: string }) => {
      if (payload?.message) {
        setStatus(payload.message);
        setConnectionState("error");
      }
    });

    socket.on("disconnect", () => {
      setConnectionState("idle");
      setStatus("Conexión cerrada");
    });

    socket.on("chat:receive-message", (payload: ChatPayload) => {
      const nextMessage: ChatMessage = {
        id: payload.messageId || `${payload.senderId}-${Date.now()}`,
        clientMessageId: payload.clientMessageId || undefined,
        senderId: payload.senderId,
        content: payload.content,
        time: payload.timestamp ? formatTimeLabel(new Date(payload.timestamp)) : formatTimeLabel(),
      };

      setMessages((previous) => mergeMessages(previous, nextMessage));
      rememberDirectChatMessage(activeRoomId, {
        id: nextMessage.id,
        clientMessageId: nextMessage.clientMessageId,
        senderId: nextMessage.senderId,
        content: nextMessage.content,
        time: nextMessage.time,
        createdAt: payload.timestamp || new Date().toISOString(),
      });
      rememberDirectChatThread(resolvedSelfId, selectedPeer, activeRoomId, payload.content);
      setThreads(getDirectChatThreads(resolvedSelfId));
    });

    socket.on("chat:message-ack", (payload: { clientMessageId?: string | null; ok?: boolean; error?: string }) => {
      if (payload.clientMessageId) {
        setMessages((previous) => mergePendingMessage(previous, payload.clientMessageId || ""));
      }

      if (payload.error) {
        setStatus(payload.error);
      }
    });

    void loadHistory();

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit("chat:leave-room", { roomId: activeRoomId, userId: resolvedSelfId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeRoomId, currentPeerRole, currentRole, resolvedSelfId, selectedPeer]);

  const displayPeerName = selectedPeer?.peerName || "Selecciona un chat";
  const displayPeerRole = selectedPeer?.peerRole || currentPeerRole;
  const displayPeerAvatar = selectedPeer?.peerAvatar;

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeRoomId || !selectedPeer) {
      return;
    }

    const clientMessageId = `${resolvedSelfId}-${Date.now()}`;
    const nextMessage: ChatMessage = {
      id: clientMessageId,
      clientMessageId,
      senderId: resolvedSelfId,
      content: text,
      time: formatTimeLabel(),
      pending: true,
    };

    setMessages((previous) => [...previous, nextMessage]);
    setInput("");
    rememberDirectChatMessage(activeRoomId, {
      id: nextMessage.id,
      clientMessageId,
      senderId: resolvedSelfId,
      content: text,
      time: nextMessage.time,
      createdAt: new Date().toISOString(),
    });
    rememberDirectChatThread(resolvedSelfId, selectedPeer, activeRoomId, text);
    setThreads(getDirectChatThreads(resolvedSelfId));

    if (socketRef.current?.connected) {
      socketRef.current.emit(
        "chat:send-message",
        {
          roomId: activeRoomId,
          senderId: resolvedSelfId,
          content: text,
          clientMessageId,
        },
        (ack: { ok?: boolean; error?: string }) => {
          if (!ack?.ok && ack?.error) {
            setStatus(ack.error);
            setMessages((previous) => previous.filter((message) => message.clientMessageId !== clientMessageId));
          }
        }
      );
    } else {
      setMessages((previous) => mergePendingMessage(previous, clientMessageId));
      setStatus("Modo local activo");
    }
  };

  const threadList = threads;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
      </div>
    );
  }

  if (error && !profile && !fallbackUser.profile.name) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: FOG }}>
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#EAF2F5" }}>
            <MessageCircle size={28} style={{ color: TEAL }} />
          </div>
          <h1 className="text-slate-900" style={{ fontSize: "1.4rem", fontWeight: 800 }}>
            No se pudo abrir el chat
          </h1>
          <p className="mt-2 text-slate-500" style={{ fontSize: "0.9rem" }}>
            {error || "Necesitas iniciar sesión para usar los mensajes privados."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-white"
            style={{ background: TEAL, fontWeight: 700 }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div className="border-b bg-white/90 backdrop-blur-sm" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
        <div className="responsive-container flex items-center justify-between gap-4 px-0 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition-colors hover:bg-slate-50"
              style={{ borderColor: "rgba(26,74,92,0.12)" }}
            >
              <ArrowLeft size={16} style={{ color: TEAL }} />
            </button>

            <button
              onClick={() => setShowThreadsMobile(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition-colors hover:bg-slate-50 ml-2"
              style={{ borderColor: "rgba(26,74,92,0.12)" }}
              aria-label="Abrir bandeja"
            >
              <Users size={16} style={{ color: TEAL }} />
            </button>
            <div>
              <p className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                Mensajería privada
              </p>
              <h1 className="text-slate-900 projected-text-lg" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                Chat entre 2 usuarios
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex" style={{ background: "#F0F9FF", color: TEAL }}>
            <Circle size={8} fill={connectionState === "connected" ? SAGE : CORAL} style={{ color: connectionState === "connected" ? SAGE : CORAL }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{status}</span>
          </div>
        </div>
      </div>

      <div className="responsive-container grid gap-5 py-5 px-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden lg:block overflow-hidden rounded-3xl border bg-white shadow-sm" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="border-b px-4 py-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                  Bandeja
                </p>
                <h2 className="text-slate-900" style={{ fontSize: "1rem", fontWeight: 800 }}>
                  Conversaciones
                </h2>
              </div>
              <span className="rounded-full px-2.5 py-1 text-white" style={{ background: TEAL, fontSize: "0.7rem", fontWeight: 700 }}>
                {threadList.length}
              </span>
            </div>
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
            {threadList.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#EAF2F5" }}>
                  <Users size={22} style={{ color: TEAL }} />
                </div>
                <p className="text-slate-700" style={{ fontWeight: 700 }}>
                  No hay conversaciones todavía
                </p>
                <p className="mt-1 text-slate-400" style={{ fontSize: "0.85rem" }}>
                  Abre un chat desde una cita o el perfil de un profesional.
                </p>
              </div>
            ) : (
              threadList.map((thread) => {
                const isActive = thread.peerId === peerId;
                const latestMessage = getDirectChatMessages(thread.roomId).at(-1)?.content || thread.lastMessage || "Sin mensajes aún";
                return (
                  <button
                    key={thread.roomId}
                    onClick={() => navigate(`${location.pathname.startsWith("/panel-psicologo") ? "/panel-psicologo" : "/paciente"}/mensajes/${thread.peerId}`)}
                    className="flex w-full items-start gap-3 border-b px-4 py-4 text-left transition-colors hover:bg-slate-50"
                    style={{
                      borderColor: "rgba(26,74,92,0.06)",
                      background: isActive ? "#F8FBFC" : "transparent",
                    }}
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl overflow-hidden" style={{ background: thread.peerAvatar ? "#fff" : "#EAF2F5", color: TEAL }}>
                      <Avatar name={thread.peerName} avatarUrl={thread.peerAvatar} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate" style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>
                          {thread.peerName}
                        </p>
                        <span className="flex-shrink-0 text-slate-400" style={{ fontSize: "0.72rem" }}>
                          {formatRelativeTime(thread.updatedAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5" style={{ background: thread.peerRole === "PSYCHOLOGIST" ? "#E8F5F1" : "#F0F9FF", color: thread.peerRole === "PSYCHOLOGIST" ? SAGE : "#0EA5E9", fontSize: "0.68rem", fontWeight: 700 }}>
                          {roleLabel(thread.peerRole)}
                        </span>
                        <p className="truncate text-slate-500" style={{ fontSize: "0.8rem" }}>
                          {latestMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Mobile threads drawer */}
        {showThreadsMobile && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowThreadsMobile(false)} />
            <div className="relative w-full max-w-sm h-full overflow-auto bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight: 800 }}>Conversaciones</h3>
                <button onClick={() => setShowThreadsMobile(false)} className="p-2">Cerrar</button>
              </div>
              <div>
                {threadList.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#EAF2F5" }}>
                      <Users size={22} style={{ color: TEAL }} />
                    </div>
                    <p className="text-slate-700" style={{ fontWeight: 700 }}>
                      No hay conversaciones todavía
                    </p>
                    <p className="mt-1 text-slate-400" style={{ fontSize: "0.85rem" }}>
                      Abre un chat desde una cita o el perfil de un profesional.
                    </p>
                  </div>
                ) : (
                  threadList.map((thread) => (
                    <button
                      key={thread.roomId}
                      onClick={() => {
                        setShowThreadsMobile(false);
                        navigate(`${location.pathname.startsWith("/panel-psicologo") ? "/panel-psicologo" : "/paciente"}/mensajes/${thread.peerId}`);
                      }}
                      className="flex w-full items-start gap-3 border-b px-4 py-4 text-left transition-colors hover:bg-slate-50"
                      style={{ borderColor: "rgba(26,74,92,0.06)" }}
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl overflow-hidden" style={{ background: thread.peerAvatar ? "#fff" : "#EAF2F5", color: TEAL }}>
                        <Avatar name={thread.peerName} avatarUrl={thread.peerAvatar} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate" style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>
                            {thread.peerName}
                          </p>
                          <span className="flex-shrink-0 text-slate-400" style={{ fontSize: "0.72rem" }}>
                            {formatRelativeTime(thread.updatedAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-full px-2 py-0.5" style={{ background: thread.peerRole === "PSYCHOLOGIST" ? "#E8F5F1" : "#F0F9FF", color: thread.peerRole === "PSYCHOLOGIST" ? SAGE : "#0EA5E9", fontSize: "0.68rem", fontWeight: 700 }}>
                            {roleLabel(thread.peerRole)}
                          </span>
                          <p className="truncate text-slate-500" style={{ fontSize: "0.8rem" }}>
                            {getDirectChatMessages(thread.roomId).at(-1)?.content || thread.lastMessage || "Sin mensajes aún"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border bg-white shadow-sm" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl" style={{ background: displayPeerAvatar ? "#fff" : "#EAF2F5", color: TEAL }}>
                  <Avatar name={displayPeerName} avatarUrl={displayPeerAvatar} />
                </div>
                <div>
                  <h2 className="text-slate-900 projected-text-lg" style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                      {displayPeerName}
                    </h2>
                  <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                    {roleLabel(displayPeerRole)} · {connectionState === "connected" ? "Conectado" : "Preparando conexión"}
                  </p>
                </div>
              </div>
              <div className="rounded-full px-3 py-1.5" style={{ background: "#F0F9FF", color: TEAL, fontSize: "0.8rem", fontWeight: 700 }}>
                {selectedPeer ? "Chat listo" : "Selecciona una conversación"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5" style={{ background: "linear-gradient(180deg, #F9FBFC 0%, #FFFFFF 100%)" }}>
            {!peerId ? (
              <div className="flex h-full min-h-[48vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: "#EAF2F5" }}>
                  <MessageCircle size={28} style={{ color: TEAL }} />
                </div>
                <h3 className="text-slate-900" style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  Selecciona una conversación
                </h3>
                <p className="mt-2 max-w-md text-slate-500" style={{ fontSize: "0.92rem" }}>
                  Abre un hilo desde una cita o desde el perfil del usuario para empezar a escribir sin entrar a una llamada.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full min-h-[48vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: "#F0F9FF" }}>
                  <UserRound size={28} style={{ color: "#0EA5E9" }} />
                </div>
                <h3 className="text-slate-900" style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  No hay mensajes todavía
                </h3>
                <p className="mt-2 max-w-md text-slate-500" style={{ fontSize: "0.92rem" }}>
                  Este chat se comparte solo entre dos personas y se mantiene fuera de la llamada.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const isMine = message.senderId === resolvedSelfId;
                  return (
                    <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[82%] rounded-3xl px-4 py-3 shadow-sm" style={{ background: isMine ? TEAL : "white", color: isMine ? "white" : "#0f172a", border: isMine ? "none" : "1px solid rgba(26,74,92,0.08)" }}>
                        <p style={{ fontSize: "0.92rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.content}</p>
                        <div className={`mt-2 flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                          <span style={{ fontSize: "0.7rem", opacity: 0.75 }}>{message.time}</span>
                          {isMine && message.pending ? <Circle size={8} className="animate-pulse" /> : isMine ? <CheckCheck size={12} /> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="border-t px-4 py-4" style={{ borderColor: "rgba(26,74,92,0.08)", background: "white" }}>
            <div className="mb-3 flex items-center justify-between gap-3 text-slate-400" style={{ fontSize: "0.78rem" }}>
              <span>{status}</span>
              <span>{currentDisplayName}</span>
            </div>
            <div className="flex items-end gap-3 rounded-2xl border bg-slate-50 p-3" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#EAF2F5", color: TEAL, fontWeight: 800 }}>
                {getInitials(currentDisplayName)}
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={selectedPeer ? `Escribe a ${displayPeerName}...` : "Selecciona una conversación"}
                disabled={!selectedPeer}
                rows={1}
                className="min-h-[44px] flex-1 resize-none rounded-xl border bg-white px-4 py-3 outline-none transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                style={{ borderColor: "rgba(26,74,92,0.12)" }}
              />
              <button
                onClick={sendMessage}
                disabled={!selectedPeer || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${SAGE} 100%)` }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
