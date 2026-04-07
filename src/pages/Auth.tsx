import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { authService } from "../service/authService";
import { userService } from "../service/userService";
import { jwtDecode } from "jwt-decode";
import { AxiosError } from 'axios';

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const MINT = "#A8D5C2";
const FOG = "#EEF4F7";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'PATIENT' | 'PSYCHOLOGIST';
  identificationType: string;
  identificationNumber: string;
  address: string;
}

type AuthMode = "login" | "register";

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Register states
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"PATIENT" | "PSYCHOLOGIST">("PATIENT");
  const [identificationType, setIdentificationType] = useState("CC");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      const decoded: { role: string } = jwtDecode(response.accessToken);
      const userRole = decoded.role;

      if (userRole === "PATIENT") {
        navigate("/paciente");
      } else if (userRole === "PSYCHOLOGIST") {
        navigate("/panel-psicologo");
      } else if (userRole === "ADMIN") {
        navigate("/admin");
      } else {
        setError("Rol de usuario no reconocido");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 401 || status === 500) {
          setError("Correo o contraseña incorrectos");
        } else {
          setError(err.response?.data?.message || "Error al iniciar sesión");
        }
      } else if (err instanceof Error) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const registerData: RegisterData = {
        name,
        email,
        password,
        phoneNumber,
        role,
        identificationType,
        identificationNumber,
        address,
      };

      await userService.register(registerData);
      setError("");
      alert("¡Registro exitoso! Por favor inicia sesión.");
      setAuthMode("login");
      resetRegisterForm();
    } catch (err: unknown) {
      console.error("Register error:", err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Error al registrarse");
      } else if (err instanceof Error) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetRegisterForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setRole("PATIENT");
    setIdentificationType("CC");
    setIdentificationNumber("");
    setAddress("");
    setShowRegisterPassword(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: FOG }}>
      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}>
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

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Tabs para Login/Registro */}
          <div className="flex gap-3 mb-8 p-1 rounded-xl" style={{ background: "rgba(26,74,92,0.05)" }}>
            <button
              onClick={() => { setAuthMode("login"); setError(""); }}
              className="flex-1 px-6 py-3 font-bold rounded-lg transition-all duration-300"
              style={{
                background: authMode === "login" ? TEAL : "transparent",
                color: authMode === "login" ? "white" : TEAL,
                fontSize: "0.95rem",
                boxShadow: authMode === "login" ? `0 4px 15px rgba(26,74,92,0.2)` : "none",
                transform: authMode === "login" ? "scale(1)" : "scale(0.98)"
              }}
              onMouseEnter={(e) => {
                if (authMode !== "login") {
                  e.currentTarget.style.background = "rgba(26,74,92,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (authMode !== "login") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setAuthMode("register"); setError(""); }}
              className="flex-1 px-6 py-3 font-bold rounded-lg transition-all duration-300"
              style={{
                background: authMode === "register" ? TEAL : "transparent",
                color: authMode === "register" ? "white" : TEAL,
                fontSize: "0.95rem",
                boxShadow: authMode === "register" ? `0 4px 15px rgba(26,74,92,0.2)` : "none",
                transform: authMode === "register" ? "scale(1)" : "scale(0.98)"
              }}
              onMouseEnter={(e) => {
                if (authMode !== "register") {
                  e.currentTarget.style.background = "rgba(26,74,92,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (authMode !== "register") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Regístrate
            </button>
          </div>

          {authMode === "login" ? (
            <>
              {/* FORMULARIO DE LOGIN */}
              <div className="mb-8">
                <h1 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.5rem" }}>Accede a tu cuenta</h1>
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

              <div className="mt-6 text-center">
                <p className="text-slate-600" style={{ fontSize: "0.9rem" }}>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => { setAuthMode("register"); setError(""); }}
                    className="font-semibold transition-colors"
                    style={{ color: TEAL }}
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* FORMULARIO DE REGISTRO */}
              <div className="mb-8">
                <h1 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.5rem" }}>Crea tu cuenta</h1>
                <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>
                  Completa el formulario para registrarte
                </p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Nombre completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border outline-none"
                    style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                    required
                  />
                </div>

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
                      type={showRegisterPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border outline-none"
                      style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Teléfono</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border outline-none"
                    style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Tipo de cuenta</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "PATIENT" | "PSYCHOLOGIST")}
                    className="w-full px-4 py-3.5 rounded-xl border outline-none"
                    style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                    required
                  >
                    <option value="PATIENT">Paciente</option>
                    <option value="PSYCHOLOGIST">Psicólogo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Tipo de identificación</label>
                    <select
                      value={identificationType}
                      onChange={(e) => setIdentificationType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border outline-none"
                      style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                      required
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="PP">PP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Número de identificación</label>
                    <input
                      type="text"
                      value={identificationNumber}
                      onChange={(e) => setIdentificationNumber(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border outline-none"
                      style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border outline-none"
                    style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.9rem" }}
                    required
                  />
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
                      Registrando...
                    </>
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600" style={{ fontSize: "0.9rem" }}>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => { setAuthMode("login"); setError(""); }}
                    className="font-semibold transition-colors"
                    style={{ color: TEAL }}
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
