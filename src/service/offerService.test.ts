import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
};

vi.mock("axios", () => ({
  default: axiosMock,
}));

describe("offerService", () => {
  beforeEach(() => {
    Object.values(axiosMock).forEach((mockFn) => mockFn.mockReset());
  });

  it("consulta ofertas activas y tomadas", async () => {
    axiosMock.get.mockResolvedValueOnce({ data: [{ id: "1" }] }).mockResolvedValueOnce({ data: [{ id: "2" }] });
    const { offerService } = await import("./offerService");

    expect(await offerService.getActiveOffers()).toEqual([{ id: "1" }]);
    expect(await offerService.getTakenOffers()).toEqual([{ id: "2" }]);
    expect(axiosMock.get).toHaveBeenNthCalledWith(1, expect.stringContaining("/offers/active"));
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, expect.stringContaining("/offers/taken"));
  });

  it("crea, suscribe y cancela ofertas", async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: "3" } }).mockResolvedValueOnce({ data: { id: "4" } });
    axiosMock.patch.mockResolvedValueOnce({ data: { id: "5" } });
    const { offerService } = await import("./offerService");

    expect(await offerService.createOffer({ title: "Promo" } as never)).toEqual({ id: "3" });
    expect(await offerService.subscribeOffer("3", "psy-1")).toEqual({ id: "4" });
    expect(await offerService.cancelOffer("3")).toEqual({ id: "5" });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/offers"), { title: "Promo" });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/offers/3/subscribe"), { psychologistId: "psy-1" });
    expect(axiosMock.patch).toHaveBeenCalledWith(expect.stringContaining("/offers/3/cancel"));
  });
});