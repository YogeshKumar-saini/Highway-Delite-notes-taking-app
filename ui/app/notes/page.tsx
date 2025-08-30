"use client";

import { useSession } from "@/app/hooks/use-session";
import NotesList from "@/components/notes/notes-list";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/top.png";

export default function NotesPage() {
  const { isAuthenticated, isLoading, user } = useSession();

  return (
    <main className="min-h-dvh bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span>
              <Image
                src={logo}
                width={32}
                height={32}
                alt="Logo"
                className="object-contain"
              />
            </span>
            <span className="font-semibold text-gray-700">HD</span>
          </div>
          {isAuthenticated && (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
            >
              Sign Out
            </Link>
          )}
        </header>

        {/* Loading / Auth States */}
        {isLoading && (
          <p className="text-gray-500 text-center">Loading session...</p>
        )}

        {!isLoading && !isAuthenticated && (
          <p className="text-gray-800 text-center">
            You must be signed in to view notes.{" "}
            <Link
              className="text-sky-600 hover:underline font-medium"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        )}

        {!isLoading && isAuthenticated && (
          <>
            {/* Welcome Card */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-md">
              <p className="font-semibold text-gray-900 text-lg">
                Welcome, {user?.name || "User"}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Email: {user?.email || "xxxxxx@xxxx.com"}
              </p>
            </div>

            {/* Notes Section */}
            <NotesList />
          </>
        )}
      </div>
    </main>
  );
}
