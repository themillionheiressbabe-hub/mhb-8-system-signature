import { Outfit } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const outfit = Outfit({ subsets: ["latin"] });

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
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center justify-center bg-bg text-gold px-6`}
    >
      <div className="w-full max-w-sm">
        <h1 className="text-magenta text-3xl font-semibold text-center mb-8">
          Sign in
        </h1>

        {error ? (
          <p className="text-magenta text-sm text-center mb-4">{error}</p>
        ) : null}

        <form action={signIn} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>
          <button
            type="submit"
            className="bg-magenta text-bg rounded px-4 py-3 text-base font-semibold mt-2 cursor-pointer"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          New here?{" "}
          <Link href="/signup" className="text-magenta underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
