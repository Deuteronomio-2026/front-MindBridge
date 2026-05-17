import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock("axios", () => ({
  default: axiosMock,
}));

describe("groupSessionService", () => {
  beforeEach(() => {
    Object.values(axiosMock).forEach((mockFn) => mockFn.mockReset());
  });

  it("consulta sesiones grupales", async () => {
    axiosMock.get
      .mockResolvedValueOnce({ data: [{ id: "1" }] })
      .mockResolvedValueOnce({ data: [{ id: "2" }] })
      .mockResolvedValueOnce({ data: [{ id: "3" }] });
    const { groupSessionService } = await import("./groupSessionService");

    expect(await groupSessionService.getApprovedSessions()).toEqual([{ id: "1" }]);
    expect(await groupSessionService.getAllGroupSessions()).toEqual([{ id: "2" }]);
    expect(await groupSessionService.getPsychologistSessions("psy-1")).toEqual([{ id: "3" }]);
  });

  it("crea, inscribe, aprueba, cancela y elimina sesiones", async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: "4" } }).mockResolvedValueOnce({ data: { id: "5" } });
    axiosMock.patch.mockResolvedValueOnce({ data: { id: "6" } }).mockResolvedValueOnce({ data: { id: "7" } });
    axiosMock.delete.mockResolvedValueOnce({ data: undefined });
    const { groupSessionService } = await import("./groupSessionService");

    expect(
      await groupSessionService.createGroupSession({
        title: "Grupo",
        description: "Sesión",
        psychologistId: "psy-1",
        scheduledAt: "2026-05-15T10:00:00Z",
        durationMinutes: 60,
        maxParticipants: 10,
      } as never)
    ).toEqual({ id: "4" });
    expect(await groupSessionService.enrollInGroupSession("4", "pat-1")).toEqual({ id: "5" });
    expect(await groupSessionService.cancelGroupSession("4")).toEqual({ id: "6" });
    expect(await groupSessionService.approveGroupSession("4")).toEqual({ id: "7" });
    await groupSessionService.deleteGroupSession("4");

    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/group-sessions"), expect.objectContaining({ title: "Grupo" }));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/enroll"), { patientId: "pat-1" });
    expect(axiosMock.patch).toHaveBeenCalledWith(expect.stringContaining("/cancel"));
    expect(axiosMock.patch).toHaveBeenCalledWith(expect.stringContaining("/approve"));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/group-sessions/4"));
  });
});