import { Link } from "react-router";
import { Brain, Heart, Mail, Phone, MapPin } from "lucide-react";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const MINT = "#A8D5C2";
const CORAL = "#E8856A";

export function Footer() {
  return (
    <footer style={{ background: TEAL_DARK, color: "#A8BFC7" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TEAL }}>
                <Brain size={20} className="text-white" />
              </div>
              <span className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                Mind<span style={{ color: MINT }}>Bridge</span>
              </span>
            </div>
            <p className="leading-relaxed mb-6" style={{ color: "#7AA0B0", fontSize: "0.9rem" }}>
              Tu puente hacia el bienestar mental. Conectamos personas con los mejores profesionales
              de la salud mental para que puedas vivir una vida más plena y equilibrada.
            </p>
            <div className="flex items-center gap-2" style={{ color: "#7AA0B0", fontSize: "0.85rem" }}>
              <Heart size={14} style={{ color: CORAL }} />
              <span>Hecho con amor para tu bienestar</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Plataforma</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/paciente/psicologos", label: "Encontrar Psicólogo" },
                { to: "/paciente/mis-citas", label: "Mis Citas" },
                { to: "/paciente/perfil", label: "Mi Perfil" },
                { to: "/auth", label: "Cambiar rol" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors no-underline hover:text-white"
                    style={{ color: "#7AA0B0", fontSize: "0.875rem" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Contacto</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2" style={{ color: "#7AA0B0", fontSize: "0.875rem" }}>
                <Mail size={14} style={{ color: MINT }} className="flex-shrink-0" />
                <span>hola@mindbridge.mx</span>
              </li>
              <li className="flex items-center gap-2" style={{ color: "#7AA0B0", fontSize: "0.875rem" }}>
                <Phone size={14} style={{ color: MINT }} className="flex-shrink-0" />
                <span>+52 55 1234 5678</span>
              </li>
              <li className="flex items-center gap-2" style={{ color: "#7AA0B0", fontSize: "0.875rem" }}>
                <MapPin size={14} style={{ color: MINT }} className="flex-shrink-0" />
                <span>Ciudad de México, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <p style={{ color: "#5a7a8a", fontSize: "0.8rem" }}>
            © 2026 MindBridge. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {["Privacidad", "Términos", "Cookies"].map((item) => (
              <span
                key={item}
                className="cursor-pointer transition-colors hover:text-white"
                style={{ color: "#5a7a8a", fontSize: "0.8rem" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
