"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../../../../public/logo.svg";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response?.status === 200) {
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        showError("Invalid email or password. Please try again.");
      }
    } catch {
      showError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg: string) => {
    setError(msg);
    toast.error(msg);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden !p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="mb-3 max-w-[100px]">
              <LanguageSwitcher />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <Image
                  src={logo}
                  alt="Logo"
                  className="mb-2 h-24 w-24 rounded-full"
                />
                <h1 className="text-2xl font-bold">Welcome back</h1>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                />
              </div>

              {error && (
                <p className="text-sm text-center text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <Spinner size="sm" className="dark:bg-black light:bg-white" />
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div className="text-center text-sm">
                Need an account?{" "}
                <Link href="#" className="underline underline-offset-4">
                  Contact your administrator
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden md:block w-full h-full overflow-hidden pl-10">
            <Image
              src="/time.png"
              alt="Background professors"
              fill
              priority
              className="object-contain min-w-[580px] absolute -translate-x-14"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
