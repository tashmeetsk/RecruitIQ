import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const { user, isLoading: isSessionLoading } = useAuth();

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (!isSessionLoading && user) {
      setLocation("/");
    }
  }, [user, isSessionLoading, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    // Block submission until the initial session check has settled,
    // so we don't race against a pending /auth/me 401 that would boot
    // the user back to this page right after a successful login.
    if (isSessionLoading) return;

    loginMutation.mutate(
      { data: { email: values.email, password: values.password } },
      {
        onSuccess: (userData) => {
          // Cancel any in-flight /auth/me requests and seed the cache
          // immediately so the ProtectedRoute never sees user=null.
          queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
          queryClient.setQueryData(getGetMeQueryKey(), userData);
          setLocation("/");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? err?.message ?? "Login failed";
          form.setError("root", { message: msg });
        },
      },
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50">
      <Card className="w-full max-w-sm shadow-lg border-muted">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded bg-primary flex items-center justify-center font-bold text-white shadow-md text-xl">
            RQ
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">RecruitIQ</CardTitle>
            <CardDescription>Sign in to access the ops terminal.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            {form.formState.errors.root && (
              <p className="text-xs text-destructive text-center">{form.formState.errors.root.message}</p>
            )}
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loginMutation.isPending || isSessionLoading}
            >
              {loginMutation.isPending ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
