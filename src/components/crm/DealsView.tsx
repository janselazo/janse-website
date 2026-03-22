"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import KanbanBoard, { type KanbanColumn } from "@/components/crm/KanbanBoard";
import {
  type MockDeal,
  type DealStage,
  DEAL_STAGE_LABELS,
  DEAL_STAGE_COLORS,
} from "@/lib/crm/mock-data";

type ViewMode = "table" | "pipeline";

const stageOrder: DealStage[] = [
  "prospect",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

const stageBgClasses: Record<DealStage, string> = {
  prospect: "bg-gray-100 text-gray-800",
  proposal: "bg-blue-100 text-blue-800",
  negotiation: "bg-amber-100 text-amber-800",
  closed_won: "bg-emerald-100 text-emerald-800",
  closed_lost: "bg-red-100 text-red-800",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DealsView({ deals }: { deals: MockDeal[] }) {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [localDeals, setLocalDeals] = useState<MockDeal[]>(deals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MockDeal | null>(null);

  const filtered = localDeals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.company.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q)
    );
  });

  const kanbanColumns: KanbanColumn<MockDeal>[] = stageOrder.map((stage) => ({
    id: stage,
    label: DEAL_STAGE_LABELS[stage],
    color: DEAL_STAGE_COLORS[stage],
    items: filtered.filter((d) => d.stage === stage),
  }));

  const totalValue = filtered.reduce((sum, d) => sum + d.value, 0);

  function handleMove(itemId: string, _from: string, to: string) {
    setLocalDeals((prev) =>
      prev.map((d) =>
        d.id === itemId ? { ...d, stage: to as DealStage } : d
      )
    );
  }

  function handleSave(updated: MockDeal) {
    setLocalDeals((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setEditing(null);
  }

  function handleDelete(id: string) {
    setLocalDeals((prev) => prev.filter((d) => d.id !== id));
    setEditing(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-display text-2xl font-bold text-text-primary">
            Deals
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track opportunities from prospect to close
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-border bg-white py-1.5 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            + Add Deal
          </button>
        </div>
      </div>

      {/* View toggles + stats */}
      <div className="mt-4 flex items-center gap-4">
        <div className="inline-flex rounded-lg border border-border bg-surface/50 p-0.5">
          {(["table", "pipeline"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                view === v
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {v === "pipeline" ? "Pipeline" : "Table"}
            </button>
          ))}
        </div>
        <span className="text-sm text-text-secondary">
          {filtered.length} deals · {formatCurrency(totalValue)} total
        </span>
      </div>

      {/* Content */}
      <div className="mt-6">
        {view === "table" && (
          <DealsTable deals={filtered} onEdit={setEditing} />
        )}
        {view === "pipeline" && (
          <KanbanBoard
            columns={kanbanColumns}
            onMove={handleMove}
            renderCard={(deal) => (
              <button
                type="button"
                onClick={() => setEditing(deal)}
                className="w-full rounded-xl border border-border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium text-text-primary">
                  {deal.title}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {deal.company}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {formatCurrency(deal.value)}
                </p>
              </button>
            )}
          />
        )}
      </div>

      {modalOpen && (
        <NewDealModal
          onClose={() => setModalOpen(false)}
          onAdd={(deal) => {
            setLocalDeals((prev) => [deal, ...prev]);
            setModalOpen(false);
          }}
        />
      )}

      {editing && (
        <EditDealModal
          deal={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function DealsTable({
  deals,
  onEdit,
}: {
  deals: MockDeal[];
  onEdit: (deal: MockDeal) => void;
}) {
  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-text-secondary">
        No deals found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-semibold text-text-secondary">Deal</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Company</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Value</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Stage</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Contact</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Expected Close</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {deals.map((deal) => {
            const initials = deal.company
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <tr key={deal.id} className="transition-colors hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: DEAL_STAGE_COLORS[deal.stage] }}
                    >
                      {initials}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEdit(deal)}
                      className="font-medium text-text-primary hover:text-accent"
                    >
                      {deal.title}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{deal.company}</td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {formatCurrency(deal.value)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${stageBgClasses[deal.stage]}`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: DEAL_STAGE_COLORS[deal.stage] }}
                    />
                    {DEAL_STAGE_LABELS[deal.stage]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-text-primary">{deal.contactName}</p>
                    <p className="text-xs text-text-secondary">{deal.contactEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {formatDate(deal.expectedClose)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onEdit(deal)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

function DealFormFields({ deal }: { deal?: MockDeal }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Deal Title
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={deal?.title}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Company
        </label>
        <input
          name="company"
          type="text"
          defaultValue={deal?.company}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Value ($)
        </label>
        <input
          name="value"
          type="number"
          min="0"
          defaultValue={deal?.value}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Stage
        </label>
        <select
          name="stage"
          defaultValue={deal?.stage ?? "prospect"}
          className={INPUT_CLASS}
        >
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {DEAL_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Expected Close
        </label>
        <input
          name="expectedClose"
          type="date"
          defaultValue={deal?.expectedClose}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Contact Name
        </label>
        <input
          name="contactName"
          type="text"
          defaultValue={deal?.contactName}
          className={INPUT_CLASS}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Contact Email
        </label>
        <input
          name="contactEmail"
          type="email"
          defaultValue={deal?.contactEmail}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}

function ModalShell({
  id,
  title,
  onClose,
  children,
}: {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        aria-labelledby={id}
      >
        <h2
          id={id}
          className="text-sm font-bold uppercase tracking-wider text-text-secondary"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function NewDealModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (deal: MockDeal) => void;
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const deal: MockDeal = {
      id: `d-${Date.now()}`,
      title: (fd.get("title") as string) || "Untitled Deal",
      company: (fd.get("company") as string) || "",
      value: Number(fd.get("value")) || 0,
      stage: (fd.get("stage") as DealStage) || "prospect",
      contactName: (fd.get("contactName") as string) || "",
      contactEmail: (fd.get("contactEmail") as string) || "",
      createdAt: new Date().toISOString().slice(0, 10),
      expectedClose: (fd.get("expectedClose") as string) || "",
    };
    onAdd(deal);
  }

  return (
    <ModalShell id="new-deal-title" title="New Deal" onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <DealFormFields />
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Add deal
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditDealModal({
  deal,
  onClose,
  onSave,
  onDelete,
}: {
  deal: MockDeal;
  onClose: () => void;
  onSave: (updated: MockDeal) => void;
  onDelete: (id: string) => void;
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      ...deal,
      title: (fd.get("title") as string) || deal.title,
      company: (fd.get("company") as string) || deal.company,
      value: Number(fd.get("value")) || deal.value,
      stage: (fd.get("stage") as DealStage) || deal.stage,
      contactName: (fd.get("contactName") as string) || deal.contactName,
      contactEmail: (fd.get("contactEmail") as string) || deal.contactEmail,
      expectedClose: (fd.get("expectedClose") as string) || deal.expectedClose,
    });
  }

  return (
    <ModalShell id="edit-deal-title" title="Edit Deal" onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <DealFormFields deal={deal} />
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDelete(deal.id)}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
