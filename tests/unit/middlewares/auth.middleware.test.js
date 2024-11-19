import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkAccessToken,
  checkRefreshToken,
} from "../../../src/middlewares/auth.middleware.js";
import { validateJSONToken, tokenTypes } from "../../../src/utils/auth.js";
import { NotAuthError } from "../../../src/utils/errors.js";

vi.mock("../../../src/utils/auth.js");

describe("Auth Middleware", () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAccessToken", () => {
    it("should skip authentication for /users/refresh-token route", () => {
      const req = { path: "/users/refresh-token", method: "GET", headers: {} };
      checkAccessToken(req, {}, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should skip authentication for OPTIONS requests", () => {
      const req = { path: "/any-path", method: "OPTIONS", headers: {} };
      checkAccessToken(req, {}, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next with NotAuthError if authorization header is missing", () => {
      const req = { path: "/some-path", method: "GET", headers: {} };
      checkAccessToken(req, {}, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new NotAuthError("Not authenticated.")
      );
    });

    it("should call next with NotAuthError if authorization header is invalid", () => {
      const req = {
        path: "/some-path",
        method: "GET",
        headers: { authorization: "Bearer" },
      };
      checkAccessToken(req, {}, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new NotAuthError("Not authenticated.")
      );
    });

    it("should add userId to request body if token is valid", () => {
      const mockUserId = "12345";
      validateJSONToken.mockReturnValue({ userId: mockUserId });
      const req = {
        path: "/some-path",
        method: "GET",
        headers: { authorization: "Bearer mockToken" },
        body: {},
      };

      checkAccessToken(req, {}, mockNext);

      expect(validateJSONToken).toHaveBeenCalledWith(
        "mockToken",
        tokenTypes.ACCESS
      );
      expect(req.body.userId).toBe(mockUserId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next with NotAuthError if token validation fails", () => {
      validateJSONToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      const req = {
        path: "/some-path",
        method: "GET",
        headers: { authorization: "Bearer mockToken" },
      };

      checkAccessToken(req, {}, mockNext);

      expect(validateJSONToken).toHaveBeenCalledWith(
        "mockToken",
        tokenTypes.ACCESS
      );
      expect(mockNext).toHaveBeenCalledWith(
        new NotAuthError("Not authenticated.")
      );
    });
  });

  describe("checkRefreshToken", () => {
    it("should call next with NotAuthError if refresh token is missing", () => {
      const req = { cookies: {} };
      checkRefreshToken(req, {}, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new NotAuthError("Not authenticated.")
      );
    });

    it("should add userId to request body if refresh token is valid", () => {
      const mockUserId = "12345";
      validateJSONToken.mockReturnValue({ userId: mockUserId });
      const req = {
        cookies: { refreshToken: "mockRefreshToken" },
        body: {},
      };

      checkRefreshToken(req, {}, mockNext);

      expect(validateJSONToken).toHaveBeenCalledWith(
        "mockRefreshToken",
        tokenTypes.REFRESH
      );
      expect(req.body.userId).toBe(mockUserId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next with NotAuthError if refresh token validation fails", () => {
      validateJSONToken.mockImplementation(() => {
        throw new Error("Invalid refresh token");
      });
      const req = { cookies: { refreshToken: "mockRefreshToken" } };

      checkRefreshToken(req, {}, mockNext);

      expect(validateJSONToken).toHaveBeenCalledWith(
        "mockRefreshToken",
        tokenTypes.REFRESH
      );
      expect(mockNext).toHaveBeenCalledWith(
        new NotAuthError("Not authenticated.")
      );
    });
  });
});
