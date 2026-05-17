import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
};

const userServiceMock = {
  getPsychologistSchedule: vi.fn(),
};

vi.mock("./api", () => ({
  default: apiMock,
}));

vi.mock("./userService", () => ({
  userService: userServiceMock,
}));

describe("schedulingService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mockFn) => mockFn.mockReset());
    Object.values(userServiceMock).forEach((mockFn) => mockFn.mockReset());
    localStorageMockStore.clear();
    globalThis.localStorage = localStorageMock as never;
  });

  it("calcula disponibilidad a partir de agenda y sesiones", async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ psychologistId: "psy-1", date: "2026-05-15", startTime: "10:00" }] });
    userServiceMock.getPsychologistSchedule.mockResolvedValueOnce({
      timeZone: "UTC",
      sessionDurationMinutes: 60,
      days: [
        {
          dayOfWeek: "VIERNES",
          enabled: true,
          breakStart: "12:00",
          breakEnd: "13:00",
          slots: [
            { time: "10:00", status: "AVAILABLE", modality: "VideoConferencia" },
            { time: "11:00", status: "AVAILABLE", modality: "Presencial" },
          ],
        },
      ],
    });
    const { schedulingService } = await import("./schedulingService");

    expect(await schedulingService.getAvailability("psy-1", "2026-05-15")).toEqual([
      { time: "10:00", available: false, modality: "video" },
      { time: "11:00", available: true, modality: "presencial" },
    ]);
  });

  it("crea, consulta y cancela citas", async () => {
    apiMock.get
      .mockResolvedValueOnce({ data: { id: "user-1" } })
      .mockResolvedValueOnce({ data: { id: "user-1" } })
      .mockResolvedValueOnce({
        data: [
          {
            id: "a1",
            patientId: "user-1",
            psychologistId: "psy-1",
            date: "2026-05-15",
            startTime: "09:00",
            endTime: "10:00",
            type: "VIRTUAL",
            attentionType: "PRIMERA_VEZ",
            status: "CONFIRMED",
          },
        ],
      });
    apiMock.post.mockResolvedValueOnce({
      data: {
        id: "a2",
        patientId: "user-1",
        psychologistId: "psy-1",
        date: "2026-05-15",
        startTime: "11:00",
        endTime: "12:00",
        type: "VIRTUAL",
        attentionType: "PRIMERA_VEZ",
        status: "CONFIRMED",
      },
    });
    apiMock.delete.mockResolvedValueOnce({ data: undefined });
    const { schedulingService } = await import("./schedulingService");

    expect(
      await schedulingService.createAppointment({
        psychologistId: "psy-1",
        sessionType: "primera",
        modality: "video",
        date: "2026-05-15",
        time: "11:00",
        price: 50,
      })
    ).toMatchObject({ id: "a2", psychologistId: "psy-1", date: "2026-05-15", time: "11:00" });

    expect(await schedulingService.getMyAppointments("PATIENT")).toHaveLength(1);
    await schedulingService.cancelAppointment("a2");

    expect(apiMock.post).toHaveBeenCalledWith(
      "/sessions",
      expect.objectContaining({ patientId: "user-1", psychologistId: "psy-1", startTime: "11:00" })
    );
    expect(apiMock.delete).toHaveBeenCalledWith("/sessions/a2");
  });
});

const localStorageMockStore = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => localStorageMockStore.get(key) ?? null,
  setItem: (key: string, value: string) => localStorageMockStore.set(key, value),
  removeItem: (key: string) => localStorageMockStore.delete(key),
  clear: () => localStorageMockStore.clear(),
};