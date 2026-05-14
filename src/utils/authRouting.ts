export type UserRole = "PATIENT" | "PSYCHOLOGIST" | "ADMIN";

const ROLE_ROUTES: Record<UserRole, string> = {
  PATIENT: "/paciente",
  PSYCHOLOGIST: "/panel-psicologo",
  ADMIN: "/admin",
};

export function getHomeRouteByRole(role: string): string | null {
  if (role === "PATIENT" || role === "PSYCHOLOGIST" || role === "ADMIN") {
    return ROLE_ROUTES[role];
  }

  return null;
}