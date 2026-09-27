import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { getFieldErrors, isApiError, isUnauthorized } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/loginSchema";

export default function LoginPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  useEffect(() => {
    if (token) navigate("/boards", { replace: true });
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values);
      navigate("/boards", { replace: true });
    } catch (err) {
      if (isUnauthorized(err)) {
        setError("password", { message: "Incorrect email or password." });
        return;
      }

      const fields = getFieldErrors(err);
      if (Object.keys(fields).length > 0) {
        for (const [field, message] of Object.entries(fields)) {
          setError(field as keyof LoginFormValues, { message });
        }
        return;
      }

      const message = isApiError(err)
        ? err.error.message
        : "Something went wrong. Please try again.";
      setError("password", { message });
    }
  }

  const busy = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[380px] mb-3 flex items-center gap-2 mb-6">
        <div className="w-5.5 h-5.5 rounded-sm bg-primary flex items-center justify-center gap-0.5 shrink-0">
          <div className="w-1.5 h-3.5 bg-white"></div>
          <div className="w-1.5 h-3.5 bg-white/50 "></div>
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Kanban
        </span>
      </div>

      <Card className="w-full max-w-[380px] shadow-sm border-border rounded-xl">
        <CardContent className="pt-7 pb-7 px-7">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-1.5">
              Sign in
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Applications, interviews and offers in one place.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive/40"
                    : ""
                }
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive/40"
                    : ""
                }
                {...register("password")}
              />
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={busy} className="w-full mt-2">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className=" w-90 mt-5 text-[11px] font-mono text-muted-foreground/60 tracking-tight">
        single-user build · v0.4
      </p>
    </div>
  );
}
