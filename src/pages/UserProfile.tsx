import { useState, useRef, useEffect } from "react";
import { Camera, Save, User, Mail, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { useRealUser } from "../hooks/useRealUser";
import type { Psychologist, Patient } from "../types/user";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";

export default function UserProfile() {
  const { profile, loading, error: fetchError, updateProfile, refetch, role } = useRealUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [specialization, setSpecialization] = useState(""); // Nuevo campo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      const fullName = profile.name + (profile.lastName ? ` ${profile.lastName}` : "");
      setName(fullName);
      setEmail(profile.email);
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
      
      if (role === 'PSYCHOLOGIST') {
        const p = profile as Psychologist;
        setBio(p.biography || "");
        setSpecialization(p.specialization || "");
      } else {
        setBio("");
        setSpecialization("");
      }
      
      setPhotoPreview(null);
    }
  }, [profile, role]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "La imagen debe ser menor a 5MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
      setErrors((prev) => { const e = { ...prev }; delete e.photo; return e; });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "El nombre es requerido";
    if (name.trim().length < 2) newErrors.name = "El nombre debe tener al menos 2 caracteres";
    if (!email.trim()) newErrors.email = "El correo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Ingresa un correo válido";
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const updates: Partial<Patient | Psychologist> = {
        name: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      };

      if (role === 'PSYCHOLOGIST') {
        const psychUpdates = updates as Partial<Psychologist>;
        psychUpdates.biography = bio;
        psychUpdates.specialization = specialization;
      }

      await updateProfile(updates);
      setSaved(true);
      setErrors({});
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setErrors({ general: "Error al guardar los cambios. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="text-center text-red-500">
          <p>{fetchError}</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <p>No se encontró perfil. Inicia sesión nuevamente.</p>
      </div>
    );
  }

  const isPsychologist = role === 'PSYCHOLOGIST';

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "2rem" }}>Mi Perfil</h1>
          <p className="mt-1" style={{ color: "#A8D5C2", fontSize: "0.95rem" }}>
            Personaliza tu información personal
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border" style={{ background: "#E8F5F1", borderColor: "#A8D5C2" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#C8E8DF" }}>
              <Check size={16} style={{ color: SAGE }} />
            </div>
            <p style={{ color: SAGE, fontWeight: 600, fontSize: "0.875rem" }}>
              ¡Perfil actualizado exitosamente!
            </p>
          </div>
        )}

        {errors.general && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-600" style={{ fontSize: "0.875rem" }}>{errors.general}</p>
          </div>
        )}

        {/* Foto de perfil (placeholder) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-5" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Foto de perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "#EAF2F5" }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ color: TEAL, fontWeight: 700, fontSize: "2rem" }}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ background: TEAL }}>
                <Camera size={14} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <p className="text-slate-700 mb-1" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Subir nueva foto</p>
              <p className="text-slate-400 mb-3" style={{ fontSize: "0.8rem" }}>JPG, PNG o GIF. Máximo 5MB.</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg border" style={{ borderColor: "rgba(26,74,92,0.3)", color: TEAL, fontSize: "0.825rem", fontWeight: 600 }}>
                Elegir archivo
              </button>
              {photoPreview && (
                <button onClick={() => setPhotoPreview(null)} className="ml-2 px-4 py-2 border rounded-lg" style={{ borderColor: "#e2e8f0", color: "#94a3b8", fontSize: "0.825rem" }}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
          {errors.photo && <p className="flex items-center gap-1.5 mt-3 text-red-500 text-sm"><AlertCircle size={13} />{errors.photo}</p>}
        </div>

        {/* Información personal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-5" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Información personal</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-2 text-slate-700 mb-2"><User size={15} style={{ color: TEAL }} />Nombre completo</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((prev) => { const e = { ...prev }; delete e.name; return e; }); }} className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: errors.name ? "#FCA5A5" : "rgba(26,74,92,0.2)", background: errors.name ? "#FEF2F2" : "#F8FAFB", fontSize: "0.9rem" }} />
              {errors.name && <p className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs"><AlertCircle size={12} />{errors.name}</p>}
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-700 mb-2"><Mail size={15} style={{ color: TEAL }} />Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((prev) => { const e = { ...prev }; delete e.email; return e; }); }} className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: errors.email ? "#FCA5A5" : "rgba(26,74,92,0.2)", background: errors.email ? "#FEF2F2" : "#F8FAFB", fontSize: "0.9rem" }} />
              {errors.email && <p className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs"><AlertCircle size={12} />{errors.email}</p>}
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-700 mb-2">Teléfono</label>
              <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: "rgba(26,74,92,0.2)", background: "#F8FAFB", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-700 mb-2">Dirección</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: "rgba(26,74,92,0.2)", background: "#F8FAFB", fontSize: "0.9rem" }} />
            </div>
            {isPsychologist && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-slate-700 mb-2">Especialidad</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{ borderColor: "rgba(26,74,92,0.2)", background: "#F8FAFB", fontSize: "0.9rem" }}
                    placeholder="Ej: Psicología Clínica, Terapia Cognitivo-Conductual..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-slate-700 mb-2"><FileText size={15} style={{ color: TEAL }} />Descripción personal</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border outline-none resize-none" style={{ borderColor: "rgba(26,74,92,0.2)", background: "#F8FAFB", fontSize: "0.9rem" }} maxLength={500} />
                  <div className="flex justify-end mt-1"><span className="text-slate-400 text-xs">{bio.length}/500</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vista previa */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          <h2 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Vista previa del perfil</h2>
          <div className="flex items-start gap-4 p-4 rounded-xl" style={{ background: FOG }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: "#EAF2F5" }}>
              {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <span style={{ color: TEAL, fontWeight: 700, fontSize: "1.25rem" }}>{name.charAt(0).toUpperCase() || "?"}</span>}
            </div>
            <div>
              <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>{name || "Tu nombre"}</p>
              <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>{email || "tu@correo.com"}</p>
              {isPsychologist && specialization && (
                <p className="text-slate-500 mt-1" style={{ fontSize: "0.75rem" }}>Especialidad: {specialization}</p>
              )}
              {isPsychologist && bio && <p className="text-slate-600 mt-2 leading-relaxed text-xs">{bio.slice(0, 120)}{bio.length > 120 ? "..." : ""}</p>}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-4 text-white rounded-xl transition-colors flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70" style={{ background: saved ? SAGE : CORAL, fontWeight: 700, fontSize: "0.95rem" }}>
          {saving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : saved ? <><Check size={18} /> ¡Guardado!</> : <><Save size={18} /> Guardar cambios</>}
        </button>
      </div>
    </div>
  );
}