import { CalendarView } from "@/components/calendar-view";
import { projects, resources, allocations } from "@/lib/data";

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Calendar View</h1>
      </div>
      <CalendarView projects={projects} resources={resources} allocations={allocations} />
    </div>
  );
}
