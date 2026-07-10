// ics.ts — .ics calendar export utility for Pawgress
// Generates .ics files for vet appointments and reminders

interface IcsEvent {
  title: string;
  date: string;       // ISO date (YYYY-MM-DD)
  description?: string;
  durationMinutes?: number;
}

function formatDate(date: string): string {
  // Convert to YYYYMMDDTHHMMSSZ format (UTC)
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatDateDay(date: string): string {
  // All-day event: just YYYYMMDD
  return date.split("T")[0].replace(/-/g, "");
}

export function generateIcs(events: IcsEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pawgress//Dog Training App//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${Date.now()}-${Math.random().toString(36).slice(2)}@pawgress`);
    lines.push(`DTSTAMP:${formatDate(new Date().toISOString())}`);

    if (event.durationMinutes) {
      // Timed event
      lines.push(`DTSTART:${formatDate(event.date)}`);
      const end = new Date(event.date);
      end.setMinutes(end.getMinutes() + event.durationMinutes);
      lines.push(`DTEND:${formatDate(end.toISOString())}`);
    } else {
      // All-day event
      lines.push(`DTSTART;VALUE=DATE:${formatDateDay(event.date)}`);
      lines.push(`DTEND;VALUE=DATE:${formatDateDay(event.date)}`);
    }

    lines.push(`SUMMARY:${escapeIcs(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    }
    lines.push("BEGIN:VALARM");
    lines.push("TRIGGER:-PT1D");  // 1 day before
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${escapeIcs(event.title)}`);
    lines.push("END:VALARM");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function downloadIcs(events: IcsEvent[], filename: string = "pawgress-reminders.ics") {
  const icsContent = generateIcs(events);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
