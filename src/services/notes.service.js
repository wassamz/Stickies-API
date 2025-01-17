import Note from "../models/Note.js";
import logger from "../utils/logger.js";

async function getNotes(userId) {
  logger.debug("Note Retrieve for user: " + JSON.stringify(userId));
  if (!userId) return [];

  try {
    let notes = await Note.find(userId);
    return notes;
  } catch (error) {
    logger.error("Unable to retrieve notes", error);
    return null;
  }
}

async function create(note) {
  logger.debug("Note Update: " + JSON.stringify(note));
  try {
    const newNote = new Note(note);
    const result = await newNote.save();
    return result;
  } catch (error) {
    logger.error("Unable to create note: ", error);
    return null;
  }
}

async function update(note) {
  logger.debug("Note Update: " + JSON.stringify(note));
  const { _id, title, content } = note;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      _id,
      { title, content },
      { new: true } // Return the updated document
    );
    if (!updatedNote) {
      logger.error("Trying to update note that does not exist: ", JSON.stringify(updatedNote));
      return null;
    }

    return updatedNote;
  } catch (error) {
    logger.error("Unable to update note: ", error);
    return null;
  }
}

async function remove(id) {
  logger.debug("Note Delete id:" + JSON.stringify(id));
  if (!id) {
    logger.error("ID is required for deletion: ");
    return null;
  }

  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      logger.error("Trying to delete note that does not exist: ", JSON.stringify(deletedNote));
      return null;
    }
    return {message: "Note removed successfully"};
  } catch (error) {
    logger.error("Unable to delete note: ", error);
    return null;
  }
}

export default { getNotes, create, update, remove };
