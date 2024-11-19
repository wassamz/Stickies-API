import { beforeEach, describe, expect, it, vi } from "vitest";
import notesService from "../../../src/services/notes.service.js";

import Note from "../../../src/models/Note.js";

describe("Notes Service", () => {
  beforeEach(() => {
    vi.mock("../../../src/models/Note.js");
  });
  describe("getNotes", () => {
    it("should return an empty array if no userId is provided", async () => {
      const result = await notesService.getNotes();
      expect(result).toEqual([]);
    });

    it("should return notes if userId is provided", async () => {
      const mockNotes = [{ title: "Test Note", content: "Test Content" }];
      Note.find.mockResolvedValue(mockNotes);

      const result = await notesService.getNotes("123");
      expect(result).toEqual(mockNotes);
      expect(Note.find).toHaveBeenCalledWith("123");
    });

    it("should return an error message if there is a problem retrieving notes", async () => {
      const errorMessage = { error: "Unable to find notes" };
      Note.find.mockRejectedValue(new Error("Database Error"));

      const result = await notesService.getNotes("123");
      expect(result).toEqual(errorMessage);
      expect(Note.find).toHaveBeenCalledWith("123");
    });
  });

  describe("create", () => {
    describe("create", () => {
      it("should create and return a new note", async () => {
        const mockNoteData = { title: "Test Note", content: "Test Content" };
        const mockSavedNote = { ...mockNoteData, _id: "123" };

        // Mock the save method directly
        Note.prototype.save.mockImplementation(() =>
          Promise.resolve(mockSavedNote)
        );

        const result = await notesService.create(mockNoteData);
        expect(result).toEqual(mockSavedNote);
        expect(Note.prototype.save).toHaveBeenCalledWith(); // Call on the prototype
      });
      it("should handle errors during note creation", async () => {
        const mockNoteData = {
          userId: "123",
          title: "Test Note",
          content: "Test Content",
        };
        const errorMessage = "Unable to create note";

        Note.mockImplementation(() => ({
          save: vi.fn().mockRejectedValue(new Error(errorMessage)),
        }));

        const result = await notesService.create(mockNoteData);
        expect(result).toEqual({ error: errorMessage });
        expect(Note.prototype.save).toHaveBeenCalledWith();
      });
    });
  });

  describe("update", () => {
    it("should update and return the updated note", async () => {
      const mockNote = {
        _id: "123",
        title: "Updated Title",
        content: "Updated Content",
      };
      const mockUpdatedNote = {
        ...mockNote,
        title: "Updated Title",
        content: "Updated Content",
      };
      Note.findByIdAndUpdate.mockResolvedValue(mockUpdatedNote);

      const result = await notesService.update(mockNote);
      expect(result).toEqual(mockUpdatedNote);
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { title: "Updated Title", content: "Updated Content" },
        { new: true }
      );
    });

    it("should return an error if note is not found", async () => {
      const mockNote = {
        _id: "123",
        title: "Updated Title",
        content: "Updated Content",
      };
      Note.findByIdAndUpdate.mockResolvedValue(null); // Simulate no note found

      const result = await notesService.update(mockNote);
      expect(result).toEqual({ error: "Note not found" });
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { title: "Updated Title", content: "Updated Content" },
        { new: true }
      );
    });

    it("should return an error if there is a problem updating the note", async () => {
      const errorMessage = { error: "Error updating note" };
      Note.findByIdAndUpdate.mockRejectedValue(new Error("Database Error"));

      const result = await notesService.update({
        _id: "123",
        title: "Test",
        content: "Test content",
      });
      expect(result).toEqual(errorMessage);
      expect(Note.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete and return the deleted note", async () => {
      const mockDeletedNote = {
        _id: "123",
        title: "Deleted Note",
        content: "Deleted Content",
      };
      Note.findByIdAndDelete.mockResolvedValue(mockDeletedNote);

      const result = await notesService.remove("123");
      expect(result).toEqual({
        message: "Note deleted successfully",
        note: mockDeletedNote,
      });
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });

    it("should return an error if no ID is provided for deletion", async () => {
      const result = await notesService.remove();
      expect(result).toEqual({ error: "ID is required" });
    });

    it("should return an error if note is not found during deletion", async () => {
      Note.findByIdAndDelete.mockResolvedValue(null); // Simulate no note found

      const result = await notesService.remove("123");
      expect(result).toEqual({ error: "Note not found" });
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });

    it("should return an error if there is a problem deleting the note", async () => {
      const errorMessage = { error: "Error deleting note" };
      Note.findByIdAndDelete.mockRejectedValue(new Error("Database Error"));

      const result = await notesService.remove("123");
      expect(result).toEqual(errorMessage);
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
