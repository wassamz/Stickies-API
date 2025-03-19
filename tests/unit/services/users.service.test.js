import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "crypto";
import User from "../../../src/models/User.js";
import OTP from "../../../src/models/OTP.js";
import userService from "../../../src/services/users.service.js";
import { sendOTPEmail } from "../../../src/services/email.service.js";
import config from "../../../src/config/config.js";

vi.mock("../../../src/models/User.js");
vi.mock("../../../src/models/OTP.js");
vi.mock("../../../src/services/email.service.js");

describe("Users Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveUser", () => {
    it("should save a new user and return the saved user", async () => {
      const mockUserData = {
        email: "test@example.com",
        password: "password123",
      };
      const mockSavedUser = { ...mockUserData, _id: "123" };

      User.prototype.save.mockImplementation(() =>
        Promise.resolve(mockSavedUser)
      );

      const savedUser = await userService.saveUser(mockUserData);
      expect(savedUser).toEqual(mockSavedUser);
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it("should handle errors during user creation", async () => {
      const mockUserData = {
        email: "test@example.com",
        password: "password123",
      };
      const errorMessage = { error: "Unable to create user" };

      User.prototype.save.mockImplementation(() =>
        Promise.resolve(errorMessage)
      );

      const savedUser = await userService.saveUser(mockUserData);
      expect(savedUser).toEqual(errorMessage);
      expect(User.prototype.save).toHaveBeenCalledWith();
    });
  });

  describe("getUser", () => {
    it("should return the user with the provided email", async () => {
      const mockEmail = "test@example.com";
      const mockUser = new User({ email: mockEmail });
      User.findOne.mockResolvedValueOnce(mockUser);

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should return an error message if user is not found", async () => {
      const mockEmail = "nonexistent@example.com";
      User.findOne.mockResolvedValueOnce(null);

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(null);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should handle errors during user retrieval", async () => {
      const mockEmail = "test@example.com";
      const errorMessage = "Error finding user";
      User.findOne.mockRejectedValueOnce(new Error(errorMessage));

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(null);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });
  });

  describe("checkEmail", () => {
    it("should return error if user already exists", async () => {
      const mockEmail = "existing@example.com";
      const mockUser = { email: mockEmail };

      User.findOne.mockResolvedValueOnce(mockUser);

      const result = await userService.checkEmail(mockEmail);
      expect(result).toEqual({
        error: "User already exists. Please login or reset your password.",
      });
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should create and send new OTP if no previous attempts", async () => {
      const mockEmail = "new@example.com";
      const mockOTP = 1234;

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(null);
      OTP.prototype.save.mockResolvedValueOnce({ otp: mockOTP });
      sendOTPEmail.mockResolvedValueOnce();

      const randomIntMock = vi
        .spyOn(crypto, "randomInt")
        .mockReturnValue(mockOTP);

      const result = await userService.checkEmail(mockEmail);
      expect(result).toEqual({
        message: "OTP Email Validation sent successfully",
      });
      expect(sendOTPEmail).toHaveBeenCalledWith(mockEmail, mockOTP);

      randomIntMock.mockRestore();
    });

    it("should resend OTP if previous attempts are within limit", async () => {
      const mockEmail = "retry@example.com";
      const mockOTP = {
        email: mockEmail,
        otp: 1234,
        retries: 2,
        save: vi.fn().mockResolvedValueOnce(),
      };

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(mockOTP);
      sendOTPEmail.mockResolvedValueOnce();

      const result = await userService.checkEmail(mockEmail);
      expect(result).toEqual({
        message: "OTP Email Validation sent successfully",
      });
      expect(mockOTP.save).toHaveBeenCalled();
      expect(sendOTPEmail).toHaveBeenCalledWith(mockEmail, mockOTP.otp);
    });

    it("should return error if maximum retry attempts exceeded", async () => {
      const mockEmail = "maxretries@example.com";
      const mockOTP = {
        email: mockEmail,
        otp: 1111,
        retries: config.otpMaxRetryAttempts,
      };

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(mockOTP);

      const result = await userService.checkEmail(mockEmail);
      expect(result).toEqual({
        error: "Maximum retry attempts exceeded. Please try again later.",
      });
    });

    it("should generate OTP with correct configured length", async () => {
      const mockEmail = "new@example.com";
      const configuredLength = 4; // This should match OTP_LENGTH in .env
      const expectedMin = Math.pow(10, configuredLength - 1); // 1000 for length 4
      const expectedMax = Math.pow(10, configuredLength) - 1; // 9999 for length 4

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(null);
      OTP.prototype.save.mockResolvedValueOnce({ otp: 1234 });
      sendOTPEmail.mockResolvedValueOnce();

      // Spy on crypto.randomInt to verify the range
      const randomIntSpy = vi.spyOn(crypto, "randomInt");

      await userService.checkEmail(mockEmail);

      // Verify randomInt was called with correct min/max values
      expect(randomIntSpy).toHaveBeenCalledWith(
        expectedMin, // 1000 for 4-digit OTP
        expectedMax // 9999 for 4-digit OTP
      );

      // Verify the ranges match config
      expect(config.otpMin).toBe(expectedMin);
      expect(config.otpMax).toBe(expectedMax);

      randomIntSpy.mockRestore();
    });
  });
  
  describe("signUp", () => {
    it("should create new user when OTP is valid", async () => {
      const mockData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        otp: "1234",
      };
      const mockOTP = {
        email: mockData.email,
        otp: 1234,
        retries: 1,
        _id: "otpId",
      };
      const mockUser = { ...mockData, _id: "userId" };

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(mockOTP);
      User.prototype.save.mockResolvedValueOnce(mockUser);
      OTP.findByIdAndDelete.mockResolvedValueOnce();

      const result = await userService.signUp(
        mockData.name,
        mockData.email,
        mockData.password,
        mockData.otp
      );

      expect(result).toEqual(mockUser);
      expect(OTP.findByIdAndDelete).toHaveBeenCalledWith(mockOTP._id);
    });

    it("should return error if user already exists", async () => {
      const mockData = {
        name: "Test User",
        email: "existing@example.com",
        password: "Password123!",
        otp: "1234",
      };
      const mockUser = { email: mockData.email };

      User.findOne.mockResolvedValueOnce(mockUser);

      const result = await userService.signUp(
        mockData.name,
        mockData.email,
        mockData.password,
        mockData.otp
      );

      expect(result).toEqual({ error: "User already exists" });
    });

    it("should return error if OTP not found", async () => {
      const mockData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        otp: "1234",
      };

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(null);

      const result = await userService.signUp(
        mockData.name,
        mockData.email,
        mockData.password,
        mockData.otp
      );

      expect(result).toEqual({ error: "Sign Up Unsuccessful" });
    });

    it("should return error if OTP is incorrect", async () => {
      const mockData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        otp: "1234",
      };
      const mockOTP = {
        email: mockData.email,
        otp: 5678,
        retries: 1,
        save: vi.fn().mockResolvedValueOnce(),
      };

      User.findOne.mockResolvedValueOnce(null);
      OTP.findOne.mockResolvedValueOnce(mockOTP);

      const result = await userService.signUp(
        mockData.name,
        mockData.email,
        mockData.password,
        mockData.otp
      );

      expect(result).toEqual({ error: "OTP is incorrect" });
      expect(mockOTP.save).toHaveBeenCalled();
    });
  });

  describe("forgotPassword", () => {
    it("should send OTP email if user exists and no recent OTP attempts", async () => {
      const mockEmail = "test@example.com";
      const mockUser = { _id: "123", email: mockEmail };
      const mockOTP = { userId: mockUser._id, otp: 1234, retries: 1 };
      const successMessage = {
        message: "OTP Forgot Password processed successfully",
      };
      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(null);
      OTP.prototype.save.mockResolvedValueOnce(mockOTP);
      sendOTPEmail.mockResolvedValueOnce();
      const randomIntMock = vi
        .spyOn(crypto, "randomInt")
        .mockReturnValue(mockOTP.otp);

      const result = await userService.forgotPassword(mockEmail);
      expect(result).toEqual(successMessage);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.prototype.save).toHaveBeenCalled();
      expect(sendOTPEmail).toHaveBeenCalledWith(mockEmail, mockOTP.otp);
      randomIntMock.mockRestore();
    });

    it("should return null if user does not exist", async () => {
      const mockEmail = "nonexistent@example.com";

      User.findOne.mockResolvedValueOnce(null);

      const result = await userService.forgotPassword(mockEmail);
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should return null if maximum retry attempts exceeded", async () => {
      const mockEmail = "test@example.com";
      const mockUser = { _id: "123", email: mockEmail };
      const mockOTP = {
        userId: mockUser._id,
        otp: 1234,
        retries: config.otpMaxRetryAttempts,
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(mockOTP);

      const result = await userService.forgotPassword(mockEmail);
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
    });

    it("should resend OTP email if OTP exists and retries are below maximum", async () => {
      const mockEmail = "test@example.com";
      const mockUser = { _id: "123", email: mockEmail };
      const mockOTP = {
        userId: mockUser._id,
        otp: 1234,
        retries: 1,
        save: vi.fn().mockResolvedValueOnce(),
      };
      const successMessage = {
        message: "OTP Forgot Password processed successfully",
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(mockOTP);
      sendOTPEmail.mockResolvedValueOnce();

      const result = await userService.forgotPassword(mockEmail);
      expect(result).toEqual(successMessage);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockOTP.save).toHaveBeenCalled();
      expect(sendOTPEmail).toHaveBeenCalledWith(mockEmail, mockOTP.otp);
    });
  });

  describe("resetPassword", () => {
    it("should reset the password if OTP is valid", async () => {
      const mockEmail = "test@example.com";
      const mockOTP = 1234;
      const mockNewPassword = "NewPassword123$";
      const mockUser = {
        _id: "123",
        email: mockEmail,
        save: vi.fn().mockResolvedValueOnce(),
      };
      const mockOTPData = {
        userId: mockUser._id,
        otp: mockOTP,
        retries: 1,
      };
      const successMessage = {
        message: "OTP Reset Password processed successfully",
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(mockOTPData);
      OTP.findByIdAndDelete.mockResolvedValueOnce();

      const result = await userService.resetPassword(
        mockEmail,
        mockNewPassword,
        mockOTP
      );
      expect(result).toEqual(successMessage);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockUser.save).toHaveBeenCalled();
      expect(OTP.findByIdAndDelete).toHaveBeenCalledWith(mockOTPData._id);
    });

    it("should return null if user does not exist", async () => {
      const mockEmail = "nonexistent@example.com";
      const mockOTP = 1234;
      const mockNewPassword = "newPassword123";

      User.findOne.mockResolvedValueOnce(null);

      const result = await userService.resetPassword(
        mockEmail,
        mockOTP,
        mockNewPassword
      );
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should return null if OTP does not exist", async () => {
      const mockEmail = "test@example.com";
      const mockOTP = 1234;
      const mockNewPassword = "newPassword123";
      const mockUser = { _id: "123", email: mockEmail };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(null);

      const result = await userService.resetPassword(
        mockEmail,
        mockOTP,
        mockNewPassword
      );
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
    });

    it("should return null if OTP is invalid or retries exceeded", async () => {
      const mockEmail = "test@example.com";
      const mockOTP = 1234;
      const mockNewPassword = "newPassword123";
      const mockUser = { _id: "123", email: mockEmail };
      const mockOTPData = {
        userId: mockUser._id,
        otp: 5678,
        retries: config.otpMaxRetryAttempts,
        save: vi.fn().mockResolvedValueOnce(),
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(mockOTPData);

      const result = await userService.resetPassword(
        mockEmail,
        mockOTP,
        mockNewPassword
      );
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(OTP.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockOTPData.save).toHaveBeenCalled();
    });
  });
});
