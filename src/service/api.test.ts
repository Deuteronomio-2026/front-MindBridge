import { beforeEach, describe, expect, it, vi } from "vitest";

type RequestConfig = {
  headers: Record<string, string>;
  _retry?: boolean;
};

type ResponseError = {
  config: RequestConfig;
  response?: {
    status?: number;
  };
};

const requestHandlers: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
const responseHandlers: Array<{
  success: (value: unknown) => unknown;
  error: (value: ResponseError) => Promise<unknown>;
}> = [];

const apiFn = vi.fn();
const refreshTokenMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() =>
      Object.assign(apiFn, {
        interceptors: {
          request: {
            use: (handler: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) => {
              requestHandlers.push(handler);
            },
          },
          response: {
            use: (success: (value: unknown) => unknown, error: (value: ResponseError) => Promise<unknown>) => {
              responseHandlers.push({ success, error });
            },
          },
        },
      })
    ),
  },
}));

vi.mock("./authService", () => ({
  authService: {
    refreshToken: refreshTokenMock,
  },
}));

describe("api client", () => {
  beforeEach(() => {
    vi.resetModules();
    requestHandlers.length = 0;
    responseHandlers.length = 0;
    apiFn.mockReset();
    refreshTokenMock.mockReset();
    localStorageMockStore.clear();
    globalThis.localStorage = localStorageMock as never;
    globalThis.window = { location: { href: "" } } as never;
  });

  it("agrega el token en requests salientes", async () => {
    localStorage.setItem("accessToken", "token-123");
    await import("./api");

    const config = await requestHandlers[0]({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer token-123");
  });

  it("refresca el token cuando recibe 401 y reintenta la petición", async () => {
    localStorage.setItem("refreshToken", "refresh-123");
    refreshTokenMock.mockResolvedValueOnce({ accessToken: "new-token", refreshToken: "new-refresh" });
    apiFn.mockResolvedValueOnce({ data: { ok: true } });

    await import("./api");
    const result = await responseHandlers[0].error({ config: { headers: {}, _retry: false }, response: { status: 401 } });

    expect(refreshTokenMock).toHaveBeenCalledWith("refresh-123");
    expect(localStorage.getItem("accessToken")).toBe("new-token");
    expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ headers: { Authorization: "Bearer new-token" } }));
    expect(result).toEqual({ data: { ok: true } });
  });

  it("redirige a auth cuando no puede refrescar", async () => {
    localStorage.setItem("refreshToken", "refresh-123");
    refreshTokenMock.mockRejectedValueOnce(new Error("nope"));

    await import("./api");

    await expect(
      responseHandlers[0].error({ config: { headers: {}, _retry: false }, response: { status: 401 } })
    ).rejects.toThrow("nope");

    expect(window.location.href).toBe("/auth");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});

const localStorageMockStore = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => localStorageMockStore.get(key) ?? null,
  setItem: (key: string, value: string) => localStorageMockStore.set(key, value),
  removeItem: (key: string) => localStorageMockStore.delete(key),
  clear: () => localStorageMockStore.clear(),
};