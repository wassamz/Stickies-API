import express from "express";
import notesController from "../controllers/notes.controller.js";
import { checkAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(checkAccessToken);

router.get("/", notesController.get);

router.post("/", notesController.create);

router.patch("/", notesController.update);

router.delete("/:id", notesController.remove);

export default router;
