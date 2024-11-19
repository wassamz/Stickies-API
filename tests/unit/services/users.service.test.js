import { beforeEach, describe, expect, it, vi } from "vitest";
import User from "../../../src/models//User.js";
import userService from "../../../src/services/users.service.js";

describe("Users Service", () => {
  beforeEach(() => {
    vi.mock("../../../src/models/User.js"); // Mock User model
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
      expect(User.prototype.save).toHaveBeenCalledWith(); // Verify save is called
    });

    it("should handle errors during user creation", async () => {
      const mockUserData = {
        email: "test@example.com",
        password: "password123",
      };
      const errorMessage = "Error saving user";

      User.mockImplementation(() => ({
        save: vi.fn().mockRejectedValue(new Error(errorMessage)),
      }));

      const savedUser = await userService.saveUser(mockUserData);
      expect(savedUser).toEqual({ error: "Unable to create user" });
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
      expect(user).toEqual({ error: "Unable to find user" });
      expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail }); // Verify arguments passed
    });
  });
});
