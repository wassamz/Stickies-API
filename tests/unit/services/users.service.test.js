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
      expect(User.prototype.save).toHaveBeenCalled(); // Verify save is called
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
      expect(User.prototype.save).toHaveBeenCalledWith(); // Verify save is called
    });
  });

  describe("getUser", () => {
    it("should return the user with the provided email", async () => {
      const mockEmail = "test@example.com";
      const mockUser = new User({ email: mockEmail });
      User.findOne.mockResolvedValueOnce(mockUser);

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail }); // Verify arguments passed
    });

    it("should return an error message if user is not found", async () => {
      const mockEmail = "nonexistent@example.com";
      User.findOne.mockResolvedValueOnce(null); // Simulate no user found

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(null);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail }); // Verify arguments passed
    });

    it("should handle errors during user retrieval", async () => {
      const mockEmail = "test@example.com";
      const errorMessage = "Error finding user";
      User.findOne.mockRejectedValueOnce(new Error(errorMessage));

      const user = await userService.getUser(mockEmail);
      expect(user).toEqual(null);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail }); // Verify arguments passed
    });
  });

  describe("forgotPassword", () => {
    it("should send OTP email if user exists and no recent OTP attempts", async () => {
      const mockEmail = "test@example.com";
      const mockUser = { _id: "123", email: mockEmail };
      const mockOTP = { userId: mockUser._id, otp: 1234, retries: 1 };
      const successMessage = {
        message: "OTP Forgot Password proccessed successfully",
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
        retries: config.pwdMaxForgetRetryAttempts,
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
        message: "OTP Forgot Password proccessed successfully",
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
      const mockNewPassword = "newPassword123";
      const mockUser = {
        _id: "123",
        email: mockEmail,
        save: vi.fn().mockResolvedValueOnce(),
      };
      const mockOTPData = { userId: mockUser._id, otp: mockOTP, retries: 1 };
      const successMessage = {
        message: "OTP Reset Password proccessed successfully",
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      OTP.findOne.mockResolvedValueOnce(mockOTPData);
      OTP.findByIdAndDelete.mockResolvedValueOnce();

      const result = await userService.resetPassword(
        mockEmail,
        mockOTP,
        mockNewPassword
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
        retries: config.pwdMaxForgetRetryAttempts,
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
