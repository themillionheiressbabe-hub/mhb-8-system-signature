import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export default function AdminReportsPage() {
  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-bg text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <h1 className="text-magenta text-4xl font-semibold mb-4">Reports</h1>
        <p className="text-gold text-lg">No reports yet</p>
      </div>
    </div>
  );
}
