import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Stethoscope, Shield, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const SAND = "#F5EDD8";
const MINT = "#A8D5C2";

const roles = [
  {
    key: "paciente",
    icon: User,
    title: "Paciente",
    desc: "Busca psicólogos, reserva sesiones y gestiona tu bienestar mental.",
    features: ["Buscar y filtrar psicólogos", "Reservar sesiones", "Chat y videollamada integrados", "Historial de citas"],
    path: "/",
    color: TEAL,
    bg: FOG,
    accent: "#EAF2F5",
  },
  {
    key: "psicologo",
    icon: Stethoscope,
    title: "Psicólogo",
    desc: "Administra tu agenda, atiende pacientes y organiza tus sesiones.",
    features: ["Gestión de agenda", "Historial de pacientes", "Sesiones integradas", "Perfil profesional"],
    path: "/panel-psicologo",
    color: SAGE,
    bg: "#E8F5F1",
    accent: "#C8E8DF",
  },
  {
    key: "admin",
    icon: Shield,
    title: "Administrador",
    desc: "Monitorea la plataforma, revisa métricas y gestiona usuarios.",
    features: ["Dashboard de métricas", "KPIs de negocio", "Logs de eventos", "Monitoreo en tiempo real"],
    path: "/admin",
    color: CORAL,
    bg: "#FCF0EB",
    accent: "#F9D9CF",
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "login">("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.key);
    setMode("login");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find((r) => r.key === selectedRole);
    if (!role) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(role.path);
    }, 1200);
  };

  const selectedRoleData = roles.find((r) => r.key === selectedRole);

  return (
    <div className="min-h-screen flex" style={{ background: FOG }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}
      >
        {/* BG decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(40%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(-30%, 30%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Brain size={24} className="text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>MindBridge</span>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "2.2rem", lineHeight: 1.2 }}>
            Tu bienestar mental,<br />
            <span style={{ color: MINT }}>siempre accesible.</span>
          </h2>
          <p style={{ color: "rgba(168,213,194,0.85)", fontSize: "1rem", lineHeight: 1.7 }}>
            La plataforma integral de telemedicina que conecta pacientes con psicólogos certificados a través de videollamadas, presencial o chat.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {[
              "500+ psicólogos certificados",
              "Sesiones en tiempo real integradas",
              "Agenda inteligente de disponibilidad",
              "100% confidencial y seguro",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,213,194,0.2)" }}>
                  <Check size={13} style={{ color: MINT }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
          © 2026 MindBridge. Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TEAL }}>
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.3rem" }}>MindBridge</span>
          </div>

          {mode === "select" ? (
            <>
              <div className="mb-8">
                <h1 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.8rem" }}>
                  Bienvenido/a
                </h1>
                <p className="text-slate-500" style={{ fontSize: "1rem" }}>
                  Selecciona tu rol para continuar
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.key}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group"
                      style={{ borderColor: "rgba(26,74,92,0.12)", background: "white" }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: role.bg, width: 52, height: 52 }}
                        >
                          <Icon size={24} style={{ color: role.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{role.title}</p>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                          <p className="text-slate-500 mb-3" style={{ fontSize: "0.85rem" }}>{role.desc}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {role.features.map((f) => (
                              <span
                                key={f}
                                className="px-2 py-0.5 rounded-full"
                                style={{ background: role.accent, color: role.color, fontSize: "0.72rem", fontWeight: 500 }}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-center mt-6" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Demo interactiva · No requiere credenciales reales
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode("select")}
                className="flex items-center gap-2 mb-6 transition-colors"
                style={{ color: TEAL, fontSize: "0.875rem", fontWeight: 500 }}
              >
                ← Cambiar rol
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  {selectedRoleData && (
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: selectedRoleData.bg }}
                    >
                      <selectedRoleData.icon size={22} style={{ color: selectedRoleData.color }} />
                    </div>
                  )}
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Entrando como</p>
                    <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
                      {selectedRoleData?.title}
                    </h1>
                  </div>
                </div>
                <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>
                  Ingresa tus credenciales para acceder a la plataforma
                </p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`usuario@mindbridge.mx`}
                    className="w-full px-4 py-3.5 rounded-xl border outline-none transition-colors"
                    style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border outline-none transition-colors"
                      style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-slate-400" />
                      ) : (
                        <Eye size={18} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center" style={{ borderColor: "rgba(26,74,92,0.3)" }} />
                    <span style={{ color: "#6a8a9a", fontSize: "0.85rem" }}>Recordarme</span>
                  </label>
                  <button type="button" style={{ color: TEAL, fontSize: "0.85rem", fontWeight: 500 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all mt-2"
                  style={{
                    background: loading ? "#94a3b8" : (selectedRoleData?.color || TEAL),
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar como {selectedRoleData?.title}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center" style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  Demo: cualquier correo y contraseña funcionan
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
