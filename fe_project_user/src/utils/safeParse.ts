export const safeJSON = <T,>(s?: string | null): T | null => {
  if (!s || typeof s !== 'string') return null;
  try { return JSON.parse(s) as T } catch { return null }
};

export const splitLines = (s?: string | null) =>
  (s ?? '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);

export type AgendaItem = { start: string; end: string; title: string; desc?: string };

const parseAgendaLines = (raw: string): AgendaItem[] =>
  splitLines(raw).map(line => {
    const m = line.match(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d\s*\|\s*([^|]+?)(?:\s*\|\s*(.*))?$/);
    return m ? { start: m[1], end: m[2], title: m[3].trim(), desc: m[4]?.trim() } : null;
  }).filter(Boolean) as AgendaItem[];

export const parseNotes = (notes?: string | null): string[] => {
  const parsed = safeJSON<string[]>(notes);
  if (parsed) return parsed;
  return splitLines(notes);
};

export const parseAgenda = (agenda?: string | null): AgendaItem[] => {
  const parsed = safeJSON<AgendaItem[]>(agenda);
  if (parsed) return parsed;
  return parseAgendaLines(agenda || '');
};

export const parseInstructor = (instructorName?: string | null): { name: string; experience?: string } => {
  const parsed = safeJSON<{ name: string; experience?: string }>(instructorName);
  if (parsed) return parsed;
  return { name: (instructorName ?? '').trim() };
};
