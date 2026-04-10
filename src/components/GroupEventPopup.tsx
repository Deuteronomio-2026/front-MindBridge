import { Bell, Calendar, X } from "lucide-react";

const TEAL = "#1A4A5C";
const CORAL = "#E8856A";

interface GroupEventPopupProps {
  title: string;
  message: string;
  onClose: () => void;
  onOpen: () => void;
}

export function GroupEventPopup({ title, message, onClose, onOpen }: GroupEventPopupProps) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[90] w-[92vw] max-w-sm rounded-2xl border bg-white shadow-2xl"
      style={{ borderColor: "rgba(26,74,92,0.15)" }}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF4F7", color: TEAL }}>
            <Bell size={16} />
          </div>
          <div>
            <p style={{ color: TEAL, fontWeight: 800, fontSize: "0.9rem" }}>{title}</p>
            <p className="mt-1" style={{ color: "#475569", fontSize: "0.8rem", lineHeight: 1.4 }}>{message}</p>
          </div>
        </div>

        <button
          className="p-1 rounded-md hover:bg-slate-100"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          className="flex-1 px-3 py-2 rounded-lg text-white inline-flex items-center justify-center gap-1.5"
          style={{ background: TEAL, fontSize: "0.8rem", fontWeight: 700 }}
          onClick={onOpen}
        >
          <Calendar size={13} />
          Ver detalle
        </button>
        <button
          className="px-3 py-2 rounded-lg"
          style={{ background: "#FCF0EB", color: CORAL, fontSize: "0.8rem", fontWeight: 700 }}
          onClick={onClose}
        >
          Después
        </button>
      </div>
    </div>
  );
}
