"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signup, login } from "../../lib/api";

type Mode = "signup" | "login";

interface AuthModalProps {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSwitch: (mode: Mode) => void;
}

export default function AuthModal({
  open,
  mode,
  onClose,
  onSwitch,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const data = await signup(email, password);
        localStorage.setItem("token", data.token);
        toast.success("Account created!", {
          description: "Welcome to Orbit.",
        });
      } else {
        const data = await login(email, password);
        localStorage.setItem("token", data.token);
        toast.success("Welcome back!", {
          description: "You're logged in.",
        });
      }
      onClose();
      setEmail("");
      setPassword("");
    } catch (err: any) {
      toast.error(mode === "signup" ? "Signup failed" : "Login failed", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-1 text-xl font-semibold">
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Enter your email and password to get started."
            : "Enter your credentials to continue."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 rounded-lg border border-border bg-muted/50 px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-lg border border-border bg-muted/50 px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => onSwitch("login")}
                className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => onSwitch("signup")}
                className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
