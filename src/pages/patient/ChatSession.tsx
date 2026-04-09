import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Circle,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ScreenShare,
  Send,
  UserRound,
  Video,
  VideoOff,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { useUser } from "../../hooks/useUser";

type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  time: string;
};

type RoomParticipant = {
  userId: string;
  role: string;
};

type CallStage = "lobby" | "connecting" | "live";

type MessageHistoryItem = {
  messageId?: string;
  senderId: string;
  content: string;
  timestamp?: string;
};

type PeerDebugState = {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
  inboundVideoTracks: number;
  inboundAudioTracks: number;
  outboundVideoTracks: number;
  outboundAudioTracks: number;
  pendingCandidates: number;
  lastEvent: string;
};

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

const VIDEO_BACKEND_URL =
  import.meta.env.VITE_VIDEOCHAT_BACKEND_URL ||
  "https://videochat-sfu-git-04071730.azurewebsites.net";

function getOrCreateOpaqueUserId() {
  const storageKey = "videochat.opaque-user-id";
  const storedId = window.localStorage.getItem(storageKey);
  if (storedId) {
    return storedId;
  }

  const generatedId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `user-${Math.random().toString(36).slice(2, 12)}`;

  window.localStorage.setItem(storageKey, generatedId);
  return generatedId;
}

