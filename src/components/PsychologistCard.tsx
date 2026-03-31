import { useNavigate } from "react-router-dom"; 
import { MapPin, BadgeCheck, Video, MessageCircle, Users } from "lucide-react";
import type { Psychologist } from "../data/psychologists";
import { StarRating } from "./StarRating";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";

interface PsychologistCardProps {
  psychologist: Psychologist;
  variant?: "grid" | "list";
}

export function PsychologistCard({ psychologist, variant = "grid" }: PsychologistCardProps) {
  const navigate = useNavigate();

  if (variant === "list") {
    return (
      <div
        className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start gap-5"
        style={{ borderColor: "rgba(26,74,92,0.1)" }}
        onClick={() => navigate(`/paciente/psicologo/${psychologist.id}`)}
      >
        <div className="relative flex-shrink-0">
          <img
            src={psychologist.photo}
            alt={`${psychologist.title} ${psychologist.name}`}
            className="w-24 h-24 rounded-xl object-cover"
          />
          {psychologist.verified && (
            <div className="absolute -bottom-1 -right-1 rounded-full p-0.5" style={{ background: TEAL }}>
              <BadgeCheck size={14} className="text-white fill-white" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                {psychologist.title} {psychologist.name}
              </h3>
              <p style={{ color: TEAL, fontSize: "0.85rem" }}>{psychologist.specialties[0]}</p>
            </div>
          </div>
          <StarRating rating={psychologist.rating} reviewCount={psychologist.reviewCount} size={13} />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {psychologist.specialties.slice(0, 3).map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full" style={{ background: FOG, color: TEAL, fontSize: "0.72rem", fontWeight: 500 }}>
                {s}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2" style={{ color: "#6a8a9a", fontSize: "0.8rem" }}>
            <span className="flex items-center gap-1"><MapPin size={12} />{psychologist.location}</span>
            <span className="flex items-center gap-1"><Users size={12} />{psychologist.experience} años</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <p style={{ color: TEAL, fontWeight: 800, fontSize: "1.1rem" }}>desde ${psychologist.prices.chat}</p>
          <button
            className="px-4 py-2 rounded-xl text-white transition-colors"
            style={{ background: CORAL, fontSize: "0.82rem", fontWeight: 700 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/paciente/reservar/${psychologist.id}`); }}
          >
            Reservar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
      style={{ borderColor: "rgba(26,74,92,0.1)" }}
      onClick={() => navigate(`/paciente/psicologo/${psychologist.id}`)}
    >
      {/* Large photo header */}
      <div className="relative w-full" style={{ height: 200 }}>
        <img
          src={psychologist.photo}
          alt={`${psychologist.title} ${psychologist.name}`}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,74,92,0.7) 0%, transparent 55%)" }} />
        {psychologist.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm">
            <BadgeCheck size={13} style={{ color: TEAL }} strokeWidth={2} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: TEAL }}>Verificado</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <h3 className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {psychologist.title} {psychologist.name}
          </h3>
          <p className="text-white/80" style={{ fontSize: "0.8rem" }}>{psychologist.specialties[0]}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <StarRating rating={psychologist.rating} reviewCount={psychologist.reviewCount} size={13} />

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {psychologist.specialties.map((s) => (
            <span
              key={s}
              className="px-2.5 py-0.5 rounded-full"
              style={{ background: FOG, color: TEAL, fontSize: "0.72rem", fontWeight: 500 }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3" style={{ color: "#6a8a9a", fontSize: "0.8rem" }}>
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{psychologist.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{psychologist.experience} años exp.</span>
          </div>
        </div>

        {/* Modalities & price */}
        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-1" style={{ color: "#6a8a9a", fontSize: "0.78rem" }}>
            <Video size={13} style={{ color: TEAL }} />
            <span>${psychologist.prices.video}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "#6a8a9a", fontSize: "0.78rem" }}>
            <Users size={13} style={{ color: SAGE }} />
            <span>${psychologist.prices.presencial}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "#6a8a9a", fontSize: "0.78rem" }}>
            <MessageCircle size={13} style={{ color: "#0EA5E9" }} />
            <span>${psychologist.prices.chat}</span>
          </div>
          <div className="ml-auto">
            <button
              className="px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: CORAL, fontSize: "0.8rem", fontWeight: 700 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/paciente/reservar/${psychologist.id}`);
              }}
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
