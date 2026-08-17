"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Terminal,
  Users,
  WifiOff,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "./components/theme-toggle";
import AuthModal from "./components/auth-modal";

const features = [
  { label: "Multi-Folder Directories", icon: FolderTree },
  { label: "Slash Command Markdown", icon: Terminal },
  { label: "Live Collaboration", icon: Users },
  { label: "Offline-First Sync", icon: WifiOff },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signup" | "login">("signup");

  const openModal = (mode: "signup" | "login") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center px-6 py-12">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold tracking-tight">orbit</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => openModal("login")}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Login
          </button>
        </div>
      </nav>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 text-center mt-40">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-glow blur-[120px]" />

        <div className="relative flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>Next-Gen Workspace</span>
          <span className="text-border">•</span>
          <span>Nested Files &amp; Folders</span>
        </div>

        <h1 className="relative max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          One workspace. Every file, folder, and idea in sync.
        </h1>
        <p className="relative max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Organize projects with deep folder hierarchies, draft specs with
          markdown slash commands, collaborate with live peer presence, and work
          seamlessly online or offline.
        </p>
        <div className="relative flex gap-4">
          <button
            onClick={() => openModal("signup")}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get started
          </button>
          <button
            onClick={() => openModal("login")}
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Login
          </button>
        </div>
      </main>

      <footer className="w-full max-w-5xl pb-12 pt-16">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground"
            >
              <f.icon className="h-4 w-4" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        <Image
          src="/landing-page-demo.png"
          alt="Orbit demo"
          width={1200}
          height={675}
          className="w-full rounded-xl border border-border"
          priority
        />
      </footer>

      <AuthModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSwitch={(m) => setModalMode(m)}
      />
    </div>
  );
}
