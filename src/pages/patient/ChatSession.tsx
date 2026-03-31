import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Send, Video, Mic, MicOff, VideoOff, Phone, Smile,
  Paperclip, MoreVertical, Clock, CheckCheck, MessageCircle, Users
} from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { psychologists } from "../../data/psychologists";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

interface Message {
  id: string;
  sender: "user" | "psychologist";
  text: string;
  time: string;
  read: boolean;
}

const initialMessages: Message[] = [
  {
    id: "m1",
    sender: "psychologist",
    text: "¡Hola! Bienvenido/a a nuestra sesión. Estoy aquí para escucharte. ¿Cómo te has sentido esta semana?",
    time: "10:02",
    read: true,
  },
  {
    id: "m2",
    sender: "user",
    text: "Hola Dra. Ramírez. La verdad, esta semana ha sido bastante difícil. He tenido mucha ansiedad con el trabajo.",
    time: "10:04",
    read: true,
  },
  {
    id: "m3",
    sender: "psychologist",
    text: "Entiendo. La ansiedad laboral es muy común. Cuéntame más sobre esas situaciones que te generan ansiedad. ¿Hay algo en particular que esté pasando en tu trabajo?",
    time: "10:05",
    read: true,
  },
  {
    id: "m4",
    sender: "user",
    text: "Principalmente es la carga de trabajo. Siento que nunca termino todo lo que me piden y eso me genera mucha presión.",
    time: "10:07",
    read: true,
  },
  {
    id: "m5",
    sender: "psychologist",
    text: "Es una sensación muy válida. La sobrecarga de trabajo puede ser agotadora tanto física como emocionalmente. ¿Has podido practicar las técnicas de respiración que vimos en la sesión anterior?",
    time: "10:08",
    read: true,
  },
];

const autoReplies = [
  "Entiendo lo que me estás diciendo. Eso es completamente normal y válido.",
  "¿Y cómo te hace sentir eso cuando sucede?",
  "Muy bien. Sigamos explorando eso juntos.",
  "Recuerda que estoy aquí para ayudarte en este proceso.",
  "Es un gran avance que puedas reconocer esos sentimientos.",
  "¿Qué crees tú que podría ayudarte en esa situación?",
];

export default function ChatSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, profile } = useUser();

  const appointment = appointments.find((a) => a.id === id);
  const psychologist = appointment
    ? psychologists.find((p) => p.id === appointment.psychologistId)
    : null;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isVideoMode, setIsVideoMode] = useState(appointment?.modality === "video");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyIndexRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => setSessionTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      time: getNow(),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate psychologist typing and reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: `m-reply-${Date.now()}`,
        sender: "psychologist",
        text: autoReplies[replyIndexRef.current % autoReplies.length],
        time: getNow(),
        read: false,
      };
      replyIndexRef.current++;
      setMessages((prev) => [...prev, reply]);
    }, 1800 + Math.random() * 1200);
  };

  const psychName = appointment?.psychologistName || "Dra. Sofía Ramírez";
  const psychPhoto = appointment?.psychologistPhoto || psychologist?.photo || "";

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#0D1B22", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b z-10"
        style={{ background: TEAL, borderColor: "rgba(168,213,194,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="relative">
            {psychPhoto ? (
              <img src={psychPhoto} alt={psychName} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <span className="text-white" style={{ fontWeight: 700 }}>{psychName.charAt(0)}</span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-teal-800 animate-pulse" style={{ background: SAGE }} />
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{psychName}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MINT }} />
              <p style={{ color: MINT, fontSize: "0.75rem" }}>En sesión · {formatTime(sessionTime)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch between video/chat */}
          <button
            onClick={() => setIsVideoMode(!isVideoMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.12)", fontSize: "0.78rem", fontWeight: 600 }}
          >
            {isVideoMode ? <MessageCircle size={15} /> : <Video size={15} />}
            {isVideoMode ? "Solo chat" : "Videollamada"}
          </button>
          <button className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
            <MoreVertical size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video panel (left side when in video mode) */}
        {isVideoMode && (
          <div
            className="flex flex-col"
            style={{ width: "55%", background: "#0A1520", flexShrink: 0, position: "relative" }}
          >
            {/* Main video (psychologist) */}
            <div className="flex-1 relative flex items-center justify-center">
              {psychPhoto ? (
                <img
                  src={psychPhoto}
                  alt={psychName}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.8)" }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Users size={40} className="text-white/50" />
                  </div>
                  <p className="text-white/50">Cámara desactivada</p>
                </div>
              )}

              {/* Psychologist name overlay */}
              <div
                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              >
                <p className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{psychName}</p>
              </div>

              {/* My video (PiP) */}
              <div
                className="absolute top-4 right-4 w-32 h-20 rounded-xl overflow-hidden border-2 border-white/20 cursor-pointer"
                style={{ background: "#1a2e38" }}
              >
                {cameraOn ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: TEAL }}>
                    <span className="text-white" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
                      {profile.name.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <VideoOff size={20} className="text-white/40" />
                  </div>
                )}
                <div className="absolute bottom-1 left-2">
                  <p className="text-white" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Tú</p>
                </div>
              </div>
            </div>

            {/* Video controls */}
            <div
              className="flex items-center justify-center gap-4 py-4 px-6 flex-shrink-0"
              style={{ background: "#0D1B22" }}
            >
              <button
                onClick={() => setMicOn(!micOn)}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: micOn ? "rgba(255,255,255,0.12)" : CORAL }}
              >
                {micOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
              </button>
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: cameraOn ? "rgba(255,255,255,0.12)" : CORAL }}
              >
                {cameraOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg"
                style={{ background: "#EF4444" }}
              >
                <Phone size={22} className="text-white" style={{ transform: "rotate(135deg)" }} />
              </button>
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <MoreVertical size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Chat panel */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#0F1F28" }}>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
            {/* Date separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>Hoy · Sesión en curso</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "psychologist" && (
                  <div className="flex-shrink-0">
                    {psychPhoto ? (
                      <img src={psychPhoto} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: SAGE }}>
                        <span className="text-white" style={{ fontSize: "0.65rem", fontWeight: 700 }}>P</span>
                      </div>
                    )}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-sm ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div
                    className="px-4 py-2.5 rounded-2xl"
                    style={{
                      background: msg.sender === "user" ? TEAL : "rgba(255,255,255,0.08)",
                      borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    <p style={{ color: "white", fontSize: "0.875rem", lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>{msg.time}</span>
                    {msg.sender === "user" && (
                      <CheckCheck size={12} style={{ color: MINT }} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                {psychPhoto ? (
                  <img src={psychPhoto} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: SAGE }} />
                )}
                <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px" }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "rgba(255,255,255,0.4)", animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {["¿Podría explicarme más?", "Entiendo, continúa", "Necesito un momento"].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div
            className="flex items-center gap-3 px-4 py-4 border-t flex-shrink-0"
            style={{ background: "#0D1B22", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <button className="flex-shrink-0">
              <Smile size={22} style={{ color: "rgba(255,255,255,0.35)" }} />
            </button>
            <button className="flex-shrink-0">
              <Paperclip size={22} style={{ color: "rgba(255,255,255,0.35)" }} />
            </button>
            <div
              className="flex-1 flex items-center rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: "white", fontSize: "0.9rem" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              style={{ background: input.trim() ? SAGE : "rgba(255,255,255,0.1)" }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
