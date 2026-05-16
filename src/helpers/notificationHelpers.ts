// src/helpers/notificationHelpers.ts

/**
 * Convierte el tipo técnico de notificación en un título legible
 */
export const getNotificationTitle = (type: string): string => {
  const titles: Record<string, string> = {
    // Sesiones grupales
    'session.requested': 'Solicitud de sesión grupal',
    'session.approved': 'Sesión grupal aprobada',
    'session.enrolled': 'Inscripción a sesión grupal',
    'session.cancelled': 'Sesión grupal cancelada',
    
    // Ofertas
    'offer.created': 'Nueva oferta disponible',
    'offer.cancelled': 'Oferta cancelada',
    'offer.taken': 'Oferta tomada',
    
    // Citas (scheduling)
    'appointment.created': 'Cita confirmada',
    'appointment.cancelled': 'Cita cancelada',
    'appointment.rescheduled': 'Cita reprogramada',
  };
  return titles[type] || type;
};

/**
 * Formatea una fecha ISO a una cadena relativa (ej. "hace 5 minutos")
 * Requiere instalar date-fns: npm install date-fns
 */
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatRelativeDate = (isoString: string): string => {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: es });
  } catch {
    return new Date(isoString).toLocaleString();
  }
};