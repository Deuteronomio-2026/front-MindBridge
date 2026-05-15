import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {
  Brain, LayoutDashboard, Users, FileText, Bell, ChevronDown,
  LogOut, Menu, X, Calendar, Shield, BarChart3, Tag
} from "lucide-react";
import { useRealUser } from "../../hooks/useRealUser";
import { notificationService, type Notification } from "../../service/notificationService";

const TEAL = "#1A4A5C";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/admin/logs", label: "Logs", icon: FileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
  { href: "/admin/sesiones-grupales", label: "Sesiones Grupales", icon: Calendar },
];

export default function AdminRoot() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useRealUser(); // Obtener perfil (incluye id del admin)

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetching, setFetching] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  // Cargar notificaciones reales del administrador
  useEffect(() => {
    if (!profile?.id) return;

    const fetchNotifications = async () => {
      if (fetching) return;
      setFetching(true);
      try {
        const data = await notificationService.getNotifications(profile.id);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Error fetching admin notifications:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling cada 30s
    return () => clearInterval(interval);
  }, [profile?.id]);

  const handleMarkAllAsRead = async () => {
    if (!profile?.id) return;
    try {
      await notificationService.markAllAsRead(profile.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: FOG }}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-sm border-b shadow-sm" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: TEAL }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Mind<span style={{ color: TEAL }}>Bridge</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-white" style={{ background: CORAL, fontSize: "0.65rem", fontWeight: 700 }}>
                  ADMIN
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
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

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notificaciones reales */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all"
                  style={{ borderColor: "rgba(26,74,92,0.15)" }}
                >
                  <Bell size={17} style={{ color: TEAL }} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white"
                      style={{ background: CORAL, fontSize: "0.6rem", fontWeight: 700 }}
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
                        <button
                          onClick={handleMarkAllAsRead}
                          className="px-2 py-0.5 rounded-full text-white text-xs"
                          style={{ background: CORAL }}
                        >
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-slate-500 text-sm">No tienes notificaciones</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: n.read ? "#cbd5e1" : CORAL }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 text-sm font-medium">{n.title}</p>
                            <p className="text-slate-500 text-xs">{n.message}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Perfil */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                  style={{ borderColor: "rgba(26,74,92,0.2)" }}
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FCF0EB" }}>
                    <Shield size={14} style={{ color: CORAL }} />
                  </div>
                  <span className="hidden sm:block" style={{ color: "#2d4a5a", fontSize: "0.875rem", fontWeight: 500 }}>
                    {loading ? "Cargando..." : "Admin"}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                    <button
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors"
                      style={{ fontSize: "0.875rem", color: "#4a6572" }}
                      onClick={() => navigate("/auth")}
                    >
                      <LogOut size={15} className="text-slate-400" /> Salir
                    </button>
                  </div>
                )}
              </div>

              {/* Botón menú móvil */}
              <button className="md:hidden p-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-1" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 rounded-xl no-underline flex items-center gap-2"
                  style={{
                    background: isActive(link.href, link.exact) ? FOG : "transparent",
                    color: isActive(link.href, link.exact) ? TEAL : "#4a6572",
                    fontWeight: 500,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Fondo para cerrar modales */}
        {(profileOpen || notifOpen) && (
          <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setNotifOpen(false); }} />
        )}
      </nav>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}