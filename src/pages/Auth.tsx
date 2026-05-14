import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Eye, EyeOff, Check, ArrowRight, Loader } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
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

type AuthMode = "login" | "register" | "google-role-select";

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

  // Google Auth states
  const [googleSelectedRole, setGoogleSelectedRole] = useState<"PATIENT" | "PSYCHOLOGIST" | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      if (!googleSelectedRole) {
        setError("Por favor selecciona un rol");
        return;
      }

      setGoogleLoading(true);
      try {
        const response = await authService.googleLogin({
          code: codeResponse.code,
          role: googleSelectedRole
        });

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        if (googleSelectedRole === "PATIENT") {
          navigate("/paciente");
        } else if (googleSelectedRole === "PSYCHOLOGIST") {
          navigate("/panel-psicologo");
        }
      } catch (err: unknown) {
        console.error("Google login error:", err);
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Error al autenticar con Google");
        } else if (err instanceof Error) {
          setError("No se pudo conectar con el servidor. Verifica tu conexión.");
        } else {
          setError("Error inesperado. Intenta de nuevo.");
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    flow: 'auth-code'
  });

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

              {/* Google Login Section */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(26,74,92,0.15)" }} />
                <span className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>O continúa con</span>
                <div className="flex-1 h-px" style={{ background: "rgba(26,74,92,0.15)" }} />
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(26,74,92,0.05)" }}>
                <p className="text-slate-700 mb-3 text-sm" style={{ fontWeight: 600 }}>Selecciona tu rol:</p>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setGoogleSelectedRole("PATIENT")}
                    className="flex-1 px-4 py-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: googleSelectedRole === "PATIENT" ? TEAL : "rgba(26,74,92,0.2)",
                      background: googleSelectedRole === "PATIENT" ? "rgba(26,74,92,0.1)" : "white",
                      color: googleSelectedRole === "PATIENT" ? TEAL : "text-slate-600",
                      fontWeight: googleSelectedRole === "PATIENT" ? 600 : 500
                    }}
                  >
                    Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleSelectedRole("PSYCHOLOGIST")}
                    className="flex-1 px-4 py-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: googleSelectedRole === "PSYCHOLOGIST" ? TEAL : "rgba(26,74,92,0.2)",
                      background: googleSelectedRole === "PSYCHOLOGIST" ? "rgba(26,74,92,0.1)" : "white",
                      color: googleSelectedRole === "PSYCHOLOGIST" ? TEAL : "text-slate-600",
                      fontWeight: googleSelectedRole === "PSYCHOLOGIST" ? 600 : 500
                    }}
                  >
                    Psicólogo
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={!googleSelectedRole || googleLoading}
                  className="w-full px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: !googleSelectedRole || googleLoading ? "#cbd5e1" : TEAL,
                    fontWeight: 600,
                    opacity: !googleSelectedRole || googleLoading ? 0.6 : 1
                  }}
                >
                  {googleLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </button>
              </div>

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
