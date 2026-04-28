import { Outfit } from "next/font/google";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const outfit = Outfit({ subsets: ["latin"] });

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center justify-center bg-bg text-gold px-6 text-center`}
    >
      <h1 className="text-magenta text-4xl font-semibold mb-4">
        Welcome to your dashboard
      </h1>
      <p className="text-lg">{user.email}</p>
    </div>
  );
}
