import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock("./api", () => ({
  default: apiMock,
}));

describe("userService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mockFn) => mockFn.mockReset());
  });

  it("crea usuarios con el endpoint correcto", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });
    const { userService } = await import("./userService");

    await userService.register({ email: "ana@example.com" });

    expect(apiMock.post).toHaveBeenCalledWith("/user/auth/register", { email: "ana@example.com" });
  });

  it("consulta y actualiza pacientes", async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: "1" }] });
    apiMock.put.mockResolvedValueOnce({ data: { id: "1", name: "Ana" } });
    apiMock.patch.mockResolvedValueOnce({ data: { id: "1", name: "Ana" } });
    apiMock.delete.mockResolvedValueOnce({ data: undefined });
    const { userService } = await import("./userService");

    expect(await userService.getPatients()).toEqual([{ id: "1" }]);
    expect(await userService.updatePatient("1", { name: "Ana" } as never)).toEqual({ id: "1", name: "Ana" });
    expect(await userService.patchPatient("1", { name: "Ana" } as never)).toEqual({ id: "1", name: "Ana" });
    await userService.deletePatient("1");

    expect(apiMock.get).toHaveBeenCalledWith("/user/patients");
    expect(apiMock.put).toHaveBeenCalledWith("/user/patients/1", { name: "Ana" });
    expect(apiMock.patch).toHaveBeenCalledWith("/user/patients/1", { name: "Ana" });
    expect(apiMock.delete).toHaveBeenCalledWith("/user/patients/1");
  });

  it("gestiona psicólogos y agenda", async () => {
    apiMock.get
      .mockResolvedValueOnce({ data: [{ id: "2" }] })
      .mockResolvedValueOnce({ data: { id: "2" } })
      .mockResolvedValueOnce({ data: { timeZone: "UTC", sessionDurationMinutes: 60, days: [] } });
    apiMock.put.mockResolvedValueOnce({ data: { id: "2", name: "Dra. Sofía" } });
    apiMock.patch.mockResolvedValueOnce({ data: { id: "2", name: "Dra. Sofía" } });
    apiMock.delete.mockResolvedValueOnce({ data: undefined });
    const { userService } = await import("./userService");

    expect(await userService.getPsychologists()).toEqual([{ id: "2" }]);
    expect(await userService.getPsychologistById("2")).toEqual({ id: "2" });
    expect(await userService.updatePsychologist("2", { name: "Dra. Sofía" } as never)).toEqual({ id: "2", name: "Dra. Sofía" });
    expect(await userService.patchPsychologist("2", { name: "Dra. Sofía" } as never)).toEqual({ id: "2", name: "Dra. Sofía" });
    await userService.deletePsychologist("2");
    expect(await userService.getMyProfile()).toEqual({ timeZone: "UTC", sessionDurationMinutes: 60, days: [] });

    expect(apiMock.get).toHaveBeenCalledWith("/user/psychologists");
    expect(apiMock.get).toHaveBeenCalledWith("/user/psychologists/2");
    expect(apiMock.put).toHaveBeenCalledWith("/user/psychologists/2", { name: "Dra. Sofía" });
    expect(apiMock.patch).toHaveBeenCalledWith("/user/psychologists/2", { name: "Dra. Sofía" });
    expect(apiMock.delete).toHaveBeenCalledWith("/user/psychologists/2");
    expect(apiMock.get).toHaveBeenCalledWith("/user/auth/me");
  });
});