import { beforeEach, describe, expect, it, vi } from "vitest";
import notesController from "../../../src/controllers/notes.controller.js";
import * as notesService from "../../../src/services/notes.service.js";

vi.mock("../../../src/services/notes.service.js", () => ({
  default: {
    getNotes: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("Notes Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("get", () => {
    it("should respond with 201 and result if no error", async () => {
      const mockResult = { notes: ["note1", "note2"] };
      // Mock the success response of the getNotes method
      notesService.default.getNotes.mockResolvedValue(mockResult);

      await notesController.get(req, res, next);

      expect(notesService.default.getNotes).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should respond with 500 if there is an error", async () => {
      const mockError = { error: "Unable to find notes" };
      // Mock the error response of the getNotes method
      notesService.default.getNotes.mockResolvedValue(mockError);

      await notesController.get(req, res, next);

      expect(notesService.default.getNotes).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe("create", () => {
    it("should respond with 201 and result if no error", async () => {
      const mockResult = { id: "123", title: "Note Title" };
      notesService.default.create.mockResolvedValue(mockResult);

      await notesController.create(req, res, next);

      expect(notesService.default.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should respond with 500 if there is an error", async () => {
      const mockError = { error: "Unable to create note" };
      notesService.default.create.mockResolvedValue(mockError);

      await notesController.create(req, res, next);

      expect(notesService.default.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe("update", () => {
    it("should respond with 201 and result if no error", async () => {
      const mockResult = { id: "123", title: "Updated Title" };
      notesService.default.update.mockResolvedValue(mockResult);

      await notesController.update(req, res, next);

      expect(notesService.default.update).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
    it("should respond with 500 if there is an error", async () => {
      const mockError = { error: "Error updating note" };
      notesService.default.update.mockResolvedValue(mockError); // Mock rejection for error

      await notesController.update(req, res, next);

      expect(notesService.default.update).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500); // Ensure 500 for error handling
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe("remove", () => {
    it("should respond with 201 and result if no error", async () => {
      const mockResult = {
        message: "Note deleted successfully",
        note: { id: "123" },
      };
      req.params.id = "123";
      notesService.default.remove.mockResolvedValue(mockResult);

      await notesController.remove(req, res, next);

      expect(notesService.default.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should respond with 500 if there is an error", async () => {
      const mockError = { error: "Error deleting note" };
      req.params.id = "123";
      notesService.default.remove.mockResolvedValue(mockError); // Mock rejection for error

      await notesController.remove(req, res, next);

      expect(notesService.default.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(500); // Ensure 500 for error handling
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });
});
