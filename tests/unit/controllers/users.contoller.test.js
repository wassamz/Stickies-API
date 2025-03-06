import { beforeEach, describe, expect, it, vi } from "vitest";
import usersController from "../../../src/controllers/users.controller.js";
import * as usersService from "../../../src/services/users.service.js";
import * as auth from "../../../src/utils/auth.js";

// Mock dependencies
vi.mock("../../../src/services/users.service.js", () => ({
  default: {
    signUp: vi.fn(),
    validateUser: vi.fn(),
    checkEmail: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock("../../../src/utils/auth.js", () => ({
  createAccessToken: vi.fn(),
  createRefreshToken: vi.fn(),
}));

describe("Users Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { 
      body: {},
      cookies: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("should create user and return tokens on successful signup", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        otp: "123456"
      };

      usersService.default.signUp.mockResolvedValue(mockUser);
      auth.createAccessToken.mockReturnValue(mockTokens.accessToken);
      auth.createRefreshToken.mockReturnValue(mockTokens.refreshToken);

      await usersController.signup(req, res, next);

      expect(usersService.default.signUp).toHaveBeenCalledWith(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.otp
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", mockTokens.refreshToken, expect.any(Object));
      expect(res.header).toHaveBeenCalledWith("Authorization", `Bearer ${mockTokens.accessToken}`);
      expect(res.json).toHaveBeenCalledWith({ message: "User created." });
    });

    it("should return 400 if signup fails", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!"
      };

      usersService.default.signUp.mockResolvedValue({ error: "User already exists" });

      await usersController.signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
    });
  });

  describe("login", () => {
    it("should login user and return tokens on successful login", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      req.body = {
        email: "test@example.com",
        password: "Password123!"
      };

      usersService.default.validateUser.mockResolvedValue(mockUser);
      auth.createAccessToken.mockReturnValue(mockTokens.accessToken);
      auth.createRefreshToken.mockReturnValue(mockTokens.refreshToken);

      await usersController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", mockTokens.refreshToken, expect.any(Object));
      expect(res.header).toHaveBeenCalledWith("Authorization", `Bearer ${mockTokens.accessToken}`);
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful" });
    });

    it("should return 401 if login fails", async () => {
      req.body = {
        email: "test@example.com",
        password: "wrong-password"
      };

      usersService.default.validateUser.mockResolvedValue(null);

      await usersController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Could not identify user, credentials seem to be wrong."
      });
    });
  });

  describe("checkEmail", () => {
    it("should return success message when email check passes", async () => {
      req.body = { email: "test@example.com" };
      const mockResult = { message: "OTP Email Validation sent successfully" };

      usersService.default.checkEmail.mockResolvedValue(mockResult);

      await usersController.checkEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 404 when email check fails", async () => {
      req.body = { email: "test@example.com" };
      const mockError = { error: "User not found" };

      usersService.default.checkEmail.mockResolvedValue(mockError);

      await usersController.checkEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "NewPassword123!",
        otp: "123456"
      };

      usersService.default.resetPassword.mockResolvedValue(true);

      await usersController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password reset successful." });
    });

    it("should return 400 when password reset fails", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "NewPassword123!",
        otp: "wrong-otp"
      };

      usersService.default.resetPassword.mockResolvedValue(null);

      await usersController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Password Reset unsuccessful" });
    });
  });

  describe("refreshToken", () => {
    it("should generate new access token", async () => {
      req.body = { userId: "123" };
      const newAccessToken = "new-access-token";

      auth.createAccessToken.mockReturnValue(newAccessToken);

      await usersController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.header).toHaveBeenCalledWith("Authorization", `Bearer ${newAccessToken}`);
      expect(res.json).toHaveBeenCalledWith({ message: "new access token generated" });
    });
  });
});