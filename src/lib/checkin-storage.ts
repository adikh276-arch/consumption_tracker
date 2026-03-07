export interface CheckInEntry {
  date: string; // YYYY-MM-DD
  smoked: boolean;
  count?: string;
  urgeTime?: string;
  feeling?: string;
  reflection?: string;
}

const API_BASE = "/consumption_tracker/api";

export async function getHistory(): Promise<CheckInEntry[]> {
  const userId = sessionStorage.getItem("user_id");
  if (!userId) return [];

  try {
    const res = await fetch(`${API_BASE}/history?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return await res.json();
  } catch (err) {
    console.error("Error getting history:", err);
    return [];
  }
}

export async function saveCheckIn(entry: CheckInEntry): Promise<void> {
  const userId = sessionStorage.getItem("user_id");
  if (!userId) return;

  try {
    const res = await fetch(`${API_BASE}/save-checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, entry }),
    });
    if (!res.ok) throw new Error("Failed to save check-in");
  } catch (err) {
    console.error("Error saving check-in:", err);
  }
}

export async function getWeekHistory(): Promise<(CheckInEntry | null)[]> {
  const history = await getHistory();
  const result: (CheckInEntry | null)[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push(history.find((e) => e.date === key) ?? null);
  }

  return result;
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekDates(): { key: string; label: string; dayName: string }[] {
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      key: d.toISOString().split("T")[0],
      label: d.getDate().toString(),
      dayName: days[d.getDay()],
    });
  }

  return result;
}

export async function initUser(userId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/init-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
  } catch (err) {
    console.error("Error initializing user:", err);
  }
}
