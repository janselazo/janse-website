const STORAGE_KEY = "playbook-completions";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getCompletions(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed._date !== todayKey()) return {};
    const { _date, ...rest } = parsed;
    return rest as Record<string, number>;
  } catch {
    return {};
  }
}

export function saveCompletions(completions: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ _date: todayKey(), ...completions })
    );
  } catch {
    // storage full or unavailable
  }
}
