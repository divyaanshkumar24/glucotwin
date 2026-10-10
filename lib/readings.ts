import type { Reading } from "@/lib/engine";

export const MIN_READINGS = 3;
export const MAX_READINGS = 8;
const GLUCOSE_MIN = 40;
const GLUCOSE_MAX = 400;

/** One row of the readings table, as typed. */
export type ReadingDraft = { id: string; minute: number; glucose: string };

export type ReadingsCheck = {
  /** The readings, once every row is valid and there are 3 to 8 of them; otherwise null. */
  readings: Reading[] | null;
  /** Message per row id. */
  rowErrors: Record<string, string>;
  /** Message about the table as a whole, such as "Add at least 3 readings". */
  tableError?: string;
};

/** The rows that already hold a valid value, for drawing dots while the table is still being filled in. */
export function partialReadings(rows: ReadingDraft[]): Reading[] {
  return rows.flatMap((row) => {
    const text = row.glucose.trim();
    const value = Number(text);
    return text !== "" && Number.isFinite(value) && value >= GLUCOSE_MIN && value <= GLUCOSE_MAX
      ? [{ minute: row.minute, glucose: value }]
      : [];
  });
}

/** Check the table: 3-8 rows, each a plausible glucometer value in mg/dL. */
export function checkReadings(rows: ReadingDraft[]): ReadingsCheck {
  const rowErrors: Record<string, string> = {};
  const readings: Reading[] = [];

  for (const row of rows) {
    const text = row.glucose.trim();
    const value = Number(text);
    if (text === "" || !Number.isFinite(value)) {
      rowErrors[row.id] = "Enter a value in mg/dL.";
    } else if (value < GLUCOSE_MIN || value > GLUCOSE_MAX) {
      rowErrors[row.id] = `Enter a value between ${GLUCOSE_MIN} and ${GLUCOSE_MAX} mg/dL.`;
    } else {
      readings.push({ minute: row.minute, glucose: value });
    }
  }

  let tableError: string | undefined;
  if (rows.length < MIN_READINGS) tableError = `Add at least ${MIN_READINGS} readings.`;
  else if (rows.length > MAX_READINGS) tableError = `Use at most ${MAX_READINGS} readings.`;

  const valid = !tableError && Object.keys(rowErrors).length === 0;
  return { readings: valid ? readings : null, rowErrors, tableError };
}
