import { describe, expect, it } from "vitest";
import { getHomeRouteByRole } from "./authRouting";

describe("getHomeRouteByRole", () => {
  it("resuelve la ruta del paciente", () => {
    expect(getHomeRouteByRole("PATIENT")).toBe("/paciente");
  });

  it("resuelve la ruta del psicólogo", () => {
    expect(getHomeRouteByRole("PSYCHOLOGIST")).toBe("/panel-psicologo");
  });

  it("resuelve la ruta del administrador", () => {
    expect(getHomeRouteByRole("ADMIN")).toBe("/admin");
  });

  it("devuelve null para roles desconocidos", () => {
    expect(getHomeRouteByRole("GUEST")).toBeNull();
  });
});