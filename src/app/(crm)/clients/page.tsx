import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8">
        <h1 className="heading-display text-2xl font-bold">Clients</h1>
        <p className="mt-2 text-text-secondary">Configure Supabase to load CRM.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("client")
    .select("id, name, email, phone, company, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="p-8">
      <div>
        <h1 className="heading-display text-2xl font-bold text-text-primary">
          Clients
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Companies and contacts you work with
        </p>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          {error.message}. Apply{" "}
          <code className="font-mono text-xs">supabase/migrations</code>.
        </p>
      ) : !clients || clients.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-text-secondary">
          No clients yet. A client record is created when a deal for a lead reaches
          Closed Won or Closed Lost (once per lead).
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-semibold text-text-secondary">Name</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Email</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Phone</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Company</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {c.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.company ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
