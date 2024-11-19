import notesService from "../services/notes.service.js";

async function get(req, res) {
  const user = req.body;
  const result = await notesService.getNotes(user);
  if (result.error) res.status(500).json(result);
  else res.status(201).json(result);
}

async function create(req, res) {
  const result = await notesService.create(req.body);
  if (result.error) res.status(500).json(result);
  else res.status(201).json(result);
}

async function update(req, res) {
  const result = await notesService.update(req.body);
  if (result.error) res.status(500).json(result);
  else res.status(201).json(result);
}

async function remove(req, res) {
  const result = await notesService.remove(req.params.id);
  if (result.error) res.status(500).json(result);
  else res.status(201).json(result);
}

export default { get, create, update, remove };
