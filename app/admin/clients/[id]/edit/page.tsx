import { Outfit } from "next/font/google";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

const outfit = Outfit({ subsets: ["latin"] });

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
};

async function updateClient(id: string, formData: FormData) {
  "use server";

  const fullName = String(formData.get("full_name") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "");
  const timeOfBirth = String(formData.get("time_of_birth") ?? "");
  const placeOfBirth = String(formData.get("place_of_birth") ?? "").trim();

  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      full_name: fullName,
      date_of_birth: dateOfBirth,
      time_of_birth: timeOfBirth || null,
      place_of_birth: placeOfBirth || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/clients/${id}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditClientPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id, full_name, date_of_birth, time_of_birth, place_of_birth")
    .eq("id", id)
    .maybeSingle<ClientRow>();

  if (!client) {
    redirect("/admin/clients");
  }

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-bg text-gold px-6 py-16`}
    >
      <div className="w-full max-w-xl">
        <Link
          href="/admin/clients"
          className="text-gold text-sm underline mb-6 inline-block"
        >
          &larr; Back to clients
        </Link>

        <h1 className="text-magenta text-4xl font-semibold mb-8">
          Edit client
        </h1>

        {error ? (
          <p className="text-magenta text-sm mb-4">{error}</p>
        ) : null}

        <form
          action={updateClient.bind(null, client.id)}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Full name</span>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={client.full_name}
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Date of birth</span>
            <input
              type="date"
              name="date_of_birth"
              required
              defaultValue={client.date_of_birth}
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Time of birth</span>
            <input
              type="time"
              name="time_of_birth"
              defaultValue={client.time_of_birth?.slice(0, 5) ?? ""}
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Place of birth</span>
            <input
              type="text"
              name="place_of_birth"
              defaultValue={client.place_of_birth ?? ""}
              className="bg-transparent border border-gold text-gold rounded px-3 py-2.5 text-base font-[inherit]"
            />
          </label>

          <p className="text-gold text-xs">
            Time of birth is required for full chart calculation. If unknown,
            leave blank and note this in the report.
          </p>

          <button
            type="submit"
            className="bg-magenta text-bg rounded-full px-6 py-2 text-sm font-semibold mt-2 cursor-pointer self-start"
          >
            Save client
          </button>
        </form>
      </div>
    </div>
  );
}
