"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { FlaskConical } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const IS_DEV = process.env.NODE_ENV !== "production";

const TEST_ACCOUNTS = [
  {
    label: "Ravi Kumar",
    email: "ravi.kumar@seed.local",
    password: "123456",
  },
  {
    label: "Sneha Rao",
    email: "sneha.rao@seed.local",
    password: "123456",
  },
  {
    label: "Divya Iyer",
    email: "divya.iyer@seed.local",
    password: "123456",
  },
  { label: "Admin", email: "admin@example.com", password: "password123" },
];

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testingMode, setTestingMode] = useState(false);

  useEffect(() => {
    if (IS_DEV) {
      setTestingMode(localStorage.getItem("testingMode") === "true");
    }
  }, []);

  function toggleTestingMode() {
    const next = !testingMode;
    setTestingMode(next);
    localStorage.setItem("testingMode", String(next));
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", values);
      const { token, user } = res.data;
      setSession(token, user);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else {
        setServerError(
          "Could not reach the API. Is the Go server running on :8080?",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  function handleQuickLogin(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
    handleSubmit(onSubmit)();
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {IS_DEV && testingMode && (
        <div className="absolute inset-x-0 top-0 bg-amber-500/15 py-1.5 text-center text-xs font-medium text-amber-600">
          Testing mode — payments, emails, and notifications are not real
        </div>
      )}

      {IS_DEV && (
        <button
          type="button"
          onClick={toggleTestingMode}
          title="Toggle testing mode"
          className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            testingMode
              ? "border-amber-500/50 bg-amber-500/10 text-amber-600 mt-7"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <FlaskConical className="size-3.5" />
          {testingMode ? "Testing mode on" : "Testing mode off"}
        </button>
      )}

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Railway Maintenance Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@railway.local"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {IS_DEV && testingMode && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Quick login (dev only)
              </p>
              <div className="flex flex-wrap gap-2">
                {TEST_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    onClick={() => handleQuickLogin(acct.email, acct.password)}
                    disabled={submitting}
                    className="rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {acct.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
