// routes/noteRoutes.ts

import express from "express";
import { createNote, getNotes, getNote, updateNote, deleteNote } from "../controllers/noteController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/notes", isAuthenticated, createNote);
router.get("/notes", isAuthenticated, getNotes);
router.get("/notes/:id", isAuthenticated, getNote);
router.put("/notes/:id", isAuthenticated, updateNote);
router.delete("/notes/:id", isAuthenticated, deleteNote);

export default router;
