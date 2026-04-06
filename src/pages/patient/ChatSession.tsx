import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import * as mediasoupClient from "mediasoup-client";
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

const VIDEO_BACKEND_URL =
  import.meta.env.VITE_VIDEOCHAT_BACKEND_URL ||
  "https://videochat-sfu-app.azurewebsites.net";

function toUserId(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
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

function RemoteVideoTile({ stream, muted = false }: { stream: MediaStream; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
    void videoRef.current.play().catch(() => {
      // autoplay puede bloquearse hasta interacción del usuario
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
  const selfRole = profile.role || "paciente";
  const selfUserId = `${toUserId(profile.email || profile.name || "user") || "user"}-${selfRole}`;

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
  const [selectedMainUserId, setSelectedMainUserId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const deviceRef = useRef<mediasoupClient.types.Device | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const producersRef = useRef<Map<string, mediasoupClient.types.Producer>>(new Map());
  const consumersRef = useRef<Map<string, mediasoupClient.types.Consumer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const endMessagesRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  const partnerName = useMemo(
    () => appointment?.psychologistName || "Profesional",
    [appointment?.psychologistName]
  );

  const partnerPhoto = appointment?.psychologistPhoto || "";
  const stageIsLive = stage === "live";

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

  useEffect(() => {
    return () => {
      teardownCall();
    };
  }, []);

  useEffect(() => {
    if (stage === "lobby") {
      return;
    }

    const localVideo = localVideoRef.current;
    if (!localVideo || !localStreamRef.current) {
      return;
    }

    localVideo.srcObject = localStreamRef.current;
    void localVideo.play().catch(() => {
      // Algunos navegadores bloquean autoplay hasta interacción explícita.
    });
  }, [stage]);

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
    } catch {
      
    }
  };

  const attachLocalPreview = (stream: MediaStream | null) => {
    const localVideo = localVideoRef.current;
    if (!localVideo) {
      return;
    }

    localVideo.srcObject = stream;
    if (stream) {
      void localVideo.play().catch(() => {
        
      });
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
      attachLocalPreview(localStreamRef.current);

      const existingProducer = producersRef.current.get(kind);
      if (existingProducer) {
        await existingProducer.replaceTrack({ track });
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

  const teardownCall = () => {
    socketRef.current?.emit("chat:leave-room", { roomId, userId: selfUserId });
    socketRef.current?.emit("webrtc:leave-room", { roomId, userId: selfUserId });
    socketRef.current?.disconnect();
    socketRef.current = null;

    // Cerrar productores
    for (const producer of producersRef.current.values()) {
      producer.close();
    }
    producersRef.current.clear();

    // Cerrar consumidores
    for (const consumer of consumersRef.current.values()) {
      consumer.close();
    }
    consumersRef.current.clear();

    // Cerrar transportes
    if (sendTransportRef.current) {
      sendTransportRef.current.close();
      sendTransportRef.current = null;
    }
    if (recvTransportRef.current) {
      recvTransportRef.current.close();
      recvTransportRef.current = null;
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

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
  };

  const createTransports = async () => {
    if (!socketRef.current || !deviceRef.current) {
      return;
    }

    try {
      // Crear transporte para enviar
      const sendTransportData = await new Promise<any>((resolve, reject) => {
        socketRef.current!.emit(
          "mediasoup:create-transport",
          { roomId, userId: selfUserId },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });

      const sendTransport = deviceRef.current!.createSendTransport(sendTransportData);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        socketRef.current!.emit(
          "mediasoup:connect-transport",
          { roomId, dtlsParameters },
          (response: any) => {
            if (response.error) {
              errback(new Error(response.error));
            } else {
              callback();
            }
          }
        );
      });

      sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
        socketRef.current!.emit(
          "mediasoup:produce",
          { roomId, userId: selfUserId, kind, rtpParameters },
          (response: any) => {
            if (response.error) {
              errback(new Error(response.error));
            } else {
              callback({ id: response.id });
            }
          }
        );
      });

      // Producir audio y video
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          try {
            const producer = await sendTransport.produce({
              track,
              encodings: track.kind === "audio" ? undefined : [{ maxBitrate: 1000000 }],
            });
            producersRef.current.set(track.kind, producer);
            console.log(`Productor creado: ${track.kind}`);
          } catch (error) {
            console.error(`Error creando productor para ${track.kind}:`, error);
          }
        }
      }

      // Crear transporte para recibir
      const recvTransportData = await new Promise<any>((resolve, reject) => {
        socketRef.current!.emit(
          "mediasoup:create-transport",
          { roomId, userId: selfUserId },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });

      const recvTransport = deviceRef.current!.createRecvTransport(recvTransportData);
      recvTransportRef.current = recvTransport;

      recvTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        socketRef.current!.emit(
          "mediasoup:connect-transport",
          { roomId, dtlsParameters },
          (response: any) => {
            if (response.error) {
              errback(new Error(response.error));
            } else {
              callback();
            }
          }
        );
      });

      setStatus("Transportes creados, publicando medios...");
    } catch (error) {
      console.error("Error creando transportes:", error);
      setStatus(`Error en transportes: ${error instanceof Error ? error.message : "Desconocido"}`);
    }
  };

  const subscribeToProducer = async (producerId: string, kind: string, remoteUserId: string) => {
    if (!socketRef.current || !deviceRef.current || !recvTransportRef.current) {
      return;
    }

    try {
      const consumerData = await new Promise<any>((resolve, reject) => {
        socketRef.current!.emit(
          "mediasoup:consume",
          {
            roomId,
            userId: selfUserId,
            producerId,
            rtpCapabilities: deviceRef.current!.rtpCapabilities,
          },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });

      const consumer = await recvTransportRef.current.consume(consumerData);
      consumersRef.current.set(consumerData.id, consumer);

      const stream = remoteStreamsRef.current.get(remoteUserId) || new MediaStream();
      stream.addTrack(consumer.track);
      remoteStreamsRef.current.set(remoteUserId, stream);
      setRemoteStreamsVersion((v) => v + 1);

      setStatus("Llamada conectada");
      console.log(`Consumidor creado para ${kind}`);
    } catch (error) {
      console.error(`Error consumiendo productor:`, error);
    }
  };

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
        setStatus("Sin acceso a cámara/micrófono. Entraras en modo escucha.");
      }

      if (localVideoRef.current) {
        attachLocalPreview(localStreamRef.current);
      }

      // 2. Conectar Socket.IO
      const socket = io(VIDEO_BACKEND_URL, {
        transports: ["websocket"],
      });

      socketRef.current = socket;

      // 3. Inicializar dispositivo Mediasoup
      const device = new mediasoupClient.Device();
      deviceRef.current = device;

      // 4. Obtener RTP Capabilities del router servidor
      const rtpCapabilitiesData = await new Promise<{ rtpCapabilities: any }>((resolve, reject) => {
        socket.emit(
          "mediasoup:get-router-rtp-capabilities",
          { roomId },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });

      await device.load({ routerRtpCapabilities: rtpCapabilitiesData.rtpCapabilities });
      setStatus("Dispositivo Mediasoup cargado");

      // 5. Unirse a la sala
      const handleSocketConnected = () => {
        if (startedRef.current) {
          return;
        }

        startedRef.current = true;
        setStage("live");
        setStatus((prev) =>
          prev.includes("Sin acceso")
            ? "Conectado sin cámara/micrófono. Esperando al otro participante..."
            : "Conectado. Esperando al otro participante..."
        );

        socket.emit("chat:join-room", {
          roomId,
          userId: selfUserId,
          role: selfRole,
        });

        socket.emit("webrtc:join-room", {
          roomId,
          userId: selfUserId,
          role: selfRole,
        });

        // Crear transportes
        createTransports();
      };

      socket.on("connect", handleSocketConnected);

      // Si el socket se conectó antes de registrar el listener, forzamos el flujo de unión.
      if (socket.connected) {
        handleSocketConnected();
      }

      socket.on("disconnect", () => {
        setStatus("Desconectado");
      });

      socket.on("chat:error", (payload: { message?: string }) => {
        if (payload?.message) {
          setStatus(payload.message);
        }
      });

      socket.on("chat:participants", (payload: { participants: RoomParticipant[] }) => {
        setParticipants(payload.participants || []);
      });

      socket.on("webrtc:participants", (payload: { participants: RoomParticipant[] }) => {
        setParticipants(payload.participants || []);
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

      socket.on("mediasoup:producer-added", async (payload: { userId: string; kind: string; producerId: string }) => {
        console.log(`Producer agregado: ${payload.userId} (${payload.kind})`);
        // Subscribir a este productor
        await subscribeToProducer(payload.producerId, payload.kind, payload.userId);
      });

      socket.on("mediasoup:new-producer", async (payload: { producerId: string; kind: string; userId: string }) => {
        console.log(`Nuevo productor: ${payload.userId} (${payload.kind})`);
        // Subscribir a este productor si el dispositivo puede
        try {
          await subscribeToProducer(payload.producerId, payload.kind, payload.userId);
        } catch (error) {
          console.error("Error subscribiendo a productor:", error);
        }
      });

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

    if (next) {
      attachLocalPreview(localStreamRef.current);
    }
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

  const remoteStreamEntries = Array.from(remoteStreamsRef.current.entries());
  const videoTiles = [
    ...(localStreamRef.current
      ? [
          {
            userId: selfUserId,
            stream: localStreamRef.current,
            isSelf: true,
            label: `${profile.name} (${selfRole})`,
          },
        ]
      : []),
    ...remoteStreamEntries.map(([userId, stream]) => {
      const participant = participants.find((p) => p.userId === userId);
      return {
        userId,
        stream,
        isSelf: false,
        label: participant ? `${participant.userId} (${participant.role})` : userId,
      };
    }),
  ];

  const defaultMainUserId = videoTiles.find((tile) => !tile.isSelf)?.userId || videoTiles[0]?.userId || null;
  const activeMainUserId =
    selectedMainUserId && videoTiles.some((tile) => tile.userId === selectedMainUserId)
      ? selectedMainUserId
      : defaultMainUserId;
  const mainVideoTile = videoTiles.find((tile) => tile.userId === activeMainUserId) || null;
  const thumbnailTiles = videoTiles.filter((tile) => tile.userId !== activeMainUserId);
  const remoteConnected = remoteStreamEntries.length > 0;
  const psychologistPresentInRoom =
    selfRole === "psicologo" || participants.some((participant) => participant.role === "psicologo");

  useEffect(() => {
    if (activeMainUserId !== selectedMainUserId) {
      setSelectedMainUserId(activeMainUserId);
    }
  }, [activeMainUserId, selectedMainUserId]);

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

            {mainVideoTile && (
              <div key={remoteStreamsVersion} className="w-full h-full p-2">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/30">
                  <RemoteVideoTile stream={mainVideoTile.stream} muted={mainVideoTile.isSelf} />
                  <div className="absolute left-2 bottom-2 px-2 py-1 rounded-md text-xs bg-black/45">
                    {mainVideoTile.label}
                  </div>
                  <div className="absolute right-2 top-2 px-2 py-1 rounded-md text-xs bg-black/45">
                    Camara principal
                  </div>
                </div>
              </div>
            )}

            {!remoteConnected && !psychologistPresentInRoom && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.09)" }}
                >
                  <span style={{ fontSize: 28, fontWeight: 700 }}>
                    {partnerName.charAt(0) || "P"}
                  </span>
                </div>
                <p style={{ opacity: 0.75 }}>{partnerName}</p>
                <p className="text-sm" style={{ opacity: 0.55 }}>
                  {stage === "connecting"
                    ? "Conectando con la sala..."
                    : "Esperando al otro participante"}
                </p>
              </div>
            )}

            {thumbnailTiles.length > 0 && (
              <div className="absolute left-3 right-3 bottom-20 z-20">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {thumbnailTiles.map((tile) => (
                    <button
                      key={tile.userId}
                      type="button"
                      onClick={() => setSelectedMainUserId(tile.userId)}
                      className="relative w-40 h-24 rounded-xl overflow-hidden border shrink-0"
                      style={{
                        background: "#202844",
                        borderColor: "rgba(255,255,255,0.25)",
                      }}
                    >
                      <RemoteVideoTile stream={tile.stream} muted={tile.isSelf} />
                      {!cameraOn && tile.isSelf && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "#141a2f" }}
                        >
                          <VideoOff size={16} />
                        </div>
                      )}
                      <div className="absolute left-1.5 bottom-1 text-[11px] px-1.5 py-0.5 rounded bg-black/45">
                        {tile.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#2f375a" }}
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
            {[{ userId: selfUserId, role: selfRole }, ...participants.filter((p) => p.userId !== selfUserId)].map(
              (member) => (
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
              )
            )}
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
        En llamada {formatDuration(seconds)} · {status}
      </div>
    </div>
  );
}
