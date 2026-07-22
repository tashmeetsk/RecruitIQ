import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: { email: values.email } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: (err: any) => {
        form.setError("email", { message: err?.error || "Login failed" });
      }
    });
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
            <CardDescription>Enter your email to access the ops terminal.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="tashmeet@company.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Authenticating..." : "Login"}
            </Button>
            <div className="text-center text-xs text-muted-foreground pt-4">
              Authorized users only. Valid demo accounts:<br/>
              tashmeet@company.com, alex@company.com, jordan@company.com
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
