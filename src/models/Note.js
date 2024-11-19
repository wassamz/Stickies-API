import { model, Schema, SchemaTypes } from "mongoose";

const NoteSchema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
});

const Note = model("Note", NoteSchema);

export default Note;
