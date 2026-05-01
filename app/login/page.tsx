import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function signIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(redirectTo || "/dashboard");
}

type Props = {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, redirectTo } = await searchParams;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 pb-14 px-6">
        <div className="w-full max-w-[440px]">
          <div className="card p-11 sm:px-9 sm:py-11 border-[rgba(201,169,110,0.30)]">
            <p className="eyebrow text-center mb-3">Welcome Back</p>
            <h1 className="serif text-magenta text-[2rem] text-center leading-tight mb-8">
              Sign in.
            </h1>

            {error ? (
              <p className="text-magenta text-sm text-center mb-4">{error}</p>
            ) : null}

            <form action={signIn} className="flex flex-col gap-[18px]">
              <input
                type="hidden"
                name="redirectTo"
                value={redirectTo ?? ""}
              />

              <div className="field">
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@somewhere.com"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="field-input"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-2 text-cream/70 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    className="accent-magenta"
                  />{" "}
                  Remember me
                </label>
                <Link
                  href="/login"
                  className="text-gold no-underline hover:text-gold-bright transition-colors"
                >
                  Forgot?
                </Link>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Sign In
              </button>
            </form>

            <p className="muted text-xs text-center mt-6">
              New here?{" "}
              <Link
                href="/signup"
                className="text-gold no-underline hover:text-gold-bright transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
