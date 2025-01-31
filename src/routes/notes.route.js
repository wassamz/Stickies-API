import express from "express";
import notesController from "../controllers/notes.controller.js";
import { checkAccessToken } from "../middlewares/auth.middleware.js";
import {
    validateNote,
    validateNoteDelete,
    validateRequest,
    validateUpdateOrder,
} from "../utils/requestValidators.js";

const router = express.Router();

router.use(checkAccessToken);

router.get("/", notesController.get);

router.post("/", validateNote, validateRequest, notesController.create);

router.patch("/", validateNote, validateRequest, notesController.update);

router.patch(
  "/updateOrder",
  validateUpdateOrder,
  validateRequest,
  notesController.updateOrder
);

router.delete(
  "/:id",
  validateNoteDelete,
  validateRequest,
  notesController.remove
);

export default router;
