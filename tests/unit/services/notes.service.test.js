import { beforeEach, describe, expect, it, vi } from "vitest";
import notesService from "../../../src/services/notes.service.js";
import logger from '../../../src/utils/logger.js';
import Note from "../../../src/models/Note.js";

describe("Notes Service", () => {
  beforeEach(() => {
    vi.mock("../../../src/models/Note.js");
    vi.mock('../../../src/utils/logger.js');

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
      const errorMessage = null; //returns null if there is no error
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
        const errorMessage =null;

        Note.mockImplementation(() => ({
          save: vi.fn().mockRejectedValue(new Error(errorMessage)),
        }));

        const result = await notesService.create(mockNoteData);
        expect(result).toEqual(errorMessage);
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
      const errorMessage = null;

      Note.findByIdAndUpdate.mockResolvedValue(null); // Simulate no note found

      const result = await notesService.update(mockNote);
      expect(result).toEqual(errorMessage);
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { title: "Updated Title", content: "Updated Content" },
        { new: true }
      );
    });

    it("should return an error if there is a problem updating the note", async () => {
      const errorMessage = null;
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
      expect(result).toEqual({message: "Note removed successfully"});
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });

    it("should return an error if no ID is provided for deletion", async () => {
      const errorMessage = null;
      const result = await notesService.remove();
      expect(result).toEqual(errorMessage);
    });

    it("should return an error if note is not found during deletion", async () => {
      const errorMessage = null;
      Note.findByIdAndDelete.mockResolvedValue(null); // Simulate no note found
      const result = await notesService.remove("123");
      expect(result).toEqual(errorMessage);
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });

    it("should return an error if there is a problem deleting the note", async () => {
      const errorMessage = null;
      Note.findByIdAndDelete.mockRejectedValue(new Error("Database Error"));

      const result = await notesService.remove("123");
      expect(result).toEqual(errorMessage);
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });

  describe('notesService.updateOrder', () => {
    const mockData = [
      { _id: '123', order: 1 },
      { _id: '456', order: 2 }
    ];
  
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    it('should update the order of notes successfully', async () => {
      Note.findByIdAndUpdate.mockResolvedValueOnce(mockData[0]);
      Note.findByIdAndUpdate.mockResolvedValueOnce(mockData[1]);
  
      const result = await notesService.updateOrder(mockData);
  
      expect(Note.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(mockData[0]._id, { order: mockData[0].order });
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(mockData[1]._id, { order: mockData[1].order });
      expect(result).toEqual({ message: 'Notes reordered successfully' });
    });
  
    it('should log an error and return null if updating order fails', async () => {
      Note.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update failed'));
  
      const result = await notesService.updateOrder(mockData);
  
      expect(Note.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Unable to reorder notes: ', expect.any(Error));
      expect(result).toBeNull();
    });
  });
});
