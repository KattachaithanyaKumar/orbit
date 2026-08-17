"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signup, login } from "../../lib/api";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/auth-slice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
      router.push("/");
    } catch (err: any) {
      toast.error(mode === "signup" ? "Signup failed" : "Login failed", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg">
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Enter your email and password to get started."
              : "Enter your credentials to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 py-4">
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Sign up" : "Log in"}
          </Button>
        </form>

        <div className="border-t px-6 py-3 text-center text-sm text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
