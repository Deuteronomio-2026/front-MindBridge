import { useState } from "react";
import { Search} from "lucide-react";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const users = [
  { id: "U001", name: "Ana García", email: "ana.garcia@email.com", role: "paciente", status: "active", joined: "2025-08-14", sessions: 12 },
  { id: "U002", name: "Dra. Sofía Ramírez", email: "sofia.ramirez@mindbridge.mx", role: "psicologo", status: "active", joined: "2025-06-01", sessions: 320 },
  { id: "U003", name: "Dr. Carlos Mendez", email: "carlos.mendez@mindbridge.mx", role: "psicologo", status: "active", joined: "2025-06-15", sessions: 245 },
  { id: "U004", name: "Luis Martínez", email: "luis.mtz@email.com", role: "paciente", status: "active", joined: "2025-10-22", sessions: 5 },
  { id: "U005", name: "Carmen Vega", email: "carmen.vega@email.com", role: "paciente", status: "inactive", joined: "2025-09-10", sessions: 3 },
  { id: "U006", name: "Admin Principal", email: "admin@mindbridge.mx", role: "admin", status: "active", joined: "2025-01-01", sessions: 0 },
];

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  paciente: { label: "Paciente", color: TEAL, bg: FOG },
  psicologo: { label: "Psicólogo", color: SAGE, bg: "#E8F5F1" },
  admin: { label: "Admin", color: CORAL, bg: "#FCF0EB" },
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "Todos" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Gestión de Usuarios</h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
            {users.length} usuarios registrados en la plataforma
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border flex-1 min-w-48" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-700"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <div className="flex gap-2">
            {["Todos", "paciente", "psicologo", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="px-4 py-2.5 rounded-xl border transition-colors"
                style={{
                  background: roleFilter === r ? TEAL : "white",
                  color: roleFilter === r ? "white" : "#4a6572",
                  borderColor: roleFilter === r ? TEAL : "rgba(26,74,92,0.15)",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                {r === "Todos" ? "Todos" : roleMeta[r]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: FOG, borderBottom: "1px solid rgba(26,74,92,0.08)" }}>
                  {["Usuario", "Correo", "Rol", "Estado", "Registro", "Sesiones", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left" style={{ color: "#6a8a9a", fontWeight: 600, fontSize: "0.78rem" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const role = roleMeta[user.role];
                  return (
                    <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,74,92,0.05)" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: role.bg }}>
                            <span style={{ color: role.color, fontWeight: 700, fontSize: "0.8rem" }}>
                              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500" style={{ fontSize: "0.85rem" }}>{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full" style={{ background: role.bg, color: role.color, fontSize: "0.75rem", fontWeight: 600 }}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: user.status === "active" ? SAGE : "#94a3b8" }} />
                          <span style={{ color: user.status === "active" ? SAGE : "#94a3b8", fontSize: "0.8rem", fontWeight: 500 }}>
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400" style={{ fontSize: "0.82rem" }}>{user.joined}</td>
                      <td className="px-5 py-4" style={{ color: TEAL, fontWeight: 700, fontSize: "0.875rem" }}>{user.sessions}</td>
                      <td className="px-5 py-4">
                        <button className="px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50" style={{ borderColor: "rgba(26,74,92,0.15)", color: "#64748b", fontSize: "0.78rem" }}>
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
