// controllers/noteController.ts

import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { errorMiddleware } from "../middleware/error";
import { Note } from "../models/noteModel";
import type { INote } from "../models/noteModel";

export const createNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title) {
    return next(errorMiddleware("Title is required.", req, res, next, 400));
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

export const getNotes = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const notes = await Note.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    notes,
  });
});

export const getNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(errorMiddleware("Note not found.", req, res, next, 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(errorMiddleware("Unauthorized access.", req, res, next, 401));
  }

  res.status(200).json({
    success: true,
    note,
  });
});

export const updateNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(errorMiddleware("Note not found.", req, res, next, 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(errorMiddleware("Unauthorized access.", req, res, next, 401));
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

export const deleteNote = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(errorMiddleware("Note not found.", req, res, next, 404));
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return next(errorMiddleware("Unauthorized access.", req, res, next, 401));
  }

  await Note.findByIdAndDelete(note._id);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully.",
  });
});
