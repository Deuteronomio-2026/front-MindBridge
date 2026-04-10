import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {
  Brain, Calendar, User, Menu, X, LayoutDashboard, CalendarDays, Edit,
  Bell, ChevronDown, LogOut, Settings, Sparkles
} from "lucide-react";
import { UserProvider } from "../../context/UserProvider";
import { useRealUser } from "../../hooks/useRealUser";
import { useEventNotifications } from "../../context/EventNotificationContext";
import { featureFlags } from "../../config/featureFlags";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";


const mockNotifications = [
  { id: 1, text: "Nueva cita reservada con Ana García", time: "hace 20 min", read: false },
  { id: 2, text: "Recordatorio: sesión con Luis M. en 1 hora", time: "hace 1h", read: false },
  { id: 3, text: "Ricardo F. canceló su cita del jueves", time: "hace 3h", read: true },
];

const toRelativeTime = (isoDate: string): string => {
  const now = Date.now();
  const created = new Date(isoDate).getTime();
  const diffMs = Math.max(now - created, 0);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
};

const navLinks = [
  { href: "/panel-psicologo", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/panel-psicologo/citas", label: "Mis Citas", icon: Calendar },
  { href: "/panel-psicologo/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/panel-psicologo/agenda/editar", label: "Editar Agenda", icon: Edit },
  { href: "/panel-psicologo/perfil", label: "Mi Perfil", icon: User },
  { href: "/panel-psicologo/ofertas", label: "Ofertas", icon: Sparkles },
];

export default function PsychRoot() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useRealUser();
  const {
    notifications: eventNotifications,
    unreadCount: eventUnreadCount,
    markAllAsRead,
  } = useEventNotifications();

  const notifications = featureFlags.eventNotifications
    ? eventNotifications.map((item) => ({
        id: item.id,
        text: item.message || item.title,
        time: toRelativeTime(item.createdAt),
        read: item.read,
      }))
    : mockNotifications;

  const unreadCount = featureFlags.eventNotifications
    ? eventUnreadCount
    : mockNotifications.filter((n) => !n.read).length;
  const fullName = profile ? `${profile.name} ${profile.lastName || ""}`.trim() : "Usuario";
  const displayName = fullName.split(" ")[0] || "Usuario";
  const displayInitial = fullName.charAt(0).toUpperCase() || "U";

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <UserProvider>
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: FOG }}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-sm border-b shadow-sm" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/panel-psicologo" className="flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: TEAL }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Mind<span style={{ color: TEAL }}>Bridge</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-white" style={{ background: SAGE, fontSize: "0.65rem", fontWeight: 700 }}>
                  PSICÓLOGO
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-2 rounded-lg transition-colors no-underline flex items-center gap-2"
                    style={{
                      background: isActive(link.href, link.exact) ? "#EEF4F7" : "transparent",
                      color: isActive(link.href, link.exact) ? TEAL : "#4a6572",
                      fontWeight: isActive(link.href, link.exact) ? 600 : 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all"
                  style={{ borderColor: "rgba(26,74,92,0.15)" }}
                >
                  <Bell size={17} style={{ color: TEAL }} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white" style={{ background: CORAL, fontSize: "0.6rem", fontWeight: 700 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border py-2 z-50" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                    <div className="flex items-center justify-between px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.875rem", color: TEAL }}>Notificaciones</p>
                    </div>
                    {notifications.length === 0 && (
                      <div className="px-4 py-6 text-center text-slate-400" style={{ fontSize: "0.8rem" }}>
                        No tienes notificaciones.
                      </div>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? "#cbd5e1" : CORAL }} />
                        <div>
                          <p className="text-slate-700" style={{ fontSize: "0.8rem", fontWeight: n.read ? 400 : 600 }}>{n.text}</p>
                          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                    {featureFlags.eventNotifications && notifications.length > 0 && (
                      <div className="px-4 pt-2 pb-1 border-t" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                        <button
                          className="w-full py-2 rounded-lg"
                          style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE }}
                          onClick={() => {
                            markAllAsRead();
                            setNotifOpen(false);
                          }}
                        >
                          Marcar como leídas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                  style={{ borderColor: "rgba(26,74,92,0.2)" }}
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#C8E8DF" }}>
                    <span style={{ color: SAGE, fontSize: "0.75rem", fontWeight: 700 }}>{loading ? "..." : displayInitial}</span>
                  </div>
                  <span className="hidden sm:block" style={{ color: "#2d4a5a", fontSize: "0.875rem", fontWeight: 500 }}>{loading ? "Cargando..." : displayName}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                    <button className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors" style={{ fontSize: "0.875rem", color: "#4a6572" }}
                      onClick={() => { navigate("/panel-psicologo/perfil"); setProfileOpen(false); }}>
                      <User size={15} style={{ color: TEAL }} /> Mi Perfil
                    </button>
                    <button className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors" style={{ fontSize: "0.875rem", color: "#4a6572" }}>
                      <Settings size={15} style={{ color: SAGE }} /> Configuración
                    </button>
                    <div className="border-t my-1" style={{ borderColor: "rgba(26,74,92,0.08)" }} />
                    <button className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors" style={{ fontSize: "0.875rem", color: "#4a6572" }}
                      onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        navigate("/auth");
                      }}>
                      <LogOut size={15} className="text-slate-400" /> Salir
                    </button>
                  </div>
                )}
              </div>

              <button className="md:hidden p-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-1" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}
                  className="px-4 py-3 rounded-xl no-underline flex items-center gap-2"
                  style={{ background: isActive(link.href, link.exact) ? FOG : "transparent", color: isActive(link.href, link.exact) ? TEAL : "#4a6572", fontWeight: 500 }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {(profileOpen || notifOpen) && (
          <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setNotifOpen(false); }} />
        )}
      </nav>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
    </UserProvider>
  );
}