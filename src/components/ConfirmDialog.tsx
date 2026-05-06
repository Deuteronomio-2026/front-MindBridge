import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border" style={{ borderColor: "rgba(26,74,92,0.12)" }}>
        <div className="flex items-start gap-4 p-6 border-b" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <AlertTriangle size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.1rem" }}>
              {title}
            </h2>
            <p className="mt-1 text-slate-500" style={{ fontSize: "0.9rem", lineHeight: 1.45 }}>
              {message}
            </p>
          </div>

          <button
            type="button"
            aria-label="Cerrar diálogo"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-slate-100"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex gap-3 p-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border px-4 py-3 transition-colors hover:bg-slate-50"
            style={{ borderColor: "rgba(26,74,92,0.16)", color: "#496273", fontWeight: 700, fontSize: "0.875rem" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: "#DC2626", fontWeight: 700, fontSize: "0.875rem" }}
          >
            {loading ? "Cancelando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}