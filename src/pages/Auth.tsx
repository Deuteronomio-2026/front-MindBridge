import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Shield, Users, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { authService } from "../service/authService";
import { jwtDecode } from "jwt-decode";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

type LoginType = "admin" | "user" | null;

export default function Auth() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si se selecciona Administrador, redirigir directamente
  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      const decoded: { role: string } = jwtDecode(response.accessToken);
      const role = decoded.role;

      if (role === "PATIENT") {
        navigate("/paciente");
      } else if (role === "PSYCHOLOGIST") {
        navigate("/panel-psicologo");
      } else {
        setError("Rol de usuario no reconocido");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 500) {
          setError("Correo o contraseña incorrectos");
        } else {
          setError(err.response.data?.message || "Error al iniciar sesión");
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de selección de tipo de cuenta
  if (!loginType) {
    return (
      <div className="min-h-screen flex" style={{ background: FOG }}>
        <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}>
          {/* ... panel izquierdo igual ... */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Brain size={24} className="text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>MindBridge</span>
          </div>
          <div>
            <h2 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "2.2rem", lineHeight: 1.2 }}>
              Tu bienestar mental,<br />
              <span style={{ color: MINT }}>siempre accesible.</span>
            </h2>
            <p style={{ color: "rgba(168,213,194,0.85)", fontSize: "1rem", lineHeight: 1.7 }}>
              La plataforma integral de telemedicina que conecta pacientes con psicólogos certificados.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {["500+ psicólogos certificados", "Sesiones en tiempo real integradas", "Agenda inteligente", "100% confidencial"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,213,194,0.2)" }}>
                    <Check size={13} style={{ color: MINT }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>© 2026 MindBridge. Todos los derechos reservados.</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TEAL }}>
                <Brain size={20} className="text-white" />
              </div>
              <span className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.3rem" }}>MindBridge</span>
            </div>
            <div className="mb-8">
              <h1 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Bienvenido/a</h1>
              <p className="text-slate-500" style={{ fontSize: "1rem" }}>Selecciona tu tipo de cuenta</p>
            </div>
            <div className="flex flex-col gap-4">
              {/* Botón Administrador: redirige directamente */}
              <button
                onClick={handleAdminClick}
                className="w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group"
                style={{ borderColor: "rgba(26,74,92,0.12)", background: "white" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FCF0EB", width: 52, height: 52 }}>
                    <Shield size={24} style={{ color: CORAL }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Administrador</p>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                    <p className="text-slate-500" style={{ fontSize: "0.85rem" }}>Accede al panel de control, métricas y gestión de la plataforma.</p>
                  </div>
                </div>
              </button>

              {/* Botón Usuario: muestra formulario de login */}
              <button
                onClick={() => setLoginType("user")}
                className="w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group"
                style={{ borderColor: "rgba(26,74,92,0.12)", background: "white" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAF2F5", width: 52, height: 52 }}>
                    <Users size={24} style={{ color: TEAL }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Paciente / Psicólogo</p>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                    <p className="text-slate-500" style={{ fontSize: "0.85rem" }}>Accede a tu agenda, reserva sesiones o gestiona tu práctica profesional.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de login para Usuario (Paciente/Psicólogo)
  return (
    <div className="min-h-screen flex" style={{ background: FOG }}>
      {/* Panel izquierdo (mismo contenido decorativo) */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}>
        {/* ... mismo contenido ... */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Brain size={24} className="text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>MindBridge</span>
        </div>
        <div>
          <h2 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "2.2rem", lineHeight: 1.2 }}>
            Tu bienestar mental,<br />
            <span style={{ color: MINT }}>siempre accesible.</span>
          </h2>
          <p style={{ color: "rgba(168,213,194,0.85)", fontSize: "1rem", lineHeight: 1.7 }}>
            La plataforma integral de telemedicina que conecta pacientes con psicólogos certificados.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {["500+ psicólogos certificados", "Sesiones en tiempo real integradas", "Agenda inteligente", "100% confidencial"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,213,194,0.2)" }}>
                  <Check size={13} style={{ color: MINT }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>© 2026 MindBridge. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho - formulario de login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <button
            onClick={() => setLoginType(null)}
            className="flex items-center gap-2 mb-6 transition-colors"
            style={{ color: TEAL, fontSize: "0.875rem", fontWeight: 500 }}
          >
            ← Volver a seleccionar tipo
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#EAF2F5" }}>
                <Users size={22} style={{ color: TEAL }} />
              </div>
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Iniciar sesión como</p>
                <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.5rem" }}>Paciente / Psicólogo</h1>
              </div>
            </div>
            <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border outline-none"
                  style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{ background: loading ? "#94a3b8" : TEAL, fontWeight: 700, fontSize: "1rem" }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}