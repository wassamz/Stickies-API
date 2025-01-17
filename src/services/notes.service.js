import Note from "../models/Note.js";
import logger from "../utils/logger.js";

async function getNotes(userId) {
  logger.info("Note Retrieve for user: " + JSON.stringify(userId));
  if (!userId) return [];

  try {
    let notes = await Note.find(userId);
    return notes;
  } catch (error) {
    logger.error("Unable to find notes", error);
    return { error: "Unable to find notes" };
  }
}

async function create(note) {
  logger.info("Note Update: " + JSON.stringify(note));
  try {
    const newNote = new Note(note);
    const result = await newNote.save();
    return result;
  } catch (error) {
    logger.error("Unable to create note: ", error);
    return { error: "Unable to create note" };
  }
}

async function update(note) {
  logger.info("Note Update: " + JSON.stringify(note));
  const { _id, title, content } = note;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      _id,
      { title, content },
      { new: true } // Return the updated document
    );
    if (!updatedNote) {
      logger.error("Note not found: ", JSON.stringify(updatedNote));
      return { error: "Note not found" };
    }

    return updatedNote;
  } catch (error) {
    logger.error("Unable to update error: ", error);
    return { error: "Error updating note" };
  }
}

async function remove(id) {
  logger.info("Note Delete id:" + JSON.stringify(id));
  if (!id) {
    logger.error("ID is required for deletion: ");
    return { error: "ID is required" };
  }

  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return { error: "Note not found" };
    }
    return { message: "Note deleted successfully", note: deletedNote };
  } catch (error) {
    logger.error("Unable to delete note: ", error);
    return { error: "Error deleting note" };
  }
}

export default { getNotes, create, update, remove };
