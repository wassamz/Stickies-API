import jsonwebtoken from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import config from "../../../src/config/config.js";
import * as auth from "../../../src/utils/auth.js"; // Import all named exports as `auth`

vi.mock("jsonwebtoken");

describe("Auth Utility Functions", () => {
  const mockUserId = "12345";
  const mockAccessToken = "mockAccessToken";
  const mockRefreshToken = "mockRefreshToken";
  const mockDecodedAccessToken = {
    userId: mockUserId,
    type: auth.tokenTypes.ACCESS,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAccessToken", () => {
    it("should create an access token with correct payload", () => {
      jsonwebtoken.sign.mockReturnValue(mockAccessToken);

      const token = auth.createAccessToken(mockUserId);

      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        { userId: mockUserId, type: auth.tokenTypes.ACCESS },
        config.jwtSecret,
        { expiresIn: config.jwtAccessExpireTime }
      );
      expect(token).toBe(mockAccessToken);
    });
  });

  describe("createRefreshToken", () => {
    it("should create a refresh token with correct payload", () => {
      jsonwebtoken.sign.mockReturnValue(mockRefreshToken);

      const token = auth.createRefreshToken(mockUserId);

      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        { userId: mockUserId, type: auth.tokenTypes.REFRESH },
        config.jwtSecret,
        { expiresIn: config.jwtRefreshExpireTime }
      );
      expect(token).toBe(mockRefreshToken);
    });
  });

  describe("validateJSONToken", () => {
    it("should validate a token and return the decoded value when token is valid and type matches", () => {
      jsonwebtoken.verify.mockReturnValue(mockDecodedAccessToken);

      const decodedToken = auth.validateJSONToken(
        mockAccessToken,
        auth.tokenTypes.ACCESS
      );

      expect(jsonwebtoken.verify).toHaveBeenCalledWith(
        mockAccessToken,
        config.jwtSecret
      );
      expect(decodedToken).toEqual(mockDecodedAccessToken);
    });

    it("should throw an error if token type does not match", () => {
      jsonwebtoken.verify.mockReturnValue(mockDecodedAccessToken);

      expect(() =>
        auth.validateJSONToken(mockAccessToken, auth.tokenTypes.REFRESH)
      ).toThrowError("Invalid token type");
    });

    it("should throw an error if token is invalid", () => {
      jsonwebtoken.verify.mockImplementation(() => {
        throw new Error("Token is invalid");
      });

      expect(() =>
        auth.validateJSONToken("invalidToken", auth.tokenTypes.ACCESS)
      ).toThrowError("Invalid token");
      expect(jsonwebtoken.verify).toHaveBeenCalledWith(
        "invalidToken",
        config.jwtSecret
      );
    });
  });
});
