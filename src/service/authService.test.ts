import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: postMock,
  },
}));

describe("authService", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("hace login contra el endpoint correcto", async () => {
    postMock.mockResolvedValueOnce({ data: { accessToken: "a", refreshToken: "r" } });
    const { authService } = await import("./authService");

    const result = await authService.login({ email: "user@example.com", password: "secret" });

    expect(postMock).toHaveBeenCalledWith(expect.stringContaining("/user/auth/login"), {
      email: "user@example.com",
      password: "secret",
    });
    expect(result.accessToken).toBe("a");
  });

  it("registra usuarios en el endpoint correcto", async () => {
    postMock.mockResolvedValueOnce({ data: { userId: "1" } });
    const { authService } = await import("./authService");

    await authService.register({ name: "Ana", email: "ana@example.com" } as never);

    expect(postMock).toHaveBeenCalledWith(expect.stringContaining("/user/auth/register"), {
      name: "Ana",
      email: "ana@example.com",
    });
  });

  it("refresca tokens en el endpoint correcto", async () => {
    postMock.mockResolvedValueOnce({ data: { accessToken: "new-a" } });
    const { authService } = await import("./authService");

    await authService.refreshToken("refresh-token");

    expect(postMock).toHaveBeenCalledWith(expect.stringContaining("/user/auth/refresh"), {
      refreshToken: "refresh-token",
    });
  });
});