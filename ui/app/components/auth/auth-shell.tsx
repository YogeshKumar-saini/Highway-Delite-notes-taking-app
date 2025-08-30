"use client"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import background from "@/public/bacground.jpg"
import logo from "@/public/top.png"

type AuthShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}


export function AuthShell({ title, subtitle, children, className }: AuthShellProps) {
  return (
    <main role="main" className={cn("min-h-screen  bg-white", className)}>
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12 ">
        <div className="rounded-2xl  overflow-hidden p-1">
          <div className="grid grid-cols-1  md:grid-cols-2">
            {/* Left: header + copy + form */}
            <div className="p-6 sm:p-8 md:p-10">
              <header className="mb-8 flex items-center gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-900 font-semibold"
                  aria-label="Home"
                >
                  <div className="inline-flex items-center justify-center  gap-[12px] rounded-full">
                    <span>
                      <Image
                        src={logo}
                        width={32}
                        height={32}
                        alt="Logo"
                        className="object-contain"
                      />
                    </span>
                  <span>HD</span>
                  </div>
                </Link>
              </header>
              <div className="max-w-md ">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p id="auth-subtitle" className="mt-2 text-gray-600">
                    {subtitle}
                  </p>
                )}

                <div className="mt-6" aria-describedby={subtitle ? "auth-subtitle" : undefined}>
                  {children}
                </div>
              </div>
            </div>

            {/* Right: hero image */}
            <div className="relative hidden md:block rounded-2xl md:rounded-none md:rounded-tr-2xl md:rounded-br-2xl overflow-hidden">
              <Image
                src={background}
                alt="Abstract blue hero"
                fill
                className="object-cover rounded-2xl "
                priority
                sizes="(min-width: 768px)  50vw, 100vw"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
