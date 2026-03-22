"use client";

import dynamic from "next/dynamic";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const AppointmentsView = dynamic(
  () => import("@/components/app/CrmCalendar"),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-text-secondary">Loading appointments…</p>
    ),
  }
);

export default function CalendarPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="p-8">
      <AppointmentsView configured={configured} />
    </div>
  );
}
