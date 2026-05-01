import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function signUp(formData: FormData) {
  "use server";

  const fullName = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 pb-14 px-6">
        <div className="w-full max-w-[460px]">
          <div className="card p-10 sm:px-9 sm:py-10 border-[rgba(201,169,110,0.30)]">
            <p className="eyebrow text-center mb-3">Begin</p>
            <h1 className="serif text-magenta text-[2rem] text-center leading-tight mb-2.5">
              Create your account.
            </h1>
            <p className="muted text-sm text-center mb-8">
              Save your reads. Track your patterns. No newsletter spam.
            </p>

            {error ? (
              <p className="text-magenta text-sm text-center mb-4">{error}</p>
            ) : null}

            <form action={signUp} className="flex flex-col gap-[18px]">
              <div className="field">
                <label className="field-label" htmlFor="full_name">
                  Name
                </label>
                <input
                  id="full_name"
                  className="field-input"
                  type="text"
                  name="full_name"
                  required
                  autoComplete="name"
                  placeholder="What you go by"
                />
              </div>

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
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Create Account
              </button>
            </form>

            <p className="muted text-xs text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-gold no-underline hover:text-gold-bright transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-[11px] text-text-faint text-center mt-6 leading-[1.6]">
            Pattern recognition for personal development. Non-predictive.
            Non-diagnostic.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
