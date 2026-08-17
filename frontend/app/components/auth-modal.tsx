"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signup, login } from "../../lib/api";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/auth-slice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const data = await signup(email, password);
        dispatch(setCredentials({ token: data.token, user: data.user }));
        toast.success("Account created!", {
          description: "Welcome to Orbit.",
        });
      } else {
        const data = await login(email, password);
        dispatch(setCredentials({ token: data.token, user: data.user }));
        toast.success("Welcome back!", {
          description: "You're logged in.",
        });
      }
      setEmail("");
      setPassword("");
      onClose();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(mode === "signup" ? "Signup failed" : "Login failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setEmail("");
    setPassword("");
    onSwitch(newMode);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-md">
        <div className="flex flex-col items-center px-8 pt-10 pb-8">
          <div className="mb-5">
            <img
              src="/orbit-logo-dark.svg"
              alt="Orbit"
              className="h-12 w-12 block dark:hidden rounded-lg"
            />
            <img
              src="/orbit-logo-light.svg"
              alt="Orbit"
              className="h-12 w-12 hidden dark:block rounded-lg"
            />
          </div>

          <h1 className="mb-1 text-xl font-bold tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Get started with Orbit. It's free."
              : "Sign in to continue to Orbit."}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup"
                      ? "Create a password"
                      : "Enter your password"
                  }
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
        </div>

        <div className="border-t border-border px-8 py-4 text-center text-sm">
          {mode === "signup" ? (
            <span className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                className="font-medium text-foreground hover:underline"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-medium text-foreground hover:underline"
              >
                Create one
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
