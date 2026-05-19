export function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLabel(ts: string) {
  const d = new Date(ts);

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatLastSeen(ts: string | null | undefined) {
  if (!ts) return "";
 
  // ensure the timestamp is parsed as UTC by appending Z if missing
  const normalized = ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
 
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
 
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
 
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
 
  return new Date(normalized).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
