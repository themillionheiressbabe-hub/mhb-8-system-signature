import { Outfit } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const outfit = Outfit({ subsets: ["latin"] });

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
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center justify-center bg-bg text-gold px-6`}
    >
      <div className="w-full max-w-sm">
        <h1 className="text-magenta text-3xl font-semibold text-center mb-8">
          Create your account
        </h1>

        {error ? (
          <p className="text-magenta text-sm text-center mb-4">{error}</p>
        ) : null}

        <form action={signUp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Full name</span>
            <input
              type="text"
              name="full_name"
              required
              autoComplete="name"
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>
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
              autoComplete="new-password"
              minLength={6}
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>
          <button
            type="submit"
            className="bg-magenta text-bg rounded px-4 py-3 text-base font-semibold mt-2 cursor-pointer"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-magenta underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
