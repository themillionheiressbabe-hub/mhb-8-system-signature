import { AdminSidebar } from "@/components/AdminSidebar";
import { CosmicWeather } from "@/components/CosmicWeather";

export default async function AdminCosmicWeatherPage() {
  return (
    <div className="min-h-screen bg-[#111827] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/cosmic-weather" />

      <main className="p-6 sm:p-9">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2.5">Cosmic Weather</p>
            <h1 className="serif text-magenta text-[2.25rem] leading-[1.1]">
              Today&rsquo;s Read
            </h1>
          </div>
        </div>

        <div className="card-admin">
          <CosmicWeather context="admin" />
        </div>
      </main>
    </div>
  );
}
