import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Brain, Calendar, User, Menu, X, ChevronDown, Bell, LogOut } from "lucide-react";
import { useUser } from "../hooks/useUser";

const TEAL = "#1A4A5C";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const SAGE = "#4E8B7A";

const mockNotifications = [
  { id: 1, text: "Cita con Dr. Carlos Mendez en 2 días", time: "hace 1h", read: false, type: "appointment" },
  { id: 2, text: "Tu sesión fue confirmada exitosamente", time: "hace 3h", read: false, type: "success" },
  { id: 3, text: "Recuerda completar tu perfil", time: "ayer", read: true, type: "info" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: "/paciente", label: "Inicio" },
    { href: "/paciente/psicologos", label: "Psicólogos" },
    { href: "/paciente/mis-citas", label: "Mis Citas" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-sm border-b shadow-sm" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/paciente" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: TEAL }}>
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem", fontFamily: "'Inter', sans-serif" }}>
              Mind<span style={{ color: TEAL }}>Bridge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 rounded-lg transition-colors no-underline"
                style={{
                  background: isActive(link.href) ? "#EEF4F7" : "transparent",
                  color: isActive(link.href) ? TEAL : "#4a6572",
                  fontWeight: isActive(link.href) ? 600 : 500,
                  fontSize: "0.9rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all hover:shadow-sm"
                style={{ borderColor: "rgba(26,74,92,0.15)", background: notifOpen ? FOG : "white" }}
              >
                <Bell size={17} style={{ color: TEAL }} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center rounded-full text-white"
                    style={{ background: CORAL, fontSize: "0.6rem", fontWeight: 700, width: 17, height: 17 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border py-2 z-50" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                  <div className="flex items-center justify-between px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.875rem", color: TEAL }}>Notificaciones</p>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-white" style={{ background: CORAL, fontSize: "0.7rem", fontWeight: 700 }}>
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: n.read ? "#cbd5e1" : CORAL }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700" style={{ fontSize: "0.8rem", fontWeight: n.read ? 400 : 600 }}>
                          {n.text}
                        </p>
                        <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t mt-1 pt-2 px-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                    <button
                      className="w-full py-2 text-center rounded-lg transition-colors"
                      style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE }}
                      onClick={() => setNotifOpen(false)}
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar quick link */}
            <button
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ color: "#4a6572" }}
              onClick={() => navigate("/paciente/mis-citas")}
            >
              <Calendar size={16} />
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Citas</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                style={{ borderColor: "rgba(26,74,92,0.2)", background: profileOpen ? FOG : "white" }}
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "#C8DDE8" }}>
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: TEAL, fontSize: "0.75rem", fontWeight: 700 }}>
                      {profile.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block max-w-24 truncate" style={{ color: "#2d4a5a", fontSize: "0.875rem", fontWeight: 500 }}>
                  {profile.name.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border py-2 z-50" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                    <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{profile.name}</p>
                    <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>Paciente</p>
                  </div>
                  <button
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors hover:bg-slate-50"
                    style={{ fontSize: "0.875rem", color: "#4a6572" }}
                    onClick={() => { navigate("/paciente/perfil"); setProfileOpen(false); }}
                  >
                    <User size={15} style={{ color: TEAL }} />
                    Mi Perfil
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors hover:bg-slate-50"
                    style={{ fontSize: "0.875rem", color: "#4a6572" }}
                    onClick={() => { navigate("/paciente/mis-citas"); setProfileOpen(false); }}
                  >
                    <Calendar size={15} style={{ color: SAGE }} />
                    Mis Citas
                  </button>
                  <div className="border-t my-1" style={{ borderColor: "rgba(26,74,92,0.08)" }} />
                  <button
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors hover:bg-slate-50"
                    style={{ fontSize: "0.875rem", color: "#4a6572" }}
                    onClick={() => { navigate("/auth"); setProfileOpen(false); }}
                  >
                    <LogOut size={15} className="text-slate-400" />
                    Cambiar rol
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-slate-50"
              style={{ color: TEAL }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-1" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-3 rounded-xl no-underline block"
              style={{
                background: isActive(link.href) ? FOG : "transparent",
                color: isActive(link.href) ? TEAL : "#4a6572",
                fontWeight: 500,
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/paciente/perfil"
            className="px-4 py-3 rounded-xl no-underline flex items-center gap-2"
            style={{ color: "#4a6572", fontWeight: 500 }}
            onClick={() => setMobileOpen(false)}
          >
            <User size={16} />
            Mi Perfil
          </Link>
          <Link
            to="/auth"
            className="px-4 py-3 rounded-xl no-underline flex items-center gap-2"
            style={{ color: "#4a6572", fontWeight: 500 }}
            onClick={() => setMobileOpen(false)}
          >
            <LogOut size={16} />
            Cambiar rol
          </Link>
        </div>
      )}

      {/* Backdrop */}
      {(profileOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setNotifOpen(false); }} />
      )}
    </nav>
  );
}
