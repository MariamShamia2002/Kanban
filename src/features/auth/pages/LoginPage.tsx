import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { login } from "@/features/auth/api/authApi";
import { getFieldErrors, isApiError, isUnauthorized } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/loginSchema";

export default function LoginPage() {
  const { setAuth, token } = useAuth();
  const navigate = useNavigate();

  // Already authenticated → skip to app
  useEffect(() => {
    if (token) navigate("/boards", { replace: true });
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const { token: newToken, user } = await login(values);
      setAuth(newToken, user);
      navigate("/boards", { replace: true });
    } catch (err) {
      // 401 — bad credentials
      if (isUnauthorized(err)) {
        setError("password", { message: "Incorrect email or password." });
        return;
      }

      // VALIDATION_ERROR — bind server field errors straight into the form
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length > 0) {
        for (const [field, message] of Object.entries(fields)) {
          setError(field as keyof LoginFormValues, { message });
        }
        return;
      }

      // 5xx / unexpected
      const message = isApiError(err)
        ? err.error.message
        : "Something went wrong. Please try again.";
      setError("password", { message });
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-4">
      {/* Brand — sits above the card, left-aligned with the card */}
      <div className="w-full max-w-[380px] mb-3 flex items-center gap-2 mb-6">
        {/* Rounded square icon */}
        <div className="w-5.5 h-5.5 rounded-sm bg-primary flex items-center justify-center gap-0.5 shrink-0">
         <div className="w-1.5 h-3.5 bg-white"></div>
         <div className="w-1.5 h-3.5 bg-white/50 "></div>
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Kanban
        </span>
      </div>

      {/* Card */}
      <Card className="w-full max-w-[380px] shadow-sm border-border rounded-xl">
        <CardContent className="pt-7 pb-7 px-7">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-1.5">Sign in</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Applications, interviews and offers in one place.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={errors.email ? "border-destructive focus-visible:ring-destructive/40" : ""}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={errors.password ? "border-destructive focus-visible:ring-destructive/40" : ""}
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? (
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

      {/* Footer */}
      <p className=" w-90 mt-5 text-[11px] font-mono text-muted-foreground/60 tracking-tight">
        single-user build · v0.4
      </p>
    </div>
  );
}