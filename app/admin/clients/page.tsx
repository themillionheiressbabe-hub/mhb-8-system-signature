import { Outfit } from "next/font/google";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

const outfit = Outfit({ subsets: ["latin"] });

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateOfBirth(value: string) {
  const [year, month, day] = value.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

function formatTimeOfBirth(value: string) {
  return value.slice(0, 5);
}

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
};

async function deleteClient(id: string) {
  "use server";

  await supabaseAdmin.from("clients").delete().eq("id", id);
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export default async function AdminClientsPage() {
  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("id, full_name, date_of_birth, time_of_birth, place_of_birth")
    .order("created_at", { ascending: false })
    .returns<ClientRow[]>();

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-bg text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-magenta text-4xl font-semibold">Clients</h1>
          <Link
            href="/admin/clients/new"
            className="bg-magenta text-bg rounded-full px-6 py-3 inline-block"
          >
            Add Client
          </Link>
        </div>

        {!clients || clients.length === 0 ? (
          <p className="text-gold text-lg">No clients yet</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {clients.map((client) => (
              <li
                key={client.id}
                className="bg-navy border border-gold rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 flex-1">
                  <span className="text-white font-semibold">
                    {client.full_name}
                  </span>
                  <span className="text-gold text-sm">
                    {formatDateOfBirth(client.date_of_birth)}
                  </span>
                  <span className="text-gold text-sm">
                    {client.place_of_birth ?? "Not provided"}
                  </span>
                  <span className="text-gold text-sm">
                    {client.time_of_birth
                      ? formatTimeOfBirth(client.time_of_birth)
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <Link
                    href={`/admin/clients/${client.id}/edit`}
                    className="border border-gold text-gold rounded-full px-3 py-1 text-xs inline-block"
                  >
                    Edit
                  </Link>
                  <form action={deleteClient.bind(null, client.id)}>
                    <button
                      type="submit"
                      className="border border-red-500 text-red-500 rounded-full px-3 py-1 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
