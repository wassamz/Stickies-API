import notesService from "../services/notes.service.js";

async function get(req, res) {
  const user = req.body;
  const result = await notesService.getNotes(user);

  if (!result) res.status(500).json({ error: "Unable to retrieve note(s)" });
  else res.status(201).json(result);
}

async function create(req, res) {
  const result = await notesService.create(req.body);
  if (!result) res.status(500).json({ error: "Unable to create note" });
  else res.status(201).json(result);
}

async function update(req, res) {
  const result = await notesService.update(req.body);
  if (!result) res.status(500).json({ error: "Error updating note" });
  else res.status(201).json(result);
}

async function updateOrder(req, res) {
  const result = await notesService.updateOrder(req.body);
  if (!result) res.status(500).json({ error: "Error updating note" });
  else res.status(201).json(result);
}

async function remove(req, res) {
  const result = await notesService.remove(req.params.id);
  if (!result) res.status(500).json({ error: "Error deleting note" });
  else res.status(201).json({ message: "Note deleted successfully" });
}

export default { get, create, update, updateOrder, remove };
