"use client"

import type React from "react"
import useSWR from "swr"
import { api, ApiError } from "@/lib/api"
import { useState } from "react"
import { Trash2, Edit2, Save, X } from "lucide-react"
import { toast } from "react-toastify"

type Note = {
  _id: string
  title: string
  content?: string
}

export default function NotesList() {
  const { data, error, isLoading, mutate } = useSWR("/api/v1/user/notes", () =>
    api.getNotes()
  )
  const notes: Note[] = data?.notes || []

  const [createState, setCreateState] = useState({ title: "", content: "" })
  const [saving, setSaving] = useState(false)

  // For editing
  const [editId, setEditId] = useState<string | null>(null)
  const [editState, setEditState] = useState({ title: "", content: "" })

  /** CREATE NOTE */
  async function createNote(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      await api.createNote({
        title: createState.title,
        content: createState.content,
      })
      toast.success(" Note created")
      setCreateState({ title: "", content: "" }) // reset form
      mutate()
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.payload?.message || e.message
          : "Failed to create note"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  /** UPDATE NOTE */
  async function updateNote(id: string) {
    try {
      await api.updateNote(id, {
        title: editState.title,
        content: editState.content,
      })
      toast.success("✅ Note updated")
      setEditId(null)
      mutate()
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.payload?.message || e.message
          : "Failed to update note"
      toast.error(message)
    }
  }

  /** DELETE NOTE */
  async function deleteNote(id: string) {
    try {
      await api.deleteNote(id)
      toast.success("🗑️ Note deleted")
      mutate()
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.payload?.message || e.message
          : "Failed to delete note"
      toast.error(message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Create Note Form */}
      <form
        onSubmit={createNote}
        className="space-y-3 bg-white p-4 rounded-lg shadow"
      >
        <input
          type="text"
          placeholder="Note title"
          value={createState.title}
          onChange={(e) =>
            setCreateState({ ...createState, title: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Note content (optional)"
          value={createState.content}
          onChange={(e) =>
            setCreateState({ ...createState, content: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 px-4 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-blue-300"
          disabled={saving}
        >
          {saving ? "Saving..." : "Create Note"}
        </button>
      </form>

      {/* Notes List */}
      <div>
        <h2 className="font-semibold mb-2">Notes</h2>
        <div className="space-y-3">
          {isLoading && <p className="text-sm text-gray-500">Loading notes...</p>}
          {error && <p className="text-sm text-red-600">Failed to load notes.</p>}
          {!isLoading && notes.length === 0 && (
            <p className="text-sm text-gray-500">No notes yet.</p>
          )}

          {notes.map((n) => (
            <div
              key={n._id}
              className="flex flex-col gap-2 rounded-lg border p-3 shadow-sm bg-white"
            >
              {editId === n._id ? (
                <>
                  {/* Edit Mode */}
                  <input
                    type="text"
                    value={editState.title}
                    onChange={(e) =>
                      setEditState({ ...editState, title: e.target.value })
                    }
                    className="w-full rounded border px-2 py-1"
                  />
                  <textarea
                    value={editState.content}
                    onChange={(e) =>
                      setEditState({ ...editState, content: e.target.value })
                    }
                    className="w-full rounded border px-2 py-1"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => updateNote(n._id)}
                      className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="flex items-center gap-1 rounded bg-gray-400 px-3 py-1 text-white hover:bg-gray-500"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{n.title}</p>
                      {n.content && (
                        <p className="text-sm text-gray-600">{n.content}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditId(n._id)
                          setEditState({
                            title: n.title,
                            content: n.content || "",
                          })
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteNote(n._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