function formatTimeLabel(date = new Date()) {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function getInitials(label: string) {
  const parts = label
    .split(/[^a-zA-Z0-9]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function dedupeParticipants(participants: RoomParticipant[]) {
  const uniqueByUserId = new Map<string, RoomParticipant>();
  for (const participant of participants) {
    uniqueByUserId.set(participant.userId, participant);
  }
  return Array.from(uniqueByUserId.values());
}

function RemoteVideoTile({ stream, muted = false }: { stream: MediaStream; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
    void videoRef.current.play().catch(() => {
      // Autoplay may be blocked until user interaction.
    });
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />;
}

export default function ChatSession() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appointments, profile } = useUser();

  const appointment = appointments.find((a) => a.id === id);
  const roomId = appointment?.id || `room-${id || "demo"}`;
  const selfRole: RoomParticipant["role"] = "paciente";
  const selfUserId = useMemo(() => getOrCreateOpaqueUserId(), []);

  const [stage, setStage] = useState<CallStage>("lobby");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [status, setStatus] = useState("Listo para iniciar");
  const [seconds, setSeconds] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [remoteStreamsVersion, setRemoteStreamsVersion] = useState(0);
  const [debugByPeer, setDebugByPeer] = useState<Record<string, PeerDebugState>>({});

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const ignoreOfferRef = useRef<Map<string, boolean>>(new Map());
  const settingRemoteAnswerPendingRef = useRef<Map<string, boolean>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const endMessagesRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  const partnerName = useMemo(
    () => appointment?.psychologistName || "Profesional",
    [appointment?.psychologistName]
  );

  const partnerPhoto = appointment?.psychologistPhoto || "";
  const stageIsLive = stage === "live";
  const showDebugOverlay =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_WEBRTC_DEBUG === "true";

  useEffect(() => {
    endMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let timer: number | undefined;
    if (stageIsLive) {
      timer = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [stageIsLive]);

  const loadRoomHistory = async () => {
    try {
      const response = await fetch(
        `${VIDEO_BACKEND_URL}/api/chat/${encodeURIComponent(roomId)}/messages?limit=50`
      );
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as MessageHistoryItem[];
      if (!Array.isArray(payload)) {
        return;
      }

      setMessages(
        payload.map((item, index) => {
          const dt = item.timestamp ? new Date(item.timestamp) : new Date();
          return {
            id: item.messageId || `history-${index}-${dt.getTime()}`,
            senderId: item.senderId,
            content: item.content,
            time: formatTimeLabel(dt),
          };
        })
      );
    } catch (error) {
      console.warn("No se pudo cargar el historial de chat.", error);
    }
  };

  const ensureDeviceTrack = async (kind: "audio" | "video") => {
    const currentStream = localStreamRef.current;
    const hasTrack = kind === "audio"
      ? Boolean(currentStream?.getAudioTracks().length)
      : Boolean(currentStream?.getVideoTracks().length);

    if (hasTrack) {
      return true;
    }

    try {
      const capture = await navigator.mediaDevices.getUserMedia({
        audio: kind === "audio",
        video: kind === "video",
      });

      const track = kind === "audio" ? capture.getAudioTracks()[0] : capture.getVideoTracks()[0];
      if (!track) {
        return false;
      }

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      localStreamRef.current.addTrack(track);

      for (const peerConnection of peerConnectionsRef.current.values()) {
        const sender = peerConnection
          .getSenders()
          .find((candidateSender) => candidateSender.track?.kind === kind);

        if (sender) {
          await sender.replaceTrack(track);
          continue;
        }

        peerConnection.addTrack(track, localStreamRef.current);
      }

      return true;
    } catch {
      return false;
    }
  };

  const tryAcquireLocalMedia = async () => {
    const constraints: MediaStreamConstraints = {
      audio: micOn,
      video: cameraOn,
    };

    if (!constraints.audio && !constraints.video) {
      return null;
    }

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
      // Permite continuar la llamada aunque no haya permisos/dispositivos locales.
      return null;
    }
  };

  const getDebugSnapshot = (peerConnection: RTCPeerConnection, remoteUserId: string, lastEvent: string): PeerDebugState => {
    const receivers = peerConnection.getReceivers();
    const senders = peerConnection.getSenders();
    return {
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      iceGatheringState: peerConnection.iceGatheringState,
      signalingState: peerConnection.signalingState,
      inboundVideoTracks: receivers.filter((receiver) => receiver.track?.kind === "video").length,
      inboundAudioTracks: receivers.filter((receiver) => receiver.track?.kind === "audio").length,
      outboundVideoTracks: senders.filter((sender) => sender.track?.kind === "video").length,
      outboundAudioTracks: senders.filter((sender) => sender.track?.kind === "audio").length,
      pendingCandidates: (pendingCandidatesRef.current.get(remoteUserId) || []).length,
      lastEvent,
    };
  };

  const updatePeerDebug = (remoteUserId: string, peerConnection: RTCPeerConnection, lastEvent: string) => {
    setDebugByPeer((previous) => ({
      ...previous,
      [remoteUserId]: getDebugSnapshot(peerConnection, remoteUserId, lastEvent),
    }));
  };

  const teardownCall = useCallback(() => {
    socketRef.current?.emit("chat:leave-room", { roomId, userId: selfUserId });
    socketRef.current?.emit("webrtc:leave-room", { roomId, userId: selfUserId });
    socketRef.current?.disconnect();
    socketRef.current = null;

    for (const peerConnection of peerConnectionsRef.current.values()) {
      peerConnection.close();
    }
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();
    makingOfferRef.current.clear();
    ignoreOfferRef.current.clear();
    settingRemoteAnswerPendingRef.current.clear();
    setDebugByPeer({});

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    for (const stream of remoteStreamsRef.current.values()) {
      stream.getTracks().forEach((track) => track.stop());
    }
    remoteStreamsRef.current.clear();
    setRemoteStreamsVersion((v) => v + 1);

    setParticipants([]);
    setStatus("Llamada finalizada");
    setStage("lobby");
    setSeconds(0);
    startedRef.current = false;
  }, [roomId, selfUserId]);

  useEffect(() => {
    return () => {
      teardownCall();
    };
  }, [teardownCall]);

  const createPeerConnection = (remoteUserId: string) => {
    const existing = peerConnectionsRef.current.get(remoteUserId);
    if (existing) {
      return existing;
    }

    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    peerConnectionsRef.current.set(remoteUserId, peerConnection);
    makingOfferRef.current.set(remoteUserId, false);
    ignoreOfferRef.current.set(remoteUserId, false);
    settingRemoteAnswerPendingRef.current.set(remoteUserId, false);

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        peerConnection.addTrack(track, localStreamRef.current);
      }
    }

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) {
        return;
      }

      socketRef.current.emit("webrtc:ice-candidate", {
        roomId,
        targetUserId: remoteUserId,
        senderId: selfUserId,
        candidate: event.candidate.toJSON(),
      });

      updatePeerDebug(remoteUserId, peerConnection, "local ICE candidate enviado");
    };

    peerConnection.oniceconnectionstatechange = () => {
      updatePeerDebug(remoteUserId, peerConnection, "iceConnectionState cambiado");
    };

    peerConnection.onicegatheringstatechange = () => {
      updatePeerDebug(remoteUserId, peerConnection, "iceGatheringState cambiado");
    };

    peerConnection.onsignalingstatechange = () => {
      updatePeerDebug(remoteUserId, peerConnection, "signalingState cambiado");
    };

    peerConnection.onnegotiationneeded = () => {
      void maybeStartOffer(remoteUserId, "negotiationneeded");
    };

    peerConnection.ontrack = (event) => {
      const baseStream = remoteStreamsRef.current.get(remoteUserId) || new MediaStream();
      const incomingStream = event.streams?.[0];

      event.track.onmute = () => {
        setRemoteStreamsVersion((value) => value + 1);
        updatePeerDebug(remoteUserId, peerConnection, `track remoto ${event.track.kind} mute`);
      };
      event.track.onunmute = () => {
        setRemoteStreamsVersion((value) => value + 1);
        updatePeerDebug(remoteUserId, peerConnection, `track remoto ${event.track.kind} unmute`);
      };
      event.track.onended = () => {
        setRemoteStreamsVersion((value) => value + 1);
        updatePeerDebug(remoteUserId, peerConnection, `track remoto ${event.track.kind} ended`);
      };

      if (incomingStream) {
        remoteStreamsRef.current.set(remoteUserId, incomingStream);
      } else if (!baseStream.getTracks().some((track) => track.id === event.track.id)) {
        baseStream.addTrack(event.track);
        remoteStreamsRef.current.set(remoteUserId, baseStream);
      }

      setRemoteStreamsVersion((value) => value + 1);
      setStatus("Llamada conectada");
      updatePeerDebug(remoteUserId, peerConnection, `track remoto ${event.track.kind} recibido`);
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "failed") {
        setStatus("Problema de conexion de video/audio");
      }

      updatePeerDebug(remoteUserId, peerConnection, "connectionState cambiado");
    };

    updatePeerDebug(remoteUserId, peerConnection, "peer creado");

    return peerConnection;
  };

  const flushPendingCandidates = async (remoteUserId: string) => {
    const peerConnection = peerConnectionsRef.current.get(remoteUserId);
    if (!peerConnection || !peerConnection.remoteDescription) {
      return;
    }

    const pending = pendingCandidatesRef.current.get(remoteUserId) || [];
    if (pending.length === 0) {
      return;
    }

    pendingCandidatesRef.current.delete(remoteUserId);
    for (const candidate of pending) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const maybeStartOffer = async (remoteUserId: string, reason = "retry") => {
    if (remoteUserId === selfUserId || !socketRef.current) {
      return;
    }

    const isMakingOffer = makingOfferRef.current.get(remoteUserId) === true;
    if (isMakingOffer) {
      return;
    }

    const peerConnection = createPeerConnection(remoteUserId);
    if (peerConnection.signalingState !== "stable") {
      updatePeerDebug(remoteUserId, peerConnection, `offer omitida (${reason}) por signaling=${peerConnection.signalingState}`);
      return;
    }

    try {
      makingOfferRef.current.set(remoteUserId, true);

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      if (peerConnection.signalingState !== "stable") {
        updatePeerDebug(remoteUserId, peerConnection, `offer cancelada (${reason}) por signaling intermedio`);
        return;
      }

      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit("webrtc:offer", {
        roomId,
        targetUserId: remoteUserId,
        senderId: selfUserId,
        sdp: peerConnection.localDescription,
      });

      updatePeerDebug(remoteUserId, peerConnection, `offer enviada (${reason})`);
    } finally {
      makingOfferRef.current.set(remoteUserId, false);
    }
  };

  const closePeerForUser = (remoteUserId: string) => {
    const peerConnection = peerConnectionsRef.current.get(remoteUserId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(remoteUserId);
    }

    pendingCandidatesRef.current.delete(remoteUserId);
    makingOfferRef.current.delete(remoteUserId);
    ignoreOfferRef.current.delete(remoteUserId);
    settingRemoteAnswerPendingRef.current.delete(remoteUserId);

    setDebugByPeer((previous) => {
      const next = { ...previous };
      delete next[remoteUserId];
      return next;
    });

    const stream = remoteStreamsRef.current.get(remoteUserId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      remoteStreamsRef.current.delete(remoteUserId);
      setRemoteStreamsVersion((value) => value + 1);
    }
  };

  const maybeStartOfferRef = useRef(maybeStartOffer);
  maybeStartOfferRef.current = maybeStartOffer;

  useEffect(() => {
    if (stage !== "live") {
      return;
    }

    const retryTimer = window.setInterval(() => {
      for (const participant of participants) {
        if (participant.userId === selfUserId) {
          continue;
        }

        const stream = remoteStreamsRef.current.get(participant.userId) || null;
        const hasRemoteVideo = Boolean(
          stream?.getVideoTracks().some((track) => track.readyState === "live" && track.enabled)
        );
        const peerConnection = peerConnectionsRef.current.get(participant.userId) || null;

        if (
          peerConnection &&
          ["failed", "closed", "disconnected"].includes(peerConnection.connectionState)
        ) {
          closePeerForUser(participant.userId);
        }

        if (!hasRemoteVideo) {
          void maybeStartOfferRef.current(participant.userId, "interval retry sin video remoto");
        }
      }
    }, 3000);

    return () => {
      window.clearInterval(retryTimer);
    };
  }, [participants, remoteStreamsVersion, selfUserId, stage]);

  const joinCall = async () => {
    if (startedRef.current || isJoining) {
      return;
    }

    setIsJoining(true);
    setStage("connecting");
    setStatus("Preparando dispositivos...");

    try {
      // 1. Obtener medios locales
      localStreamRef.current = await tryAcquireLocalMedia();

      if (!localStreamRef.current) {
        setMicOn(false);
        setCameraOn(false);
        setStatus("Sin acceso a camara/microfono. Entraras en modo escucha.");
      }

      // 2. Conectar Socket.IO
      const socket = io(VIDEO_BACKEND_URL, {
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      // 3. Unirse a la sala
      const handleSocketConnected = () => {
        if (startedRef.current) {
          return;
        }

        startedRef.current = true;
        setStage("live");
        setStatus((prev) =>
          prev.includes("Sin acceso")
            ? "Conectado sin camara/microfono. Esperando al otro participante..."
            : "Conectado. Esperando al otro participante..."
        );

        // Un solo evento de union evita condiciones de carrera/duplicados en el backend.
        socket.emit("webrtc:join-room", {
          roomId,
          userId: selfUserId,
          role: selfRole,
        });
      };

      socket.on("disconnect", () => {
        setStatus("Desconectado");
      });

      socket.on("chat:error", (payload: { message?: string }) => {
        if (payload?.message) {
          setStatus(payload.message);
        }
      });

      socket.on("chat:participants", (payload: { participants: RoomParticipant[] }) => {
        const roomParticipants = dedupeParticipants(payload.participants || []);
        setParticipants(roomParticipants);

        for (const participant of roomParticipants) {
          void maybeStartOffer(participant.userId);
        }
      });

      socket.on("webrtc:participants", (payload: { participants: RoomParticipant[] }) => {
        const roomParticipants = dedupeParticipants(payload.participants || []);
        setParticipants(roomParticipants);

        for (const participant of roomParticipants) {
          void maybeStartOffer(participant.userId);
        }
      });

      socket.on("webrtc:existing-participants", async (payload: { participants: RoomParticipant[] }) => {
        const roomParticipants = payload.participants || [];
        if (roomParticipants.length > 0) {
          setParticipants((previous) => {
            const merged = new Map(previous.map((item) => [item.userId, item]));
            for (const participant of roomParticipants) {
              merged.set(participant.userId, participant);
            }
            return Array.from(merged.values());
          });
        }

        for (const participant of roomParticipants) {
          await maybeStartOffer(participant.userId);
        }
      });

      socket.on("webrtc:user-joined", async (payload: { user?: RoomParticipant }) => {
        const joinedUser = payload.user;
        if (!joinedUser || joinedUser.userId === selfUserId) {
          return;
        }

        setParticipants((previous) => {
          if (previous.some((participant) => participant.userId === joinedUser.userId)) {
            return previous;
          }
          return [...previous, joinedUser];
        });

        await maybeStartOffer(joinedUser.userId);
      });

      socket.on("webrtc:user-left", (payload: { userId?: string }) => {
        const remoteUserId = payload.userId;
        if (!remoteUserId) {
          return;
        }

        closePeerForUser(remoteUserId);
      });

      socket.on(
        "webrtc:offer",
        async (payload: { senderId: string; targetUserId?: string; sdp: RTCSessionDescriptionInit }) => {
        if (payload.targetUserId && payload.targetUserId !== selfUserId) {
          return;
        }

        const remoteUserId = payload.senderId;
        if (!remoteUserId || remoteUserId === selfUserId || !socketRef.current || !payload.sdp) {
          return;
        }

        const peerConnection = createPeerConnection(remoteUserId);

        const isPolite = selfUserId.localeCompare(remoteUserId) < 0;
        const isMakingOffer = makingOfferRef.current.get(remoteUserId) === true;
        const isSettingRemoteAnswerPending =
          settingRemoteAnswerPendingRef.current.get(remoteUserId) === true;
        const readyForOffer =
          !isMakingOffer &&
          (peerConnection.signalingState === "stable" || isSettingRemoteAnswerPending);
        const offerCollision = !readyForOffer;
        const ignoreOffer = !isPolite && offerCollision;
        ignoreOfferRef.current.set(remoteUserId, ignoreOffer);

        if (ignoreOffer) {
          updatePeerDebug(remoteUserId, peerConnection, "offer ignorada por collision (impolite)");
          return;
        }

        try {
          if (offerCollision) {
            await peerConnection.setLocalDescription({ type: "rollback" });
            updatePeerDebug(remoteUserId, peerConnection, "rollback local por collision de offer");
          }

          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushPendingCandidates(remoteUserId);

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socketRef.current.emit("webrtc:answer", {
            roomId,
            targetUserId: remoteUserId,
            senderId: selfUserId,
            sdp: peerConnection.localDescription,
          });

          updatePeerDebug(remoteUserId, peerConnection, "answer enviada");
        } catch (error) {
          updatePeerDebug(
            remoteUserId,
            peerConnection,
            `error procesando offer: ${error instanceof Error ? error.message : "desconocido"}`
          );
        }
        }
      );

      socket.on(
        "webrtc:answer",
        async (payload: { senderId: string; targetUserId?: string; sdp: RTCSessionDescriptionInit }) => {
        if (payload.targetUserId && payload.targetUserId !== selfUserId) {
          return;
        }

        const remoteUserId = payload.senderId;
        const peerConnection = peerConnectionsRef.current.get(remoteUserId);

        if (!peerConnection || !payload.sdp) {
          return;
        }

        try {
          settingRemoteAnswerPendingRef.current.set(remoteUserId, true);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushPendingCandidates(remoteUserId);
          updatePeerDebug(remoteUserId, peerConnection, "answer aplicada");
        } catch (error) {
          updatePeerDebug(
            remoteUserId,
            peerConnection,
            `error aplicando answer: ${error instanceof Error ? error.message : "desconocido"}`
          );
        } finally {
          settingRemoteAnswerPendingRef.current.set(remoteUserId, false);
        }
        }
      );

      socket.on(
        "webrtc:ice-candidate",
        async (payload: { senderId: string; targetUserId?: string; candidate?: RTCIceCandidateInit }) => {
        if (payload.targetUserId && payload.targetUserId !== selfUserId) {
          return;
        }

        const remoteUserId = payload.senderId;
        const candidate = payload.candidate;

        if (!remoteUserId || !candidate) {
          return;
        }

        const peerConnection = createPeerConnection(remoteUserId);
        if (!peerConnection.remoteDescription) {
          const pending = pendingCandidatesRef.current.get(remoteUserId) || [];
          pending.push(candidate);
          pendingCandidatesRef.current.set(remoteUserId, pending);
          updatePeerDebug(remoteUserId, peerConnection, "ICE remoto en cola (sin remoteDescription)");
          return;
        }

        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          updatePeerDebug(remoteUserId, peerConnection, "ICE remoto aplicado");
        } catch (error) {
          updatePeerDebug(
            remoteUserId,
            peerConnection,
            `error aplicando ICE: ${error instanceof Error ? error.message : "desconocido"}`
          );
        }
        }
      );

      socket.on("webrtc:error", (payload: { message?: string }) => {
        if (payload?.message) {
          setStatus(payload.message);
        }
      });

      socket.on(
        "chat:receive-message",
        (payload: { messageId?: string; senderId: string; content: string }) => {
          setMessages((prev) => [
            ...prev,
            {
              id: payload.messageId || `${Date.now()}-${Math.random()}`,
              senderId: payload.senderId,
              content: payload.content,
              time: formatTimeLabel(),
            },
          ]);
        }
      );

      socket.on("connect", handleSocketConnected);

      // If socket connected before listener registration, force the join flow.
      if (socket.connected) {
        handleSocketConnected();
      }

      await loadRoomHistory();
    } catch (error) {
      console.error("Error en joinCall:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Desconocido"}`);
      setStage("lobby");
      teardownCall();
    } finally {
      setIsJoining(false);
    }
  };

  const toggleMic = async () => {
    const next = !micOn;

    if (next) {
      const ok = await ensureDeviceTrack("audio");
      if (!ok) {
        setStatus("No se pudo activar el microfono");
        setMicOn(false);
        return;
      }
    }

    setMicOn(next);
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
  };

  const toggleCamera = async () => {
    const next = !cameraOn;

    if (next) {
      const ok = await ensureDeviceTrack("video");
      if (!ok) {
        setStatus("No se pudo activar la camara");
        setCameraOn(false);
        return;
      }
    }

    setCameraOn(next);
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !socketRef.current) {
      return;
    }

    const clientMessageId = `${selfUserId}-${Date.now()}`;
    socketRef.current.emit(
      "chat:send-message",
      {
        roomId,
        senderId: selfUserId,
        content: text,
        clientMessageId,
      },
      (ack: { ok?: boolean; duplicate?: boolean; error?: string }) => {
        if (!ack?.ok && ack?.error) {
          setStatus(ack.error);
        }
      }
    );

    setChatInput("");
  };

  const participantRoster = useMemo(() => {
    const rosterByUserId = new Map<string, RoomParticipant>();
    rosterByUserId.set(selfUserId, { userId: selfUserId, role: selfRole });

    for (const participant of participants) {
      if (participant.userId !== selfUserId) {
        rosterByUserId.set(participant.userId, participant);
      }
    }

    return Array.from(rosterByUserId.values());
  }, [participants, selfRole, selfUserId]);

  const videoTiles = participantRoster.map((participant) => {
    const stream = participant.userId === selfUserId
      ? localStreamRef.current
      : remoteStreamsRef.current.get(participant.userId) || null;

    const videoTrack = stream?.getVideoTracks().find((track) => track.readyState === "live") || null;
    const audioTrack = stream?.getAudioTracks().find((track) => track.readyState === "live") || null;

    return {
      userId: participant.userId,
      role: participant.role,
      stream,
      isSelf: participant.userId === selfUserId,
      label:
        participant.userId === selfUserId
          ? `${profile.name} (${selfRole})`
          : `${participant.userId} (${participant.role})`,
      hasVideo: Boolean(videoTrack && videoTrack.enabled),
      hasAudio: Boolean(audioTrack && audioTrack.enabled),
      initials: getInitials(participant.userId === selfUserId ? profile.name : participant.userId),
    };
  });

  const gridColumnsClass = videoTiles.length <= 1
    ? "grid-cols-1"
    : videoTiles.length <= 4
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  const debugRows = Object.entries(debugByPeer);

  if (stage === "lobby") {
    return (
      <div
        className="min-h-screen px-4 py-8 md:px-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, #f5fffb 0%, #f5fffb 30%, #f3f6ff 60%, #ecf0ff 100%)",
          color: "#1c2240",
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="rounded-3xl p-6 md:p-8 border"
            style={{
              background: "rgba(255,255,255,0.9)",
              borderColor: "#dfe5ff",
              boxShadow: "0 18px 40px rgba(62, 79, 170, 0.08)",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-8"
              style={{ color: "#5d6aa2" }}
            >
              <ArrowLeft size={16} />
              Volver
            </button>

            <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "#6f7ab4" }}>
              Sala de videollamada
            </p>
            <h1 className="text-3xl md:text-4xl mt-3" style={{ fontWeight: 800 }}>
              Sesion con {partnerName}
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: "#f1f5ff", border: "1px solid #dde5ff" }}
              >
                <p className="text-xs" style={{ color: "#6a77aa" }}>
                  Room ID
                </p>
                <p className="text-sm mt-1" style={{ fontWeight: 700 }}>
                  {roomId}
                </p>
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: "#f1fffb", border: "1px solid #d5f3e8" }}
              >
                <p className="text-xs" style={{ color: "#458270" }}>
                  Estado
                </p>
                <p className="text-sm mt-1" style={{ fontWeight: 700 }}>
                  {status}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={toggleMic}
                className="h-12 px-4 rounded-xl flex items-center gap-2"
                style={{
                  background: micOn ? "#e8eeff" : "#ffeaec",
                  border: `1px solid ${micOn ? "#d0dbff" : "#ffcdd4"}`,
                }}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                {micOn ? "Microfono activo" : "Microfono apagado"}
              </button>

              <button
                onClick={toggleCamera}
                className="h-12 px-4 rounded-xl flex items-center gap-2"
                style={{
                  background: cameraOn ? "#e8eeff" : "#ffeaec",
                  border: `1px solid ${cameraOn ? "#d0dbff" : "#ffcdd4"}`,
                }}
              >
                {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                {cameraOn ? "Camara activa" : "Camara apagada"}
              </button>
            </div>

            <button
              onClick={joinCall}
              disabled={isJoining}
              className="mt-8 h-14 px-7 rounded-2xl"
              style={{
                background: "linear-gradient(90deg, #3168ff 0%, #39b5ff 100%)",
                color: "white",
                fontWeight: 800,
                opacity: isJoining ? 0.7 : 1,
              }}
            >
              {isJoining ? "Conectando..." : "Entrar a la videollamada"}
            </button>
          </div>

          <div
            className="rounded-3xl p-6 md:p-8 border flex flex-col"
            style={{
              background: "rgba(255,255,255,0.85)",
              borderColor: "#dde4ff",
              boxShadow: "0 18px 40px rgba(62, 79, 170, 0.08)",
            }}
          >
            <p className="text-sm" style={{ color: "#6f7ab4" }}>
              Vista previa de la sesion
            </p>
            <div
              className="mt-4 rounded-2xl flex-1 min-h-[280px] overflow-hidden relative"
              style={{ background: "linear-gradient(145deg, #121a36 0%, #1a2850 100%)" }}
            >
              {partnerPhoto ? (
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                  >
                    <UserRound size={44} />
                  </div>
                </div>
              )}

              <div
                className="absolute bottom-4 left-4 px-4 py-2 rounded-xl"
                style={{ background: "rgba(3,8,22,0.55)", color: "#e6edff" }}
              >
                <p className="text-sm" style={{ fontWeight: 700 }}>
                  {partnerName}
                </p>
                <p className="text-xs" style={{ opacity: 0.8 }}>
                  Se unira cuando inicies la llamada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        background:
          "radial-gradient(circle at 10% 10%, #2a3568 0%, #20284b 25%, #12172b 70%, #0d1020 100%)",
        color: "#f3f6ff",
      }}
    >
      <div className="h-full flex">
        <div className="flex-1 p-3 md:p-5">
          <div
            className="rounded-2xl h-full border relative overflow-hidden"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "#131a31",
              boxShadow: "0 24px 60px rgba(3, 8, 24, 0.4)",
            }}
          >
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <button
                onClick={() => {
                  teardownCall();
                  navigate(-1);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ArrowLeft size={16} />
              </button>
              <div
                className="px-3 py-1.5 rounded-xl text-xs"
                style={{ background: "rgba(0,0,0,0.35)" }}
              >
                Sala: {roomId}
              </div>
            </div>

            <div key={remoteStreamsVersion} className={`grid ${gridColumnsClass} gap-2 h-full p-2 pb-20 overflow-y-auto`}>
              {videoTiles.map((tile) => (
                <div
                  key={tile.userId}
                  className="relative rounded-2xl overflow-hidden border min-h-[180px]"
                  style={{
                    background: "linear-gradient(145deg, #171f39 0%, #232f55 100%)",
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  {tile.stream && tile.hasVideo ? (
                    <RemoteVideoTile stream={tile.stream} muted={tile.isSelf} />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 45%, rgba(12,18,40,0.55) 100%)",
                      }}
                    >
                      <div
                        className="w-28 h-28 rounded-full flex items-center justify-center text-4xl"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#ffe6db",
                          fontWeight: 800,
                          boxShadow: "0 10px 24px rgba(7, 11, 34, 0.24)",
                        }}
                      >
                        {tile.initials}
                      </div>
                    </div>
                  )}

                  <div className="absolute left-3 bottom-3 px-2 py-1 rounded-md text-xs bg-black/55">
                    {tile.label}
                  </div>

                  <div className="absolute right-3 bottom-3 px-2 py-1 rounded-md text-[11px] bg-black/55 flex items-center gap-2">
                    {tile.hasAudio ? <Mic size={13} /> : <MicOff size={13} />}
                    {tile.hasVideo ? <Video size={13} /> : <VideoOff size={13} />}
                  </div>

                  {tile.isSelf && (
                    <div className="absolute right-3 top-3 px-2 py-1 rounded-md text-[11px] bg-black/55">
                      Tu vista
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              <button
                onClick={toggleMic}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: micOn ? "#2f375a" : "#e95b5b" }}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                onClick={toggleCamera}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: cameraOn ? "#2f375a" : "#e95b5b" }}
              >
                {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                type="button"
                disabled
                title="Compartir pantalla (proximamente)"
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#2f375a", opacity: 0.6, cursor: "not-allowed" }}
              >
                <ScreenShare size={20} />
              </button>

              <button
                onClick={() => {
                  teardownCall();
                  navigate(-1);
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#ef4b4b" }}
              >
                <PhoneOff size={22} />
              </button>
            </div>

            {stage === "live" && showDebugOverlay && (
              <div
                className="absolute top-3 right-3 z-20 w-[360px] max-w-[90vw] rounded-xl border p-2"
                style={{
                  background: "rgba(8, 12, 28, 0.72)",
                  borderColor: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <p className="text-[11px]" style={{ opacity: 0.82 }}>
                  Debug WebRTC
                </p>
                <div className="mt-1 max-h-[210px] overflow-y-auto space-y-1.5">
                  {debugRows.length === 0 && (
                    <p className="text-[11px]" style={{ opacity: 0.7 }}>
                      Sin peers aun...
                    </p>
                  )}
                  {debugRows.map(([peerId, peerDebug]) => (
                    <div
                      key={peerId}
                      className="rounded-lg px-2 py-1.5"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                      <p className="text-[11px]" style={{ fontWeight: 700 }}>
                        {peerId}
                      </p>
                      <p className="text-[10px]" style={{ opacity: 0.82 }}>
                        conn={peerDebug.connectionState} | ice={peerDebug.iceConnectionState} | signal={peerDebug.signalingState}
                      </p>
                      <p className="text-[10px]" style={{ opacity: 0.82 }}>
                        in(v/a)={peerDebug.inboundVideoTracks}/{peerDebug.inboundAudioTracks} | out(v/a)={peerDebug.outboundVideoTracks}/{peerDebug.outboundAudioTracks} | pendingICE={peerDebug.pendingCandidates}
                      </p>
                      <p className="text-[10px]" style={{ opacity: 0.7 }}>
                        {peerDebug.lastEvent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside
          className="w-[300px] border-l flex flex-col"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "#151b34" }}
        >
          <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p style={{ fontWeight: 700 }}>Participantes en sala</p>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {participantRoster.map((member) => (
                <div
                  key={member.userId}
                  className="px-3 py-2 rounded-lg flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "#33406c" }}
                    >
                      {member.userId.charAt(0).toUpperCase()}
                    </div>
                    <span>
                      {member.userId === selfUserId ? `${profile.name} (${selfRole})` : member.userId}
                    </span>
                  </div>
                  <Circle size={10} fill="#6ee7b7" color="#6ee7b7" />
                </div>
              ))}
          </div>

          <div className="px-3 pb-3">
            <button
              onClick={() => setChatOpen((prev) => !prev)}
              className="w-full rounded-xl px-3 py-2 flex items-center justify-between"
              style={{ background: "#2f375a" }}
            >
              <span className="flex items-center gap-2">
                <MessageCircle size={16} /> Chat
              </span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{messages.length}</span>
            </button>
          </div>

          {chatOpen && (
            <div className="border-t flex flex-col h-[46%]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg) => {
                  const mine = msg.senderId === selfUserId;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className="rounded-xl px-3 py-2 max-w-[90%]"
                        style={{
                          background: mine ? "#3762ff" : "rgba(255,255,255,0.09)",
                        }}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[11px] mt-1" style={{ opacity: 0.7 }}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endMessagesRef} />
              </div>

              <div
                className="p-3 border-t flex items-center gap-2"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-lg px-3 py-2 outline-none"
                  style={{ background: "rgba(255,255,255,0.09)", color: "white" }}
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "#3762ff" }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="absolute top-3 right-4 text-xs" style={{ opacity: 0.8 }}>
        <span style={{ marginRight: 8 }}>
          {stageIsLive ? <Phone size={14} /> : null}
        </span>
        En llamada {formatDuration(seconds)} | {status}
      </div>
    </div>
  );
}
