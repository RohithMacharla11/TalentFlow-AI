import { resources, projects, allocations } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Chatbot } from "@/components/chatbot";

export default function DashboardPage() {
  // In a real app, you'd fetch this data from a database.
  const data = {
    resources,
    projects,
    allocations,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardClient data={data} />
      <Chatbot />
    </div>
  );
}
