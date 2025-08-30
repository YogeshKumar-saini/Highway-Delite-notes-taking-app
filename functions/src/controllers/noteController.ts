// controllers/noteController.ts

import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { Note } from "../models/noteModel";
import type { INote } from "../models/noteModel";
import ErrorHandler from "../utils/errorHandler"; // ✅ import ErrorHandler

// ************************ createNote ************************
export const createNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title) {
    return next(new ErrorHandler("Title is required.", 400));
  }

  const note: INote = await Note.create({
    user: req.user._id,
    title,
    content,
  });

  res.status(201).json({
    success: true,
    note,
  });
});

// ************************ getNotes ************************
export const getNotes = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const notes = await Note.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    notes,
  });
});

// ************************ getNote ************************
export const getNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(new ErrorHandler("Note not found.", 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized access.", 401));
  }

  res.status(200).json({
    success: true,
    note,
  });
});

// ************************ updateNote ************************
export const updateNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(new ErrorHandler("Note not found.", 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized access.", 401));
  }

  note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    note,
  });
});

// ************************ deleteNote ************************
export const deleteNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(new ErrorHandler("Note not found.", 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized access.", 401));
  }

  await Note.findByIdAndDelete(note._id);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully.",
  });
});
